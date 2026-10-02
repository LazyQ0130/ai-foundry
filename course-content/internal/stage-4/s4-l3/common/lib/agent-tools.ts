import { z } from "zod";

export type ToolExecutionContext = {
  userId?: number;
  signal?: AbortSignal;
  reserveProviderUnit?: (kind: "embedding") => boolean;
  onEmbeddingStart?: () => void;
};
export class ToolBudgetExhaustedError extends Error {
  constructor() { super("BUDGET_EXHAUSTED"); }
}

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
  async execute(input: z.infer<typeof topicSchema>, context: ToolExecutionContext) {
    if (context.signal?.aborted) throw new Error("CANCELLED");
    return { topic: input.topic, message: `已收到研究主题：${input.topic}` };
  },
};

const querySchema = z.strictObject({ query: z.string().trim().min(1).max(1000) });
export const searchKnowledge = {
  name: "search_knowledge",
  description: "Search the signed-in user's own ready knowledge documents for a research query.",
  risk: "read" as const,
  inputSchema: querySchema,
  jsonSchema: {
    type: "object", additionalProperties: false,
    properties: { query: { type: "string", minLength: 1, maxLength: 1000 } },
    required: ["query"],
  },
  async execute(input: z.infer<typeof querySchema>, context: ToolExecutionContext) {
    // Keep the Stage 3 database/Provider code out of the 4.1 pure unit-test import path.
    const { executeKnowledgeSearch } = await import("./knowledge-search");
    return executeKnowledgeSearch(input, context);
  },
};

export const saveResearchNoteSchema = z.strictObject({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(500),
});
export type SaveResearchNoteArgs = z.infer<typeof saveResearchNoteSchema>;
export const saveResearchNote = {
  name: "save_research_note",
  description: "Propose saving a research note. A human must approve before any database write.",
  risk: "write" as const,
  inputSchema: saveResearchNoteSchema,
  jsonSchema: {
    type: "object", additionalProperties: false,
    properties: {
      title: { type: "string", minLength: 1, maxLength: 100 },
      content: { type: "string", minLength: 1, maxLength: 500 },
    },
    required: ["title", "content"],
  },
  async execute(_input: SaveResearchNoteArgs, _context: ToolExecutionContext): Promise<never> {
    throw new Error("WRITE_REQUIRES_APPROVAL");
  },
};

// The model sees only the JSON Schema. The implementation and risk stay on the server.
type ToolDefinition = {
  name: string; description: string; risk: "read" | "write";
  inputSchema: z.ZodType<unknown>;
  jsonSchema: object;
  execute: (input: any, context: ToolExecutionContext) => Promise<unknown>;
};
const registry = new Map<string, ToolDefinition>([
  [echoResearchTopic.name, echoResearchTopic], [searchKnowledge.name, searchKnowledge],
  [saveResearchNote.name, saveResearchNote],
]);
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
