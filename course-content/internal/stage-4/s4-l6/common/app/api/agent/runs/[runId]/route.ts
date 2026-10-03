import { NextRequest, NextResponse } from "next/server";
import { currentSession, unauthorized } from "@/lib/auth";
import { safeRunView } from "@/lib/agent-persistence";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  let session;
  try { session = await currentSession(request); }
  catch { return NextResponse.json({ error: "认证服务暂时不可用。" }, { status: 503, headers: noStore }); }
  if (!session) return unauthorized();
  const { runId } = await context.params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(runId)) return NextResponse.json({ error: "Run 不存在。" }, { status: 404, headers: noStore });
  try {
    const view = await safeRunView(runId, session.user.id, process.env.AGENT_APPROVAL_SECRET ?? "");
    return view ? NextResponse.json(view, { headers: noStore }) :
      NextResponse.json({ error: "Run 不存在。" }, { status: 404, headers: noStore });
  } catch { return NextResponse.json({ error: "Run 暂时无法读取。" }, { status: 503, headers: noStore }); }
}
