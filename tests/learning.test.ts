import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'

test('student → manual purchase → protected lessons → durable progress → revoke', async (t) => {
  const admin = request.agent(app), a = request.agent(app), b = request.agent(app)
  const phone = `136${Date.now().toString().slice(-8)}`
  const password = 'learning-test-123'
  const register = (agent: ReturnType<typeof request.agent>, phone: string) => agent.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ acceptedTerms: true, phone, password })
  const id = (await register(a, phone).expect(201)).body.data.user.id
  const other = (await register(b, `135${phone.slice(3)}`).expect(201)).body.data.user.id
  await admin.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }).expect(200)
  // Exercise the existing paid-content boundary with a temporary non-preview fixture.
  await db.lesson.update({ where: { id: 's1-l1' }, data: { isPreview: false } })
  const grant = (slug: string) => admin.post(`/api/admin/users/${id}/entitlements`).set('Origin', env.APP_ORIGIN).send({ stageSlug: slug, source: 'MANUAL_PURCHASE', note: '测试付款' })
  let keys: string[] = []
  await t.test('paid content and writes denied for guests and unentitled students, including stage 1', async () => {
    await request(app).get('/api/lessons/s1-l1').expect(401)
    const denied=await a.get('/api/lessons/s1-l1').expect(403)
    assert.equal(denied.body.data,undefined)
    await a.post('/api/progress/lessons/s1-l1/visit').set('Origin',env.APP_ORIGIN).expect(403)
    await a.post('/api/progress/lessons/s1-l1/complete').set('Origin',env.APP_ORIGIN).expect(403)
    await grant('stage-1').expect(200)
    await a.get('/api/lessons/s1-l1').expect(200)
    // 未发布的占位课程始终不可访问，即使已开通所在阶段。
    await a.get('/api/lessons/s2-l1').expect(404)
    const nextLesson = await a.get('/api/lessons/s1-l2').expect(200)
    assert.equal(nextLesson.body.data.lesson.isPreview, false)
    assert.equal(nextLesson.body.data.content.meta.checkKeys.length, 5)
    const debugLesson = await a.get('/api/lessons/s1-l3').expect(200)
    assert.equal(debugLesson.body.data.lesson.isPreview, false)
    const debugKeys = debugLesson.body.data.content.meta.checkKeys
    assert.equal(debugKeys.length, 5)
    await a.put(`/api/progress/lessons/s1-l3/checks/${debugKeys[0]}`).set('Origin', env.APP_ORIGIN).send({ completed: true }).expect(200)
    assert.equal(await db.lessonCheck.count({ where: { userId: id, lessonId: 's1-l3', checkKey: debugKeys[0], completed: true } }), 1)
    await a.put(`/api/progress/lessons/s1-l3/checks/${debugKeys[0]}`).set('Origin', env.APP_ORIGIN).send({ completed: false }).expect(200)
    const changesLesson = await a.get('/api/lessons/s1-l4').expect(200)
    assert.equal(changesLesson.body.data.lesson.isPreview, false)
    const changesKeys = changesLesson.body.data.content.meta.checkKeys
    assert.equal(changesKeys.length, 5)
    await a.put(`/api/progress/lessons/s1-l4/checks/${changesKeys[0]}`).set('Origin', env.APP_ORIGIN).send({ completed: true }).expect(200)
    const saved = (await a.get('/api/progress').expect(200)).body.data
    assert.equal(saved.checks['s1-l4'][changesKeys[0]], true)
    await a.put(`/api/progress/lessons/s1-l4/checks/${changesKeys[0]}`).set('Origin', env.APP_ORIGIN).send({ completed: false }).expect(200)
    const versionsLesson = await a.get('/api/lessons/s1-l5').expect(200)
    assert.equal(versionsLesson.body.data.lesson.isPreview, false)
    const versionKeys = versionsLesson.body.data.content.meta.checkKeys
    assert.equal(versionKeys.length, 5)
    await a.put(`/api/progress/lessons/s1-l5/checks/${versionKeys[0]}`).set('Origin', env.APP_ORIGIN).send({ completed: true }).expect(200)
    assert.equal((await a.get('/api/progress').expect(200)).body.data.checks['s1-l5'][versionKeys[0]], true)
    await a.put(`/api/progress/lessons/s1-l5/checks/${versionKeys[0]}`).set('Origin', env.APP_ORIGIN).send({ completed: false }).expect(200)
  })
  await t.test('published lesson content exposes stable check keys, no-store cache', async () => {
    const lesson=await a.get('/api/lessons/s1-l1').expect(200)
    assert.match(lesson.body.data.content.body,/## 第一次修改/)
    assert.equal(lesson.body.data.content.task, undefined)
    keys=lesson.body.data.content.meta.checkKeys
    assert.ok(keys.length > 0)
    assert.equal(lesson.headers['cache-control'],'no-store')
  })
  await t.test('first visit, checks, validation, completion and repeated completion are persistent and idempotent', async () => {
    const visit=await a.post('/api/progress/lessons/s1-l1/visit').set('Origin',env.APP_ORIGIN).expect(200)
    assert.ok(visit.body.data.inProgressLessons.includes('s1-l1'))
    assert.equal(visit.body.data.lastLesson.lessonId,'s1-l1')
    await a.put('/api/progress/lessons/s1-l1/checks/unknown').set('Origin',env.APP_ORIGIN).send({completed:true}).expect(400)
    for(const key of keys) await a.put(`/api/progress/lessons/s1-l1/checks/${key}`).set('Origin',env.APP_ORIGIN).send({completed:true}).expect(200)
    await a.post('/api/progress/lessons/s1-l1/complete').set('Origin',env.APP_ORIGIN).expect(200)
    const first=await db.lessonProgress.findUniqueOrThrow({where:{userId_lessonId:{userId:id,lessonId:'s1-l1'}}})
    await a.post('/api/progress/lessons/s1-l1/complete').set('Origin',env.APP_ORIGIN).expect(200)
    const second=await db.lessonProgress.findUniqueOrThrow({where:{userId_lessonId:{userId:id,lessonId:'s1-l1'}}})
    assert.equal(first.completedAt!.toISOString(),second.completedAt!.toISOString())
    const progress=(await a.get('/api/progress')).body.data
    assert.ok(progress.completedLessons.includes('s1-l1'))
    assert.ok(progress.stageProgress['stage-1'].percent>0)
    assert.equal(await db.lessonCheck.count({where:{userId:id,lessonId:'s1-l1'}}),keys.length)
  })
  await t.test('other student cannot read or write first student progress',async()=>{
    assert.deepEqual((await b.get(`/api/progress?userId=${id}`)).body.data.completedLessons,[])
    await b.put(`/api/progress/lessons/s1-l1/checks/${keys[0]}`).set('Origin',env.APP_ORIGIN).send({completed:true,userId:id}).expect(403)
    assert.equal(await db.lessonProgress.count({where:{userId:other}}),0)
  })
  await t.test('logout, fresh login, then revocation retain progress but immediately deny protected content',async()=>{
    await a.post('/api/auth/logout').set('Origin',env.APP_ORIGIN).expect(200)
    await a.get('/api/progress').expect(401)
    await a.post('/api/auth/login').set('Origin',env.APP_ORIGIN).send({phone,password}).expect(200)
    assert.ok((await a.get('/api/progress')).body.data.completedLessons.includes('s1-l1'))
    await admin.delete(`/api/admin/users/${id}/entitlements/stage-1`).set('Origin',env.APP_ORIGIN).send({note:'测试撤销'}).expect(200)
    await a.get('/api/lessons/s1-l1').expect(403)
    await a.post('/api/progress/lessons/s1-l1/complete').set('Origin',env.APP_ORIGIN).expect(403)
    assert.equal(await db.lessonProgress.count({where:{userId:id,status:'COMPLETED'}}),1)
    assert.ok(await db.adminAuditLog.findFirst({where:{targetUserId:id,action:'REVOKE_ENTITLEMENT'}}))
  })
  await t.test('preview is public, preview progress requires login, unpublished content stays protected',async()=>{
    const patch = (body: object) => admin.patch('/api/admin/courses/lessons/s1-l1').set('Origin',env.APP_ORIGIN).send(body)
    try {
      await patch({isPreview:true}).expect(200)
      const preview = await request(app).get('/api/lessons/s1-l1').expect(200)
      assert.match(preview.body.data.content.body, /## 第一次修改/)
      await request(app).post('/api/progress/lessons/s1-l1/visit').set('Origin',env.APP_ORIGIN).expect(401)
      await b.post('/api/progress/lessons/s1-l1/visit').set('Origin',env.APP_ORIGIN).expect(200)
      await patch({isPublished:false}).expect(200)
      await b.get('/api/lessons/s1-l1').expect(404)
      const catalogue = (await request(app).get('/api/stages')).body.data.stages
      assert.equal(catalogue.flatMap((s: {lessons:{id:string;isPublished:boolean}[]})=>s.lessons).find((l:{id:string})=>l.id==='s1-l1').isPublished,false)
    } finally { await patch({isPreview:false,isPublished:true}).expect(200) }
  })
  await t.test('CSRF, input validation, body limit and admin boundaries',async()=>{
    await a.post('/api/auth/logout').expect(403)
    await a.post('/api/auth/logout').set('Origin','https://evil.example').expect(403)
    for(const path of ['/api/admin/users','/api/admin/audit','/api/admin/courses']) await a.get(path).expect(403)
    await a.post(`/api/admin/users/${id}/entitlements/all`).set('Origin',env.APP_ORIGIN).send({source:'TEST'}).expect(403)
    await admin.get('/api/admin/users?pageSize=10000').expect(400)
    await a.post('/api/auth/login').set('Origin',env.APP_ORIGIN).send({phone,password:'x'.repeat(40000)}).expect(413)
    const missing=await a.get('/api/lessons/not-a-lesson').expect(404)
    assert.doesNotMatch(JSON.stringify(missing.body),/stack|Prisma|C:\\/)
  })
  await db.lesson.update({ where: { id: 's1-l1' }, data: { isPreview: true } })
  await db.$disconnect()
})
