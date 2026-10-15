import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { loadCourseEnv, project, projectRequire, ignored, fail, safeFailure } from './course-env.mjs'

const action = process.argv[2]
let db
try {
  loadCourseEnv()
  if (process.env.NODE_ENV === 'production') fail('PRODUCTION_REFUSED')
  const { PrismaClient } = projectRequire('@prisma/client')
  if (action === 'prepare') {
    if (process.argv[3] !== '--learning-db') fail('LEARNING_DATABASE_CONFIRM_REQUIRED')
    ignored('.runtime/course-check-proof')
    const output = path.join(project, '.runtime', 's2-l7-fault-demo')
    if (existsSync(output)) fail('DEMO_DIRECTORY_EXISTS')
    const migrations = readdirSync(path.join(project, 'prisma', 'migrations'), { withFileTypes: true }).filter(entry => entry.isDirectory())
    if (migrations.length !== 3) fail('THREE_MIGRATIONS_REQUIRED')
    if (/@@schema|\bschemas\s*=/.test(readFileSync(path.join(project, 'prisma/schema.prisma'), 'utf8'))) fail('SINGLE_SCHEMA_REQUIRED')
    for (const migration of migrations) {
      const sql = readFileSync(path.join(project, 'prisma/migrations', migration.name, 'migration.sql'), 'utf8')
      // Stage 2 generated migrations must use the connection's schema, not a hard-coded namespace.
      if (/\b(?:CREATE|ALTER|DROP)\s+(?:TABLE|INDEX|SCHEMA|DATABASE)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?(?:"[^"\n]+"|[A-Za-z_][\w]*)\s*\./i.test(sql) || /\b(?:CREATE|DROP|ALTER)\s+(?:SCHEMA|DATABASE)\b/i.test(sql) || /\bREFERENCES\s+(?:"[^"\n]+"|[A-Za-z_][\w]*)\s*\./i.test(sql)) fail('SCHEMA_QUALIFIED_MIGRATION_REFUSED')
    }
    const url = new URL(process.env.DATABASE_URL)
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) fail('POSTGRES_DATABASE_REQUIRED')
    const schema = `s2_l7_demo_${randomBytes(8).toString('hex')}`
    url.searchParams.set('schema', schema)
    try { db = new PrismaClient({ datasources: { db: { url: url.toString() } } }) }
    catch { fail('PRISMA_CLIENT_REQUIRED') }
    // Do not copy secrets, Git history, build caches, dependencies or symlinks.
    const skip = new Set(['.git', '.next', '.runtime', 'node_modules', 'dist', 'server-dist', '.shots', '.workbuddy', 'preview'])
    const allowed = /^(app|pages|src|components|lib|hooks|utils|styles|contexts|providers|services|data|assets|constants|config|public|prisma|scripts|tests|eval|types|package(?:-lock)?\.json|next-env\.d\.ts|next\.config\.[cm]?[jt]s|(?:middleware|instrumentation)\.[jt]s|tsconfig(?:\.[\w-]+)?\.json|prisma\.config\.[cm]?[jt]s|postcss\.config\.[cm]?[jt]s|tailwind\.config\.[cm]?[jt]s|\.gitignore)$/
    const unrecognized = readdirSync(project, { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !skip.has(entry.name) && entry.name !== 'docs' && !allowed.test(entry.name))
    if (unrecognized.length) {
      console.error(`Project folders needing review: ${unrecognized.map(entry => entry.name).join(', ')}`)
      fail('PROJECT_COPY_SCOPE_REQUIRED')
    }
    mkdirSync(output, { recursive: true })
    for (const entry of readdirSync(project, { withFileTypes: true })) {
      if (!allowed.test(entry.name) || entry.isSymbolicLink()) continue
      cpSync(path.join(project, entry.name), path.join(output, entry.name), { recursive: true, dereference: false, filter(source) {
        const name = path.basename(source)
        if (skip.has(name) || name.startsWith('.env') || /\.(log|tsbuildinfo|db|sqlite|pem|key)$/.test(name)) return false
        // Reject symlinks anywhere, so a copy cannot escape the source tree.
        return !requireStat(source).isSymbolicLink()
      } })
    }
    writeFileSync(path.join(output, '.env'), `DATABASE_URL=${JSON.stringify(url.toString())}\n`)
    writeFileSync(path.join(output, '.fault-demo.json'), JSON.stringify({ version: 1, schema }))
    writeFileSync(path.join(output, '.env.course-checks'), 'CHECK_BASE_URL=http://localhost:3007\n')
    // Only the new schema is passed to the CLI. Daily config remains untouched.
    const result = spawnSync(process.execPath, [projectRequire.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
      cwd: output, env: { ...process.env, DATABASE_URL: url.toString(), NODE_ENV: 'development' }, encoding: 'utf8', windowsHide: true,
    })
    if (result.status !== 0) {
      const code = (result.stderr + result.stdout).match(/\bP\d{4}\b/)?.[0]
      if (code) console.error(`Prisma ${code}`)
      fail('DEMO_MIGRATION_FAILED')
    }
    for (const table of ['User', 'Session', 'Resource']) {
      const rows = await db.$queryRawUnsafe(`SELECT count(*)::int AS count FROM "${schema}"."${table}"`)
      if (rows[0].count !== 0) fail('DEMO_NOT_EMPTY')
    }
    console.log(`PASS isolated-schema: ${schema}; User/Session/Resource = 0/0/0`)
    console.log('PASS prepare-fault-demo: .runtime/s2-l7-fault-demo (daily files untouched)')
  } else {
    const marker = JSON.parse(readFileSync(path.join(project, '.fault-demo.json'), 'utf8'))
    const url = new URL(process.env.DATABASE_URL)
    if (marker.version !== 1 || !/^s2_l7_demo_[a-f0-9]{16}$/.test(marker.schema) || url.searchParams.get('schema') !== marker.schema || path.basename(project) !== 's2-l7-fault-demo') fail('ISOLATED_DEMO_REQUIRED')
    db = new PrismaClient({ datasources: { db: { url: url.toString() } } })
    const schema = marker.schema
    const rows = await db.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_name IN ('Resource', 'Resource_fault_hold')`, schema)
    const names = rows.map(row => row.table_name)
    if (action === 'db-break' || action === 'db-restore') {
      if (names.length !== 1) fail('DEMO_TABLE_STATE_INVALID')
      const from = action === 'db-break' ? 'Resource' : 'Resource_fault_hold'
      const to = action === 'db-break' ? 'Resource_fault_hold' : 'Resource'
      if (names.includes(from)) await db.$executeRawUnsafe(`ALTER TABLE "${schema}"."${from}" RENAME TO "${to}"`)
      console.log(`PASS ${action}: only ${schema}; rows retained`)
    } else if (action === 'count') {
      const title = process.argv[3]
      if (!title || title.length > 100 || !names.includes('Resource')) fail('DEMO_TITLE_OR_RESTORE_REQUIRED')
      const found = await db.$queryRawUnsafe(`SELECT id, "ownerId" FROM "${schema}"."Resource" WHERE title = $1 ORDER BY id`, title)
      console.log(`FACT matching-title: ${found.length}; IDs: ${found.map(row => row.id).join(',') || 'none'}`)
      console.log('Count is evidence, not an automatic PASS: compare with the lesson expected value.')
    } else fail('DEMO_ACTION_REQUIRED')
  }
} catch (error) { safeFailure(error) }
finally { await db?.$disconnect() }

function requireStat(source) { return projectRequire('node:fs').lstatSync(source) }
