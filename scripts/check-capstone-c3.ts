import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const base = path.join('course-content', 'internal', 'capstone')
const c3 = path.join(base, 'c3')
const lesson = parseLessonContent(await readFile(path.join(c3, 'lesson-draft.md'), 'utf8'))
assert.equal(lesson.meta.checklist.length, 7)
assert.equal(lesson.meta.checkKeys.length, 7)
assert.match(lesson.meta.estimatedTime, /120.*150/)
assert.equal((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length, 7)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive']) {
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'), `missing ${directive}`)
}
assert.doesNotMatch(lesson.body, /<\/?[A-Za-z][^>]*>|:::resource\b|!\[[^\]]*\]\([^)]*\)/)
for (const phrase of ['PENDING_UPLOAD', 'PROCESSING', 'READY', 'FAILED', 'citationKey', 'Alice', 'Bob', 'Workspace', 'pgvector']) {
  assert.ok(lesson.body.includes(phrase), `missing teaching topic: ${phrase}`)
}
const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) {
  for (const file of await readdir(path.join('course-content', `stage-${stage}`))) {
    if (!file.endsWith('.md')) continue
    for (const key of parseLessonContent(await readFile(path.join('course-content', `stage-${stage}`, file), 'utf8')).meta.checkKeys) used.add(key)
  }
}
for (const prior of ['c1', 'c2']) {
  for (const key of parseLessonContent(await readFile(path.join(base, prior, 'lesson-draft.md'), 'utf8')).meta.checkKeys) used.add(key)
}
for (const key of lesson.meta.checkKeys) assert.ok(!used.has(key), `checkKey collision: ${key}`)

const schema = await readFile(path.join(c3, 'overlay', 'prisma', 'schema.prisma'), 'utf8')
assert.deepEqual([...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map(match => match[1]),
  ['User', 'Session', 'Workspace', 'KnowledgeDocument', 'KnowledgeChunk', 'ResearchTask'])
assert.match(schema, /Unsupported\("vector\(1024\)"\)/)
assert.match(schema, /@@unique\(\[documentId, indexingVersion, position\]\)/)
assert.doesNotMatch(schema, /ResearchCitation|ResearchReport|ResearchRun|ResearchStep|KnowledgeNote/)
const migration = await readFile(path.join(c3, 'overlay', 'prisma', 'migrations', '20261008000000_knowledge', 'migration.sql'), 'utf8')
assert.match(migration, /CREATE EXTENSION IF NOT EXISTS vector/)
assert.match(migration, /vector\(1024\)/)
assert.doesNotMatch(migration, /ResearchCitation|ResearchReport|ResearchRun|citation snapshot/i)
const search = await readFile(path.join(c3, 'overlay', 'app', 'api', 'knowledge', 'search', 'route.ts'), 'utf8')
assert.match(search, /d\."workspaceId" = \$\{workspace\.id\}/)
assert.match(search, /d\."status" = 'READY'/)
assert.match(search, /c\."embeddingModel" = \$\{embedding\.model\}/)
assert.ok(search.indexOf('d."workspaceId"') < search.indexOf('LIMIT 5'))
const indexer = await readFile(path.join(c3, 'overlay', 'lib', 'knowledge-indexer.ts'), 'utf8')
assert.ok(indexer.indexOf('for (const chunk of chunks) embedded.push') < indexer.indexOf('prisma.$transaction'))
for (const forbidden of ['app/api/research/reports', 'app/api/research/runs', 'lib/grounded-report.ts', 'lib/agent-runtime.ts']) {
  await assert.rejects(access(path.join(c3, 'overlay', forbidden)), `C4+ file leaked: ${forbidden}`)
}
assert.deepEqual(capstoneShowcase.lessons.map(item => item.code), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'])
assert.equal(capstoneShowcase.status, '暂未解锁')
console.log('PASS: C3 Renderer V2, 7 unique checks/prompts, lifecycle/vector/ownership and C4 boundary')
