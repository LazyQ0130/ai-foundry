import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL,
  'Use an isolated TEST_DATABASE_URL and set DATABASE_URL to the same URL')
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3132'
const stamp = Date.now().toString(36)
const prisma = new PrismaClient()
async function call(route, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}
async function task(cookie, query) {
  const result = await call('/api/research/tasks', { method: 'POST', cookie, body: { title: 'Memory Research', query } })
  assert.equal(result.status, 201)
  return result.data.task.id
}
const run = (cookie, id, body = {}) => call(`/api/research/tasks/${id}/runs`, { method: 'POST', cookie, body })
const detail = (cookie, id) => call(`/api/research/runs/${id}`, { cookie })
async function seed(workspaceId) {
  const content = 'Agent memory can preserve information between tasks. Persistent storage keeps facts; consistency and cost remain design trade-offs.'
  const doc = await prisma.knowledgeDocument.create({ data: { workspaceId, title: 'Private memory evidence',
    originalName: 'memory.txt', mimeType: 'text/plain', byteSize: content.length, objectKey: `c6/${stamp}/${workspaceId}`,
    contentHash: createHash('sha256').update(content).digest('hex'), status: 'READY' } })
  const vector = `[${Array(1024).fill(0).map((_, i) => i === 0 ? 1 : 0).join(',')}]`
  await prisma.$queryRaw`INSERT INTO "KnowledgeChunk" ("documentId","position","page","startOffset","endOffset","content","citationKey",
    "embedding","embeddingModel","embeddingDimension","indexingVersion")
    VALUES (${doc.id},0,NULL,0,${content.length},${content},${`c6-key-${stamp}`},${vector}::vector,'mock-embedding-v1',1024,'chunk-800-120-v1') RETURNING "id"`
  return doc
}

try {
  const alice = await call('/api/auth/register', { method: 'POST', body: { username: `c6_a_${stamp}`, password: 'StrongPass123' } })
  const bob = await call('/api/auth/register', { method: 'POST', body: { username: `c6_b_${stamp}`, password: 'StrongPass123' } })
  assert.equal(alice.status, 201); assert.equal(bob.status, 201)
  const ac = alice.cookie, bc = bob.cookie
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { ownerId: alice.data.user.id } })
  const emptyId = await task(ac, 'memory metadata_only')
  const empty = await run(ac, emptyId, { sourcePolicy: 'PRIVATE_AND_EXTERNAL' })
  assert.equal(empty.status, 201); assert.equal(empty.data.stopReason, 'INSUFFICIENT_EVIDENCE')
  assert.deepEqual((await detail(ac, empty.data.runId)).data.citations, [])
  const noEvidenceTimeout = await run(ac, await task(ac, 'memory timeout'), { sourcePolicy: 'PRIVATE_AND_EXTERNAL' })
  assert.equal(noEvidenceTimeout.data.stopReason, 'INSUFFICIENT_EVIDENCE')
  await seed(workspace.id)
  const id = await task(ac, 'agent memory persistence')
  const count = async () => (await (await fetch('http://127.0.0.1:3133/test-count')).json()).calls
  const before = await count()
  const privateRun = await run(ac, id)
  assert.equal(privateRun.status, 201)
  assert.equal(await count(), before, 'PRIVATE_ONLY must make zero external calls')
  const privateDetail = await detail(ac, privateRun.data.runId)
  assert.equal(privateDetail.data.run.sourcePolicy, 'PRIVATE_ONLY')
  assert.ok(privateDetail.data.citations.every(item => item.sourceType === 'KNOWLEDGE'))
  const mixed = await run(ac, id, { sourcePolicy: 'PRIVATE_AND_EXTERNAL' })
  assert.equal(mixed.status, 201)
  const shown = await detail(ac, mixed.data.runId)
  assert.deepEqual(shown.data.citations.map(item => item.sourceType), ['KNOWLEDGE', 'CROSSREF'])
  assert.deepEqual(shown.data.citations.map(item => item.position), [1, 2])
  assert.equal(shown.data.citations[1].documentId, null)
  assert.equal(shown.data.citations[1].sourceUrl, 'https://doi.org/10.1234/memory')
  assert.ok(shown.data.steps.some(item => item.inputSummary?.includes('External Research · Crossref · query:')))
  assert.ok(shown.data.steps.some(item => item.outputSummary?.includes('claimEvidence=1')))
  assert.equal((await detail(bc, mixed.data.runId)).status, 404)
  assert.equal((await detail(undefined, mixed.data.runId)).status, 401)
  assert.equal((await run(bc, id, { sourcePolicy: 'PRIVATE_AND_EXTERNAL' })).status, 404)
  assert.equal((await run(undefined, id, { sourcePolicy: 'PRIVATE_AND_EXTERNAL' })).status, 401)
  assert.equal((await call('/api/research/runs', { cookie: bc })).data.runs.length, 0)
  for (const field of ['workspaceId', 'userId', 'ownerId', 'maxSteps', 'maxTools', 'mcpUrl', 'externalHost', 'apiKey'])
    assert.equal((await run(ac, id, { sourcePolicy: 'PRIVATE_AND_EXTERNAL', [field]: 'malicious' })).status, 400)
  for (const [query, errorCode] of [['memory timeout', 'MCP_TIMEOUT'], ['memory rate_limited', 'EXTERNAL_RATE_LIMITED'], ['memory bad_url', 'MCP_INVALID_RESULT']]) {
    const degraded = await run(ac, await task(ac, query), { sourcePolicy: 'PRIVATE_AND_EXTERNAL' })
    assert.equal(degraded.status, 201)
    const record = await detail(ac, degraded.data.runId)
    assert.equal(record.data.run.report.answerability, 'grounded')
    assert.ok(record.data.citations.every(item => item.sourceType === 'KNOWLEDGE'))
    assert.ok(record.data.steps.some(item => item.status === 'FAILED' && item.errorCode === errorCode))
  }
  const snapshot = await prisma.researchCitation.findFirstOrThrow({ where: { runId: mixed.data.runId, sourceType: 'CROSSREF' } })
  assert.equal((await detail(ac, mixed.data.runId)).data.citations[1].excerpt, snapshot.excerpt, 'refresh reads stored snapshot')
  const legacy = await prisma.researchRun.create({ data: { taskId: id, status: 'COMPLETED' } })
  assert.equal((await detail(ac, legacy.id)).data.run.sourcePolicy, 'PRIVATE_ONLY')
  assert.equal((await fetch(base + '/api/mcp/external-research', { method: 'POST', body: '{}' })).status, 403)
  assert.equal((await fetch('http://127.0.0.1:3133/api/mcp/external-research', { method: 'POST', body: '{}' })).status, 401)
  console.log(JSON.stringify({ verdict: 'PASS', mixedRunId: mixed.data.runId, sources: ['KNOWLEDGE','CROSSREF'], tests: 'policy, MCP, snapshots, metadata, degradation, isolation, strict input, legacy' }))
} finally { await prisma.$disconnect() }
