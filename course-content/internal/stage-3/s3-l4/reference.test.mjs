// Run against an assembled, built A or B reference and an isolated test database.
// Example: TEST_DATABASE_URL=<isolated URL> node reference.test.mjs <assembled-project-path>
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import path from 'node:path'

const project = process.argv[2]
if (!project || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage3_l1')) {
  throw new Error('Use an assembled reference and the isolated stage3_l1 database')
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
let lastRequest = null
let lastAuthorization = null
let providerSocketClosedOnCancel = false
const stub = createServer(async (request, response) => {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  lastRequest = JSON.parse(Buffer.concat(chunks).toString())
  lastAuthorization = request.headers.authorization
  const input = lastRequest.messages?.[0]?.content
  if (input === 'unauthorized' || input?.includes('UNAUTHORIZED')) {
    response.writeHead(401, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: { message: 'sensitive provider text' } }))
    return
  }
  if (input === 'failure' || (input?.includes('FAILURE') && input !== 'PARTIAL_FAILURE')) {
    response.writeHead(500, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: { message: 'sensitive provider text' } }))
    return
  }
  if (input === 'slow') await delay(1300)
  if (lastRequest.stream === true) {
    if (input === 'CANCEL_TEST') response.on('close', () => { providerSocketClosedOnCancel = !response.writableEnded })
    response.writeHead(200, { 'Content-Type': 'text/event-stream' })
    const send = value => response.write(`data: ${JSON.stringify(value)}\n\n`)
    send({ choices: [{ delta: { content: 'Git ' } }] })
    await delay(input === 'CANCEL_TEST' ? 800 : 80)
    if (response.destroyed) return
    if (input === 'PARTIAL_FAILURE') { response.write('data: {bad}\n\n'); response.end(); return }
    if (input === 'UNEXPECTED_CLOSE') { response.end(); return }
    send({ choices: [{ delta: { content: '可以记录版本' } }] })
    send({ choices: [], usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 } })
    response.end('data: [DONE]\n\n')
    return
  }
  let content = '简短回答'
  if (lastRequest.response_format?.type === 'json_object') {
    const valid = { summary: '测试', tags: ['Git'], confidence: 0.9 }
    const cases = {
      INVALID_JSON: '{ summary:',
      MISSING_FIELD: JSON.stringify({ summary: '测试', tags: ['Git'] }),
      WRONG_TYPE: JSON.stringify({ ...valid, tags: 'Git' }),
      STRING_CONFIDENCE: JSON.stringify({ ...valid, confidence: '0.9' }),
      OUT_OF_RANGE: JSON.stringify({ ...valid, confidence: 2 }),
      EXTRA_FIELD: JSON.stringify({ ...valid, extra: true }),
      CODE_FENCE: `\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``,
    }
    content = Object.entries(cases).find(([marker]) => input.includes(marker))?.[1] ?? JSON.stringify(valid)
  }
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 } }))
})
stub.listen(0, '127.0.0.1')
await once(stub, 'listening')
const stubPort = stub.address().port

let app = null
const port = 32317
const base = `http://127.0.0.1:${port}`
async function start(env) {
  app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: project,
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, ...env },
    stdio: 'ignore',
    windowsHide: true,
  })
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Next server exited')
    try { if ((await fetch(base)).ok) return } catch { /* starting */ }
    await delay(100)
  }
  throw new Error('Next server did not start')
}
async function stop() {
  if (!app) return
  app.kill()
  await Promise.race([once(app, 'exit'), delay(3000)])
  app = null
  await delay(200)
}
async function post(input, cookie = '', extra = {}) {
  const response = await fetch(`${base}/api/ai/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie, ...extra },
    body: JSON.stringify({ input, key: 'client-key-must-be-ignored', model: 'client-model-must-be-ignored', max_tokens: 99999 }),
  })
  return { status: response.status, text: await response.text() }
}
async function suggest(content, cookie = '', extra = {}) {
  const response = await fetch(`${base}/api/ai/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie, ...extra },
    body: JSON.stringify({ content, model: 'client-model-must-be-ignored', schema: { extra: true }, max_tokens: 99999, apiKey: 'client-key-must-be-ignored' }),
  })
  return { status: response.status, text: await response.text() }
}
async function streamed(input, cookie = '', extra = {}) {
  const response = await fetch(`${base}/api/ai/stream`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, ...extra },
    body: JSON.stringify({ input, model: 'ignored-client-model', apiKey: 'ignored-client-key', max_tokens: 9999 }),
  })
  const raw = await response.text()
  return { status: response.status, raw, events: response.ok ? raw.trim().split('\n').map(line => JSON.parse(line)) : [] }
}
async function user() {
  const response = await fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `u${Date.now()}${Math.floor(Math.random() * 1000)}`, password: 'TestPassword123!' }),
  })
  assert.equal(response.status, 201)
  return response.headers.get('set-cookie').split(';')[0]
}

