import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l3'))
  throw new Error('Use built Reference and isolated stage4_l3 database')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const appPort = Number(process.argv[3] ?? 32375), base = `http://127.0.0.1:${appPort}`
const sent = [], queue = []
const stub = createServer(async (request, response) => {
  let raw = ''; for await (const chunk of request) raw += chunk
  sent.push({ path: request.url, body: JSON.parse(raw) })
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(queue.shift()))
})
stub.listen(0, '127.0.0.1'); await once(stub, 'listening')
const secret = randomBytes(48).toString('base64url')
const stubKey = randomBytes(18).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(appPort)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: secret, AI_PROVIDER_MODE: 'real',
    AI_CHAT_BASE_URL: `http://127.0.0.1:${stub.address().port}/compatible-mode/v1`, AI_CHAT_API_KEY: stubKey,
    AI_CHAT_MODEL: 'qwen3.7-flash', AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '1000' },
  stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const finish = (name, args) => ({ choices: [{ message: { role: 'assistant', content: null,
  tool_calls: [{ id: 'write-stub-1', type: 'function', function: { name, arguments: args } }] },
  finish_reason: 'tool_calls' }], usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } })
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const registration = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `s${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const before = await db.resource.count({ where: { ownerId: me.user.id } })
  const request = async (route, body) => {
    const response = await fetch(base + route, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify(body) })
    return { code: response.status, body: await response.json() }
  }
  queue.push(finish('save_research_note', JSON.stringify({ title: ' Stub 标题 ', content: ' Stub 内容 ' })))
  const proposal = await request('/api/agent/run', { goal: '请提出保存一条研究笔记', demo: 'note_proposal' })
  assert.equal(proposal.code, 200); assert.equal(proposal.body.status, 'waiting_approval')
  assert.equal(proposal.body.modelCalls, 1); assert.equal(proposal.body.toolCalls, 0)
  assert.equal(proposal.body.providerUnits, 1); assert.equal(sent.length, 1)
  assert.deepEqual(proposal.body.proposal.args, { title: 'Stub 标题', content: 'Stub 内容' })
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before)
  assert.equal(sent[0].path.endsWith('/chat/completions'), true)
  assert.equal(sent[0].body.tool_choice, 'auto')
  assert.equal(sent[0].body.enable_thinking, false)
  assert.equal(sent[0].body.parallel_tool_calls, false)
  assert.deepEqual(Object.keys(sent[0].body.tools.find(tool => tool.function.name === 'save_research_note').function.parameters.properties), ['title', 'content'])
  const saved = await request('/api/agent/confirm', { approvalToken: proposal.body.approvalToken })
  assert.equal(saved.code, 201); assert.equal(saved.body.modelCalls, 0)
  assert.equal(sent.length, 1); assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before + 1)
  assert.deepEqual([saved.body.saved.title, saved.body.saved.desc], ['Stub 标题', 'Stub 内容'])
  queue.push(finish('unknown_write_tool', '{}'))
  const unknown = await request('/api/agent/run', { goal: '请保存研究笔记', demo: 'note_proposal' })
  assert.equal(unknown.body.status, 'failed'); assert.equal(unknown.body.toolCalls, 0)
  console.log('PASS: 4.3 Provider Stub, auto tool choice, proposal DB=0, exact confirm DB=+1/model=0, unknown write rejected')
} finally {
  app.kill(); stub.closeAllConnections(); stub.close(); await db.$disconnect()
}
