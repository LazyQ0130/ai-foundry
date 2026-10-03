import type { AgentMessage, AgentTurn } from "./agent-runtime";

const call = (name: string, args: object, id: string) =>
  ({ id, type: "function", function: { name, arguments: JSON.stringify(args) } });

export function mockWorkflowTurn(messages: AgentMessage[], loop = false): AgentTurn {
  if (loop || messages.at(-1)?.role !== "tool") return { finishReason: "tool_calls", content: null,
    toolCalls: [call("search_knowledge", { query: "Git 恢复版本" }, "mock-workflow-search")], usage: null };
  let matches: Array<{ title?: string; preview?: string }> = [];
  try { matches = JSON.parse(messages.at(-1)?.content ?? "{}").matches ?? []; } catch { /* untrusted Tool data */ }
  const safe = Array.isArray(matches) ? matches.slice(0, 2) : [];
  const evidence = safe.map(item => `${String(item.title ?? "资料").slice(0, 80)}：${String(item.preview ?? "").slice(0, 140)}`).join("；");
  const note = { title: "Git 恢复版本研究笔记",
    content: (`根据当前用户检索到的安全摘要整理：${evidence || "本次检索没有匹配资料。"}`).slice(0, 500) };
  return { finishReason: "tool_calls", content: null,
    toolCalls: [call("save_research_note", note, "mock-workflow-save")], usage: null };
}
