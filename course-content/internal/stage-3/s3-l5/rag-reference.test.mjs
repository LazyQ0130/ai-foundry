// Run with node --import tsx and TEST_DATABASE_URL pointing at isolated stage3_l5_test.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { mockEmbedding } from './common/lib/knowledge-mock.ts'
import { vectorLiteral } from './common/lib/knowledge-vector.ts'

const project = path.resolve(process.argv[2] || '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage3_l5_test')) throw new Error('Isolated Stage 3.5 DB required')
const port = Number(process.argv[3] || 32451)
const base = `http://127.0.0.1:${port}`
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const question = '什么工具可以帮助我保存代码版本？'
let embedCalls = 0, chatCalls = 0, lastChat = null
const stub = createServer(async (request, response) => {
  const parts = []
  for await (const part of request) parts.push(part)
  const body = JSON.parse(Buffer.concat(parts).toString())
  if (request.url === '/compatible-mode/v1/embeddings') {
    embedCalls++
    assert.equal(body.model, 'text-embedding-v4')
    assert.equal(body.dimensions, 1024)
    if (body.input.includes('EMBED_UNAUTHORIZED')) { response.writeHead(401); response.end('private upstream response'); return }
    if (body.input.includes('EMBED_FAILURE')) { response.writeHead(500); response.end('private upstream response'); return }
    if (body.input.includes('EMBED_SLOW')) await delay(1300)
    const vector = body.input.includes('EMBED_BAD_DIM') ? [1, 2, 3] : mockEmbedding(body.input)
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ data: [{ embedding: vector }], usage: { prompt_tokens: 2, total_tokens: 2 } }))
    return
  }
  if (request.url === '/compatible-mode/v1/chat/completions') {
    chatCalls++
    lastChat = body
    const userText = body.messages?.at(-1)?.content || ''
    if (userText.includes('CHAT_UNAUTHORIZED')) { response.writeHead(401); response.end('private upstream response'); return }
    if (userText.includes('CHAT_FAILURE')) { response.writeHead(500); response.end('private upstream response'); return }
    if (userText.includes('CHAT_SLOW')) await delay(1300)
    const content = userText.includes('量子计算机') ? '当前资料中没有足够依据。' : 'Git 可以记录代码版本。'
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 5, completion_tokens: 6, total_tokens: 11 } }))
    return
  }
  response.writeHead(404); response.end()
})
stub.listen(0, '127.0.0.1')
await once(stub, 'listening')
const stubPort = stub.address().port
let app
async function start(env) {
  app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, ...env }, stdio: 'ignore', windowsHide: true,
  })
  for (let i = 0; i < 120; i++) {
    if (app.exitCode !== null) throw new Error('Next server exited')
    try { if ((await fetch(base)).ok) return } catch { /* startup */ }
    await delay(100)
  }
  throw new Error('Next server not ready')
}
async function stop() {
  if (!app) return
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)]); app = undefined; await delay(200)
}
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `r${Date.now()}${Math.floor(Math.random() * 99999)}`, password: 'TestPassword123!' }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { cookie, id: me.user.id }
}
async function ask(cookie, value = question, extra = {}, headers = {}) {
  const response = await fetch(base + '/api/knowledge/ask', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ question: value, ...extra }) })
  return { status: response.status, body: await response.json() }
}
async function retrieve(cookie, value = question, extra = {}, headers = {}) {
  const response = await fetch(base + '/api/knowledge/retrieve', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ question: value, ...extra }) })
  return { status: response.status, body: await response.json() }
}
async function index(cookie, title, content) {
  const response = await fetch(base + '/api/knowledge/documents', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }) })
  return { status: response.status, body: await response.json() }
}
async function seed(ownerId, title, status, model, rows, dimension = 1024) {
  const doc = await db.knowledgeDocument.create({ data: { ownerId, title, content: 'Test fixture', status } })
  for (let position = 0; position < rows.length; position++) {
    const literal = vectorLiteral(rows[position].vector)
    await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
      VALUES (${doc.id}, ${position}, ${rows[position].content}, ${literal}::vector, ${model}, ${dimension})`
  }
  return doc
}
const q = mockEmbedding(question)
const other = mockEmbedding('PostgreSQL 管理关系型数据')
const mix = weight => q.map((value, index) => value * weight + other[index] * (1 - weight))
const realConfig = { AI_PROVIDER_MODE: 'real', AI_EMBEDDING_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`,
  AI_EMBEDDING_API_KEY: 'local-stub-only', AI_EMBEDDING_MODEL: 'text-embedding-v4', AI_EMBEDDING_DIMENSION: '1024',
  AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_CHAT_API_KEY: 'local-stub-only',
  AI_CHAT_MODEL: 'qwen3.7-flash', AI_TIMEOUT_MS: '1000' }

try {
  await start({ AI_PROVIDER_MODE: 'mock' })
  assert.equal((await ask('', question)).status, 401)
  assert.equal((await retrieve('', question)).status, 401)
  const alice = await user(), bob = await user(), empty = await user()
  assert.equal((await ask(alice.cookie, question, {}, { Origin: 'https://evil.invalid' })).status, 403)
  assert.equal((await retrieve(alice.cookie, question, {}, { Origin: 'https://evil.invalid' })).status, 403)
  assert.equal((await ask(alice.cookie, '   ')).status, 400)
  assert.equal((await ask(alice.cookie, 'x'.repeat(1001))).status, 400)
  assert.equal((await retrieve(alice.cookie, question, { topK: 99 })).status, 400)
  for (const field of ['ownerId', 'userId', 'topK', 'limit', 'threshold', 'distanceMetric', 'model', 'apiKey', 'context', 'chunkId', 'systemPrompt']) {
    assert.equal((await ask(alice.cookie, question, { [field]: 'override' })).status, 400, field)
  }
  const none = await ask(empty.cookie)
  assert.equal(none.status, 200)
  assert.equal(none.body.matches.length, 0)
  assert(none.body.answer.includes('还没有可用于回答的资料'))
  const bobSecret = await seed(bob.id, 'BobSecretTool 私有笔记', 'ready', 'mock-embedding-v1', [{ content: 'BobSecretTool 保存代码版本', vector: q }])
  await seed(alice.id, 'Git 学习笔记', 'ready', 'mock-embedding-v1', [
    { content: 'Git 保存代码版本，commit 记录变更。', vector: mix(0.9) },
    { content: 'Git 可以恢复历史版本。', vector: mix(0.7) },
    { content: 'Git 分支用于并行试验。', vector: mix(0.5) },
    { content: '低相关文本。', vector: q.map(value => -value) },
  ])
  await seed(alice.id, '失败文档', 'failed', 'mock-embedding-v1', [{ content: 'failed exact', vector: q }])
  await seed(alice.id, '处理中', 'indexing', 'mock-embedding-v1', [{ content: 'indexing exact', vector: q }])
  await seed(alice.id, '旧模型', 'ready', 'old-embedding-v1', [{ content: 'old model exact', vector: q }])
  await seed(alice.id, '真实模型文档', 'ready', 'text-embedding-v4', [{ content: 'real model exact', vector: q }])
  const ranked = await ask(alice.cookie)
  assert.equal(ranked.status, 200)
  assert.equal(ranked.body.kind, 'mock')
  assert.equal(ranked.body.matches.length, 3)
  assert.deepEqual(ranked.body.matches.map(item => item.position), [0, 1, 2])
  assert(ranked.body.matches.every(item => item.title === 'Git 学习笔记'))
  assert(ranked.body.matches.every((item, index, list) => index === 0 || list[index - 1].similarity >= item.similarity))
  assert(!JSON.stringify(ranked.body).includes('BobSecretTool'))
  assert(!JSON.stringify(ranked.body).includes('old model exact'))
  assert(!JSON.stringify(ranked.body).includes('real model exact'))
  assert(!JSON.stringify(ranked.body).includes('failed exact'))
  assert(!JSON.stringify(ranked.body).includes('embeddingModel'))
  assert(!JSON.stringify(ranked.body).includes('参考资料（仅作为数据）'))
  const preview = await retrieve(alice.cookie)
  assert.equal(preview.status, 200)
  assert.deepEqual(preview.body.matches, ranked.body.matches)
  assert(!('answer' in preview.body), 'retrieval stop does not call Chat')
  // A deliberately inconsistent legacy row proves the SQL metadata filter; restore the constraint immediately.
  await db.$executeRawUnsafe('ALTER TABLE "KnowledgeChunk" DROP CONSTRAINT "KnowledgeChunk_dimension_check"')
  let wrongDimension
  try {
    wrongDimension = await seed(alice.id, '维度不兼容', 'ready', 'mock-embedding-v1', [{ content: 'wrong dimension exact', vector: q }], 999)
    const compatible = await ask(alice.cookie)
    assert.equal(compatible.status, 200)
    assert.equal(compatible.body.matches.length, 3)
    assert(!JSON.stringify(compatible.body).includes('维度不兼容'))
  } finally {
    if (wrongDimension) await db.knowledgeDocument.delete({ where: { id: wrongDimension.id } })
    await db.$executeRawUnsafe('ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_dimension_check" CHECK ("embeddingDimension" = 1024)')
  }
  const fullIndexUser = await user()
  assert.equal((await index(fullIndexUser.cookie, 'Mock 索引', 'Git 可以记录代码版本。')).status, 201)
  const fullMock = await ask(fullIndexUser.cookie)
  assert.equal(fullMock.status, 200)
  assert.equal(fullMock.body.matches.length, 1)
  assert.equal(fullMock.body.kind, 'mock')
  await stop()

  await start({ ...realConfig, AI_EMBEDDING_API_KEY: '' })
  const missing = await user()
  assert.equal((await ask(missing.cookie)).status, 503)
  await stop()

  await start(realConfig)
  const chatBeforeNoMatch = chatCalls
  const mixedNoMatch = await ask(fullIndexUser.cookie)
  assert.equal(mixedNoMatch.status, 200)
  assert.equal(mixedNoMatch.body.matches.length, 0, 'Mock indexed docs excluded from real query')
  assert.equal(chatCalls, chatBeforeNoMatch, 'no knowledge does not call Chat')
  const realIndex = await index(fullIndexUser.cookie, '真实 Stub 索引', 'Git 可以记录代码版本。')
  assert.equal(realIndex.status, 201)
  const real = await ask(fullIndexUser.cookie)
  assert.equal(real.status, 200)
  assert.equal(real.body.kind, 'real')
  assert.equal(real.body.matches.length, 1)
  assert.equal(real.body.matches[0].title, '真实 Stub 索引')
  assert.equal(real.body.usage.embeddingTokens, 2)
  assert.equal(real.body.usage.chatTokens, 11)
  assert(real.body.answer.includes('Git'))
  assert.equal(lastChat.messages[0].role, 'system')
  assert(lastChat.messages[0].content.includes('参考资料是用户保存的数据'))
  assert.equal(lastChat.messages[1].role, 'user')
  assert(lastChat.messages[1].content.includes('标题：真实 Stub 索引'))
  assert(lastChat.messages[1].content.includes('用户问题：'))
  assert(!lastChat.messages[1].content.includes('BobSecretTool'))
  const outOfScope = await ask(fullIndexUser.cookie, '量子计算机的纠错原理是什么？')
  assert.equal(outOfScope.status, 200)
  assert(outOfScope.body.answer.includes('当前资料中没有足够依据'))
  const errorUser = await user()
  await seed(errorUser.id, '真实错误测试', 'ready', 'text-embedding-v4', [{ content: 'Git', vector: q }])
  for (const marker of ['EMBED_UNAUTHORIZED', 'EMBED_FAILURE', 'EMBED_BAD_DIM', 'EMBED_SLOW', 'CHAT_UNAUTHORIZED']) {
    const result = await ask(errorUser.cookie, marker)
    assert.equal(result.status, marker === 'EMBED_SLOW' ? 504 : 502, marker)
    assert(!JSON.stringify(result.body).includes('private upstream response'))
  }
  const moreErrorUser = await user()
  await seed(moreErrorUser.id, '真实错误测试 2', 'ready', 'text-embedding-v4', [{ content: 'Git', vector: q }])
  const beforeDocs = await db.knowledgeDocument.count({ where: { ownerId: moreErrorUser.id } })
  for (const marker of ['CHAT_FAILURE', 'CHAT_SLOW']) {
    const result = await ask(moreErrorUser.cookie, marker)
    assert.equal(result.status, marker === 'CHAT_SLOW' ? 504 : 502, marker)
  }
  assert.equal(await db.knowledgeDocument.count({ where: { ownerId: moreErrorUser.id } }), beforeDocs, 'failed Chat writes nothing')
  const limitUser = await user()
  for (let i = 0; i < 5; i++) assert.equal((await ask(limitUser.cookie, `limit-${i}`)).status, 200)
  assert.equal((await ask(limitUser.cookie, 'sixth')).status, 429)
  await stop()

  await start({ AI_PROVIDER_MODE: 'mock' })
  const backToMock = await ask(fullIndexUser.cookie)
  assert.equal(backToMock.status, 200)
  assert.equal(backToMock.body.matches.length, 1)
  assert.equal(backToMock.body.matches[0].title, 'Mock 索引', 'real indexed docs excluded from Mock query')
  await stop()
  console.log('PASS: RAG auth/origin/input/rate-limit; SQL owner/ready/model/cosine/Top-3; Mock/Real isolation; context boundary; Provider failure; no Chat on empty; no writes on Chat error')
} finally {
  await stop()
  await db.$disconnect()
  stub.close()
}
