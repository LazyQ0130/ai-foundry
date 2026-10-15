import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { authDestination, authPath, isLessonDestination } from '../src/lib/authNavigation.js'
import { ExperienceNextStep, LessonSignInActions } from '../src/components/LessonContinuation.js'
import { LessonTaskCard } from '../src/components/LessonTaskPanel.js'
import { LessonLayout } from '../src/components/LessonLayout.js'

const render = (child: ReturnType<typeof h>, location = '/') => renderToStaticMarkup(h(StaticRouter, { location }, child))
const lesson = '/lesson/stage-1/s1-l0?source=trial#lesson-workbench'

test('authentication preserves course, query and reading position across both modes', () => {
  for (const mode of ['login', 'register'] as const) {
    const url = new URL(authPath(mode, lesson), 'http://localhost')
    assert.equal(url.pathname, `/${mode}`)
    assert.equal(url.searchParams.get('next'), lesson)
    assert.equal(authDestination(url.searchParams.get('next'), 'STUDENT'), lesson)
    const switched = new URL(authPath(mode === 'login' ? 'register' : 'login', url.searchParams.get('next')), url)
    assert.equal(switched.searchParams.get('next'), lesson)
  }
  assert.equal(authDestination('/capstone/lessons/c1#task', 'STUDENT'), '/capstone/lessons/c1#task')
  assert.equal(isLessonDestination(lesson), true)
  assert.equal(isLessonDestination('/pricing'), false)
})

test('return navigation rejects external destinations and preserves role restrictions', () => {
  for (const next of [null, '', 'https://example.com', '//example.com', '/\\example.com', '/lesson/\ninvalid', '/admin/users']) {
    assert.equal(authDestination(next, 'STUDENT'), '/dashboard')
  }
  assert.equal(authDestination(null, 'ADMIN'), '/admin/users')
  assert.equal(authDestination('/admin/users', 'ADMIN'), '/admin/users')
  assert.equal(authPath('login'), '/login')
})

test('guest checklist explains recording and offers login without a misleading disabled completion action', () => {
  const html = render(h(LessonTaskCard, {
    items: ['完成本地操作'], checked: [false], disabled: true, saving: false, done: false,
    onToggle: () => {}, onComplete: () => {},
    disabledAction: h(LessonSignInActions, { returnTo: lesson }),
  }))
  assert.match(html, /登录后即可勾选任务并记录完成状态/)
  assert.doesNotMatch(html, /标记为完成|请先完成并勾选全部学习任务/)
  for (const mode of ['login', 'register'] as const) assert.ok(html.includes(`href="${authPath(mode, lesson)}"`))
  for (const checked of [false, true]) {
    const signedIn = render(h(LessonTaskCard, {
      items: ['完成本地操作'], checked: [checked], disabled: false, saving: false, done: false,
      onToggle: () => {}, onComplete: () => {},
    }))
    const completion = signedIn.match(/<button[^>]*>.*?标记为完成<\/button>/s)?.[0] ?? ''
    assert.ok(completion)
    assert.equal(completion.includes('disabled=""'), !checked)
  }
})

test('free readers can continue without marking tasks complete; formal course boundary stays explicit', () => {
  const prep = render(h(ExperienceNextStep, { preparation: true }))
  assert.match(prep, /href="\/lesson\/stage-1\/s1-l1"/)
  assert.match(prep, /任务记录不会自动标记为完成/)
  const first = render(h(ExperienceNextStep, { preparation: false }))
  assert.match(first, /href="\/stage\/stage-1"/)
  assert.match(first, /后续正式课程需要开通 Stage 1/)
  assert.doesNotMatch(first, /href="\/lesson\/stage-1\/s1-l2"/)
})

test('course task return anchor targets one shared workbench on desktop and mobile', () => {
  const html = render(h(LessonLayout, {
    sidebar: () => h('nav', null, '目录'), workbench: h('div', null, '唯一任务内容'),
    children: h('article', null, '正文'), remainingTasks: 1,
  }))
  assert.equal((html.match(/id="lesson-workbench"/g) ?? []).length, 1)
  assert.equal((html.match(/唯一任务内容/g) ?? []).length, 1)
  assert.match(html, /href="#lesson-workbench"/)
})

