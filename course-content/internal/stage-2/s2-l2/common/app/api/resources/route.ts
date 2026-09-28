import { NextResponse } from "next/server";
import { tags } from "@/lib/resources";

const allowedTags = tags.filter((tag) => tag !== "全部");

function invalid(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return invalid("请发送 JSON 格式的资料。");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalid("请求中的 JSON 格式不正确。");
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return invalid("请发送一条包含标题、简介和分类的资料。");
  }

  const input = body as Record<string, unknown>;
  if (typeof input.title !== "string") return invalid("资料标题必须是文字。");
  const title = input.title.trim();
  if (!title) return invalid("请填写资料标题。");
  if (title.length > 100) return invalid("资料标题不能超过 100 个字。");

  if (typeof input.desc !== "string") return invalid("简介必须是文字。");
  const desc = input.desc.trim();
  if (!desc) return invalid("请填写资料简介。");
  if (desc.length > 500) return invalid("资料简介不能超过 500 个字。");

  if (typeof input.tag !== "string" || !allowedTags.includes(input.tag)) {
    return invalid("请选择已有的资料分类，不能选择“全部”。");
  }

  return NextResponse.json({
    ok: true,
    status: "received",
    saved: false,
    resource: { title, desc, tag: input.tag },
    message: "服务端已收到，但尚未保存。",
  });
}
