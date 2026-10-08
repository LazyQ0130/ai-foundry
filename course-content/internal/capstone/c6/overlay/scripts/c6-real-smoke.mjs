import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

assert.equal(process.env.C6_REAL_SMOKE, '1', 'Explicit opt-in required: sends public query to Crossref and uses configured AI providers')
assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL)
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3134'
const started = Date.now()
async function call(route, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}
const user = await call('/api/auth/register', { method: 'POST',
  body: { username: `c6_real_${Date.now().toString(36)}`, password: 'StrongPass123' } })
assert.equal(user.status, 201)
const bytes = await readFile(path.join(process.cwd(), 'test/fixtures/agent-memory-approaches.txt'))
const upload = await call('/api/knowledge/uploads', { method: 'POST', cookie: user.cookie,
  body: { originalName: 'agent-memory-approaches.txt', title: 'Non-sensitive memory approaches fixture',
    mimeType: 'text/plain', byteSize: bytes.length } })
assert.equal(upload.status, 201)
const put = await fetch(upload.data.uploadUrl, { method: 'PUT', headers: { 'content-type': 'text/plain' }, body: bytes })
assert.equal(put.status, 200)
const indexed = await call(`/api/knowledge/documents/${upload.data.id}/process`, { method: 'POST', cookie: user.cookie })
assert.equal(indexed.status, 200, indexed.data.errorCode ?? 'index failed')
const task = await call('/api/research/tasks', { method: 'POST', cookie: user.cookie,
  body: { title: 'Two memory persistence approaches', query: 'agent memory. Compare persistence approaches in my private note with public scholarly research. The note cannot establish published findings; add a clearly separated abstract-supported research perspective and cite both private and external evidence.' } })
assert.equal(task.status, 201)
const result = await call(`/api/research/tasks/${task.data.task.id}/runs`, { method: 'POST', cookie: user.cookie, body: { sourcePolicy: 'PRIVATE_AND_EXTERNAL' } })
assert.equal(result.status, 201, `${result.data.stopReason ?? result.data.errorCode ?? 'workflow failed'} (${result.status})`)
assert.equal(result.data.status, 'COMPLETED')
const detail = await call(`/api/research/runs/${result.data.runId}`, { cookie: user.cookie })
assert.equal(detail.status, 200)
assert.ok(detail.data.run.brief.subquestions.length >= 1)
assert.ok(detail.data.steps.some(item => item.kind === 'TOOL' && item.toolName === 'search_knowledge' && item.status === 'COMPLETED'))
assert.ok(detail.data.steps.some(item => item.kind === 'MODEL' && item.status === 'COMPLETED'))
assert.equal(detail.data.run.report.answerability, 'grounded')
assert.ok(detail.data.citations.length >= 1)
assert.ok(detail.data.citations.some(item => item.sourceType === 'KNOWLEDGE'))
assert.ok(detail.data.citations.some(item => item.sourceType === 'CROSSREF'))
assert.ok(detail.data.steps.some(item => item.toolName === 'search_external_references' && item.status === 'COMPLETED'))
const source = await call(`/api/knowledge/documents/${upload.data.id}/source`, { cookie: user.cookie })
assert.equal(source.status, 200)
assert.equal(Buffer.compare(Buffer.from(await (await fetch(source.data.url)).arrayBuffer()), bytes), 0)
console.log(JSON.stringify({ result: 'PASS', sourcePolicy: detail.data.run.sourcePolicy,
  externalSteps: detail.data.steps.filter(item => item.toolName === 'search_external_references').map(item => ({ query: item.inputSummary, result: item.outputSummary, mcpLatencyMs: item.latencyMs })),
  modelCalls: detail.data.steps.filter(item => item.kind === 'MODEL').length, citationSourceTypes: detail.data.citations.map(item => item.sourceType), model: process.env.AI_CHAT_MODEL,
  embeddingModel: process.env.AI_EMBEDDING_MODEL, stepCount: detail.data.steps.length,
  toolCalls: detail.data.steps.filter(item => item.kind === 'TOOL').length,
  citationCount: detail.data.citations.length, elapsedMs: Date.now() - started }))
