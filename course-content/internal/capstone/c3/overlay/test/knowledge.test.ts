import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { chunkPages, citationKey, EMBEDDING_DIMENSION, fileKind, INDEXING_VERSION, KnowledgeError,
  MAX_CHUNKS, MAX_EXTRACTED_CHARS, searchInput, uploadInput, vectorLiteral } from '../lib/knowledge-core'
import { parseFile } from '../lib/knowledge-parser'
import { embed } from '../lib/embedding-provider'

const fixture = (name: string) => readFile(path.join(process.cwd(), 'test', 'fixtures', name))

test('strict UTF-8, type and empty input', async () => {
  const text = await parseFile(await fixture('valid.txt'), 'valid.txt', 'text/plain')
  assert.equal(text[0].page, null)
  assert.match(text[0].text, /Agent Memory/)
  const markdown = await parseFile(await fixture('valid.md'), 'valid.md', 'text/markdown')
  assert.match(markdown[0].text, /knowledge base/)
  await assert.rejects(parseFile(new Uint8Array([0xff]), 'bad.txt', 'text/plain'), { code: 'INVALID_FILE' })
  await assert.rejects(parseFile(await fixture('empty.txt'), 'empty.txt', 'text/plain'), { code: 'EMPTY_DOCUMENT' })
  assert.throws(() => fileKind('bad.pdf', 'text/plain'), { code: 'UNSUPPORTED_FILE_TYPE' })
  assert.equal(uploadInput.safeParse({ originalName: 'x.txt', title: 'x', mimeType: 'text/plain', byteSize: 1, workspaceId: 2 }).success, false)
  assert.equal(searchInput.safeParse({ query: 'q', ownerId: 1 }).success, false)
})

test('PDF page numbers and stable normalized offsets; broken and no-text PDF fail', async () => {
  const pages = await parseFile(await fixture('valid-two-page.pdf'), 'valid-two-page.pdf', 'application/pdf')
  assert.deepEqual(pages.map(page => page.page), [1, 2])
  assert.match(pages[0].text, /first page/)
  assert.match(pages[1].text, /second page/)
  const hash = 'source-hash'
  const chunks = chunkPages(pages, hash)
  assert.equal(chunks.length, 2)
  for (const chunk of chunks) assert.equal(pages[(chunk.page ?? 1) - 1].text.slice(chunk.startOffset, chunk.endOffset), chunk.content)
  await assert.rejects(parseFile(await fixture('broken.pdf'), 'broken.pdf', 'application/pdf'), (error: unknown) => error instanceof KnowledgeError && ['INVALID_FILE', 'PARSE_FAILED'].includes(error.code))
  await assert.rejects(parseFile(await fixture('scanned-or-no-text.pdf'), 'scanned-or-no-text.pdf', 'application/pdf'), { code: 'UNSUPPORTED_SCANNED_PDF' })
  await assert.rejects(parseFile(await fixture('encrypted.pdf'), 'encrypted.pdf', 'application/pdf'), { code: 'ENCRYPTED_PDF' })
})

test('bounded deterministic chunks, overlap, locator and citation identity', () => {
  const text = 'A'.repeat(1800)
  const chunks = chunkPages([{ page: null, text }], 'hash-a')
  assert.deepEqual(chunks.map(chunk => [chunk.startOffset, chunk.endOffset]), [[0, 800], [680, 1480], [1360, 1800]])
  assert.equal(chunks[0].content, text.slice(chunks[0].startOffset, chunks[0].endOffset))
  assert.equal(chunks[0].citationKey, citationKey('hash-a', INDEXING_VERSION, null, 0, 800, text.slice(0, 800)))
  assert.notEqual(chunks[0].citationKey, citationKey('hash-b', INDEXING_VERSION, null, 0, 800, text.slice(0, 800)))
  assert.notEqual(chunks[0].citationKey, citationKey('hash-a', 'new-version', null, 0, 800, text.slice(0, 800)))
  assert.throws(() => chunkPages([{ page: null, text: 'x'.repeat(MAX_EXTRACTED_CHARS + 1) }], 'hash'), { code: 'DOCUMENT_TOO_LARGE_TO_INDEX' })
  assert.ok(MAX_CHUNKS >= chunks.length)
})

test('mock embedding and vector input are 1024 dimensional', async () => {
  const value = await embed('private memory evidence')
  assert.equal(value.dimension, EMBEDDING_DIMENSION)
  assert.equal(value.model, 'mock-embedding-v1')
  assert.equal(value.vector.length, EMBEDDING_DIMENSION)
  assert.equal((await embed('private memory evidence')).vector.join(','), value.vector.join(','))
  assert.match(vectorLiteral(value.vector), /^\[/)
  assert.throws(() => vectorLiteral([0, 1]), { code: 'EMBEDDING_FAILED' })
})
