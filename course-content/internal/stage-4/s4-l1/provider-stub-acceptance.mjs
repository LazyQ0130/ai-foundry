// Local HTTP Provider stub through the built Next Route; no cloud calls.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l1'))
  throw new Error('Use a built Reference and isolated local stage4_l1 database')
const appPort = 32362, stubPort = 32462, base = `http://127.0.0.1:${appPort}`
const queue = [], requests = []
const stub = createServer(async (request, response) => {
  let raw = ''; for await (const chunk of request) raw += chunk
  requests.push(JSON.parse(raw))
  const next = queue.shift()
  if (!next) { response.writeHead(500); response.end(); return }
  if (next.delay) await new Promise(resolve => setTimeout(resolve, next.delay))
  if (response.destroyed) return
  response.writeHead(next.status ?? 200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(next.body ?? next))
})
stub.listen(stubPort, '127.0.0.1'); await once(stub, 'listening')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(appPort)], {
  cwd: project,
  env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`,
    AI_CHAT_API_KEY: 'stub-only', AI_CHAT_MODEL: 'qwen3.7-flash', AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '1000' },
  stdio: 'ignore', windowsHide: true,
})
const finish = (message, reason = 'stop', usage = { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 }) =>
  ({ choices: [{ message, finish_reason: reason }], usage })
const call = (args = '{"topic":"Git"}', name = 'echo_research_topic', id = 'stub-call') =>
  ({ id, type: 'function', function: { name, arguments: args } })
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(ready)
  async function cookie() {
    const response = await fetch(`${base}/api/auth/register`, { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `stub${Date.now()}${Math.floor(Math.random() * 1000)}`, password: 'LocalTestPassword123!' }) })
    assert.equal(response.status, 201)
    return response.headers.get('set-cookie').split(';')[0]
  }
  async function run(responses) {
    queue.push(...responses)
    const before = requests.length
    const response = await fetch(`${base}/api/agent/run`, { method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: await cookie() },
      body: JSON.stringify({ goal: 'Git', demo: 'tool' }) })
    assert.equal(response.status, 200)
    return { result: await response.json(), sent: requests.slice(before) }
  }
  let checked = 0
  const direct = await run([finish({ role: 'assistant', content: 'direct' })])
  assert.equal(direct.result.status, 'completed'); assert.equal(direct.result.modelCalls, 1)
  assert.equal(direct.result.toolCalls, 0); assert.deepEqual(direct.result.finishReasons, ['stop'])
  assert.equal(direct.sent[0].tool_choice, 'auto'); assert.equal(direct.sent[0].parallel_tool_calls, false)
  assert.equal(direct.sent[0].enable_thinking, false); checked++
  const roundtrip = await run([finish({ role: 'assistant', content: null, tool_calls: [call()] }, 'tool_calls'),
    finish({ role: 'assistant', content: 'complete' })])
  assert.equal(roundtrip.result.status, 'completed'); assert.equal(roundtrip.result.modelCalls, 2)
  assert.equal(roundtrip.result.toolCalls, 1); assert.equal(roundtrip.result.totalTokens, 10)
  assert.equal(roundtrip.sent[1].messages.at(-1).role, 'tool')
  assert.equal(roundtrip.sent[1].messages.at(-1).tool_call_id, 'stub-call'); checked++
  for (const [response, error] of [
    [finish({ role: 'assistant', content: null, tool_calls: [call('{}', 'invented')] }, 'tool_calls'), 'UNKNOWN_TOOL'],
    [finish({ role: 'assistant', content: null, tool_calls: [call('{')] }, 'tool_calls'), 'INVALID_ARGUMENT_JSON'],
    [finish({ role: 'assistant', content: null, tool_calls: [call('{"topic":"Git","ownerId":123}')] }, 'tool_calls'), 'INVALID_ARGUMENT_SCHEMA'],
    [finish({ role: 'assistant', content: null, tool_calls: [call(), call('{}', 'invented', 'second')] }, 'tool_calls'), 'MULTIPLE_OR_INVALID_TOOL_CALLS'],
    [finish({ role: 'assistant', content: null, tool_calls: [call('{}', 'echo_research_topic', '')] }, 'tool_calls'), 'INVALID_TOOL_CALL_ID'],
    [finish({ role: 'assistant', content: 'truncated' }, 'length'), 'UPSTREAM'],
    [finish({ role: 'assistant', content: 'bad usage' }, 'stop', { total_tokens: 'five' }), 'UPSTREAM'],
    [{ status: 401, body: { error: 'private provider response' } }, 'UNAUTHORIZED'],
    [{ status: 503, body: { error: 'private provider response' } }, 'UPSTREAM'],
  ]) {
    const outcome = await run([response])
    assert.equal(outcome.result.status, 'failed'); assert.equal(outcome.result.error, error)
    assert.equal(outcome.result.toolCalls, 0); checked++
  }
  const timeout = await run([{ delay: 1300, body: finish({ role: 'assistant', content: 'late' }) }])
  assert.equal(timeout.result.status, 'failed'); assert.equal(timeout.result.error, 'TIMEOUT'); checked++
  console.log(`PASS: ${checked} local Provider Stub Route cases; direct/tool roundtrip, strict failures, 401/5xx, timeout`)
} finally {
  app.kill()
  stub.closeAllConnections(); stub.close()
}
