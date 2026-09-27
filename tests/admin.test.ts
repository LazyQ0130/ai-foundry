import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'

test('administrator search, grants, all-access, revocation, notes, disable and audit', async () => {
  const admin = request.agent(app)
  const student = request.agent(app)
  const phone = `137${Date.now().toString().slice(-8)}`
  const password = 'test-password-123'
  const result = await student.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone, password }).expect(201)
  const id = result.body.data.user.id
  await student.get('/api/admin/users').expect(403)
  await request(app).get('/api/admin/users').expect(401)
  await admin.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }).expect(200)
  const list = await admin.get('/api/admin/users').query({ query: phone }).expect(200)
  assert.equal(list.body.data.users[0].id, id)
  assert.equal(list.body.data.users[0].phone, undefined)
  assert.match(list.body.data.users[0].phoneMasked, /\*{4}/)
  assert.equal((await admin.get(`/api/admin/users/${id}`)).body.data.phone, phone)
  const base = `/api/admin/users/${id}`
  await admin.patch(`${base}/note`).set('Origin', env.APP_ORIGIN).send({ note: '测试付款' }).expect(200)
  await admin.post(`${base}/entitlements`).set('Origin', env.APP_ORIGIN).send({ stageSlug: 'stage-2', source: 'MANUAL_PURCHASE', note: '测试付款' }).expect(200)
  assert.deepEqual((await student.get('/api/me')).body.data.entitlements, ['stage-2'])
  await admin.delete(`${base}/entitlements/stage-2`).set('Origin', env.APP_ORIGIN).send({ note: '测试撤销' }).expect(200)
  assert.deepEqual((await student.get('/api/me')).body.data.entitlements, [])
  await admin.post(`${base}/entitlements/all`).set('Origin', env.APP_ORIGIN).send({ source: 'TEST', note: '测试全套' }).expect(200)
  assert.equal((await student.get('/api/me')).body.data.entitlements.length, 4)
  assert.equal(await db.adminAuditLog.count({ where: { targetUserId: id, action: 'GRANT_ALL_ACCESS' } }), 1)
  await admin.post(`${base}/disable`).set('Origin', env.APP_ORIGIN).expect(200)
  assert.equal(await db.session.count({ where: { userId: id } }), 0)
  await student.get('/api/me').expect(401)
  await admin.post(`${base}/enable`).set('Origin', env.APP_ORIGIN).expect(200)
  await student.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone, password }).expect(200)
  assert.equal((await student.get('/api/me')).body.data.entitlements.length, 4)
  const audit = await admin.get('/api/admin/audit').query({ query: phone }).expect(200)
  assert.equal(audit.body.data.pagination.total, 6)
  assert.doesNotMatch(JSON.stringify(audit.body), /passwordHash|tokenHash/)
  await db.$disconnect()
})
