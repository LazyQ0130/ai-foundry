import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { readLessonContent } from '../server/services/course-content.js'

test('published catalogue, operator prices, all-access pricing, and content allowlist', async () => {
  const admin = request.agent(app)
  await admin.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }).expect(200)
  const original = await db.stage.findUniqueOrThrow({ where: { slug: 'stage-4' } })
  const patch = (body: object) => admin.patch('/api/admin/courses/stages/stage-4').set('Origin', env.APP_ORIGIN).send(body)
  try {
    await patch({ price: 321, isPurchasable: false }).expect(200)
    let catalogue = (await request(app).get('/api/stages').expect(200)).body.data
    assert.equal(catalogue.stages.find((s: { slug: string }) => s.slug === 'stage-4').price, 321)
    assert.equal(catalogue.stages.find((s: { slug: string }) => s.slug === 'stage-4').isPurchasable, false)
    assert.equal(catalogue.purchase.allAccessPrice, 599)
    assert.equal(catalogue.purchase.allAccessProjectsPrice, 699)
    assert.doesNotMatch(JSON.stringify(catalogue), /"prompt":|"content":|passwordHash|tokenHash|请使用 Python 的 FastAPI 框架/)
    await patch({ isPublished: false }).expect(200)
    catalogue = (await request(app).get('/api/stages').expect(200)).body.data
    assert.equal(catalogue.stages.length, 3)
    await admin.get('/api/lessons/s4-l1').expect(404)
    await patch({ price: -1 }).expect(400)
    await assert.rejects(readLessonContent('../server', 'app'), /课程不存在/)
  } finally { await patch({ price: original.price, isPurchasable: original.isPurchasable, isPublished: original.isPublished }).expect(200); await db.$disconnect() }
})
