// Run only against an assembled Reference and the isolated local stage4_l3 database.
import assert from 'node:assert/strict'
import { createHmac, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l3'))
  throw new Error('Use built Reference and isolated stage4_l3 database')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32374), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: secret, AI_PROVIDER_MODE: 'mock' }, stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `n${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie')?.split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { cookie, id: me.user.id }
}
async function post(route, cookie, body, headers = {}) {
  const response = await fetch(base + route, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body) })
  return { code: response.status, data: await response.json() }
}
const count = ownerId => db.resource.count({ where: { ownerId } })

try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const alice = await user(), bob = await user()
  const beforeAlice = await count(alice.id), beforeBob = await count(bob.id)
  const proposal = await post('/api/agent/run', alice.cookie, { goal: 'Git 恢复版本', demo: 'note_proposal' })
  assert.equal(proposal.code, 200); assert.equal(proposal.data.status, 'waiting_approval')
  assert.equal(proposal.data.modelCalls, 1); assert.equal(proposal.data.toolCalls, 0)
  assert.deepEqual(proposal.data.proposal.args, { title: 'Git 恢复版本', content: '研究记录：Git 恢复版本' })
  assert.equal(await count(alice.id), beforeAlice); assert.equal(await count(bob.id), beforeBob)
  const token = proposal.data.approvalToken

  assert.equal((await post('/api/agent/confirm', alice.cookie, { approvalToken: token, title: '恶意替换' })).code, 400)
  assert.equal((await post('/api/agent/confirm', alice.cookie, { approvalToken: token }, { Origin: 'https://other.example' })).code, 403)
  assert.equal((await post('/api/agent/confirm', bob.cookie, { approvalToken: token })).code, 400)
  const [encoded, signature] = token.split('.')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
  for (const changed of [
    { ...payload, canonicalArgs: '{"title":"evil","content":"研究记录：Git 恢复版本"}' },
    { ...payload, canonicalArgs: '{"title":"Git 恢复版本","content":"evil"}' },
    { ...payload, toolName: 'unknown_write_tool' }, { ...payload, userId: bob.id },
    { ...payload, expiresAt: payload.expiresAt + 60000 }, { ...payload, nonce: 'A'.repeat(32) },
  ]) {
    const tampered = `${Buffer.from(JSON.stringify(changed)).toString('base64url')}.${signature}`
    assert.equal((await post('/api/agent/confirm', alice.cookie, { approvalToken: tampered })).code, 400)
  }
  assert.equal((await post('/api/agent/confirm', alice.cookie, { approvalToken: `${encoded}.${'A'.repeat(43)}` })).code, 400)
  const expiredBody = Buffer.from(JSON.stringify({ ...payload, expiresAt: Date.now() - 1 })).toString('base64url')
  const expiredSignature = createHmac('sha256', secret).update(expiredBody).digest('base64url')
  assert.equal((await post('/api/agent/confirm', alice.cookie, { approvalToken: `${expiredBody}.${expiredSignature}` })).code, 400)
  assert.equal(await count(alice.id), beforeAlice); assert.equal(await count(bob.id), beforeBob)

  const unknown = await post('/api/agent/run', alice.cookie, { goal: 'Git', demo: 'note_unknown_tool' })
  assert.equal(unknown.data.status, 'failed'); assert.equal(unknown.data.toolCalls, 0)
  const extra = await post('/api/agent/run', alice.cookie, { goal: 'Git', demo: 'note_extra_field' })
  assert.equal(extra.data.status, 'failed'); assert.equal(extra.data.toolCalls, 0)
  const echo = await post('/api/agent/run', alice.cookie, { goal: 'Git', demo: 'tool' })
  assert.equal(echo.data.status, 'completed'); assert.equal(echo.data.toolCalls, 1)

  const confirmed = await post('/api/agent/confirm', alice.cookie, { approvalToken: token })
  assert.equal(confirmed.code, 201); assert.equal(confirmed.data.status, 'saved')
  assert.equal(confirmed.data.modelCalls, 0)
  assert.deepEqual([confirmed.data.saved.title, confirmed.data.saved.desc, confirmed.data.saved.tag, confirmed.data.saved.important],
    ['Git 恢复版本', '研究记录：Git 恢复版本', '文章', false])
  const savedRow = await db.resource.findUnique({ where: { id: confirmed.data.saved.id } })
  assert.equal(savedRow.ownerId, alice.id)
  assert.equal(await count(alice.id), beforeAlice + 1); assert.equal(await count(bob.id), beforeBob)
  const replay = await post('/api/agent/confirm', alice.cookie, { approvalToken: token })
  assert.equal(replay.code, 201); assert.equal(await count(alice.id), beforeAlice + 2)
  console.log('PASS: proposal DB=0, exact confirm DB=+1/model=0, tamper/cross-user/unknown/read guards')
  console.log('CURRENT KNOWN LIMITATION: stateless HMAC approval is replayable')
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  await db.$disconnect()
}
