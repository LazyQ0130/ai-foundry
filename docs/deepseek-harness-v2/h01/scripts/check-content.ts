/** 使用平台真实 parser/renderer；不注册课程、不写生成目录。 */
import assert from 'node:assert/strict'
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseLessonContent } from '../../../../server/services/lesson-parser.js'
import { LessonMarkdown } from '../../../../src/components/LessonMarkdown.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const repo = resolve(root, '../../..')
const lessonPath = resolve(repo, 'course-content/internal/deepseek-harness/h01/lesson.md')
const lesson = parseLessonContent((await readFile(lessonPath, 'utf8')).replaceAll('\r\n','\n'))
assert.equal(lesson.meta.checkKeys.length, 4)
assert.ok(!/^# /m.test(lesson.body))
assert.ok(!/__(H01|TODO)|image-placeholder|<details|<script/.test(lesson.body))
const codes = [...lesson.body.matchAll(/```javascript\n([\s\S]*?)\n```/g)].map(m => m[1])
const lab = (await readFile(resolve(lessonPath, '../lab/compare.mjs'), 'utf8')).replaceAll('\r\n','\n').trim()
assert.ok(codes.includes(lab), '正文完整实验必须与实际受测文件完全一致')
assert.ok(lab.includes(codes.at(-1)!.replace(/^/gm, '      ').trim()), '短摘录必须来自实际受测文件')
const oldKeys = new Set<string>()
for (const file of await readdir(resolve(repo,'course-content'),{recursive:true})) {
  const path=resolve(repo,'course-content',file)
  if (!file.endsWith('.md') || path===lessonPath) continue
  const text = await readFile(path,'utf8')
  for (const key of text.match(/check-[a-f0-9]{16}/g) ?? []) oldKeys.add(key)
}
for (const key of lesson.meta.checkKeys) assert.ok(!oldKeys.has(key), '不得复用其他课程任务键')
const html = renderToStaticMarkup(React.createElement(LessonMarkdown, {body:lesson.body}))
const figures = JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))
for (const f of figures) {
  assert.ok(html.includes(`src="${f.rendererPath}"`))
  assert.ok(html.includes('lesson-caption'))
  assert.ok(html.includes(`href="${f.rendererPath}"`))
}
assert.equal((html.match(/<img /g) ?? []).length, 3)
assert.ok((html.match(/<details /g) ?? []).length >= 7)
assert.ok(!/<details[^>]* open/.test(html))
for (const heading of ['Stage 4','四个词','真实仓库','插件化','实验','思考一','思考二','思考三','误解','H02']) assert.ok(html.includes(heading))
assert.ok(lesson.body.includes('教学简化') && lesson.body.includes('我们的分析') && lesson.body.includes('官方实现'))
const report = {status:'PASS', parser:'actual parseLessonContent', renderer:'actual LessonMarkdown SSR', lessonSha256:createHash('sha256').update(await readFile(lessonPath)).digest('hex'), metadataKeys:Object.keys(lesson.meta), checklist:4, figures:3, details:(html.match(/<details /g) ?? []).length, labExactMatch:true, excerptExactMatch:true, globallyUniqueKeys:true, publicationIntegration:'NOT_PERFORMED'}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report))
