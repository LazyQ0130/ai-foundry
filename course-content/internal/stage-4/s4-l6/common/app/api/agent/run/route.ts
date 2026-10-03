import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentSession, rejectCrossOriginWrite, unauthorized } from "@/lib/auth";
import { allowAiRequest, allowProviderWork } from "@/lib/ai-rate-limit";
import { providerMode } from "@/lib/ai-provider";
import { agentModel, type DemoMode } from "@/lib/agent-provider";
import { runAgent } from "@/lib/agent-runtime";
import { modelTools } from "@/lib/agent-tools";
import { aiFailure, aiHeaders } from "@/lib/ai-http";

export const dynamic = "force-dynamic";
const requestSchema = z.strictObject({
  goal: z.string().trim().min(1).max(2000),
  demo: z.enum(["direct", "tool", "unknown_tool", "bad_json", "extra_field", "multiple_tools",
    "max_steps", "max_tools", "budget_exhausted", "cancel", "provider_error", "knowledge_search",
    "knowledge_owner_spoof", "knowledge_budget_embedding", "knowledge_budget_final",
    "note_proposal", "note_extra_field", "note_unknown_tool", "mcp_reference", "mcp_extra_field",
    "research_workflow", "workflow_loop", "workflow_budget_model", "workflow_budget_embedding",
    "workflow_budget_final", "workflow_cancel"]).default("tool"),
});

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginWrite(request);
  if (crossOrigin) return crossOrigin;
  let session;
  try { session = await currentSession(request); } catch { return aiFailure(503, "认证服务暂时不可用，请稍后重试。"); }
  if (!session) return unauthorized();
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return aiFailure(400, "请发送 JSON 请求。");
  let raw: unknown;
  try { raw = await request.json(); } catch { return aiFailure(400, "请求中的 JSON 格式不正确。"); }
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return aiFailure(400, "研究目标或演示模式不符合要求。");
  if (!allowAiRequest(session.user.id)) return aiFailure(429, "请求太频繁，请一分钟后再试。");
  let mode: "mock" | "real";
  try { mode = providerMode(); } catch { return aiFailure(503, "模型服务尚未配置好。"); }
  const demo: DemoMode = parsed.data.demo;
  // Historical 4.3/4.5 write demos use replayable V1 tokens. The current app only
  // exposes confirmable writes through persisted /api/agent/runs and V2 Actions.
  if (demo === "note_proposal" || demo === "research_workflow" || demo.startsWith("workflow_"))
    return aiFailure(410, "写入演示已迁移到可恢复的 Agent Run。");
  // Failure modes are a deterministic lesson lab, never a real Provider override.
  if (mode === "real" && !["direct", "tool", "knowledge_search", "note_proposal", "mcp_reference", "research_workflow"].includes(demo)) return aiFailure(400, "故障演示只在 Mock 模式提供。");
  let modelReservations = 0;
  const result = await runAgent({
    goal: parsed.data.goal,
    model: (messages, tools, signal) => agentModel(messages, tools, signal, demo),
    reserve: () => {
      modelReservations++;
      if (mode === "mock" && (demo === "budget_exhausted" || demo === "workflow_budget_model" ||
        ((demo === "knowledge_budget_final" || demo === "workflow_budget_final") && modelReservations > 1))) return false;
      return allowProviderWork(session.user.id, 1);
    },
    reserveEmbedding: () => mode === "mock" && ["knowledge_budget_embedding", "workflow_budget_embedding"].includes(demo) ? false : allowProviderWork(session.user.id, 1),
    userId: session.user.id,
    availableTools: modelTools,
    countProviderUnits: mode === "real",
    // No V1 approval token can leave this 4.6 Route.
    signal: request.signal,
    // The lab lowers one limit on the server so learners can observe each stop state.
    maxAgentSteps: mode === "mock" && demo === "max_steps" ? 2 : 4,
    maxToolCalls: mode === "mock" && demo === "max_tools" ? 2 : 3,
  });
  return NextResponse.json({ ok: result.status === "completed", kind: mode, ...result }, { headers: aiHeaders });
}
