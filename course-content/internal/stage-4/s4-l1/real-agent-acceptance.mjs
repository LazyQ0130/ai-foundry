// Paid, low-cost local acceptance only. Run after unit tests and clean Reference builds.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l1'))
  throw new Error('Use a built Reference and the isolated local stage4_l1 database')
if (process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || !process.env.AI_CHAT_BASE_URL || !process.env.AI_CHAT_API_KEY)
  throw new Error('Missing local qwen3.7-flash Beijing Provider configuration')
const port = 32361, base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project,
  env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AI_PROVIDER_MODE: 'real', AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '20000' },
  stdio: 'ignore', windowsHide: true,
})
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(ready, 'Reference server did not start')
  const registered = await fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `agent${Date.now()}`, password: 'LocalTestPassword123!' }),
  })
  assert.equal(registered.status, 201)
  const cookie = registered.headers.get('set-cookie')?.split(';')[0]
  assert(cookie)
  async function run(name, goal) {
    const started = performance.now()
    const response = await fetch(`${base}/api/agent/run`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ goal, demo: name }),
    })
    const result = await response.json()
    assert.equal(response.status, 200)
    assert(!JSON.stringify(result).includes(process.env.AI_CHAT_API_KEY))
    const summary = { case: name, status: result.status, model: process.env.AI_CHAT_MODEL,
      toolChoice: 'auto', thinking: false, parallelTools: false,
      modelCalls: result.modelCalls, toolCalls: result.toolCalls,
      finishReasons: result.finishReasons, totalTokens: result.totalTokens,
      providerUnits: result.providerUnits, latencyMs: Math.round(performance.now() - started) }
    console.log(JSON.stringify(summary))
    return result
  }
  const direct = await run('direct', '请用一句话解释研究笔记是什么，不需要工具。')
  assert.equal(direct.status, 'completed'); assert.equal(direct.modelCalls, 1); assert.equal(direct.toolCalls, 0)
  assert.deepEqual(direct.finishReasons, ['stop'])
  let usedTool = false
  for (const goal of [
    '请调用 echo_research_topic 工具规范化研究主题 RAG，然后报告工具结果。',
    '我想研究 Git 版本恢复。请先使用 echo_research_topic 记录这个主题，再给一句答复。',
    '请执行 echo_research_topic，参数 topic 是 PostgreSQL，然后根据工具结果回答。',
  ]) {
    const result = await run('tool', goal)
    if (result.status === 'completed' && result.toolCalls === 1 && result.modelCalls === 2) { usedTool = true; break }
  }
  if (!usedTool) process.exitCode = 1
} finally {
  app.kill()
}
