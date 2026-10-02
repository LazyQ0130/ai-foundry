import assert from 'node:assert/strict'
import test from 'node:test'
import { runAgent } from './common/lib/agent-runtime.ts'

const call = (args = '{"topic":"Git"}', name = 'echo_research_topic', id = 'call-1') =>
  ({ id, type: 'function', function: { name, arguments: args } })
const tool = (calls = [call()]) => ({ finishReason: 'tool_calls', content: null, toolCalls: calls, usage: null })
const answer = () => ({ finishReason: 'stop', content: 'done', toolCalls: [], usage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 } })
const run = (model, extra = {}) => runAgent({ goal: 'Git', model, reserve: () => true, ...extra })

test('direct answer uses one model call and no tool', async () => {
  let calls = 0
  const result = await run(async () => { calls++; return answer() })
  assert.equal(result.status, 'completed'); assert.equal(calls, 1)
  assert.equal(result.modelCalls, 1); assert.equal(result.toolCalls, 0); assert.equal(result.totalTokens, 5)
})
test('one validated tool returns as role:tool then reaches final answer', async () => {
  const seen = []; let executed = 0
  const result = await run(async (messages, tools) => {
    seen.push(messages)
    assert.deepEqual(tools.map(item => item.function.name), ['echo_research_topic'])
    return seen.length === 1 ? tool() : answer()
  }, { onToolExecution: () => executed++ })
  assert.equal(result.status, 'completed'); assert.equal(result.modelCalls, 2)
  assert.equal(result.toolCalls, 1); assert.equal(executed, 1)
  assert.equal(seen[1].at(-1).role, 'tool')
  assert.deepEqual(JSON.parse(seen[1].at(-1).content), { topic: 'Git', message: '已收到研究主题：Git' })
  assert.equal(seen[1][0].role, 'system')
})
test('unknown, malformed, missing, wrong type, extra, oversized and missing id never execute', async () => {
  const bad = [call('{}', 'invented'), call('{'), call('{}'), call('{"topic":42}'),
    call('{"topic":"Git","ownerId":123}'), call(JSON.stringify({ topic: 'a'.repeat(2100) })), call('{"topic":"Git"}', 'echo_research_topic', '')]
  for (const item of bad) {
    let executed = 0
    const result = await run(async () => tool([item]), { onToolExecution: () => executed++ })
    assert.equal(result.status, 'failed'); assert.equal(result.toolCalls, 0); assert.equal(executed, 0)
  }
})
test('multiple calls reject whole turn, including a valid first call', async () => {
  let executed = 0
  const result = await run(async () => tool([call(), call('{"topic":"RAG"}', 'echo_research_topic', 'call-2')]),
    { onToolExecution: () => executed++ })
  assert.equal(result.status, 'failed'); assert.equal(result.error, 'MULTIPLE_OR_INVALID_TOOL_CALLS')
  assert.equal(executed, 0)
})
test('step and tool limits stop a repeating model', async () => {
  const model = async () => tool()
  assert.equal((await run(model, { maxAgentSteps: 2 })).status, 'max_steps')
  assert.equal((await run(model, { maxToolCalls: 2 })).status, 'max_tools')
})
test('budget reserves before each real model call and never starts an unreserved call', async () => {
  let modelCalls = 0, reservations = 0
  const result = await run(async () => { modelCalls++; return tool() },
    { reserve: () => ++reservations === 1 })
  assert.equal(result.status, 'budget_exhausted'); assert.equal(modelCalls, 1)
  assert.equal(result.providerUnits, 1); assert.equal(reservations, 2)
  let blockedCalls = 0
  const blocked = await run(async () => { blockedCalls++; return answer() }, { reserve: () => false })
  assert.equal(blocked.status, 'budget_exhausted'); assert.equal(blockedCalls, 0)
})
test('pre-abort and mid-call abort prevent later tool/model work', async () => {
  const pre = new AbortController(); pre.abort()
  let calls = 0, executed = 0
  const before = await run(async () => { calls++; return tool() }, { signal: pre.signal, onToolExecution: () => executed++ })
  assert.equal(before.status, 'cancelled'); assert.equal(calls, 0)
  const mid = new AbortController()
  const during = await run(async () => { calls++; mid.abort(); return tool() },
    { signal: mid.signal, onToolExecution: () => executed++ })
  assert.equal(during.status, 'cancelled'); assert.equal(calls, 1); assert.equal(executed, 0)
})
test('invalid finish reason and tool structure fail closed', async () => {
  for (const turn of [
    { ...answer(), finishReason: 'length' }, { ...answer(), toolCalls: {} },
    { ...tool(), finishReason: 'stop' }, { ...tool(), toolCalls: [] },
  ]) assert.equal((await run(async () => turn)).status, 'failed')
})
