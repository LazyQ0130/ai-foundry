import { createChatProvider } from './client.mjs'
import { runAgent } from '../agent-loop.mjs'

const started = performance.now()
const provider = createChatProvider({ baseUrl: process.env.AI_CHAT_BASE_URL, apiKey: process.env.AI_CHAT_API_KEY,
  model: process.env.AI_CHAT_MODEL, timeoutMs: Number(process.env.AI_TIMEOUT_MS || 20000) })
if (provider.model !== 'qwen3.7-flash' || !new URL(process.env.AI_CHAT_BASE_URL).hostname.endsWith('.cn-beijing.maas.aliyuncs.com'))
  throw new Error('EXPECTED_BEIJING_QWEN37_CONFIG')
for (const [name, question] of [
  ['direct', '用一句话解释什么是研究笔记。不要调用工具。'],
  ['tool_roundtrip', '请调用 echo_research_topic 工具规范化主题 RAG，然后用一句话报告结果。'],
]) {
  const result = await runAgent({ question, provider, reserve: async () => true })
  console.log(JSON.stringify({ case: name, status: result.status, model: provider.model, region: 'cn-beijing',
    thinking: false, toolChoice: 'auto', modelCalls: result.modelCalls, toolCalls: result.toolCalls,
    finishReasons: result.finishReasons, totalTokens: result.totalTokens, providerUnits: result.providerUnits,
    elapsedMs: Math.round(performance.now() - started), error: result.error ?? null }))
  if (result.status !== 'completed' || (name === 'tool_roundtrip' && result.toolCalls !== 1) ||
    (name === 'direct' && result.toolCalls !== 0)) process.exitCode = 1
}
