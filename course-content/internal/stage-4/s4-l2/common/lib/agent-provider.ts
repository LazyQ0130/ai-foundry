import "server-only";
import { agentChatCompletion, AiProviderError, providerMode } from "@/lib/ai-provider";
import type { AgentMessage, AgentTurn } from "@/lib/agent-runtime";
import { modelTools } from "@/lib/agent-tools";

export type DemoMode = "direct" | "tool" | "unknown_tool" | "bad_json" | "extra_field" |
  "multiple_tools" | "max_steps" | "max_tools" | "budget_exhausted" | "cancel" | "provider_error" |
  "knowledge_search" | "knowledge_owner_spoof" | "knowledge_budget_embedding" | "knowledge_budget_final";

const mockCall = (name: string, args: string, id = "mock-call-1") =>
  ({ id, type: "function", function: { name, arguments: args } });

export function mockAgentTurn(demo: DemoMode, messages: AgentMessage[], signal?: AbortSignal): AgentTurn {
  if (signal?.aborted) throw new AiProviderError("CANCELLED");
  if (demo === "provider_error") throw new AiProviderError("UPSTREAM");
  const previousTool = messages.at(-1)?.role === "tool";
  if (previousTool && ["knowledge_search", "knowledge_budget_embedding", "knowledge_budget_final"].includes(demo)) {
    let matches: Array<{ title?: string }> = [];
    try { matches = JSON.parse(messages.at(-1)?.content ?? "{}").matches ?? []; } catch { /* tool data stays untrusted */ }
    return { finishReason: "stop", content: matches.length
      ? `Mock：从我的知识库找到 ${matches.length} 条结果，包括「${String(matches[0].title ?? "资料").slice(0, 80)}」。`
      : "Mock：我的知识库没有匹配结果。", toolCalls: [], usage: null };
  }
  if (demo === "direct" || (demo === "tool" && previousTool)) return {
    finishReason: "stop", content: previousTool ? "Mock：服务端已执行 echo 工具，我收到它的结果。" : "Mock：这是直接回答，没有调用工具。",
    toolCalls: [], usage: null,
  };
  const topic = messages.find(item => item.role === "user")?.content ?? "研究主题";
  const args = JSON.stringify({ topic: topic.slice(0, 80) });
  if (["knowledge_search", "knowledge_owner_spoof", "knowledge_budget_embedding", "knowledge_budget_final"].includes(demo)) return {
    finishReason: "tool_calls", content: null,
    toolCalls: [mockCall("search_knowledge", JSON.stringify(demo === "knowledge_owner_spoof"
      ? { query: topic, ownerId: 2 } : { query: topic }))], usage: null,
  };
  const toolCalls = demo === "unknown_tool" ? [mockCall("not_in_registry", args)]
    : demo === "bad_json" ? [mockCall("echo_research_topic", "{")]
    : demo === "extra_field" ? [mockCall("echo_research_topic", JSON.stringify({ topic, ownerId: 123 }))]
    : demo === "multiple_tools" ? [mockCall("echo_research_topic", args), mockCall("echo_research_topic", args, "mock-call-2")]
    : [mockCall("echo_research_topic", args)];
  return { finishReason: "tool_calls", content: null, toolCalls, usage: null };
}

export function parseRealTurn(value: unknown): AgentTurn {
  if (!value || typeof value !== "object") throw new AiProviderError("UPSTREAM");
  const body = value as Record<string, unknown>;
  const choice = Array.isArray(body.choices) ? body.choices[0] : null;
  if (!choice || typeof choice !== "object") throw new AiProviderError("UPSTREAM");
  const row = choice as Record<string, unknown>;
  if (row.finish_reason !== "stop" && row.finish_reason !== "tool_calls") throw new AiProviderError("UPSTREAM");
  if (!row.message || typeof row.message !== "object") throw new AiProviderError("UPSTREAM");
  const message = row.message as Record<string, unknown>;
  if (message.role !== "assistant" || (message.content !== null && typeof message.content !== "string")) throw new AiProviderError("UPSTREAM");
  const calls = message.tool_calls ?? [];
  if (!Array.isArray(calls)) throw new AiProviderError("UPSTREAM");
  const rawUsage = body.usage;
  let usage: AgentTurn["usage"] = null;
  if (rawUsage != null) {
    if (!rawUsage || typeof rawUsage !== "object") throw new AiProviderError("UPSTREAM");
    const item = rawUsage as Record<string, unknown>;
    const numbers = [item.prompt_tokens, item.completion_tokens, item.total_tokens];
    if (!numbers.every(n => typeof n === "number" && Number.isSafeInteger(n) && n >= 0)) throw new AiProviderError("UPSTREAM");
    usage = { promptTokens: numbers[0] as number, completionTokens: numbers[1] as number, totalTokens: numbers[2] as number };
  }
  return { finishReason: row.finish_reason, content: message.content as string | null, toolCalls: calls, usage };
}

export async function agentModel(messages: AgentMessage[], tools: typeof modelTools, signal?: AbortSignal, demo: DemoMode = "tool") {
  if (providerMode() === "mock") {
    if (demo === "cancel") {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 2000);
        signal?.addEventListener("abort", () => { clearTimeout(timer); reject(new AiProviderError("CANCELLED")); }, { once: true });
      });
    }
    return mockAgentTurn(demo, messages, signal);
  }
  return parseRealTurn(await agentChatCompletion(messages, tools, signal));
}
