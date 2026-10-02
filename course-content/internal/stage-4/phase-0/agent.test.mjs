import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createChatProvider } from './provider/client.mjs'
import { runAgent } from './agent-loop.mjs'
import { validateToolCall } from './tool-registry.mjs'
import { signProposal, verifyProposal } from './approval.mjs'

const call = (args = '{"topic":"RAG"}', name = 'echo_research_topic', id = 'call-1') =>
  ({ id, type: 'function', function: { name, arguments: args } })
const turn = (message, finish_reason = 'stop', tokens = 5) =>
  ({ choices: [{ message, finish_reason }], usage: { prompt_tokens: 2, completion_tokens: 3, total_tokens: tokens } })
async function stub(responses, callback) {
  const bodies = []
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk
    bodies.push(JSON.parse(raw))
    const next = responses.shift()
    if (next === 'hang') return
    res.writeHead(next?.status ?? 200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(next?.body ?? next))
  })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  try {
    const provider = createChatProvider({ baseUrl: `http://127.0.0.1:${server.address().port}`, apiKey: 'stub-only', model: 'stub', timeoutMs: 30 })
    await callback(provider, bodies)
  } finally { server.closeAllConnections(); server.close(); await once(server, 'close') }
}
test('direct answer and full tool result roundtrip', async () => {
  await stub([turn({ role: 'assistant', content: 'hello' })], async (provider, bodies) => {
    const result = await runAgent({ question: 'explain', provider, reserve: async () => true })
    assert.equal(result.status, 'completed'); assert.equal(result.modelCalls, 1)
    assert.equal(bodies[0].tool_choice, 'auto'); assert.equal(bodies[0].parallel_tool_calls, false)
  })
  await stub([turn({ role: 'assistant', content: null, tool_calls: [call()] }, 'tool_calls'),
    turn({ role: 'assistant', content: 'RAG summarized' })], async (provider, bodies) => {
    const result = await runAgent({ question: 'Research RAG', provider, reserve: async () => true })
    assert.equal(result.status, 'completed'); assert.equal(result.toolCalls, 1); assert.equal(result.modelCalls, 2)
    assert.equal(result.providerUnits, 2); assert.equal(result.totalTokens, 10)
    assert.deepEqual(JSON.parse(bodies[1].messages.at(-1).content), { topic: 'RAG', normalized: 'rag' })
    assert.equal(bodies[1].messages.at(-1).role, 'tool')
  })
})
test('tool call input is untrusted', () => {
  for (const bad of [call('{'), call('{}'), call('{"topic":4}'), call('{"topic":"RAG","ownerId":"Bob"}'),
    call(JSON.stringify({ topic: 'x'.repeat(2100) })), call('', 'echo_research_topic'), call('{}', 'unknown'), call('{}', 'echo_research_topic', '')]) {
    assert.throws(() => validateToolCall(bad))
  }
})
test('multiple calls, provider failures, timeout, limits, budget and cancellation stop safely', async () => {
  for (const [response, expected] of [
    [turn({ role: 'assistant', tool_calls: [call(), call('{}', 'other', 'call-2')] }, 'tool_calls'), 'MULTIPLE_OR_INVALID_TOOL_CALLS'],
    [{ status: 401 }, 'PROVIDER_401'], [{ status: 503 }, 'PROVIDER_HTTP_ERROR'],
    [turn({ role: 'assistant', tool_calls: [call('{"topic":3}') ] }, 'tool_calls'), 'INVALID_ARGUMENT_SCHEMA'],
    [turn({ role: 'assistant', tool_calls: [call('{}', 'other')] }, 'tool_calls'), 'UNKNOWN_TOOL'],
  ]) await stub([response], async provider => {
    const result = await runAgent({ question: 'research', provider, reserve: async () => true })
    assert.equal(result.status, 'failed'); assert.equal(result.error, expected)
  })
  await stub(['hang'], async provider => {
    const result = await runAgent({ question: 'research', provider, reserve: async () => true })
    assert.equal(result.error, 'TIMEOUT')
  })
  await stub([], async provider => {
    assert.equal((await runAgent({ question: 'q', provider, reserve: async () => false })).status, 'budget_exhausted')
    const controller = new AbortController(); controller.abort()
    assert.equal((await runAgent({ question: 'q', provider, reserve: async () => true, signal: controller.signal })).status, 'cancelled')
  })
  await stub(['hang'], async provider => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5)
    const result = await runAgent({ question: 'q', provider, reserve: async () => true, signal: controller.signal })
    assert.equal(result.status, 'cancelled')
  })
  await stub([turn({ role: 'assistant', tool_calls: [call()] }, 'tool_calls')], async provider => {
    assert.equal((await runAgent({ question: 'q', provider, reserve: async () => true, maxSteps: 1 })).status, 'max_steps')
  })
  await stub(Array.from({ length: 4 }, () => turn({ role: 'assistant', tool_calls: [call()] }, 'tool_calls')), async provider => {
    assert.equal((await runAgent({ question: 'q', provider, reserve: async () => true, maxSteps: 4 })).status, 'max_tools')
  })
})
test('signed approval binds exact action; pure token remains replayable', () => {
  const secret = 'a'.repeat(32), args = { title: 'RAG', content: 'note' }, now = Date.now()
  const signed = signProposal({ userId: 'alice', args, expiresAt: now + 5000, secret })
  const verify = changes => verifyProposal({ token: signed.token, userId: 'alice', toolName: 'save_research_note', args, secret, now, ...changes })
  assert.deepEqual(verify().args, args)
  assert.deepEqual(verify().args, args) // Signed tokens alone cannot prevent replay.
  for (const changes of [{ args: { ...args, content: 'swapped' } }, { toolName: 'delete_all' },
    { userId: 'bob' }, { now: now + 5001 }, { token: signed.token.slice(0, -1) + 'x' }]) assert.throws(() => verify(changes))
})
