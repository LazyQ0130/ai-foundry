import { createServer, request } from 'node:http'

export const modes = ['normal', 'slow-get', 'slow-account-get', 'slow-write', 'read-fail-after-write', 'lose-write-response']
export function faultProxy({ mode, targetPort = 3008, log = console.log }) {
  if (!modes.includes(mode) || !Number.isInteger(targetPort) || targetPort < 1024 || targetPort > 65535) throw new Error('DEMO_PROXY_CONFIG_REQUIRED')
  let committed = false
  let dropped = false
  const sockets = new Set()
  const server = createServer((incoming, outgoing) => {
    const pathname = incoming.url?.split('?')[0]
    const resource = pathname === '/api/resources' || /^\/api\/resources\/\d+$/.test(pathname || '')
    const write = resource && ['POST', 'PATCH', 'DELETE'].includes(incoming.method)
    const changing = ['POST', 'PATCH', 'DELETE', 'PUT'].includes(incoming.method)
    const host = `localhost:${server.address()?.port}`
    const origin = incoming.headers.origin
    // Next normalizes its internal origin to the app port. Validate the public
    // origin before translating it; an arbitrary Origin must never be blessed.
    if (changing && ((origin && (origin !== `http://${host}` || incoming.headers.host !== host)) || ['cross-site', 'same-site'].includes(incoming.headers['sec-fetch-site']))) {
      incoming.resume()
      outgoing.writeHead(403, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      outgoing.end(JSON.stringify({ ok: false, error: '教学入口只接受同源写入。' }))
      return
    }
    if (mode === 'read-fail-after-write' && committed && resource && incoming.method === 'GET') {
      incoming.resume()
      log('FAULT GET /api/resources HTTP 503 (proxy injection)')
      outgoing.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      outgoing.end(JSON.stringify({ ok: false, error: '教学注入：保存已成功，但读取暂时失败。' }))
      return
    }
    // Translate only the verified public Origin. Cookie/Fetch Metadata stay intact;
    // Session and owner checks are still made by the unmodified application.
    const headers = { ...incoming.headers, host: `localhost:${targetPort}`, ...(origin === `http://${host}` ? { origin: `http://localhost:${targetPort}` } : {}) }
    const upstream = request({ hostname: '127.0.0.1', port: targetPort, path: incoming.url, method: incoming.method, headers }, response => {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => {
        const status = response.statusCode || 502
        if (write && status >= 200 && status < 300) committed = true
        if (resource) log(`FACT ${incoming.method} ${pathname} HTTP ${status}`)
        if (mode === 'lose-write-response' && write && committed && !dropped && status >= 200 && status < 300) {
          dropped = true
          log('FAULT successful write response truncated once; do not resend the write')
          // Starting the response first prevents Chromium from transparently
          // replaying a POST after a reset on a reused keep-alive connection.
          // JSON consumption fails, so the UI still cannot confirm the result.
          outgoing.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': '100', 'Connection': 'close', 'Cache-Control': 'no-store' })
          outgoing.flushHeaders()
          outgoing.write('{')
          setTimeout(() => outgoing.destroy(), 100).unref()
          return
        }
        const delay = mode === 'slow-account-get' && resource && incoming.method === 'GET' ? 10000 : (mode === 'slow-get' && resource && incoming.method === 'GET') || (mode === 'slow-write' && write) ? 2000 : 0
        const send = () => {
          if (outgoing.destroyed) return
          outgoing.writeHead(status, response.headers)
          outgoing.end(Buffer.concat(chunks))
        }
        if (delay) setTimeout(send, delay).unref()
        else send()
      })
      response.on('error', () => outgoing.destroy())
    })
    upstream.setTimeout(30000, () => upstream.destroy())
    upstream.on('error', () => {
      if (outgoing.destroyed) return
      outgoing.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      outgoing.end(JSON.stringify({ ok: false, error: '教学代理连不到副本服务，请检查 3008 终端是否 Ready。' }))
    })
    incoming.on('aborted', () => upstream.destroy())
    incoming.pipe(upstream)
  })
  server.on('connection', socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)) })
  server.stop = () => { for (const socket of sockets) socket.destroy(); server.close() }
  return server
}
