import assert from 'node:assert/strict'

const origin = process.env.CAPSTONE_BASE_URL ?? 'http://127.0.0.1:3117'
const stamp = Date.now().toString(36)

async function request(path, { method = 'GET', cookie, body, originHeader } = {}) {
  const response = await fetch(origin + path, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(originHeader ? { origin: originHeader } : {}) },
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

const aliceEmpty = await request('/api/research/tasks', { cookie: alice.cookie })
const bobEmpty = await request('/api/research/tasks', { cookie: bob.cookie })
assert.equal(aliceEmpty.status, 200)
assert.equal(bobEmpty.status, 200)
assert.deepEqual(aliceEmpty.data.tasks, [])
assert.deepEqual(bobEmpty.data.tasks, [])
assert.ok(aliceEmpty.data.workspace.id > 0, 'registration creates Alice Workspace')
assert.ok(bobEmpty.data.workspace.id > 0, 'registration creates Bob Workspace')
assert.notEqual(aliceEmpty.data.workspace.id, bobEmpty.data.workspace.id)

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
assert.equal((await request('/api/research/tasks')).status, 401)
for (const extra of ['workspaceId', 'userId', 'ownerId']) {
  const malicious = await request('/api/research/tasks', { method: 'POST', cookie: bob.cookie,
    body: { title: 'Injected', query: 'Boundary test', [extra]: aliceList.data.workspace.id } })
  assert.equal(malicious.status, 400, `${extra} must be rejected`)
}
const crossOrigin = await request('/api/research/tasks', { method: 'POST', cookie: alice.cookie,
  originHeader: 'https://attacker.example', body: { title: 'Bad', query: 'Bad' } })
assert.equal(crossOrigin.status, 403)

// A new HTTP request reads the task from PostgreSQL, as a page refresh would.
const refreshed = await request(`/api/research/tasks/${taskId}`, { cookie: alice.cookie })
assert.equal(refreshed.status, 200)
assert.equal(refreshed.data.task.title, 'Evidence question')
const aliceRefreshedList = await request('/api/research/tasks', { cookie: alice.cookie })
assert.ok(aliceRefreshedList.data.tasks.some(task => task.id === taskId))
const bobStillEmpty = await request('/api/research/tasks', { cookie: bob.cookie })
assert.deepEqual(bobStillEmpty.data.tasks, [])

const logout = await request('/api/auth/logout', { method: 'POST', cookie: alice.cookie })
assert.equal(logout.status, 200)
assert.equal((await request('/api/research/tasks', { cookie: alice.cookie })).status, 401)
const login = await request('/api/auth/login', { method: 'POST', body: { username: `alice_${stamp}`, password: 'StrongPass123' } })
assert.equal(login.status, 200)
assert.ok((await request('/api/research/tasks', { cookie: login.cookie })).data.tasks.some(task => task.id === taskId))
console.log('C2 HTTP smoke passed: workspace creation, persistence, Alice/Bob isolation, strict input, anonymous/cross-origin rejection, logout/login')
