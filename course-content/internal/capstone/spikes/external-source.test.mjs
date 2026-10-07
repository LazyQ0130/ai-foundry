import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeCrossref, normalizeOpenAlex, normalizeWikipedia, searchCrossref, searchOpenAlex, searchWikipedia } from './external-source.mjs'

test('fixed scholarly adapter bounds query and rejects an extra or malformed response', async () => {
  let requested
  const fetcher = async url => {
    requested = url
    return { ok: true, json: async () => ({ results: [{ id: 'https://openalex.org/W123', title: 'A paper', doi: 'https://doi.org/10.1234/example', publication_year: 2024 }] }) }
  }
  const found = await searchOpenAlex('research methods', fetcher)
  assert.equal(requested.host, 'api.openalex.org')
  assert.equal(requested.searchParams.get('per_page'), '3')
  assert.equal(found[0].sourceType, 'openalex')
  assert.equal(found[0].excerpt, null)
  await assert.rejects(searchOpenAlex('x', fetcher), /invalid_query/)
  await assert.rejects(searchOpenAlex('research methods', async () => ({ ok: true, json: async () => ({ results: [{}] }) })), /invalid_openalex_result/)
  await assert.rejects(searchOpenAlex('research methods', async () => ({ ok: false, status: 503 })), /source_http_503/)
})

test('general source has distinct provenance and derives URL from a fixed host', async () => {
  const found = await searchWikipedia('research methods', async url => {
    assert.equal(url.host, 'en.wikipedia.org')
    return { ok: true, json: async () => ({ pages: [{ id: 12, key: 'Research_methods', title: 'Research methods', description: 'Overview' }] }) }
  })
  assert.equal(found[0].sourceType, 'wikipedia')
  assert.equal(found[0].sourceUrl, 'https://en.wikipedia.org/wiki/Research_methods')
  assert.throws(() => normalizeWikipedia({ id: '12', key: 'x', title: 'x' }), /invalid_wikipedia_result/)
  assert.throws(() => normalizeOpenAlex({ id: 'http://evil.invalid/W1', title: 'prompt injection' }), /invalid_openalex_result/)
})

test('Crossref maps DOI metadata to a bounded scholarly citation', async () => {
  const found = await searchCrossref('climate adaptation', async url => {
    assert.equal(url.host, 'api.crossref.org')
    return { ok: true, json: async () => ({ message: { items: [{ DOI: '10.1234/example', title: ['A paper'] }] } }) }
  })
  assert.equal(found[0].sourceType, 'crossref')
  assert.equal(found[0].excerpt, null)
  assert.throws(() => normalizeCrossref({ DOI: 'https://evil.invalid', title: ['x'] }), /invalid_crossref_result/)
})

test('low-frequency live read-only source check', { skip: process.env.CAPSTONE_LIVE_SOURCES !== '1' }, async () => {
  const [scholarly, general] = await Promise.all([searchCrossref('climate adaptation'), searchWikipedia('climate adaptation')])
  assert.ok(scholarly.length > 0)
  assert.ok(general.length > 0)
  assert.equal(scholarly[0].sourceType, 'crossref')
  assert.equal(general[0].sourceType, 'wikipedia')
})
