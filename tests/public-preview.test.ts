import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LessonMarkdown } from '../src/components/LessonMarkdown.js'

test('public C1 is the exact approved excerpt and excludes protected remainder and metadata', async () => {
  const full = (await readFile('course-content/capstone/c1.md', 'utf8')).replace(/\r\n/g, '\n')
  const excerpt = (await readFile('src/data/previews/c1.md', 'utf8')).replace(/\r\n/g, '\n')
  assert.equal(excerpt.trim(), full.slice(full.indexOf('## 一个很容易'), full.indexOf('## AI 可以做什么')).trim())
  assert.doesNotMatch(excerpt, /checkKeys:|check-c1|:::resource|## AI 可以做什么|Prompt 2：|Prompt 3：/)
  const html = renderToStaticMarkup(createElement(LessonMarkdown, { body: excerpt }))
  assert.match(html, /复制提示词/)
  assert.match(html, /问题和用户已经足够具体/)
  const page = await readFile('src/pages/CapstonePreview.tsx', 'utf8')
  assert.doesNotMatch(page, /useCapstone|useProgress|course-content|CourseResource|visitLesson|setCheck/)
  const routes = await readFile('src/App.tsx', 'utf8')
  assert.match(routes, /path="capstone\/preview\/c1"[^\n]*<CapstonePreview \/>/)
})

test('homepage sample preserves the real prompt and adjacent verification card', async () => {
  const full = (await readFile('course-content/stage-1/s1-l1.md', 'utf8')).replace(/\r\n/g, '\n')
  const sample = (await readFile('src/data/previews/s1-l1.md', 'utf8')).replace(/\r\n/g, '\n')
  assert.ok(full.includes(sample.trim()))
  const html = renderToStaticMarkup(createElement(LessonMarkdown, { body: sample }))
  assert.match(html, /让 AI 修改中央标题和介绍/)
  assert.match(html, /先确认第一次变化/)
  assert.match(html, /复制提示词/)
})
