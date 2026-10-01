import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { assessCase, reviewMarkdown, summarize, validateCases } from './rag-eval-core.mjs'

const realCases = JSON.parse(await readFile(new URL('./rag-cases.json', import.meta.url), 'utf8'))
const sample = () => structuredClone(realCases)

test('fixed 12-case set has eight answerable and four no-answer questions', () => {
  assert.equal(validateCases(realCases).length, 12)
  assert.equal(realCases.filter(item => item.expectedStatus === 'answered').length, 8)
  assert.equal(realCases.filter(item => item.expectedStatus === 'insufficient').length, 4)
})

test('malformed, duplicate, one-sided and secret-bearing cases are rejected', () => {
  for (const mutate of [
    value => { value[1].id = value[0].id },
    value => { value[0].expectedStatus = 'bogus' },
    value => { value[0].expectedDocumentTitles = [] },
    value => { value[8].expectedDocumentTitles = ['Git 学习笔记'] },
    value => { value[0].password = 'forbidden' },
    value => { value[0].question = '' },
    value => { for (const item of value) item.expectedStatus = 'answered' },
    value => { for (const item of value) { item.expectedStatus = 'insufficient'; item.expectedDocumentTitles = [] } },
  ]) {
    const value = sample(); mutate(value)
    assert.throws(() => validateCases(value), /INVALID_EVAL_SET/)
  }
  assert.throws(() => validateCases(sample().slice(0, 9)), /INVALID_EVAL_SET/)
})

const answerable = realCases[0], noAnswer = realCases[8]
const body = {
  ok: true, status: 'answered', answer: 'Git 保存代码版本。',
  matches: [{ title: 'Git 学习笔记', position: 0, preview: 'Git 保存版本。' }],
  sources: [{ sourceId: 'SRC-CHUNK-1', title: 'Git 学习笔记', position: 0, preview: 'Git 保存版本。' }],
  latencyMs: { embedding: 40, retrieval: 5, chat: 100, total: 145 },
  usage: { embeddingTokens: 4, chatTokens: 20 },
}

test('retrieval, status and expected citation document are separate indicators', () => {
  const good = assessCase(answerable, 200, body, 150)
  assert.equal(good.retrievalHit, true)
  assert.equal(good.statusMatch, true)
  assert.equal(good.expectedCitationHit, true)
  assert.equal(good.verifiedSources, true)
  const wrongSource = assessCase(answerable, 200, { ...body, sources: [{ ...body.sources[0], title: 'Other' }] }, 150)
  assert.equal(wrongSource.errorCategory, 'provider_failure')
  const missed = assessCase(answerable, 200, { ...body, matches: [{ title: 'Other', position: 0, preview: 'Other' }], sources: [{ sourceId: 'SRC-CHUNK-2', title: 'Other', position: 0, preview: 'Other' }] }, 150)
  assert.equal(missed.errorCategory, 'retrieval_miss')
  const differentCitation = assessCase(answerable, 200, { ...body,
    matches: [...body.matches, { title: 'Other', position: 0, preview: 'Other' }],
    sources: [{ sourceId: 'SRC-CHUNK-2', title: 'Other', position: 0, preview: 'Other' }] }, 150)
  assert.equal(differentCitation.expectedCitationHit, false)
  assert.equal(differentCitation.errorCategory, null, 'citation support needs a human review')
  const refusal = assessCase(noAnswer, 200, { ...body, status: 'insufficient', answer: '资料不足', sources: [] }, 150)
  assert.equal(refusal.statusMatch, true)
  assert.equal(refusal.expectedCitationHit, false)
  assert.equal(assessCase(noAnswer, 200, body, 150).errorCategory, 'missing_refusal')
  assert.equal(assessCase(answerable, 200, { ...body, status: 'insufficient', sources: [] }, 150).errorCategory, 'wrong_refusal')
})

test('provider errors, null usage, latency and token summaries are honest', () => {
  const good = assessCase(answerable, 200, body, 150)
  const unknownUsage = assessCase(noAnswer, 200, { ...body, status: 'insufficient', sources: [], usage: {} }, 200)
  const failed = assessCase(answerable, 502, null, 300)
  assert.equal(failed.errorCategory, 'provider_failure')
  const summary = summarize([good, unknownUsage, failed])
  assert.equal(summary.expectedRetrievalHit, 1)
  assert.equal(summary.answerableStatusMatch, 1)
  assert.equal(summary.noAnswerRefusal, 1)
  assert.equal(summary.expectedCitationDocumentHit, 1)
  assert.equal(summary.medianTotalLatencyMs, 145)
  assert.equal(summary.maxTotalLatencyMs, 145)
  assert.equal(summary.totalEmbeddingTokensKnown, 4)
  assert.equal(summary.totalChatTokensKnown, 20)
  assert.equal(summary.missingEmbeddingUsageCount, 2)
  assert.equal(summary.providerFailures, 1)
  assert(!reviewMarkdown([good]).includes('Cookie:'))
})

test('real runner refuses paid calls without explicit confirmation', () => {
  const run = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/rag-eval.mjs', import.meta.url))], {
    env: { ...process.env, EVAL_MODE: 'real', EVAL_REAL_CONFIRM: '' }, encoding: 'utf8',
  })
  assert.notEqual(run.status, 0)
  assert.match(run.stderr, /EVAL_REAL_CONFIRM=YES/)
  assert.equal(run.stdout, '')
})
