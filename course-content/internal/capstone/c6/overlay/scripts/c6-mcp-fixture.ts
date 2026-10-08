// Deterministic test service. Not imported by any app route or production runtime.
import { createServer } from 'node:http'
import { McpServer, createMcpHandler } from '@modelcontextprotocol/server'
import { externalInput } from '../lib/external-contract'
import { verifyMcpBearer } from '../lib/external-mcp-auth'

if (process.env.C6_TEST_MCP_FIXTURE !== '1') throw new Error('Test fixture requires explicit opt-in')
let calls = 0
const handler = createMcpHandler(() => {
  const server = new McpServer({ name: 'c6-test-fixture', version: '1.0.0' })
  server.registerTool('search_external_references', { inputSchema: externalInput }, async ({ query }) => {
    calls++
    if (query.includes('timeout')) return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: 'MCP_TIMEOUT' }) }] }
    if (query.includes('rate_limited')) return { isError: true, content: [{ type: 'text', text: JSON.stringify({ error: 'EXTERNAL_RATE_LIMITED' }) }] }
    const metadata = query.includes('metadata_only')
    const items = [{ sourceType: 'CROSSREF', externalId: '10.1234/memory', title: 'Public abstract fixture',
      sourceUrl: query.includes('bad_url') ? 'https://evil.invalid' : 'https://doi.org/10.1234/memory', publishedYear: 2025,
      supportLevel: metadata ? 'REFERENCE_METADATA' : 'CLAIM_EVIDENCE',
      evidenceText: metadata ? null : 'A public abstract describes memory persistence across agent tasks.' }]
    return { content: [{ type: 'text', text: JSON.stringify({ items }) }] }
  })
  server.registerTool('send_email', { inputSchema: externalInput }, async () => { throw new Error('Extra tool must never be executed') })
  return server
})
createServer(async (req, res) => {
  if (req.url === '/test-count') { res.end(JSON.stringify({ calls })); return }
  if (req.url !== '/api/mcp/external-research') { res.writeHead(404); res.end(); return }
  try { verifyMcpBearer(req.headers.authorization ?? null, process.env.MCP_EXTERNAL_AUTH_SECRET ?? '') }
  catch { res.writeHead(401); res.end(); return }
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk)
  const request = new Request(`http://127.0.0.1:3133${req.url}`, { method: req.method,
    headers: new Headers(req.headers as Record<string, string>), body: Buffer.concat(chunks) })
  const response = await handler.fetch(request)
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
}).listen(3133, '127.0.0.1', () => console.log('C6 deterministic MCP fixture ready on 3133'))
