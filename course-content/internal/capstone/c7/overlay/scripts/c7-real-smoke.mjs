assert.equal(process.env.C7_REAL_SMOKE, '1', 'Explicit real smoke opt-in required')
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL)
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3141'
const started = Date.now()
async function call(route, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}
const user = await call('/api/auth/register', { method: 'POST',
  body: { username: `c7_real_${Date.now().toString(36)}`, password: 'StrongPass123' } })
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
  body: { title: 'Two memory persistence approaches', query: 'Compare the append-only event log and snapshot-based key-value approaches to persistent agent memory described in my uploaded note. Focus on consistency and cost trade-offs. Use only this note.' } })
assert.equal(task.status, 201)
const result = await call(`/api/research/tasks/${task.data.task.id}/runs`, { method: 'POST', cookie: user.cookie, body: {} })
assert.equal(result.status, 201, `${result.data.stopReason ?? result.data.errorCode ?? 'workflow failed'} (${result.status})`)
assert.equal(result.data.status, 'COMPLETED')
const detail = await call(`/api/research/runs/${result.data.runId}`, { cookie: user.cookie })
assert.equal(detail.status, 200)
assert.ok(detail.data.run.brief.subquestions.length >= 1)
assert.ok(detail.data.steps.some(item => item.kind === 'TOOL' && item.toolName === 'search_knowledge' && item.status === 'COMPLETED'))
assert.ok(detail.data.steps.some(item => item.kind === 'MODEL' && item.status === 'COMPLETED'))
assert.equal(detail.data.run.report.answerability, 'grounded')
assert.ok(detail.data.citations.length >= 1)
assert.ok(detail.data.citations.every(item => item.sourceAvailable))
const source = await call(`/api/knowledge/documents/${upload.data.id}/source`, { cookie: user.cookie })
assert.equal(source.status, 200)
assert.equal(Buffer.compare(Buffer.from(await (await fetch(source.data.url)).arrayBuffer()), bytes), 0)

const proposalStarted = Date.now()
const proposal = await call(`/api/research/runs/${result.data.runId}/knowledge-note-proposal`, { method: 'POST', cookie: user.cookie, body: {} })
const proposalLatencyMs = Date.now() - proposalStarted
assert.equal(proposal.status, 200)
const original = proposal.data.action
assert.equal(original.status, 'PROPOSED'); assert.ok(original.title.length <= 120); assert.ok(original.content.length <= 2000)
const changed = await call(`/api/research/actions/${original.id}`, { method: 'PATCH', cookie: user.cookie,
 body: { title: original.title, content: original.content.slice(0, 1900) + '\nHuman review: preserve these stated limits.', expectedVersion: original.version } })
assert.equal(changed.status, 200)
const action = changed.data.action
assert.equal(action.version, 2)
const approve = () => call(`/api/research/actions/${action.id}/approve`, { method: 'POST', cookie: user.cookie, body: { approvalToken: action.approvalToken } })
const saved = await approve(), replay = await approve()
assert.equal(saved.status, 200); assert.equal(replay.status, 200); assert.equal(replay.data.replayed, true)
assert.equal(saved.data.note.id, replay.data.note.id)
const reloaded = await call(`/api/knowledge/notes/${saved.data.note.id}`, { cookie: user.cookie })
assert.equal(reloaded.status, 200); assert.equal(reloaded.data.note.content, action.content)
const notes = await call('/api/knowledge/notes', { cookie: user.cookie })
assert.equal(notes.data.notes.filter(item => item.sourceRunId === result.data.runId).length, 1)
assert.equal((await call(`/api/research/runs/${result.data.runId}`, { cookie: user.cookie })).data.run.status, 'COMPLETED')
console.log(JSON.stringify({ result: 'PASS', proposalLatencyMs, titleLength: original.title.length,
 contentLength: original.content.length, actionVersion: action.version, replayed: replay.data.replayed,
 noteCount: 1, sourceRunId: result.data.runId, reportCitationCount: detail.data.citations.length, elapsedMs: Date.now() - started }))
