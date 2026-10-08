import { mkdir, writeFile, appendFile } from 'node:fs/promises'
import path from 'node:path'
import { aggregate, HARD_METRICS } from './metrics.mjs'
import { CAPSTONE_EVAL_DATASET_VERSION } from './fixtures/gold.mjs'
export const EVAL_VERSION = 1
export function makeReport(results, { total, partial = false, injected = null, kind = 'deterministic-product-eval', versions = {} }) {
 const metrics = aggregate(results)
 const incomplete = results.some(r => r.status === 'INCOMPLETE') || results.length === 0
 const hardGates = Object.fromEntries(HARD_METRICS.map(key => [key, { observed: metrics[key], required: 0,
  status: incomplete ? 'INCOMPLETE' : kind==='real-provider-product-eval' ? 'SIGNAL_ONLY' : metrics[key] === 0 ? 'PASS' : 'FAIL' }]))
 // Thresholds selected after examining the baseline; real scores remain informational.
 const qualityThresholds = Object.fromEntries(Object.entries({retrieval_hit_at_3:0.90, answerable_success_rate:1,
  unsupported_abstention_rate:1, note_fidelity_pass_rate:1}).map(([key,min]) => [key,{observed:metrics[key],min,
   status: metrics[key] === null ? 'NOT_MEASURED' : metrics[key] >= min ? 'PASS' : 'FAIL'}]))
 const full = !partial && results.length === total
 const overall = incomplete ? 'INCOMPLETE' : results.some(r => r.status === 'FAIL') || Object.values(hardGates).some(g => g.status === 'FAIL') ||
  (kind === 'deterministic-product-eval' && Object.values(qualityThresholds).some(g => g.status === 'FAIL')) ? 'FAIL' :
  kind === 'deterministic-product-eval' && full && Object.values(qualityThresholds).some(g=>g.status==='NOT_MEASURED') ? 'INCOMPLETE' : 'PASS'
 const categories = Object.fromEntries(['functional','quality','safety','reliability'].map(c => {
  const rows = results.filter(r => r.category === c)
  return [c,{total:rows.length,passed:rows.filter(r => r.status === 'PASS').length}]
 }))
 const latencies = results.map(r => r.latencyMs).sort((a,b)=>a-b)
 return {version:EVAL_VERSION,datasetVersion:CAPSTONE_EVAL_DATASET_VERSION,kind,generatedAt:new Date().toISOString(),versions,
  scope:full?'full':'partial',injectedFixture:injected,overall,fullSuitePassed:full && overall === 'PASS',
  summary:{totalCases:results.length,matrixCases:total,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,
   incomplete:results.filter(r=>r.status==='INCOMPLETE').length},categories,metrics,hardGates,qualityThresholds,
  latency:{p50Ms:latencies[Math.ceil(latencies.length*.5)-1]??0,p95Ms:latencies[Math.ceil(latencies.length*.95)-1]??0,
   note:'Small teaching sample, not a production performance benchmark.'},results,
  limitations:['Closed synthetic gold is not a general semantic judge.','Mock retrieval measures pipeline/lexical regression, not real semantic retrieval.',
   'Real provider metrics are informational; this run does not repeat the full deterministic safety matrix. Optional judge is nondeterministic, never a safety boundary.',
   'Human edits are excluded from automated Note fidelity gates.','Dataset coverage and distribution shift remain risks.',
   'Abrupt process death and production recovery belong to C9.','Inherited dependency advisories remain.']}
}
export async function writeReport(report, name) {
 const directory = path.resolve('.runtime','capstone-eval',name)
 await mkdir(directory,{recursive:true})
 await writeFile(path.join(directory,'report.json'),JSON.stringify(report,null,2)+'\n')
 const table = report.results.map(r=>`| ${r.id} | ${r.category} | ${r.status} | ${r.latencyMs} |`).join('\n')
 const failures = report.results.flatMap(r=>r.assertions.filter(a=>!a.passed).map(a=>`- ${r.id}: ${a.name}; expected ${JSON.stringify(a.expected??true)}, observed ${JSON.stringify(a.observed??false)}`)).join('\n')
 await writeFile(path.join(directory,'report.md'),`# Capstone Product Eval\n\nOverall: **${report.overall}**; scope ${report.scope}; kind ${report.kind}.\n\nDataset ${report.datasetVersion}; runner ${report.version}; passed ${report.summary.passed}/${report.summary.totalCases}.\n\n## Metrics\n\n\`\`\`json\n${JSON.stringify(report.metrics,null,2)}\n\`\`\`\n\n## Hard Gates\n\n${Object.entries(report.hardGates).map(([k,v])=>`- ${k}: ${v.observed}; ${v.status}`).join('\n')}\n\n## Quality Thresholds\n\n${Object.entries(report.qualityThresholds).map(([k,v])=>`- ${k}: ${v.observed}, min ${v.min}; ${v.status}`).join('\n')}\n\n## Cases\n\n| Case | Category | Status | ms |\n|---|---|---|---:|\n${table}\n\n## Failed Assertions\n\n${failures||'None.'}\n\n## Baseline\n\n${JSON.stringify(report.comparison??'Not requested.')}\n\n## Limits\n\n${report.limitations.map(x=>'- '+x).join('\n')}\n\n${report.latency.note}\n`)
 await appendFile(path.join(directory,'report.md'),`\n## Versions and Call Accounting\n\n\`\`\`json\n${JSON.stringify({versions:report.versions,callAccounting:report.callAccounting},null,2)}\n\`\`\`\n`)
 return directory
}
