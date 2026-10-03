import assert from 'node:assert/strict'
import test from 'node:test'
import { createMcpRequestGuard, guardedMcpHandler, mcpRequestsPerMinute } from './common/lib/mcp-request-guard.ts'

test('MCP protocol guard permits normal requests and rejects before handler at minute budget', async () => {
  let clock = 1000, executed = 0
  const allow = createMcpRequestGuard(() => clock)
  const handler = async () => { executed++; return new Response('handled') }
  for (let i = 0; i < mcpRequestsPerMinute; i++)
    assert.equal((await guardedMcpHandler(new Request('http://localhost'), handler, allow)).status, 200)
  assert.equal((await guardedMcpHandler(new Request('http://localhost'), handler, allow)).status, 429)
  assert.equal(executed, mcpRequestsPerMinute)
  clock += 60_000
  assert.equal((await guardedMcpHandler(new Request('http://localhost'), handler, allow)).status, 200)
  assert.equal(executed, mcpRequestsPerMinute + 1)
})
