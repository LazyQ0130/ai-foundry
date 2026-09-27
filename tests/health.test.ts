import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from '../server/app.js'

test('health endpoint and safe errors', async () => {
  assert.equal((await request(app).get('/api/health')).body.data.status, 'ok')
  const missing = await request(app).get('/api/missing')
  assert.equal(missing.status, 404)
  assert.equal(missing.body.error.code, 'NOT_FOUND')
  assert.equal((await request(app).post('/api/missing').set('Origin', 'https://evil.example')).status, 403)
})
