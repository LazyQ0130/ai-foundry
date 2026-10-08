import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL,
  'Use an isolated TEST_DATABASE_URL and set DATABASE_URL to the same URL')
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3140'
const stamp = Date.now().toString(36)
const prisma = new PrismaClient()
async function call(route, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json().catch(() => ({})) }
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
    originalName: 'memory.txt', mimeType: 'text/plain', byteSize: content.length, objectKey: `c7/${stamp}/${workspaceId}`,
    contentHash: createHash('sha256').update(content).digest('hex'), status: 'READY' } })
  const vector = `[${Array(1024).fill(0).map((_, i) => i === 0 ? 1 : 0).join(',')}]`
  await prisma.$queryRaw`INSERT INTO "KnowledgeChunk" ("documentId","position","page","startOffset","endOffset","content","citationKey",
    "embedding","embeddingModel","embeddingDimension","indexingVersion")
    VALUES (${doc.id},0,NULL,0,${content.length},${content},${`c7-key-${stamp}`},${vector}::vector,'mock-embedding-v1',1024,'chunk-800-120-v1') RETURNING "id"`
  return doc
}

const proposal = (cookie, runId, body = {}) => call(`/api/research/runs/${runId}/knowledge-note-proposal`, { method: 'POST', cookie, body })
const actionDetail = (cookie, id) => call(`/api/research/actions/${id}`, { cookie })
const edit = (cookie, action, body) => call(`/api/research/actions/${action.id}`, { method: 'PATCH', cookie, body })
const approve = (cookie, action, body = { approvalToken: action.approvalToken }) => call(`/api/research/actions/${action.id}/approve`, { method: 'POST', cookie, body })
const reject = (cookie, action) => call(`/api/research/actions/${action.id}/reject`, { method: 'POST', cookie, body: { expectedVersion: action.version } })
try {
  const alice = await call('/api/auth/register', { method: 'POST', body: { username: `c7_a_${stamp}`, password: 'StrongPass123' } })
  const bob = await call('/api/auth/register', { method: 'POST', body: { username: `c7_b_${stamp}`, password: 'StrongPass123' } })
  assert.equal(alice.status, 201); assert.equal(bob.status, 201)
  const ac = alice.cookie, bc = bob.cookie
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { ownerId: alice.data.user.id } })
  await seed(workspace.id)
  const taskId = await task(ac, 'Compare agent memory persistence')
  const completed = await run(ac, taskId)
  assert.equal(completed.status, 201); assert.equal(completed.data.status, 'COMPLETED')
  const runId = completed.data.runId
  const before = await prisma.knowledgeNote.count()
  assert.equal((await call('/api/knowledge/notes', { method: 'POST', cookie: ac, body: { title: 'Bypass', content: 'Bypass' } })).status, 405)
  assert.equal((await proposal(undefined, runId)).status, 401)
  assert.equal((await proposal(bc, runId)).status, 404)
  assert.equal((await proposal(ac, runId, { report: 'forged' })).status, 400)
  const generated = await proposal(ac, runId)
  assert.equal(generated.status, 200)
  const v1 = generated.data.action
  assert.equal(v1.status, 'PROPOSED'); assert.equal(v1.version, 1); assert.ok(v1.approvalToken)
  assert.equal(await prisma.knowledgeNote.count(), before, 'proposal must not write a Note')
  assert.equal((await proposal(ac, runId)).data.action.id, v1.id, 'one persisted Action per Run')
  assert.equal((await actionDetail(ac, v1.id)).data.action.title, v1.title)
  assert.equal((await actionDetail(bc, v1.id)).status, 404)
  assert.equal((await actionDetail(undefined, v1.id)).status, 401)
  for (const field of ['workspaceId', 'userId', 'ownerId', 'runId', 'toolName'])
    assert.equal((await edit(ac, v1, { title: 'Human', content: 'Human edit', expectedVersion: 1, [field]: 999 })).status, 400)
  assert.equal((await edit(bc, v1, { title: 'Bob', content: 'Bob', expectedVersion: 1 })).status, 404)
  assert.equal((await reject(bc, v1)).status, 404)
  assert.equal((await approve(bc, v1)).status, 404)
  assert.equal((await approve(undefined, v1)).status, 401)
  const changed = await edit(ac, v1, { title: 'Human confirmed memory note', content: 'Human edit: evaluate memory persistence trade-offs in this context.', expectedVersion: 1 })
  assert.equal(changed.status, 200)
  const v2 = changed.data.action
  assert.equal(v2.version, 2)
  assert.equal((await approve(ac, v1)).status, 403, 'old token invalid after edit')
  assert.equal((await edit(ac, v1, { title: 'Stale', content: 'Stale', expectedVersion: 1 })).status, 409)
  assert.equal((await approve(ac, v2, { approvalToken: v2.approvalToken, title: 'Injected', content: 'Injected' })).status, 400)
  assert.equal((await approve(ac, v2, { approvalToken: v2.approvalToken + 'x' })).status, 403)
  // Test-only signer makes an expired valid signature; not a production route or clock override.
  const [encoded] = v2.approvalToken.split('.')
  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
  payload.expiresAt = Date.now() - 1
  const expiredPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const expired = `${expiredPayload}.${createHmac('sha256', process.env.ACTION_APPROVAL_SECRET).update(expiredPayload).digest('base64url')}`
  assert.equal((await approve(ac, v2, { approvalToken: expired })).status, 403)
  const crossOrigin = await fetch(`${base}/api/research/actions/${v2.id}/approve`, { method: 'POST', headers: { cookie: ac, origin: 'https://evil.invalid', 'content-type': 'application/json' }, body: JSON.stringify({ approvalToken: v2.approvalToken }) })
  assert.equal(crossOrigin.status, 403)
  const first = await approve(ac, v2), replay = await approve(ac, v2)
  assert.equal(first.status, 200); assert.equal(replay.status, 200)
  assert.equal(first.data.replayed, false); assert.equal(replay.data.replayed, true)
  assert.equal(first.data.note.id, replay.data.note.id)
  const note = await call(`/api/knowledge/notes/${first.data.note.id}`, { cookie: ac })
  assert.equal(note.status, 200); assert.equal(note.data.note.title, v2.title); assert.equal(note.data.note.content, v2.content)
  assert.equal(note.data.note.sourceRunId, runId)
  assert.equal((await detail(ac, runId)).data.run.status, 'COMPLETED')
  assert.equal((await call(`/api/knowledge/notes/${first.data.note.id}`, { cookie: bc })).status, 404)
  assert.equal((await call(`/api/knowledge/notes/${first.data.note.id}`)).status, 401)
  assert.equal((await call('/api/knowledge/notes', { cookie: bc })).data.notes.length, 0)
  assert.equal((await call('/api/knowledge/notes')).status, 401)
  assert.ok((await call('/api/knowledge/notes', { cookie: ac })).data.notes.some(item => item.id === first.data.note.id))
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: runId } }), 1)
  const executed = (await actionDetail(ac, v1.id)).data.action
  assert.equal(executed.status, 'EXECUTED'); assert.equal(executed.approvalToken, undefined)
  assert.equal((await reject(ac, executed)).status, 409)
  const run2 = await run(ac, await task(ac, 'memory second report'))
  const action2 = (await proposal(ac, run2.data.runId)).data.action
  assert.equal((await approve(ac, action2, { approvalToken: v2.approvalToken })).status, 403, 'wrong Action/Run binding')
  const concurrent = await Promise.all([approve(ac, action2), approve(ac, action2)])
  assert.ok(concurrent.every(item => item.status === 200))
  assert.equal(concurrent[0].data.note.id, concurrent[1].data.note.id)
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: run2.data.runId } }), 1)
  const run3 = await run(ac, await task(ac, 'memory reject report'))
  const action3 = (await proposal(ac, run3.data.runId)).data.action
  assert.equal((await reject(ac, action3)).data.action.status, 'REJECTED')
  assert.equal((await approve(ac, action3)).status, 409)
  assert.equal((await edit(ac, action3, { title: 'Again', content: 'Again', expectedVersion: 1 })).status, 409)
  assert.equal((await proposal(ac, run3.data.runId)).data.action.id, action3.id)
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: run3.data.runId } }), 0)
  assert.equal((await detail(ac, run3.data.runId)).data.run.status, 'COMPLETED')
  for (const status of ['FAILED', 'CANCELLED', 'RUNNING']) {
    const bad = await prisma.researchRun.create({ data: { taskId, status } })
    assert.equal((await proposal(ac, bad.id)).status, 409)
  }
  const insufficient = await prisma.researchRun.create({ data: { taskId, status: 'COMPLETED', report: { answerability: 'insufficient_evidence', summary: [], findings: [], analysis: [], conclusion: [], message: 'Not enough' } } })
  const noReport = await prisma.researchRun.create({ data: { taskId, status: 'COMPLETED' } })
  for (const id of [insufficient.id, noReport.id]) assert.equal((await proposal(ac, id)).status, 409)
  const staleReport = await prisma.researchRun.create({ data: { taskId, status: 'COMPLETED', report: { answerability: 'grounded', summary: [{ text: 'Forged', citationKeys: ['missing'] }], findings: [], analysis: [], conclusion: [] } } })
  assert.equal((await proposal(ac, staleReport.id)).status, 409)
  console.log(JSON.stringify({ verdict: 'PASS', runId, actionVersion: v2.version, noteCount: 1, replayed: replay.data.replayed,
    checks: 'proposal/edit/exact approve/reject/concurrent/expired/tampered/wrong binding/isolation/strict input/source link' }))
} finally { await prisma.$disconnect() }
