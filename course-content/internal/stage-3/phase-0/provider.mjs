import { z } from 'zod'

export const suggestionSchema = z.object({
  summary: z.string().trim().min(1).max(500),
  tags: z.array(z.string().trim().min(1).max(32)).min(1).max(5),
  confidence: z.number().min(0).max(1),
}).strict()

export function parseSuggestion(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('INVALID_JSON') }
  const parsed = suggestionSchema.safeParse(value)
  if (!parsed.success) throw new Error('INVALID_SCHEMA')
  return parsed.data
}

const maxInput = 2_000
function timeoutMs() {
  const value = Number(process.env.AI_TIMEOUT_MS ?? 8_000)
  if (!Number.isInteger(value) || value < 1_000 || value > 30_000) throw new Error('PROVIDER_TIMEOUT_CONFIG_INVALID')
  return value
}
function chatOptions() {
  return process.env.AI_CHAT_DISABLE_THINKING === '1' ? { enable_thinking: false } : {}
}
function bounded(input) {
  if (typeof input !== 'string' || !input.trim() || input.length > maxInput) throw new Error('INPUT_LIMIT')
  return input.trim()
}
function config(prefix) {
  const base = process.env[`${prefix}_BASE_URL`]
  const key = process.env[`${prefix}_API_KEY`]
  const model = process.env[`${prefix}_MODEL`]
  if (!base || !key || !model) throw new Error('PROVIDER_CONFIG_MISSING')
  const url = new URL(base)
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('PROVIDER_URL_INSECURE')
  return { base: base.replace(/\/$/, ''), key, model }
}
async function request(prefix, path, body, signal) {
  const { base, key } = config(prefix)
  if (signal?.aborted) throw new Error('CANCELLED')
  const timeout = AbortSignal.timeout(timeoutMs())
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout
  try {
    const response = await fetch(`${base}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: requestSignal,
    })
    if (!response.ok) {
      await response.body?.cancel()
      throw new Error(response.status === 401 ? 'PROVIDER_UNAUTHORIZED' : `PROVIDER_HTTP_${response.status}`)
    }
    return response
  } catch (error) {
    if (requestSignal.aborted) throw new Error(signal?.aborted ? 'CANCELLED' : 'PROVIDER_TIMEOUT')
    throw error
  }
}

export function createRealProvider() {
  return {
    kind: 'real',
    async generate(input, { signal, structured = false } = {}) {
      const { model } = config('AI_CHAT')
      const response = await request('AI_CHAT', 'chat/completions', {
        model, messages: [{ role: 'user', content: bounded(input) }], max_tokens: 256, ...chatOptions(),
        ...(structured ? { response_format: { type: 'json_object' } } : {}),
      }, signal)
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content
      if (typeof text !== 'string') throw new Error('PROVIDER_INVALID_RESPONSE')
      return { kind: 'real', status: response.status, text, usage: data.usage ?? null }
    },
    async *stream(input, { signal } = {}) {
      const { model } = config('AI_CHAT')
      const response = await request('AI_CHAT', 'chat/completions', {
        model, messages: [{ role: 'user', content: bounded(input) }], max_tokens: 256, ...chatOptions(),
        stream: true, stream_options: { include_usage: true },
      }, signal)
      if (!response.body) throw new Error('PROVIDER_INVALID_RESPONSE')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          if (signal?.aborted) throw new Error('CANCELLED')
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') return
            let data
            try { data = JSON.parse(payload) } catch { throw new Error('PROVIDER_INVALID_STREAM') }
            const text = data.choices?.[0]?.delta?.content
            if (typeof text === 'string' && text) yield { kind: 'real', text }
            if (data.usage) yield { kind: 'real', usage: data.usage }
          }
        }
      } finally { await reader.cancel().catch(() => {}) }
    },
    async embed(input, { signal } = {}) {
      const { model } = config('AI_EMBEDDING')
      const dimension = Number(process.env.AI_EMBEDDING_DIMENSION)
      if (!Number.isInteger(dimension) || dimension < 1 || dimension > 2000) throw new Error('EMBEDDING_DIMENSION_INVALID')
      const response = await request('AI_EMBEDDING', 'embeddings', {
        model, input: bounded(input), dimensions: dimension, encoding_format: 'float',
      }, signal)
      const data = await response.json()
      const vector = data.data?.[0]?.embedding
      if (!Array.isArray(vector) || vector.length !== dimension || !vector.every(Number.isFinite)) throw new Error('EMBEDDING_DIMENSION_MISMATCH')
      return { kind: 'real', status: response.status, vector, usage: data.usage ?? null }
    },
  }
}

export function createMockProvider(dimension = 1024) {
  return {
    kind: 'mock',
    async generate(input) { return { kind: 'mock', text: `MOCK: ${bounded(input).slice(0, 40)}`, usage: null } },
    async *stream(input, { signal } = {}) {
      for (const text of ['MOCK: ', bounded(input).slice(0, 40)]) {
        if (signal?.aborted) throw new Error('CANCELLED')
        yield { kind: 'mock', text }
      }
    },
    async embed(input) {
      const value = bounded(input)
      const vector = Array.from({ length: dimension }, (_, i) => ((value.charCodeAt(i % value.length) + i) % 97) / 97)
      return { kind: 'mock', vector, usage: null }
    },
  }
}
