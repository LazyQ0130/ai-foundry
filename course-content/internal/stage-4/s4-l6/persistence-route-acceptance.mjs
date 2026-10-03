// Real Next HTTP + PostgreSQL. Run against a clean, migrated Stage 4.6 assembly.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { mockEmbedding } from '../../stage-3/s3-l7/common/lib/knowledge-mock.ts'
import { vectorLiteral } from '../../stage-3/s3-l7/common/lib/knowledge-vector.ts'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l6'))
  throw new Error('Use built Stage 4.6 Reference and isolated stage4_l6 PostgreSQL')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32661), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let app
async function start() {
  app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
      AGENT_APPROVAL_SECRET: secret, AI_PROVIDER_MODE: 'mock' }, stdio: 'ignore', windowsHide: true,
  })
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) return } catch { /* startup */ }
    await delay(100)
  }
  throw new Error('Reference server did not start')
}
async function stop() {
  if (!app) return
  app.kill()
  await Promise.race([once(app, 'exit'), delay(3000)])
  app = undefined
  await delay(250)
}
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `p${Date.now()}${Math.floor(Math.random() * 999999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { cookie, id: me.user.id }
}
async function req(method, route, cookie, body) {
  const response = await fetch(base + route, { method, headers: { Cookie: cookie,
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  return { code: response.status, data: await response.json() }
}
const post = (route, cookie, body) => req('POST', route, cookie, body)
const get = (route, cookie) => req('GET', route, cookie)
const run = (cookie, demo = 'research_workflow') => post('/api/agent/runs', cookie,
  { goal: '请搜索我自己的 Git 恢复版本资料，整理笔记并在保存前让我确认。', demo })
const route = id => `/api/agent/runs/${id}`
async function seed(ownerId, title, content) {
  const doc = await db.knowledgeDocument.create({ data: { ownerId, title, content, status: 'ready' } })
  const literal = vectorLiteral(mockEmbedding('Git 恢复版本'))
  await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
    VALUES (${doc.id}, 0, ${content}, ${literal}::vector, 'mock-embedding-v1', 1024)`
}
try {
  await start() // Server A
  const alice = await user(), bob = await user()
  await seed(alice.id, 'Alice Git', 'Git reflog 可找回旧提交。')
  await seed(bob.id, 'BobSecret', 'BobSecret 不得出现在 Alice 的 Run。')
  for (const field of ['ownerId', 'userId', 'status', 'currentStep', 'actionId', 'idempotencyKey'])
    assert.equal((await post('/api/agent/runs', alice.cookie, { goal: 'test', [field]: 1 })).code, 400)
  const created = await run(alice.cookie)
  assert.equal(created.code, 201); assert.equal(created.data.status, 'waiting_approval')
  const id = created.data.id
  assert.deepEqual(created.data.timeline.map(step => step.kind), ['model', 'tool', 'model', 'approval'])
  assert(!JSON.stringify(created.data).includes('BobSecret'))
  assert(!JSON.stringify(created.data).includes('canonicalArgs'))
  assert(!JSON.stringify(created.data).includes('idempotencyKey'))
  assert.equal(await db.resource.count({ where: { ownerId: alice.id, agentActionKey: { not: null } } }), 0)
  const action = await db.agentAction.findFirstOrThrow({ where: { runId: id } })
  assert.equal(action.status, 'proposed')
  assert.equal((await get(route(id), bob.cookie)).code, 404)
  assert.equal((await post(route(id) + '/resume', bob.cookie, {})).code, 404)
  assert.equal((await post('/api/agent/confirm', bob.cookie,
    { approvalToken: created.data.proposal.approvalToken })).code, 400)
  assert.equal((await post('/api/agent/run', alice.cookie,
    { goal: 'old write', demo: 'research_workflow' })).code, 410)
  assert.equal((await post('/api/agent/run', alice.cookie,
    { goal: 'old write', demo: 'note_proposal' })).code, 410)
  console.log('PASS Server A: owner binding, safe ordered steps, V1 write closure, waiting persisted')

  await stop(); await start() // Server B
  const restored = await get(route(id), alice.cookie)
  assert.equal(restored.code, 200); assert.equal(restored.data.status, 'waiting_approval')
  assert.equal(restored.data.timeline.length, 4)
  assert.equal(restored.data.proposal.title, created.data.proposal.title)
  const token = restored.data.proposal.approvalToken
  assert.notEqual(token, created.data.proposal.approvalToken)
  for (const field of ['runId', 'actionId', 'title', 'content', 'idempotencyKey'])
    assert.equal((await post('/api/agent/confirm', alice.cookie, { approvalToken: token, [field]: 1 })).code, 400)
  const concurrent = await Promise.all(Array.from({ length: 8 }, () =>
    post('/api/agent/confirm', alice.cookie, { approvalToken: token })))
  assert.equal(concurrent.filter(item => item.code === 201).length, 1)
  assert.equal(concurrent.filter(item => item.code === 200).length, 7)
  assert.equal(new Set(concurrent.map(item => item.data.saved.id)).size, 1)
  const savedId = concurrent[0].data.saved.id
  assert.equal(await db.agentRun.count({ where: { id } }), 1)
  assert.equal(await db.agentAction.count({ where: { runId: id } }), 1)
  assert.equal(await db.resource.count({ where: { agentActionKey: action.idempotencyKey } }), 1)
  assert.equal((await db.agentAction.findUniqueOrThrow({ where: { id: action.id } })).status, 'executed')
  assert.equal((await db.agentRun.findUniqueOrThrow({ where: { id } })).status, 'completed')
  assert.equal((await get(route(id), alice.cookie)).data.saved.id, savedId)
  console.log('PASS Server B: restart recovery, fresh V2, concurrent confirm ×8, duplicate confirmed writes=0')

  await stop(); await start() // Server C: response lost retry after committed transaction
  const completed = await get(route(id), alice.cookie)
  assert.equal(completed.data.status, 'completed'); assert.equal(completed.data.saved.id, savedId)
  assert.equal(completed.data.proposal, undefined)
  const retry = await post('/api/agent/confirm', alice.cookie, { approvalToken: token })
  assert.equal(retry.code, 200); assert.equal(retry.data.replayed, true)
  assert.equal(retry.data.saved.id, savedId)
  assert.equal(await db.resource.count({ where: { agentActionKey: action.idempotencyKey } }), 1)

  const failure = await run(alice.cookie, 'persistent_provider_failure')
  assert.equal(failure.code, 201); assert.equal(failure.data.status, 'paused')
  assert(failure.data.timeline.some(step => step.errorCategory === 'UPSTREAM'))
  assert.equal(await db.agentAction.count({ where: { runId: failure.data.id } }), 0)
  assert.equal((await post(route(failure.data.id) + '/resume', alice.cookie, { ownerId: alice.id })).code, 400)
  const resumed = await Promise.all(Array.from({ length: 2 }, () =>
    post(route(failure.data.id) + '/resume', alice.cookie, {})))
  assert.deepEqual(resumed.map(item => item.code).sort(), [200, 409])
  assert.equal(resumed.find(item => item.code === 200).data.status, 'waiting_approval')
  assert.equal((await db.agentAction.count({ where: { runId: failure.data.id } })), 1)
  const recoveredAction = await db.agentAction.findFirstOrThrow({ where: { runId: failure.data.id } })
  await db.agentAction.update({ where: { id: recoveredAction.id }, data: { canonicalArgs: '{bad' } })
  assert.equal((await get(route(failure.data.id), alice.cookie)).data.status, 'failed')
  assert.equal((await post('/api/agent/confirm', alice.cookie,
    { approvalToken: resumed.find(item => item.code === 200).data.proposal.approvalToken })).code, 400)
  const budget = await run(alice.cookie, 'persistent_budget_final')
  assert.equal(budget.data.status, 'paused')
  assert(budget.data.timeline.some(step => step.errorCategory === 'budget_exhausted'))
  assert.equal(await db.agentAction.count({ where: { runId: budget.data.id } }), 0)
  const cancelled = await run(bob.cookie)
  assert.equal((await post(route(cancelled.data.id) + '/cancel', bob.cookie, {})).code, 200)
  assert.equal((await post(route(cancelled.data.id) + '/resume', bob.cookie, {})).code, 409)
  assert.equal((await post('/api/agent/confirm', bob.cookie,
    { approvalToken: cancelled.data.proposal.approvalToken })).code, 400)
  assert.equal((await db.resource.count({ where: { agentActionKey: { not: null }, ownerId: bob.id } })), 0)
  console.log('PASS Server C: completed recovery, response-lost retry, paused/resume ×2, budget, cancel')
} finally {
  await stop(); await db.$disconnect()
}
