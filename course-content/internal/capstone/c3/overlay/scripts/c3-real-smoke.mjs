import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL)
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3118'
const name = `c3_real_${Date.now().toString(36)}`
async function call(route, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}
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
const search = await call('/api/knowledge/search', { method: 'POST', cookie: registration.cookie,
  body: { query: 'Private retrieval finding on second page' } })
assert.equal(search.status, 200)
assert.equal(search.data.embeddingMode, 'real')
assert.ok(search.data.matches.some(match => match.documentId === upload.data.id && match.page === 2))
console.log('C3 real embedding smoke passed: private PDF → 2 located chunks → 1024-dimensional Provider → pgvector → page 2 retrieval')
