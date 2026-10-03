// Real HTTP Chat + Embedding stubs, real owner-filtered PostgreSQL retrieval.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { mockEmbedding } from '../../stage-3/s3-l7/common/lib/knowledge-mock.ts'
import { vectorLiteral } from '../../stage-3/s3-l7/common/lib/knowledge-vector.ts'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l5'))
  throw new Error('Use built 4.5 Reference and isolated stage4_l5 DB')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const sent = [], queue = []
const stub = createServer(async (request, response) => {
  let raw = ''; for await (const chunk of request) raw += chunk
  sent.push({ path: request.url, body: JSON.parse(raw) })
  const next = queue.shift()
  if (!next) { response.writeHead(500); response.end(); return }
  if (next.delay) await new Promise(resolve => setTimeout(resolve, next.delay))
  if (response.destroyed) return
  response.writeHead(next.status ?? 200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(next.body))
})
stub.listen(0, '127.0.0.1'); await once(stub, 'listening')
const port = Number(process.argv[3] ?? 32553), base = `http://127.0.0.1:${port}`
const key = randomBytes(18).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: randomBytes(48).toString('base64url'), AI_PROVIDER_MODE: 'real',
    AI_CHAT_BASE_URL: `http://127.0.0.1:${stub.address().port}/compatible-mode/v1`, AI_CHAT_API_KEY: key,
    AI_CHAT_MODEL: 'qwen3.7-flash', AI_CHAT_DISABLE_THINKING: '1',
    AI_EMBEDDING_BASE_URL: `http://127.0.0.1:${stub.address().port}/compatible-mode/v1`,
    AI_EMBEDDING_API_KEY: key, AI_EMBEDDING_MODEL: 'text-embedding-v4', AI_EMBEDDING_DIMENSION: '1024',
    AI_TIMEOUT_MS: '1000' }, stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const finish = (message, reason = 'stop') => ({ choices: [{ message, finish_reason: reason }],
  usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } })
const tool = (name, args, id) => ({ id, type: 'function', function: { name, arguments: JSON.stringify(args) } })
const chat = body => ({ body })
const embedding = query => ({ body: { data: [{ embedding: mockEmbedding(query) }],
  usage: { prompt_tokens: 3, total_tokens: 3 } } })
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const registration = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `stubw${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const query = 'Git 恢复版本'
  const doc = await db.knowledgeDocument.create({ data: { ownerId: me.user.id,
    title: '我的 Git 恢复资料', content: 'Git reflog 可找回旧引用。', status: 'ready' } })
  const literal = vectorLiteral(mockEmbedding(query))
  await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
    VALUES (${doc.id}, 0, 'Git reflog 可找回旧引用。', ${literal}::vector, 'text-embedding-v4', 1024)`
  const before = await db.resource.count({ where: { ownerId: me.user.id } })
  queue.push(chat(finish({ role: 'assistant', content: null,
    tool_calls: [tool('search_knowledge', { query }, 'stub-search')] }, 'tool_calls')))
  queue.push(embedding(query))
  queue.push(chat(finish({ role: 'assistant', content: null, tool_calls: [tool('save_research_note',
    { title: 'Git 恢复版本研究笔记', content: '依据 Git reflog 的安全摘要整理。' }, 'stub-save')] }, 'tool_calls')))
  const response = await fetch(base + '/api/agent/run', { method: 'POST', headers: { Cookie: cookie,
    'Content-Type': 'application/json' }, body: JSON.stringify({ goal: '搜索我的 Git 恢复资料并提出笔记',
      demo: 'research_workflow' }) })
  const result = await response.json()
  assert.equal(response.status, 200); assert.equal(result.status, 'waiting_approval')
  assert.deepEqual([result.modelCalls, result.embeddingCalls, result.toolCalls, result.providerUnits], [2, 1, 1, 3])
  assert.deepEqual(sent.map(item => item.path.split('/').at(-1)), ['completions', 'embeddings', 'completions'])
  assert.equal(sent[0].body.tool_choice, 'auto'); assert.equal(sent[0].body.enable_thinking, false)
  assert.equal(sent[0].body.parallel_tool_calls, false)
  assert.deepEqual(sent[0].body.tools.map(item => item.function.name), ['search_knowledge', 'save_research_note'])
  assert.equal(sent[2].body.messages.at(-1).role, 'tool')
  assert(!JSON.stringify(sent[2].body).includes('ownerId'))
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before)
  const confirmed = await fetch(base + '/api/agent/confirm', { method: 'POST', headers: { Cookie: cookie,
    'Content-Type': 'application/json' }, body: JSON.stringify({ approvalToken: result.approvalToken }) })
  const saved = await confirmed.json()
  assert.equal(confirmed.status, 201); assert.equal(saved.modelCalls, 0)
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before + 1)
  assert.equal(sent.length, 3)
  const run = async () => {
    const response = await fetch(base + '/api/agent/run', { method: 'POST', headers: { Cookie: cookie,
      'Content-Type': 'application/json' }, body: JSON.stringify({ goal: '搜索 Git 恢复版本并提议笔记',
        demo: 'research_workflow' }) })
    return response.json()
  }
  const beforeModelTimeout = sent.length
  queue.push({ ...chat(finish({ role: 'assistant', content: null,
    tool_calls: [tool('search_knowledge', { query }, 'late-search')] }, 'tool_calls')), delay: 1300 })
  const modelTimeout = await run()
  assert.equal(modelTimeout.status, 'failed'); assert.equal(modelTimeout.error, 'TIMEOUT')
  assert.equal(sent.length - beforeModelTimeout, 1)
  assert.equal(modelTimeout.toolCalls, 0)
  const beforeEmbeddingTimeout = sent.length
  queue.push(chat(finish({ role: 'assistant', content: null,
    tool_calls: [tool('search_knowledge', { query }, 'search-before-timeout')] }, 'tool_calls')))
  queue.push({ ...embedding(query), delay: 1300 })
  const embeddingTimeout = await run()
  assert.equal(embeddingTimeout.status, 'failed'); assert.equal(embeddingTimeout.error, 'TIMEOUT')
  assert.equal(sent.length - beforeEmbeddingTimeout, 2)
  assert.equal(embeddingTimeout.modelCalls, 1)
  assert.equal(embeddingTimeout.toolCalls, 0)
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before + 1)
  console.log('PASS: Provider Stub model→embedding/search→model/proposal→confirm; first-model and embedding timeouts stop later steps')
} finally {
  app.kill(); stub.closeAllConnections(); stub.close(); await db.$disconnect()
}
