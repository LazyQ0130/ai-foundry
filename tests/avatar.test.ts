import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import sharp from 'sharp'
import { app } from '../server/app.js'
import { db } from '../server/db.js'
import { env } from '../server/config/env.js'
import { checkImageContainer } from '../src/lib/avatar.js'

test('avatar persistence, validation, isolation, replacement and reset', async () => {
  const agent = request.agent(app)
  const other = request.agent(app)
  const phone = `137${Date.now().toString().slice(-8)}`
  const credentials = { acceptedTerms: true, phone, password: 'avatar-test-password' }
  const origin = env.APP_ORIGIN
  const image = await sharp({ create: { width: 700, height: 550, channels: 3, background: '#2475eb' } }).webp().toBuffer()
  const put = (body: Buffer) => agent.put('/api/me/avatar').set('Origin', origin).set('Content-Type', 'image/webp').send(body)
  try {
    const registered = await agent.post('/api/auth/register').set('Origin', origin).send(credentials).expect(201)
    const id = registered.body.data.user.id
    await other.post('/api/auth/register').set('Origin', origin).send({ ...credentials, phone: `136${phone.slice(3)}` }).expect(201)
    await request(app).put('/api/me/avatar').set('Origin', origin).set('Content-Type', 'image/webp').send(image).expect(401)
    await request(app).get('/api/me/avatar?v=unknown').expect(401)
    await request(app).delete('/api/me/avatar').set('Origin', origin).expect(401)
    await agent.put('/api/me/avatar').set('Origin', 'https://evil.example').set('Content-Type', 'image/webp').send(image).expect(403)
    const saved = (await put(image).expect(200)).body.data
    assert.match(saved.avatarUrl, /^\/api\/me\/avatar\?v=/)
    assert.doesNotMatch(JSON.stringify(saved), /"data"|passwordHash|tokenHash/)
    const read = await agent.get(saved.avatarUrl).expect(200).expect('Content-Type', /image\/webp/).expect('Cache-Control', 'no-store')
    const meta = await sharp(read.body).metadata()
    assert.equal(meta.width, 512); assert.equal(meta.height, 512)
    assert.ok(read.body.length <= 300 * 1024)
    assert.equal(meta.exif, undefined)
    await other.get(saved.avatarUrl).expect(404)
    await other.delete('/api/me/avatar').set('Origin', origin).expect(200)
    await agent.get(saved.avatarUrl).expect(200)

    await put(Buffer.from('invalid')).expect(400)
    await put(Buffer.alloc(1024 * 1024 + 1)).expect(413)
    await agent.put('/api/me/avatar').set('Origin', origin).set('Content-Type', 'image/png').send(image).expect(415)
    const png = await sharp(image).png().toBuffer()
    await put(png).expect(400)
    await put(image.subarray(0, 24)).expect(400)
    const animated = await sharp(Buffer.from([255, 0, 0, 0, 255, 0]), { raw: { width: 1, height: 2, channels: 3, pageHeight: 1 } }).webp({ loop: 0, delay: [100, 100] }).toBuffer()
    assert.equal((await sharp(animated).metadata()).pages, 2)
    await put(animated).expect(400)
    const huge = await sharp({ create: { width: 5001, height: 5000, channels: 3, background: '#123456' } }).webp().toBuffer()
    await put(huge).expect(400)
    assert.equal((await agent.get('/api/me')).body.data.avatarUrl, saved.avatarUrl)
    assert.throws(() => checkImageContainer(Uint8Array.from(animated).buffer), /静态图片/)
    assert.throws(() => checkImageContainer(Uint8Array.from(Buffer.from('<svg/>')).buffer), /静态图片/)
    checkImageContainer(Uint8Array.from(png).buffer)

    const renamed = await agent.patch('/api/me').set('Origin', origin).send({ nickname: '  我的新昵称  ' }).expect(200)
    assert.equal(renamed.body.data.nickname, '我的新昵称')
    assert.equal(renamed.body.data.avatarUrl, saved.avatarUrl)
    await agent.patch('/api/me').set('Origin', origin).send({ nickname: '   ' }).expect(400)
    await agent.patch('/api/me').set('Origin', origin).send({ nickname: 'a'.repeat(51) }).expect(400)
    const replacement = (await put(image).expect(200)).body.data
    assert.notEqual(replacement.avatarUrl, saved.avatarUrl)
    assert.equal(replacement.nickname, '我的新昵称')
    assert.equal(await db.userAvatar.count({ where: { userId: id } }), 1)
    await agent.get(saved.avatarUrl).expect(404)
    await agent.post('/api/auth/logout').set('Origin', origin).expect(200)
    await agent.get(replacement.avatarUrl).expect(401)
    const login = await agent.post('/api/auth/login').set('Origin', origin).send(credentials).expect(200)
    assert.equal(login.body.data.user.avatarUrl, replacement.avatarUrl)
    await agent.get(replacement.avatarUrl).expect(200)
    const reset = await agent.delete('/api/me/avatar').set('Origin', origin).expect(200)
    assert.equal(reset.body.data.avatarUrl, null)
    assert.equal(reset.body.data.nickname, '我的新昵称')
    assert.equal(await db.userAvatar.count({ where: { userId: id } }), 0)
    await agent.get(replacement.avatarUrl).expect(404)
    await agent.delete('/api/me/avatar').set('Origin', origin).expect(200)
  } finally { await db.$disconnect() }
})
