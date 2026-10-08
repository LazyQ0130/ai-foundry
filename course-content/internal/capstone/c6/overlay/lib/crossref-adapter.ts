import { doiSchema, doiUrl, externalInput, externalResultsSchema, type ExternalReferenceResult } from './external-contract'

export const UPSTREAM_TIMEOUT_MS = 8000
export const externalErrorCodes = ['EXTERNAL_RATE_LIMITED', 'EXTERNAL_TIMEOUT', 'EXTERNAL_UNAVAILABLE', 'EXTERNAL_INVALID_RESULT',
  'EXTERNAL_QUERY_REJECTED',
  'MCP_TIMEOUT', 'MCP_FAILED', 'MCP_INVALID_RESULT', 'MCP_TOOL_UNAVAILABLE', 'MCP_PROTOCOL_MISMATCH'] as const
export function safeExternalError(error: unknown) {
  const code = error instanceof Error ? error.message : ''
  return externalErrorCodes.find(item => item === code) ?? 'EXTERNAL_UNAVAILABLE'
}

// Conservative JATS subset. Reject attributes, unknown entities/tags and unbalanced markup.
// React renders the resulting string as text; no raw HTML is retained.
export function normalizeAbstract(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 16_000 || /<!|<\?|[\u0000-\u0008]/.test(raw)) return null
  const stack: string[] = []
  let invalid = false
  const plain = raw.replace(/<([^>]+)>/g, (_, token: string) => {
    const match = /^(\/?)(?:jats:)?(p|title|abstract|sec|italic|bold|sup|sub|xref|ext-link)(\/?)$/.exec(token.trim())
    if (!match) { invalid = true; return '' }
    if (match[1]) { if (stack.pop() !== match[2]) invalid = true }
    else if (!match[3]) stack.push(match[2])
    return ' '
  }).replace(/&(amp|lt|gt|quot|apos);/g, (_, entity: string) =>
    ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[entity]!)
  if (invalid || stack.length || /<[^>]*>|&[A-Za-z#][^\s;]*;/.test(plain)) return null
  const text = plain.replace(/\s+/g, ' ').trim()
  if (text.length < 20) return null
  return text.slice(0, 1600)
}

export function normalizeCrossref(raw: unknown): ExternalReferenceResult[] {
  if (!raw || typeof raw !== 'object') throw new Error('EXTERNAL_INVALID_RESULT')
  const items = (raw as { message?: { items?: unknown } }).message?.items
  if (!Array.isArray(items) || items.length > 3) throw new Error('EXTERNAL_INVALID_RESULT')
  const results: ExternalReferenceResult[] = []
  for (const value of items) {
    if (!value || typeof value !== 'object') continue
    const item = value as { DOI?: unknown; title?: unknown; abstract?: unknown; published?: { 'date-parts'?: unknown } }
    const doi = doiSchema.safeParse(typeof item.DOI === 'string' ? item.DOI.toLowerCase() : item.DOI)
    const title = Array.isArray(item.title) && typeof item.title[0] === 'string' ? item.title[0].trim() : ''
    if (!doi.success || !title || title.length > 300 || /[<>\u0000]/.test(title)) continue
    const dates = item.published?.['date-parts']
    const year = Array.isArray(dates) && Array.isArray(dates[0]) ? dates[0][0] : null
    const evidenceText = normalizeAbstract(item.abstract)
    results.push({ sourceType: 'CROSSREF', externalId: doi.data, title, sourceUrl: doiUrl(doi.data),
      publishedYear: Number.isInteger(year) && year >= 1500 && year <= 2200 ? year : null,
      supportLevel: evidenceText ? 'CLAIM_EVIDENCE' : 'REFERENCE_METADATA', evidenceText })
  }
  return externalResultsSchema.parse(results)
}

export async function searchCrossref(input: { query: string }, signal?: AbortSignal, fetcher: typeof fetch = fetch) {
  const { query } = externalInput.parse(input)
  const url = new URL('https://api.crossref.org/works')
  url.searchParams.set('query', query); url.searchParams.set('rows', '3')
  url.searchParams.set('filter', 'has-abstract:true')
  // select combined with abstract returned HTTP 500 in author validation; use bounded full records.
  if (process.env.CROSSREF_MAILTO) url.searchParams.set('mailto', process.env.CROSSREF_MAILTO)
  const timeout = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
  try {
    const response = await fetcher(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      redirect: 'error', headers: { Accept: 'application/json', 'User-Agent': 'AI-Foundry-C6/1.0' } })
    if (!response.ok) { await response.body?.cancel(); throw new Error(response.status === 429 ? 'EXTERNAL_RATE_LIMITED' : 'EXTERNAL_UNAVAILABLE') }
    const reader = response.body?.getReader()
    if (!reader) throw new Error('EXTERNAL_INVALID_RESULT')
    let length = 0; const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      length += value.length
      if (length > 250_000) { await reader.cancel(); throw new Error('EXTERNAL_INVALID_RESULT') }
      chunks.push(value)
    }
    let raw: unknown
    try { raw = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new Error('EXTERNAL_INVALID_RESULT') }
    return normalizeCrossref(raw)
  } catch (error) {
    if (signal?.aborted) throw new Error('CANCELLED')
    if (timeout.aborted) throw new Error('EXTERNAL_TIMEOUT')
    throw new Error(safeExternalError(error))
  }
}
