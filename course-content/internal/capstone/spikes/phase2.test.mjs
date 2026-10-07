import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import pg from 'pg'
import S3rver from 's3rver'

const here = path.dirname(fileURLToPath(import.meta.url))

function locator(documentId, version, page, text, startOffset, endOffset) {
  assert.ok(Number.isSafeInteger(page) && page > 0)
  assert.ok(startOffset >= 0 && endOffset > startOffset && endOffset <= text.length)
  const excerpt = text.slice(startOffset, endOffset)
  const citationKey = createHash('sha256').update(`${documentId}:${version}:${page}:${startOffset}:${endOffset}:${excerpt}`).digest('hex').slice(0, 24)
  return { page, startOffset, endOffset, citationKey, excerpt }
}

async function pdfPages(bytes) {
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
  const pdf = await task.promise
  const pages = []
  for (let number = 1; number <= pdf.numPages; number++) {
    const content = await (await pdf.getPage(number)).getTextContent()
    pages.push(content.items.map(item => item.str ?? '').join(' '))
  }
  await task.destroy()
  return pages
}

test('PDF, Markdown and TXT produce located text; empty PDF is unsupported without OCR', async () => {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  pdf.addPage().drawText('First page evidence', { x: 40, y: 700, font })
  pdf.addPage().drawText('Second page finding', { x: 40, y: 700, font })
  const pages = await pdfPages(await pdf.save())
  assert.equal(pages.length, 2)
  assert.match(pages[0], /First page evidence/)
  assert.match(pages[1], /Second page finding/)
  const found = pages[1].indexOf('page finding')
  const source = locator('doc-1', 1, 2, pages[1], found, found + 'page finding'.length)
  assert.equal(source.excerpt, 'page finding')
  assert.equal(source.citationKey, locator('doc-1', 1, 2, pages[1], found, found + 'page finding'.length).citationKey)
  assert.notEqual(source.citationKey, locator('doc-1', 2, 2, pages[1], found, found + 'page finding'.length).citationKey)
  for (const [kind, value] of [['md', '# Research\nSource text'], ['txt', 'Plain source text']]) {
    assert.equal(new TextDecoder('utf-8', { fatal: true }).decode(new TextEncoder().encode(value)), value, kind)
  }
  const blank = await PDFDocument.create()
  blank.addPage()
  assert.ok((await pdfPages(await blank.save())).every(page => !page.trim()))
  await assert.rejects(pdfPages(new Uint8Array([1, 2, 3])), /Invalid PDF|PDF/)
})

test('S3-compatible put/get works; emulator does not enforce private reads', async () => {
  const directory = path.join(here, '.runtime', randomUUID())
  mkdirSync(directory, { recursive: true })
  const server = new S3rver({ port: 45691, address: '127.0.0.1', directory, silent: true,
    configureBuckets: [{ name: 'private-research' }], resetOnClose: false })
  await server.run()
  try {
    const client = new S3Client({ region: 'us-east-1', endpoint: 'http://127.0.0.1:45691', forcePathStyle: true,
      credentials: { accessKeyId: 'S3RVER', secretAccessKey: 'S3RVER' } })
    const key = `workspace-1/${randomUUID()}.txt`
    await client.send(new PutObjectCommand({ Bucket: 'private-research', Key: key, Body: 'private evidence', ContentType: 'text/plain' }))
    const head = await client.send(new HeadObjectCommand({ Bucket: 'private-research', Key: key }))
    assert.equal(head.ContentType, 'text/plain')
    const object = await client.send(new GetObjectCommand({ Bucket: 'private-research', Key: key }))
    assert.equal(await object.Body.transformToString(), 'private evidence')
    const anonymous = await fetch(`http://127.0.0.1:45691/private-research/${key}`)
    // s3rver permits anonymous GET. This proves why it cannot close the private-upload gate.
    assert.equal(anonymous.status, 200)
    client.destroy()
  } finally {
    await server.close()
  }
})

test('LocalStack private bucket denies anonymous GET', { skip: process.env.CAPSTONE_LOCALSTACK_S3 !== '1' }, async () => {
  const endpoint = 'http://127.0.0.1:45692'
  const client = new S3Client({ region: 'us-east-1', endpoint, forcePathStyle: true,
    credentials: { accessKeyId: 'test', secretAccessKey: 'test' } })
  const bucket = `capstone-private-${randomUUID()}`
  const key = 'workspace-1/source.txt'
  try {
    await client.send(new CreateBucketCommand({ Bucket: bucket }))
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'private evidence', ContentType: 'text/plain' }))
    const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    assert.equal(await object.Body.transformToString(), 'private evidence')
    const response = await fetch(`${endpoint}/${bucket}/${key}`)
    assert.ok([401, 403].includes(response.status), `anonymous status ${response.status}`)
  } finally {
    client.destroy()
  }
})

