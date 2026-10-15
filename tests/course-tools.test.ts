import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { unzipSync } from 'fflate'
import { createCourseToolsZip } from '../scripts/course-tools-package.js'

test('session checks accept learner cookie names and both 32-byte encodings, but reject unsafe attributes and ambiguity', async () => {
  const { sessionCookie } = await import(new URL('../course-tools/shared/course-env.mjs', import.meta.url).href)
  const { randomBytes } = await import('node:crypto')
  const token = randomBytes(32).toString('base64url'), hex = randomBytes(32).toString('hex')
  const headers = (...values: string[]) => { const result = new Headers(); for (const value of values) result.append('set-cookie', value); return result }
  assert.equal(sessionCookie(headers(`workbench_session=${token}; HttpOnly; SameSite=Lax; Path=/; Expires=Wed, 14 Oct 2026 12:00:00 GMT`)), `workbench_session=${token}`)
  assert.equal(sessionCookie(headers(`my_session=${hex}; Path=/; SameSite=Lax; HttpOnly`)), `my_session=${hex}`)
  for (const attributes of ['SameSite=Lax; Path=/', 'HttpOnly; SameSite=None; Path=/', 'HttpOnly; SameSite=Lax; Path=/other', 'HttpOnly=no; SameSite=Lax; Path=/']) {
    assert.throws(() => sessionCookie(headers(`session=${token}; ${attributes}`)), /COOKIE_ATTRIBUTES_FAILED/)
  }
  assert.throws(() => sessionCookie(headers('session=short; HttpOnly; SameSite=Lax; Path=/')), /SESSION_COOKIE_CONTRACT_FAILED/)
  assert.throws(() => sessionCookie(headers(`one=${token}; HttpOnly; SameSite=Lax; Path=/`, `two=${hex}; HttpOnly; SameSite=Lax; Path=/`)), /SESSION_COOKIE_CONTRACT_FAILED/)
  const legacy = { get: () => `session=${token}; SameSite=Lax; Path=/; Expires=Wed, 14 Oct 2026 12:00:00 GMT, csrf=short; HttpOnly; SameSite=Lax; Path=/` }
  assert.throws(() => sessionCookie(legacy), /COOKIE_ATTRIBUTES_FAILED/)
})

test('course tools packages contain only their exact script/README allowlists and match delivery bytes', async () => {
  for (const stage of [2, 3, 4] as const) {
    const source = await createCourseToolsZip(stage)
    assert.deepEqual(Buffer.from(source), await readFile(`course-tools/aifoundry-stage${stage}-tools.zip`))
    const files = unzipSync(source), prefix = `aifoundry-stage${stage}-tools/`
    const expected = ['README.md', 'scripts/course-env.mjs', 'scripts/course-checks.mjs', ...(stage === 2 ? ['scripts/fault-project.mjs', 'scripts/fault-proxy-core.mjs', 'scripts/fault-proxy.mjs'] : stage === 3 ? ['scripts/run-rag-eval.mjs'] : ['scripts/prepare-agent-eval.mjs', 'scripts/run-agent-eval.mjs'])]
    assert.deepEqual(Object.keys(files).map(name => name.slice(prefix.length)).sort(), expected.sort())
    for (const name of Object.keys(files)) {
      assert.ok(name.startsWith(prefix))
      assert.doesNotMatch(name, /\.env|\.runtime|node_modules|\.next|\.test\.|prisma|app\/|eval\//)
    }
  }
})

test('learner command guards refuse remote HTTP targets and wrong Agent DBs while preserving encoded credentials', async () => {
  // The helper module is plain JS and does not load any project config until explicitly called.
  const { localOrigin, agentDatabase } = await import(new URL('../course-tools/shared/course-env.mjs', import.meta.url).href)
  assert.equal(localOrigin('http://127.0.0.1:3001'), 'http://127.0.0.1:3001')
  for (const url of ['https://127.0.0.1:3000', 'http://example.com', 'http://user:pass@localhost', 'http://localhost/api', 'http://localhost?token=x', 'http://localhost#secret']) assert.throws(() => localOrigin(url))
  const saved = Object.fromEntries(['DATABASE_URL', 'TEST_DATABASE_URL', 'NODE_ENV'].map(key => [key, process.env[key]]))
  try {
    process.env.NODE_ENV = 'test'
    delete process.env.TEST_DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://postgres:p%40ss%23%27@127.0.0.1:55433/stage4_learning?schema=public'
    const target = new URL(agentDatabase())
    assert.equal(target.pathname, '/stage4_l7')
    assert.equal(target.password, 'p%40ss%23%27')
    assert.equal(target.search, '?schema=public')
    assert.ok(process.env.DATABASE_URL.endsWith('/stage4_learning?schema=public'))
    for (const value of ['postgresql://a:b@host:55433/stage4_l7', 'postgresql://a:b@127.0.0.1:5432/stage4_l7', 'postgresql://a:b@127.0.0.1:55433/stage4_learning', 'postgresql://a:b@127.0.0.1:55433/stage4_l7?schema=production']) {
      process.env.TEST_DATABASE_URL = value
      assert.throws(() => agentDatabase())
    }
    process.env.TEST_DATABASE_URL = 'postgresql://a:b@127.0.0.1:55433/stage4_l7'
    process.env.NODE_ENV = 'production'
    assert.throws(() => agentDatabase())
  } finally {
    for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value }
  }
})

test('conflicting check files cannot silently enable paid eval or override production settings', async () => {
  const { applyCheckValues } = await import(new URL('../course-tools/shared/course-env.mjs', import.meta.url).href)
  const saved = { EVAL_MODE: process.env.EVAL_MODE, EVAL_REAL_CONFIRM: process.env.EVAL_REAL_CONFIRM }
  try {
    process.env.EVAL_MODE = 'mock'
    process.env.EVAL_REAL_CONFIRM = 'NO'
    assert.throws(() => applyCheckValues({ EVAL_REAL_CONFIRM: 'YES', EVAL_MODE: 'real' }), /CHECK_CONFIG_CONFLICT/)
    assert.equal(process.env.EVAL_REAL_CONFIRM, 'NO')
    assert.equal(process.env.EVAL_MODE, 'mock')
    assert.throws(() => applyCheckValues({ NODE_ENV: 'production' }), /UNSUPPORTED_CHECK_CONFIG_KEY/)
    assert.throws(() => applyCheckValues({ DATABASE_URL: 'postgresql://unexpected' }), /UNSUPPORTED_CHECK_CONFIG_KEY/)
    applyCheckValues({ EVAL_MODE: 'mock', EVAL_REAL_CONFIRM: 'NO' })
    assert.equal(process.env.EVAL_MODE, 'mock')
  } finally {
    for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value }
  }
})
