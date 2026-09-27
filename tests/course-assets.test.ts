import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { readFile, mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { app } from '../server/app.js'
import { env } from '../server/config/env.js'
import { db } from '../server/db.js'
import { createStarterZip, isStarterFile } from '../scripts/starter-package.js'

const endpoint = '/api/course-assets/stage1-starter'
test('Starter downloads allow active preview users, admin and revoked stage access but reject disabled users', async () => {
  const student = request.agent(app), admin = request.agent(app)
  const phone = `134${Date.now().toString().slice(-8)}`
  const id = (await student.post('/api/auth/register').set('Origin', env.APP_ORIGIN).send({ phone, password: 'asset-test-123', acceptedTerms: true }).expect(201)).body.data.user.id
  await admin.post('/api/auth/login').set('Origin', env.APP_ORIGIN).send({ phone: process.env.ADMIN_PHONE, password: process.env.ADMIN_INITIAL_PASSWORD }).expect(200)
  await request(app).get('/api/lessons/s1-l0').expect(200)
  await request(app).get(endpoint).expect(401)
  await request(app).head(endpoint).expect(401)
  await student.get(endpoint).expect(200)
  const grant = (stageSlug: string) => admin.post(`/api/admin/users/${id}/entitlements`).set('Origin', env.APP_ORIGIN).send({ stageSlug, source: 'TEST', note: '附件权限测试' })
  await grant('stage-2').expect(200)
  await student.get(endpoint).expect(200)
  await grant('stage-1').expect(200)
  for (const agent of [student, admin]) {
    const result = await agent.get(endpoint).buffer(true).parse((res, callback) => {
      const chunks: Buffer[] = []
      res.on('data', chunk => chunks.push(Buffer.from(chunk)))
      res.on('end', () => callback(null, Buffer.concat(chunks)))
      res.on('error', callback)
    }).expect(200)
    assert.equal(result.headers['content-type'], 'application/zip')
    assert.equal(result.headers['content-disposition'], 'attachment; filename="aifoundry-stage1-starter.zip"')
    assert.equal(result.headers['cache-control'], 'no-store')
    assert.deepEqual(result.body, await readFile('starter/aifoundry-stage1-starter.zip'))
    assert.ok(Object.keys(unzipSync(result.body)).length > 10)
  }
  for (const id of ['unknown', '__proto__', 'constructor', '%2e%2e%2f.env', '%2e%2e%5c.env', 'https%3A%2F%2Fevil.example']) {
    await admin.get(`/api/course-assets/${id}`).expect(404)
  }
  const withPath = await admin.get(`${endpoint}?path=../../.env`).expect(200)
  assert.equal(withPath.headers['content-type'], 'application/zip')
  await admin.delete(`/api/admin/users/${id}/entitlements/stage-1`).set('Origin', env.APP_ORIGIN).send({ note: '撤销测试' }).expect(200)
  await student.get(endpoint).expect(200)
  const info = await request(app).get(`${endpoint}/info`).expect(200)
  assert.deepEqual(Object.keys(info.body.data).sort(), ['bytes', 'format'])
  assert.equal(info.body.data.bytes, (await readFile('starter/aifoundry-stage1-starter.zip')).length)
  await db.user.update({where:{id},data:{status:'DISABLED'}})
  await student.get(endpoint).expect(401)
  await db.$disconnect()
})

test('Starter ZIP is current, extractable, contains only deliverable source under one folder', async () => {
  const zip = await readFile('starter/aifoundry-stage1-starter.zip')
  assert.deepEqual(zip, Buffer.from(await createStarterZip()), 'Rebuild Starter after editing its source')
  const files = unzipSync(zip)
  for (const [name, data] of Object.entries(files)) {
    assert.ok(name.startsWith('aifoundry-stage1-starter/'))
    const relative = name.slice('aifoundry-stage1-starter/'.length)
    assert.ok(isStarterFile(relative), name)
    assert.deepEqual(Buffer.from(data), await readFile(`starter/stage-1/${relative}`))
    if (relative !== '.gitignore') assert.ok(relative.split('/').every(part => !part.startsWith('.')), name)
    assert.doesNotMatch(name, /\.env|node_modules|\.git\/|\.next|\.\.|\\|course-content|\/docs\/|reference|\.test\.|\.spec\./)
  }
  assert.ok(files['aifoundry-stage1-starter/.gitignore'])
  const ignore = strFromU8(files['aifoundry-stage1-starter/.gitignore'])
  for (const rule of ['/node_modules', '/.next/', '/out/', '.DS_Store', '*.pem', 'npm-debug.log*', '.env*']) assert.ok(ignore.split(/\r?\n/).includes(rule))
  assert.doesNotMatch(strFromU8(files['aifoundry-stage1-starter/README.md']), /给课程作者的话|预留|可复现 Bug|1\.[235]/)
  const pkg = JSON.parse(strFromU8(files['aifoundry-stage1-starter/package.json']))
  assert.equal(pkg.name, 'personal-knowledge-workbench')
  assert.equal(isStarterFile('.gitignore'), true)
  for (const name of ['.env', '.env.local', '.env.production', '.secret', '.foo', '.git/config', 'Thumbs.db', 'node_modules/a.js', '.next/a.js', 'app/.gitignore', 'app/.env', 'app/a.log', 'app/.DS_Store', 'app/Thumbs.db', '../secret.ts', '/etc/passwd', 'app/../../.env', 'private.key', 'app/a.ts.bak', 'app/a.test.tsx', 'lib/a.spec.ts', 'app/__tests__/a.ts', 'components/tests/a.tsx', 'course-content/lesson.md', 'docs/test.ts']) assert.equal(isStarterFile(name), false, name)
})

test('Starter requires source .gitignore and excludes hidden/test files even when present', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'aifoundry-starter-allowlist-'))
  const put = async (name: string, content = 'fixture') => {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true })
    await writeFile(path.join(root, name), content)
  }
  for (const name of ['package.json', 'package-lock.json', 'README.md', 'app/page.tsx', 'components/ResourceCard.tsx', 'lib/resources.ts']) await put(name)
  await assert.rejects(createStarterZip(root), /Starter 缺少 \.gitignore/)
  await put('.gitignore', '/node_modules\n/.next/\n.env*\n')
  const forbidden = ['.git/config', '.env', '.env.local', '.env.production', '.secret', '.foo', 'Thumbs.db', 'node_modules/a.js', '.next/a.js', 'app/test.tmp', 'app/a.test.tsx', 'app/.gitignore', 'lib/__tests__/a.ts', 'course-content/internal/reference.ts', 'docs/notes.md']
  for (const name of forbidden) await put(name)
  const files = unzipSync(await createStarterZip(root))
  assert.equal(strFromU8(files['aifoundry-stage1-starter/.gitignore']), '/node_modules\n/.next/\n.env*\n')
  for (const name of forbidden) assert.equal(files[`aifoundry-stage1-starter/${name}`], undefined, name)
  assert.equal(Object.keys(files).length, 7)
  // Retain this small fixture; do not recursively delete user-machine files.
})
