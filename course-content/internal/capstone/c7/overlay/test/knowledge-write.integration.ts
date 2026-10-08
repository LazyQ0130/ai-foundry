import assert from 'node:assert/strict'
import { test, after } from 'node:test'
import { randomBytes } from 'node:crypto'
import { prisma } from '../lib/prisma'
import { proposalForRun, approveKnowledgeAction, editKnowledgeAction, rejectKnowledgeAction, readKnowledgeAction } from '../lib/knowledge-write-service'
import { issueKnowledgeApproval, actionBinding } from '../lib/knowledge-note-approval'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL, 'Isolated test DB required')
process.env.ACTION_APPROVAL_SECRET ??= randomBytes(48).toString('base64url')
process.env.AI_NOTE_MODE = 'mock'
const stamp = Date.now().toString(36)
async function fixture() {
  const user = await prisma.user.create({ data: { username: `c7_it_${stamp}_${Math.random().toString(36).slice(2, 8)}`, passwordHash: 'not-a-login-hash',
    workspace: { create: { name: 'Test workspace' } } }, include: { workspace: true } })
  const task = await prisma.researchTask.create({ data: { workspaceId: user.workspace!.id, title: 'Memory test', query: 'memory' } })
  const report = { answerability: 'grounded', summary: [{ text: 'A limited memory conclusion.', citationKeys: ['key'] }], findings: [], analysis: [], conclusion: [] }
  const run = await prisma.researchRun.create({ data: { taskId: task.id, status: 'COMPLETED', report,
    citations: { create: { position: 1, citationKey: 'key', title: 'Source snapshot', excerpt: 'A limited memory conclusion.' } } } })
  const identity = { userId: user.id, workspaceId: user.workspace!.id }
  const action = await proposalForRun(run.id, identity)
  return { user, task, run, identity, action }
}
test('concurrent approval uses row lock and unique key to return one created and one replayed note', async () => {
  const f = await fixture()
  const results = await Promise.all([approveKnowledgeAction(f.action.id, f.identity, f.action.approvalToken!),
    approveKnowledgeAction(f.action.id, f.identity, f.action.approvalToken!)])
  assert.equal(results[0].note.id, results[1].note.id)
  assert.deepEqual(results.map(row => row.replayed).sort(), [false, true])
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: f.run.id } }), 1)
  assert.equal((await prisma.researchRun.findUniqueOrThrow({ where: { id: f.run.id } })).status, 'COMPLETED')
})
test('exception after note INSERT rolls back note and action, then safe retry executes once', async () => {
  const f = await fixture()
  await assert.rejects(approveKnowledgeAction(f.action.id, f.identity, f.action.approvalToken!, { afterNoteCreate: () => { throw new Error('INJECTED_ROLLBACK') } }), /INJECTED_ROLLBACK/)
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: f.run.id } }), 0)
  assert.equal((await prisma.researchAction.findUniqueOrThrow({ where: { id: f.action.id } })).status, 'PROPOSED')
  const saved = await approveKnowledgeAction(f.action.id, f.identity, f.action.approvalToken!)
  assert.equal(saved.replayed, false)
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: f.run.id } }), 1)
})
test('edit invalidates old token and stale writes; rejected action cannot be executed or edited', async () => {
  const f = await fixture()
  const v2 = await editKnowledgeAction(f.action.id, f.identity, 1, { title: 'Human edit', content: 'Human confirmed content' })
  assert.equal(v2.version, 2)
  await assert.rejects(approveKnowledgeAction(f.action.id, f.identity, f.action.approvalToken!), /INVALID_APPROVAL_TOKEN/)
  await assert.rejects(editKnowledgeAction(f.action.id, f.identity, 1, { title: 'Stale', content: 'Stale' }), /ACTION_CONFLICT/)
  await rejectKnowledgeAction(f.action.id, f.identity, 2)
  await assert.rejects(approveKnowledgeAction(f.action.id, f.identity, v2.approvalToken!), /ACTION_CONFLICT/)
  await assert.rejects(editKnowledgeAction(f.action.id, f.identity, 2, { title: 'Again', content: 'Again' }), /ACTION_CONFLICT/)
  assert.equal(await prisma.knowledgeNote.count({ where: { sourceRunId: f.run.id } }), 0)
})
test('expired signed token rejected under injected clock; proposal failure leaves no half Action or Run mutation', async () => {
  const f = await fixture()
  const action = await prisma.researchAction.findUniqueOrThrow({ where: { id: f.action.id } })
  const token = issueKnowledgeApproval(actionBinding(action, f.identity.userId, f.identity.workspaceId), process.env.ACTION_APPROVAL_SECRET!, () => 1000)
  await assert.rejects(approveKnowledgeAction(action.id, f.identity, token, { now: () => 400000 }), /INVALID_APPROVAL_TOKEN/)
  const task = await prisma.researchTask.create({ data: { workspaceId: f.identity.workspaceId, title: 'failure', query: 'memory' } })
  const run = await prisma.researchRun.create({ data: { taskId: task.id, status: 'COMPLETED', report: f.run.report!,
    citations: { create: { position: 1, citationKey: 'key', title: 'source', excerpt: 'memory' } } } })
  process.env.AI_NOTE_MODE = 'invalid-test-mode'
  try { await assert.rejects(proposalForRun(run.id, f.identity), /PROPOSAL_PROVIDER_FAILED/) }
  finally { process.env.AI_NOTE_MODE = 'mock' }
  assert.equal(await prisma.researchAction.count({ where: { runId: run.id } }), 0)
  const current = await prisma.researchRun.findUniqueOrThrow({ where: { id: run.id } })
  assert.equal(current.status, 'COMPLETED'); assert.deepEqual(current.report, f.run.report)
})
test('concurrent proposal persistence is unique; note survives Run and Task deletion without auto-indexing', async () => {
  const f = await fixture()
  const initialChunks = await prisma.knowledgeChunk.count(), initialDocuments = await prisma.knowledgeDocument.count()
  const anotherRun = await prisma.researchRun.create({ data: { taskId: f.task.id, status: 'COMPLETED', report: f.run.report!,
    citations: { create: { position: 1, citationKey: 'key', title: 'Source', excerpt: 'A limited memory conclusion.' } } } })
  const both = await Promise.all([proposalForRun(anotherRun.id, f.identity), proposalForRun(anotherRun.id, f.identity)])
  assert.equal(both[0].id, both[1].id)
  assert.equal(await prisma.researchAction.count({ where: { runId: anotherRun.id } }), 1)
  const saved = await approveKnowledgeAction(f.action.id, f.identity, f.action.approvalToken!)
  await prisma.researchTask.delete({ where: { id: f.task.id } })
  const note = await prisma.knowledgeNote.findUniqueOrThrow({ where: { id: saved.note.id } })
  assert.equal(note.sourceRunId, null); assert.equal(note.content, saved.note.content)
  assert.equal(await prisma.knowledgeChunk.count(), initialChunks); assert.equal(await prisma.knowledgeDocument.count(), initialDocuments)
  await assert.rejects(readKnowledgeAction(f.action.id, f.identity), /ACTION_NOT_FOUND/)
})
after(async () => { await prisma.$disconnect() })
