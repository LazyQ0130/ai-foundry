import assert from 'node:assert/strict'
import { PrismaClient } from './generated/client/index.js'

if (!process.env.STAGE3_SPIKE_DATABASE_URL?.includes('127.0.0.1:55433/stage3_spike')) throw new Error('Refusing non-isolated database')
const prisma = new PrismaClient({ datasources: { db: { url: process.env.STAGE3_SPIKE_DATABASE_URL } } })
const vector = (first, second = 0) => `[${[first, second, ...Array(1022).fill(0)].join(',')}]`
try {
  const extension = await prisma.$queryRaw`SELECT extversion FROM pg_extension WHERE extname = 'vector'`
  assert.equal(extension.length, 1)
  const alice = await prisma.user.create({ data: { username: `alice-${Date.now()}` } })
  const bob = await prisma.user.create({ data: { username: `bob-${Date.now()}` } })
  async function add(ownerId, title, embedding) {
    const doc = await prisma.knowledgeDocument.create({ data: { ownerId, title, content: title } })
    await prisma.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding") VALUES (${doc.id}, 0, ${title}, ${embedding}::vector)`
    return doc
  }
  const a = await add(alice.id, 'Alice most similar', vector(1))
  await add(alice.id, 'Alice second', vector(0.8, 0.6))
  await add(bob.id, 'Bob private', vector(1))
  await assert.rejects(add(alice.id, 'wrong dimension', '[1,2,3]'), /expected 1024 dimensions/)
  const query = vector(1)
  const hits = await prisma.$queryRaw`
    SELECT c."id", c."documentId", c."position", d."title",
      (1 - (c."embedding" <=> ${query}::vector))::float8 AS similarity
    FROM "KnowledgeChunk" c
    JOIN "KnowledgeDocument" d ON d."id" = c."documentId"
    WHERE d."ownerId" = ${alice.id} AND c."embedding" IS NOT NULL
    ORDER BY c."embedding" <=> ${query}::vector, c."id"
    LIMIT ${2}`
  assert.equal(hits.length, 2)
  assert.equal(hits[0].documentId, a.id)
  assert.equal(hits[0].similarity, 1)
  assert(hits.every(row => row.title.startsWith('Alice')))
  console.log(JSON.stringify({ status: 'pass', pgvector: extension[0].extversion, dimension: 1024, topK: hits.length, ownerIsolation: true, invalidDimensionRejected: true }))
} finally {
  await prisma.$disconnect()
}
