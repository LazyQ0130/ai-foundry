import { McpServer, createMcpHandler } from '@modelcontextprotocol/server'
import { z } from 'zod'

export function buildServer() {
  const server = new McpServer({ name: 'stage4-read-only-spike', version: '1.0.0' })
  server.registerTool('research_reference', {
    description: 'Return a public, deterministic research reference. No private knowledge is exposed.',
    inputSchema: z.strictObject({ topic: z.string().trim().min(1).max(80) }),
  }, async ({ topic }) => ({ content: [{ type: 'text', text: JSON.stringify({ topic, normalized: topic.toLowerCase() }) }] }))
  return server
}

export const handler = createMcpHandler(buildServer)
