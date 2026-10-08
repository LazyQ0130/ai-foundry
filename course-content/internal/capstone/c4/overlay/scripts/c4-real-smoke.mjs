import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL,
  'Use an isolated TEST_DATABASE_URL and set DATABASE_URL to the same URL')
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3119'
const name = `c4_real_${Date.now().toString(36)}`
async function call(route, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}
const start = Date.now()
const registration = await call('/api/auth/register', { method: 'POST', body: { username: name, password: 'StrongPass123' } })
assert.equal(registration.status, 201)
const bytes = await readFile(path.join(process.cwd(), 'test', 'fixtures', 'valid-two-page.pdf'))
const upload = await call('/api/knowledge/uploads', { method: 'POST', cookie: registration.cookie,
  body: { originalName: 'valid-two-page.pdf', title: 'Non-sensitive two-page fixture', mimeType: 'application/pdf', byteSize: bytes.length } })
assert.equal(upload.status, 201)
const put = await fetch(upload.data.uploadUrl, { method: 'PUT', headers: { 'content-type': 'application/pdf' }, body: bytes })
assert.ok(put.ok, `signed PUT status ${put.status}`)
const indexed = await call(`/api/knowledge/documents/${upload.data.id}/process`, { method: 'POST', cookie: registration.cookie })
assert.equal(indexed.status, 200, indexed.data.errorCode ?? 'index failed')
assert.equal(indexed.data.chunkCount, 2)
const task = await call('/api/research/tasks', { method: 'POST', cookie: registration.cookie,
  body: { title: 'Second page evidence', query: 'What finding does the second page describe?' } })
assert.equal(task.status, 201)
const created = await call(`/api/research/tasks/${task.data.task.id}/runs`, { method: 'POST', cookie: registration.cookie, body: {} })
assert.equal(created.status, 201, `${created.data.errorCode ?? 'run failed'} (${created.status})`)
const detail = await call(`/api/research/runs/${created.data.runId}`, { cookie: registration.cookie })
assert.equal(detail.status, 200)
assert.equal(detail.data.run.report.answerability, 'grounded')
assert.ok(detail.data.citations.length >= 1)
assert.ok(detail.data.citations.every(item => item.sourceAvailable && item.sourceContentHash))
const source = await call(`/api/knowledge/documents/${upload.data.id}/source`, { cookie: registration.cookie })
assert.equal(source.status, 200)
const signedSource = await fetch(source.data.url)
assert.equal(signedSource.status, 200)
assert.equal(Buffer.compare(Buffer.from(await signedSource.arrayBuffer()), bytes), 0)
assert.ok(detail.data.run.report.summary.concat(detail.data.run.report.findings,
  detail.data.run.report.analysis, detail.data.run.report.conclusion).every(item => item.citationKeys.length))
console.log(JSON.stringify({ result: 'PASS', embeddingModel: process.env.AI_EMBEDDING_MODEL,
  reportModel: process.env.AI_CHAT_MODEL, citationCount: detail.data.citations.length,
  answerability: detail.data.run.report.answerability, elapsedMs: Date.now() - start }))
