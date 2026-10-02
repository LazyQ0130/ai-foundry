import assert from 'node:assert/strict'
import test from 'node:test'
import { allowAiRequest } from './common/lib/request-work-budget.ts'
import { providerUnitLimit, reserveForProviderMode, reserveProviderUnits } from './common/lib/provider-work-budget.ts'

test('HTTP guard allows five requests in a minute, then rejects and resets', () => {
  const user = 91001
  for (let i = 0; i < 5; i++) assert.equal(allowAiRequest(user, 1000 + i), true)
  assert.equal(allowAiRequest(user, 1005), false)
  assert.equal(allowAiRequest(user, 61_004), true)
})

test('real Provider units reserve 1, 2 and 8 atomically', () => {
  assert.equal(providerUnitLimit, 10)
  assert.equal(reserveProviderUnits(91002, 1, 1000), true)
  assert.equal(reserveProviderUnits(91002, 2, 1000), true)
  assert.equal(reserveProviderUnits(91002, 8, 1000), false)
  assert.equal(reserveProviderUnits(91002, 7, 1000), true)
  assert.equal(reserveProviderUnits(91002, 1, 1000), false)
  assert.equal(reserveProviderUnits(91002, 8, 61_000), true)
})

test('Mock uses only HTTP guard and leaves real Provider units untouched', () => {
  assert.equal(reserveForProviderMode('mock', 91003, 8, 1000), true)
  assert.equal(reserveForProviderMode('real', 91003, 8, 1000), true)
  assert.equal(reserveForProviderMode('real', 91003, 2, 1000), true)
  assert.equal(reserveForProviderMode('real', 91003, 1, 1000), false)
  assert.throws(() => reserveProviderUnits(91004, 9, 1000), RangeError)
})
