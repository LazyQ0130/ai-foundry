import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { stages as canonical } from '../server/data/courses.js'
import { stages as publicStages } from '../src/data/courses.js'
import { catalogueStage } from '../server/services/course-outline.js'
import { CourseOutline } from '../src/components/CourseOutline.js'

test('public curriculum omits learning starts, paid lesson text and checkpoints', () => {
  for (const original of canonical) {
    const stage = publicStages.find(s => s.slug === original.slug)!
    const text = JSON.stringify({ enterState: stage.enterState, exitState: stage.exitState, lessons: stage.lessons, checkpoints: stage.checkpoints })
    assert.equal(stage.outlineAccess, false)
    assert.equal(stage.lessons.length, original.lessons.length)
    assert.deepEqual(stage.checkpoints, [])
    for (const marker of [original.enterState, original.exitState, ...original.lessons.filter(l => !l.isPreview).flatMap(l => [l.title, l.desc])]) assert.ok(!text.includes(marker), marker)
  }
  assert.equal(publicStages[0].lessons[1].title, canonical[0].lessons[1].title)
})

test('outline control renders no details or private text until both client and server allow access', () => {
  const stage = catalogueStage(canonical[1], true)
  const render = (allowed: boolean, loading = false, data = stage) => renderToStaticMarkup(createElement(StaticRouter, { location: '/course-introduction' }, createElement(CourseOutline, { stage: data, allowed, loading })))
  for (const html of [render(false), render(true, true), render(true, false, publicStages[1])]) {
    assert.doesNotMatch(html, /<details|<summary/)
    assert.match(html, /disabled=""/)
    assert.ok(!html.includes(stage.enterState))
    assert.ok(!html.includes(stage.lessons[0].title))
  }
  const owned = render(true)
  assert.match(owned, /<details/)
  assert.ok(owned.includes(stage.enterState))
  assert.ok(owned.includes(stage.lessons[0].title))
})

test('catalogue outline requires the corresponding active stage right, including revoke, disable and preview changes', async () => {
  const student = request.agent(app)
  const phone = `134${Date.now().toString().slice(-8)}`
  const id = (await student.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ phone, password: 'outline-test-123', acceptedTerms: true }).expect(201)).body.data.user.id
  const stage = await db.stage.findUniqueOrThrow({ where: { slug: 'stage-2' } })
  const admin = await db.user.findFirstOrThrow({ where: { role: 'ADMIN' } })
  const read = async (agent: typeof student | ReturnType<typeof request>) => {
    const res = await agent.get('/api/stages').expect(200)
    assert.match(res.headers['cache-control'], /private.*no-store/)
    assert.match(res.headers.vary, /Cookie/)
    return res.body.data.stages as typeof publicStages
  }
  const denied = (stages: typeof publicStages) => {
    for (const row of stages) {
      assert.equal(row.outlineAccess, false)
      const original = canonical.find(s => s.slug === row.slug)!
      assert.notEqual(row.enterState, original.enterState)
      for (const lesson of row.lessons.filter(l => !l.isPreview)) assert.notEqual(lesson.title, original.lessons.find(l => l.id === lesson.id)!.title)
    }
  }
  try {
    denied(await read(request(app)))
    denied(await read(student))
    await db.entitlement.create({ data: { userId: id, stageId: stage.id, source: 'TEST', grantedByUserId: admin.id } })
    const owned = await read(student)
    const two = owned.find(s => s.slug === stage.slug)!
    assert.equal(two.outlineAccess, true)
    assert.equal(two.enterState, canonical[1].enterState)
    assert.equal(two.lessons[0].title, canonical[1].lessons[0].title)
    assert.equal(owned.find(s => s.slug === 'stage-3')!.outlineAccess, false)
    // An authenticated response must never turn the next anonymous response private.
    denied(await read(request(app)))
    await db.entitlement.update({ where: { userId_stageId: { userId: id, stageId: stage.id } }, data: { status: 'REVOKED' } })
    denied(await read(student))
    await db.entitlement.update({ where: { userId_stageId: { userId: id, stageId: stage.id } }, data: { status: 'ACTIVE' } })
    await db.user.update({ where: { id }, data: { status: 'DISABLED' } })
    denied(await read(student))
    const preview = await db.lesson.findUniqueOrThrow({ where: { id: 's1-l1' } })
    try {
      await db.lesson.update({ where: { id: preview.id }, data: { isPreview: false } })
      const hidden = (await read(request(app)))[0].lessons.find(l => l.id === preview.id)!
      assert.notEqual(hidden.title, canonical[0].lessons.find(l => l.id === preview.id)!.title)
    } finally { await db.lesson.update({ where: { id: preview.id }, data: { isPreview: preview.isPreview } }) }
  } finally { await db.$disconnect() }
})
