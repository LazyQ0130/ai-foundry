import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { setTimeout as pause } from 'node:timers/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assessCase, reviewMarkdown, summarize, validateCases } from '../eval/rag-eval-core.mjs'

const mode = process.env.EVAL_MODE
if (mode !== 'mock' && mode !== 'real') throw new Error('Set EVAL_MODE=mock or real')
if (mode === 'real' && process.env.EVAL_REAL_CONFIRM !== 'YES') throw new Error('Real evaluation requires EVAL_REAL_CONFIRM=YES')
for (const key of ['EVAL_BASE_URL', 'EVAL_USERNAME', 'EVAL_PASSWORD']) if (!process.env[key]) throw new Error(`Missing ${key}`)
const base = new URL(process.env.EVAL_BASE_URL)
if (base.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(base.hostname) || base.username || base.password || base.search || base.hash || base.pathname !== '/') throw new Error('EVAL_BASE_URL must be a local HTTP origin')
const interval = Number(process.env.EVAL_INTERVAL_MS ?? '13000')
if (!Number.isInteger(interval) || interval < 13000 || interval > 60000) throw new Error('EVAL_INTERVAL_MS must be 13000–60000')
const casesPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../eval/rag-cases.json')
const cases = validateCases(JSON.parse(await readFile(casesPath, 'utf8')))

const login = await fetch(new URL('/api/auth/login', base), { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: process.env.EVAL_USERNAME, password: process.env.EVAL_PASSWORD }), signal: AbortSignal.timeout(30000) })
if (!login.ok || !login.headers.get('set-cookie')) throw new Error('Local evaluation login failed')
const cookie = login.headers.get('set-cookie').split(';')[0]
await login.body?.cancel()
const results = []
for (let index = 0; index < cases.length; index++) {
  if (index > 0) await pause(interval)
  const testCase = cases[index]
  const started = performance.now()
  let status = null, body = null
  try {
    const response = await fetch(new URL('/api/knowledge/ask', base), { method: 'POST',
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: testCase.question }), signal: AbortSignal.timeout(35000) })
    status = response.status
    if (response.ok) {
      body = await response.json()
      if (body?.kind !== mode) { status = null; body = null }
    }
    else await response.body?.cancel()
  } catch { /* A network error is one provider_failure. Never retry. */ }
  const result = assessCase(testCase, status, body, performance.now() - started)
  results.push(result)
  process.stdout.write(`Case ${index + 1}/${cases.length}: ${testCase.id} ${result.errorCategory ?? 'recorded'}\n`)
}
const report = { runAt: new Date().toISOString(), mode, caseSet: 'rag-cases.json', cases: results, summary: summarize(results) }
const outputDir = path.resolve(process.cwd(), '.runtime')
await mkdir(outputDir, { recursive: true })
await writeFile(path.join(outputDir, 'stage3-eval-report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 })
await writeFile(path.join(outputDir, 'stage3-eval-review.md'), reviewMarkdown(results), { mode: 0o600 })
const summary = report.summary
process.stdout.write(JSON.stringify({ mode, caseCount: summary.caseCount,
  expectedRetrievalHit: `${summary.expectedRetrievalHit}/${summary.answerableCount}`,
  answerableStatusMatch: `${summary.answerableStatusMatch}/${summary.answerableCount}`,
  noAnswerRefusal: `${summary.noAnswerRefusal}/${summary.noAnswerCount}`,
  expectedCitationDocumentHit: `${summary.expectedCitationDocumentHit}/${summary.answerableCount}`,
  medianTotalLatencyMs: summary.medianTotalLatencyMs, maxTotalLatencyMs: summary.maxTotalLatencyMs,
  totalEmbeddingTokensKnown: summary.totalEmbeddingTokensKnown, totalChatTokensKnown: summary.totalChatTokensKnown,
  missingEmbeddingUsageCount: summary.missingEmbeddingUsageCount, missingChatUsageCount: summary.missingChatUsageCount,
  providerFailures: summary.providerFailures, failuresByCategory: summary.failuresByCategory,
  report: '.runtime/stage3-eval-report.json', review: '.runtime/stage3-eval-review.md' }) + '\n')
