import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import { createMockProvider, createRealProvider, parseSuggestion } from './provider.mjs'

let server
let base
let mode = 'ok'
before(async () => {
  server = createServer(async (req, res) => {
    assert.equal(req.headers.authorization, 'Bearer test-only-key')
    if (mode === '401') { res.writeHead(401); res.end('invalid'); return }
    if (mode === '503') { res.writeHead(503); res.end('provider failure'); return }
    if (mode === 'timeout') { await new Promise(resolve => setTimeout(resolve, 9000)); res.end(); return }
    if (req.url.endsWith('/embeddings')) {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ data: [{ embedding: [0.1, 0.2, 0.3] }], usage: { total_tokens: 2 } }))
      return
    }
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = JSON.parse(Buffer.concat(chunks).toString())
    if (body.stream) {
      res.setHeader('Content-Type', 'text/event-stream')
      res.write('data: {"choices":[{"delta":{"content":"first"}}]}\n\n')
      await new Promise(resolve => setTimeout(resolve, 30))
      res.write('data: {"choices":[{"delta":{"content":" second"}}]}\n\n')
      res.end('data: [DONE]\n\n')
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ choices: [{ message: { content: 'real answer' } }], usage: { total_tokens: 3 } }))
    }
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}/v1`
  for (const prefix of ['AI_CHAT', 'AI_EMBEDDING']) {
    process.env[`${prefix}_BASE_URL`] = base
    process.env[`${prefix}_API_KEY`] = 'test-only-key'
    process.env[`${prefix}_MODEL`] = 'test-model'
  }
  process.env.AI_EMBEDDING_DIMENSION = '3'
})
after(() => server.close())

test('mock is deterministic and visibly labelled', async () => {
  const mock = createMockProvider(3)
  assert.deepEqual(await mock.embed('hello'), await mock.embed('hello'))
  assert.match((await mock.generate('hello')).text, /^MOCK:/)
  assert.deepEqual((await Array.fromAsync(mock.stream('hello'))).map(x => x.text), ['MOCK: ', 'hello'])
})
test('schema rejects invalid model output', () => {
  assert.deepEqual(parseSuggestion('{"summary":"s","tags":["t"],"confidence":0.5}').tags, ['t'])
  for (const raw of ['{', '{"summary":"s","tags":["t"]}', '{"summary":"s","tags":"t","confidence":0.5}', '{"summary":"s","tags":["t"],"confidence":2}', '{"summary":"s","tags":["t"],"confidence":0.5,"extra":true}']) assert.throws(() => parseSuggestion(raw))
})
test('real adapter contract against isolated local HTTP stub', async () => {
  const real = createRealProvider()
  const generated = await real.generate('hello')
  assert.equal(generated.status, 200)
  assert.equal(generated.usage.total_tokens, 3)
  const embedded = await real.embed('hello')
  assert.equal(embedded.status, 200)
  assert.deepEqual(embedded.vector, [0.1, 0.2, 0.3])
  const parts = []
  for await (const part of real.stream('hello')) parts.push(part.text)
  assert.deepEqual(parts, ['first', ' second'])
})
test('401, provider error, input limit and cancellation', async () => {
  const real = createRealProvider()
  mode = '401'; await assert.rejects(real.generate('hello'), /PROVIDER_UNAUTHORIZED/)
  mode = '503'; await assert.rejects(real.generate('hello'), /PROVIDER_HTTP_503/)
  mode = 'ok'; await assert.rejects(real.generate('x'.repeat(2001)), /INPUT_LIMIT/)
  const controller = new AbortController(); controller.abort()
  await assert.rejects(real.generate('hello', { signal: controller.signal }), /CANCELLED/)
})
test('timeout and embedding dimension mismatch', async () => {
  const real = createRealProvider()
  process.env.AI_EMBEDDING_DIMENSION = '4'
  await assert.rejects(real.embed('hello'), /EMBEDDING_DIMENSION_MISMATCH/)
  process.env.AI_EMBEDDING_DIMENSION = '3'
  mode = 'timeout'
  await assert.rejects(real.generate('hello'), /PROVIDER_TIMEOUT/)
  mode = 'ok'
})
