import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l4'))
  throw new Error('Use built Reference and isolated stage4_l4 DB')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const sent = [], queue = []
const chat = createServer(async (request, response) => {
  let raw = ''; for await (const chunk of request) raw += chunk
  sent.push({ path: request.url, body: JSON.parse(raw) })
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(queue.shift()))
})
chat.listen(0, '127.0.0.1'); await once(chat, 'listening')
const port = Number(process.argv[3] ?? 32387), base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    MCP_AUTH_SECRET: randomBytes(48).toString('base64url'),
    MCP_REFERENCE_URL: `${base}/api/mcp/reference`, MCP_ALLOW_LOCAL_HTTP: '1',
    AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: `http://127.0.0.1:${chat.address().port}/compatible-mode/v1`,
    AI_CHAT_API_KEY: randomBytes(18).toString('base64url'), AI_CHAT_MODEL: 'qwen3.7-flash',
    AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '1000' },
  stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const finish = (message, reason = 'stop') => ({ choices: [{ message, finish_reason: reason }],
  usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } })
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const registration = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `p${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const before = await db.resource.count({ where: { ownerId: me.user.id } })
  queue.push(finish({ role: 'assistant', content: null, tool_calls: [{ id: 'mcp-stub-1', type: 'function',
    function: { name: 'research_reference', arguments: '{"topic":"RAG"}' } }] }, 'tool_calls'))
  queue.push(finish({ role: 'assistant', content: '根据公开参考回答。' }))
  const response = await fetch(base + '/api/agent/run', { method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal: '请查询 RAG 的公开参考', demo: 'mcp_reference' }) })
  const result = await response.json()
  assert.equal(response.status, 200); assert.equal(result.status, 'completed')
  assert.equal(result.modelCalls, 2); assert.equal(result.toolCalls, 1)
  assert.equal(result.mcpCalls, 1); assert.equal(result.embeddingCalls, 0)
  assert.equal(result.providerUnits, 2)
  assert.deepEqual(result.finishReasons, ['tool_calls', 'stop'])
  assert.equal(result.mcpReference.referenceId, 'ref-rag')
  assert.equal(sent.length, 2)
  assert.equal(sent[0].body.tool_choice, 'auto')
  assert.equal(sent[0].body.enable_thinking, false)
  assert.equal(sent[0].body.parallel_tool_calls, false)
  assert.deepEqual(Object.keys(sent[0].body.tools.find(tool => tool.function.name === 'research_reference').function.parameters.properties), ['topic'])
  assert.equal(sent[1].body.messages.at(-1).role, 'tool')
  assert.deepEqual(Object.keys(JSON.parse(sent[1].body.messages.at(-1).content)), ['topic', 'referenceId', 'summary'])
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before)
  console.log('PASS: Provider Stub model/MCP/model 2 units, real Streamable HTTP, safe role:tool result, no DB write')
} finally {
  app.kill(); chat.closeAllConnections(); chat.close(); await db.$disconnect()
}
