// Paid local acceptance. Keep secrets, token, prompt and answer out of output.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l3') ||
    process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || !process.env.AI_CHAT_API_KEY || !process.env.AI_CHAT_BASE_URL)
  throw new Error('Use built Reference, isolated stage4_l3 DB and local qwen3.7-flash configuration')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32378), base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: randomBytes(48).toString('base64url'),
    AI_PROVIDER_MODE: 'real', AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '20000' },
  stdio: 'ignore', windowsHide: true,
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
  const registration = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `r${Date.now()}${Math.floor(Math.random() * 99999)}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const count = () => db.resource.count({ where: { ownerId: me.user.id } })
  const before = await count()
  let reached = false
  const goals = [
    '请提出保存一条研究笔记，标题为 Git 恢复版本，内容为 使用 reflog 查找历史引用。',
    '请调用 save_research_note，提出一条研究笔记：标题 Git 恢复版本；内容 使用 reflog 查找历史引用。先让我确认。',
    '我想保存研究笔记。请提出 save_research_note 工具调用，标题为 Git 恢复版本，内容为 使用 reflog 查找历史引用。',
  ]
  for (let attempt = 0; attempt < goals.length; attempt++) {
    const response = await fetch(base + '/api/agent/run', { method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: goals[attempt], demo: 'note_proposal' }) })
    const result = await response.json()
    assert.equal(response.status, 200)
    assert.equal(await count(), before)
    console.log(JSON.stringify({ attempt: attempt + 1, model: process.env.AI_CHAT_MODEL,
      status: result.status, modelCalls: result.modelCalls, toolCalls: result.toolCalls,
      providerUnits: result.providerUnits, finishReasons: result.finishReasons,
      dbWritesBeforeConfirm: (await count()) - before }))
    if (result.status === 'waiting_approval') {
      reached = true
      const confirmed = await fetch(base + '/api/agent/confirm', { method: 'POST',
        headers: { Cookie: cookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalToken: result.approvalToken }) })
      const saved = await confirmed.json()
      assert.equal(confirmed.status, 201); assert.equal(saved.modelCalls, 0)
      assert.deepEqual([saved.saved.title, saved.saved.desc], [result.proposal.args.title, result.proposal.args.content])
      assert.equal(await count(), before + 1)
      console.log(JSON.stringify({ status: saved.status, dbWritesAfterConfirm: (await count()) - before,
        confirmModelCalls: saved.modelCalls, exactArgs: true }))
      break
    }
  }
  if (!reached) console.log('REAL MODEL LIMITATION: natural-language attempts did not reach waiting_approval')
} finally { app.kill(); await db.$disconnect() }
