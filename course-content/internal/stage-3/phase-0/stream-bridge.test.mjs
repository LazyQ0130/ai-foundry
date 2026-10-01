import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { test } from 'node:test'
import { createMockProvider } from './provider.mjs'
import { createLatestResponseState, createStreamBridge } from './stream-bridge.mjs'

test('server to browser chunks, abort and stale response protection', async () => {
  let disconnected = false
  const provider = {
    ...createMockProvider(),
    async *stream(_input, { signal }) {
      yield { text: 'one' }
      await new Promise(resolve => setTimeout(resolve, 80))
      if (signal.aborted) { disconnected = true; return }
      yield { text: 'two' }
    },
  }
  const server = createServer(createStreamBridge(provider))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${server.address().port}/api/ai/stream`
  const fetcher = (input, signal) => fetch(url, { method: 'POST', body: JSON.stringify({ input }), signal })
  try {
    const full = await fetcher('hello')
    assert.equal(await full.text(), 'onetwo')
    const controller = new AbortController()
    const partial = await fetcher('hello', controller.signal)
    const reader = partial.body.getReader()
    assert.equal(new TextDecoder().decode((await reader.read()).value), 'one')
    controller.abort()
    await assert.rejects(reader.read())
    await new Promise(resolve => setTimeout(resolve, 120))
    assert.equal(disconnected, true)

    const state = createLatestResponseState()
    const output = []
    const first = state.run(fetcher, 'old', text => output.push(text)).catch(() => {})
    await new Promise(resolve => setTimeout(resolve, 10))
    const second = state.run(fetcher, 'new', text => output.push(text))
    await Promise.all([first, second])
    assert.equal(output.join(''), 'oneonetwo') // first chunk preceded the newer request; its later chunk was dropped
  } finally { await new Promise(resolve => server.close(resolve)) }
})

test('provider failure terminates browser stream', async () => {
  const server = createServer(createStreamBridge({
    async *stream() { yield { text: 'first' }; throw new Error('simulated provider error') },
  }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    await assert.rejects(async () => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/ai/stream`, { method: 'POST', body: JSON.stringify({ input: 'hello' }) })
      await response.text()
    })
  } finally { await new Promise(resolve => server.close(resolve)) }
})
