import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'

test('expired sessions, password rotation, uniform login errors, validation and rate limits', async (t) => {
  const phone = `133${Date.now().toString().slice(-8)}`
  const a = request.agent(app)
  const password = 'security-test-123'
  let id: string
  await t.test('strict account fields; role cannot be assigned during registration', async () => {
    await a.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone: '123', password }).expect(400)
    await a.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone, password: 'short' }).expect(400)
    const result = await a.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone: `${phone.slice(0, 3)} ${phone.slice(3)}`, password, role: 'ADMIN' }).expect(201)
    id = result.body.data.user.id
    assert.equal(result.body.data.user.role, 'STUDENT')
    assert.equal((await db.user.findUniqueOrThrow({ where: { id } })).phone, phone)
  })
  await t.test('expired sessions are rejected', async () => {
    await db.session.updateMany({ where: { userId: id }, data: { expiresAt: new Date(Date.now() - 1000) } })
    const result = await a.get('/api/me').expect(401)
    assert.equal(result.body.error.code, 'UNAUTHORIZED')
    await a.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password }).expect(200)
  })
  await t.test('password change invalidates all sessions and preserves entitlements/progress', async () => {
    const b = request.agent(app)
    await b.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password }).expect(200)
    await a.post('/api/auth/password').set('Origin', env.APP_ORIGIN).send({ currentPassword: password, newPassword: 'changed-password-123' }).expect(200)
    await a.get('/api/me').expect(401); await b.get('/api/me').expect(401)
    assert.equal(await db.session.count({ where: { userId: id } }), 0)
    await a.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password }).expect(401)
    await a.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password: 'changed-password-123' }).expect(200)
  })
  await t.test('wrong and missing accounts return the same error', async () => {
    const wrong = await request(app).post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password: 'wrong-password' }).expect(401)
    const missing = await request(app).post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone: `132${phone.slice(3)}`, password: 'wrong-password' }).expect(401)
    assert.deepEqual(wrong.body, missing.body)
  })
  await t.test('login is limited by IP + phone, registration by IP', async () => {
    const attempt = { phone: `131${phone.slice(3)}`, password: 'wrong-password' }
    for (let i = 0; i < 10; i++) await request(app).post('/api/auth/login').set('Origin', env.APP_ORIGIN).send(attempt).expect(401)
    const blocked = await request(app).post('/api/auth/login').set('Origin', env.APP_ORIGIN).send(attempt).expect(429)
    assert.equal(blocked.body.error.code, 'RATE_LIMITED')
    assert.ok(blocked.headers['retry-after'])
    for (let i = 0; i < 2; i++) await request(app).post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true,}).expect(400)
    assert.equal((await request(app).post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true,}).expect(429)).body.error.code, 'RATE_LIMITED')
  })
  await db.$disconnect()
})
