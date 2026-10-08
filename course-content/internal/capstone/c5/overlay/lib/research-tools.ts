import { z } from 'zod'
import { retrieveKnowledgeEvidence, type KnowledgeEvidence } from './knowledge-retrieval'

export const searchKnowledgeInput = z.object({ query: z.string().trim().min(1).max(500) }).strict()
export const researchTools = [{ type: 'function', function: {
  name: 'search_knowledge', description: 'Search the current user’s private knowledge for evidence relevant to a research subquestion.',
  parameters: { type: 'object', properties: { query: { type: 'string', minLength: 1, maxLength: 500 } },
    required: ['query'], additionalProperties: false },
} }] as const

export class ToolCallError extends Error { constructor(code: string) { super(code) } }
export function validateResearchToolCalls(raw: unknown): { query: string } {
  if (!Array.isArray(raw) || raw.length !== 1) throw new ToolCallError('MULTIPLE_OR_INVALID_TOOL_CALLS')
  const call = raw[0]
  if (!call || typeof call !== 'object' || call.name !== 'search_knowledge') throw new ToolCallError('UNKNOWN_TOOL')
  let args: unknown
  try { args = typeof call.arguments === 'string' ? JSON.parse(call.arguments) : call.arguments }
  catch { throw new ToolCallError('INVALID_TOOL_ARGS') }
  const parsed = searchKnowledgeInput.safeParse(args)
  if (!parsed.success) throw new ToolCallError('INVALID_TOOL_ARGS')
  return parsed.data
}

export async function searchKnowledgeTool(args: { query: string }, context: { workspaceId: number; signal: AbortSignal }): Promise<KnowledgeEvidence[]> {
  if (context.signal.aborted) throw new ToolCallError('CANCELLED')
  const evidence = await retrieveKnowledgeEvidence({ workspaceId: context.workspaceId, query: args.query, limit: 5 })
  if (context.signal.aborted) throw new ToolCallError('CANCELLED')
  return evidence
}
