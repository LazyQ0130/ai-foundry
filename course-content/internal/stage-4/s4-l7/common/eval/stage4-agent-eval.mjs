import { cases } from './cases.mjs'
import { createEvalContext } from './context.mjs'
import { makeReport, writeReport } from './report.mjs'

function args(argv) {
  let caseId, injectFailure
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--case') caseId = argv[++i]
    else if (argv[i] === '--inject-failure') injectFailure = argv[++i]
    else throw new Error('Usage: npm run eval:agent -- [--case id] [--inject-failure unapproved-write]')
  }
  if (injectFailure && injectFailure !== 'unapproved-write') throw new Error('Unknown isolated fixture injection')
  if (caseId && !cases.some(item => item.id === caseId)) throw new Error(`Unknown case ID: ${caseId}`)
  if (injectFailure && caseId && caseId !== 'unapproved-write') throw new Error('Inject only into unapproved-write')
  return { caseId, injectFailure }
}

const options = args(process.argv.slice(2))
const selected = options.caseId ? cases.filter(item => item.id === options.caseId) : cases
const context = await createEvalContext()
const results = []
try {
  for (const item of selected) {
    const start = performance.now()
    let observation
    try { observation = await item.execute(context, options) }
    catch { observation = { passed: false, assertions: [{ name: 'case execution completed', passed: false }],
      status: 'failed', modelCalls: 0, toolCalls: 0, embeddingCalls: 0, mcpCalls: 0, providerUnits: 0,
      dbFacts: { resourceDelta: 0, crossUserLeaks: 0, duplicateWrites: 0, unapprovedWrites: 0 },
      counters: {}, errorCategory: 'EVAL_EXECUTION_ERROR' } }
    const safe = { caseId: item.id, category: item.category, title: item.title, mode: item.mode,
      subcaseCount: item.subcases.length, passed: observation.passed,
      status: observation.status, modelCalls: observation.modelCalls,
      toolCalls: observation.toolCalls, embeddingCalls: observation.embeddingCalls,
      mcpCalls: observation.mcpCalls, providerUnits: observation.providerUnits,
      latencyMs: Math.round(performance.now() - start), dbFacts: observation.dbFacts,
      assertions: observation.assertions, counters: observation.counters,
      ...(observation.errorCategory ? { errorCategory: observation.errorCategory } : {}) }
    results.push(safe)
    console.log(`${safe.passed ? 'PASS' : 'FAIL'} ${item.id} (${safe.latencyMs} ms)`)
  }
} finally { await context.close() }
const report = makeReport(results, cases, { partial: Boolean(options.caseId),
  injectedFixtureFailure: Boolean(options.injectFailure) })
const target = await writeReport(report)
console.log(`Cases ${report.summary.passedCases}/${report.summary.totalCases}; hard gates ${report.overallSafetyGate}; report ${target}`)
if (!report.allCasesPassed || report.overallSafetyGate !== 'PASS') process.exitCode = 1
