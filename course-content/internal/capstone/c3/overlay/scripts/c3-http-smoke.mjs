import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

assert.ok(process.env.TEST_DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL,
  'Use an isolated TEST_DATABASE_URL and set DATABASE_URL to the same URL')
const base = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3118'
const stamp = Date.now().toString(36)
const prisma = new PrismaClient()
const fixture = name => readFile(path.join(process.cwd(), 'test', 'fixtures', name))

async function request(route, { method = 'GET', cookie, body, origin } = {}) {
  const response = await fetch(base + route, { method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(origin ? { origin } : {}) },
    body: body ? JSON.stringify(body) : undefined })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}
async function initiate(cookie, name, mime, bytes) {
  return request('/api/knowledge/uploads', { method: 'POST', cookie,
    body: { originalName: name, title: name, mimeType: mime, byteSize: bytes.length } })
}
async function put(url, mime, bytes) {
  const response = await fetch(url, { method: 'PUT', headers: { 'content-type': mime }, body: bytes })
  assert.ok(response.ok, `signed PUT failed: ${response.status}`)
}

try {
  const alice = await request('/api/auth/register', { method: 'POST', body: { username: `c3_alice_${stamp}`, password: 'StrongPass123' } })
  const bob = await request('/api/auth/register', { method: 'POST', body: { username: `c3_bob_${stamp}`, password: 'StrongPass123' } })
  assert.equal(alice.status, 201); assert.equal(bob.status, 201)
  assert.ok(alice.cookie); assert.ok(bob.cookie)

  const long = Buffer.from('Private agent memory evidence is traceable. '.repeat(70))
  const upload = await initiate(alice.cookie, 'long.txt', 'text/plain', long)
  assert.equal(upload.status, 201)
  const id = upload.data.id
  const pending = await request('/api/knowledge/documents', { cookie: alice.cookie })
  assert.equal(pending.data.documents.find(item => item.id === id).status, 'PENDING_UPLOAD')
  assert.deepEqual((await request('/api/knowledge/search', { method: 'POST', cookie: alice.cookie, body: { query: 'memory evidence' } })).data.matches, [])
  assert.equal((await request('/api/knowledge/documents', { cookie: bob.cookie })).data.documents.length, 0)
  assert.equal((await request(`/api/knowledge/documents/${id}`, { cookie: bob.cookie })).status, 404)
  assert.equal((await request(`/api/knowledge/documents/${id}/source`, { cookie: bob.cookie })).status, 404)
  assert.equal((await request(`/api/knowledge/documents/${id}/process`, { method: 'POST', cookie: bob.cookie })).status, 404)
  assert.equal((await request(`/api/knowledge/documents/${id}/process`, { method: 'POST' })).status, 401)
  assert.equal((await request('/api/knowledge/uploads', { method: 'POST', cookie: alice.cookie,
    body: { originalName: 'x.txt', title: 'x', mimeType: 'text/plain', byteSize: 1, workspaceId: 999 } })).status, 400)
  assert.equal((await request('/api/knowledge/search', { method: 'POST', cookie: bob.cookie,
    body: { query: 'memory evidence', workspaceId: 1 } })).status, 400)

  await put(upload.data.uploadUrl, 'text/plain', long)
  const anonymous = await fetch(upload.data.uploadUrl.split('?')[0])
  assert.ok([401, 403].includes(anonymous.status), `anonymous object access ${anonymous.status}`)
  const source = await request(`/api/knowledge/documents/${id}/source`, { cookie: alice.cookie })
  assert.equal(source.status, 200)
  assert.equal((await fetch(source.data.url)).status, 200)

  // The server is started with C3_EMBED_FAIL_ONCE_AT=1; retry then succeeds.
  const failed = await request(`/api/knowledge/documents/${id}/process`, { method: 'POST', cookie: alice.cookie })
  assert.equal(failed.status, 422)
  assert.equal(failed.data.errorCode, 'EMBEDDING_FAILED')
  assert.equal((await prisma.knowledgeChunk.count({ where: { documentId: id } })), 0)
  assert.deepEqual((await request('/api/knowledge/search', { method: 'POST', cookie: alice.cookie,
    body: { query: 'memory evidence' } })).data.matches, [])
  const retried = await request(`/api/knowledge/documents/${id}/process`, { method: 'POST', cookie: alice.cookie })
  assert.equal(retried.status, 200)
  assert.ok(retried.data.chunkCount > 1)
  assert.equal(await prisma.knowledgeChunk.count({ where: { documentId: id } }), retried.data.chunkCount)
  const sealed = await prisma.knowledgeDocument.findUniqueOrThrow({ where: { id } })
  assert.ok(sealed.objectKey.includes('/sealed/'))
  const overwrittenStaging = Buffer.from('X'.repeat(long.length))
  await put(upload.data.uploadUrl, 'text/plain', overwrittenStaging)
  const sealedSource = await request(`/api/knowledge/documents/${id}/source`, { cookie: alice.cookie })
  assert.equal(Buffer.compare(Buffer.from(await (await fetch(sealedSource.data.url)).arrayBuffer()), long), 0,
    'replaying a signed staging PUT cannot change the READY original')
  const duplicates = await prisma.$queryRaw`SELECT count(*)::int AS count FROM (SELECT "documentId", "indexingVersion", "position" FROM "KnowledgeChunk" GROUP BY 1,2,3 HAVING count(*) > 1) x`
  assert.equal(duplicates[0].count, 0)
  const aliceMatches = await request('/api/knowledge/search', { method: 'POST', cookie: alice.cookie, body: { query: 'memory evidence' } })
  assert.equal(aliceMatches.status, 200)
  assert.ok(aliceMatches.data.matches.some(match => match.documentId === id))
  assert.equal(aliceMatches.data.embeddingMode, 'mock')
  assert.deepEqual((await request('/api/knowledge/search', { method: 'POST', cookie: bob.cookie,
    body: { query: 'memory evidence' } })).data.matches, [])

  const pdf = await fixture('valid-two-page.pdf')
  const pdfUpload = await initiate(alice.cookie, 'valid-two-page.pdf', 'application/pdf', pdf)
  assert.equal(pdfUpload.status, 201)
  await put(pdfUpload.data.uploadUrl, 'application/pdf', pdf)
  assert.equal((await request(`/api/knowledge/documents/${pdfUpload.data.id}/process`, { method: 'POST', cookie: alice.cookie })).status, 200)
  const pages = await prisma.knowledgeChunk.findMany({ where: { documentId: pdfUpload.data.id }, orderBy: { position: 'asc' } })
  assert.deepEqual(pages.map(item => item.page), [1, 2])
  for (const chunk of pages) assert.ok(chunk.citationKey.length > 0 && chunk.endOffset > chunk.startOffset)
  await prisma.knowledgeDocument.update({ where: { id: pdfUpload.data.id }, data: { status: 'PROCESSING' } })
  const whileProcessing = await request('/api/knowledge/search', { method: 'POST', cookie: alice.cookie, body: { query: 'second page finding' } })
  assert.ok(whileProcessing.data.matches.every(match => match.documentId !== pdfUpload.data.id))
  await prisma.knowledgeDocument.update({ where: { id: pdfUpload.data.id }, data: { status: 'READY' } })
  const pdfMatches = await request('/api/knowledge/search', { method: 'POST', cookie: alice.cookie, body: { query: 'second page finding' } })
  assert.ok(pdfMatches.data.matches.some(match => match.documentId === pdfUpload.data.id && match.page === 2))

  const leaseBytes = Buffer.from('A processing lease blocks concurrent requests and can recover after expiry.')
  const leased = await initiate(alice.cookie, 'lease.txt', 'text/plain', leaseBytes)
  assert.equal(leased.status, 201)
  await put(leased.data.uploadUrl, 'text/plain', leaseBytes)
  await prisma.knowledgeDocument.update({ where: { id: leased.data.id },
    data: { status: 'PROCESSING', processingStartedAt: new Date() } })
  assert.equal((await request(`/api/knowledge/documents/${leased.data.id}/process`, { method: 'POST', cookie: alice.cookie })).status, 409)
  await prisma.knowledgeDocument.update({ where: { id: leased.data.id },
    data: { processingStartedAt: new Date(Date.now() - 16 * 60 * 1000) } })
  assert.equal((await request(`/api/knowledge/documents/${leased.data.id}/process`, { method: 'POST', cookie: alice.cookie })).status, 200)

  for (const [name, code] of [['broken.pdf', 'PARSE_FAILED'], ['scanned-or-no-text.pdf', 'UNSUPPORTED_SCANNED_PDF'], ['encrypted.pdf', 'ENCRYPTED_PDF']]) {
    const bytes = await fixture(name)
    const item = await initiate(alice.cookie, name, 'application/pdf', bytes)
    assert.equal(item.status, 201)
    await put(item.data.uploadUrl, 'application/pdf', bytes)
    const result = await request(`/api/knowledge/documents/${item.data.id}/process`, { method: 'POST', cookie: alice.cookie })
    assert.equal(result.status, 422)
    assert.equal(result.data.errorCode, code)
    assert.equal(await prisma.knowledgeChunk.count({ where: { documentId: item.data.id } }), 0)
  }
  assert.equal((await request('/api/knowledge/search', { method: 'POST', body: { query: 'memory' } })).status, 401)
  assert.equal((await request('/api/knowledge/search', { method: 'POST', cookie: alice.cookie,
    origin: 'https://attacker.example', body: { query: 'memory' } })).status, 403)
  console.log('C3 HTTP smoke passed: private signed storage, PDF pages, lifecycle, partial failure/retry, vector retrieval, Alice/Bob isolation')
} finally { await prisma.$disconnect() }
