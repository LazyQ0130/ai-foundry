import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer, type Server } from 'node:http'
import { once } from 'node:events'

async function listen(server: Server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  return address.port
}

test('fault proxy preserves auth, commits only one dropped write and recovers through a real GET', async () => {
  const { faultProxy } = await import(new URL('../course-tools/stage-2/fault-proxy-core.mjs', import.meta.url).href)
  let writes = 0
  const upstream = createServer((req, res) => {
    assert.equal(req.headers.cookie, 'fixture=opaque')
    assert.equal(req.headers.origin, `http://localhost:${targetPort}`)
    req.resume()
    if (req.url === '/api/resources' && req.method === 'POST') {
      writes++
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ id: writes }))
    } else { res.writeHead(200); res.end(JSON.stringify({ writes })) }
  })
  const targetPort = await listen(upstream)
  const logs: string[] = []
  const proxy = faultProxy({ mode: 'lose-write-response', targetPort, log: (line: string) => logs.push(line) })
  const port = await listen(proxy)
  const headers = { Cookie: 'fixture=opaque', Origin: `http://localhost:${port}`, Host: `localhost:${port}` }
  try {
    const denied = await fetch(`http://localhost:${port}/api/resources`, { method: 'POST', headers: { ...headers, Origin: 'https://course.invalid' }, body: '{}' })
    assert.equal(denied.status, 403)
    assert.equal(writes, 0)
    const incomplete = await fetch(`http://localhost:${port}/api/resources`, { method: 'POST', headers, body: '{}' })
    assert.equal(incomplete.status, 201)
    await assert.rejects(incomplete.json())
    assert.equal(writes, 1)
    const check = await fetch(`http://localhost:${port}/api/resources`, { headers })
    assert.deepEqual(await check.json(), { writes: 1 })
    assert.equal(logs.filter(line => line.includes('truncated once')).length, 1)
    assert.ok(logs.every(line => !line.includes('opaque')))
  } finally { proxy.stop(); upstream.closeAllConnections(); await new Promise<void>(resolve => upstream.close(() => resolve())) }
})

test('read fault is armed only by a successful write; normal mode removes it without another write', async () => {
  const { faultProxy } = await import(new URL('../course-tools/stage-2/fault-proxy-core.mjs', import.meta.url).href)
  let allowed = false, writes = 0
  const upstream = createServer((req, res) => {
    req.resume()
    if (req.method === 'POST') { if (allowed) writes++; res.writeHead(allowed ? 201 : 403); res.end('{}') }
    else { res.writeHead(200); res.end(JSON.stringify({ writes })) }
  })
  const targetPort = await listen(upstream)
  const proxy = faultProxy({ mode: 'read-fail-after-write', targetPort, log() {} })
  const normal = faultProxy({ mode: 'normal', targetPort, log() {} })
  try {
    const base = `http://127.0.0.1:${await listen(proxy)}`
    assert.equal((await fetch(base + '/api/resources', { method: 'POST', body: '{}' })).status, 403)
    assert.equal((await fetch(base + '/api/resources')).status, 200)
    allowed = true
    assert.equal((await fetch(base + '/api/resources', { method: 'POST', body: '{}' })).status, 201)
    assert.equal((await fetch(base + '/api/resources')).status, 503)
    const restored = await fetch(`http://127.0.0.1:${await listen(normal)}/api/resources`)
    assert.equal(restored.status, 200)
    assert.deepEqual(await restored.json(), { writes: 1 })
  } finally { proxy.stop(); normal.stop(); upstream.closeAllConnections(); await new Promise<void>(resolve => upstream.close(() => resolve())) }
})

test('slow GET waits for the real response and does not turn a rejected response into success', async () => {
  const { faultProxy } = await import(new URL('../course-tools/stage-2/fault-proxy-core.mjs', import.meta.url).href)
  const upstream = createServer((req, res) => { req.resume(); res.writeHead(401); res.end('denied') })
  const targetPort = await listen(upstream)
  const proxy = faultProxy({ mode: 'slow-get', targetPort, log() {} })
  try {
    const port = await listen(proxy), started = performance.now()
    const result = await fetch(`http://localhost:${port}/api/resources`)
    assert.ok(performance.now() - started >= 1900)
    assert.equal(result.status, 401)
    assert.equal(await result.text(), 'denied')
  } finally { proxy.stop(); upstream.closeAllConnections(); await new Promise<void>(resolve => upstream.close(() => resolve())) }
})

test('account-switch mode delays the original GET by ten seconds while leaving auth requests responsive', async () => {
  const { faultProxy } = await import(new URL('../course-tools/stage-2/fault-proxy-core.mjs', import.meta.url).href)
  let oldRead!: () => void
  const oldReadStarted = new Promise<void>(resolve => { oldRead = resolve })
  const upstream = createServer((req, res) => {
    req.resume(); res.writeHead(200, { 'Content-Type': 'application/json' })
    if (req.url === '/api/resources') { oldRead(); res.end(JSON.stringify({ owner: req.headers.cookie })) }
    else res.end(JSON.stringify({ switched: true }))
  })
  const targetPort = await listen(upstream)
  const proxy = faultProxy({ mode: 'slow-account-get', targetPort, log() {} })
  try {
    const port = await listen(proxy), started = performance.now()
    const delayed = fetch(`http://localhost:${port}/api/resources`, { headers: { Cookie: 'session=alice-fixture' } })
    await oldReadStarted
    const authStarted = performance.now()
    const auth = await fetch(`http://localhost:${port}/api/auth/logout`, { method: 'POST' })
    assert.deepEqual(await auth.json(), { switched: true })
    assert.ok(performance.now() - authStarted < 2000, 'auth must not share the GET delay')
    const old = await delayed
    assert.deepEqual(await old.json(), { owner: 'session=alice-fixture' })
    assert.ok(performance.now() - started >= 9900)
  } finally { proxy.stop(); upstream.closeAllConnections(); await new Promise<void>(resolve => upstream.close(() => resolve())) }
})
