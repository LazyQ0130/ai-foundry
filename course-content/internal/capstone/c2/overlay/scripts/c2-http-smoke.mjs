import assert from 'node:assert/strict'

const origin = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3117'
const stamp = Date.now().toString(36)

async function request(path, { method = 'GET', cookie, body } = {}) {
  const response = await fetch(origin + path, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, cookie: response.headers.get('set-cookie')?.split(';')[0], data: await response.json() }
}

const alice = await request('/api/auth/register', { method: 'POST', body: { username: `alice_${stamp}`, password: 'StrongPass123' } })
const bob = await request('/api/auth/register', { method: 'POST', body: { username: `bob_${stamp}`, password: 'StrongPass123' } })
assert.equal(alice.status, 201)
assert.equal(bob.status, 201)
assert.ok(alice.cookie)
assert.ok(bob.cookie)

const created = await request('/api/research/tasks', {
  method: 'POST', cookie: alice.cookie, body: { title: 'Evidence question', query: 'What is supported by the material?' },
})
assert.equal(created.status, 201)
const taskId = created.data.task.id

const aliceList = await request('/api/research/tasks', { cookie: alice.cookie })
const bobList = await request('/api/research/tasks', { cookie: bob.cookie })
assert.equal(aliceList.status, 200)
assert.ok(aliceList.data.tasks.some(task => task.id === taskId))
assert.equal(bobList.status, 200)
assert.ok(!bobList.data.tasks.some(task => task.id === taskId))
assert.equal((await request(`/api/research/tasks/${taskId}`, { cookie: bob.cookie })).status, 404)
assert.equal((await request('/api/research/tasks', { method: 'POST', body: { title: 'Bad', query: 'Bad' } })).status, 401)
assert.equal((await request('/api/research/tasks', { method: 'POST', cookie: alice.cookie, body: { title: 'Bad', query: 'Bad', workspaceId: bobList.data.workspace.id } })).status, 400)

// A new HTTP request reads the task from PostgreSQL, as a page refresh would.
const refreshed = await request(`/api/research/tasks/${taskId}`, { cookie: alice.cookie })
assert.equal(refreshed.status, 200)
assert.equal(refreshed.data.task.title, 'Evidence question')
console.log('C2 HTTP smoke passed: auth, workspace ownership, task persistence, strict input')
