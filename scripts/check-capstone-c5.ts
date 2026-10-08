import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const base = path.join('course-content', 'internal', 'capstone')
const c5 = path.join(base, 'c5')
const overlay = path.join(c5, 'overlay')
const lesson = parseLessonContent(await readFile(path.join(c5, 'lesson-draft.md'), 'utf8'))
assert.equal(lesson.meta.checklist.length, 7)
assert.equal(lesson.meta.checkKeys.length, 7)
assert.match(lesson.meta.estimatedTime, /120.*150/)
assert.ok((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length >= 7)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive'])
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'), `missing ${directive}`)
assert.doesNotMatch(lesson.body, /<\/?[A-Za-z][^>]*>|:::resource\b|!\[[^\]]*\]\([^)]*\)/)
for (const phrase of ['ResearchBrief', 'ResearchStep', 'search_knowledge', 'GroundedReport', 'Citation Snapshot',
  'MAX_STEPS', 'MAX_TOOLS', 'CANCELLED', 'Alice', 'Bob', 'Stage 4']) assert.ok(lesson.body.includes(phrase), `missing ${phrase}`)
const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) for (const file of await readdir(path.join('course-content', `stage-${stage}`))) {
  if (!file.endsWith('.md')) continue
  for (const key of parseLessonContent(await readFile(path.join('course-content', `stage-${stage}`, file), 'utf8')).meta.checkKeys) used.add(key)
}
for (const prior of ['c1', 'c2', 'c3', 'c4'])
  for (const key of parseLessonContent(await readFile(path.join(base, prior, 'lesson-draft.md'), 'utf8')).meta.checkKeys) used.add(key)
for (const key of lesson.meta.checkKeys) assert.ok(!used.has(key), `checkKey collision: ${key}`)

const schema = await readFile(path.join(overlay, 'prisma/schema.prisma'), 'utf8')
for (const text of ['model ResearchStep {', 'brief       Json?', 'cancelRequestedAt DateTime?', '@@unique([runId, position])',
  'model ResearchCitation {', '@@unique([runId, citationKey])']) assert.ok(schema.includes(text), `missing schema: ${text}`)
assert.doesNotMatch(schema, /model AgentAction|model KnowledgeNote|EXTERNAL|WAITING_APPROVAL|RESUMING/)
const migration = await readFile(path.join(overlay, 'prisma/migrations/20261010000000_research_workflow/migration.sql'), 'utf8')
assert.match(migration, /CREATE TABLE "ResearchStep"/)
assert.match(migration, /ResearchStep_runId_position_key/)
assert.match(migration, /ON DELETE CASCADE/)
const tools = await readFile(path.join(overlay, 'lib/research-tools.ts'), 'utf8')
assert.match(tools, /name: 'search_knowledge'/)
assert.match(tools, /additionalProperties: false/)
assert.doesNotMatch(tools, /name: 'search_external|name: 'save_|name: 'research_reference/)
const runtime = await readFile(path.join(overlay, 'lib/research-runtime.ts'), 'utf8')
for (const phrase of ['MAX_AGENT_STEPS = 4', 'MAX_TOOL_CALLS = 3', 'RUN_DEADLINE_MS', 'MAX_PROVIDER_UNITS', 'validateResearchToolCalls', 'new Map<string, KnowledgeEvidence>'])
  assert.ok(runtime.includes(phrase), `missing runtime: ${phrase}`)
const service = await readFile(path.join(overlay, 'lib/research-service.ts'), 'utf8')
for (const phrase of ['generateResearchBrief', 'runResearchRuntime', 'generateReport', 'validateGroundedReport',
  'citationSnapshots', "status: 'RUNNING'", "kind: 'BRIEF' | 'MODEL' | 'TOOL' | 'REPORT'"])
  assert.ok(service.includes(phrase), `missing orchestration: ${phrase}`)
const oldContract = await readFile(path.join(base, 'c4/overlay/lib/grounded-report.ts'), 'utf8')
assert.match(oldContract, /UNKNOWN_CITATION/)
await assert.rejects(access(path.join(overlay, 'lib/grounded-report.ts')), 'C4 report contract was replaced')
for (const forbidden of ['lib/mcp-reference-adapter.ts', 'lib/external-search.ts', 'lib/approval.ts',
  'app/api/mcp', 'app/api/approvals', 'app/api/knowledge/notes']) await assert.rejects(access(path.join(overlay, forbidden)))
const smoke = await readFile(path.join(overlay, 'scripts/c5-http-smoke.mjs'), 'utf8')
for (const phrase of ['unknown_tool', 'bad_args', 'multiple_tools', 'max_steps', 'max_tools', 'cancel',
  'tool_error', 'provider_error', 'bob', 'legacy']) assert.ok(smoke.includes(phrase), `missing smoke: ${phrase}`)
const assembler = await readFile('scripts/assemble-capstone-reference.mjs', 'utf8')
assert.match(assembler, /'c5'/)
assert.equal(capstoneShowcase.status, '暂未解锁')
assert.deepEqual(capstoneShowcase.lessons.map(item => item.code), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'])
console.log('PASS: C5 Renderer V2, 7 unique checks/prompts, bounded workflow, C4 contract and C6/C7 boundary')
