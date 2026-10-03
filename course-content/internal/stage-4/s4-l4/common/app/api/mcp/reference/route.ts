import { NextRequest, NextResponse } from "next/server";
import { researchReferenceHandler } from "@/lib/mcp-reference-server";
import { configuredMcpUrl, verifyMcpBearer } from "@/lib/mcp-reference-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  let expected: URL;
  try { expected = configuredMcpUrl(process.env.MCP_REFERENCE_URL); }
  catch { return NextResponse.json({ error: "MCP unavailable" }, { status: 503, headers: noStore }); }
  if (request.headers.get("host") !== expected.host ||
      (request.headers.get("origin") && request.headers.get("origin") !== expected.origin))
    return NextResponse.json({ error: "MCP origin rejected" }, { status: 403, headers: noStore });
  try { verifyMcpBearer(request.headers.get("authorization"), process.env.MCP_AUTH_SECRET ?? ""); }
  catch { return NextResponse.json({ error: "MCP unauthorized" }, { status: 401, headers: noStore }); }
  try { return await researchReferenceHandler.fetch(request); }
  catch { return NextResponse.json({ error: "MCP unavailable" }, { status: 503, headers: noStore }); }
}
