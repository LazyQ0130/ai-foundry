import { createHash, randomBytes } from 'node:crypto'
import { loadCourseEnv, localOrigin, projectRequire, sessionCookie, fail, safeFailure } from './course-env.mjs'

const argv = process.argv.slice(2)
const known = ['resource-create', 'resource-patch', 'resource-crud', 'resource-db-failure', 'cookie', 'session', 'ui-session', 'ownership', 'origin', 'ai', 'production-origin']
let selected, productionUrl
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--case') selected = argv[++i]
  else if (argv[i] === '--url') productionUrl = argv[++i]
  else { console.error(`Usage: node scripts/course-checks.mjs --case ${known.join('|')} [--url https://your-app]`); process.exit(1) }
}

let db
try {
  if (!known.includes(selected)) fail('CHECK_CASE_REQUIRED')
  loadCourseEnv()
  let base
  if (selected === 'production-origin') {
    let url
    try { url = new URL(productionUrl) } catch { fail('PRODUCTION_HTTPS_ORIGIN_REQUIRED') }
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') fail('PRODUCTION_HTTPS_ORIGIN_REQUIRED')
    base = url.origin
  } else {
    if (productionUrl || process.env.NODE_ENV === 'production') fail('PRODUCTION_REFUSED')
    base = localOrigin(process.env.CHECK_BASE_URL || 'http://127.0.0.1:3000')
  }
  const tag = process.env.CHECK_TAG || '文章'
  async function request(method, route, cookie, body, origin) {
    const response = await fetch(base + route, { method, redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { ...(origin ? { Origin: origin } : {}), ...(cookie ? { Cookie: cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    let data
    try { data = await response.json() } catch { data = null }
    return { status: response.status, data, headers: response.headers }
  }
  function status(label, result, expected) {
    if (result.status !== expected) {
      console.error(`FAIL ${label}: HTTP ${result.status} (expected ${expected})`)
      fail('HTTP_ASSERTION_FAILED')
    }
    console.log(`PASS ${label}: HTTP ${expected}`)
  }
  async function user() {
    const username = `p1_${randomBytes(9).toString('hex')}`
    const password = randomBytes(24).toString('base64url')
    const result = await request('POST', '/api/auth/register', null, { username, password })
    status('fixture-register', result, 201)
    const cookie = sessionCookie(result.headers)
    const me = await request('GET', '/api/auth/me', cookie)
    status('fixture-me', me, 200)
    if (!Number.isInteger(me.data?.user?.id) || me.data.user.username !== username) fail('USER_CONTRACT_FAILED')
    return { username, password, cookie, id: me.data.user.id }
  }
  async function resources(cookie) {
    const result = await request('GET', '/api/resources', cookie)
    status('resource-list', result, 200)
    if (!Array.isArray(result.data?.resources)) fail('RESOURCE_LIST_CONTRACT_FAILED')
    return result.data.resources
  }
  if (selected === 'resource-db-failure') {
    // Use only the closed-port teaching target, never a daily or production DB.
    let target
    try { target = new URL(process.env.DATABASE_URL) } catch { fail('DATABASE_CONFIG_REQUIRED') }
    if (target.hostname !== '127.0.0.1' || target.port !== '65431' || target.pathname !== '/course_unreachable') fail('CLOSED_PORT_FIXTURE_REQUIRED')
    status('unreachable-get', await request('GET', '/api/resources'), 503)
    status('unreachable-post', await request('POST', '/api/resources', null, { title: 'Closed-port fixture', desc: 'Non-sensitive', tag }), 503)
  } else if (['resource-create', 'resource-patch', 'resource-crud'].includes(selected)) {
    // GET 401 aborts before any write if the learner already added authentication.
    const before = await resources()
    const body = { title: `HTTP-${randomBytes(8).toString('hex')}`, desc: 'Non-sensitive local fixture', tag, important: false }
    const created = await request('POST', '/api/resources', null, body)
    status('fixture-create', created, 201)
    const id = created.data?.resource?.id
    if (!Number.isSafeInteger(id) || id <= 0 || created.data.saved !== true || before.some(row => row.id === id)) fail('CREATE_CONTRACT_FAILED')
    console.log(`FACT newly-created-resource-id: ${id}; use this ID for the read-only database check`)
    function unchanged(previous, current) {
      if (JSON.stringify([...previous].sort((a, b) => a.id - b.id)) !== JSON.stringify([...current].sort((a, b) => a.id - b.id))) fail('UNEXPECTED_RESOURCE_CHANGE')
    }
    let saved = await resources()
    const own = saved.find(row => row.id === id)
    if (!own || own.title !== body.title || own.desc !== body.desc || own.tag !== body.tag || saved.length !== before.length + 1) fail('CREATE_GET_MISMATCH')
    for (const [name, bad] of Object.entries({ emptyTitle: { title: '   ' }, emptyDesc: { desc: ' ' }, badTag: { tag: '__not_a_course_tag__' }, wrongType: { title: 42 } })) {
      status(`invalid-create-${name}`, await request('POST', '/api/resources', null, { ...body, ...bad }), 400)
      unchanged(saved, await resources())
    }
    if (selected === 'resource-patch' || selected === 'resource-crud') {
      const changed = { ...body, title: `${body.title}-edited`, desc: 'Edited non-sensitive local fixture', important: true }
      const updated = await request('PATCH', `/api/resources/${id}`, null, changed)
      status('fixture-update', updated, 200)
      if (updated.data?.resource?.id !== id || ['title', 'desc', 'tag', 'important'].some(field => updated.data.resource[field] !== changed[field])) fail('UPDATE_CONTRACT_FAILED')
      saved = await resources()
      if (saved.filter(row => row.id === id).length !== 1 || !saved.some(row => row.id === id && ['title', 'desc', 'tag', 'important'].every(field => row[field] === changed[field]))) fail('UPDATE_GET_MISMATCH')
      unchanged(before, saved.filter(row => row.id !== id))
      const methods = selected === 'resource-crud' ? ['PATCH', 'DELETE'] : ['PATCH']
      for (const invalid of ['0', 'not-an-id', '1.5']) {
        for (const method of methods) status(`invalid-${method}-id`, await request(method, `/api/resources/${invalid}`, null, method === 'PATCH' ? changed : undefined), 400)
      }
      const missing = 2147483647
      if (saved.some(row => row.id === missing)) fail('MISSING_ID_FIXTURE_COLLISION')
      for (const method of methods) status(`missing-${method}-id`, await request(method, `/api/resources/${missing}`, null, method === 'PATCH' ? changed : undefined), 404)
      for (const [name, bad] of Object.entries({ emptyTitle: { title: ' ' }, emptyDesc: { desc: ' ' }, badTag: { tag: '__not_a_course_tag__' }, wrongImportant: { important: 'true' } })) {
        status(`invalid-update-${name}`, await request('PATCH', `/api/resources/${id}`, null, { ...changed, ...bad }), 400)
      }
      unchanged(saved, await resources())
      if (selected === 'resource-crud') {
        const deleted = await request('DELETE', `/api/resources/${id}`)
        status('fixture-delete', deleted, 200)
        if (deleted.data?.deletedId !== id) fail('DELETE_CONTRACT_FAILED')
        unchanged(before, await resources())
        console.log(`PASS single-fixture-delete: only new ID ${id}; existing records unchanged`)
      } else console.log(`PASS patch-fixture-retained: ID ${id}; no DELETE request, existing records unchanged`)
    } else console.log(`PASS fixture-retained: ID ${id}; no automatic cleanup or POST retry`)
  } else if (selected === 'production-origin') {
    // One unauthenticated request with no valid resource; never log in or seed production.
    status('production-origin-rejected', await request('POST', '/api/resources', null, {}, 'https://course.invalid'), 403)
  } else if (selected === 'cookie') {
    const alice = await user()
    status('me-without-cookie', await request('GET', '/api/auth/me'), 401)
    for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
      status(`resource-without-cookie-${method}`, await request(method, method === 'GET' || method === 'POST' ? '/api/resources' : '/api/resources/2147483647', null, method === 'POST' || method === 'PATCH' ? {} : undefined), 401)
    }
    status('me-with-cookie', await request('GET', '/api/auth/me', alice.cookie), 200)
    status('logout', await request('POST', '/api/auth/logout', alice.cookie), 200)
    status('old-cookie-after-logout', await request('GET', '/api/auth/me', alice.cookie), 401)
    status('old-cookie-resource-after-logout', await request('GET', '/api/resources', alice.cookie), 401)
  } else if (selected === 'ui-session') {
    const username = process.env.CHECK_UI_USERNAME
    if (!/^p1_expiry(?:_\d+)?$/.test(username ?? '')) fail('FRESH_UI_FIXTURE_REQUIRED')
    if (!process.env.DATABASE_URL) fail('DATABASE_CONFIG_REQUIRED')
    const { PrismaClient } = projectRequire('@prisma/client')
    db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
    const fixture = await db.user.findUnique({ where: { username } })
    if (!fixture || fixture.createdAt < new Date(Date.now() - 15 * 60000)) fail('FRESH_UI_FIXTURE_REQUIRED')
    const sessions = await db.session.findMany({ where: { userId: fixture.id, expiresAt: { gt: new Date() } }, take: 2 })
    if (sessions.length !== 1) fail('ONE_ACTIVE_FIXTURE_SESSION_REQUIRED')
    await db.session.update({ where: { id: sessions[0].id }, data: { expiresAt: new Date(Date.now() - 60000) } })
    console.log(`PASS ui-session: fixture Session id=${sessions[0].id} expired; click reload-list in that fixture browser and verify HTTP 401`)
    console.log('NOTE: UI clearing is not asserted by this command; observe it in the fixture browser.')
  } else if (selected === 'session') {
    const alice = await user()
    if (!process.env.DATABASE_URL) fail('DATABASE_CONFIG_REQUIRED')
    const { PrismaClient } = projectRequire('@prisma/client')
    db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
    const hash = createHash('sha256').update(alice.cookie.slice(alice.cookie.indexOf('=') + 1)).digest('hex')
    const session = await db.session.findUnique({ where: { tokenHash: hash }, include: { user: true } })
    // This proves the API and direct DB connection target the same new fixture.
    if (!session || session.userId !== alice.id || session.user.username !== alice.username) fail('API_DATABASE_MISMATCH')
    await db.session.update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() - 60000) } })
    status('expired-session-me', await request('GET', '/api/auth/me', alice.cookie), 401)
    status('expired-session-resources', await request('GET', '/api/resources', alice.cookie), 401)
    console.log('PASS expired-session: only the newly created fixture Session was changed')
  } else if (selected === 'ownership') {
    const alice = await user(), bob = await user()
    const records = []
    for (const owner of [alice, bob]) {
      const body = { title: `P1-${owner.username}`, desc: 'Non-sensitive local fixture', tag, important: false }
      const result = await request('POST', '/api/resources', owner.cookie, body)
      status('own-create', result, 201)
      if (!Number.isInteger(result.data?.resource?.id) || result.data.resource.ownerId !== owner.id) fail('RESOURCE_OWNER_CONTRACT_FAILED')
      records.push({ owner, id: result.data.resource.id, body })
    }
    for (const record of records) {
      const other = record.owner === alice ? bob : alice
      const own = await resources(record.owner.cookie), foreign = await resources(other.cookie)
      if (!own.some(row => row.id === record.id) || foreign.some(row => row.id === record.id)) fail('CROSS_USER_LIST_LEAK')
      status('cross-user-patch', await request('PATCH', `/api/resources/${record.id}`, other.cookie, { ...record.body, title: 'Forbidden change' }), 404)
      status('cross-user-delete', await request('DELETE', `/api/resources/${record.id}`, other.cookie), 404)
      const after = await resources(record.owner.cookie)
      if (!after.some(row => row.id === record.id && row.title === record.body.title && row.ownerId === record.owner.id)) fail('CROSS_USER_MUTATION')
    }
    if (!process.env.DATABASE_URL) fail('DATABASE_CONFIG_REQUIRED')
    const { PrismaClient } = projectRequire('@prisma/client')
    db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })
    for (const record of records) {
      const saved = await db.resource.findUnique({ where: { id: record.id } })
      if (!saved || saved.ownerId !== record.owner.id || saved.title !== record.body.title || saved.desc !== record.body.desc) fail('OWNERSHIP_DATABASE_FACT_FAILED')
    }
    console.log('PASS ownership-database: both new records and their content/owners verified by Prisma')
    console.log('PASS ownership: both fixture records still exist with unchanged owners and titles')
  } else if (selected === 'origin') {
    const alice = await user()
    const before = await resources(alice.cookie)
    const body = { title: 'Origin fixture', desc: 'Non-sensitive', tag }
    status('bad-origin-resource', await request('POST', '/api/resources', alice.cookie, body, 'https://course.invalid'), 403)
    const after = await resources(alice.cookie)
    if (after.length !== before.length) fail('BAD_ORIGIN_WROTE_RESOURCE')
    console.log('PASS bad-origin: resource count unchanged')
  } else if (selected === 'ai') {
    if (process.env.AI_PROVIDER_MODE !== 'mock') fail('MOCK_MODE_REQUIRED')
    const alice = await user()
    status('ai-without-cookie', await request('POST', '/api/ai/answer', null, { input: 'test' }), 401)
    status('ai-empty-input', await request('POST', '/api/ai/answer', alice.cookie, { input: '   ' }), 400)
    status('ai-too-long', await request('POST', '/api/ai/answer', alice.cookie, { input: 'x'.repeat(2001) }), 400)
    status('ai-bad-origin', await request('POST', '/api/ai/answer', alice.cookie, { input: 'test' }, 'https://course.invalid'), 403)
  }
  console.log(`PASS ${selected} — checks completed; no automatic retry or bulk cleanup`)
} catch (error) { safeFailure(error) }
finally { await db?.$disconnect() }
