import assert from 'node:assert/strict'
import test from 'node:test'
import { ProviderSseParser } from './common/lib/provider-sse.ts'
import { createGenerationGate } from './common/lib/ai-stream-generation.ts'

const bytes = (s) => new TextEncoder().encode(s)
const delta = (s) => `data: ${JSON.stringify({ choices: [{ delta: { content: s } }] })}\n\n`

test('SSE survives arbitrary cuts, blank lines, several events and usage', () => {
  const parser = new ProviderSseParser()
  const input = `\n${delta('Git ')}${delta('可以记录版本')}` + 'data: {"usage":{"prompt_tokens":3,"completion_tokens":4,"total_tokens":7}}\n\n' + 'data: [DONE]\n\n'
  const parts = [input.slice(0, 4), input.slice(4, 13), input.slice(13, 65), input.slice(65)]
  const frames = parts.flatMap(part => parser.push(bytes(part)))
  parser.finish()
  assert.deepEqual(frames, [
    { type: 'delta', text: 'Git ' },
    { type: 'delta', text: '可以记录版本' },
    { type: 'usage', value: { prompt_tokens: 3, completion_tokens: 4, total_tokens: 7 } },
  ])
  assert.equal(parser.done, true)
})

test('SSE malformed JSON and unexpected close fail', () => {
  assert.throws(() => new ProviderSseParser().push(bytes('data: {bad}\n\n')), /INVALID_STREAM/)
  const parser = new ProviderSseParser()
  assert.deepEqual(parser.push(bytes(delta('part'))), [{ type: 'delta', text: 'part' }])
  assert.throws(() => parser.finish(), /STREAM_CLOSED_WITHOUT_DONE/)
})

test('finish_reason stop is separate from DONE and follows multiple deltas', () => {
  const parser = new ProviderSseParser()
  const frames = parser.push(bytes(delta('甲') + delta('乙') + 'data: {"choices":[{"finish_reason":"stop"}]}\n\n'))
  assert.deepEqual(frames, [{ type: 'delta', text: '甲' }, { type: 'delta', text: '乙' }, { type: 'finish', reason: 'stop' }])
  assert.equal(parser.done, false)
  assert.deepEqual(parser.push(bytes('data: [DONE]\n\n')), [])
  parser.finish()
  assert.equal(parser.done, true)
})

test('length finish survives network splits and a separate usage frame', () => {
  const parser = new ProviderSseParser()
  const input = delta('部分回答') + 'data: {"choices":[{"finish_reason":"length"}]}\n\n' +
    'data: {"choices":[],"usage":{"prompt_tokens":2,"completion_tokens":3,"total_tokens":5}}\n\n' + 'data: [DONE]\n\n'
  const split = input.indexOf('finish_reason') + 8
  const frames = [...parser.push(bytes(input.slice(0, split))), ...parser.push(bytes(input.slice(split)))]
  assert.deepEqual(frames, [
    { type: 'delta', text: '部分回答' }, { type: 'finish', reason: 'length' },
    { type: 'usage', value: { prompt_tokens: 2, completion_tokens: 3, total_tokens: 5 } },
  ])
  parser.finish()
})

test('one network chunk may contain delta, length finish and DONE', () => {
  const parser = new ProviderSseParser()
  assert.deepEqual(parser.push(bytes(delta('短答') + 'data: {"choices":[{"finish_reason":"length"}]}\n\n' + 'data: [DONE]\n\n')),
    [{ type: 'delta', text: '短答' }, { type: 'finish', reason: 'length' }])
  assert.equal(parser.done, true)
})

test('cancelled generation A cannot write into B', () => {
  const gate = createGenerationGate()
  const a = gate.begin()
  assert(gate.isCurrent(a))
  gate.invalidate()
  const b = gate.begin()
  assert.equal(gate.isCurrent(a), false)
  assert(gate.isCurrent(b))
  const received = []
  if (gate.isCurrent(a)) received.push('late A')
  if (gate.isCurrent(b)) received.push('B complete')
  assert.deepEqual(received, ['B complete'])
})
