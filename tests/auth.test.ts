import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'

test('real PostgreSQL registration, cookie sessions, login, logout and disabled accounts', async () => {
  const phone = `138${Date.now().toString().slice(-8)}`
  const password = 'test-password-123'
  const agent = request.agent(app)
  const created = await agent.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone, password })
  assert.equal(created.status, 201)
  assert.equal(created.body.data.user.phoneVerified, false)
  assert.deepEqual(created.body.data.user.entitlements, [])
  const cookie = String(created.headers['set-cookie'])
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/)
  assert.doesNotMatch(JSON.stringify(created.body), /passwordHash|tokenHash|internalNote/)
  const user = await db.user.findUniqueOrThrow({ where: { phone } })
  assert.match(user.passwordHash, /^\$argon2id\$/)
  const session = await db.session.findFirstOrThrow({ where: { userId: user.id } })
  assert.equal(session.tokenHash.length, 64)
  assert.equal((await agent.get('/api/me')).status, 200)
  assert.equal((await agent.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone, password })).status, 409)
  assert.equal((await request(app).post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password: 'wrong-password' })).body.error.code, 'INVALID_CREDENTIALS')
  await agent.post('/api/auth/logout').set('Origin', env.APP_ORIGIN).expect(200)
  assert.equal((await agent.get('/api/me')).status, 401)
  assert.equal(await db.session.count({ where: { userId: user.id } }), 0)
  await agent.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password }).expect(200)
  await db.user.update({ where: { id: user.id }, data: { status: 'DISABLED' } })
  assert.equal((await agent.get('/api/me')).status, 401)
  assert.equal((await agent.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password })).body.error.code, 'ACCOUNT_DISABLED')
  await db.$disconnect()
})
