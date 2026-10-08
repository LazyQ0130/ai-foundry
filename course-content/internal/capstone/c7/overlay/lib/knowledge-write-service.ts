import { randomUUID } from 'node:crypto'
import type { Prisma, ResearchAction } from '@prisma/client'
import { prisma } from './prisma'
import { groundedReportSchema, MAX_REPORT_CLAIMS } from './grounded-report'
import { generateKnowledgeNoteProposal, type NoteSource } from './knowledge-note-provider'
import { canonicalizeKnowledgeNoteArgs, parseCanonicalArgs, knowledgeActionKey } from './knowledge-note-contract'
import { actionBinding, issueKnowledgeApproval, verifyKnowledgeApproval, assertApprovalConfigured } from './knowledge-note-approval'

export class KnowledgeWriteError extends Error {
  constructor(public code: string, public status = 409) { super(code) }
}
export type WriteIdentity = { userId: number; workspaceId: number }
const actionOwned = (id: string, identity: WriteIdentity) => ({ id, run: { task: { workspaceId: identity.workspaceId,
  workspace: { ownerId: identity.userId } } } })
export const publicNoteSelect = { id: true, title: true, content: true, sourceRunId: true, createdAt: true, updatedAt: true } as const

function validatedReport(run: { status: string; report: unknown }, citations: NoteSource[]) {
  if (run.status !== 'COMPLETED') throw new KnowledgeWriteError('RUN_NOT_ELIGIBLE')
  const parsed = groundedReportSchema.safeParse(run.report)
  if (!parsed.success || parsed.data.answerability !== 'grounded') throw new KnowledgeWriteError('RUN_NOT_ELIGIBLE')
  const claims = [...parsed.data.summary, ...parsed.data.findings, ...parsed.data.analysis, ...parsed.data.conclusion]
  const allowed = new Set(citations.map(item => item.citationKey))
  if (!claims.length || claims.length > MAX_REPORT_CLAIMS || claims.some(item => item.citationKeys.some(key => !allowed.has(key))))
    throw new KnowledgeWriteError('RUN_NOT_ELIGIBLE')
  return parsed.data
}
function assertActionState(action: ResearchAction) {
  parseCanonicalArgs(action.canonicalArgs)
  if (action.toolName !== 'SAVE_KNOWLEDGE_NOTE' || action.idempotencyKey !== knowledgeActionKey(action.runId, action.id, action.version, action.canonicalArgs))
    throw new KnowledgeWriteError('INVALID_ACTION_STATE')
}
export async function actionView(action: ResearchAction, identity: WriteIdentity) {
  assertActionState(action)
  const note = action.status === 'EXECUTED' ? await prisma.knowledgeNote.findFirst({
    where: { sourceActionKey: action.idempotencyKey, workspaceId: identity.workspaceId }, select: publicNoteSelect }) : null
  return { id: action.id, runId: action.runId, toolName: action.toolName, version: action.version,
    status: action.status, ...parseCanonicalArgs(action.canonicalArgs), createdAt: action.createdAt,
    updatedAt: action.updatedAt, decidedAt: action.decidedAt, executedAt: action.executedAt, note,
    ...(action.status === 'PROPOSED' ? { approvalToken: issueKnowledgeApproval(actionBinding(action, identity.userId, identity.workspaceId),
      process.env.ACTION_APPROVAL_SECRET ?? '') } : {}) }
}
export async function readKnowledgeAction(actionId: string, identity: WriteIdentity) {
  const action = await prisma.researchAction.findFirst({ where: actionOwned(actionId, identity) })
  if (!action) throw new KnowledgeWriteError('ACTION_NOT_FOUND', 404)
  return actionView(action, identity)
}
export async function proposalForRun(runId: number, identity: WriteIdentity) {
  const run = await prisma.researchRun.findFirst({ where: { id: runId, task: { workspaceId: identity.workspaceId,
    workspace: { ownerId: identity.userId } } }, include: { action: true, citations: { orderBy: { position: 'asc' } } } })
  if (!run) throw new KnowledgeWriteError('RUN_NOT_FOUND', 404)
  const report = validatedReport(run, run.citations)
  if (run.action) return actionView(run.action, identity)
  // Fail closed before spending Provider work if approval cannot be configured.
  assertApprovalConfigured(process.env.ACTION_APPROVAL_SECRET ?? '')
  let canonicalArgs: string
  try { canonicalArgs = canonicalizeKnowledgeNoteArgs(await generateKnowledgeNoteProposal(report, run.citations, AbortSignal.timeout(30_000))) }
  catch { throw new KnowledgeWriteError('PROPOSAL_PROVIDER_FAILED', 502) }
  const action = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "ResearchRun" WHERE "id" = ${runId} FOR UPDATE`
    const current = await tx.researchRun.findFirst({ where: { id: runId, task: { workspaceId: identity.workspaceId,
      workspace: { ownerId: identity.userId } } }, include: { action: true, citations: true } })
    if (!current) throw new KnowledgeWriteError('RUN_NOT_FOUND', 404)
    validatedReport(current, current.citations)
    if (current.action) return current.action
    if (JSON.stringify(current.report) !== JSON.stringify(run.report)) throw new KnowledgeWriteError('REPORT_CHANGED')
    const id = randomUUID()
    return tx.researchAction.create({ data: { id, runId, canonicalArgs, version: 1,
      idempotencyKey: knowledgeActionKey(runId, id, 1, canonicalArgs) } })
  })
  return actionView(action, identity)
}
async function lockOwnedAction(tx: Prisma.TransactionClient, actionId: string, identity: WriteIdentity) {
  await tx.$queryRaw`SELECT "id" FROM "ResearchAction" WHERE "id" = ${actionId} FOR UPDATE`
  const action = await tx.researchAction.findFirst({ where: actionOwned(actionId, identity), include: { run: { select: { status: true } } } })
  if (!action) throw new KnowledgeWriteError('ACTION_NOT_FOUND', 404)
  assertActionState(action)
  if (action.run.status !== 'COMPLETED') throw new KnowledgeWriteError('RUN_NOT_ELIGIBLE')
  return action
}
export async function editKnowledgeAction(actionId: string, identity: WriteIdentity, expectedVersion: number, args: unknown) {
  const canonicalArgs = canonicalizeKnowledgeNoteArgs(args)
  const action = await prisma.$transaction(async tx => {
    const current = await lockOwnedAction(tx, actionId, identity)
    if (current.status !== 'PROPOSED' || current.version !== expectedVersion) throw new KnowledgeWriteError('ACTION_CONFLICT')
    const version = current.version + 1
    return tx.researchAction.update({ where: { id: actionId }, data: { canonicalArgs, version,
      idempotencyKey: knowledgeActionKey(current.runId, actionId, version, canonicalArgs) } })
  })
  return actionView(action, identity)
}
export async function rejectKnowledgeAction(actionId: string, identity: WriteIdentity, expectedVersion: number) {
  const action = await prisma.$transaction(async tx => {
    const current = await lockOwnedAction(tx, actionId, identity)
    if (current.status !== 'PROPOSED' || current.version !== expectedVersion) throw new KnowledgeWriteError('ACTION_CONFLICT')
    return tx.researchAction.update({ where: { id: actionId }, data: { status: 'REJECTED', decidedAt: new Date() } })
  })
  return actionView(action, identity)
}
export async function approveKnowledgeAction(actionId: string, identity: WriteIdentity, token: string,
  testHooks?: { afterNoteCreate?: () => void; now?: () => number }) {
  // Direct integration test hooks are never taken from HTTP input or passed by routes.
  return prisma.$transaction(async tx => {
    const action = await lockOwnedAction(tx, actionId, identity)
    try { verifyKnowledgeApproval(token, actionBinding(action, identity.userId, identity.workspaceId),
      process.env.ACTION_APPROVAL_SECRET ?? '', testHooks?.now) }
    catch { throw new KnowledgeWriteError('INVALID_APPROVAL_TOKEN', 403) }
    if (action.status === 'EXECUTED') {
      const note = await tx.knowledgeNote.findFirst({ where: { sourceActionKey: action.idempotencyKey,
        workspaceId: identity.workspaceId }, select: publicNoteSelect })
      if (!note) throw new KnowledgeWriteError('INVALID_ACTION_STATE')
      return { note, replayed: true }
    }
    if (action.status !== 'PROPOSED') throw new KnowledgeWriteError('ACTION_CONFLICT')
    const { title, content } = parseCanonicalArgs(action.canonicalArgs)
    const note = await tx.knowledgeNote.create({ data: { title, content, workspaceId: identity.workspaceId,
      sourceRunId: action.runId, sourceActionKey: action.idempotencyKey }, select: publicNoteSelect })
    testHooks?.afterNoteCreate?.()
    const now = new Date()
    await tx.researchAction.update({ where: { id: actionId }, data: { status: 'EXECUTED', decidedAt: now, executedAt: now } })
    return { note, replayed: false }
  }, { timeout: 10_000 })
}
