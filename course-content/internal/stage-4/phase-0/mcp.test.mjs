import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { z } from 'zod'
import { handler } from './mcp/server.mjs'

const resultSchema = z.strictObject({ topic: z.string(), normalized: z.string() })
async function check(client) {
  const tools = await client.listTools()
  assert.deepEqual(tools.tools.map(x => x.name), ['research_reference'])
  const result = await client.callTool({ name: 'research_reference', arguments: { topic: 'RAG' } })
  assert.equal(result.isError, undefined)
  assert.deepEqual(resultSchema.parse(JSON.parse(result.content[0].text)), { topic: 'RAG', normalized: 'rag' })
  const rejected = await client.callTool({ name: 'research_reference', arguments: { topic: 'RAG', ownerId: 'bob' } })
  assert.equal(rejected.isError, true)
}
test('official SDK Streamable HTTP handler/client over fetch boundary', async () => {
  const transport = new StreamableHTTPClientTransport(new URL('http://localhost/mcp'), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  })
  const client = new Client({ name: 'stage4-spike-client', version: '1.0.0' })
  try { await client.connect(transport); await check(client) }
  finally { await client.close() }
})
test('official SDK stdio child process/client', async () => {
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [fileURLToPath(new URL('./mcp/stdio-server.mjs', import.meta.url))] })
  const client = new Client({ name: 'stage4-spike-client', version: '1.0.0' })
  try { await client.connect(transport); await check(client) }
  finally { await client.close() }
})
