// Run with node --env-file=.env and TEST_DATABASE_URL pointing to stage3_l4_fresh.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import path from 'node:path'
import { createRequire } from 'node:module'

const project = path.resolve(process.argv[2] || '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage3_l4_fresh')) throw new Error('Isolated DB required')
for (const name of ['AI_EMBEDDING_BASE_URL', 'AI_EMBEDDING_API_KEY', 'AI_EMBEDDING_MODEL', 'AI_EMBEDDING_DIMENSION']) if (!process.env[name]) throw new Error(`Missing ${name}`)
assert.equal(process.env.AI_EMBEDDING_MODEL, 'text-embedding-v4')
assert.equal(process.env.AI_EMBEDDING_DIMENSION, '1024')
const port = '32440'
const base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', port], {
  cwd: project, env: { ...process.env, AI_PROVIDER_MODE: 'real', DATABASE_URL: process.env.TEST_DATABASE_URL }, stdio: 'ignore', windowsHide: true,
})
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const require = createRequire(path.join(project, 'package.json'))
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } })

try {
  let ready = false
  for (let i = 0; i < 120; i++) {
    if (app.exitCode !== null) throw new Error('Next server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await delay(100)
  }
  assert(ready, 'Next server starts')
  const register = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `r${Date.now()}`, password: 'TestPassword123!' }) })
  assert.equal(register.status, 201)
  const cookie = register.headers.get('set-cookie').split(';')[0]
  const cases = [
    { name: 'short', text: 'Git 可以记录代码版本。', expected: 1 },
    { name: 'three-chunk', text: ['Git 可以记录代码的不同版本和变更历史。'.repeat(20), 'PostgreSQL 可以保存结构化的资料与关系。'.repeat(20), '浏览器 Cookie 可保存会话状态。'.repeat(25)].join('\n\n'), expected: 3 },
  ]
  for (const item of cases) {
    const start = performance.now()
    const response = await fetch(base + '/api/knowledge/documents', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `3.4 real acceptance ${item.name}`, content: item.text }) })
    const data = await response.json()
    if (response.status !== 201) throw new Error(`Real indexing failed: HTTP ${response.status}; safe error=${data.error || 'none'}`)
    assert.equal(data.kind, 'real')
    assert.equal(data.status, 'ready')
    assert.equal(data.model, 'text-embedding-v4')
    assert.equal(data.dimension, 1024)
    assert.equal(data.chunkCount, item.expected)
    const rows = await db.$queryRawUnsafe('SELECT "position", vector_dims("embedding") AS dims FROM "KnowledgeChunk" WHERE "documentId" = $1 ORDER BY "position"', data.id)
    assert.equal(rows.length, item.expected)
    assert(rows.every(row => row.dims === 1024))
    console.log(JSON.stringify({ case: item.name, httpStatus: response.status, status: data.status, model: data.model,
      dimension: data.dimension, chunkCount: rows.length, vectorDims: rows.map(row => row.dims), latencyMs: Math.round(performance.now() - start), usageTotalTokens: data.usage }))
  }
} finally {
  await db.$disconnect()
  app.kill()
  await Promise.race([once(app, 'exit'), delay(3000)])
}
