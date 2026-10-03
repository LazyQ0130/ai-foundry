import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { mockEmbedding } from '../../stage-3/s3-l7/common/lib/knowledge-mock.ts'
import { vectorLiteral } from '../../stage-3/s3-l7/common/lib/knowledge-vector.ts'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l6'))
  throw new Error('Use a built Stage 4.6 assembly and isolated PostgreSQL')
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
const port = Number(process.argv[3] ?? 32667), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url'), key = randomBytes(18).toString('base64url')
const apiBase = `http://127.0.0.1:${stub.address().port}/compatible-mode/v1`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: secret, AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: apiBase,
    AI_CHAT_API_KEY: key, AI_CHAT_MODEL: 'qwen3.7-flash', AI_CHAT_DISABLE_THINKING: '1',
    AI_EMBEDDING_BASE_URL: apiBase, AI_EMBEDDING_API_KEY: key,
    AI_EMBEDDING_MODEL: 'text-embedding-v4', AI_EMBEDDING_DIMENSION: '1024', AI_TIMEOUT_MS: '3000' },
  stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const finish = (message, reason = 'stop') => ({ choices: [{ message, finish_reason: reason }],
  usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } })
const tool = (name, args, id) => ({ id, type: 'function', function: { name, arguments: JSON.stringify(args) } })
const query = 'Git 恢复版本'
function enqueueWorkflow() {
  queue.push({ body: finish({ role: 'assistant', content: null,
    tool_calls: [tool('search_knowledge', { query }, 'stub-search')] }, 'tool_calls'), delay: 150 })
  queue.push({ body: { data: [{ embedding: mockEmbedding(query) }], usage: { prompt_tokens: 3, total_tokens: 3 } } })
  queue.push({ body: finish({ role: 'assistant', content: null, tool_calls: [tool('save_research_note',
    { title: 'Git 恢复研究', content: '依据安全搜索摘要整理 Git reflog。' }, 'stub-save')] }, 'tool_calls') })
}
async function post(route, cookie, body) {
  const response = await fetch(base + route, { method: 'POST', headers: { Cookie: cookie,
    'Content-Type': 'application/json' }, body: JSON.stringify(body) })
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
  const registration = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `stubp${Date.now()}`, password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const doc = await db.knowledgeDocument.create({ data: { ownerId: me.user.id,
    title: '我的 Git 资料', content: 'Git reflog 可找回旧引用。', status: 'ready' } })
  const literal = vectorLiteral(mockEmbedding(query))
  await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
    VALUES (${doc.id}, 0, 'Git reflog 可找回旧引用。', ${literal}::vector, 'text-embedding-v4', 1024)`
  enqueueWorkflow()
  const normal = await post('/api/agent/runs', cookie, { goal: '搜索我的 Git 恢复资料并提议保存', demo: 'research_workflow' })
  assert.equal(normal.code, 201); assert.equal(normal.data.status, 'waiting_approval')
  assert.deepEqual(sent.map(item => item.path.split('/').at(-1)), ['completions', 'embeddings', 'completions'])
  assert.equal(sent[0].body.tool_choice, 'auto')
  assert.equal(sent[0].body.enable_thinking, false)
  assert.equal(sent[0].body.parallel_tool_calls, false)
  assert.deepEqual(sent[0].body.tools.map(item => item.function.name), ['search_knowledge', 'save_research_note'])
  assert.equal(sent[2].body.messages.at(-1).role, 'tool')
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id, agentActionKey: { not: null } } }), 0)
  const confirmed = await post('/api/agent/confirm', cookie, { approvalToken: normal.data.proposal.approvalToken })
  assert.equal(confirmed.code, 201); assert.equal(confirmed.data.modelCalls, 0)
  assert.equal(sent.length, 3)
  assert.equal((await post('/api/agent/confirm', cookie,
    { approvalToken: normal.data.proposal.approvalToken })).code, 200)
  assert.equal(sent.length, 3)

  const paused = await db.agentRun.create({ data: { ownerId: me.user.id,
    goal: '搜索我的 Git 恢复资料并提议保存', status: 'paused', currentStep: 0 } })
  enqueueWorkflow()
  const resumes = await Promise.all([post(`/api/agent/runs/${paused.id}/resume`, cookie, {}),
    post(`/api/agent/runs/${paused.id}/resume`, cookie, {})])
  assert.deepEqual(resumes.map(item => item.code).sort(), [200, 409])
  assert.equal(resumes.find(item => item.code === 200).data.status, 'waiting_approval')
  assert.equal(sent.length, 6, 'only one resume must start provider work')
  assert.equal(queue.length, 0)
  console.log('PASS: real-mode Provider Stub 2 model + 1 embedding + 1 read tool; confirm 0; concurrent resume starts one provider sequence')
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  stub.close(); await once(stub, 'close')
  await db.$disconnect()
}
