const openAlexHost = 'api.openalex.org'
const wikiHost = 'en.wikipedia.org'
const crossrefHost = 'api.crossref.org'

function boundedQuery(query) {
  if (typeof query !== 'string' || query.trim().length < 3 || query.length > 200) throw new Error('invalid_query')
  return query.trim()
}

export function normalizeOpenAlex(work) {
  if (!work || typeof work !== 'object' || !/^https:\/\/openalex\.org\/W\d+$/.test(work.id) || typeof work.title !== 'string') throw new Error('invalid_openalex_result')
  const doi = typeof work.doi === 'string' && /^https:\/\/doi\.org\/10\./.test(work.doi) ? work.doi : null
  return {
    sourceType: 'openalex', externalId: work.id, title: work.title.slice(0, 300),
    sourceUrl: doi ?? work.id, publishedYear: Number.isSafeInteger(work.publication_year) ? work.publication_year : null,
    excerpt: null, // Metadata alone is not evidence of a paper's findings.
  }
}

export function normalizeWikipedia(page) {
  if (!page || typeof page !== 'object' || !Number.isSafeInteger(page.id) || typeof page.title !== 'string' || typeof page.key !== 'string') throw new Error('invalid_wikipedia_result')
  return {
    sourceType: 'wikipedia', externalId: String(page.id), title: page.title.slice(0, 300),
    sourceUrl: `https://${wikiHost}/wiki/${encodeURIComponent(page.key)}`,
    excerpt: typeof page.description === 'string' ? page.description.slice(0, 500) : null,
  }
}

export function normalizeCrossref(work) {
  if (!work || typeof work !== 'object' || typeof work.DOI !== 'string' || !/^10\.\d{4,9}\/.+/.test(work.DOI) || !Array.isArray(work.title) || typeof work.title[0] !== 'string') throw new Error('invalid_crossref_result')
  return {
    sourceType: 'crossref', externalId: work.DOI, title: work.title[0].slice(0, 300),
    sourceUrl: `https://doi.org/${encodeURIComponent(work.DOI)}`, excerpt: null,
  }
}

export async function searchCrossref(query, fetcher = fetch) {
  const url = new URL(`https://${crossrefHost}/works`)
  url.searchParams.set('query', boundedQuery(query))
  url.searchParams.set('rows', '3')
  url.searchParams.set('select', 'DOI,title')
  const response = await fetcher(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'AIResearchWorkspacePhase2/0.1 (course spike)' } })
  if (!response.ok) throw new Error(`source_http_${response.status}`)
  const body = await response.json()
  if (!Array.isArray(body.message?.items) || body.message.items.length > 3) throw new Error('invalid_crossref_envelope')
  return body.message.items.map(normalizeCrossref)
}

export async function searchOpenAlex(query, fetcher = fetch) {
  const url = new URL(`https://${openAlexHost}/works`)
  url.searchParams.set('search', boundedQuery(query))
  url.searchParams.set('per_page', '3')
  url.searchParams.set('select', 'id,title,doi,publication_year')
  const response = await fetcher(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'AIResearchWorkspacePhase2/0.1 (course spike)' } })
  if (!response.ok) throw new Error(`source_http_${response.status}`)
  const body = await response.json()
  if (!Array.isArray(body.results) || body.results.length > 3) throw new Error('invalid_openalex_envelope')
  return body.results.map(normalizeOpenAlex)
}

export async function searchWikipedia(query, fetcher = fetch) {
  const url = new URL(`https://${wikiHost}/w/rest.php/v1/search/page`)
  url.searchParams.set('q', boundedQuery(query))
  url.searchParams.set('limit', '3')
  const response = await fetcher(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'AIResearchWorkspacePhase2/0.1 (course spike)' } })
  if (!response.ok) throw new Error(`source_http_${response.status}`)
  const body = await response.json()
  if (!Array.isArray(body.pages) || body.pages.length > 3) throw new Error('invalid_wikipedia_envelope')
  return body.pages.map(normalizeWikipedia)
}
