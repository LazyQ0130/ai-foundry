import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentSession, rejectCrossOriginWrite, unauthorized } from "@/lib/auth";
import { verifyApprovalToken } from "@/lib/agent-approval";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const bodySchema = z.strictObject({ approvalToken: z.string().min(1).max(4096) });

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginWrite(request);
  if (crossOrigin) return crossOrigin;
  let session;
  try { session = await currentSession(request); }
  catch { return NextResponse.json({ ok: false, error: "认证服务暂时不可用。" }, { status: 503, headers: noStore }); }
  if (!session) return unauthorized();
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return NextResponse.json({ ok: false, error: "请发送 JSON 请求。" }, { status: 400, headers: noStore });
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ ok: false, error: "JSON 格式不正确。" }, { status: 400, headers: noStore }); }
  const body = bodySchema.safeParse(raw);
  if (!body.success) return NextResponse.json({ ok: false, error: "确认请求只能包含 approvalToken。" }, { status: 400, headers: noStore });
  let args;
  try { args = verifyApprovalToken({ token: body.data.approvalToken, userId: session.user.id,
    secret: process.env.AGENT_APPROVAL_SECRET ?? "" }); }
  catch { return NextResponse.json({ ok: false, error: "确认凭证无效或已过期。" }, { status: 400, headers: noStore }); }
  try {
    const saved = await prisma.resource.create({ data: {
      title: args.title, desc: args.content, tag: "文章", ownerId: session.user.id,
    }, select: { id: true, title: true, desc: true, tag: true, important: true } });
    return NextResponse.json({ ok: true, status: "saved", saved, modelCalls: 0 }, { status: 201, headers: noStore });
  } catch {
    return NextResponse.json({ ok: false, error: "保存失败，请稍后重试。" }, { status: 503, headers: noStore });
  }
}
