import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { researchReferenceOutputSchema } from "./mcp-reference-server";
import { configuredMcpUrl, issueMcpBearer, mcpProtocolVersion } from "./mcp-reference-auth";
import type { ToolExecutionContext } from "./agent-tools";

export type SafeReference = { topic: string; referenceId: string; summary: string };

export function parseMcpReferenceResult(raw: unknown): SafeReference {
  if (!raw || typeof raw !== "object") throw new Error("MCP_INVALID_RESULT");
  const result = raw as { isError?: unknown; content?: unknown };
  if (result.isError === true || !Array.isArray(result.content) || result.content.length !== 1)
    throw new Error("MCP_INVALID_RESULT");
  const block = result.content[0] as { type?: unknown; text?: unknown } | null;
  if (!block || block.type !== "text" || typeof block.text !== "string" ||
      !block.text || block.text.length > 1200) throw new Error("MCP_INVALID_RESULT");
  let value: unknown;
  try { value = JSON.parse(block.text); }
  catch { throw new Error("MCP_INVALID_RESULT"); }
  const parsed = researchReferenceOutputSchema.safeParse(value);
  if (!parsed.success) throw new Error("MCP_INVALID_RESULT");
  return parsed.data;
}

type ReferenceClient = Pick<Client, "listTools" | "callTool">;
export async function callResearchReference(client: ReferenceClient, topic: string, context: ToolExecutionContext) {
  if (context.signal?.aborted) throw new Error("CANCELLED");
  const listed = await client.listTools({}, { signal: context.signal, timeout: 5000 });
  if (context.signal?.aborted) throw new Error("CANCELLED");
  // Discovery confirms availability; only this locally named tool may be called.
  if (!listed.tools.some(tool => tool.name === "research_reference")) throw new Error("MCP_TOOL_UNAVAILABLE");
  context.onMcpCall?.();
  const result = await client.callTool({ name: "research_reference", arguments: { topic } },
    { signal: context.signal, timeout: 5000 });
  if (context.signal?.aborted) throw new Error("CANCELLED");
  return parseMcpReferenceResult(result);
}

export async function executeMcpReference(topic: string, context: ToolExecutionContext): Promise<SafeReference> {
  if (context.signal?.aborted) throw new Error("CANCELLED");
  const url = configuredMcpUrl(process.env.MCP_REFERENCE_URL);
  const bearer = issueMcpBearer(process.env.MCP_AUTH_SECRET ?? "");
  const timeout = AbortSignal.timeout(5000);
  const signal = context.signal ? AbortSignal.any([context.signal, timeout]) : timeout;
  const client = new Client({ name: "aifoundry-agent", version: "1.0.0" },
    { versionNegotiation: { mode: { pin: mcpProtocolVersion } } });
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  try {
    await client.connect(transport, { signal, timeout: 5000 });
    if (client.getProtocolEra() !== "modern" || client.getNegotiatedProtocolVersion() !== mcpProtocolVersion)
      throw new Error("MCP_PROTOCOL_MISMATCH");
    return await callResearchReference(client, topic, { ...context, signal });
  } catch (error) {
    if (context.signal?.aborted) throw new Error("CANCELLED");
    if (timeout.aborted) throw new Error("MCP_TIMEOUT");
    if (error instanceof Error && ["MCP_INVALID_RESULT", "MCP_TOOL_UNAVAILABLE", "MCP_PROTOCOL_MISMATCH"].includes(error.message))
      throw error;
    throw new Error("MCP_FAILED");
  } finally {
    await client.close().catch(() => {});
  }
}
