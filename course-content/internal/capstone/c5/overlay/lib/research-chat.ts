export class ResearchProviderError extends Error { constructor(code = 'PROVIDER_FAILED') { super(code) } }

export async function chatCompletion(messages: unknown[], options: { tools?: unknown[]; jsonMode?: boolean; signal: AbortSignal; maxTokens: number }): Promise<unknown> {
  const base = process.env.AI_CHAT_BASE_URL
  const key = process.env.AI_CHAT_API_KEY
  const model = process.env.AI_CHAT_MODEL
  if (!base || !key || !model) throw new ResearchProviderError()
  let url: URL
  try { url = new URL(base) } catch { throw new ResearchProviderError() }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) throw new ResearchProviderError()
  const signal = AbortSignal.any([options.signal, AbortSignal.timeout(30_000)])
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0, max_tokens: options.maxTokens,
        ...(model === 'qwen3.7-flash' && process.env.AI_CHAT_DISABLE_THINKING === '1' ? { enable_thinking: false } : {}),
        ...(options.jsonMode === false ? {} : { response_format: { type: 'json_object' } }), messages,
        ...(options.tools ? { tools: options.tools, tool_choice: 'auto' } : {}) }), signal,
    })
    if (!response.ok) { await response.body?.cancel(); throw new Error('provider') }
    return await response.json()
  } catch {
    if (options.signal.aborted) throw new ResearchProviderError('CANCELLED')
    if (signal.aborted) throw new ResearchProviderError('TIMEOUT')
    throw new ResearchProviderError()
  }
}

export function firstMessage(raw: unknown): { content: string | null; tool_calls?: unknown[]; finish_reason: string } {
  if (!raw || typeof raw !== 'object') throw new ResearchProviderError()
  const data = raw as { choices?: { finish_reason?: unknown; message?: { content?: unknown; tool_calls?: unknown } }[] }
  const choice = data.choices?.[0]
  if (!choice || !choice.message || typeof choice.finish_reason !== 'string') throw new ResearchProviderError()
  const { content, tool_calls } = choice.message
  if (content != null && typeof content !== 'string') throw new ResearchProviderError()
  if (tool_calls !== undefined && !Array.isArray(tool_calls)) throw new ResearchProviderError()
  return { content: content ?? null, tool_calls: tool_calls as unknown[] | undefined, finish_reason: choice.finish_reason }
}
