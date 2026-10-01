import 'dotenv/config'
import assert from 'node:assert/strict'
import { createRealProvider } from './provider.mjs'
import { PrismaClient } from './generated/client/index.js'

const databaseUrl = process.env.STAGE3_SPIKE_DATABASE_URL
if (!databaseUrl) {
  console.error(JSON.stringify({ status: 'blocked', reason: 'STAGE3_SPIKE_DATABASE_URL_MISSING' }))
  process.exit(2)
}
const parsedUrl = new URL(databaseUrl)
if (parsedUrl.hostname !== '127.0.0.1' || parsedUrl.port !== '55433' || parsedUrl.pathname !== '/stage3_spike') {
  throw new Error('Refusing database outside the isolated local spike container')
}
for (const name of ['AI_EMBEDDING_BASE_URL', 'AI_EMBEDDING_API_KEY', 'AI_EMBEDDING_MODEL', 'AI_EMBEDDING_DIMENSION']) {
  if (!process.env[name]) {
    console.error(JSON.stringify({ status: 'blocked', reason: 'CONFIG_MISSING', variableName: name }))
    process.exit(2)
  }
}
assert.equal(process.env.AI_EMBEDDING_MODEL, 'text-embedding-v4')
assert.equal(process.env.AI_EMBEDDING_DIMENSION, '1024')

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
const provider = createRealProvider()
const texts = [
  'PostgreSQL 是关系型数据库。',
  'Git 用于版本管理，可以保存代码历史版本。',
  'Cookie 用于保存浏览器状态。',
]
const question = '什么工具可以保存代码版本？'
const asVector = values => `[${values.join(',')}]`
try {
  const started = Date.now()
  const owner = await prisma.user.create({ data: { username: `real-spike-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } })
  let gitVector
  let embeddingTotalTokens = 0
  for (let position = 0; position < texts.length; position++) {
    const content = texts[position]
    const embedded = await provider.embed(content)
    assert.equal(embedded.vector.length, 1024)
    embeddingTotalTokens += embedded.usage?.total_tokens ?? 0
    if (position === 1) gitVector = asVector(embedded.vector)
    const document = await prisma.knowledgeDocument.create({ data: { ownerId: owner.id, title: `验收文档 ${position + 1}`, content } })
    await prisma.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding") VALUES (${document.id}, 0, ${content}, ${asVector(embedded.vector)}::vector)`
  }
  const otherOwner = await prisma.user.create({ data: { username: `other-spike-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` } })
  const privateDocument = await prisma.knowledgeDocument.create({ data: { ownerId: otherOwner.id, title: '其他用户文档', content: 'Git 用于版本管理。' } })
  await prisma.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding") VALUES (${privateDocument.id}, 0, 'Git 用于版本管理。', ${gitVector}::vector)`
  const queryEmbedding = await provider.embed(question)
  embeddingTotalTokens += queryEmbedding.usage?.total_tokens ?? 0
  const query = asVector(queryEmbedding.vector)
  const hits = await prisma.$queryRaw`
    SELECT c."content", d."ownerId", (1 - (c."embedding" <=> ${query}::vector))::float8 AS similarity
    FROM "KnowledgeChunk" c
    JOIN "KnowledgeDocument" d ON d."id" = c."documentId"
    WHERE d."ownerId" = ${owner.id}
    ORDER BY c."embedding" <=> ${query}::vector, c."id"
    LIMIT ${3}`
  assert.equal(hits.length, 3)
  assert(hits.every(row => Number.isFinite(row.similarity)))
  assert(hits.every(row => row.ownerId === owner.id))
  assert.equal(hits[0].content, texts[1], 'Expected Git text to rank first')
  console.log(JSON.stringify({ status: 'pass', embeddingModel: process.env.AI_EMBEDDING_MODEL, dimension: 1024, documents: 3, topK: 3, topResult: 'Git', ownerIsolation: true, latencyMs: Date.now() - started, embeddingTotalTokens }))
} catch (error) {
  console.error(JSON.stringify({ status: 'failed', error: error?.code || 'TOPK_ACCEPTANCE_FAILED' }))
  process.exitCode = 1
} finally { await prisma.$disconnect() }
