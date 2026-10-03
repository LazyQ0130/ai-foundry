import type { AgentResult } from "./agent-runtime";

export type WorkflowStepView = { id: string; label: string;
  kind: "tool" | "model" | "approval" | "write" | "final";
  status: "pending" | "running" | "completed" | "waiting" | "failed" | "cancelled" };

export function workflowTimeline(result: AgentResult): WorkflowStepView[] {
  const searchDone = result.toolCalls > 0 && !!result.searchMatches;
  const proposalReady = result.status === "waiting_approval" && !!result.proposal;
  const stopped = result.status === "cancelled" ? "cancelled" :
    result.status === "failed" || result.status === "budget_exhausted" ||
    result.status === "max_steps" || result.status === "max_tools" ? "failed" : "pending";
  return [
    { id: "search", label: "搜索自己的知识库", kind: "tool", status: searchDone ? "completed" : stopped },
    { id: "synthesize", label: "AI 整理研究笔记", kind: "model",
      status: proposalReady ? "completed" : searchDone ? stopped : "pending" },
    { id: "approval", label: "等待你的确认", kind: "approval", status: proposalReady ? "waiting" : "pending" },
    { id: "write", label: "保存研究笔记", kind: "write", status: "pending" },
    { id: "final", label: "完成", kind: "final", status: "pending" },
  ];
}

export function completedWorkflowTimeline(): WorkflowStepView[] {
  return workflowTimeline({ status: "waiting_approval", modelCalls: 2, toolCalls: 1, mcpCalls: 0,
    embeddingCalls: 1, providerUnits: 3, totalTokens: 0, finishReasons: [], trace: [],
    searchMatches: [], proposal: { toolName: "save_research_note", args: { title: "已确认", content: "已保存" } } })
    .map(step => ({ ...step, status: "completed" }));
}
