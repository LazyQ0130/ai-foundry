// Paid local acceptance; prints counts only, never credentials or token.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l6') ||
    process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || process.env.AI_EMBEDDING_MODEL !== 'text-embedding-v4' ||
    !process.env.AI_CHAT_API_KEY || !process.env.AI_EMBEDDING_API_KEY ||
    !process.env.AI_CHAT_BASE_URL || !process.env.AI_EMBEDDING_BASE_URL)
  throw new Error('Use built 4.6 Reference, isolated DB and local Beijing Provider configuration')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32669), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let app
async function start() {
  app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
    cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
      AGENT_APPROVAL_SECRET: secret, AI_PROVIDER_MODE: 'real', AI_CHAT_DISABLE_THINKING: '1',
      AI_TIMEOUT_MS: '20000' }, stdio: 'ignore', windowsHide: true,
  })
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) return } catch { /* startup */ }
    await delay(100)
  }
  throw new Error('Reference server did not start')
}
async function stop() {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  await delay(250)
}
async function post(route, cookie, body) {
  const response = await fetch(base + route, { method: 'POST', headers: { Cookie: cookie,
    'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { code: response.status, data: await response.json() }
}
try {
  await start()
  const registered = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `realp${Date.now()}`, password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(registered.status, 201)
  const cookie = registered.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  const doc = await post('/api/knowledge/documents', cookie,
    { title: '本机 Git 恢复版本练习', content: 'Git restore 可以恢复工作区文件。git reflog 记录引用移动，有助于找回看不到的提交。' })
  assert.equal(doc.code, 201); assert.equal(doc.data.status, 'ready')
  const before = await db.resource.count({ where: { ownerId: me.user.id } })
  const goals = [
    '请先搜索我自己的 Git 恢复版本知识资料，根据搜索结果整理一条研究笔记，并提出保存；保存前必须让我确认。',
    '请调用 search_knowledge，query 为 Git 恢复版本；读取工具结果后请调用 save_research_note 提出笔记，等待我确认，暂时不要声称已经保存。',
  ]
  let selected
  for (let i = 0; i < goals.length; i++) {
    const result = await post('/api/agent/runs', cookie, { goal: goals[i], demo: 'research_workflow' })
    assert.equal(result.code, 201)
    const modelCalls = result.data.timeline.filter(step => step.kind === 'model' && step.status === 'completed').length
    const readTools = result.data.timeline.filter(step => step.toolName === 'search_knowledge' && step.status === 'completed').length
    const status = result.data.status
    assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before)
    console.log(JSON.stringify({ attempt: i + 1, status, model: process.env.AI_CHAT_MODEL,
      modelCalls, embeddingCalls: readTools, readTools, providerUnits: modelCalls + readTools,
      dbWritesBeforeConfirm: 0 }))
    if (status === 'waiting_approval' && modelCalls === 2 && readTools === 1 && result.data.proposal) {
      selected = result.data; break
    }
  }
  if (!selected) throw new Error('Real Provider did not reach expected waiting_approval path')
  await stop(); await start()
  const restoredResponse = await fetch(base + `/api/agent/runs/${selected.id}`, { headers: { Cookie: cookie } })
  const restored = await restoredResponse.json()
  assert.equal(restoredResponse.status, 200); assert.equal(restored.status, 'waiting_approval')
  assert.equal(restored.proposal.title, selected.proposal.title)
  const confirmed = await post('/api/agent/confirm', cookie, { approvalToken: restored.proposal.approvalToken })
  assert.equal(confirmed.code, 201); assert.equal(confirmed.data.modelCalls, 0)
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before + 1)
  const replay = await post('/api/agent/confirm', cookie, { approvalToken: restored.proposal.approvalToken })
  assert.equal(replay.code, 200); assert.equal(replay.data.saved.id, confirmed.data.saved.id)
  assert.equal(await db.resource.count({ where: { ownerId: me.user.id } }), before + 1)
  const action = await db.agentAction.findFirstOrThrow({ where: { runId: selected.id } })
  assert.equal(action.status, 'executed')
  console.log(JSON.stringify({ restartRestored: true, confirmed: true, confirmationModelCalls: 0,
    confirmationProviderUnits: 0, resourceDelta: 1, replayResourceDelta: 1, duplicateConfirmedWrites: 0 }))
} finally {
  if (app?.exitCode === null) await stop()
  await db.$disconnect()
}
