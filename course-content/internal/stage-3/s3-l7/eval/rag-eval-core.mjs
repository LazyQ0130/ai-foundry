const statuses = new Set(['answered', 'insufficient'])
const categories = ['retrieval_miss', 'wrong_refusal', 'missing_refusal', 'unsupported_generation', 'citation_support_problem', 'provider_failure']

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

export function assessCase(testCase, httpStatus, body, wallMs) {
  const base = { id: testCase.id, question: testCase.question, expectedStatus: testCase.expectedStatus,
    expectedDocumentTitles: testCase.expectedDocumentTitles, httpStatus,
    actualStatus: null, retrievalTitles: [], sourceTitles: [], retrievalHit: false,
    statusMatch: false, expectedCitationHit: false, verifiedSources: false,
    answer: null, sources: [], matches: [], latencyMs: { embedding: null, retrieval: null, chat: null, total: null, wall: Math.round(wallMs) },
    usage: { embeddingTokens: null, chatTokens: null }, errorCategory: null, supportReview: null, notes: '' }
  if (httpStatus !== 200 || !body || body.ok !== true || !statuses.has(body.status) ||
      typeof body.answer !== 'string' || !body.answer.trim() || !Array.isArray(body.matches) || !Array.isArray(body.sources)) {
    return { ...base, errorCategory: 'provider_failure' }
  }
  const matches = body.matches
  const sources = body.sources
  if (!matches.every(m => m && typeof m.title === 'string' && Number.isInteger(m.position) && typeof m.preview === 'string') ||
      !sources.every(s => s && typeof s.sourceId === 'string' && typeof s.title === 'string' && Number.isInteger(s.position) && typeof s.preview === 'string')) {
    return { ...base, errorCategory: 'provider_failure' }
  }
  const verifiedSources = sources.every(source => matches.some(match =>
    source.title === match.title && source.position === match.position && source.preview === match.preview))
  if (!verifiedSources || (body.status === 'answered' && sources.length === 0) || (body.status === 'insufficient' && sources.length !== 0)) {
    return { ...base, errorCategory: 'provider_failure' }
  }
  const expected = new Set(testCase.expectedDocumentTitles)
  const retrievalHit = testCase.expectedStatus === 'answered' && matches.some(match => expected.has(match.title))
  const expectedCitationHit = testCase.expectedStatus === 'answered' && body.status === 'answered' && sources.some(source => expected.has(source.title))
  let errorCategory = null
  if (testCase.expectedStatus === 'answered' && !retrievalHit) errorCategory = 'retrieval_miss'
  else if (testCase.expectedStatus === 'answered' && body.status === 'insufficient') errorCategory = 'wrong_refusal'
  else if (testCase.expectedStatus === 'insufficient' && body.status === 'answered') errorCategory = 'missing_refusal'
  const latency = body.latencyMs && typeof body.latencyMs === 'object' ? body.latencyMs : {}
  const usage = body.usage && typeof body.usage === 'object' ? body.usage : {}
  return { ...base, actualStatus: body.status, retrievalTitles: matches.map(match => match.title), sourceTitles: sources.map(source => source.title),
    retrievalHit, statusMatch: body.status === testCase.expectedStatus, expectedCitationHit, verifiedSources,
    answer: body.answer, sources, matches,
    latencyMs: { embedding: validNumber(latency.embedding) ? latency.embedding : null,
      retrieval: validNumber(latency.retrieval) ? latency.retrieval : null,
      chat: validNumber(latency.chat) ? latency.chat : null, total: validNumber(latency.total) ? latency.total : null,
      wall: Math.round(wallMs) },
    usage: { embeddingTokens: usageNumber(usage.embeddingTokens), chatTokens: usageNumber(usage.chatTokens) }, errorCategory }
}

