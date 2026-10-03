import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentSession, rejectCrossOriginWrite, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelPersistedRun } from "@/lib/agent-persistence";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  const crossOrigin = rejectCrossOriginWrite(request);
  if (crossOrigin) return crossOrigin;
  let session;
  try { session = await currentSession(request); }
  catch { return NextResponse.json({ error: "认证服务暂时不可用。" }, { status: 503, headers: noStore }); }
  if (!session) return unauthorized();
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "JSON 格式不正确。" }, { status: 400, headers: noStore }); }
  if (!z.strictObject({}).safeParse(raw).success)
    return NextResponse.json({ error: "Cancel 不接受额外参数。" }, { status: 400, headers: noStore });
  const { runId } = await context.params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(runId)) return NextResponse.json({ error: "Run 不存在。" }, { status: 404, headers: noStore });
  const owned = await prisma.agentRun.findFirst({ where: { id: runId, ownerId: session.user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Run 不存在。" }, { status: 404, headers: noStore });
  try { return NextResponse.json(await cancelPersistedRun(runId, session.user.id), { headers: noStore }); }
  catch { return NextResponse.json({ error: "Run 当前不能取消。" }, { status: 409, headers: noStore }); }
}
