import { z } from "zod";

const topicSchema = z.strictObject({ topic: z.string().trim().min(1).max(80) });

export const echoResearchTopic = {
  name: "echo_research_topic",
  description: "Receive and repeat a research topic. This read-only lesson tool has no external effects.",
  risk: "read" as const,
  inputSchema: topicSchema,
  jsonSchema: {
    type: "object", additionalProperties: false,
    properties: { topic: { type: "string", minLength: 1, maxLength: 80 } },
    required: ["topic"],
  },
  async execute(input: z.infer<typeof topicSchema>, context: { signal?: AbortSignal }) {
    if (context.signal?.aborted) throw new Error("CANCELLED");
    return { topic: input.topic, message: `已收到研究主题：${input.topic}` };
  },
};

// The model sees only the JSON Schema. The implementation and risk stay on the server.
const registry = new Map([[echoResearchTopic.name, echoResearchTopic]]);
export const modelTools = [...registry.values()].map(tool => ({
  type: "function" as const,
  function: { name: tool.name, description: tool.description, parameters: tool.jsonSchema },
}));

export function validateToolCall(call: unknown) {
  if (!call || typeof call !== "object") throw new Error("INVALID_TOOL_CALL");
  const item = call as { id?: unknown; type?: unknown; function?: { name?: unknown; arguments?: unknown } };
  if (typeof item.id !== "string" || !item.id || item.id.length > 128) throw new Error("INVALID_TOOL_CALL_ID");
  if (item.type !== "function") throw new Error("INVALID_TOOL_CALL");
  if (typeof item.function?.name !== "string" || !registry.has(item.function.name)) throw new Error("UNKNOWN_TOOL");
  const raw = item.function.arguments;
  if (typeof raw !== "string" || !raw || raw.length > 2048) throw new Error("INVALID_ARGUMENT_SIZE");
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("INVALID_ARGUMENT_JSON"); }
  const parsed = registry.get(item.function.name)!.inputSchema.safeParse(value);
  if (!parsed.success) throw new Error("INVALID_ARGUMENT_SCHEMA");
  return { id: item.id, tool: registry.get(item.function.name)!, args: parsed.data };
}
