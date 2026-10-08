import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL,
  'Use an isolated TEST_DATABASE_URL and set DATABASE_URL to the same URL')
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3120'
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
    originalName: 'memory.txt', mimeType: 'text/plain', byteSize: content.length, objectKey: `c5/${stamp}/${workspaceId}`,
    contentHash: createHash('sha256').update(content).digest('hex'), status: 'READY' } })
  const vector = `[${Array(1024).fill(0).map((_, i) => i === 0 ? 1 : 0).join(',')}]`
  await prisma.$queryRaw`INSERT INTO "KnowledgeChunk" ("documentId","position","page","startOffset","endOffset","content","citationKey",
    "embedding","embeddingModel","embeddingDimension","indexingVersion")
    VALUES (${doc.id},0,NULL,0,${content.length},${content},${`c5-key-${stamp}`},${vector}::vector,'mock-embedding-v1',1024,'chunk-800-120-v1') RETURNING "id"`
  return doc
}

try {
  const alice = await call('/api/auth/register', { method: 'POST', body: { username: `c5_a_${stamp}`, password: 'StrongPass123' } })
  const bob = await call('/api/auth/register', { method: 'POST', body: { username: `c5_b_${stamp}`, password: 'StrongPass123' } })
  assert.equal(alice.status, 201); assert.equal(bob.status, 201)
  const ac = alice.cookie; const bc = bob.cookie
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { ownerId: alice.data.user.id } })
  const noEvidenceTask = await task(ac, 'memory without documents')
  const noEvidence = await run(ac, noEvidenceTask)
  assert.equal(noEvidence.status, 201); assert.equal(noEvidence.data.stopReason, 'INSUFFICIENT_EVIDENCE')
  assert.equal((await detail(ac, noEvidence.data.runId)).data.run.report.answerability, 'insufficient_evidence')

  const doc = await seed(workspace.id)
  const normalTask = await task(ac, 'Compare agent memory persistence and consistency')
  assert.equal((await run(undefined, normalTask)).status, 401)
  assert.equal((await run(bc, normalTask)).status, 404)
  assert.equal((await run(ac, normalTask, { workspaceId: 999, maxSteps: 100 })).status, 400)
  const normal = await run(ac, normalTask)
  assert.equal(normal.status, 201); assert.equal(normal.data.status, 'COMPLETED')
  const shown = await detail(ac, normal.data.runId)
  assert.equal(shown.status, 200)
  assert.equal(shown.data.run.brief.subquestions.length, 2)
  assert.equal(shown.data.run.report.answerability, 'grounded')
  assert.ok(shown.data.citations.length >= 1)
  assert.deepEqual(shown.data.steps.map(item => item.kind), ['BRIEF', 'MODEL', 'TOOL', 'MODEL', 'REPORT'])
  assert.deepEqual(shown.data.steps.map(item => item.position), [1, 2, 3, 4, 5])
  assert.ok(shown.data.steps.every(item => item.status === 'COMPLETED' && item.latencyMs >= 0))
  assert.ok(shown.data.steps.every(item => !JSON.stringify(item).includes('Persistent storage keeps facts')),
    'raw private Evidence must not enter Step timeline')
  assert.equal((await detail(bc, normal.data.runId)).status, 404)
  assert.equal((await detail(undefined, normal.data.runId)).status, 401)
  assert.equal((await call('/api/research/runs', { cookie: bc })).data.runs.length, 0)
  assert.ok((await call('/api/research/runs', { cookie: ac })).data.runs.some(item => item.id === normal.data.runId && item.stepCount === 5))
  assert.equal((await call(`/api/knowledge/documents/${doc.id}/source`, { cookie: bc })).status, 404)

  const legacy = await prisma.researchRun.create({ data: { taskId: normalTask, status: 'COMPLETED', report: { answerability: 'insufficient_evidence',
    summary: [], findings: [], analysis: [], conclusion: [], message: 'Old C4 result' }, completedAt: new Date() } })
  const old = await detail(ac, legacy.id)
  assert.equal(old.status, 200); assert.equal(old.data.run.brief, null); assert.deepEqual(old.data.steps, [])

  for (const [scenario, reason] of [['unknown_tool', 'UNKNOWN_TOOL'], ['bad_args', 'INVALID_TOOL_ARGS'],
    ['multiple_tools', 'MULTIPLE_OR_INVALID_TOOL_CALLS'], ['tool_error', 'TOOL_FAILED'], ['provider_error', 'MODEL_FAILED'],
    ['brief_error', 'BRIEF_FAILED'], ['max_steps', 'MAX_STEPS'], ['max_tools', 'MAX_TOOLS'],
    ['budget_exhausted', 'BUDGET_EXHAUSTED']]) {
    const id = await task(ac, `memory [C5_TEST:${scenario}]`)
    const failed = await run(ac, id)
    assert.equal(failed.status, 502, `${scenario}: ${failed.status}`)
    const record = await detail(ac, failed.data.runId)
    assert.equal(record.data.run.status, 'FAILED')
    assert.equal(record.data.run.stopReason ?? record.data.run.errorCode, reason)
    assert.equal(record.data.run.report, null)
    assert.deepEqual(record.data.citations, [])
    assert.ok(record.data.steps.length >= 1)
  }
  const early = await run(ac, await task(ac, 'memory [C5_TEST:stop_without_evidence]'))
  assert.equal(early.status, 201); assert.equal(early.data.stopReason, 'INSUFFICIENT_EVIDENCE')
  const twice = await run(ac, await task(ac, 'memory [C5_TEST:search_twice]'))
  assert.equal(twice.status, 201)
  const twiceDetail = await detail(ac, twice.data.runId)
  assert.equal(twiceDetail.data.steps.filter(item => item.kind === 'TOOL').length, 2)
  assert.equal(twiceDetail.data.citations.length, 1, 'repeated Evidence is deduplicated')

  const cancelTask = await task(ac, 'memory [C5_TEST:cancel]')
  const pending = run(ac, cancelTask)
  let active
  for (let i = 0; i < 30; i++) {
    const list = await call(`/api/research/tasks/${cancelTask}/runs`, { cookie: ac })
    active = list.data.runs.find(item => item.status === 'RUNNING')
    if (active) break
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  assert.ok(active, 'RUNNING run should be visible while model is delayed')
  assert.equal((await call(`/api/research/runs/${active.id}/cancel`, { method: 'POST', cookie: bc })).status, 404)
  assert.equal((await call(`/api/research/runs/${active.id}/cancel`, { method: 'POST' })).status, 401)
  assert.equal((await call(`/api/research/runs/${active.id}/cancel`, { method: 'POST', cookie: ac })).status, 200)
  await pending
  const cancelled = await detail(ac, active.id)
  assert.equal(cancelled.data.run.status, 'CANCELLED')
  assert.ok(cancelled.data.run.cancelRequestedAt)
  assert.equal(cancelled.data.run.report, null)
  assert.equal(cancelled.data.steps.filter(item => item.kind === 'TOOL').length, 0)
  assert.equal((await call(`/api/research/runs/${active.id}/cancel`, { method: 'POST', cookie: ac })).status, 409)

  console.log('PASS: C5 HTTP brief/steps/report, legacy C4, limits/failures, cancellation, dedup and isolation')
} finally { await prisma.$disconnect() }
