import assert from 'node:assert/strict'
import test from 'node:test'
import { sourceIdForChunk } from './common/lib/knowledge-source-id.ts'

test('sourceId is deterministic and based only on a real positive safe chunk id', () => {
  assert.equal(sourceIdForChunk(123), 'SRC-CHUNK-123')
  assert.equal(sourceIdForChunk(123), sourceIdForChunk(123))
  assert(!sourceIdForChunk(123).includes('owner'))
  for (const invalid of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => sourceIdForChunk(invalid), /INVALID_CHUNK_ID/)
  }
})
