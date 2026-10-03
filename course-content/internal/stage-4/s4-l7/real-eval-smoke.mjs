// Small paid integration smoke. Never prints credentials, cookies, tokens, prompts or raw Provider output.
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !/^postgresql:\/\/[^\s]+@127\.0\.0\.1:55433\/stage4_l7(?:\?[^\s]*)?$/.test(process.env.TEST_DATABASE_URL ?? '') ||
    process.env.AI_CHAT_MODEL !== 'qwen3.7-flash' || process.env.AI_EMBEDDING_MODEL !== 'text-embedding-v4' ||
    !process.env.AI_CHAT_API_KEY || !process.env.AI_EMBEDDING_API_KEY ||
    !process.env.AI_CHAT_BASE_URL || !process.env.AI_EMBEDDING_BASE_URL)
  throw new Error('Use built 4.7 Reference, isolated stage4_l7 DB and local Provider configuration')
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const port = Number(process.argv[3] ?? 32749), base = `http://127.0.0.1:${port}`
const secret = randomBytes(48).toString('base64url'), mcpSecret = randomBytes(48).toString('base64url')
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    AGENT_APPROVAL_SECRET: secret, MCP_AUTH_SECRET: mcpSecret,
    MCP_REFERENCE_URL: base + '/api/mcp/reference', MCP_ALLOW_LOCAL_HTTP: '1',
    AI_PROVIDER_MODE: 'real', AI_CHAT_DISABLE_THINKING: '1', AI_TIMEOUT_MS: '20000' },
  stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `sm${randomBytes(7).toString('hex')}`,
      password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
  assert.equal(response.status, 201)
  const cookie = response.headers.get('set-cookie').split(';')[0]
  const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()
  return { id: me.user.id, cookie }
}
async function post(route, cookie, body) {
  const response = await fetch(base + route, { method: 'POST', headers: { Cookie: cookie,
    'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { code: response.status, data: await response.json() }
}
const observed = []
const safeError = value => typeof value === 'string' && /^[A-Z_]{2,60}$/.test(value) ? value : null
try {
  let ready = false
  for (let i = 0; i < 120; i++) {
    if (app.exitCode !== null) throw new Error('Real smoke Next server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready)
  const directUser = await user()
  const direct = await post('/api/agent/run', directUser.cookie, { goal: '请直接用一句话解释 Git restore，不要调用任何工具。', demo: 'direct' })
  observed.push({ path: 'direct', http: direct.code, status: direct.data.status,
    errorCategory: safeError(direct.data.error),
    modelCalls: direct.data.modelCalls ?? 0, toolCalls: direct.data.toolCalls ?? 0,
    embeddingCalls: direct.data.embeddingCalls ?? 0, mcpCalls: direct.data.mcpCalls ?? 0,
    providerUnits: direct.data.providerUnits ?? 0 })

  const knowledgeUser = await user()
  const doc = await post('/api/knowledge/documents', knowledgeUser.cookie, { title: 'Git 恢复资料',
    content: 'git reflog 记录引用移动，Git restore 可以恢复工作区文件。' })
  assert.equal(doc.code, 201)
  const knowledge = await post('/api/agent/run', knowledgeUser.cookie,
    { goal: '请搜索我自己的 Git 恢复版本资料，并根据搜索结果回答。', demo: 'knowledge_search' })
  observed.push({ path: 'knowledge_search', http: knowledge.code, status: knowledge.data.status,
    errorCategory: safeError(knowledge.data.error),
    observedPath: knowledge.data.toolCalls === 1 ? 'search tool selected' : 'tool not selected',
    modelCalls: knowledge.data.modelCalls ?? 0, toolCalls: knowledge.data.toolCalls ?? 0,
    embeddingCalls: knowledge.data.embeddingCalls ?? 0, mcpCalls: knowledge.data.mcpCalls ?? 0,
    providerUnits: knowledge.data.providerUnits ?? 0 })

  const workflowUser = await user()
  const workflowDoc = await post('/api/knowledge/documents', workflowUser.cookie, { title: 'Git 工作流资料',
    content: 'git reflog 可以找回旧引用，恢复版本前应检查当前工作区。' })
  assert.equal(workflowDoc.code, 201)
  const before = await db.resource.count({ where: { ownerId: workflowUser.id } })
  const workflow = await post('/api/agent/runs', workflowUser.cookie, { goal:
    '请先调用 search_knowledge 查询我自己的 Git 恢复版本资料，读取结果后调用 save_research_note 提出一条研究笔记，保存前让我确认。', demo: 'research_workflow' })
  const modelCalls = workflow.data.timeline?.filter(step => step.kind === 'model' && step.status === 'completed').length ?? 0
  const readTools = workflow.data.timeline?.filter(step => step.toolName === 'search_knowledge' && step.status === 'completed').length ?? 0
  const beforeConfirmDelta = await db.resource.count({ where: { ownerId: workflowUser.id } }) - before
  assert.equal(beforeConfirmDelta, 0)
  const workflowObservation = { path: 'persisted_workflow', http: workflow.code, status: workflow.data.status,
    errorCategory: safeError(workflow.data.error),
    observedPath: workflow.data.status === 'waiting_approval' ? 'search to proposal' : 'preferred tool path not selected',
    modelCalls, toolCalls: readTools, embeddingCalls: readTools, mcpCalls: 0,
    providerUnits: modelCalls + readTools, resourceDeltaBeforeConfirm: beforeConfirmDelta,
    confirmationModelCalls: null, resourceDeltaAfterConfirm: null }
  if (workflow.data.status === 'waiting_approval' && workflow.data.proposal?.approvalToken) {
    const confirmed = await post('/api/agent/confirm', workflowUser.cookie,
      { approvalToken: workflow.data.proposal.approvalToken })
    assert.equal(confirmed.code, 201)
    workflowObservation.confirmationModelCalls = confirmed.data.modelCalls
    workflowObservation.resourceDeltaAfterConfirm = await db.resource.count({ where: { ownerId: workflowUser.id } }) - before
    assert.equal(workflowObservation.confirmationModelCalls, 0)
    assert.equal(workflowObservation.resourceDeltaAfterConfirm, 1)
  }
  observed.push(workflowObservation)

  const mcpUser = await user()
  const mcp = await post('/api/agent/run', mcpUser.cookie,
    { goal: '请调用 research_reference 查公开主题 RAG，再说明获得的参考。', demo: 'mcp_reference' })
  observed.push({ path: 'mcp_reference', http: mcp.code, status: mcp.data.status,
    errorCategory: safeError(mcp.data.error),
    observedPath: mcp.data.mcpCalls === 1 ? 'MCP tool selected' : 'tool not selected',
    modelCalls: mcp.data.modelCalls ?? 0, toolCalls: mcp.data.toolCalls ?? 0,
    embeddingCalls: mcp.data.embeddingCalls ?? 0, mcpCalls: mcp.data.mcpCalls ?? 0,
    providerUnits: mcp.data.providerUnits ?? 0 })
  const target = path.join(project, '.runtime', 'stage4-agent-eval')
  await mkdir(target, { recursive: true })
  await writeFile(path.join(target, 'real-smoke.json'), JSON.stringify({ model: 'qwen3.7-flash',
    embedding: 'text-embedding-v4', observed }, null, 2) + '\n')
  for (const item of observed) console.log(JSON.stringify(item))
} finally {
  app.kill(); await Promise.race([once(app, 'exit'), delay(3000)])
  await db.$disconnect()
}
