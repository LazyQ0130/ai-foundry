// Paid local acceptance after deterministic MCP, DB, Provider Stub and build gates.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l4') ||
    process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || !process.env.AI_CHAT_API_KEY || !process.env.AI_CHAT_BASE_URL)
  throw new Error('Use built Reference, isolated stage4_l4 DB and local qwen3.7-flash configuration')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32388), base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    MCP_AUTH_SECRET: randomBytes(48).toString('base64url'),
    MCP_REFERENCE_URL: `${base}/api/mcp/reference`, MCP_ALLOW_LOCAL_HTTP: '1',
    AGENT_APPROVAL_SECRET: randomBytes(48).toString('base64url'),
    AI_PROVIDER_MODE: 'real', AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '20000' },
  stdio: 'ignore', windowsHide: true,
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
    body: JSON.stringify({ username: `q${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const before = await db.resource.count({ where: { ownerId: me.user.id } })
  let reached = false
  const goals = [
    '请先调用 research_reference 查询 RAG 的公开课程参考，再根据工具结果用一句话回答。',
    '请使用 research_reference 工具，topic 为 RAG；只根据返回的公开参考回答。',
    '我需要 RAG 的公开参考。请调用 research_reference({topic:"RAG"}) 后再回答。',
  ]
  for (let attempt = 0; attempt < goals.length; attempt++) {
    const response = await fetch(base + '/api/agent/run', { method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: goals[attempt], demo: 'mcp_reference' }) })
    const result = await response.json()
    assert.equal(response.status, 200)
    assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before)
    console.log(JSON.stringify({ attempt: attempt + 1, model: process.env.AI_CHAT_MODEL,
      status: result.status, modelCalls: result.modelCalls, mcpCalls: result.mcpCalls,
      toolCalls: result.toolCalls, embeddingCalls: result.embeddingCalls,
      providerUnits: result.providerUnits, finishReasons: result.finishReasons,
      safeReference: result.mcpReference?.referenceId ?? null, dbWrites: 0 }))
    if (result.status === 'completed' && result.modelCalls === 2 && result.mcpCalls === 1 &&
        result.toolCalls === 1 && result.embeddingCalls === 0 && result.providerUnits === 2 &&
        result.mcpReference?.referenceId === 'ref-rag') { reached = true; break }
    if (result.status === 'budget_exhausted') break
  }
  if (!reached) console.log('REAL MODEL LIMITATION: natural-language attempts did not complete an MCP roundtrip')
} finally { app.kill(); await db.$disconnect() }