try {
  await start({ AI_PROVIDER_MODE: 'mock' })
  assert.equal((await post('hello')).status, 401, 'login required')
  const cookie = await user()
  const otherCookie = await user()
  const resourceRequest = (method, resourcePath, authCookie, data) => fetch(`${base}${resourcePath}`, {
    method, headers: { Cookie: authCookie, ...(data ? { 'Content-Type': 'application/json' } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
  const original = { title: 'Stage 2 retained', desc: 'CRUD check', tag: '工具' }
  const created = await resourceRequest('POST', '/api/resources', cookie, original)
  assert.equal(created.status, 201, 'Stage 2 create retained')
  const createdBody = await created.json()
  const id = createdBody.resource.id
  assert.equal((await resourceRequest('GET', '/api/resources', cookie)).status, 200)
  const otherList = await (await resourceRequest('GET', '/api/resources', otherCookie)).json()
  assert(!otherList.resources.some(item => item.id === id), 'Alice/Bob isolation retained')
  assert.equal((await resourceRequest('PATCH', `/api/resources/${id}`, otherCookie, { ...original, important: true })).status, 404)
  assert.equal((await resourceRequest('PATCH', `/api/resources/${id}`, cookie, { ...original, important: true })).status, 200)
  assert.equal((await resourceRequest('DELETE', `/api/resources/${id}`, cookie)).status, 200)
  assert.equal((await post('hello', cookie, { Origin: 'https://evil.invalid' })).status, 403, 'cross-origin denied')
  assert.equal((await post('  ', cookie)).status, 400, 'blank denied')
  assert.equal((await post('x'.repeat(2001), cookie)).status, 400, 'long input denied')
  const first = await post('Git', cookie)
  const second = await post('Git', cookie)
  assert.equal(first.status, 200)
  assert.equal(first.text, second.text, 'Mock deterministic')
  assert.equal(JSON.parse(first.text).kind, 'mock')
  for (let i = 0; i < 3; i++) assert.equal((await post(`test${i}`, cookie)).status, 200)
  assert.equal((await post('sixth', cookie)).status, 429, 'per-user limit')
  const suggestionCookie = await user()
  const before = await (await resourceRequest('GET', '/api/resources', suggestionCookie)).json()
  assert.equal((await suggest('hello')).status, 401, 'suggestion login required')
  assert.equal((await suggest('hello', suggestionCookie, { Origin: 'https://evil.invalid' })).status, 403, 'suggestion cross-origin denied')
  assert.equal((await suggest('   ', suggestionCookie)).status, 400, 'suggestion blank denied')
  assert.equal((await suggest('x'.repeat(3001), suggestionCookie)).status, 400, 'suggestion oversized denied')
  const mockFirst = await suggest('Git', suggestionCookie)
  const mockSecond = await suggest('Git', suggestionCookie)
  assert.equal(mockFirst.status, 200)
  assert.equal(mockFirst.text, mockSecond.text, 'structured Mock deterministic')
  assert.deepEqual(JSON.parse(mockFirst.text).suggestion, { summary: '这是 Mock 模式的结构化建议。', tags: ['Mock', '示例'], confidence: 0.8 })
  assert.equal(JSON.parse(mockFirst.text).kind, 'mock')
  assert.equal((await post('shared-limit', suggestionCookie)).status, 200, 'old answer route shares AI limit')
  assert.equal((await suggest('Git', suggestionCookie)).status, 200)
  assert.equal((await suggest('fifth', suggestionCookie)).status, 200)
  assert.equal((await suggest('sixth', suggestionCookie)).status, 429, 'shared rate limit')
  const after = await (await resourceRequest('GET', '/api/resources', suggestionCookie)).json()
  assert.deepEqual(after.resources, before.resources, 'suggestion never writes Resources')
  assert.equal((await streamed('Git')).status, 401)
  const streamCookie = await user()
  assert.equal((await streamed('Git', streamCookie, { Origin: 'https://evil.invalid' })).status, 403)
  assert.equal((await streamed('  ', streamCookie)).status, 400)
  assert.equal((await streamed('x'.repeat(2001), streamCookie)).status, 400)
  const mockStream = await streamed('Git', streamCookie)
  assert.equal(mockStream.status, 200)
  assert.deepEqual(mockStream.events.map(event => event.type), ['meta', 'delta', 'delta', 'delta', 'delta', 'done'])
  assert.equal(mockStream.events[0].kind, 'mock')
  assert.equal((await streamed('Git', streamCookie)).status, 200)
  assert.equal((await streamed('Git', streamCookie)).status, 200)
  assert.equal((await streamed('Git', streamCookie)).status, 200)
  assert.equal((await post('shared-limit', streamCookie)).status, 200)
  assert.equal((await streamed('sixth', streamCookie)).status, 429)
  await stop()

  await start({ AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_CHAT_API_KEY: '', AI_CHAT_MODEL: 'qwen3.7-flash' })
  const missingCookie = await user()
  assert.equal((await post('hello', missingCookie)).status, 503, 'missing config')
  await stop()

  const testKey = 'test-only-secret-never-return'
  await start({ AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_CHAT_API_KEY: testKey, AI_CHAT_MODEL: 'qwen3.7-flash', AI_TIMEOUT_MS: '20000', AI_CHAT_DISABLE_THINKING: '1' })
  const realCookie = await user()
  const success = await post('Git', realCookie)
  assert.equal(success.status, 200)
  assert.deepEqual(JSON.parse(success.text), { ok: true, kind: 'real', text: '简短回答', usage: { promptTokens: 3, completionTokens: 4, totalTokens: 7 } })
  assert.equal(lastAuthorization, `Bearer ${testKey}`)
  assert.equal(lastRequest.model, 'qwen3.7-flash')
  assert.equal(lastRequest.max_tokens, 256)
  assert.equal(lastRequest.enable_thinking, false)
  assert.equal(lastRequest.messages[0].content, 'Git')
  assert(!success.text.includes(testKey))
  const structured = await suggest('Git', realCookie)
  assert.equal(structured.status, 200)
  assert.deepEqual(JSON.parse(structured.text), { ok: true, kind: 'real', suggestion: { summary: '测试', tags: ['Git'], confidence: 0.9 }, usage: { promptTokens: 3, completionTokens: 4, totalTokens: 7 } })
  assert.equal(lastRequest.response_format?.type, 'json_object')
  assert.equal(lastRequest.model, 'qwen3.7-flash')
  assert.equal(lastRequest.max_tokens, 256)
  assert.equal(lastRequest.enable_thinking, false)
  assert(lastRequest.messages[0].content.includes('JSON object'))
  assert(!structured.text.includes(testKey))
  const badCases = ['INVALID_JSON', 'MISSING_FIELD', 'WRONG_TYPE', 'STRING_CONFIDENCE', 'OUT_OF_RANGE', 'EXTRA_FIELD', 'CODE_FENCE']
  for (const marker of badCases) {
    const badCookie = await user()
    const bad = await suggest(marker, badCookie)
    assert.equal(bad.status, 502, marker)
    assert(JSON.parse(bad.text).error.includes('结构不符合要求'), marker)
    assert(!bad.text.includes(marker) && !bad.text.includes(testKey), marker)
  }
  for (const marker of ['UNAUTHORIZED', 'FAILURE']) {
    const errorCookie = await user()
    const bad = await suggest(marker, errorCookie)
    assert.equal(bad.status, 502)
    assert(!bad.text.includes('sensitive provider text') && !bad.text.includes(testKey))
  }
  const denied = await post('unauthorized', realCookie)
  assert.equal(denied.status, 502)
  assert(!denied.text.includes('sensitive provider text') && !denied.text.includes(testKey))
  const failed = await post('failure', realCookie)
  assert.equal(failed.status, 502)
  assert(!failed.text.includes('sensitive provider text'))
  const realStreamCookie = await user()
  const realStream = await streamed('Git', realStreamCookie)
  assert.equal(realStream.status, 200)
  assert.equal(realStream.events[0].kind, 'real')
  assert.deepEqual(realStream.events.map(event => event.type), ['meta', 'delta', 'delta', 'usage', 'done'])
  assert.equal(realStream.events.at(-2).totalTokens, 7)
  assert.equal(lastRequest.stream, true)
  assert.equal(lastRequest.stream_options.include_usage, true)
  assert.equal(lastRequest.max_tokens, 256)
  assert.equal(lastRequest.enable_thinking, false)
  assert.equal(lastRequest.model, 'qwen3.7-flash')
  assert(!realStream.raw.includes(testKey) && !realStream.raw.includes('sensitive provider text'))
  const cancelledResponse = await fetch(`${base}/api/ai/stream`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: realStreamCookie },
    body: JSON.stringify({ input: 'CANCEL_TEST' }),
  })
  assert.equal(cancelledResponse.status, 200)
  const cancelledReader = cancelledResponse.body.getReader()
  const initial = await cancelledReader.read()
  assert(initial.value?.length > 0)
  await cancelledReader.cancel()
  await delay(200)
  assert(providerSocketClosedOnCancel, 'browser cancel closes upstream Provider connection')
  const badStreamCookie = await user()
  for (const marker of ['unauthorized', 'failure']) {
    const bad = await streamed(marker, badStreamCookie)
    assert.equal(bad.status, 502)
    assert(!bad.raw.includes(testKey) && !bad.raw.includes('sensitive provider text'))
  }
  for (const marker of ['PARTIAL_FAILURE', 'UNEXPECTED_CLOSE']) {
    const partial = await streamed(marker, badStreamCookie)
    assert.equal(partial.status, 200)
    assert.deepEqual(partial.events.map(event => event.type), ['meta', 'delta', 'error'])
    assert(!partial.raw.includes('{bad') && !partial.raw.includes(testKey))
  }
  await stop()

  for (const invalidTimeout of ['999', '30001']) {
    await start({ AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_CHAT_API_KEY: testKey, AI_CHAT_MODEL: 'qwen3.7-flash', AI_TIMEOUT_MS: invalidTimeout })
    const timeoutCookie = await user()
    assert.equal((await post('Git', timeoutCookie)).status, 503, 'timeout config bounds')
    await stop()
  }
  await start({ AI_PROVIDER_MODE: 'real', AI_CHAT_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`, AI_CHAT_API_KEY: testKey, AI_CHAT_MODEL: 'qwen3.7-flash', AI_TIMEOUT_MS: '1000' })
  const timeoutCookie = await user()
  assert.equal((await post('slow', timeoutCookie)).status, 504, 'controlled timeout')
  await stop()
  console.log('PASS: Stage 3.1 answer; Stage 3.2 structured; Stage 3.3 Mock/Real stream, auth, origin, shared limit, Provider error before/after partial, Resource isolation, secrets, timeout')
} finally {
  await stop()
  stub.close()
}
