import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import sharp from 'sharp'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { planTemplates } from '../src/data/site.js'
import { authDestination, authPath } from '../src/lib/authNavigation.js'
import { purchaseAuthReturn } from '../src/lib/purchases.js'

test('checkout authentication preserves every plan and the original learning destination', () => {
  for (const plan of planTemplates) {
    const target = '/stage/stage-2#stage-access'
    const checkout = purchaseAuthReturn(plan.id, '/stage/stage-2', '', '#stage-access')
    const url = new URL(checkout, 'http://localhost')
    assert.equal(url.searchParams.get('purchase'), plan.id)
    assert.equal(url.searchParams.get('purchaseReturnTo'), target)
    const login = new URL(authPath('login', checkout), url)
    assert.equal(authDestination(login.searchParams.get('next'), 'STUDENT'), checkout)
  }
  const project = new URL(purchaseAuthReturn('all-access-projects', '/pricing', '?plan=all-access-projects&next=%2Fcapstone%2Flessons%2Fc2', '#plan-all-access-projects', '/capstone/lessons/c2'), 'http://localhost')
  assert.equal(project.searchParams.get('next'), '/capstone/lessons/c2')
  assert.equal(project.searchParams.get('purchaseReturnTo'), '/capstone/lessons/c2')
  assert.equal(project.hash, '#plan-all-access-projects')
})

