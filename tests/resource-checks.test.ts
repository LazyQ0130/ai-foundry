import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

// Stand-in configuration bootstrap; these tests exercise actual command transport,
// assertions and failure behavior. Real Next/PostgreSQL runs are separately recorded.
async function fixture() {
  const cwd = path.resolve('.runtime', `resource-check-test-${randomUUID()}`)
  await mkdir(path.join(cwd, 'node_modules/@next/env'), { recursive: true })
  await writeFile(path.join(cwd, 'package.json'), '{"private":true}')
  await writeFile(path.join(cwd, 'node_modules/@next/env/index.js'), 'exports.loadEnvConfig=()=>{}')
  return cwd
}
async function command(cwd: string, port: number, selected: string, database = '') {
  const child = spawn(process.execPath, [path.resolve('course-tools/shared/course-checks.mjs'), '--case', selected], {
    cwd, windowsHide: true, env: { ...process.env, NODE_ENV: 'test', CHECK_BASE_URL: `http://127.0.0.1:${port}`, DATABASE_URL: database },
  })
  let output = ''
  child.stdout.on('data', bytes => { output += bytes.toString() })
  child.stderr.on('data', bytes => { output += bytes.toString() })
  const [code] = await once(child, 'exit')
  return { code, output }
}
test('anonymous learner commands exercise real HTTP and delete only their newly created fixture', async () => {
  const cwd = await fixture()
  const baseline = { id: 7, title: 'Keep existing', desc: 'Existing learning record', tag: '文章', important: false }
  let rows = [{ ...baseline }], writes = 0, deletions: number[] = [], nextId = 12, auth = false, corrupt = false
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes.toString()
    const body = raw ? JSON.parse(raw) : null
    const send = (status: number, data: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)) }
    if (auth) return send(401, { error: 'Login required' })
    if (req.method === 'GET') return send(200, { resources: rows })
    const id = Number(req.url?.split('/').pop())
    if (req.method !== 'POST' && (!Number.isInteger(id) || id <= 0)) return send(400, { error: 'ID' })
    if (req.method !== 'POST' && !rows.some(row => row.id === id)) return send(404, { error: 'Missing' })
    if (req.method !== 'DELETE' && (typeof body?.title !== 'string' || !body.title.trim() || typeof body.desc !== 'string' || !body.desc.trim() || body.tag !== '文章' || typeof body.important !== 'boolean')) return send(400, { error: 'Input' })
    if (req.method === 'POST') { writes++; const resource = { ...body, id: nextId++ }; rows.push(resource); return send(201, { saved: true, resource }) }
    if (req.method === 'PATCH') {
      rows = rows.map(row => row.id === id ? { ...body, id } : row)
      if (corrupt) rows[0].title = 'Unexpected unrelated mutation'
      return send(200, { resource: rows.find(row => row.id === id) })
    }
    if (req.method === 'DELETE') { deletions.push(id); rows = rows.filter(row => row.id !== id); return send(200, { deletedId: id }) }
    send(405, {})
  })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  const port = (server.address() as { port: number }).port
  try {
    const created = await command(cwd, port, 'resource-create')
    assert.equal(created.code, 0, created.output)
    assert.match(created.output, /PASS resource-create/)
    assert.equal(writes, 1); assert.equal(rows.length, 2); assert.equal(deletions.length, 0)
    const retained = rows.map(row => ({ ...row }))
    const crud = await command(cwd, port, 'resource-crud')
    assert.equal(crud.code, 0, crud.output)
    assert.match(crud.output, /PASS resource-crud/)
    assert.deepEqual(rows, retained); assert.deepEqual(deletions, [13]); assert.equal(writes, 2)
    auth = true
    const later = await command(cwd, port, 'resource-create')
    assert.notEqual(later.code, 0); assert.equal(writes, 2); assert.doesNotMatch(later.output, /PASS resource-create/)
    auth = false; corrupt = true
    const invalid = await command(cwd, port, 'resource-crud')
    assert.notEqual(invalid.code, 0); assert.match(invalid.output, /UNEXPECTED_RESOURCE_CHANGE/)
    assert.equal(writes, 3); assert.deepEqual(deletions, [13]); assert.doesNotMatch(invalid.output, /PASS resource-crud/)
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
})
test('PATCH-only command works before DELETE exists, retains its fixture and rejects stale reads or unauthorized writes', async () => {
  const cwd = await fixture()
  const baseline = { id: 7, title: 'Keep existing', desc: 'Existing learning record', tag: '文章', important: false }
  let rows = [{ ...baseline }], nextId = 12, deletes = 0, posts = 0, auth = false, stale = false, corrupt = false
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes.toString()
    const body = raw ? JSON.parse(raw) : null
    const send = (status: number, data: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)) }
    if (req.method === 'DELETE') { deletes++; return send(405, {}) }
    if (auth) return send(401, { error: 'Login required' })
    if (req.method === 'GET') return send(200, { resources: rows })
    if (req.method === 'POST') posts++
    const id = Number(req.url?.split('/').pop())
    if (req.method === 'PATCH' && (!Number.isInteger(id) || id <= 0)) return send(400, {})
    if (req.method === 'PATCH' && !rows.some(row => row.id === id)) return send(404, {})
    if (typeof body?.title !== 'string' || !body.title.trim() || typeof body.desc !== 'string' || !body.desc.trim() || body.tag !== '文章' || typeof body.important !== 'boolean') return send(400, {})
    if (req.method === 'POST') { const resource = { ...body, id: nextId++ }; rows.push(resource); return send(201, { saved: true, resource }) }
    if (req.method === 'PATCH') {
      const resource = { ...body, id }
      rows = rows.map(row => row.id === id ? { ...resource, desc: stale ? row.desc : resource.desc } : row)
      if (corrupt) rows[0].title = 'Unauthorized unrelated mutation'
      return send(200, { resource })
    }
    send(405, {})
  })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  const port = (server.address() as { port: number }).port
  try {
    const patched = await command(cwd, port, 'resource-patch')
    assert.equal(patched.code, 0, patched.output)
    assert.match(patched.output, /PASS resource-patch/)
    assert.match(patched.output, /patch-fixture-retained: ID 12; no DELETE request/)
    assert.equal(deletes, 0); assert.deepEqual(rows[0], baseline); assert.equal(rows.length, 2)
    assert.equal(rows[1].important, true); assert.equal(rows[1].desc, 'Edited non-sensitive local fixture')
    const previousPosts = posts
    auth = true
    const refused = await command(cwd, port, 'resource-patch')
    assert.notEqual(refused.code, 0); assert.equal(posts, previousPosts); assert.equal(deletes, 0)
    auth = false; stale = true
    const staleRead = await command(cwd, port, 'resource-patch')
    assert.notEqual(staleRead.code, 0); assert.match(staleRead.output, /UPDATE_GET_MISMATCH/)
    assert.doesNotMatch(staleRead.output, /PASS resource-patch/); assert.equal(deletes, 0)
    // Each run creates once and sends four invalid POST probes; no automatic retry.
    assert.equal(posts, previousPosts + 5)
    stale = false; corrupt = true
    const unrelated = await command(cwd, port, 'resource-patch')
    assert.notEqual(unrelated.code, 0); assert.match(unrelated.output, /UNEXPECTED_RESOURCE_CHANGE/)
    assert.equal(deletes, 0); assert.equal(posts, previousPosts + 10)
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
})
test('database failure command refuses an unconfirmed target before requests and requires both HTTP 503 responses', async () => {
  const cwd = await fixture(); let calls = 0, status = 503
  const server = createServer((req, res) => { req.resume(); calls++; res.writeHead(status, { 'Content-Type': 'application/json' }); res.end('{}') })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  const port = (server.address() as { port: number }).port
  try {
    const refused = await command(cwd, port, 'resource-db-failure', 'postgresql://test:test@127.0.0.1:5432/daily')
    assert.notEqual(refused.code, 0); assert.equal(calls, 0)
    const target = 'postgresql://test:test@127.0.0.1:65431/course_unreachable?schema=public'
    const valid = await command(cwd, port, 'resource-db-failure', target)
    assert.equal(valid.code, 0, valid.output); assert.equal(calls, 2)
    status = 200
    const wrong = await command(cwd, port, 'resource-db-failure', target)
    assert.notEqual(wrong.code, 0); assert.equal(calls, 3); assert.doesNotMatch(wrong.output, /PASS resource-db-failure/)
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())) }
})
