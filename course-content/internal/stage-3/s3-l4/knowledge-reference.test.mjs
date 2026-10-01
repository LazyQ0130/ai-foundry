// TEST_DATABASE_URL must point to the isolated stage3_l4_fresh database.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { once } from 'node:events'
import path from 'node:path'
import { createRequire } from 'node:module'

const project = path.resolve(process.argv[2] || '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage3_l4_fresh')) throw new Error('Isolated Stage 3.4 DB required')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })
const server = createServer(async (request, response) => {
  const parts = []
  for await (const part of request) parts.push(part)
  const body = JSON.parse(Buffer.concat(parts).toString())
  assert.equal(request.url, '/compatible-mode/v1/embeddings')
  assert.equal(body.dimensions, 1024)
  assert.equal(body.model, 'text-embedding-v4')
  if (body.input.includes('UNAUTHORIZED')) { response.writeHead(401); response.end('secret provider response'); return }
  if (body.input.includes('FAILURE')) { response.writeHead(500); response.end('secret provider response'); return }
  if (body.input.includes('SLOW')) await delay(1300)
  const size = body.input.includes('BAD_DIMENSION') ? 3 : 1024
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify({ data: [{ embedding: Array(size).fill(0.25) }], usage: { prompt_tokens: 2, total_tokens: 2 } }))
})
server.listen(0, '127.0.0.1')
await once(server, 'listening')
const stubPort = server.address().port
const port = process.argv[3] || '32431'
const base = `http://127.0.0.1:${port}`
let app
async function start(env) {
  app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', port], {
    cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, ...env }, stdio: 'ignore', windowsHide: true,
  })
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Next server exited')
    try { if ((await fetch(base)).ok) return } catch { /* startup */ }
    await delay(100)
  }
  throw new Error('Next server not ready')
}
async function stop() {
  if (!app) return
  app.kill()
  await Promise.race([once(app, 'exit'), delay(3000)])
  app = undefined
  await delay(200)
}
async function user() {
  const response = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `k${Date.now()}${Math.floor(Math.random() * 9999)}`, password: 'TestPassword123!' }) })
  assert.equal(response.status, 201)
  return response.headers.get('set-cookie').split(';')[0]
}
async function post(cookie, title, content, extra = {}, headers = {}) {
  const response = await fetch(base + '/api/knowledge/documents', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ title, content, ...extra }) })
  return { status: response.status, body: await response.json() }
}
async function list(cookie) {
  const response = await fetch(base + '/api/knowledge/documents', { headers: { Cookie: cookie } })
  return { status: response.status, body: await response.json() }
}

try {
  await start({ AI_PROVIDER_MODE: 'mock' })
  assert.equal((await list('')).status, 401)
  assert.equal((await post('', 'x', 'hello')).status, 401)
  const alice = await user(), bob = await user()
  assert.equal((await post(alice, 'x', 'hello', {}, { Origin: 'https://evil.invalid' })).status, 403)
  assert.equal((await post(alice, 'x', Array(9).fill('a'.repeat(650)).join('\n\n'))).status, 400)
  assert.equal((await post(alice, 'x', 'hello', { ownerId: 99999 })).status, 400)
  assert.equal((await post(alice, 'x', 'hello', { embedding: [1, 2, 3] })).status, 400)
  const good = await post(alice, 'Mock 文档', '甲'.repeat(450) + '\n\n' + '乙'.repeat(450))
  assert.equal(good.status, 201)
  assert.equal(good.body.kind, 'mock')
  assert.equal(good.body.chunkCount, 2)
  assert.equal(good.body.dimension, 1024)
  const aliceList = await list(alice), bobList = await list(bob)
  assert(aliceList.body.documents.some(item => item.id === good.body.id && item.status === 'ready' && item.chunkCount === 2))
  assert(!bobList.body.documents.some(item => item.id === good.body.id))
  assert(!JSON.stringify(aliceList.body).includes('embedding:') && !JSON.stringify(aliceList.body).includes('[0.'))
  await db.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION reject_knowledge_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."content" LIKE '%DB_WRITE_FAILURE%' THEN RAISE EXCEPTION 'test-only database rejection'; END IF; RETURN NEW; END $$`)
  await db.$executeRawUnsafe(`CREATE TRIGGER reject_knowledge_test_trigger BEFORE INSERT ON "KnowledgeChunk" FOR EACH ROW EXECUTE FUNCTION reject_knowledge_test()`)
  try {
    const failed = await post(bob, 'DB failure', 'DB_WRITE_FAILURE')
    assert.equal(failed.status, 502)
    assert((await list(bob)).body.documents.some(item => item.title === 'DB failure' && item.status === 'failed' && item.chunkCount === 0))
  } finally {
    await db.$executeRawUnsafe(`DROP TRIGGER reject_knowledge_test_trigger ON "KnowledgeChunk"`)
    await db.$executeRawUnsafe(`DROP FUNCTION reject_knowledge_test()`)
  }
  await stop()

  const config = { AI_PROVIDER_MODE: 'real', AI_EMBEDDING_BASE_URL: `http://127.0.0.1:${stubPort}/compatible-mode/v1`,
    AI_EMBEDDING_API_KEY: 'test-key-only', AI_EMBEDDING_MODEL: 'text-embedding-v4', AI_EMBEDDING_DIMENSION: '1024', AI_TIMEOUT_MS: '1000' }
  await start({ ...config, AI_EMBEDDING_API_KEY: '' })
  let cookie = await user()
  assert.equal((await post(cookie, 'Missing', 'hello')).status, 503)
  assert((await list(cookie)).body.documents.some(item => item.title === 'Missing' && item.status === 'failed'))
  await stop()

  await start(config)
  cookie = await user()
  const real = await post(cookie, 'Stub document', 'safe text')
  assert.equal(real.status, 201)
  assert.equal(real.body.kind, 'real')
  assert.equal(real.body.model, 'text-embedding-v4')
  assert.equal(real.body.usage, 2)
  for (const marker of ['UNAUTHORIZED', 'FAILURE', 'BAD_DIMENSION', 'SLOW']) {
    const owner = await user()
    const result = await post(owner, marker, marker)
    assert.equal(result.status, marker === 'SLOW' ? 504 : 502, marker)
    assert(!JSON.stringify(result.body).includes('secret provider response'))
    assert((await list(owner)).body.documents.some(item => item.title === marker && item.status === 'failed'))
  }
  await stop()
  console.log('PASS: Stage 3.4 knowledge route; Mock/Real stub; owner isolation; origin; limits; failed status; provider config/401/5xx/dimension/timeout/database write')
} finally { await stop(); await db.$disconnect(); server.close() }
