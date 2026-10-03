// Real HTTP check of the single-process MCP protocol request budget.
import assert from 'node:assert/strict'
import { createHmac, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2]) throw new Error('Pass a built 4.5 Reference')
const port = Number(process.argv[3] ?? 32552), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url')
const encoded = Buffer.from(JSON.stringify({ v: 1, aud: 'aifoundry-research-reference',
  scope: 'tools:call:research_reference', exp: Date.now() + 120000,
  nonce: randomBytes(24).toString('base64url') })).toString('base64url')
const token = `${encoded}.${createHmac('sha256', secret).update(encoded).digest('base64url')}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, MCP_AUTH_SECRET: secret,
    MCP_REFERENCE_URL: `${base}/api/mcp/reference`, MCP_ALLOW_LOCAL_HTTP: '1', AI_PROVIDER_MODE: 'mock' },
  stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const rpc = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'server/discover',
  params: { supportedVersions: ['2026-07-28'] } })
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const call = () => fetch(`${base}/api/mcp/reference`, { method: 'POST', headers: {
    Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }, body: rpc })
  for (let i = 0; i < 60; i++) {
    const response = await call()
    assert.notEqual(response.status, 429)
    await response.arrayBuffer()
  }
  const limited = await call()
  assert.equal(limited.status, 429)
  assert.equal((await limited.json()).error, 'MCP request limit exceeded')
  console.log('PASS: 60 authenticated MCP protocol requests allowed, request 61 rejected with 429 before handler')
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
}
