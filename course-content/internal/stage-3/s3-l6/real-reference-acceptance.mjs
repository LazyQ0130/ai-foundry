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
  async function readStream(response, started, abortAfterFirst = false, controller) {
    assert.equal(response.status, 200, `Cloud stream failed: HTTP ${response.status}`)
    assert(response.headers.get('content-type')?.includes('application/x-ndjson'))
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let kind = null, firstChunkMs = null, chunks = 0, totalTokens = null, done = false, abortedAtMs = null
    while (true) {
      const part = await reader.read()
      if (part.done) break
      buffer += decoder.decode(part.value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line) continue
        assert(!line.includes(process.env.AI_CHAT_API_KEY), 'secret in browser stream')
        const event = JSON.parse(line)
        if (event.type === 'error') throw new Error(`Cloud stream error: ${event.message}`)
        if (event.type === 'meta') kind = event.kind
        if (event.type === 'delta') {
          chunks++
          firstChunkMs ??= Math.round(performance.now() - started)
          assert(typeof event.text === 'string' && event.text.length > 0)
          if (abortAfterFirst) {
            abortedAtMs = Math.round(performance.now() - started)
            controller.abort()
            await reader.cancel().catch(() => {})
            return { kind, firstChunkMs, chunks, totalTokens, done, abortedAtMs, chunksAfterAbort: 0 }
          }
        }
        if (event.type === 'usage') totalTokens = event.totalTokens
        if (event.type === 'done') done = true
      }
    }
    return { kind, firstChunkMs, chunks, totalTokens, done, totalMs: Math.round(performance.now() - started) }
  }
  const headers = { 'Content-Type': 'application/json', Cookie: cookie }
  const started = performance.now()
  const answer = await fetch(`${base}/api/ai/stream`, {
    method: 'POST', headers,
    body: JSON.stringify({ input: '用一句话解释 Git 版本记录的作用。' }),
  })
  const normal = await readStream(answer, started)
  assert.equal(normal.kind, 'real')
  assert(normal.chunks >= 2 && normal.done && normal.firstChunkMs !== null)
  console.log(JSON.stringify({ status: 'pass', request: 'normal', httpStatus: answer.status, model: process.env.AI_CHAT_MODEL, region: 'China (Beijing)', ...normal }))

  const controller = new AbortController()
  const cancelStarted = performance.now()
  const cancellable = await fetch(`${base}/api/ai/stream`, {
    method: 'POST', headers, signal: controller.signal,
    body: JSON.stringify({ input: '请用两句话解释 Git 分支的作用。' }),
  })
  const cancelled = await readStream(cancellable, cancelStarted, true, controller)
  assert.equal(cancelled.kind, 'real')
  assert.equal(cancelled.chunksAfterAbort, 0)
  assert.equal(cancelled.done, false)
  console.log(JSON.stringify({ status: 'pass', request: 'cancel', httpStatus: cancellable.status, model: process.env.AI_CHAT_MODEL, region: 'China (Beijing)', ...cancelled }))
} finally {
  app.kill()
  await Promise.race([once(app, 'exit'), new Promise(resolve => setTimeout(resolve, 3000))])
}
