import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { allLessons } from '../src/data/courses.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'

const base = 'course-content/internal/capstone'
const overlay = `${base}/c6/overlay`
const read = (file: string) => readFile(`${overlay}/${file}`, 'utf8')
const lesson = parseLessonContent(await readFile(`${base}/c6/lesson-draft.md`, 'utf8'))
assert.equal(lesson.meta.checklist.length, 7)
assert.equal(lesson.meta.checkKeys.length, 7)
assert.match(lesson.meta.estimatedTime, /130.*160/)
assert.ok((lesson.body.match(/^:::prompt\{title=/gm) ?? []).length >= 7)
for (const directive of ['prompt', 'task', 'concept', 'check', 'stuck', 'warning', 'deepdive'])
  assert.match(lesson.body, new RegExp(`^:::${directive}(?:\\{|$)`, 'm'))
assert.doesNotMatch(lesson.body, /:::resource\b|!\[[^\]]*\]\([^)]*\)/)
for (const word of ['Crossref', 'PRIVATE_ONLY', 'PRIVATE_AND_EXTERNAL', 'REFERENCE_METADATA', 'CLAIM_EVIDENCE',
  'search_external_references', 'Citation Snapshot', 'Alice', 'Bob', 'Stage 4', 'Git']) assert.ok(lesson.body.includes(word), word)
const used = new Set<string>()
for (const stage of [1, 2, 3, 4]) for (const file of await readdir(`course-content/stage-${stage}`)) {
  if (file.endsWith('.md')) for (const key of parseLessonContent(await readFile(`course-content/stage-${stage}/${file}`, 'utf8')).meta.checkKeys) used.add(key)
}
for (const prior of ['c1', 'c2', 'c3', 'c4', 'c5']) for (const key of parseLessonContent(await readFile(`${base}/${prior}/lesson-draft.md`, 'utf8')).meta.checkKeys) used.add(key)
for (const key of lesson.meta.checkKeys) { assert.ok(!used.has(key), `collision ${key}`); used.add(key) }
const schema = await read('prisma/schema.prisma')
for (const phrase of ['sourcePolicy', '@default("PRIVATE_ONLY")', 'externalId', 'sourceUrl', 'sourceVersion', 'supportLevel']) assert.ok(schema.includes(phrase))
assert.doesNotMatch(schema, /model (AgentAction|KnowledgeNote|ExternalDocument|ExternalChunk|ExternalIndex|ExternalCitation)|WAITING_APPROVAL|RESUMING/)
const migration = await read('prisma/migrations/20261011000000_external_evidence/migration.sql')
assert.match(migration, /DROP CONSTRAINT "ResearchCitation_source_check"/)
assert.match(migration, /"documentId" IS NULL/)
const contract = await read('lib/external-contract.ts')
assert.match(contract, /externalResultsSchema.*max\(3\)/)
assert.match(contract, /createHash\('sha256'\)/)
const adapter = await read('lib/crossref-adapter.ts')
for (const phrase of ['https://api.crossref.org/works', 'UPSTREAM_TIMEOUT_MS = 8000', "redirect: 'error'", '250_000', 'normalizeAbstract']) assert.ok(adapter.includes(phrase))
const server = await read('lib/external-mcp-server.ts')
assert.doesNotMatch(server, /prisma|workspace|currentSession|research_reference|publicReference/)
assert.equal((server.match(/registerTool\(/g) ?? []).length, 1)
const client = await read('lib/external-research-mcp.ts')
for (const phrase of ['listTools', 'callTool', 'getNegotiatedProtocolVersion', 'MCP_TIMEOUT_MS = 12_000', 'parseExternalMcpResult']) assert.ok(client.includes(phrase))
const auth = await read('lib/external-mcp-auth.ts')
for (const phrase of ['ai-research-external', 'tools:call:search_external_references', '/api/mcp/external-research', 'timingSafeEqual']) assert.ok(auth.includes(phrase))
const runtime = await read('lib/research-runtime.ts')
for (const phrase of ['new Map<string, ResearchEvidence>', 'externalUnavailable = true', 'externalEvidence', 'safeExternalError', 'evidence.size < 8']) assert.ok(runtime.includes(phrase))
const oldContract = (await readFile(`${base}/c4/overlay/lib/grounded-report.ts`, 'utf8')).replace(/\r\n/g, '\n')
const newContract = (await read('lib/grounded-report.ts')).replace(/\r\n/g, '\n')
// Exact schema text comparison protects the existing report payload contract.
assert.equal(newContract.split('const claim = ')[1].split('const sections = ')[0], oldContract.split('const claim = ')[1].split('const sections = ')[0])
for (const forbidden of ['lib/approval.ts', 'lib/knowledge-note.ts', 'app/api/approvals', 'app/api/knowledge/notes'])
  await assert.rejects(access(path.join(overlay, forbidden)))
const lock = JSON.parse(await readFile(`${base}/c6/package-lock.json`, 'utf8'))
for (const pkg of ['@modelcontextprotocol/client', '@modelcontextprotocol/server']) assert.equal(lock.packages[`node_modules/${pkg}`].version, '2.2.0')
assert.ok(['暂未解锁','已开放'].includes(capstoneShowcase.status))
assert.equal(allLessons.length, 29)
console.log('PASS: C6 Renderer V2, seven unique checks/prompts, fixed Crossref/MCP, mixed provenance, unchanged report contract and C7 boundary')
