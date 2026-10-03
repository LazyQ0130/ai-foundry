import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createRequire } from 'node:module'
import path from 'node:path'
import { mockEmbedding } from '../lib/knowledge-mock.ts'
import { vectorLiteral } from '../lib/knowledge-vector.ts'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const dbGuard = url => /^postgresql:\/\/[^\s]+@127\.0\.0\.1:55433\/stage4_l7(?:\?[^\s]*)?$/.test(url ?? '')

export async function createEvalContext() {
  const project = process.cwd()
  const url = process.env.TEST_DATABASE_URL
  if (!dbGuard(url) || process.env.NODE_ENV === 'production')
    throw new Error('Eval requires isolated 127.0.0.1:55433/stage4_l7 PostgreSQL')
  const require = createRequire(path.join(project, 'package.json'))
  const { PrismaClient } = require('@prisma/client')
  const db = new PrismaClient({ datasources: { db: { url } } })
  const port = Number(process.env.AGENT_EVAL_PORT ?? 32747)
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid AGENT_EVAL_PORT')
  const base = `http://127.0.0.1:${port}`
  const secret = randomBytes(48).toString('base64url')
  const mcpSecret = randomBytes(48).toString('base64url')
  let app
  let counter = 0

  async function start() {
    app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
      cwd: project, env: { ...process.env, DATABASE_URL: url, AI_PROVIDER_MODE: 'mock',
        AGENT_APPROVAL_SECRET: secret, MCP_AUTH_SECRET: mcpSecret,
        MCP_REFERENCE_URL: `${base}/api/mcp/reference`, MCP_ALLOW_LOCAL_HTTP: '1' },
      stdio: 'ignore', windowsHide: true,
    })
    for (let i = 0; i < 120; i++) {
      if (app.exitCode !== null) throw new Error('Eval Next server exited')
      try { if ((await fetch(base)).ok) return } catch { /* startup */ }
      await delay(100)
    }
    throw new Error('Eval Next server did not become ready')
  }
  async function stop() {
    if (!app) return
    const current = app
    current.kill()
    await Promise.race([once(current, 'exit'), delay(3000)])
    app = undefined
    await delay(250)
  }
  async function restart() { await stop(); await start() }
  async function request(method, route, cookie, body) {
    const response = await fetch(base + route, { method, headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    let data
    try { data = await response.json() } catch { data = {} }
    return { code: response.status, data }
  }
  async function user() {
    const username = `eval${++counter}${randomBytes(6).toString('hex')}`
    const response = await fetch(base + '/api/auth/register', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: `Aa1!${randomBytes(24).toString('base64url')}` }) })
    assert.equal(response.status, 201, 'isolated eval registration')
    const cookie = response.headers.get('set-cookie')?.split(';')[0]
    assert(cookie)
    const me = await request('GET', '/api/auth/me', cookie)
    assert.equal(me.code, 200)
    return { id: me.data.user.id, cookie }
  }
  async function seed(ownerId, title, content, vector = mockEmbedding('Git 恢复版本')) {
    const doc = await db.knowledgeDocument.create({ data: { ownerId, title, content, status: 'ready' } })
    const literal = vectorLiteral(vector)
    await db.$executeRaw`INSERT INTO "KnowledgeChunk" ("documentId", "position", "content", "embedding", "embeddingModel", "embeddingDimension")
      VALUES (${doc.id}, 0, ${content}, ${literal}::vector, 'mock-embedding-v1', 1024)`
    return doc
  }
  async function resourceCount(ownerId) { return db.resource.count({ where: { ownerId } }) }
  await start()
  return { project, db, base, secret, mcpSecret, request, post: (route, cookie, body) => request('POST', route, cookie, body),
    get: (route, cookie) => request('GET', route, cookie), user: user,
    seed, resourceCount, restart, close: async () => { await stop(); await db.$disconnect() } }
}
