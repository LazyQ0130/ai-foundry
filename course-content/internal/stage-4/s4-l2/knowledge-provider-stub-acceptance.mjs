// Local HTTP Chat + Embedding stub through the built Next Route; no cloud calls.
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
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l2'))
  throw new Error('Use a built Reference and isolated local stage4_l2 database')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const appPort = Number(process.argv[3] ?? 32373), base = `http://127.0.0.1:${appPort}`
const queue = [], sent = []
const stub = createServer(async (request, response) => {
  let raw = ''; for await (const chunk of request) raw += chunk
  const item = { path: request.url, body: JSON.parse(raw) }
  sent.push(item)
  const next = queue.shift()
  if (!next) { response.writeHead(500); response.end(); return }
  assert.equal(item.path.endsWith(next.path), true)
  if (next.delay) await new Promise(resolve => setTimeout(resolve, next.delay))
  if (response.destroyed) return
  response.writeHead(next.status ?? 200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(next.body ?? next))
})
stub.listen(0, '127.0.0.1'); await once(stub, 'listening')
const stubPort = stub.address().port
const stubKey = randomBytes(18).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(appPort)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, AI_PROVIDER_MODE: 'real',
    AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_CHAT_API_KEY: stubKey,
    AI_CHAT_MODEL: 'qwen3.7-flash', AI_CHAT_DISABLE_THINKING: '1',
    AI_EMBEDDING_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_EMBEDDING_API_KEY: stubKey,
    AI_EMBEDDING_MODEL: 'text-embedding-v4', AI_EMBEDDING_DIMENSION: '1024', AI_TIMEOUT_MS: '1000' },
  stdio: 'ignore', windowsHide: true,
})
const finish = (message, reason = 'stop') => ({ choices: [{ message, finish_reason: reason }],
  usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } })
const call = args => ({ id: 'search-stub-1', type: 'function', function: { name: 'search_knowledge', arguments: args } })
const chat = body => ({ path: '/chat/completions', body })
const embed = body => ({ path: '/embeddings', body })
const toolResponse = args => chat(finish({ role: 'assistant', content: null, tool_calls: [call(args)] }, 'tool_calls'))
const embeddingResponse = goal => embed({ data: [{ embedding: mockEmbedding(goal) }], usage: { prompt_tokens: 3, total_tokens: 3 } })
const finalResponse = () => chat(finish({ role: 'assistant', content: '根据安全摘要回答' }))

try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(ready)
  async function user() {
    const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `stubk${Date.now()}${Math.floor(Math.random() * 99999)}`,
        password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
    assert.equal(response.status, 201)
    const cookie = response.headers.get('set-cookie').split(';')[0]
    const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
    return { cookie, id: me.user.id }
  }
  async function seed(ownerId, goal) {
    const doc = await db.knowledgeDocument.create({ data: { ownerId, title: 'Alice 真实模式测试资料', content: 'Git 版本恢复', status: 'ready' } })
    const literal = vectorLiteral(mockEmbedding(goal))
    await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
      VALUES (${doc.id}, 0, 'Git restore 可以恢复文件。', ${literal}::vector, 'text-embedding-v4', 1024)`
  }
  async function run(cookie, goal, responses, extra = {}) {
    queue.push(...responses)
    const before = sent.length
    const response = await fetch(base + '/api/agent/run', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, demo: 'knowledge_search', ...extra }) })
    return { status: response.status, result: await response.json(), requests: sent.slice(before) }
  }
  const goal = 'Git 恢复版本', alice = await user()
  await seed(alice.id, goal)
  const full = await run(alice.cookie, goal, [toolResponse(JSON.stringify({ query: goal })), embeddingResponse(goal), finalResponse()])
  assert.equal(full.status, 200); assert.equal(full.result.status, 'completed')
  assert.equal(full.result.modelCalls, 2); assert.equal(full.result.embeddingCalls, 1)
  assert.equal(full.result.toolCalls, 1); assert.equal(full.result.providerUnits, 3)
  assert.deepEqual(full.result.finishReasons, ['tool_calls', 'stop'])
  assert.deepEqual(full.requests.map(item => item.path.split('/').at(-1)), ['completions', 'embeddings', 'completions'])
  const first = full.requests[0].body, last = full.requests[2].body
  assert.equal(first.tool_choice, 'auto'); assert.equal(first.parallel_tool_calls, false); assert.equal(first.enable_thinking, false)
  assert.deepEqual(Object.keys(first.tools.find(item => item.function.name === 'search_knowledge').function.parameters.properties), ['query'])
  assert.equal(last.messages.at(-1).role, 'tool')
  assert.deepEqual(Object.keys(JSON.parse(last.messages.at(-1).content).matches[0]).sort(), ['position', 'preview', 'similarity', 'title'])
  assert(!JSON.stringify(last).includes('ownerId'))

  const invalid = await run((await user()).cookie, goal, [toolResponse('{"query":"Git","ownerId":2}')])
  assert.equal(invalid.result.status, 'failed'); assert.equal(invalid.result.error, 'INVALID_ARGUMENT_SCHEMA')
  assert.equal(invalid.requests.length, 1); assert.equal(invalid.result.embeddingCalls, 0)
  const badJson = await run((await user()).cookie, goal, [toolResponse('{')])
  assert.equal(badJson.result.error, 'INVALID_ARGUMENT_JSON'); assert.equal(badJson.requests.length, 1)
  const unauthorized = await run((await user()).cookie, goal,
    [toolResponse(JSON.stringify({ query: goal })), { path: '/embeddings', status: 401, body: { error: 'private upstream response' } }])
  assert.equal(unauthorized.result.status, 'failed'); assert.equal(unauthorized.result.error, 'UNAUTHORIZED')
  assert.equal(unauthorized.requests.length, 2); assert.equal(unauthorized.result.providerUnits, 2)
  assert(!JSON.stringify(unauthorized.result).includes('private upstream response'))
  const timeout = await run((await user()).cookie, goal,
    [toolResponse(JSON.stringify({ query: goal })), { ...embeddingResponse(goal), delay: 1300 }])
  assert.equal(timeout.result.status, 'failed'); assert.equal(timeout.result.error, 'TIMEOUT')
  assert.equal(timeout.requests.length, 2)
  assert.equal((await run(alice.cookie, goal, [], { ownerId: 2 })).status, 400)
  assert.equal(queue.length, 0)
  console.log('PASS: 4.2 local Provider Stub, model/embedding/model 3-unit roundtrip, strict args, 401, timeout, browser spoof')
} finally {
  app.kill(); stub.closeAllConnections(); stub.close(); await db.$disconnect()
}
