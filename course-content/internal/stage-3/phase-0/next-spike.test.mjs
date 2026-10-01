import assert from 'node:assert/strict'

const url = 'http://127.0.0.1:43133/api/stream'
const start = Date.now()
const response = await fetch(url, { method: 'POST', body: JSON.stringify({ input: 'hello' }) })
assert.equal(response.status, 200)
const reader = response.body.getReader()
const first = new TextDecoder().decode((await reader.read()).value)
assert.equal(first, 'MOCK: first')
const second = new TextDecoder().decode((await reader.read()).value)
assert.equal(second, ' second')
assert(Date.now() - start >= 200)
assert.equal((await reader.read()).done, true)

const controller = new AbortController()
const cancelled = await fetch(url, { method: 'POST', body: JSON.stringify({ input: 'cancel' }), signal: controller.signal })
const cancelledReader = cancelled.body.getReader()
assert.equal(new TextDecoder().decode((await cancelledReader.read()).value), 'MOCK: first')
controller.abort()
await assert.rejects(cancelledReader.read())

const invalid = await fetch(url, { method: 'POST', body: JSON.stringify({ input: '' }) })
assert.equal(invalid.status, 400)
console.log(JSON.stringify({ status: 'pass', nextVersion: '15.5.26', firstChunk: first, secondChunk: second, cancelled: true, invalidInput: 400 }))
