// Explicit paid acceptance only: node --env-file=.env with isolated TEST_DATABASE_URL.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] || '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage3_l6_test')) throw new Error('Isolated Stage 3.6 DB required')
for (const key of ['AI_CHAT_BASE_URL', 'AI_CHAT_API_KEY', 'AI_CHAT_MODEL', 'AI_EMBEDDING_BASE_URL', 'AI_EMBEDDING_API_KEY', 'AI_EMBEDDING_MODEL', 'AI_EMBEDDING_DIMENSION']) if (!process.env[key]) throw new Error(`Missing ${key}`)
assert.equal(process.env.AI_CHAT_MODEL, 'qwen3.7-flash')
assert.equal(process.env.AI_EMBEDDING_MODEL, 'text-embedding-v4')
assert.equal(process.env.AI_EMBEDDING_DIMENSION, '1024')
const port = 32460
const base = `http://127.0.0.1:${port}`
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, AI_PROVIDER_MODE: 'real' }, stdio: 'ignore', windowsHide: true,
})
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `a${Date.now()}${Math.floor(Math.random() * 9999)}`, password: 'TestPassword123!' }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { cookie, id: me.user.id }
}
async function post(cookie, pathname, data) {
  const response = await fetch(base + pathname, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  const body = await response.json()
  return { status: response.status, body }
}
try {
  let ready = false
  for (let i = 0; i < 120; i++) {
    if (app.exitCode !== null) throw new Error('Next server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready, 'Next server starts')
  const alice = await user(), bob = await user()
  const documents = [
    ['Git 学习笔记', 'Git 是分布式版本控制工具。开发者可以用 commit 保存代码版本和修改历史，需要时恢复旧版本。'],
    ['PostgreSQL 学习笔记', 'PostgreSQL 是关系型数据库。它可以持久化结构化数据，并使用 SQL 查询表之间的关系。'],
    ['Cookie 学习笔记', '浏览器 Cookie 可以保存少量状态。Session Cookie 常用于让服务器识别已经登录的浏览器。'],
  ]
  for (const [title, content] of documents) {
    const indexed = await post(alice.cookie, '/api/knowledge/documents', { title, content })
    assert.equal(indexed.status, 201, `Index ${title}: HTTP ${indexed.status}`)
    assert.equal(indexed.body.status, 'ready')
    assert.equal(indexed.body.dimension, 1024)
  }
  const privateDoc = await post(bob.cookie, '/api/knowledge/documents', { title: 'BobSecretTool 私有笔记', content: 'BobSecretTool 用于保存代码版本，与 Git 类似。' })
  assert.equal(privateDoc.status, 201)

  const result = await post(alice.cookie, '/api/knowledge/ask', { question: '什么工具可以帮助我保存代码版本？' })
  assert.equal(result.status, 200)
  assert.equal(result.body.kind, 'real')
  assert.equal(result.body.matches.length, 3)
  assert.equal(result.body.matches[0].title, 'Git 学习笔记')
  assert(result.body.matches.every(item => item.title !== 'BobSecretTool 私有笔记'))
  assert(typeof result.body.answer === 'string' && result.body.answer.trim())
  assert(result.body.answer.includes('Git'))
  assert.equal(result.body.status, 'answered')
  assert(result.body.sources.length >= 1)
  const aliceChunks = await db.knowledgeChunk.findMany({ where: { document: { ownerId: alice.id } }, include: { document: true } })
  const allowed = new Set(aliceChunks.filter(chunk => result.body.matches.some(match => match.title === chunk.document.title && match.position === chunk.position)).map(chunk => `SRC-CHUNK-${chunk.id}`))
  assert(result.body.sources.every(source => allowed.has(source.sourceId)))
  assert(result.body.sources.some(source => source.title === 'Git 学习笔记'))
  assert(result.body.sources.every(source => { const chunk = aliceChunks.find(row => `SRC-CHUNK-${row.id}` === source.sourceId); return chunk && source.title === chunk.document.title && source.position === chunk.position && source.preview === chunk.content.slice(0, 160) }))
  console.log(JSON.stringify({ case: 'answerable', httpStatus: result.status, embeddingModel: 'text-embedding-v4', dimension: 1024,
    queryEmbeddingLatencyMs: result.body.latencyMs.embedding, queryEmbeddingTokens: result.body.usage.embeddingTokens,
    retrievedCount: result.body.matches.length, top1Title: result.body.matches[0].title, top1Position: result.body.matches[0].position,
    top1Similarity: Number(result.body.matches[0].similarity.toFixed(4)), ownerIsolation: true,
    chatModel: 'qwen3.7-flash', chatLatencyMs: result.body.latencyMs.chat, chatTokens: result.body.usage.chatTokens,
    answerStatus: result.body.status, sourceCount: result.body.sources.length, allSourcesInRetrievedSet: true, firstSourceTitle: result.body.sources[0].title,
    answerNonEmpty: true, answerMentionsGit: true, totalLatencyMs: result.body.latencyMs.total }))

  const outside = await post(alice.cookie, '/api/knowledge/ask', { question: '量子计算机的纠错原理是什么？' })
  assert.equal(outside.status, 200)
  const insufficient = outside.body.status === 'insufficient' && outside.body.sources.length === 0
  console.log(JSON.stringify({ case: 'out-of-scope', httpStatus: outside.status, retrievedCount: outside.body.matches.length,
    answerStatus: outside.body.status, sourceCount: outside.body.sources.length, expectedInsufficient: insufficient,
    chatLatencyMs: outside.body.latencyMs.chat, chatTokens: outside.body.usage.chatTokens, totalLatencyMs: outside.body.latencyMs.total }))
} finally {
  app.kill()
  await Promise.race([once(app, 'exit'), delay(3000)])
  await db.$disconnect()
}
