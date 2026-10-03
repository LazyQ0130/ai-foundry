import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentSession, rejectCrossOriginWrite, unauthorized } from "@/lib/auth";
import { confirmPersistedAction } from "@/lib/agent-persistence";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bodySchema = z.strictObject({ approvalToken: z.string().min(1).max(4096) });

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
  if (!body.success) return NextResponse.json({ error: "确认请求只能包含 approvalToken。" }, { status: 400, headers: noStore });
  try {
    const result = await confirmPersistedAction({ token: body.data.approvalToken,
      ownerId: session.user.id, secret: process.env.AGENT_APPROVAL_SECRET ?? "" });
    return NextResponse.json({ ok: true, status: "saved", saved: result.saved, replayed: result.replayed,
      modelCalls: 0, message: result.replayed ? "该 Action 已执行，返回已有结果。" : "研究笔记已保存。" },
    { status: result.replayed ? 200 : 201, headers: noStore });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (["INVALID_APPROVAL_TOKEN", "ACTION_NOT_FOUND", "ACTION_NOT_PROPOSED"].includes(code))
      return NextResponse.json({ error: "确认凭证无效或 Action 不可执行。" }, { status: 400, headers: noStore });
    return NextResponse.json({ error: "确认暂时无法完成。" }, { status: 503, headers: noStore });
  }
}
