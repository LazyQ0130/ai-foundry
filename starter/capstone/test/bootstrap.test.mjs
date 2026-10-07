import assert from 'node:assert/strict'
import test from 'node:test'

test('bootstrap provides an executable test command', () => {
  assert.equal(1 + 1, 2)
})
