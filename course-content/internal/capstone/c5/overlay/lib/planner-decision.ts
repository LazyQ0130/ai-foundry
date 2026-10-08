import { z } from 'zod'
import { firstMessage, ResearchProviderError } from './research-chat'


const privateDecision = z.object({ action: z.literal('search_knowledge'), query: z.string().trim().min(1).max(500) }).strict()
const readyDecision = z.object({ action: z.literal('ready') }).strict()

// Provider control envelope only: never add this function to the business Registry.
export const plannerToolChoice = { type: 'function', function: { name: 'plan_research_step' } } as const
export function plannerProtocol() {
 const schema = z.discriminatedUnion('action', [privateDecision, readyDecision])
 const search = { type: 'object', properties: { action: { const: 'search_knowledge', type: 'string' }, query: { type: 'string', minLength: 1, maxLength: 500 } }, required: ['action', 'query'], additionalProperties: false }
 const ready = { type: 'object', properties: { action: { const: 'ready', type: 'string' } }, required: ['action'], additionalProperties: false }
 const variants = [search, ready]
 const tools = [{ type: 'function', function: { name: 'plan_research_step', description: 'Choose exactly one next bounded research decision. This is a control envelope, not an executable tool.', parameters: { oneOf: variants } } }]
 return { tools, parse(raw: unknown, onAccepted?: (event: { plannerProviderFinishReason: string; plannerFunctionPresent: true; plannerCompatibilityPath: 'STANDARD_TOOL_CALL' | 'STOP_WITH_VALID_FORCED_FUNCTION' }) => void) {
  try {
   const message = firstMessage(raw)
   if (!['tool_calls', 'stop'].includes(message.finish_reason) || message.tool_calls?.length !== 1) throw new Error()
   const call = message.tool_calls[0] as { type?: unknown; function?: { name?: unknown; arguments?: unknown } } | null
   if (call?.type !== 'function' || call.function?.name !== 'plan_research_step' || typeof call.function.arguments !== 'string') throw new Error()
   const decision = schema.parse(JSON.parse(call.function.arguments))

   onAccepted?.({ plannerProviderFinishReason: message.finish_reason, plannerFunctionPresent: true,
    plannerCompatibilityPath: message.finish_reason === 'stop' ? 'STOP_WITH_VALID_FORCED_FUNCTION' : 'STANDARD_TOOL_CALL' })
   if (decision.action === 'ready') return { type: 'ready' as const, toolCalls: [] as [] }
   return { type: 'tool_calls' as const, toolCalls: [{ name: decision.action, arguments: JSON.stringify({ query: decision.query }) }] }
  } catch { throw new ResearchProviderError('INVALID_MODEL_TURN') }
 } }
}
