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
const stub = createServer(async (request, response) => {
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  lastRequest = JSON.parse(Buffer.concat(chunks).toString())
  lastAuthorization = request.headers.authorization
  const input = lastRequest.messages?.[0]?.content
  if (input === 'unauthorized') {
    response.writeHead(401, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: { message: 'sensitive provider text' } }))
    return
  }
  if (input === 'failure') {
    response.writeHead(500, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ error: { message: 'sensitive provider text' } }))
    return
  }
  if (input === 'slow') await delay(1300)
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ choices: [{ message: { content: '简短回答' } }], usage: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 } }))
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
  const denied = await post('unauthorized', realCookie)
  assert.equal(denied.status, 502)
  assert(!denied.text.includes('sensitive provider text') && !denied.text.includes(testKey))
  const failed = await post('failure', realCookie)
  assert.equal(failed.status, 502)
  assert(!failed.text.includes('sensitive provider text'))
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
  console.log('PASS: Mock, validation, auth, origin, rate limit, config, sanitized Real errors, secret boundary, payload, timeout')
} finally {
  await stop()
  stub.close()
}
