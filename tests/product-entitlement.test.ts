import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { hasProductAccess, hasStageAccess, PROJECT_LAB_KEY } from '../server/services/entitlement.js'
import { requireProductAccess } from '../server/services/product-access.js'

test('course bundle and Project Lab are independent in the database', async () => {
  const admin = request.agent(app)
  const student = request.agent(app)
  const phone = `136${Date.now().toString().slice(-8)}`
  const password = 'test-password-123'
  const { body } = await student.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone, password }).expect(201)
  const id = body.data.user.id as string
  await admin.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }).expect(200)
  const base = `/api/admin/users/${id}`
  const input = { source: 'TEST', note: 'pricing v2 test' }
  await student.post(`${base}/products/project-lab`).set('Origin', env.APP_ORIGIN).send(input).expect(403)

  await admin.post(`${base}/entitlements/all`).set('Origin', env.APP_ORIGIN).send(input).expect(200)
  let me = (await student.get('/api/me').expect(200)).body.data
  assert.deepEqual(new Set(me.entitlements), new Set(['stage-1', 'stage-2', 'stage-3', 'stage-4']))
  assert.deepEqual(me.productEntitlements, [])
  for (const stage of me.entitlements) assert.equal(await hasStageAccess(id, stage), true)
  assert.equal(await hasProductAccess(id, PROJECT_LAB_KEY), false)
  await assert.rejects(requireProductAccess(id), (error: { status?: number }) => error.status === 403)

  await admin.post(`${base}/products/project-lab`).set('Origin', env.APP_ORIGIN).send(input).expect(200)
  me = (await student.get('/api/me').expect(200)).body.data
  assert.deepEqual(me.productEntitlements, [PROJECT_LAB_KEY])
  assert.equal(await hasProductAccess(id, PROJECT_LAB_KEY), true)
  assert.equal(await db.entitlement.count({ where: { userId: id, status: 'ACTIVE' } }), 4)
  await requireProductAccess(id)

  await admin.delete(`${base}/products/project-lab`).set('Origin', env.APP_ORIGIN).send({ note: 'revoke test' }).expect(200)
  me = (await student.get('/api/me').expect(200)).body.data
  assert.deepEqual(me.productEntitlements, [])
  assert.equal(await db.entitlement.count({ where: { userId: id, status: 'ACTIVE' } }), 4)
  assert.equal(await hasProductAccess(id, PROJECT_LAB_KEY), false)
  assert.equal(await db.adminAuditLog.count({ where: { targetUserId: id, action: 'REVOKE_PRODUCT_ENTITLEMENT' } }), 1)

  await admin.post(`${base}/entitlements/projects`).set('Origin', env.APP_ORIGIN).send(input).expect(200)
  me = (await student.get('/api/me').expect(200)).body.data
  assert.deepEqual(new Set(me.entitlements), new Set(['stage-1', 'stage-2', 'stage-3', 'stage-4']))
  assert.deepEqual(me.productEntitlements, [PROJECT_LAB_KEY])
  assert.equal(await hasProductAccess(id, PROJECT_LAB_KEY), true)
  const audit = await db.adminAuditLog.findFirstOrThrow({ where: { targetUserId: id, action: 'GRANT_ALL_ACCESS_PROJECTS' } })
  assert.deepEqual(audit.metadata, { stages: ['stage-1', 'stage-2', 'stage-3', 'stage-4'], products: [PROJECT_LAB_KEY], source: 'TEST' })
  await admin.post(`${base}/disable`).set('Origin', env.APP_ORIGIN).expect(200)
  assert.equal(await hasProductAccess(id, PROJECT_LAB_KEY), false)
  await admin.post(`${base}/enable`).set('Origin', env.APP_ORIGIN).expect(200)
})
