// Isolated local PostgreSQL + real MCP Streamable HTTP boundary.
import assert from 'node:assert/strict'
import { createHmac, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { request as httpRequest } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l4'))
  throw new Error('Use built Reference and isolated stage4_l4 DB')
const require = createRequire(path.join(project, 'package.json'))
const { Client, StreamableHTTPClientTransport } = require('@modelcontextprotocol/client')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32384), base = `http://127.0.0.1:${port}`
const url = new URL(base + '/api/mcp/reference')
const mcpSecret = randomBytes(48).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    MCP_AUTH_SECRET: mcpSecret, MCP_REFERENCE_URL: url.href, MCP_ALLOW_LOCAL_HTTP: '1',
    AGENT_APPROVAL_SECRET: randomBytes(48).toString('base64url'), AI_PROVIDER_MODE: 'mock' },
  stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${createHmac('sha256', mcpSecret).update(encoded).digest('base64url')}`
}
const payload = () => ({ v: 1, aud: 'aifoundry-research-reference', scope: 'tools:call:research_reference',
  exp: Date.now() + 120000, nonce: randomBytes(24).toString('base64url') })
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `m${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { cookie, id: me.user.id }
}
async function run(cookie, goal, demo) {
  const response = await fetch(base + '/api/agent/run', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, demo }) })
  return { code: response.status, data: await response.json() }
}

try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const rpc = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'server/discover', params: { supportedVersions: ['2026-07-28'] } })
  async function authCase(token, headers = {}) {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: rpc })
    return response.status
  }
  assert.equal(await authCase(null), 401)
  const good = sign(payload())
  assert.equal(await authCase(`${good}x`), 401)
  assert.equal(await authCase(sign({ ...payload(), exp: Date.now() - 1 })), 401)
  assert.equal(await authCase(sign({ ...payload(), aud: 'wrong' })), 401)
  assert.equal(await authCase(sign({ ...payload(), scope: 'tools:call:admin' })), 401)
  assert.equal(await authCase(good, { Origin: 'https://other.example' }), 403)
  const wrongHost = await new Promise((resolve, reject) => {
    const request = httpRequest({ host: '127.0.0.1', port, path: '/api/mcp/reference', method: 'POST',
      headers: { Host: 'other.example', Authorization: `Bearer ${good}`, 'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream' } }, response => { response.resume(); resolve(response.statusCode) })
    request.on('error', reject); request.end(rpc)
  })
  assert.equal(wrongHost, 403)

  const transport = new StreamableHTTPClientTransport(url, { requestInit: { headers: { Authorization: `Bearer ${good}` } } })
  const client = new Client({ name: 'stage4-l4-acceptance', version: '1.0.0' },
    { versionNegotiation: { mode: { pin: '2026-07-28' } } })
  try {
    await client.connect(transport, { timeout: 5000 })
    assert.equal(client.getNegotiatedProtocolVersion(), '2026-07-28')
    assert.equal(client.getProtocolEra(), 'modern')
    const listed = await client.listTools()
    assert.deepEqual(listed.tools.map(item => item.name), ['research_reference'])
    const result = await client.callTool({ name: 'research_reference', arguments: { topic: ' RAG ' } })
    assert.deepEqual(JSON.parse(result.content[0].text), { topic: 'RAG', referenceId: 'ref-rag',
      summary: 'RAG 在生成回答前检索相关资料，并将检索结果作为回答依据。' })
    const rejected = await client.callTool({ name: 'research_reference', arguments: { topic: 'RAG', ownerId: 2 } })
    assert.equal(rejected.isError, true)
  } finally { await client.close() }

  const alice = await user()
  const before = await db.resource.count({ where: { ownerId: alice.id } })
  const normal = await run(alice.cookie, 'RAG', 'mcp_reference')
  assert.equal(normal.code, 200); assert.equal(normal.data.status, 'completed')
  assert.equal(normal.data.modelCalls, 2); assert.equal(normal.data.toolCalls, 1)
  assert.equal(normal.data.mcpCalls, 1); assert.equal(normal.data.embeddingCalls, 0)
  assert.equal(normal.data.providerUnits, 0)
  assert.equal(normal.data.mcpReference.referenceId, 'ref-rag')
  assert.equal(await db.resource.count({ where: { ownerId: alice.id } }), before)
  const extra = await run(alice.cookie, 'RAG', 'mcp_extra_field')
  assert.equal(extra.data.status, 'failed'); assert.equal(extra.data.mcpCalls, 0)
  const echo = await run(alice.cookie, 'Git', 'tool')
  assert.equal(echo.data.status, 'completed'); assert.equal(echo.data.toolCalls, 1)
  const proposal = await run(alice.cookie, 'Git', 'note_proposal')
  assert.equal(proposal.data.status, 'waiting_approval'); assert.equal(await db.resource.count({ where: { ownerId: alice.id } }), before)
  const confirmed = await fetch(base + '/api/agent/confirm', { method: 'POST',
    headers: { Cookie: alice.cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ approvalToken: proposal.data.approvalToken }) })
  assert.equal(confirmed.status, 201)
  assert.equal(await db.resource.count({ where: { ownerId: alice.id } }), before + 1)
  console.log('PASS: MCP modern 2026-07-28 HTTP handshake/list/call, strict input, scoped bearer, host/origin, Agent 2 model/1 MCP/1 tool, 4.3 approval regression')
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  await db.$disconnect()
}
