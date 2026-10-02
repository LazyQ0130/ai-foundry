// Isolated local PostgreSQL acceptance: TEST_DATABASE_URL must name stage4_l2.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { mockEmbedding } from '../../stage-3/s3-l7/common/lib/knowledge-mock.ts'
import { vectorLiteral } from '../../stage-3/s3-l7/common/lib/knowledge-vector.ts'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l2'))
  throw new Error('Use a built Reference and the isolated local stage4_l2 database')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32372), base = `http://127.0.0.1:${port}`
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, AI_PROVIDER_MODE: 'mock' },
  stdio: 'ignore', windowsHide: true,
})

async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `k${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie')?.split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { cookie, id: me.user.id }
}
async function seed(ownerId, title, content, vector) {
  const doc = await db.knowledgeDocument.create({ data: { ownerId, title, content, status: 'ready' } })
  const literal = vectorLiteral(vector)
  await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
    VALUES (${doc.id}, 0, ${content}, ${literal}::vector, 'mock-embedding-v1', 1024)`
  return doc
}
async function run(cookie, goal, demo = 'knowledge_search', extra = {}) {
  const response = await fetch(base + '/api/agent/run', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, demo, ...extra }) })
  return { status: response.status, body: await response.json() }
}

try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready, 'Reference server did not start')
  const alice = await user(), bob = await user(), empty = await user()
  const goal = 'Git 恢复版本'
  const exact = mockEmbedding(goal), unrelated = mockEmbedding('PostgreSQL 数据库建模')
  const aliceVector = exact.map((value, index) => value * 0.84 + unrelated[index] * 0.16)
  const aliceContent = 'Git restore 可恢复工作区文件；reflog 能查找历史引用。'
  const aliceDoc = await seed(alice.id, 'Alice 可见 Git 资料', aliceContent, aliceVector)
  const bobDoc = await seed(bob.id, 'BobSecret 高相似私有标题', 'BobSecret Git reset restore reflog 恢复版本完整说明', exact)
  await seed(alice.id, 'Alice 第二篇资料', 'Git 分支与版本恢复的课堂摘要。',
    exact.map((value, index) => value * 0.7 + unrelated[index] * 0.3))
  await seed(alice.id, 'Alice 第三篇资料', 'Git 提交历史可用于查找旧版本。',
    exact.map((value, index) => value * 0.55 + unrelated[index] * 0.45))
  await seed(bob.id, 'BobSecret 第二篇', 'BobSecret 更接近查询的完整说明', exact)
  await seed(bob.id, 'BobSecret 第三篇', 'BobSecret 再一篇精确匹配资料', exact)
  assert(bobDoc.id !== aliceDoc.id)

  const searched = await run(alice.cookie, goal)
  assert.equal(searched.status, 200); assert.equal(searched.body.status, 'completed')
  assert.equal(searched.body.modelCalls, 2); assert.equal(searched.body.embeddingCalls, 1)
  assert.equal(searched.body.toolCalls, 1); assert.equal(searched.body.providerUnits, 0)
  assert.equal(searched.body.searchMatches.length, 3)
  assert(searched.body.searchMatches.every(match => match.title.startsWith('Alice ')))
  assert(searched.body.searchMatches.some(match => match.title === 'Alice 可见 Git 资料'))
  assert.deepEqual(Object.keys(searched.body.searchMatches[0]).sort(), ['position', 'preview', 'similarity', 'title'])
  assert(searched.body.searchMatches[0].preview.length <= 160)
  assert.notEqual(searched.body.searchMatches[0].preview, aliceContent)
  assert(!JSON.stringify(searched.body).includes('BobSecret'))
  const bobResult = await run(bob.cookie, goal)
  assert.equal(bobResult.body.searchMatches.length, 3)
  assert(bobResult.body.searchMatches.every(match => match.title.startsWith('BobSecret ')))
  assert(bobResult.body.searchMatches[0].similarity > searched.body.searchMatches[0].similarity,
    'Bob fixture must rank above Alice if the SQL owner filter were missing')

  const none = await run(empty.cookie, goal)
  assert.equal(none.status, 200); assert.equal(none.body.status, 'completed')
  assert.deepEqual(none.body.searchMatches, [])
  for (const field of ['ownerId', 'userId']) assert.equal((await run(alice.cookie, goal, 'knowledge_search', { [field]: bob.id })).status, 400)
  const spoof = await run(alice.cookie, goal, 'knowledge_owner_spoof')
  assert.equal(spoof.body.status, 'failed'); assert.equal(spoof.body.toolCalls, 0); assert.equal(spoof.body.embeddingCalls, 0)
  const a = await run(alice.cookie, goal, 'budget_exhausted')
  assert.equal(a.body.status, 'budget_exhausted'); assert.equal(a.body.modelCalls, 0); assert.equal(a.body.embeddingCalls, 0)
  const b = await run(alice.cookie, goal, 'knowledge_budget_embedding')
  assert.equal(b.body.status, 'budget_exhausted'); assert.equal(b.body.modelCalls, 1)
  assert.equal(b.body.embeddingCalls, 0); assert.equal(b.body.toolCalls, 0)
  const c = await run(empty.cookie, goal, 'knowledge_budget_final')
  assert.equal(c.body.status, 'budget_exhausted'); assert.equal(c.body.modelCalls, 1)
  assert.equal(c.body.embeddingCalls, 1); assert.equal(c.body.toolCalls, 1)
  console.log('PASS: 4.2 Mock Route, exact Bob-nearest exclusion before Top-K, empty matches, identity spoof, budget A/B/C')
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  await db.$disconnect()
}
