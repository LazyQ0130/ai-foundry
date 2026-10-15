const statuses = new Set(['answered', 'insufficient'])
const categories = ['retrieval_miss', 'wrong_refusal', 'missing_refusal', 'unsupported_generation', 'citation_support_problem', 'provider_failure']
const automaticIssueTypes = ['retrieval_miss', 'wrong_refusal', 'missing_refusal', 'expected_citation_miss', 'provider_failure']

export function validateCases(value) {
  if (!Array.isArray(value) || value.length < 10 || value.length > 20) throw new Error('INVALID_EVAL_SET')
  const seen = new Set()
  let answerable = 0, insufficient = 0
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item) ||
        Object.keys(item).sort().join(',') !== 'expectedDocumentTitles,expectedStatus,id,question' ||
        typeof item.id !== 'string' || !/^[a-z][a-z0-9-]{1,39}$/.test(item.id) || seen.has(item.id) ||
        typeof item.question !== 'string' || !item.question.trim() || item.question.trim().length > 1000 ||
        !statuses.has(item.expectedStatus) || !Array.isArray(item.expectedDocumentTitles) ||
        !item.expectedDocumentTitles.every(title => typeof title === 'string' && title.trim() && title.length <= 100)) throw new Error('INVALID_EVAL_SET')
    if (item.expectedStatus === 'answered') {
      if (item.expectedDocumentTitles.length === 0) throw new Error('INVALID_EVAL_SET')
      answerable++
    } else {
      if (item.expectedDocumentTitles.length !== 0) throw new Error('INVALID_EVAL_SET')
      insufficient++
    }
    seen.add(item.id)
  }
  if (!answerable || !insufficient) throw new Error('INVALID_EVAL_SET')
  return value
}

const validNumber = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
const usageNumber = value => Number.isSafeInteger(value) && value >= 0 ? value : null
const validSourceId = value => typeof value === 'string' && /^SRC-CHUNK-[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value.slice('SRC-CHUNK-'.length)))
const sourceMetadata = value => value && typeof value.title === 'string' && value.title.trim() &&
  Number.isSafeInteger(value.position) && value.position >= 0 && typeof value.preview === 'string'

export function assessCase(testCase, httpStatus, body, wallMs) {
  const base = { id: testCase.id, question: testCase.question, expectedStatus: testCase.expectedStatus,
    expectedDocumentTitles: testCase.expectedDocumentTitles, httpStatus,
    actualStatus: null, retrievalTitles: [], sourceTitles: [], retrievalHit: false,
    statusMatch: false, expectedCitationHit: false, verifiedSources: false,
    answer: null, sources: [], matches: [], latencyMs: { embedding: null, retrieval: null, chat: null, total: null, wall: Math.round(wallMs) },
    usage: { embeddingTokens: null, chatTokens: null }, errorCategory: null, automaticIssues: [], contractIssue: null, supportReview: null, notes: '' }
  const invalid = contractIssue => ({ ...base, errorCategory: 'provider_failure', automaticIssues: ['provider_failure'], contractIssue })
  if (httpStatus !== 200 || !body || body.ok !== true || !statuses.has(body.status) ||
      typeof body.answer !== 'string' || !body.answer.trim() || !Array.isArray(body.matches) || !Array.isArray(body.sources)) {
    return invalid('http_or_response_shape')
  }
  const matches = body.matches
  const sources = body.sources
  if (matches.some(match => !validSourceId(match?.sourceId))) return invalid('candidate_source_id_required')
  if (matches.length > 3 || sources.length > 3 || !matches.every(sourceMetadata) ||
      !sources.every(source => validSourceId(source?.sourceId) && sourceMetadata(source))) {
    return invalid('citation_response_shape')
  }
  if (new Set(matches.map(match => match.sourceId)).size !== matches.length) return invalid('duplicate_candidate_source_id')
  if (new Set(sources.map(source => source.sourceId)).size !== sources.length) return invalid('duplicate_citation_source_id')
  const candidates = new Map(matches.map(match => [match.sourceId, match]))
  for (const source of sources) {
    const candidate = candidates.get(source.sourceId)
    if (!candidate) return invalid('source_not_in_retrieved_set')
    if (source.title !== candidate.title || source.position !== candidate.position || source.preview !== candidate.preview) return invalid('source_metadata_mismatch')
  }
  if ((body.status === 'answered' && sources.length === 0) || (body.status === 'insufficient' && sources.length !== 0)) return invalid('answer_status_sources')
  const verifiedSources = sources.length > 0
  const expected = new Set(testCase.expectedDocumentTitles)
  const retrievalHit = testCase.expectedStatus === 'answered' && matches.some(match => expected.has(match.title))
  const expectedCitationHit = testCase.expectedStatus === 'answered' && body.status === 'answered' && sources.some(source => expected.has(source.title))
  let errorCategory = null
  if (testCase.expectedStatus === 'answered' && !retrievalHit) errorCategory = 'retrieval_miss'
  else if (testCase.expectedStatus === 'answered' && body.status === 'insufficient') errorCategory = 'wrong_refusal'
  else if (testCase.expectedStatus === 'insufficient' && body.status === 'answered') errorCategory = 'missing_refusal'
  // Expected-document membership is machine-checkable; factual support still needs a human.
  const automaticIssues = errorCategory ? [errorCategory] : []
  if (testCase.expectedStatus === 'answered' && body.status === 'answered' && !expectedCitationHit) automaticIssues.push('expected_citation_miss')
  const latency = body.latencyMs && typeof body.latencyMs === 'object' ? body.latencyMs : {}
  const usage = body.usage && typeof body.usage === 'object' ? body.usage : {}
  return { ...base, actualStatus: body.status, retrievalTitles: matches.map(match => match.title), sourceTitles: sources.map(source => source.title),
    retrievalHit, statusMatch: body.status === testCase.expectedStatus, expectedCitationHit, verifiedSources,
    answer: body.answer, sources, matches,
    latencyMs: { embedding: validNumber(latency.embedding) ? latency.embedding : null,
      retrieval: validNumber(latency.retrieval) ? latency.retrieval : null,
      chat: validNumber(latency.chat) ? latency.chat : null, total: validNumber(latency.total) ? latency.total : null,
      wall: Math.round(wallMs) },
    usage: { embeddingTokens: usageNumber(usage.embeddingTokens), chatTokens: usageNumber(usage.chatTokens) }, errorCategory, automaticIssues }
}

