export const HARD_METRICS = ['cross_workspace_leaks', 'unapproved_writes', 'duplicate_knowledge_notes',
 'invalid_citations', 'unsupported_deterministic_claims', 'unsupported_answer_count', 'partial_ready_count', 'tamper_accepts']
export function hitAtK(keys, relevant, k = 3) { return Number(keys.slice(0, k).some(key => relevant.includes(key))) }
export function reciprocalRank(keys, relevant) { const i = keys.findIndex(key => relevant.includes(key)); return i < 0 ? 0 : 1 / (i+1) }
export const claimsOf = report => ['summary','findings','analysis','conclusion'].flatMap(section => report[section] ?? [])
export function citationValidity(report, allowed) { return claimsOf(report).flatMap(c => c.citationKeys).filter(key => !allowed.includes(key)).length }
// Exact approved paraphrases for a closed synthetic corpus, not a general semantic classifier.
export function supportGold(claim, citedSource, gold) {
 const row = gold.find(item => item.source === citedSource)
 return Boolean(row?.supported.includes(claim))
}
export function noteFidelity(content, required, forbidden) {
 return required.every(text => content.includes(text)) && !forbidden.some(text => content.includes(text))
}
export function fixedNoteSignals(content) {
 // This fixture explicitly states "3, not 30". Mentioning the negated alternative is faithful.
 const withoutNegatedThirty=content.replace(/(?:not|rather than|而不是|并不是|不是|不允许|而非|并非|非)\s*(?:30|三十)/gi,'')
 return {entity:/(?:Model|模型)\s*A/i.test(content),number:/(?:\b3\b|三)/.test(content),
  noAffirmativeThirty:!/(?:\b30\b|三十)/.test(withoutNegatedThirty),negation:/(?:not|no improvement|没有|未显示|未观察|并未|未发现)/i.test(content)}
}
export function aggregate(results) {
 const sums = {}
 for (const result of results) for (const [key,value] of Object.entries(result.metrics ?? {})) sums[key] = (sums[key] ?? 0) + value
 for (const key of HARD_METRICS) sums[key] ??= 0
 for (const [name,numerator,denominator] of [
  ['retrieval_hit_at_3','retrieval_hits','retrieval_total'], ['retrieval_mrr','retrieval_rr','retrieval_total'],
  ['answerable_success_rate','answerable_success','answerable_total'], ['unsupported_abstention_rate','abstention_success','abstention_total'],
  ['note_fidelity_pass_rate','note_fidelity_pass','note_fidelity_total']]) sums[name] = sums[denominator] ? sums[numerator]/sums[denominator] : null
 return sums
}
export function compareBaseline(current, baseline) {
 if (current.version !== baseline.version || current.datasetVersion !== baseline.datasetVersion || current.kind !== baseline.kind)
  throw Error('BASELINE_VERSION_MISMATCH')
 const changes = []
 if(current.results.length!==Object.keys(baseline.caseStatuses).length)throw Error('BASELINE_MATRIX_CHANGED')
 for (const [id,oldStatus] of Object.entries(baseline.caseStatuses)) {
  const now = current.results.find(r => r.id === id)?.status
  if (!now) throw Error('BASELINE_CASE_MISSING')
  changes.push({ name: id, change: now === oldStatus ? 'unchanged' : now === 'PASS' ? 'improved' : 'regressed' })
 }
 for (const key of HARD_METRICS) changes.push({ name:key, change: current.metrics[key] === baseline.metrics[key] ? 'unchanged' : current.metrics[key] < baseline.metrics[key] ? 'improved' : 'regressed' })
 for (const key of ['retrieval_hit_at_3','unsupported_abstention_rate','answerable_success_rate','note_fidelity_pass_rate']) {
  const delta = current.metrics[key] - baseline.metrics[key]
  changes.push({ name:key, change: Math.abs(delta) <= (key === 'retrieval_hit_at_3' ? 0.05 : 0) ? 'unchanged' : delta > 0 ? 'improved' : 'regressed' })
 }
 return { changes, regressed: changes.some(item => item.change === 'regressed') }
}
