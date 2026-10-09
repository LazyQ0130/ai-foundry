import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import sharp from 'sharp'
import Environment from '../src/pages/Environment.js'
import { LessonMarkdown } from '../src/components/LessonMarkdown.js'
import { parseLessonContent } from '../server/services/lesson-parser.js'

test('environment is publicly routed and lesson setup links resolve to its sections', async () => {
  const html = renderToStaticMarkup(createElement(StaticRouter, { location: '/environment' }, createElement(Environment)))
  const app = await readFile('src/App.tsx', 'utf8')
  assert.match(app, /path="environment"[^\n]*<Environment \/>/)
  assert.doesNotMatch(app, /path="environment"[^\n]*RequireAuth/)
  for (const id of ['tools', 'chat', 'embedding', 'agent']) assert.ok(html.includes(`id="${id}"`))
  for (let stage = 1; stage <= 4; stage++) {
    for (const file of await readdir(`course-content/stage-${stage}`)) {
      const source = await readFile(`course-content/stage-${stage}/${file}`, 'utf8')
      for (const match of source.matchAll(/\]\(\/environment#([^)]*)\)/g)) assert.ok(html.includes(`id="${match[1]}"`), `${file}: ${match[1]}`)
      assert.doesNotMatch(source, /WorkBuddy|qwen3\.7-flash|text-embedding-v4/)
    }
  }
  assert.match(html, /AI_CHAT_API_KEY=&lt;/)
  assert.match(html, /AI_EMBEDDING_API_KEY=&lt;/)
})

test('learner exercises precede closed, copyable reference answers without swallowing the next section', async () => {
  for (const stage of [3, 4]) for (const file of await readdir(`course-content/stage-${stage}`)) {
    const { body } = parseLessonContent(await readFile(`course-content/stage-${stage}/${file}`, 'utf8'))
    const html = renderToStaticMarkup(createElement(LessonMarkdown, { body }))
    const references = [...html.matchAll(/<details[^>]*>[\s\S]*?<\/details>/g)].map(m => m[0]).filter(s => s.includes('参考答案：'))
    const prompts = [...body.matchAll(/^:::prompt\{/gm)]
    assert.ok(references.length > 0, file)
    assert.equal(references.length, prompts.length, file)
    assert.ok(html.indexOf('先写自己的需求：') < html.indexOf('参考答案：'), file)
    for (const reference of references) {
      assert.doesNotMatch(reference, /^<details[^>]*\sopen/)
      assert.match(reference, /复制提示词/)
      assert.match(reference, /lesson-code-prompt/)
      assert.match(reference, /验收结果/)
      assert.doesNotMatch(reference, /<h2>/, 'next chapter must remain outside reference answer')
    }
  }
})

test('all new Stage 1/2 figures decode and are captioned in the correct lesson', async () => {
  const inventory = JSON.parse(await readFile('docs/course-revision-visuals.json', 'utf8')) as { stage: number; lesson: string; file: string; caption: string }[]
  assert.equal(inventory.length, 33)
  for (const item of inventory) {
    const source = await readFile(`course-content/stage-${item.stage}/${item.lesson}.md`, 'utf8')
    assert.ok(source.includes(`/course-media/stage-${item.stage}/${item.file}`))
    assert.ok(source.includes(item.caption + '（操作示意）'))
    assert.doesNotMatch(source, /<!-- 配图建议/)
    const meta = await sharp(`public/course-media/stage-${item.stage}/${item.file}`).metadata()
    assert.equal(meta.format, 'webp')
    assert.ok(meta.width! >= 1200 && meta.height! >= 650)
  }
})
