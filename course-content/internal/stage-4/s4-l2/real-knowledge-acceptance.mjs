// Paid local acceptance. Run only after deterministic, DB-isolation, Stub and build gates.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l2'))
  throw new Error('Use a built Reference and isolated local stage4_l2 database')
if (process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || process.env.AI_EMBEDDING_MODEL !== 'text-embedding-v4' ||
    process.env.AI_EMBEDDING_DIMENSION !== '1024' || !process.env.AI_CHAT_API_KEY || !process.env.AI_EMBEDDING_API_KEY ||
    !process.env.AI_CHAT_BASE_URL || !process.env.AI_EMBEDDING_BASE_URL)
  throw new Error('Missing local Beijing Chat/Embedding Provider configuration')
const port = 32375, base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
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
  assert(ready)
  const registered = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `search${Date.now()}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registered.status, 201)
  const cookie = registered.headers.get('set-cookie')?.split(';')[0]
  assert(cookie)
  const document = await fetch(base + '/api/knowledge/documents', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ title: '本机 Git 恢复版本练习',
      content: 'Git restore 可以恢复工作区文件。git reflog 会记录引用移动，帮助找回暂时看不到的提交。' }) })
  const indexed = await document.json()
  assert.equal(document.status, 201); assert.equal(indexed.status, 'ready')
  async function run(label, goal, demo) {
    const started = performance.now()
    const response = await fetch(base + '/api/agent/run', { method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ goal, demo }) })
    const result = await response.json()
    assert.equal(response.status, 200)
    const raw = JSON.stringify(result)
    assert(!raw.includes(process.env.AI_CHAT_API_KEY) && !raw.includes(process.env.AI_EMBEDDING_API_KEY))
    console.log(JSON.stringify({ case: label, status: result.status, model: process.env.AI_CHAT_MODEL,
      embedding: process.env.AI_EMBEDDING_MODEL, modelCalls: result.modelCalls,
      embeddingCalls: result.embeddingCalls, toolCalls: result.toolCalls,
      providerUnits: result.providerUnits, finishReasons: result.finishReasons,
      totalTokens: result.totalTokens, safeMatches: result.searchMatches?.length ?? 0,
      latencyMs: Math.round(performance.now() - started) }))
    return result
  }
  const direct = await run('direct', '请用一句话说明研究笔记是什么，无需工具。', 'direct')
  assert.equal(direct.status, 'completed')
  let searched = false
  for (const goal of [
    '请先调用 search_knowledge 搜索我自己的 Git 恢复版本资料，再根据检索结果给出简短回答。',
    '我存了一篇 Git restore 和 reflog 笔记。请用 search_knowledge 查这篇资料，再解释怎么恢复版本。',
    '请使用 search_knowledge，query 为 Git 恢复版本；只根据工具结果回答。',
  ]) {
    const result = await run('knowledge_search', goal, 'knowledge_search')
    if (result.status === 'completed' && result.modelCalls === 2 && result.embeddingCalls === 1 &&
        result.toolCalls === 1 && result.providerUnits === 3 && result.searchMatches?.length) { searched = true; break }
    if (result.status === 'budget_exhausted') break
  }
  if (!searched) process.exitCode = 1
} finally { app.kill() }
