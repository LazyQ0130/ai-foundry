import { z } from 'zod'
import { createHash } from 'node:crypto'

export const knowledgeNoteArgs = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(2000),
}).strict()
export type KnowledgeNoteProposal = z.infer<typeof knowledgeNoteArgs>
export const editActionInput = knowledgeNoteArgs.extend({ expectedVersion: z.number().int().positive() }).strict()
export const rejectActionInput = z.object({ expectedVersion: z.number().int().positive() }).strict()
export const approveActionInput = z.object({ approvalToken: z.string().min(1).max(4096) }).strict()
export const emptyProposalInput = z.object({}).strict()
export function canonicalizeKnowledgeNoteArgs(raw: unknown): string {
  const { title, content } = knowledgeNoteArgs.parse(raw)
  return JSON.stringify({ title, content })
}
export function parseCanonicalArgs(value: string): KnowledgeNoteProposal {
  const parsed = knowledgeNoteArgs.parse(JSON.parse(value))
  if (canonicalizeKnowledgeNoteArgs(parsed) !== value) throw new Error('INVALID_ACTION_STATE')
  return parsed
}
export const argsHash = (canonicalArgs: string) => createHash('sha256').update(canonicalArgs).digest('hex')
export function knowledgeActionKey(runId: number, actionId: string, version: number, canonicalArgs: string) {
  return createHash('sha256').update(JSON.stringify(['SAVE_KNOWLEDGE_NOTE', runId, actionId, version, canonicalArgs])).digest('hex')
}
