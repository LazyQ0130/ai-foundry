import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l6'))
  throw new Error('Use a built Stage 4.6 assembly and isolated stage4_l6 PostgreSQL')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const { confirmPersistedAction } = await import(pathToFileURL(path.join(project, 'lib/agent-confirm-transaction.ts')).href)
const port = Number(process.argv[3] ?? 32665), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: secret, AI_PROVIDER_MODE: 'mock' }, stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const registration = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `rollback${Date.now()}`, password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const response = await fetch(base + '/api/agent/runs', { method: 'POST', headers: { Cookie: cookie,
    'Content-Type': 'application/json' }, body: JSON.stringify({ goal: '整理 Git 恢复版本资料并让我确认', demo: 'research_workflow' }) })
  assert.equal(response.status, 201)
  const run = await response.json()
  assert.equal(run.status, 'waiting_approval')
  const action = await db.agentAction.findFirstOrThrow({ where: { runId: run.id } })
  await assert.rejects(confirmPersistedAction({ token: run.proposal.approvalToken,
    ownerId: me.user.id, secret, afterResourceCreate: () => { throw new Error('TEST_ROLLBACK') } }), /TEST_ROLLBACK/)
  assert.equal(await db.resource.count({ where: { agentActionKey: action.idempotencyKey } }), 0)
  assert.equal((await db.agentAction.findUniqueOrThrow({ where: { id: action.id } })).status, 'proposed')
  assert.equal((await db.agentRun.findUniqueOrThrow({ where: { id: run.id } })).status, 'waiting_approval')
  const result = await confirmPersistedAction({ token: run.proposal.approvalToken, ownerId: me.user.id, secret })
  assert.equal(result.replayed, false)
  assert.equal(await db.resource.count({ where: { agentActionKey: action.idempotencyKey } }), 1)
  assert.equal((await db.agentRun.findUniqueOrThrow({ where: { id: run.id } })).status, 'completed')
  console.log('PASS: transaction rollback after Resource.create, then exact one committed Resource')
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  await db.$disconnect()
}
