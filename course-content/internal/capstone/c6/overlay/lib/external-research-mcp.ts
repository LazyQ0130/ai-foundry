import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { z } from 'zod'
import { externalInput, externalResultsSchema } from './external-contract'
import { configuredMcpUrl, issueMcpBearer, mcpProtocolVersion } from './external-mcp-auth'
import { safeExternalError } from './crossref-adapter'

export const MCP_TIMEOUT_MS = 12_000
export function parseExternalMcpResult(raw: unknown) {
  const parsed = z.object({ isError: z.boolean().optional(), content: z.array(z.object({
    type: z.literal('text'), text: z.string().min(1).max(12_000),
  }).strict()).length(1) }).passthrough().safeParse(raw)
  if (!parsed.success) throw new Error('MCP_INVALID_RESULT')
  let value: unknown
  try { value = JSON.parse(parsed.data.content[0].text) } catch { throw new Error('MCP_INVALID_RESULT') }
  if (parsed.data.isError) {
    const safe = z.object({ error: z.string() }).strict().safeParse(value)
    throw new Error(safeExternalError(new Error(safe.success ? safe.data.error : 'MCP_INVALID_RESULT')))
  }
  const output = z.object({ items: externalResultsSchema,
    upstreamLatencyMs: z.number().int().min(0).max(12_000).optional() }).strict().safeParse(value)
  if (!output.success) throw new Error('MCP_INVALID_RESULT')
  return Object.assign(output.data.items, output.data.upstreamLatencyMs === undefined ? {} : { upstreamLatencyMs: output.data.upstreamLatencyMs })
}
export async function callExternalResearch(client: Pick<Client, 'listTools' | 'callTool'>,
  input: { query: string }, signal: AbortSignal) {
  const args = externalInput.parse(input)
  signal.throwIfAborted()
  const listed = await client.listTools({}, { signal, timeout: MCP_TIMEOUT_MS })
  if (!listed.tools.some(tool => tool.name === 'search_external_references')) throw new Error('MCP_TOOL_UNAVAILABLE')
  // Remote discovery never populates the model's local registry.
  const result = await client.callTool({ name: 'search_external_references', arguments: args }, { signal, timeout: MCP_TIMEOUT_MS })
  signal.throwIfAborted()
  return parseExternalMcpResult(result)
}
export async function searchExternalMcp(input: { query: string }, signal: AbortSignal) {
  externalInput.parse(input); signal.throwIfAborted()
  const url = configuredMcpUrl(process.env.MCP_EXTERNAL_URL)
  const token = issueMcpBearer(process.env.MCP_EXTERNAL_AUTH_SECRET ?? '')
  const timeout = AbortSignal.timeout(MCP_TIMEOUT_MS)
  const combined = AbortSignal.any([signal, timeout])
  const client = new Client({ name: 'ai-research-workspace', version: '1.0.0' },
    { versionNegotiation: { mode: { pin: mcpProtocolVersion } } })
  const transport = new StreamableHTTPClientTransport(url, { requestInit: { headers: { Authorization: `Bearer ${token}` } } })
  try {
    await client.connect(transport, { signal: combined, timeout: MCP_TIMEOUT_MS })
    if (client.getProtocolEra() !== 'modern' || client.getNegotiatedProtocolVersion() !== mcpProtocolVersion)
      throw new Error('MCP_PROTOCOL_MISMATCH')
    return await callExternalResearch(client, input, combined)
  } catch (error) {
    if (signal.aborted) throw new Error('CANCELLED')
    if (timeout.aborted) throw new Error('MCP_TIMEOUT')
    throw new Error(safeExternalError(error))
  } finally { await client.close().catch(() => {}) }
}
