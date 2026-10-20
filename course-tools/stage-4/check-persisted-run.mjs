// Course-owned assertions: keep this file unchanged when implementing the product.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadCourseEnv, agentDatabase, projectRequire, project, fail, safeFailure, sessionCookie } from './course-env.mjs'

const args = process.argv.slice(2)
const worker = args[0] === '--worker'
const options = worker ? args.slice(1) : args
const prepare = options.length === 1 && options[0] === '--prepare'
const part = options.length === 2 && options[0] === '--part' ? options[1] : options.length === 0 ? 'all' : null
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let db, app, productDb
let checks = 0
async function stop() {
  if (!app) return
  const child = app
  app = undefined
  if (child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit')
    child.kill()
    await Promise.race([exited, delay(5000)])
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL')
      await Promise.race([exited, delay(3000)])
      if (child.exitCode === null && child.signalCode === null) fail('CHECK_SERVER_STOP_FAILED')
    }
  }
}
async function check(name, run) {
  try { await run() } catch { fail(`PERSISTENCE_${name.toUpperCase()}_FAILED`) }
  checks++
  console.log(`PASS ${name}`)
}
async function prepareDatabase(target) {
  const migrations = readdirSync(path.join(project, 'prisma/migrations')).filter(name => /^\d+_/.test(name) && existsSync(path.join(project, 'prisma/migrations', name, 'migration.sql')))
  if (migrations.length !== 5) fail('FIVE_MIGRATIONS_REQUIRED')
  const admin = new URL(target)
  admin.pathname = '/postgres'
  const { PrismaClient } = projectRequire('@prisma/client')
  db = new PrismaClient({ datasources: { db: { url: admin.toString() } } })
  const found = await db.$queryRaw`SELECT datname FROM pg_database WHERE datname = 'stage4_checks'`
  if (!found.length) {
    try { await db.$executeRawUnsafe('CREATE DATABASE stage4_checks') }
    catch (error) { if (error?.meta?.code !== '42P04') throw error }
  }
  await db.$disconnect(); db = undefined
  console.log('PASS test-database: 127.0.0.1:55433/stage4_checks')
  for (const action of ['deploy', 'status']) {
    const result = spawnSync(process.execPath, [path.join(project, 'node_modules/prisma/build/index.js'), 'migrate', action], {
      cwd: project, env: { ...process.env, DATABASE_URL: target }, encoding: 'utf8', windowsHide: true, timeout: 120000,
    })
    if (result.status !== 0) fail('TEST_MIGRATION_FAILED')
    console.log(`PASS migration-${action}`)
  }
}
async function runChecks(target) {
  const { PrismaClient } = projectRequire('@prisma/client')
  db = new PrismaClient({ datasources: { db: { url: target } } })
  const listener = createServer()
  listener.listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const port = listener.address().port
  await new Promise(resolve => listener.close(resolve))
  const base = `http://127.0.0.1:${port}`
  const secret = process.env.AGENT_APPROVAL_SECRET
  async function start() {
    app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
      cwd: project, env: { ...process.env, NODE_ENV: 'production', AI_PROVIDER_MODE: 'mock', DATABASE_URL: target },
      stdio: 'ignore', windowsHide: true,
    })
    let startupError = false
    app.on('error', () => { startupError = true })
    for (let i = 0; i < 150; i++) {
      if (startupError || app.exitCode !== null) fail('CHECK_SERVER_START_FAILED')
      try {
        const response = await fetch(base + '/api/auth/me', { signal: AbortSignal.timeout(1000), redirect: 'error' })
        if ([200, 401].includes(response.status)) {
          await delay(150)
          if (app.exitCode === null && !startupError) return
        }
      } catch { /* only the server started by this process is used */ }
      await delay(100)
    }
    fail('CHECK_SERVER_START_FAILED')
  }
  async function request(method, route, cookie, body) {
    const response = await fetch(base + route, { method, redirect: 'error', signal: AbortSignal.timeout(30000),
      // These are direct CLI requests. Browser Origin rejection remains a separate
      // course check; Next may canonicalize its internal host independently of -H.
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    return { code: response.status, data: await response.json(), headers: response.headers }
  }
  const post = (route, cookie, body) => request('POST', route, cookie, body)
  const get = (route, cookie) => request('GET', route, cookie)
  async function user() {
    const registration = await post('/api/auth/register', undefined, {
      username: `check${randomBytes(8).toString('hex')}`, password: `Aa1!${randomBytes(24).toString('base64url')}`,
    })
    assert.equal(registration.code, 201)
    const cookie = sessionCookie(registration.headers)
    const me = await get('/api/auth/me', cookie)
    assert.equal(me.code, 200)
    assert.ok(me.data.user.id)
    return { cookie, id: me.data.user.id }
  }
  const create = (owner, demo = 'research_workflow') => post('/api/agent/runs', owner.cookie,
    { goal: '请搜索自己的 Git 恢复版本资料，整理研究笔记，保存前让我确认。', demo })
  const route = id => '/api/agent/runs/' + encodeURIComponent(id)
  const actionFor = id => db.agentAction.findFirstOrThrow({ where: { runId: id } })
  const countFor = action => db.resource.count({ where: { agentActionKey: action.idempotencyKey } })
  let alice, bob, created, action
  await start()
  await check('test_accounts', async () => { alice = await user(); bob = await user() })
  await check('waiting_persisted', async () => {
    const result = await create(alice)
    assert.equal(result.code, 201)
    created = result.data
    assert.equal(created.status, 'waiting_approval')
    assert.ok(created.proposal.approvalToken)
    action = await actionFor(created.id)
    assert.equal(action.status, 'proposed')
    assert.equal(await countFor(action), 0)
    const saved = await db.agentRun.findUniqueOrThrow({ where: { id: created.id } })
    assert.equal(saved.ownerId, alice.id)
    assert.equal(saved.status, 'waiting_approval')
  })
  await check('owner_isolation', async () => {
    assert.equal((await get(route(created.id), bob.cookie)).code, 404)
    assert.equal((await post('/api/agent/runs', alice.cookie, { goal: 'test', ownerId: bob.id })).code, 400)
  })
  await check('read_does_not_write', async () => {
    const positions = await db.agentStep.count({ where: { runId: created.id } })
    for (let i = 0; i < 2; i++) {
      const loaded = await get(route(created.id), alice.cookie)
      assert.equal(loaded.code, 200)
      assert.equal(loaded.data.id, created.id)
      assert.equal(loaded.data.proposal.title, created.proposal.title)
    }
    assert.equal(await db.agentStep.count({ where: { runId: created.id } }), positions)
    assert.equal(await db.agentAction.count({ where: { runId: created.id } }), 1)
    assert.equal(await countFor(action), 0)
  })
  await check('restart_waiting', async () => {
    await stop(); await start()
    const restored = await get(route(created.id), alice.cookie)
    assert.equal(restored.code, 200)
    assert.equal(restored.data.status, 'waiting_approval')
    assert.equal(restored.data.proposal.title, created.proposal.title)
    assert.equal((await actionFor(created.id)).id, action.id)
    created = restored.data
    assert.equal(await countFor(action), 0)
  })
  if (['confirm', 'recovery', 'all'].includes(part)) {
    await check('concurrent_confirm_one_result', async () => {
      const responses = await Promise.all(Array.from({ length: 8 }, () => post('/api/agent/confirm', alice.cookie, { approvalToken: created.proposal.approvalToken })))
      assert.ok(responses.every(r => [200, 201].includes(r.code)))
      assert.equal(responses.filter(r => r.code === 201).length, 1)
      assert.equal(new Set(responses.map(r => r.data.saved.id)).size, 1)
      assert.equal(await countFor(action), 1)
      const stored = await db.resource.findFirstOrThrow({ where: { agentActionKey: action.idempotencyKey } })
      const args = JSON.parse(action.canonicalArgs)
      assert.equal(stored.ownerId, alice.id)
      assert.equal(stored.title, args.title)
      assert.equal(stored.desc, args.content)
      assert.equal((await actionFor(created.id)).status, 'executed')
      assert.equal((await db.agentRun.findUniqueOrThrow({ where: { id: created.id } })).status, 'completed')
    })
    await check('restart_retry_same_result', async () => {
      const saved = await db.resource.findFirstOrThrow({ where: { agentActionKey: action.idempotencyKey } })
      await stop(); await start()
      const response = await post('/api/agent/confirm', alice.cookie, { approvalToken: created.proposal.approvalToken })
      assert.equal(response.code, 200)
      assert.equal(response.data.saved.id, saved.id)
      assert.equal(await countFor(action), 1)
    })
  }
  if (['recovery', 'all'].includes(part)) {
    await check('pause_and_resume_race', async () => {
      const response = await create(bob, 'persistent_provider_failure')
      assert.equal(response.code, 201)
      assert.equal(response.data.status, 'paused')
      const id = response.data.id
      assert.equal(await db.agentAction.count({ where: { runId: id } }), 0)
      const resumed = await Promise.all([post(route(id) + '/resume', bob.cookie, {}), post(route(id) + '/resume', bob.cookie, {})])
      assert.deepEqual(resumed.map(r => r.code).sort(), [200, 409])
      assert.equal((await actionFor(id)).status, 'proposed')
      assert.equal(await db.agentAction.count({ where: { runId: id } }), 1)
      assert.equal(await countFor(await actionFor(id)), 0)
    })
    await check('rollback_then_retry', async () => {
      // Import the actual product transaction. The hook exists only on this direct helper,
      // never on an HTTP endpoint. The runner supplies all assertions and queries the DB.
      const { confirmPersistedAction } = await import(pathToFileURL(path.join(project, 'lib/agent-confirm-transaction.ts')).href)
      productDb = (await import(pathToFileURL(path.join(project, 'lib/prisma.ts')).href)).prisma
      assert.equal(typeof confirmPersistedAction, 'function')
      const response = await create(bob)
      assert.equal(response.code, 201)
      const run = response.data, pending = await actionFor(run.id)
      let injected = false
      await assert.rejects(confirmPersistedAction({ token: run.proposal.approvalToken, ownerId: bob.id, secret,
        afterResourceCreate: () => { injected = true; throw new Error('COURSE_ROLLBACK') },
      }), /COURSE_ROLLBACK/)
      assert.equal(injected, true)
      assert.equal(await countFor(pending), 0)
      assert.equal((await actionFor(run.id)).status, 'proposed')
      assert.equal((await db.agentRun.findUniqueOrThrow({ where: { id: run.id } })).status, 'waiting_approval')
      const retry = await post('/api/agent/confirm', bob.cookie, { approvalToken: run.proposal.approvalToken })
      assert.equal(retry.code, 201)
      assert.equal(await countFor(pending), 1)
      assert.equal((await actionFor(run.id)).status, 'executed')
    })
  }
  assert.ok(checks > 0)
  console.log(`PASS persisted-run ${part}: ${checks} checks; mock; stage4_checks; no fixtures deleted`)
}
try {
  if (!prepare && !['persistence', 'confirm', 'recovery', 'all'].includes(part)) fail('PERSISTENCE_ARGUMENTS_INVALID')
  if (!worker) loadCourseEnv()
  const target = agentDatabase('stage4_checks')
  if (worker) {
    // A directly invoked worker must still refuse the daily database.
    if (process.env.DATABASE_URL !== target || !process.env.AGENT_APPROVAL_SECRET) fail('PERSISTENCE_WORKER_CONFIG_REQUIRED')
    await runChecks(target)
  } else if (prepare) await prepareDatabase(target)
  else {
    if (!existsSync(path.join(project, '.next/BUILD_ID'))) fail('PRODUCTION_BUILD_REQUIRED')
    const child = spawnSync(process.execPath, ['--import', 'tsx', fileURLToPath(import.meta.url), '--worker', '--part', part], {
      cwd: project, env: { ...process.env, DATABASE_URL: target, TEST_DATABASE_URL: target, AI_PROVIDER_MODE: 'mock',
        AGENT_APPROVAL_SECRET: randomBytes(48).toString('base64url') }, stdio: 'inherit', windowsHide: true,
    })
    if (child.error) fail('PERSISTENCE_WORKER_START_FAILED')
    process.exitCode = child.status ?? 1
  }
} catch (error) { safeFailure(error) }
finally {
  try { await stop() } catch (error) { safeFailure(error) }
  await db?.$disconnect()
  await productDb?.$disconnect()
}
