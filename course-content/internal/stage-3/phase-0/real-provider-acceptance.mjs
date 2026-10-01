import 'dotenv/config'
import assert from 'node:assert/strict'
import { createRealProvider, parseSuggestion } from './provider.mjs'

const required = [
  'AI_CHAT_BASE_URL', 'AI_CHAT_API_KEY', 'AI_CHAT_MODEL',
  'AI_EMBEDDING_BASE_URL', 'AI_EMBEDDING_API_KEY', 'AI_EMBEDDING_MODEL',
  'AI_EMBEDDING_DIMENSION',
]
const missing = required.filter(name => !process.env[name])
if (missing.length) {
  console.error(JSON.stringify({ status: 'blocked', reason: 'CONFIG_MISSING', variableNames: missing }))
  process.exit(2)
}
for (const name of ['AI_CHAT_BASE_URL', 'AI_EMBEDDING_BASE_URL']) {
  const url = new URL(process.env[name])
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.cn-beijing.maas.aliyuncs.com')) {
    throw new Error(`${name} must use the Beijing workspace endpoint`)
  }
}
assert.equal(process.env.AI_CHAT_MODEL, 'qwen3.7-flash', 'Do not silently switch the chat model')
assert.equal(process.env.AI_EMBEDDING_MODEL, 'text-embedding-v4', 'Do not silently switch the embedding model')
assert.equal(process.env.AI_EMBEDDING_DIMENSION, '1024')

const provider = createRealProvider()
const elapsed = start => Date.now() - start
const usage = value => value && Object.fromEntries(
  ['prompt_tokens', 'completion_tokens', 'total_tokens', 'input_tokens', 'output_tokens']
    .filter(key => Number.isFinite(value[key])).map(key => [key, value[key]]),
)
const report = {
  provider: 'Alibaba Cloud Model Studio', region: 'China (Beijing)',
  chatModel: process.env.AI_CHAT_MODEL, embeddingModel: process.env.AI_EMBEDDING_MODEL,
}
try {
  let start = Date.now()
  const answer = await provider.generate('请用一句简短中文说明 Git 是做什么的。')
  assert.equal(answer.kind, 'real')
  assert.equal(answer.status, 200)
  assert(answer.text.trim().length > 0 && answer.text.length <= 2000)
  report.chat = { status: answer.status, nonEmpty: true, characters: answer.text.length, latencyMs: elapsed(start), usage: usage(answer.usage) }

  const originalKey = process.env.AI_CHAT_API_KEY
  process.env.AI_CHAT_API_KEY = 'invalid-test-key-stage3'
  start = Date.now()
  try {
    await assert.rejects(provider.generate('鉴权测试'), /PROVIDER_UNAUTHORIZED/)
    report.invalidKey = { status: 401, mappedError: 'PROVIDER_UNAUTHORIZED', latencyMs: elapsed(start) }
  } finally { process.env.AI_CHAT_API_KEY = originalKey }

  start = Date.now()
  let chunkCount = 0
  let characters = 0
  let streamUsage = null
  for await (const part of provider.stream('请分两句简短中文说明 Git 和 PostgreSQL 的用途。')) {
    if (part.text) { chunkCount++; characters += part.text.length }
    if (part.usage) streamUsage = usage(part.usage)
  }
  assert(chunkCount >= 2 && characters > 0)
  report.streaming = { chunks: chunkCount, characters, latencyMs: elapsed(start), completed: true, usage: streamUsage }

  const controller = new AbortController()
  const iterator = provider.stream('请简短列出三个常见开发工具。', { signal: controller.signal })[Symbol.asyncIterator]()
  let viewWrites = 0
  const first = await iterator.next()
  if (first.value?.text) viewWrites++
  assert(viewWrites > 0)
  controller.abort()
  const writesAtCancel = viewWrites
  let stopped = false
  try { stopped = Boolean((await iterator.next()).done) } catch (error) {
    if (!['CANCELLED', 'AbortError'].includes(error?.message) && error?.name !== 'AbortError') throw error
    stopped = true
  }
  await iterator.return?.()
  assert(stopped, 'Provider emitted another chunk after abort')
  assert.equal(viewWrites, writesAtCancel)
  report.cancel = { aborted: true, providerStopped: true, viewWritesAfterCancel: 0 }

  start = Date.now()
  const structured = await provider.generate(
    '请只返回 JSON 对象，严格使用 summary（简短中文字符串）、tags（1 到 3 个简短字符串）、confidence（0 到 1 的数字）三个字段；内容关于“Git 用于版本管理”。不要添加其他字段。',
    { structured: true },
  )
  const parsed = parseSuggestion(structured.text)
  assert.equal(structured.status, 200)
  assert(parsed.confidence >= 0 && parsed.confidence <= 1)
  assert.throws(() => parseSuggestion('{"summary":"s","tags":["t"],"confidence":2,"extra":true}'))
  report.structured = { status: structured.status, valid: true, strict: true, invalidRejected: true, latencyMs: elapsed(start), usage: usage(structured.usage) }

  start = Date.now()
  const embedded = await provider.embed('Git 用于版本管理。')
  assert.equal(embedded.kind, 'real')
  assert.equal(embedded.status, 200)
  assert.equal(embedded.vector.length, 1024)
  assert(embedded.vector.every(Number.isFinite))
  report.embedding = { status: embedded.status, dimension: 1024, finite: true, latencyMs: elapsed(start), usage: usage(embedded.usage) }

  console.log(JSON.stringify({ status: 'pass', ...report }))
} catch (error) {
  // Never log request headers, key, prompt, full response, or a raw provider error.
  const known = /^(PROVIDER_[A-Z0-9_]+|INVALID_JSON|INVALID_SCHEMA|EMBEDDING_[A-Z0-9_]+|CANCELLED)$/.test(error?.message)
  console.error(JSON.stringify({ status: 'failed', ...report, error: known ? error.message : 'ACCEPTANCE_FAILED' }))
  process.exitCode = 1
}
