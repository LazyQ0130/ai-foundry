import "server-only";
import { embed } from "@/lib/ai-provider";
import { retrieveTopK } from "@/lib/knowledge-retrieval";
import { ToolBudgetExhaustedError, type ToolExecutionContext } from "./agent-tools";

export type SafeKnowledgeMatch = { title: string; position: number; preview: string; similarity: number };
export type KnowledgeSearchResult = { matches: SafeKnowledgeMatch[] };

/** Identity stays in Session-derived context; SQL filters the owner before Top-K. */
export async function executeKnowledgeSearch(
  input: { query: string }, context: ToolExecutionContext,
): Promise<KnowledgeSearchResult> {
  if (!Number.isSafeInteger(context.userId) || (context.userId ?? 0) <= 0) throw new Error("MISSING_TOOL_CONTEXT");
  if (context.signal?.aborted) throw new Error("CANCELLED");
  if (!context.reserveProviderUnit?.("embedding")) throw new ToolBudgetExhaustedError();
  if (context.signal?.aborted) throw new Error("CANCELLED");
  context.onEmbeddingStart?.();
  const query = await embed(input.query, { signal: context.signal });
  if (context.signal?.aborted) throw new Error("CANCELLED");
  const chunks = await retrieveTopK(context.userId!, query);
  if (context.signal?.aborted) throw new Error("CANCELLED");
  return { matches: chunks.map(chunk => ({
    title: chunk.title.slice(0, 120),
    position: chunk.position,
    // Even a short Chunk is never returned whole to the model or UI.
    preview: chunk.content.slice(0, Math.min(160, Math.floor(chunk.content.length * 0.75))),
    similarity: Math.round(chunk.similarity * 1000) / 1000,
  })) };
}
