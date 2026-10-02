export function createChatProvider({ baseUrl, apiKey, model, timeoutMs = 20_000, fetchImpl = fetch }) {
  if (!baseUrl || !apiKey || !model) throw new Error('PROVIDER_CONFIG_MISSING')
  const url = new URL(baseUrl.replace(/\/$/, '') + '/chat/completions')
  if (url.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('PROVIDER_URL_INSECURE')
  return {
    model,
    async complete(messages, tools, signal) {
      if (signal?.aborted) throw new Error('CANCELLED')
      const deadline = AbortSignal.timeout(timeoutMs)
      const combined = signal ? AbortSignal.any([signal, deadline]) : deadline
      let response
      try {
        response = await fetchImpl(url, {
          method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, tools, tool_choice: 'auto', parallel_tool_calls: false,
            enable_thinking: false, max_tokens: 256, stream: false }), signal: combined,
        })
        if (!response.ok) { await response.body?.cancel(); throw new Error(response.status === 401 ? 'PROVIDER_401' : 'PROVIDER_HTTP_ERROR') }
        const data = await response.json()
        const choice = data.choices?.[0]
        if (!choice || !choice.message || typeof choice.finish_reason !== 'string') throw new Error('PROVIDER_INVALID_RESPONSE')
        return { message: choice.message, finishReason: choice.finish_reason,
          usage: { prompt: data.usage?.prompt_tokens ?? null, completion: data.usage?.completion_tokens ?? null,
            total: data.usage?.total_tokens ?? null } }
      } catch (error) {
        if (combined.aborted) throw new Error(signal?.aborted ? 'CANCELLED' : 'TIMEOUT')
        if (error.message?.startsWith('PROVIDER_')) throw error
        throw new Error('PROVIDER_FAILURE')
      }
    },
  }
}