test('Garage private bucket permits signed upload and denies anonymous read', { skip: process.env.CAPSTONE_GARAGE_S3 !== '1' }, async () => {
  const endpoint = 'http://127.0.0.1:3900'
  const client = new S3Client({ region: 'garage', endpoint, forcePathStyle: true,
    credentials: { accessKeyId: 'GK0123456789abcdef0123456789abcdef', secretAccessKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' } })
  const key = `workspace-1/${randomUUID()}.txt`
  try {
    await client.send(new PutObjectCommand({ Bucket: 'private-research', Key: key, Body: 'private evidence', ContentType: 'text/plain' }))
    const object = await client.send(new GetObjectCommand({ Bucket: 'private-research', Key: key }))
    assert.equal(await object.Body.transformToString(), 'private evidence')
    const response = await fetch(`${endpoint}/private-research/${key}`)
    assert.ok([401, 403].includes(response.status), `anonymous status ${response.status}`)
  } finally {
    client.destroy()
  }
})

test('PostgreSQL citation snapshot survives document deletion and pgvector is available', async () => {
  const connectionString = process.env.CAPSTONE_SPIKE_DATABASE_URL
  assert.ok(connectionString, 'Set CAPSTONE_SPIKE_DATABASE_URL to the isolated spike database')
  const client = new pg.Client({ connectionString })
  await client.connect()
  try {
    await client.query('CREATE EXTENSION IF NOT EXISTS vector')
    const version = await client.query("SELECT extversion FROM pg_extension WHERE extname = 'vector'")
    assert.ok(version.rows[0].extversion)
    await client.query('CREATE TABLE IF NOT EXISTS spike_document (id text PRIMARY KEY, title text NOT NULL)')
    await client.query('CREATE TABLE IF NOT EXISTS spike_chunk (id text PRIMARY KEY, document_id text NOT NULL REFERENCES spike_document(id) ON DELETE CASCADE, page integer NOT NULL, start_offset integer NOT NULL, end_offset integer NOT NULL, citation_key text NOT NULL UNIQUE, embedding vector(3))')
    await client.query('CREATE TABLE IF NOT EXISTS spike_citation (run_id text NOT NULL, citation_key text NOT NULL, chunk_id text REFERENCES spike_chunk(id) ON DELETE SET NULL, title text NOT NULL, excerpt text NOT NULL, page integer NOT NULL, start_offset integer NOT NULL, end_offset integer NOT NULL, PRIMARY KEY (run_id, citation_key))')
    const docId = randomUUID()
    const chunkId = randomUUID()
    const runId = randomUUID()
    const source = locator(docId, 1, 1, 'Traceable evidence remains', 0, 18)
    await client.query('INSERT INTO spike_document (id,title) VALUES ($1,$2)', [docId, 'Source PDF'])
    await client.query('INSERT INTO spike_chunk (id,document_id,page,start_offset,end_offset,citation_key,embedding) VALUES ($1,$2,$3,$4,$5,$6,$7::vector)', [chunkId, docId, source.page, source.startOffset, source.endOffset, source.citationKey, '[1,0,0]'])
    await client.query('INSERT INTO spike_citation (run_id,citation_key,chunk_id,title,excerpt,page,start_offset,end_offset) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [runId, source.citationKey, chunkId, 'Source PDF', source.excerpt, source.page, source.startOffset, source.endOffset])
    const vector = await client.query('SELECT id FROM spike_chunk ORDER BY embedding <=> $1::vector LIMIT 1', ['[1,0,0]'])
    assert.equal(vector.rows[0].id, chunkId)
    await client.query('DELETE FROM spike_document WHERE id=$1', [docId])
    const snapshot = await client.query('SELECT title, excerpt, page, start_offset, end_offset, chunk_id FROM spike_citation WHERE run_id=$1', [runId])
    assert.deepEqual(snapshot.rows[0], { title: 'Source PDF', excerpt: source.excerpt, page: 1, start_offset: 0, end_offset: 18, chunk_id: null })
  } finally {
    await client.end()
  }
})