export function summarize(cases) {
  const answerable = cases.filter(item => item.expectedStatus === 'answered')
  const noAnswer = cases.filter(item => item.expectedStatus === 'insufficient')
  const latencies = cases.map(item => item.latencyMs.total).filter(validNumber).sort((a, b) => a - b)
  const median = latencies.length ? (latencies[Math.floor((latencies.length - 1) / 2)] + latencies[Math.floor(latencies.length / 2)]) / 2 : null
  const sumKnown = key => cases.reduce((sum, item) => sum + (item.usage[key] ?? 0), 0)
  const knownCount = key => cases.filter(item => item.usage[key] !== null).length
  const failuresByCategory = Object.fromEntries(categories.map(category => [category, cases.filter(item => item.errorCategory === category).length]))
  return {
    caseCount: cases.length, answerableCount: answerable.length, noAnswerCount: noAnswer.length,
    answerableStatusMatch: answerable.filter(item => item.actualStatus === 'answered').length,
    noAnswerRefusal: noAnswer.filter(item => item.actualStatus === 'insufficient').length,
    expectedRetrievalHit: answerable.filter(item => item.retrievalHit).length,
    expectedCitationDocumentHit: answerable.filter(item => item.expectedCitationHit).length,
    verifiedSourceResponses: cases.filter(item => item.verifiedSources).length,
    medianTotalLatencyMs: median, maxTotalLatencyMs: latencies.length ? latencies.at(-1) : null,
    totalEmbeddingTokensKnown: sumKnown('embeddingTokens'), totalChatTokensKnown: sumKnown('chatTokens'),
    averageEmbeddingTokensPerCaseKnown: knownCount('embeddingTokens') ? sumKnown('embeddingTokens') / knownCount('embeddingTokens') : null,
    averageChatTokensPerCaseKnown: knownCount('chatTokens') ? sumKnown('chatTokens') / knownCount('chatTokens') : null,
    missingEmbeddingUsageCount: cases.length - knownCount('embeddingTokens'),
    missingChatUsageCount: cases.length - knownCount('chatTokens'),
    providerFailures: failuresByCategory.provider_failure, failuresByCategory,
    supportReview: { supported: cases.filter(item => item.supportReview === 'supported').length,
      unsupported: cases.filter(item => item.supportReview === 'unsupported').length,
      uncertain: cases.filter(item => item.supportReview === 'uncertain').length,
      pending: cases.filter(item => item.actualStatus === 'answered' && item.supportReview === null).length },
  }
}

export function reviewMarkdown(cases) {
  const quote = value => String(value ?? '').split(/\r?\n/).map(line => `> ${line}`).join('\n')
  return ['# Stage 3 RAG 人工 Citation Support 复核', '',
    '逐条对照回答与实际引用片段。仅对 answered 选择 supported / unsupported / uncertain；需要时填写 unsupported_generation 或 citation_support_problem。保存于本机 `.runtime`，不要提交。', '',
    ...cases.map(item => [
      `## ${item.id}`, '', `问题：${item.question}`, '', `预期 / 实际：${item.expectedStatus} / ${item.actualStatus ?? 'provider_failure'}`,
      `自动错误分类：${item.errorCategory ?? '无'}`, '', '回答：', quote(item.answer ?? '请求失败，无回答'), '',
      '实际引用：', ...(item.sources.length ? item.sources.map(source => `- ${source.title} · Chunk ${source.position} · ${source.sourceId}\n${quote(source.preview)}`) : ['- 无']), '',
      '本次检索命中：', ...(item.matches.length ? item.matches.map(match => `- ${match.title} · Chunk ${match.position}\n${quote(match.preview)}`) : ['- 无']), '',
      `人工 Support： [${item.supportReview === 'supported' ? 'x' : ' '}] supported  [${item.supportReview === 'unsupported' ? 'x' : ' '}] unsupported  [${item.supportReview === 'uncertain' ? 'x' : ' '}] uncertain`,
      '错误分类补充：', `备注：${item.notes ?? ''}`, '',
    ].join('\n'))].join('\n')
}
