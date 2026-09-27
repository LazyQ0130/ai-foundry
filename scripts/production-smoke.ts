import 'dotenv/config'
import { spawn } from 'node:child_process'
import assert from 'node:assert/strict'
import { setTimeout } from 'node:timers/promises'

const origin = 'https://aifoundry.example'
const base = 'http://127.0.0.1:3081'
const server = spawn(process.execPath, ['server-dist/server/index.js'], {
  env: { ...process.env, NODE_ENV: 'production', APP_ORIGIN: origin, PORT: '3081' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
try {
  let ready = false
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error('Production server exited before becoming ready')
    try { ready = (await fetch(`${base}/api/health`)).ok } catch { /* Await startup */ }
    if (ready) break
    await setTimeout(150)
  }
  assert.ok(ready, 'production server must start')
  for (const route of ['/', '/about', '/faq', '/login', '/forgot-password', '/privacy', '/terms', '/dashboard', '/admin/users']) {
    const response = await fetch(base + route)
    assert.equal(response.status, 200)
    assert.match(await response.text(), /<div id="root"><\/div>/)
  }
  const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }) })
  assert.equal(login.status, 200)
  const cookie = login.headers.get('set-cookie')!
  assert.match(cookie, /Secure/); assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/)
  const token = cookie.split(';')[0]
  const me = await fetch(`${base}/api/me`, { headers: { Cookie: token } })
  assert.equal(me.status, 200)
  assert.doesNotMatch(await me.text(), /passwordHash|tokenHash|internalNote/)
  await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Origin: origin, Cookie: token } })
  assert.equal((await fetch(`${base}/api/me`, { headers: { Cookie: token } })).status, 401)
  assert.equal((await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { Origin: 'https://evil.example' } })).status, 403)
  for (const route of ['/course-content/stage-1/s1-l0.md', '/course-content/stage-1/s1-l1.md', '/course-content/stage-2/s2-l3.md', '/.env', '/server/app.ts', '/.runtime/legacy-build-phase4/index.html']) {
    const response = await fetch(base + route)
    const body = await response.text()
    assert.doesNotMatch(body, /FastAPI|DATABASE_URL|SESSION_SECRET|express|legacy-build|estimatedTime|checkKeys|先认识一下你手上的这个项目/)
  }
  const deniedLesson = await fetch(base + '/api/lessons/s1-l1')
  assert.equal(deniedLesson.status, 401)
  assert.doesNotMatch(await deniedLesson.text(), /checkKeys|body|第一次修改/)
  console.info('PASS: compiled production server, SPA routes, Secure cookie, logout, CSRF and private-file isolation.')
} finally { server.kill() }