test('manual purchases: private evidence, correction, atomic and idempotent grants', async (t) => {
  assert.equal(new URL(process.env.DATABASE_URL!).searchParams.get('schema'), 'aifoundry_test', 'Purchase integration tests require the isolated test schema')
  const origin = env.APP_ORIGIN
  const admin = request.agent(app)
  await admin.post('/api/auth/login').set('Origin', origin).send({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }).expect(200)
  const users = []
  for (let index = 0; index < 4; index++) {
    const agent = request.agent(app)
    const phone = `139${(Date.now() + index).toString().slice(-8)}`
    const result = await agent.post('/api/auth/register').set('Origin', origin).send({ phone, password: 'purchase-test-password', acceptedTerms: true }).expect(201)
    users.push({ agent, phone, id: result.body.data.user.id })
  }
  const [single, bundle, project, other] = users
  const proof = await sharp({ create: { width: 400, height: 800, channels: 3, background: '#eee' } }).png().toBuffer()
  const prepare = (agent: typeof single.agent, planId: string) => agent.post('/api/purchases/prepare').set('Origin', origin).send({ planId })
  const upload = (agent: typeof single.agent, id: string, body = proof, type = 'image/png') => agent.put(`/api/purchases/${id}/proof`).set('Origin', origin).set('Content-Type', type).send(body)
  const submit = (agent: typeof single.agent, row: { id: string; version: number }, extras = {}) => agent.post(`/api/purchases/${row.id}/submit`).set('Origin', origin).send({ paymentMethod: 'ALIPAY', version: row.version, ...extras })
  const approve = (row: { id: string; version: number }) => admin.post(`/api/admin/purchases/${row.id}/review`).set('Origin', origin).send({ action: 'APPROVE', version: row.version, confirmedReceived: true })
  const original = await db.stage.findUniqueOrThrow({ where: { slug: 'stage-4' } })
  try {
    await t.test('authentication, origin, operator availability and server-owned prices', async () => {
      await request(app).post('/api/purchases/prepare').set('Origin', origin).send({ planId: 'stage-1' }).expect(401)
      await single.agent.post('/api/purchases/prepare').set('Origin', 'https://other.invalid').send({ planId: 'stage-1' }).expect(403)
      await single.agent.get('/api/admin/purchases').expect(403)
      await request(app).get('/api/admin/purchases').expect(401)
      await prepare(single.agent, 'unknown').expect(400)
      await single.agent.post('/api/purchases/prepare').set('Origin', origin).send({ planId: 'stage-1', price: 1, userId: other.id }).expect(400)
      await db.stage.update({ where: { id: original.id }, data: { isPurchasable: false } })
      await prepare(single.agent, 'stage-4').expect(409)
      await prepare(bundle.agent, 'all-access').expect(409)
      await db.stage.update({ where: { id: original.id }, data: { isPurchasable: original.isPurchasable } })
      const stage = await db.stage.findUniqueOrThrow({ where: { slug: 'stage-1' } })
      const row = (await prepare(single.agent, 'stage-1').expect(200)).body.data
      assert.equal(row.price, stage.price)
      assert.equal(row.paymentRemark, `${single.phone}｜${row.planName}`)
      assert.match(row.planName, /阶段 1/)
      const reused = await Promise.all([prepare(single.agent, 'stage-1'), prepare(single.agent, 'stage-1')])
      assert.ok(reused.every((result) => result.status === 200 && result.body.data.id === row.id))
      await db.stage.update({ where: { id: stage.id }, data: { price: stage.price + 10 } })
      try { assert.equal((await prepare(single.agent, 'stage-1')).body.data.price, stage.price) }
      finally { await db.stage.update({ where: { id: stage.id }, data: { price: stage.price } }) }
      assert.equal((await single.agent.get('/api/purchases')).body.data.purchases.length, 0)
      const draft = (await prepare(other.agent, 'stage-1').expect(200)).body.data
      const grantor = await db.user.findUniqueOrThrow({ where: { phone: process.env.ADMIN_PHONE! } })
      await db.entitlement.create({ data: { userId: other.id, stageId: stage.id, grantedByUserId: grantor.id, source: 'GIFT' } })
      await prepare(other.agent, 'stage-1').expect(409)
      assert.equal((await db.purchase.findUniqueOrThrow({ where: { id: draft.id } })).status, 'DRAFT')
    })
    let singleRow: any
    await t.test('proof validation, ownership, pending immutability and no self activation', async () => {
      singleRow = (await prepare(single.agent, 'stage-1')).body.data
      await submit(single.agent, singleRow).expect(400)
      await other.agent.get(`/api/purchases/${singleRow.id}`).expect(404)
      await upload(other.agent, singleRow.id).expect(404)
      await upload(single.agent, singleRow.id, Buffer.from('invalid')).expect(400)
      await upload(single.agent, singleRow.id, proof, 'image/gif').expect(415)
      await upload(single.agent, singleRow.id, Buffer.alloc(5 * 1024 * 1024 + 1)).expect(413)
      singleRow = (await upload(single.agent, singleRow.id).expect(200)).body.data
      assert.ok(singleRow.proofUrl)
      assert.equal(singleRow.proof, undefined)
      const image = await single.agent.get(singleRow.proofUrl).expect(200)
      assert.match(image.headers['cache-control'], /no-store/)
      assert.match(image.headers['content-type'], /image\/webp/)
      await other.agent.get(singleRow.proofUrl).expect(404)
      await request(app).get(singleRow.proofUrl).expect(401)
      await admin.get(singleRow.proofUrl).expect(200)
      await single.agent.get(singleRow.proofUrl.split('?')[0]).expect(404)
      await submit(single.agent, { ...singleRow, version: singleRow.version - 1 }).expect(409)
      singleRow = (await submit(single.agent, singleRow, { note: '已备注方案', transactionId: 'test-single-transaction' }).expect(200)).body.data
      assert.equal(singleRow.status, 'PENDING')
      assert.equal((await single.agent.get('/api/me')).body.data.entitlements.length, 0)
      await single.agent.post(`/api/admin/purchases/${singleRow.id}/review`).set('Origin', origin).send({ action: 'APPROVE', version: singleRow.version, confirmedReceived: true }).expect(403)
      await upload(single.agent, singleRow.id).expect(409)
      assert.equal((await submit(single.agent, singleRow).expect(200)).body.data.version, singleRow.version)
      assert.equal(await db.purchase.count({ where: { userId: single.id, planId: 'stage-1' } }), 1)
      const list = await admin.get('/api/admin/purchases').query({ query: single.phone, planId: 'stage-1' }).expect(200)
      assert.equal(list.body.data.purchases.length, 1)
      assert.equal(list.body.data.purchases[0].user.phone, single.phone)
      assert.doesNotMatch(JSON.stringify(list.body), /passwordHash|tokenHash|"data":\[/)
    })
    await t.test('request information, resubmit and stale reviewer protection', async () => {
      const reviewPath = `/api/admin/purchases/${singleRow.id}/review`
      await admin.post(reviewPath).set('Origin', origin).send({ action: 'NEEDS_INFO', version: singleRow.version }).expect(400)
      await admin.post(reviewPath).set('Origin', origin).send({ action: 'APPROVE', version: singleRow.version }).expect(400)
      await admin.post(reviewPath).set('Origin', origin).send({ action: 'NEEDS_INFO', version: singleRow.version, note: '请补充清晰的交易单号' }).expect(200)
      singleRow = (await single.agent.get(`/api/purchases/${singleRow.id}`)).body.data
      assert.equal(singleRow.status, 'NEEDS_INFO')
      assert.match(singleRow.reviewNote, /交易单号/)
      const oldVersion = singleRow.version
      singleRow = (await upload(single.agent, singleRow.id)).body.data
      singleRow = (await submit(single.agent, singleRow, { transactionId: 'corrected-single-transaction' })).body.data
      await approve({ id: singleRow.id, version: oldVersion }).expect(409)
      await approve(singleRow).expect(200)
      assert.deepEqual((await single.agent.get('/api/me')).body.data.entitlements, ['stage-1'])
      const current = await db.entitlement.findFirstOrThrow({ where: { userId: single.id } })
      await Promise.all([approve(singleRow).expect(200), approve(singleRow).expect(200)])
      assert.equal((await db.entitlement.findUniqueOrThrow({ where: { id: current.id } })).grantedAt.toISOString(), current.grantedAt.toISOString())
      assert.equal(await db.adminAuditLog.count({ where: { targetUserId: single.id, action: 'APPROVE_PURCHASE' } }), 1)
      await prepare(single.agent, 'stage-1').expect(409)
    })
    await t.test('bundle grants four stages and preserves active access dates', async () => {
      const stage1 = await db.stage.findUniqueOrThrow({ where: { slug: 'stage-1' } })
      const grantor = await db.user.findUniqueOrThrow({ where: { phone: process.env.ADMIN_PHONE! } })
      const oldDate = new Date('2026-01-01T00:00:00Z')
      await db.entitlement.create({ data: { userId: bundle.id, stageId: stage1.id, grantedByUserId: grantor.id, source: 'GIFT', grantedAt: oldDate } })
      let row = (await prepare(bundle.agent, 'all-access').expect(200)).body.data
      assert.equal(row.price, env.ALL_ACCESS_PRICE)
      row = (await upload(bundle.agent, row.id)).body.data
      row = (await submit(bundle.agent, row, { paymentMethod: 'WECHAT' })).body.data
      await approve(row).expect(200)
      const me = (await bundle.agent.get('/api/me')).body.data
      assert.equal(me.entitlements.length, 4)
      assert.deepEqual(me.productEntitlements, [])
      const originalGrant = await db.entitlement.findUniqueOrThrow({ where: { userId_stageId: { userId: bundle.id, stageId: stage1.id } } })
      assert.equal(originalGrant.grantedAt.toISOString(), oldDate.toISOString())
      assert.equal(originalGrant.source, 'GIFT')
    })
    await t.test('project plan atomically grants all courses and workshop, including rollback on audit failure', async () => {
      let row = (await prepare(project.agent, 'all-access-projects').expect(200)).body.data
      assert.equal(row.price, env.ALL_ACCESS_PROJECTS_PRICE)
      row = (await upload(project.agent, row.id)).body.data
      row = (await submit(project.agent, row)).body.data
      // Fail after grant writes to exercise the route's entire transaction boundary.
      await db.$executeRawUnsafe(`CREATE FUNCTION purchase_test_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'APPROVE_PURCHASE' THEN RAISE EXCEPTION 'test audit failure'; END IF; RETURN NEW; END $$`)
      try {
        await db.$executeRawUnsafe(`CREATE TRIGGER purchase_test_fail_audit BEFORE INSERT ON "AdminAuditLog" FOR EACH ROW EXECUTE FUNCTION purchase_test_fail_audit()`)
        try {
          await approve(row).expect(500)
          assert.equal((await db.purchase.findUniqueOrThrow({ where: { id: row.id } })).status, 'PENDING')
          assert.equal(await db.entitlement.count({ where: { userId: project.id } }), 0)
          assert.equal(await db.productEntitlement.count({ where: { userId: project.id } }), 0)
        } finally { await db.$executeRawUnsafe('DROP TRIGGER purchase_test_fail_audit ON "AdminAuditLog"') }
      } finally { await db.$executeRawUnsafe('DROP FUNCTION purchase_test_fail_audit()') }
      await approve(row).expect(200)
      const me = (await project.agent.get('/api/me')).body.data
      assert.equal(me.entitlements.length, 4)
      assert.deepEqual(me.productEntitlements, ['project-lab'])
      const history = await project.agent.get('/api/purchases').expect(200)
      assert.equal(history.body.data.purchases[0].status, 'APPROVED')
      assert.equal((await other.agent.get('/api/purchases')).body.data.purchases.length, 0)
      const audit = await db.adminAuditLog.findFirstOrThrow({ where: { targetUserId: project.id, action: 'APPROVE_PURCHASE' } })
      assert.match(JSON.stringify(audit.metadata), /all-access-projects|project-lab/)
    })
    await t.test('per-account mutation limit rejects excessive submissions', async () => {
      let status = 0
      for (let index = 0; index < 31; index++) {
        const response = await prepare(other.agent, 'stage-3')
        status = response.status
        if (status === 429) { assert.equal(response.body.error.code, 'RATE_LIMITED'); break }
        assert.equal(status, 200)
      }
      assert.equal(status, 429)
    })
  } finally {
    await db.stage.update({ where: { id: original.id }, data: { price: original.price, isPublished: original.isPublished, isPurchasable: original.isPurchasable } })
    await db.$disconnect()
  }
})
