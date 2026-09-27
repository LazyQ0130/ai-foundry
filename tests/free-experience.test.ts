import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { requireAssetAccess } from '../server/services/asset-access.js'

test('a new zero-entitlement user completes preparation and 1.1; formal progress stays 0/29 then 1/29', async () => {
  const student = request.agent(app)
  const phone = `137${Date.now().toString().slice(-8)}`
  const user = (await student.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({phone,password:'free-preview-2026',acceptedTerms:true}).expect(201)).body.data.user
  assert.deepEqual(user.entitlements, [])
  await request(app).get('/api/course-assets/stage1-starter').expect(401)
  await student.get('/api/course-assets/stage1-starter').expect(200)
  for (const [i, id] of ['s1-l0','s1-l1'].entries()) {
    const guest = await request(app).get(`/api/lessons/${id}`).expect(200)
    assert.equal(guest.body.data.lesson.isPreview,true)
    await request(app).post(`/api/progress/lessons/${id}/complete`).set('Origin',env.APP_ORIGIN).expect(401)
    const lesson = await student.get(`/api/lessons/${id}`).expect(200)
    for (const key of lesson.body.data.content.meta.checkKeys) await student.put(`/api/progress/lessons/${id}/checks/${key}`).set('Origin',env.APP_ORIGIN).send({completed:true}).expect(200)
    const progress = (await student.post(`/api/progress/lessons/${id}/complete`).set('Origin',env.APP_ORIGIN).expect(200)).body.data
    assert.ok(progress.completedLessons.includes(id))
    assert.deepEqual(progress.formalProgress,{completed:i,total:29})
    assert.deepEqual(progress.stageProgress['stage-1'],{completed:i,total:6,percent:i ? 17 : 0})
    const stored = (await student.get('/api/progress').expect(200)).body.data
    assert.ok(stored.completedLessons.includes(id))
    assert.ok(Object.values(stored.checks[id]).every(Boolean))
  }
  // 1.2 now has real paid content; completing the free lessons does not unlock it.
  await student.get('/api/lessons/s1-l2').expect(403)
  await request(app).get('/api/lessons/s1-l2').expect(401)
  await student.get('/api/lessons/s1-l3').expect(403)
  await request(app).get('/api/lessons/s1-l3').expect(401)
  await student.get('/api/lessons/s1-l4').expect(403)
  await request(app).get('/api/lessons/s1-l4').expect(401)
  await student.get('/api/lessons/s1-l5').expect(403)
  await request(app).get('/api/lessons/s1-l5').expect(401)
  await student.get('/api/lessons/s1-l6').expect(404)
  const catalogue = (await request(app).get('/api/stages').expect(200)).body.data.stages
  assert.equal(catalogue[0].lessons.find((l: {id:string})=>l.id==='s1-l2').isPublished,true)
  assert.equal(catalogue[0].lessons.length,7) // public metadata includes prep + six formal lessons
  const row = await db.user.findUniqueOrThrow({where:{id:user.id}})
  await requireAssetAccess(row,{access:'authenticated-preview'})
  await assert.rejects(requireAssetAccess(row,{access:'stage-entitlement',stage:'stage-1'}))
  await assert.rejects(requireAssetAccess(row,{access:'admin-only'}))
  await db.user.update({where:{id:user.id},data:{status:'DISABLED'}})
  await student.get('/api/course-assets/stage1-starter').expect(401)
  await student.post('/api/progress/lessons/s1-l1/complete').set('Origin',env.APP_ORIGIN).expect(401)
  await db.$disconnect()
})
