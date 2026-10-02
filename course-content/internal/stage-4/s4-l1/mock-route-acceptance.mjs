// Isolated local PostgreSQL Route smoke, no paid Provider calls.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import path from 'node:path'

const project = path.resolve(process.argv[2] ?? '')
if (!process.argv[2] || !process.env.TEST_DATABASE_URL?.includes('127.0.0.1:55433/stage4_l1'))
  throw new Error('Use a built Reference and isolated local stage4_l1 database')
const port = 32360, base = `http://127.0.0.1:${port}`
const app = spawn(process.execPath, [path.join(project, 'node_modules/next/dist/bin/next'), 'start', '-p', String(port)], {
  cwd: project, env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, AI_PROVIDER_MODE: 'mock' },
  stdio: 'ignore', windowsHide: true,
})
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw new Error('Reference server exited')
    try { if ((await fetch(base)).ok) { ready = true; break } } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert(ready)
  const request = (body, headers = {}) => fetch(`${base}/api/agent/run`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
  })
  assert.equal((await request({ goal: 'Git' })).status, 401)
  const registration = await fetch(`${base}/api/auth/register`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: `mock${Date.now()}`, password: 'LocalTestPassword123!' }) })
  assert.equal(registration.status, 201)
  const cookie = registration.headers.get('set-cookie')?.split(';')[0]
  assert(cookie)
  assert.equal((await request({ goal: 'Git' }, { Cookie: cookie, Origin: 'https://other.example' })).status, 403)
  assert.equal((await request({ goal: 'Git', ownerId: 123 }, { Cookie: cookie })).status, 400)
  for (const [demo, status, modelCalls, toolCalls] of [
    ['direct', 'completed', 1, 0], ['tool', 'completed', 2, 1],
    ['extra_field', 'failed', 1, 0], ['multiple_tools', 'failed', 1, 0],
    ['budget_exhausted', 'budget_exhausted', 0, 0],
  ]) {
    const response = await request({ goal: 'Git', demo }, { Cookie: cookie })
    assert.equal(response.status, 200)
    const data = await response.json()
    assert.equal(data.status, status); assert.equal(data.modelCalls, modelCalls)
    assert.equal(data.toolCalls, toolCalls); assert.equal(data.providerUnits, 0)
    console.log(JSON.stringify({ demo, status: data.status, modelCalls, toolCalls }))
  }
  assert.equal((await request({ goal: 'Git' }, { Cookie: cookie })).status, 429)
} finally { app.kill() }
