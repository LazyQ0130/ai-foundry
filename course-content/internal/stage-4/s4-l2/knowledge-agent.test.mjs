import assert from 'node:assert/strict'
import test from 'node:test'
import { runAgent } from './common/lib/agent-runtime.ts'
import { modelTools, searchKnowledge, validateToolCall, ToolBudgetExhaustedError } from './common/lib/agent-tools.ts'

const call = (argumentsText = '{"query":"Git 恢复版本"}') => ({ id: 'search-1', type: 'function', function: {
  name: 'search_knowledge', arguments: argumentsText,
} })
const toolTurn = item => ({ finishReason: 'tool_calls', content: null, toolCalls: [item], usage: null })
const answer = { finishReason: 'stop', content: '根据我的资料回答', toolCalls: [], usage: null }

test('search_knowledge exposes query only and rejects forged identity and malformed inputs', () => {
  const visible = modelTools.find(tool => tool.function.name === 'search_knowledge')
  assert.deepEqual(Object.keys(visible.function.parameters.properties), ['query'])
  assert.equal(visible.function.parameters.additionalProperties, false)
  assert.equal(validateToolCall(call(' { "query": " Git " } ')).args.query, 'Git')
  for (const args of ['{}', '{', '{"query":42}', '{"query":"   "}',
    '{"query":"Git","ownerId":2}', '{"query":"Git","userId":2}',
    JSON.stringify({ query: 'x'.repeat(1001) })]) assert.throws(() => validateToolCall(call(args)))
})

async function withFakeSearch(body) {
  const original = searchKnowledge.execute
  let embeddingCalls = 0
  searchKnowledge.execute = async (_input, context) => {
    assert.equal(context.userId, 17)
    if (context.signal?.aborted) throw new Error('CANCELLED')
    if (!context.reserveProviderUnit?.('embedding')) throw new ToolBudgetExhaustedError()
    if (context.signal?.aborted) throw new Error('CANCELLED')
    context.onEmbeddingStart?.(); embeddingCalls++
    return { matches: [{ title: 'Alice', position: 0, preview: 'safe', similarity: 0.9 }] }
  }
  try { return await body(() => embeddingCalls) } finally { searchKnowledge.execute = original }
}

test('full search roundtrip keeps result as role:tool and counts 2 model + 1 embedding units', async () => withFakeSearch(async embeddingCount => {
  const seen = []
  const result = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
    reserve: () => true, reserveEmbedding: () => true,
    model: async messages => { seen.push(messages); return seen.length === 1 ? toolTurn(call()) : answer },
  })
  assert.equal(result.status, 'completed')
  assert.equal(result.modelCalls, 2); assert.equal(result.embeddingCalls, 1)
  assert.equal(result.toolCalls, 1); assert.equal(result.providerUnits, 3)
  assert.equal(embeddingCount(), 1)
  assert.equal(seen[1].at(-1).role, 'tool')
  assert.deepEqual(JSON.parse(seen[1].at(-1).content), { matches: result.searchMatches })
}))

test('budget A/B/C stops before the next provider work', async () => withFakeSearch(async embeddingCount => {
  let modelCalls = 0
  const model = async () => { modelCalls++; return toolTurn(call()) }
  const a = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
    reserve: () => false, reserveEmbedding: () => true, model })
  assert.equal(a.status, 'budget_exhausted'); assert.equal(a.modelCalls, 0); assert.equal(a.embeddingCalls, 0)
  const b = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
    reserve: () => true, reserveEmbedding: () => false, model })
  assert.equal(b.status, 'budget_exhausted'); assert.equal(b.modelCalls, 1)
  assert.equal(b.embeddingCalls, 0); assert.equal(b.toolCalls, 0); assert.equal(b.providerUnits, 1)
  let reservations = 0
  const c = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
    reserve: () => ++reservations === 1, reserveEmbedding: () => true, model })
  assert.equal(c.status, 'budget_exhausted'); assert.equal(c.modelCalls, 1)
  assert.equal(c.embeddingCalls, 1); assert.equal(c.toolCalls, 1); assert.equal(c.providerUnits, 2)
  assert.equal(modelCalls, 2); assert.equal(embeddingCount(), 1)
}))

test('spoof, multiple calls and cancellation never execute a knowledge search', async () => withFakeSearch(async embeddingCount => {
  for (const turn of [toolTurn(call('{"query":"Git","ownerId":2}')),
    { ...toolTurn(call()), toolCalls: [call(), call()] }]) {
    const result = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
      reserve: () => true, reserveEmbedding: () => true, model: async () => turn })
    assert.equal(result.status, 'failed'); assert.equal(result.embeddingCalls, 0)
  }
  const abort = new AbortController()
  const cancelled = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
    reserve: () => true, reserveEmbedding: () => true, signal: abort.signal,
    model: async () => { abort.abort(); return toolTurn(call()) } })
  assert.equal(cancelled.status, 'cancelled'); assert.equal(cancelled.embeddingCalls, 0)
  assert.equal(embeddingCount(), 0)
}))

test('cancellation before model, before embedding, during embedding, and before final model starts no later work', async () => {
  const original = searchKnowledge.execute
  try {
    const pre = new AbortController(); pre.abort()
    let modelCalls = 0, embeddingCalls = 0
    const first = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools, signal: pre.signal,
      reserve: () => true, model: async () => { modelCalls++; return toolTurn(call()) } })
    assert.equal(first.status, 'cancelled'); assert.equal(modelCalls, 0)

    const beforeEmbed = new AbortController()
    searchKnowledge.execute = async (_input, context) => {
      if (!context.reserveProviderUnit('embedding')) throw new Error('CANCELLED')
      if (context.signal.aborted) throw new Error('CANCELLED')
      context.onEmbeddingStart(); embeddingCalls++
      return { matches: [] }
    }
    const second = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
      signal: beforeEmbed.signal, reserve: () => true,
      reserveEmbedding: () => { beforeEmbed.abort(); return true },
      model: async () => { modelCalls++; return toolTurn(call()) } })
    assert.equal(second.status, 'cancelled'); assert.equal(second.embeddingCalls, 0); assert.equal(embeddingCalls, 0)

    const during = new AbortController()
    searchKnowledge.execute = async (_input, context) => {
      assert(context.reserveProviderUnit('embedding'))
      context.onEmbeddingStart(); embeddingCalls++
      await new Promise(resolve => setTimeout(resolve, 5))
      during.abort()
      throw new Error('CANCELLED')
    }
    const third = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
      signal: during.signal, reserve: () => true, reserveEmbedding: () => true,
      model: async () => { modelCalls++; return toolTurn(call()) } })
    assert.equal(third.status, 'cancelled'); assert.equal(third.embeddingCalls, 1); assert.equal(third.modelCalls, 1)

    const beforeFinal = new AbortController()
    searchKnowledge.execute = async (_input, context) => {
      assert(context.reserveProviderUnit('embedding'))
      context.onEmbeddingStart()
      return { matches: [] }
    }
    let reservations = 0, finalModelCalls = 0
    const fourth = await runAgent({ goal: 'Git', userId: 17, availableTools: modelTools,
      signal: beforeFinal.signal,
      reserve: () => { if (++reservations === 2) beforeFinal.abort(); return true },
      reserveEmbedding: () => true,
      model: async () => { finalModelCalls++; return toolTurn(call()) } })
    assert.equal(fourth.status, 'cancelled'); assert.equal(fourth.modelCalls, 1); assert.equal(finalModelCalls, 1)
  } finally { searchKnowledge.execute = original }
})
