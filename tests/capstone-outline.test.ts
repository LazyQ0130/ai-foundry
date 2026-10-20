import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { CapstoneOutline } from '../src/components/CapstoneOutline.js'
import { capstoneOutline } from '../server/services/capstone-outline.js'
import { capstoneShowcase as privateShowcase } from '../server/data/capstoneShowcase.js'
import { capstoneLessons as publicLessons } from '../src/data/capstoneLessons.js'
import { capstoneShowcase as publicShowcase } from '../src/data/capstoneShowcase.js'

test('public Project Lab metadata exposes names without descriptions or internal checklist keys', () => {
  const publicText = JSON.stringify({ publicLessons, publicShowcase })
  for (const lesson of privateShowcase.lessons.slice(1)) {
    assert.ok(publicText.includes(lesson.title), lesson.code)
    assert.ok(!publicText.includes(lesson.desc), lesson.code)
  }
  assert.ok(publicLessons.every(lesson => lesson.checkKeys.length === 0 && lesson.contentPath === ''))
  assert.equal(publicLessons.length, 9)
})

test('Project Lab outline requires both current account permission and server access', () => {
  const data = { access: true, lessons: capstoneOutline(), progress: null }
  const render = (allowed: boolean, loading = false, summary = data) => renderToStaticMarkup(createElement(StaticRouter, { location: '/course-introduction' }, createElement(CapstoneOutline, { allowed, loading, data: summary })))
  for (const html of [render(false), render(true, true), render(true, false, { ...data, access: false })]) {
    assert.match(html, /项目工坊逐课内容/)
    assert.doesNotMatch(html, /href="\/capstone\/lessons\//)
    for (const lesson of data.lessons) {
      assert.ok(html.includes(lesson.title), lesson.id)
      assert.ok(!html.includes(lesson.desc), lesson.id)
    }
  }
  const owned = render(true)
  for (const lesson of data.lessons) {
    assert.ok(owned.includes(lesson.title))
    assert.ok(owned.includes(lesson.desc))
    assert.ok(owned.includes(`/capstone/lessons/${lesson.id}`))
  }
})
