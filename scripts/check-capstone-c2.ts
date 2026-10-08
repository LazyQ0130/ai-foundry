import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const base = path.join('course-content', 'internal', 'capstone')
const c2 = path.join(base, 'c2')
const draft = await readFile(path.join(c2, 'lesson-draft.md'), 'utf8')
const lesson = parseLessonContent(draft)
assert.equal(lesson.meta.checklist.length, 6)
assert.equal(lesson.meta.checkKeys.length, 6)
assert.match(lesson.meta.estimatedTime, /90.*120/)
assert.equal((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length, 5)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive']) {
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'), `missing ${directive}`)
}
assert.doesNotMatch(lesson.body, /<\/?[A-Za-z][^>]*>/, 'raw HTML or MDX is not allowed')
assert.doesNotMatch(lesson.body, /:::resource\b|!\[[^\]]*\]\([^)]*\)/, 'unavailable resource or image')
for (const phrase of ['Architecture Explosion', 'workspaceId', 'Alice', 'Bob', 'migration', 'Vertical Slice']) {
  assert.ok(lesson.body.includes(phrase), `missing teaching evidence: ${phrase}`)
}

const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) {
  for (const file of await readdir(path.join('course-content', `stage-${stage}`))) {
    if (!file.endsWith('.md')) continue
    const existing = parseLessonContent(await readFile(path.join('course-content', `stage-${stage}`, file), 'utf8'))
    for (const key of existing.meta.checkKeys) used.add(key)
  }
}
const c1 = parseLessonContent(await readFile(path.join(base, 'c1', 'lesson-draft.md'), 'utf8'))
for (const key of c1.meta.checkKeys) used.add(key)
for (const key of lesson.meta.checkKeys) assert.ok(!used.has(key), `checkKey collision: ${key}`)
assert.equal(
  await readFile(path.join('starter', 'capstone', 'docs', 'templates', 'architecture-decision.md'), 'utf8'),
  await readFile(path.join('docs', 'templates', 'architecture-decision.md'), 'utf8'),
  'ADR template drift',
)

const schema = await readFile(path.join(c2, 'overlay', 'prisma', 'schema.prisma'), 'utf8')
assert.deepEqual([...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map(match => match[1]), ['User', 'Session', 'Workspace', 'ResearchTask'])
assert.match(schema, /ownerId\s+Int\s+@unique/)
assert.match(schema, /workspaceId\s+Int/)
assert.doesNotMatch(schema, /KnowledgeDocument|KnowledgeChunk|Embedding|ResearchRun|ResearchCitation|KnowledgeNote|vector/i)
const migration = await readFile(path.join(c2, 'overlay', 'prisma', 'migrations', '20261007000000_initial', 'migration.sql'), 'utf8')
assert.match(migration, /UNIQUE INDEX "Workspace_ownerId_key"/)
assert.match(migration, /FOREIGN KEY \("workspaceId"\)/)
assert.doesNotMatch(migration, /KnowledgeDocument|KnowledgeChunk|Embedding|ResearchRun|vector/i)
for (const forbidden of ['app/api/knowledge', 'app/api/research/runs', 'lib/agent.ts', 'lib/retrieval.ts', 'lib/storage.ts']) {
  await assert.rejects(access(path.join(c2, 'overlay', forbidden)), `C3+ file leaked: ${forbidden}`)
}
const input = await readFile(path.join(c2, 'overlay', 'lib', 'task-input.ts'), 'utf8')
assert.match(input, /z\.strictObject/)
const taskRoute = await readFile(path.join(c2, 'overlay', 'app', 'api', 'research', 'tasks', 'route.ts'), 'utf8')
assert.match(taskRoute, /workspaceForUser\(session\.userId\)/)
assert.match(taskRoute, /where: \{ workspaceId: workspace\.id \}/)
assert.match(taskRoute, /workspaceId: workspace\.id/)
const register = await readFile(path.join(c2, 'overlay', 'app', 'api', 'auth', 'register', 'route.ts'), 'utf8')
assert.match(register, /prisma\.\$transaction/)
const smoke = await readFile(path.join(c2, 'overlay', 'scripts', 'c2-http-smoke.mjs'), 'utf8')
for (const phrase of ['workspaceId', 'userId', 'ownerId', 'bobStillEmpty', 'aliceRefreshedList', 'crossOrigin']) assert.ok(smoke.includes(phrase))
assert.deepEqual(capstoneShowcase.lessons.map(item => item.code), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'])
assert.equal(capstoneShowcase.status, '暂未解锁')
console.log('PASS: C2 Renderer V2, unique checkKeys, five prompts, ownership contract, C3 boundary and locked showcase')
