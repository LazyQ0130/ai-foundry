import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { CapstoneSidebar, CapstoneLessonHeader, CapstoneLessonNavigation } from '../src/components/CapstoneLearning.js'
import { CapstoneEntryCard } from '../src/components/CapstoneShowcase.js'
import { CapstoneOverviewStart } from '../src/components/CapstoneOverviewStart.js'
import { LessonLayout } from '../src/components/LessonLayout.js'
import { capstoneLessons } from '../src/data/capstoneLessons.js'
import type { CapstoneProgress, CapstoneSummary } from '../src/data/capstoneProgress.js'
import { curriculumFormalLessonCount } from '../src/data/courses.js'
import { parseLessonContent } from '../server/services/lesson-parser.js'

const render = (node: ReturnType<typeof h>) => renderToStaticMarkup(h(StaticRouter, { location: '/' }, node))
const progress: CapstoneProgress = { completed: 3, total: 9, completedLessons: ['c1', 'c2', 'c3'], inProgressLessons: ['c4'], checks: {}, continueLessonId: 'c4' }
const summary: CapstoneSummary = { access: true, lessons: capstoneLessons, progress }

test('Capstone sidebar lists all nine unlocked routes, highlights current lesson and displays server progress', () => {
  const html = render(h(CapstoneSidebar, { currentLessonId: 'c4', progress }))
  for (const lesson of capstoneLessons) {
    assert.match(html, new RegExp(`href="/capstone/lessons/${lesson.id}"`))
    assert.ok(html.includes(lesson.title))
  }
  assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1)
  const activeLink = html.match(/<a\b[^>]*aria-current="page"[^>]*>/)?.[0] ?? ''
  assert.match(activeLink, /href="\/capstone\/lessons\/c4"/)
  assert.match(activeLink, /border-brand-600 bg-brand-50/)
  assert.equal((html.match(/aria-label="已完成"/g) ?? []).length, 3)
  assert.match(html, /3 \/ 9/)
  assert.match(html, /GROUND/)
  assert.doesNotMatch(html, /aria-disabled|暂未开放/)
})

test('Capstone navigation boundaries and trusted header match C1, C4 and C9', async () => {
  for (const index of [0, 3, 8]) {
    const lesson = capstoneLessons[index], html = render(h(CapstoneLessonNavigation, { lessonId: lesson.id }))
    assert.equal(html.includes('上一课'), index > 0)
    assert.equal(html.includes('下一课'), index < 8)
    if (index > 0) assert.ok(html.includes('/capstone/lessons/c' + index))
    if (index < 8) assert.ok(html.includes('/capstone/lessons/c' + (index + 2)))
    const content = parseLessonContent(await readFile(lesson.contentPath, 'utf8'))
    const header = render(h(CapstoneLessonHeader, { lesson, objective: content.meta.objective }))
    assert.ok(header.includes(lesson.title))
    assert.ok(header.includes(lesson.estimatedTime))
    assert.ok(header.includes(content.meta.objective))
    assert.match(header, /本课目标：/)
  }
})

test('entry CTA follows independent progress; overview uses continueLessonId including out-of-order study', () => {
  for (const [completed, label] of [[0, '开始毕业项目'], [3, '继续毕业项目'], [9, '查看毕业项目']] as const) {
    const data = { ...summary, progress: { ...progress, completed } }
    const html = render(h(CapstoneEntryCard, { data }))
    assert.ok(html.includes(label)); assert.match(html, /href="\/capstone"/)
  }
  const noAccess = render(h(CapstoneEntryCard, { data: { ...summary, access: false, progress: null } }))
  assert.match(noAccess, /href="\/pricing"/); assert.match(noAccess, /查看项目版/)
  const hero = render(h(CapstoneOverviewStart, { data: { ...summary, progress: { ...progress, continueLessonId: 'c7' } }, loading: false }))
  assert.match(hero, /href="\/capstone\/lessons\/c7"/)
  assert.ok(hero.includes(capstoneLessons[6].title))
  assert.match(hero, /3 \/ 9/)
  const complete = render(h(CapstoneOverviewStart, { data: { ...summary, progress: { ...progress, completed: 9, continueLessonId: null } }, loading: false }))
  assert.match(complete, /查看毕业项目/)
  assert.match(render(h(CapstoneOverviewStart, { data: { ...summary, access: false, progress: null }, loading: false })), /href="\/pricing"/)
})

test('Stage and Capstone share responsive shell, sticky directory and constrained reading width', async () => {
  const html = render(h(LessonLayout, { sidebar: () => h('nav', null, '课程目录'), workbench: h('div', null, '任务'), remainingTasks: 2, children: h('article', null, '正文') }))
  for (const text of ['w-[260px]', 'max-w-[740px]', 'sticky top-20', 'min-[1360px]:hidden', '课程目录', '学习任务与进度']) assert.ok(html.includes(text))
  for (const path of ['src/pages/LessonPage.tsx', 'src/pages/CapstoneLessonPage.tsx']) {
    const source = await readFile(path, 'utf8')
    assert.match(source, /<LessonLayout/); assert.match(source, /<LessonMarkdown/)
  }
  const capstone = await readFile('src/pages/CapstoneLessonPage.tsx', 'utf8')
  assert.match(capstone, /lab.setCheck/); assert.doesNotMatch(capstone, /useProgress/)
})

test('published 29 + 9 and 61 stable keys; formal/internal bytes match without section time prefixes', async () => {
  assert.equal(curriculumFormalLessonCount(), 29)
  assert.equal(capstoneLessons.length, 9)
  assert.equal(new Set(capstoneLessons.flatMap(l => l.checkKeys)).size, 61)
  for (const lesson of capstoneLessons) {
    assert.equal(lesson.published, true)
    const formal = await readFile(lesson.contentPath)
    assert.ok(formal.equals(await readFile(`course-content/internal/capstone/${lesson.id}/lesson-draft.md`)))
    assert.doesNotMatch(formal.toString(), /^#{2,3}\s*\d+\s*[～~-]\s*\d+\s*分钟[：:]/m)
    assert.ok(parseLessonContent(formal.toString()).meta.estimatedTime)
  }
})
