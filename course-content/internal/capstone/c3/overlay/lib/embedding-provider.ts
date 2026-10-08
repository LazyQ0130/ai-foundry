import { createHash } from 'node:crypto'
import { EMBEDDING_DIMENSION, KnowledgeError, vectorLiteral } from './knowledge-core'

export type Embedding = { vector: number[]; model: string; dimension: number }
let failedOnce = false

function mockEmbedding(text: string): Embedding {
  const vector = Array<number>(EMBEDDING_DIMENSION).fill(0)
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [text]
  for (const token of tokens) {
    const hash = createHash('sha256').update(token).digest()
    vector[hash.readUInt32BE(0) % EMBEDDING_DIMENSION] += 1
  }
  const norm = Math.hypot(...vector) || 1
  return { vector: vector.map(value => value / norm), model: 'mock-embedding-v1', dimension: EMBEDDING_DIMENSION }
}

export async function embed(text: string, index?: number): Promise<Embedding> {
  if (!text.trim() || text.length > 1000) throw new KnowledgeError('EMBEDDING_FAILED')
  const mode = process.env.AI_EMBEDDING_MODE ?? 'mock'
  if (mode === 'mock') {
    if (index !== undefined && process.env.C3_EMBED_FAIL_AT === String(index)) throw new KnowledgeError('EMBEDDING_FAILED')
    if (!failedOnce && index !== undefined && process.env.C3_EMBED_FAIL_ONCE_AT === String(index)) {
      failedOnce = true
      throw new KnowledgeError('EMBEDDING_FAILED')
    }
    return mockEmbedding(text)
  }
  if (mode !== 'real') throw new KnowledgeError('EMBEDDING_FAILED')
  const base = process.env.AI_EMBEDDING_BASE_URL
  const key = process.env.AI_EMBEDDING_API_KEY
  const model = process.env.AI_EMBEDDING_MODEL ?? 'text-embedding-v4'
  if (!base || !key || process.env.AI_EMBEDDING_DIMENSION !== String(EMBEDDING_DIMENSION)) throw new KnowledgeError('EMBEDDING_FAILED')
  let url: URL
  try { url = new URL(base) } catch { throw new KnowledgeError('EMBEDDING_FAILED') }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) throw new KnowledgeError('EMBEDDING_FAILED')
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/embeddings`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: text, dimensions: EMBEDDING_DIMENSION, encoding_format: 'float' }),
      signal: AbortSignal.timeout(20_000),
    })
    if (!response.ok) { await response.body?.cancel(); throw new Error('provider') }
    const data = await response.json()
    const vector = data?.data?.[0]?.embedding
    vectorLiteral(vector)
    return { vector, model, dimension: EMBEDDING_DIMENSION }
  } catch { throw new KnowledgeError('EMBEDDING_FAILED') }
}
