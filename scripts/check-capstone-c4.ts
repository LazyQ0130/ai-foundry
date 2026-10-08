import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const base = path.join('course-content', 'internal', 'capstone')
const c4 = path.join(base, 'c4')
const overlay = path.join(c4, 'overlay')
const lesson = parseLessonContent(await readFile(path.join(c4, 'lesson-draft.md'), 'utf8'))
assert.equal(lesson.meta.checklist.length, 7)
assert.equal(lesson.meta.checkKeys.length, 7)
assert.match(lesson.meta.estimatedTime, /110.*140/)
assert.ok((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length >= 6)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive']) {
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'), `missing ${directive}`)
}
assert.doesNotMatch(lesson.body, /<\/?[A-Za-z][^>]*>|:::resource\b|!\[[^\]]*\]\([^)]*\)/)
for (const phrase of ['ResearchRun', 'ResearchCitation', 'Citation Snapshot', 'insufficient_evidence',
  'Alice', 'Bob', 'Workspace', 'FAILED', '重索引', '删除']) assert.ok(lesson.body.includes(phrase), `missing ${phrase}`)
const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) for (const file of await readdir(path.join('course-content', `stage-${stage}`))) {
  if (!file.endsWith('.md')) continue
  for (const key of parseLessonContent(await readFile(path.join('course-content', `stage-${stage}`, file), 'utf8')).meta.checkKeys) used.add(key)
}
for (const prior of ['c1', 'c2', 'c3']) {
  for (const key of parseLessonContent(await readFile(path.join(base, prior, 'lesson-draft.md'), 'utf8')).meta.checkKeys) used.add(key)
}
for (const key of lesson.meta.checkKeys) assert.ok(!used.has(key), `checkKey collision: ${key}`)

const schema = await readFile(path.join(overlay, 'prisma/schema.prisma'), 'utf8')
assert.match(schema, /model ResearchRun \{/)
assert.match(schema, /model ResearchCitation \{/)
assert.match(schema, /report\s+Json\?/)
assert.match(schema, /@@unique\(\[runId, citationKey\]\)/)
assert.doesNotMatch(schema, /model ResearchStep|model ResearchReport|model KnowledgeNote|WAITING_APPROVAL|PAUSED/)
const migration = await readFile(path.join(overlay, 'prisma/migrations/20261009000000_grounded_report/migration.sql'), 'utf8')
assert.match(migration, /CREATE TABLE "ResearchRun"/)
assert.match(migration, /CREATE TABLE "ResearchCitation"/)
assert.match(migration, /ResearchCitation_runId_citationKey_key/)
assert.doesNotMatch(migration, /"documentId"\) REFERENCES "KnowledgeDocument"/)
const contract = await readFile(path.join(overlay, 'lib/grounded-report.ts'), 'utf8')
for (const phrase of ['summary', 'findings', 'analysis', 'conclusion', 'UNKNOWN_CITATION', 'citationSnapshots']) assert.ok(contract.includes(phrase))
const retrieval = await readFile(path.join(overlay, 'lib/knowledge-retrieval.ts'), 'utf8')
for (const phrase of ['d."workspaceId"', "d.\"status\" = 'READY'", 'c."embeddingModel"', 'c."embeddingDimension"']) assert.ok(retrieval.includes(phrase))
assert.ok(retrieval.indexOf('d."workspaceId"') < retrieval.indexOf('LIMIT ${limit}'))
const route = await readFile(path.join(overlay, 'app/api/research/tasks/[id]/runs/route.ts'), 'utf8')
assert.match(route, /status: 'RUNNING'/)
assert.match(route, /validateGroundedReport/)
assert.match(route, /prisma\.\$transaction/)
const smoke = await readFile(path.join(overlay, 'scripts/c4-http-smoke.mjs'), 'utf8')
for (const phrase of ['unknown_citation', 'malformed', 'INSUFFICIENT_EVIDENCE', 'knowledgeDocument.delete', 'bobCookie']) assert.ok(smoke.includes(phrase))
for (const forbidden of ['lib/agent-runtime.ts', 'lib/tool-registry.ts', 'app/api/research/steps', 'app/api/mcp', 'app/api/approval']) {
  await assert.rejects(access(path.join(overlay, forbidden)), `C5+ leaked: ${forbidden}`)
}
assert.equal(capstoneShowcase.status, '暂未解锁')
assert.deepEqual(capstoneShowcase.lessons.map(item => item.code), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'])
console.log('PASS: C4 Renderer V2, 7 unique checks, 6+ prompts, snapshot/grounding/retrieval and C5 boundary')
