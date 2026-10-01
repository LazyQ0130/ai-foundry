import assert from 'node:assert/strict'
import test from 'node:test'
import { chunkKnowledgeText, KnowledgeLimitError } from './common/lib/knowledge-chunks.ts'
import { mockEmbedding } from './common/lib/knowledge-mock.ts'
import { embeddingDimension, vectorLiteral, InvalidKnowledgeVectorError } from './common/lib/knowledge-vector.ts'

test('paragraph-first chunking stays deterministic and bounded', () => {
  const input = '甲'.repeat(450) + '\n\n' + '乙'.repeat(450) + '\n\n' + '丙'.repeat(450)
  assert.deepEqual(chunkKnowledgeText(input), chunkKnowledgeText(input))
  assert.deepEqual(chunkKnowledgeText(input).map(part => part.length), [450, 450, 450])
  assert.deepEqual(chunkKnowledgeText('a'.repeat(1700)).map(part => part.length), [800, 800, 100])
  assert.throws(() => chunkKnowledgeText(Array(9).fill('a'.repeat(650)).join('\n\n')), KnowledgeLimitError)
  assert.throws(() => chunkKnowledgeText('a'.repeat(6001)), KnowledgeLimitError)
})

test('Mock Embedding is deterministic, 1024-dimensional and finite', () => {
  const vector = mockEmbedding('PostgreSQL 保存资料')
  assert.equal(vector.length, embeddingDimension)
  assert(vector.every(Number.isFinite))
  assert.deepEqual(vector, mockEmbedding('PostgreSQL 保存资料'))
  assert.notDeepEqual(vector, mockEmbedding('Git 记录版本'))
  assert.equal(typeof vectorLiteral(vector), 'string')
})

test('database boundary rejects wrong size and non-finite vectors', () => {
  for (const value of [null, [], [1, 2, 3], Array(1023).fill(1), Array(1025).fill(1),
    [...Array(1023).fill(1), NaN], [...Array(1023).fill(1), Infinity]]) {
    assert.throws(() => vectorLiteral(value), InvalidKnowledgeVectorError)
  }
})
