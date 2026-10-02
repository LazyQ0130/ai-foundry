import { z } from 'zod'

const topicSchema = z.strictObject({ topic: z.string().trim().min(1).max(80) })
export const echoTool = Object.freeze({
  name: 'echo_research_topic',
  description: 'Normalize a research topic without accessing external data.',
  risk: 'read',
  inputSchema: topicSchema,
  jsonSchema: {
    type: 'object', additionalProperties: false,
    properties: { topic: { type: 'string', minLength: 1, maxLength: 80 } },
    required: ['topic'],
  },
  async execute({ topic }, { signal }) {
    if (signal?.aborted) throw new Error('CANCELLED')
    return { topic, normalized: topic.toLocaleLowerCase('en-US') }
  },
})

export const registry = new Map([[echoTool.name, echoTool]])
export const providerTools = [...registry.values()].map(({ name, description, jsonSchema }) => ({
  type: 'function', function: { name, description, parameters: jsonSchema },
}))

export function validateToolCall(call) {
  if (!call || typeof call.id !== 'string' || !call.id || call.id.length > 128) throw new Error('INVALID_TOOL_CALL_ID')
  const name = call.function?.name
  if (typeof name !== 'string' || !registry.has(name)) throw new Error('UNKNOWN_TOOL')
  const raw = call.function?.arguments
  if (typeof raw !== 'string' || raw.length > 2048) throw new Error('INVALID_ARGUMENT_SIZE')
  let input
  try { input = JSON.parse(raw) } catch { throw new Error('INVALID_ARGUMENT_JSON') }
  const parsed = registry.get(name).inputSchema.safeParse(input)
  if (!parsed.success) throw new Error('INVALID_ARGUMENT_SCHEMA')
  return { id: call.id, tool: registry.get(name), args: parsed.data }
}
