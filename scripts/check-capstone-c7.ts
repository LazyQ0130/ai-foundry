import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LessonMarkdown } from '../src/components/LessonMarkdown.js'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { allLessons } from '../src/data/courses.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const base = 'course-content/internal/capstone'
const overlay = `${base}/c7/overlay`
const read = (file: string) => readFile(`${overlay}/${file}`, 'utf8')
const lesson = parseLessonContent(await readFile(`${base}/c7/lesson-draft.md`, 'utf8'))
const rendered = renderToStaticMarkup(createElement(LessonMarkdown, { body: lesson.body }))
assert.equal((rendered.match(/复制提示词/g) ?? []).length, 7)
assert.ok(rendered.includes('把研究结果安全沉淀成知识资产'))
assert.equal(lesson.meta.checklist.length, 7)
assert.equal(lesson.meta.checkKeys.length, 7)
assert.match(lesson.meta.estimatedTime, /120.*150/)
assert.ok((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length >= 7)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive'])
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'))
for (const word of ['ResearchAction', 'KnowledgeNote', 'canonicalArgs', 'expectedVersion', 'approvalToken', 'FOR UPDATE',
  'Promise.all', 'rollback', 'sourceActionKey', 'Alice', 'Bob', 'Stage 4', 'COMPLETED', 'C8', 'C9'])
  assert.ok(lesson.body.includes(word), word)
assert.doesNotMatch(lesson.body, /:::resource\b|!\[[^\]]*\]\([^)]*\)/)
const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) for (const file of await readdir(`course-content/stage-${stage}`)) {
  if (file.endsWith('.md')) for (const key of parseLessonContent(await readFile(`course-content/stage-${stage}/${file}`, 'utf8')).meta.checkKeys) used.add(key)
}
for (const prior of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'])
  for (const key of parseLessonContent(await readFile(`${base}/${prior}/lesson-draft.md`, 'utf8')).meta.checkKeys) used.add(key)
for (const key of lesson.meta.checkKeys) { assert.ok(!used.has(key), `collision ${key}`); used.add(key) }
const schema = await read('prisma/schema.prisma')
for (const phrase of ['model ResearchAction {', 'model KnowledgeNote {', 'runId          Int                  @unique',
  'sourceActionKey String       @unique', 'onDelete: SetNull', 'canonicalArgs  String', 'version        Int'])
  assert.ok(schema.includes(phrase), phrase)
assert.doesNotMatch(schema, /WAITING_APPROVAL|APPROVED|model AgentAction|model AgentRun|model Resource|model Eval/)
const migration = await read('prisma/migrations/20261012000000_human_knowledge_write/migration.sql')
for (const text of ['ResearchAction_runId_key', 'ResearchAction_idempotencyKey_key', 'KnowledgeNote_sourceActionKey_key', 'ON DELETE SET NULL'])
  assert.ok(migration.includes(text), text)
const contract = await read('lib/knowledge-note-contract.ts')
for (const text of ['canonicalizeKnowledgeNoteArgs', 'JSON.stringify({ title, content })', 'expectedVersion', 'approvalToken', '.strict()', "createHash('sha256')"])
  assert.ok(contract.includes(text), text)
const approval = await read('lib/knowledge-note-approval.ts')
for (const text of ['timingSafeEqual', 'APPROVAL_TTL_MS = 5 * 60 * 1000', 'workspaceId', 'actionVersion', 'canonicalArgsHash', 'randomBytes'])
  assert.ok(approval.includes(text), text)
const service = await read('lib/knowledge-write-service.ts')
for (const text of ['FOR UPDATE', 'prisma.$transaction', 'afterNoteCreate', "status: 'EXECUTED'", 'replayed: true', 'sourceActionKey'])
  assert.ok(service.includes(text), text)
assert.equal((service.match(/knowledgeNote\.create\(/g) ?? []).length, 1)
assert.doesNotMatch(service, /knowledgeDocument\.create|embedTexts|retrieveKnowledgeEvidence|researchRun\.update|researchStep\.create/)
const provider = await read('lib/knowledge-note-provider.ts')
assert.doesNotMatch(provider, /prisma|searchCrossref|searchExternalMcp|retrieveKnowledgeEvidence|tools:\s*\[/)
const integration = await read('test/knowledge-write.integration.ts')
for (const text of ['Promise.all', 'INJECTED_ROLLBACK', '400000', 'sourceRunId, null', 'knowledgeChunk.count'])
  assert.ok(integration.includes(text), text)
for (const file of ['lib/research-runtime.ts', 'lib/research-tools.ts', 'lib/research-service.ts',
  'lib/grounded-report.ts', 'lib/eval.ts', 'lib/worker.ts', 'app/api/evals', 'app/api/queues'])
  await assert.rejects(access(`${overlay}/${file}`), `unexpected C8/C9 or research modification: ${file}`)
const assembler = await readFile('scripts/assemble-capstone-reference.mjs', 'utf8')
assert.match(assembler, /'c7'/)
assert.ok(['暂未解锁','已开放'].includes(capstoneShowcase.status))
assert.equal(allLessons.length, 29)
console.log('PASS: C7 Renderer V2, seven unique checks/prompts, post-run Action, exact approval/atomic write and C8/C9 boundary')
