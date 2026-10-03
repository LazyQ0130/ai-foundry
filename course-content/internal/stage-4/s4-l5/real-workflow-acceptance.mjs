// Paid local acceptance after deterministic, PostgreSQL, Stub and build gates.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l5') ||
    process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || process.env.AI_EMBEDDING_MODEL !== 'text-embedding-v4' ||
    !process.env.AI_CHAT_API_KEY || !process.env.AI_EMBEDDING_API_KEY ||
    !process.env.AI_CHAT_BASE_URL || !process.env.AI_EMBEDDING_BASE_URL)
  throw new Error('Use built 4.5 Reference, isolated DB and local Beijing Provider configuration')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32554), base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: randomBytes(48).toString('base64url'), AI_PROVIDER_MODE: 'real',
    AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '20000' }, stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const registered = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `realw${Date.now()}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registered.status, 201)
  const cookie = registered.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const doc = await fetch(base + '/api/knowledge/documents', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ title: '本机 Git 恢复版本练习',
      content: 'Git restore 可以恢复工作区文件。git reflog 记录引用移动，有助于找回看不到的提交。' }) })
  const indexed = await doc.json()
  assert.equal(doc.status, 201); assert.equal(indexed.status, 'ready')
  const before = await db.resource.count({ where: { ownerId: me.user.id } })
  const goals = [
    '请先搜索我自己的 Git 恢复版本知识资料，根据搜索结果整理一条研究笔记，并提出保存；保存前必须让我确认。',
    '请调用 search_knowledge，query 为 Git 恢复版本；读取工具结果后请调用 save_research_note 提出笔记，等待我确认，暂时不要声称已经保存。',
  ]
  let completed = false
  for (let i = 0; i < goals.length; i++) {
    const response = await fetch(base + '/api/agent/run', { method: 'POST', headers: {
      Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ goal: goals[i], demo: 'research_workflow' }) })
    const result = await response.json()
    assert.equal(response.status, 200)
    assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before)
    console.log(JSON.stringify({ attempt: i + 1, status: result.status, model: process.env.AI_CHAT_MODEL,
      modelCalls: result.modelCalls, embeddingCalls: result.embeddingCalls, toolCalls: result.toolCalls,
      providerUnits: result.providerUnits, finishReasons: result.finishReasons,
      safeMatches: result.searchMatches?.length ?? 0, dbWritesBeforeConfirm: 0 }))
    if (result.status === 'waiting_approval' && result.modelCalls === 2 && result.embeddingCalls === 1 &&
        result.toolCalls === 1 && result.providerUnits === 3 && result.searchMatches?.length &&
        result.proposal?.toolName === 'save_research_note') {
      const confirmed = await fetch(base + '/api/agent/confirm', { method: 'POST', headers: {
        Cookie: cookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalToken: result.approvalToken }) })
      const saved = await confirmed.json()
      assert.equal(confirmed.status, 201); assert.equal(saved.modelCalls, 0)
      assert.equal(saved.saved.title, result.proposal.args.title)
      assert.equal(saved.saved.desc, result.proposal.args.content)
      assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before + 1)
      console.log(JSON.stringify({ confirmed: true, status: saved.status, modelCalls: saved.modelCalls,
        providerUnits: 0, dbWritesAfterConfirm: 1 }))
      completed = true; break
    }
    if (result.status === 'budget_exhausted') break
  }
  if (!completed) console.log('REAL MODEL LIMITATION: natural-language attempts did not finish search→proposal→confirm')
} finally { app.kill(); await db.$disconnect() }
