import { NextRequest, NextResponse } from "next/server";
import { currentSession, rejectCrossOriginWrite, unauthorized } from "@/lib/auth";
import { allowAiRequest, allowProviderWork } from "@/lib/ai-rate-limit";
import { AiProviderError, generate } from "@/lib/ai-provider";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

function failure(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status, headers });
}

export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginWrite(request);
  if (rejected) return rejected;
  let session;
  try { session = await currentSession(request); } catch { return failure(503, "认证服务暂时不可用，请稍后重试。"); }
  if (!session) return unauthorized();
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return failure(400, "请发送 JSON 格式的问题。");

  let body: unknown;
  try { body = await request.json(); } catch { return failure(400, "请求中的 JSON 格式不正确。"); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return failure(400, "请填写问题。");
  const input = (body as Record<string, unknown>).input;
  if (typeof input !== "string" || !input.trim()) return failure(400, "请填写问题。");
  const prompt = input.trim();
  if (prompt.length > 2000) return failure(400, "问题不能超过 2000 个字符。");
  if (!allowAiRequest(session.user.id)) return failure(429, "请求太频繁，请一分钟后再试。");

  try {
    if (!allowProviderWork(session.user.id, 1)) return failure(429, "本分钟模型调用预算已用完，请稍后再试。");
    const answer = await generate(prompt);
    return NextResponse.json({ ok: true, kind: answer.kind, text: answer.text, usage: answer.usage }, { headers });
  } catch (error) {
    if (error instanceof AiProviderError) {
      if (error.code === "CONFIG") return failure(503, "模型服务尚未配置好，请联系项目维护者。");
      if (error.code === "TIMEOUT") return failure(504, "模型等待超时，请稍后重试。");
      if (error.code === "UNAUTHORIZED") return failure(502, "模型服务鉴权失败，请联系项目维护者。");
    }
    return failure(502, "模型服务暂时不可用，请稍后重试。");
  }
}
