import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { stages } from '../src/data/courses.js'
import { stageLearningStatus } from '../src/data/learningProgress.js'

test('owned Stage 1 persists all seven checklists, counts only six formal lessons and completes', async () => {
  const student = request.agent(app)
  const user = (await student.post('/api/auth/register').set('Origin', env.APP_ORIGIN)
    .send({ phone: `134${Date.now().toString().slice(-8)}`, password: 'stage-final-test-2026', acceptedTerms: true }).expect(201)).body.data.user
  const stage = await db.stage.findUniqueOrThrow({ where: { slug: 'stage-1' } })
  const admin = await db.user.findFirstOrThrow({ where: { role: 'ADMIN' } })
  await db.entitlement.create({ data: { userId: user.id, stageId: stage.id, source: 'TEST', grantedByUserId: admin.id } })
  for (let i = 0; i <= 6; i++) {
    const id = `s1-l${i}`
    const lesson = (await student.get(`/api/lessons/${id}`).expect(200)).body.data
    assert.equal(lesson.lesson.isPreview, i < 2)
    await student.post(`/api/progress/lessons/${id}/visit`).set('Origin', env.APP_ORIGIN).expect(200)
    for (const key of lesson.content.meta.checkKeys) {
      await student.put(`/api/progress/lessons/${id}/checks/${key}`).set('Origin', env.APP_ORIGIN).send({ completed: true }).expect(200)
    }
    await student.post(`/api/progress/lessons/${id}/complete`).set('Origin', env.APP_ORIGIN).expect(200)
    const saved = (await student.get('/api/progress').expect(200)).body.data
    assert.deepEqual(saved.stageProgress['stage-1'], { completed: i, total: 6, percent: Math.round(i / 6 * 100) })
    assert.deepEqual(saved.formalProgress, { completed: i, total: 29 })
    assert.equal(Object.values(saved.checks[id]).filter(Boolean).length, lesson.content.meta.checkKeys.length)
    const hydrated = { ...stages[0], lessons: stages[0].lessons.map(l => ({ ...l, status: saved.completedLessons.includes(l.id) ? 'completed' as const : 'not_started' as const })) }
    if (i === 6) {
      assert.equal(stageLearningStatus(hydrated, true), 'completed')
      assert.equal(saved.lastLesson, null)
    }
  }
  await db.$disconnect()
})
