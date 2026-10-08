import { McpServer, createMcpHandler } from '@modelcontextprotocol/server'
import { externalInput } from './external-contract'
import { searchCrossref, safeExternalError } from './crossref-adapter'

export function buildExternalResearchServer() {
  const server = new McpServer({ name: 'ai-research-external', version: '1.0.0' })
  server.registerTool('search_external_references', {
    description: 'Search public scholarly metadata and bounded abstract evidence via Crossref. No private data or writes.',
    inputSchema: externalInput,
  }, async (raw, context) => {
    try {
      const started = Date.now()
      const items = await searchCrossref(externalInput.parse(raw), context.mcpReq.signal)
      return { content: [{ type: 'text', text: JSON.stringify({ items, upstreamLatencyMs: Date.now() - started }) }] }
    } catch (error) {
      return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: safeExternalError(error) }) }] }
    }
  })
  return server
}
export const externalResearchHandler = createMcpHandler(buildExternalResearchServer)
