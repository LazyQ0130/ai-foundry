import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import CourseGuide from '../src/pages/CourseGuide.js'
import { guideConcepts, guideSections } from '../src/data/courseGuide.js'
import { allLessons, curriculumFormalLessonCount, stages } from '../src/data/courses.js'

test('guide is an independent public route outside lessons and progress', async () => {
  const app = await readFile('src/App.tsx', 'utf8')
  assert.match(app, /path="guide" element=\{<CourseGuide \/>\}/)
  assert.doesNotMatch(app, /path="guide" element=\{<RequireAuth|path="guide" element=\{<LearningBoundary/)
  assert.equal(stages.length, 4)
  assert.deepEqual(stages.map(s => curriculumFormalLessonCount(s.slug)), [6, 8, 7, 8])
  assert.equal(curriculumFormalLessonCount(), 29)
  assert.equal(allLessons.length, 29)
  assert.equal(stages.flatMap(s => s.lessons).some(l => l.id === 'guide'), false)
  const progress = await readFile('src/data/progress.tsx', 'utf8')
  assert.match(progress, /const total = curriculumFormalLessonCount\(\)/)
  assert.doesNotMatch(progress, /courseGuide|\/guide/)
})

test('guide provides twelve sections, core concepts, and both free next steps', () => {
  const html = renderToStaticMarkup(createElement(StaticRouter, { location: '/guide' }, createElement(CourseGuide)))
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((html.match(/<h2\b/g) ?? []).length, 12)
  assert.equal(guideSections.length, 12)
  assert.equal(guideConcepts.length, 13)
  for (const term of ['LLM', 'RAG', 'Agent', 'MCP', 'Skill', 'Eval']) assert.match(html, new RegExp(term))
  assert.match(html, /href="\/lesson\/stage-1\/s1-l1"/)
  assert.match(html, /href="\/path"/)
  assert.doesNotMatch(html, /LessonProgress|LessonCheck|entitlement|购买|¥599|¥699/)
})
