// Explicit, paid cloud acceptance; never run from the default test suite.
// Load AI_* from an ignored local env file and set TEST_DATABASE_URL to the isolated test DB.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import path from 'node:path'

const project = process.argv[2]
if (!project || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage3_l1')) throw new Error('Use an assembled reference and isolated test database')
if (!process.env.AI_CHAT_API_KEY || !process.env.AI_CHAT_BASE_URL || !process.env.AI_CHAT_MODEL) throw new Error('Local real Provider config is missing')
const port = 32319
const base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project,
  env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, AI_PROVIDER_MODE: 'real', AI_TIMEOUT_MS: '20000', AI_CHAT_DISABLE_THINKING: '1' },
  stdio: 'ignore', windowsHide: true,
})
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(ready, 'Reference server did not start')
  const registered = await fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `real${Date.now()}`, password: 'TestPassword123!' }),
  })
  assert.equal(registered.status, 201)
  const cookie = registered.headers.get('set-cookie').split(';')[0]
  const started = performance.now()
  const answer = await fetch(`${base}/api/ai/suggest`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ content: 'Git 可以记录代码历史，帮助开发者恢复到之前的版本。' }),
  })
  const latencyMs = Math.round(performance.now() - started)
  const data = await answer.json()
  assert.equal(answer.status, 200, `Cloud request failed: HTTP ${answer.status}, category: ${typeof data.error === 'string' ? data.error : 'unknown'}`)
  assert.equal(data.ok, true)
  assert.equal(data.kind, 'real')
  assert.equal(typeof data.suggestion?.summary, 'string')
  assert(data.suggestion.summary.trim().length > 0 && data.suggestion.summary.length <= 500)
  assert(Array.isArray(data.suggestion.tags) && data.suggestion.tags.length >= 1 && data.suggestion.tags.length <= 5)
  assert(typeof data.suggestion.confidence === 'number' && data.suggestion.confidence >= 0 && data.suggestion.confidence <= 1)
  assert(!JSON.stringify(data).includes(process.env.AI_CHAT_API_KEY))
  console.log(JSON.stringify({ status: 'pass', httpStatus: answer.status, kind: data.kind, model: process.env.AI_CHAT_MODEL, region: 'China (Beijing)', latencyMs, schemaPass: true, summaryLength: data.suggestion.summary.length, tagsCount: data.suggestion.tags.length, confidenceInRange: true, usage: data.usage ?? null }))
} finally {
  app.kill()
  await Promise.race([once(app, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))])
}
