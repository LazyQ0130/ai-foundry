import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { optionalAuth } from '../server/middleware/auth.js'
import { errorHandler } from '../server/middleware/error.js'
import { hashPassword } from '../server/services/auth.js'
import { emailVerification } from '../server/services/email-verification.js'
import { createEmailRoutes } from '../server/routes/email.js'

test('email binding, double verification, reset, quotas and consent with real PostgreSQL', async t => {
  const suffix = Date.now().toString()
  const password = 'email-test-password'
  const user = await db.user.create({ data: { phone: `137${suffix.slice(-8)}`, nickname: '邮件测试', passwordHash: await hashPassword(password) } })
  const other = await db.user.create({ data: { phone: `136${suffix.slice(-8)}`, nickname: '其他用户', passwordHash: user.passwordHash } })
  const firstEmail = `first-${suffix}@example.com`, nextEmail = `next-${suffix}@example.com`
  const sent: { to: string; code: string }[] = []
  const service = emailVerification(async (to, _subject, text) => { sent.push({ to, code: text.match(/\d{6}/)![0] }) })
  // This test-only app injects an in-memory mail sink; no email leaves the test process.
  const testApp = express()
  testApp.use(express.json(), cookieParser(), optionalAuth)
  testApp.use('/api/auth', createEmailRoutes(service))
  testApp.use(app, errorHandler)
  const a = request.agent(testApp), b = request.agent(testApp), secondSession = request.agent(testApp)
  const post = (agent: typeof a, path: string, body: object) => agent.post(`/api/auth/${path}`).set('Origin', env.APP_ORIGIN).send(body)
  const current = () => db.user.findUniqueOrThrow({ where: { id: user.id } })
  const ageRequests = () => db.emailChallenge.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 120000) } })
  await post(a, 'login', { phone: user.phone, password }).expect(200)
  await post(b, 'login', { phone: other.phone, password }).expect(200)
  await post(secondSession, 'login', { phone: user.phone, password }).expect(200)
  let bindId = ''
  await t.test('binding needs password, verification and account ownership', async () => {
    await post(a, 'email/code', { email: firstEmail, currentPassword: 'wrong-password' }).expect(400)
    const result = await post(a, 'email/code', { email: firstEmail.toUpperCase(), currentPassword: password }).expect(200)
    bindId = result.body.data.challengeId
    assert.equal((await current()).email, null)
    const record = await db.emailChallenge.findUniqueOrThrow({ where: { id: bindId } })
    assert.notEqual(record.codeHash, sent[0].code)
    assert.equal(record.codeHash.length, 64)
    await post(b, 'email/confirm', { challengeId: bindId, code: sent[0].code }).expect(400)
    await post(a, 'email/confirm', { challengeId: bindId, code: sent[0].code }).expect(200)
    assert.equal((await current()).email, firstEmail)
    assert.ok((await current()).emailVerifiedAt)
    await post(a, 'email/confirm', { challengeId: bindId, code: sent[0].code }).expect(400)
    await post(b, 'email/code', { email: firstEmail, currentPassword: password }).expect(409)
  })
  await t.test('changing address requires both old and new mailboxes', async () => {
    await post(a, 'email/code', { email: nextEmail, currentPassword: password }).expect(429)
    await ageRequests()
    const result = await post(a, 'email/code', { email: nextEmail, currentPassword: password }).expect(200)
    assert.equal(result.body.data.requiresOldEmail, true)
    const newCode = sent.at(-2)!.code, oldCode = sent.at(-1)!.code
    assert.equal(sent.at(-2)!.to, nextEmail); assert.equal(sent.at(-1)!.to, firstEmail)
    await post(a, 'email/confirm', { challengeId: result.body.data.challengeId, code: newCode }).expect(400)
    assert.equal((await current()).email, firstEmail)
    await post(a, 'email/confirm', { challengeId: result.body.data.challengeId, code: newCode, oldCode }).expect(200)
    assert.equal((await current()).email, nextEmail)
  })
  await t.test('reset responses do not expose account existence; five failures persist', async () => {
    await ageRequests()
    const result = await post(a, 'password-reset/code', { email: nextEmail }).expect(200)
    const missing = await post(a, 'password-reset/code', { email: `missing-${suffix}@example.com` }).expect(200)
    assert.equal(result.body.data.message, missing.body.data.message)
    assert.deepEqual(Object.keys(result.body.data), Object.keys(missing.body.data))
    const id = result.body.data.challengeId, goodCode = sent.at(-1)!.code
    const wrongCode = goodCode === '000000' ? '111111' : '000000'
    for (let i = 0; i < 5; i++) await post(a, 'password-reset/confirm', { challengeId: id, code: wrongCode, newPassword: 'new-password-123' }).expect(400)
    assert.equal((await db.emailChallenge.findUniqueOrThrow({ where: { id } })).attempts, 5)
    await post(a, 'password-reset/confirm', { challengeId: id, code: goodCode, newPassword: 'new-password-123' }).expect(400)
  })
  await t.test('expired codes fail; replacing a code invalidates the previous one', async () => {
    await ageRequests()
    const old = await service.issue('RESET', nextEmail, await current())
    const code = sent.at(-1)!.code
    await db.emailChallenge.update({ where: { id: old.challengeId }, data: { expiresAt: new Date(Date.now() - 1000) } })
    await assert.rejects(service.confirm('RESET', old.challengeId, code, { passwordHash: user.passwordHash }))
    await ageRequests()
    const replacement = await service.issue('RESET', nextEmail, await current())
    await assert.rejects(service.confirm('RESET', old.challengeId, code, { passwordHash: user.passwordHash }))
    assert.ok(replacement.challengeId)
  })
  await t.test('concurrent reset consumes a code once and revokes every session', async () => {
    // Move prior requests outside the hourly window while preserving the daily quota.
    await db.emailChallenge.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 3700000) } })
    const result = await post(a, 'password-reset/code', { email: nextEmail }).expect(200)
    const body = { challengeId: result.body.data.challengeId, code: sent.at(-1)!.code, newPassword: 'new-password-123' }
    const results = await Promise.all([post(a, 'password-reset/confirm', body), post(secondSession, 'password-reset/confirm', body)])
    assert.deepEqual(results.map(r => r.status).sort(), [200, 400])
    assert.equal(await db.session.count({ where: { userId: user.id } }), 0)
    await a.get('/api/me').expect(401); await secondSession.get('/api/me').expect(401)
    await post(a, 'login', { phone: user.phone, password }).expect(401)
    await post(a, 'login', { phone: user.phone, password: body.newPassword }).expect(200)
  })
  await t.test('password changes and disabled accounts invalidate issued challenges', async () => {
    await db.emailChallenge.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 3700000) } })
    const issued = await service.issue('RESET', nextEmail, await current())
    assert.equal((await db.emailChallenge.findUniqueOrThrow({ where: { id: issued.challengeId } })).delivered, true)
    const code = sent.at(-1)!.code
    await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword('rotated-password-123') } })
    await assert.rejects(service.confirm('RESET', issued.challengeId, code, { passwordHash: user.passwordHash }))
    await db.emailChallenge.updateMany({ where: { userId: user.id }, data: { createdAt: new Date(Date.now() - 3700000) } })
    const disabled = await service.issue('RESET', nextEmail, await current())
    assert.equal((await db.emailChallenge.findUniqueOrThrow({ where: { id: disabled.challengeId } })).delivered, true)
    const disabledCode = sent.at(-1)!.code
    await db.user.update({ where: { id: user.id }, data: { status: 'DISABLED' } })
    await assert.rejects(service.confirm('RESET', disabled.challengeId, disabledCode, { passwordHash: user.passwordHash }))
  })
  await t.test('SMTP failure cannot leave a usable challenge', async () => {
    const failing = emailVerification(async () => { throw new Error('Simulated delivery failure') })
    await assert.rejects(failing.issue('BIND', `failure-${suffix}@example.com`, other))
    const row = await db.emailChallenge.findFirstOrThrow({ where: { userId: other.id } })
    assert.equal(row.delivered, false); assert.ok(row.consumedAt)
  })
  await t.test('database quotas survive requests and disabled accounts never receive mail', async () => {
    const disabledUser = await current()
    const before = sent.length
    await service.issue('RESET', nextEmail, disabledUser)
    assert.equal(sent.length, before)
    const destination = `quota-${suffix}@example.com`
    for (let i = 0; i < 5; i++) {
      await db.emailChallenge.updateMany({ where: { userId: other.id }, data: { createdAt: new Date(Date.now() - 3700000) } })
      await service.issue('BIND', destination, other)
    }
    // Put five requests in the current hour to exercise the hourly cap.
    const rows = await db.emailChallenge.findMany({ where: { userId: other.id, email: destination } })
    await db.emailChallenge.updateMany({ where: { id: { in: rows.map(row => row.id) } }, data: { createdAt: new Date(Date.now() - 120000) } })
    await assert.rejects(service.issue('BIND', destination, other), { code: 'RATE_LIMITED' })
    await db.emailChallenge.updateMany({ where: { userId: other.id }, data: { createdAt: new Date(Date.now() - 3700000) } })
    // Five successes plus the earlier delivery failure count toward the daily quota.
    for (let i = 0; i < 4; i++) {
      await service.issue('BIND', destination, other)
      await db.emailChallenge.updateMany({ where: { userId: other.id }, data: { createdAt: new Date(Date.now() - 3700000) } })
    }
    await assert.rejects(service.issue('BIND', destination, other), { code: 'RATE_LIMITED' })
  })
  await t.test('registration requires explicit consent and records its version', async () => {
    const phone = `135${suffix.slice(-8)}`
    await request(app).post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ phone, password }).expect(400)
    await request(app).post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ phone, password, acceptedTerms: false }).expect(400)
    const created = await request(app).post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ phone, password, acceptedTerms: true }).expect(201)
    const row = await db.user.findUniqueOrThrow({ where: { id: created.body.data.user.id } })
    assert.ok(row.acceptedTermsAt); assert.equal(row.termsVersion, '2026-10-04.1')
    await request(app).post('/api/auth/password-reset/code').send({ email: nextEmail }).expect(403)
  })
  await db.$disconnect()
})
