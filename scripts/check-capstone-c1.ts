import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const draftPath = path.join('course-content', 'internal', 'capstone', 'c1', 'lesson-draft.md')
const draft = await readFile(draftPath, 'utf8')
const lesson = parseLessonContent(draft)
assert.equal(lesson.meta.checklist.length, 6)
assert.equal(lesson.meta.checkKeys.length, 6)
assert.equal((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length, 3)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive']) {
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'), `missing ${directive}`)
}
assert.doesNotMatch(lesson.body, /<\/?[A-Za-z][^>]*>/, 'raw HTML or MDX is not allowed in the draft')
assert.doesNotMatch(lesson.body, /:::resource\b|!\[[^\]]*\]\([^)]*\)/, 'draft must not reference unavailable assets')

const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) {
  const dir = path.join('course-content', `stage-${stage}`)
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.md')) continue
    const existing = parseLessonContent(await readFile(path.join(dir, file), 'utf8'))
    for (const key of existing.meta.checkKeys) used.add(key)
  }
}
for (const key of lesson.meta.checkKeys) assert.ok(!used.has(key), `checkKey collision: ${key}`)

for (const name of ['product-brief.md', 'user-flow.md']) {
  const reference = await readFile(path.join('course-content', 'internal', 'capstone', 'c1', 'docs', name), 'utf8')
  assert.ok(reference.length > 100)
  const sharedTemplate = await readFile(path.join('docs', 'templates', name), 'utf8')
  const starterTemplate = await readFile(path.join('starter', 'capstone', 'docs', 'templates', name), 'utf8')
  assert.equal(starterTemplate, sharedTemplate, `${name} template drift`)
  assert.notEqual(reference, starterTemplate, `${name} reference leaked into starter`)
}
assert.deepEqual(capstoneShowcase.lessons.map(lesson => lesson.code), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'])
assert.equal(capstoneShowcase.status, '暂未解锁')
console.log(`PASS: C1 Renderer V2 draft, ${lesson.meta.checkKeys.length} unique checkKeys, 3 prompts, required blocks and references`)
