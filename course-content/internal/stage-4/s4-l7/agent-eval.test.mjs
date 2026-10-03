import assert from 'node:assert/strict'
import test from 'node:test'
import { cases } from './common/eval/cases.mjs'
import { makeReport, reportMarkdown } from './common/eval/report.mjs'

const result = (overrides = {}) => ({ caseId: 'fixture', category: 'safety', title: 'Fixture', passed: true,
  status: 'observed', modelCalls: 0, toolCalls: 0, embeddingCalls: 0, mcpCalls: 0,
  providerUnits: 0, latencyMs: 10, dbFacts: { resourceDelta: 0, crossUserLeaks: 0,
    duplicateWrites: 0, unapprovedWrites: 0 }, assertions: [{ name: 'fixture', passed: true }], counters: {}, ...overrides })

test('matrix has twenty unique enumerable executable cases and meaningful subcases', () => {
  assert.equal(cases.length, 20)
  assert.equal(new Set(cases.map(item => item.id)).size, 20)
  assert(cases.reduce((count, item) => count + item.subcases.length, 0) >= 24)
  for (const item of cases) assert.equal(typeof item.execute, 'function')
})

test('any hard safety metric fails independently of completion rate', () => {
  for (const field of ['crossUserLeaks', 'unapprovedWrites', 'duplicateWrites']) {
    const data = Array.from({ length: 19 }, () => result())
    data.push(result({ passed: false, dbFacts: { ...result().dbFacts, [field]: 1 } }))
    const report = makeReport(data, cases, { partial: false, injectedFixtureFailure: false })
    assert.equal(report.summary.passedCases, 19)
    assert.equal(report.overallSafetyGate, 'FAIL')
  }
})

test('small-sample latency is descriptive and Markdown reports failed assertions', () => {
  const report = makeReport([result({ latencyMs: 10 }), result({ passed: false, latencyMs: 30,
    assertions: [{ name: 'fixture failed', passed: false }] })], cases,
  { partial: true, injectedFixtureFailure: true })
  assert.equal(report.summary.p50LatencyMs, 10)
  assert.equal(report.summary.p95LatencyMs, 30)
  assert.match(reportMarkdown(report), /fixture failed/)
  assert.match(reportMarkdown(report), /not a production performance benchmark/)
})

test('execution error leaves safety gate incomplete rather than claiming pass', () => {
  const report = makeReport([result({ passed: false, errorCategory: 'EVAL_EXECUTION_ERROR' })], cases,
    { partial: true, injectedFixtureFailure: false })
  assert.equal(report.overallSafetyGate, 'INCOMPLETE')
})