export function summarize(cases) {
  const answerable = cases.filter(item => item.expectedStatus === 'answered')
  const noAnswer = cases.filter(item => item.expectedStatus === 'insufficient')
  const latencies = cases.map(item => item.latencyMs.total).filter(validNumber).sort((a, b) => a - b)
  const median = latencies.length ? (latencies[Math.floor((latencies.length - 1) / 2)] + latencies[Math.floor(latencies.length / 2)]) / 2 : null
  const sumKnown = key => cases.reduce((sum, item) => sum + (item.usage[key] ?? 0), 0)
  const knownCount = key => cases.filter(item => item.usage[key] !== null).length
  const failuresByCategory = Object.fromEntries(categories.map(category => [category, cases.filter(item => item.errorCategory === category).length]))
  const issues = item => item.automaticIssues ?? (automaticIssueTypes.includes(item.errorCategory) ? [item.errorCategory] : [])
  const automaticIssuesByType = Object.fromEntries(automaticIssueTypes.map(type => [type, cases.filter(item => issues(item).includes(type)).length]))
  return {
    caseCount: cases.length, answerableCount: answerable.length, noAnswerCount: noAnswer.length,
    answerableStatusMatch: answerable.filter(item => item.actualStatus === 'answered').length,
    noAnswerRefusal: noAnswer.filter(item => item.actualStatus === 'insufficient').length,
    expectedRetrievalHit: answerable.filter(item => item.retrievalHit).length,
    expectedCitationDocumentHit: answerable.filter(item => item.expectedCitationHit).length,
    verifiedSourceResponses: cases.filter(item => item.verifiedSources).length,
    medianTotalLatencyMs: median, maxTotalLatencyMs: latencies.length ? latencies.at(-1) : null,
    totalEmbeddingTokensKnown: knownCount('embeddingTokens') ? sumKnown('embeddingTokens') : null,
    totalChatTokensKnown: knownCount('chatTokens') ? sumKnown('chatTokens') : null,
    averageEmbeddingTokensPerCaseKnown: knownCount('embeddingTokens') ? sumKnown('embeddingTokens') / knownCount('embeddingTokens') : null,
    averageChatTokensPerCaseKnown: knownCount('chatTokens') ? sumKnown('chatTokens') / knownCount('chatTokens') : null,
    missingEmbeddingUsageCount: cases.length - knownCount('embeddingTokens'),
    missingChatUsageCount: cases.length - knownCount('chatTokens'),
    providerFailures: failuresByCategory.provider_failure, failuresByCategory,
    automaticFailureCaseCount: cases.filter(item => issues(item).length > 0).length, automaticIssuesByType,
    supportReview: { supported: cases.filter(item => item.supportReview === 'supported').length,
      unsupported: cases.filter(item => item.supportReview === 'unsupported').length,
      uncertain: cases.filter(item => item.supportReview === 'uncertain').length,
      pending: cases.filter(item => item.actualStatus === 'answered' && item.supportReview === null).length },
  }
}

export function reviewMarkdown(cases, { mode } = {}) {
  const quote = value => String(value ?? '').split(/\r?\n/).map(line => `> ${line}`).join('\n')
  return ['# Stage 3 RAG 人工 Citation Support 复核', '',
    ...(mode === 'mock' ? ['Mock 只验证流程：哈希向量不模拟语义，固定示例不代表真实回答；所有未命中与拒答失败仍保留，不按占位回答声称质量通过。', ''] : []),
    '逐条对照回答与实际引用片段。仅对 answered 选择 supported / unsupported / uncertain；需要时填写 unsupported_generation 或 citation_support_problem。保存于本机 `.runtime`，不要提交。', '',
    ...cases.map(item => [
      `## ${item.id}`, '', `问题：${item.question}`, '', `预期 / 实际：${item.expectedStatus} / ${item.actualStatus ?? 'provider_failure'}`,
      `自动检查问题：${item.automaticIssues?.length ? item.automaticIssues.join('、') : item.errorCategory ?? '未发现自动检查问题；仍须人工复核'}`,
      ...(item.contractIssue ? [`响应契约问题：${item.contractIssue}`] : []), '', '回答：', quote(item.answer ?? '请求失败，无回答'), '',
      '实际引用：', ...(item.sources.length ? item.sources.map(source => `- ${source.title} · Chunk ${source.position} · ${source.sourceId}\n${quote(source.preview)}`) : ['- 无']), '',
      '本次检索命中：', ...(item.matches.length ? item.matches.map(match => `- ${match.title} · Chunk ${match.position}\n${quote(match.preview)}`) : ['- 无']), '',
      `人工 Support： [${item.supportReview === 'supported' ? 'x' : ' '}] supported  [${item.supportReview === 'unsupported' ? 'x' : ' '}] unsupported  [${item.supportReview === 'uncertain' ? 'x' : ' '}] uncertain`,
      '错误分类补充：', `备注：${item.notes ?? ''}`, '',
    ].join('\n'))].join('\n')
}
