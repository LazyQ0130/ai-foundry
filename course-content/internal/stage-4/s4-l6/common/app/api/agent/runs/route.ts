import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentSession, rejectCrossOriginWrite, unauthorized } from "@/lib/auth";
import { allowAiRequest } from "@/lib/ai-rate-limit";
import { providerMode } from "@/lib/ai-provider";
import { createPersistedRun } from "@/lib/agent-persistence";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bodySchema = z.strictObject({ goal: z.string().trim().min(1).max(2000),
  demo: z.enum(["research_workflow", "persistent_provider_failure", "persistent_budget_final"]).default("research_workflow") });

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginWrite(request);
  if (crossOrigin) return crossOrigin;
  let session;
  try { session = await currentSession(request); }
  catch { return NextResponse.json({ error: "认证服务暂时不可用。" }, { status: 503, headers: noStore }); }
  if (!session) return unauthorized();
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return NextResponse.json({ error: "请发送 JSON 请求。" }, { status: 400, headers: noStore });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "JSON 格式不正确。" }, { status: 400, headers: noStore }); }
  const body = bodySchema.safeParse(raw);
  if (!body.success) return NextResponse.json({ error: "Run 请求只能包含目标与固定演示模式。" }, { status: 400, headers: noStore });
  if (!allowAiRequest(session.user.id)) return NextResponse.json({ error: "请求太频繁，请稍后重试。" }, { status: 429, headers: noStore });
  let mode: "mock" | "real";
  try { mode = providerMode(); } catch { return NextResponse.json({ error: "模型服务尚未配置好。" }, { status: 503, headers: noStore }); }
  if (mode === "real" && body.data.demo !== "research_workflow")
    return NextResponse.json({ error: "故障演示只在 Mock 模式提供。" }, { status: 400, headers: noStore });
  try {
    const view = await createPersistedRun(session.user.id, body.data.goal, body.data.demo, request.signal);
    return NextResponse.json(view, { status: 201, headers: noStore });
  } catch { return NextResponse.json({ error: "Run 暂时无法创建。" }, { status: 503, headers: noStore }); }
}
