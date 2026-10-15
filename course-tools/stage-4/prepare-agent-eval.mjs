import { spawnSync } from 'node:child_process'
import { readdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { loadCourseEnv, agentDatabase, projectRequire, project, fail, safeFailure } from './course-env.mjs'

let db
try {
  loadCourseEnv()
  const target = agentDatabase()
  const adminUrl = new URL(target)
  adminUrl.pathname = '/postgres'
  const { PrismaClient } = projectRequire('@prisma/client')
  db = new PrismaClient({ datasources: { db: { url: adminUrl.toString() } } })
  const found = await db.$queryRaw`SELECT datname FROM pg_database WHERE datname = 'stage4_l7'`
  if (!found.length) {
    try { await db.$executeRawUnsafe('CREATE DATABASE stage4_l7') }
    catch (error) { if (error?.meta?.code !== '42P04') throw error }
  }
  await db.$disconnect(); db = undefined
  console.log('PASS test-database: 127.0.0.1:55433/stage4_l7 (created or already exists)')
  const migrations = readdirSync(path.join(project, 'prisma/migrations')).filter(name => /^\d+_/.test(name) && existsSync(path.join(project, 'prisma/migrations', name, 'migration.sql')))
  if (migrations.length !== 5) fail('FIVE_MIGRATIONS_REQUIRED')
  for (const action of ['deploy', 'status']) {
    const result = spawnSync(process.execPath, [path.join(project, 'node_modules/prisma/build/index.js'), 'migrate', action], {
      cwd: project, env: { ...process.env, DATABASE_URL: target }, encoding: 'utf8', windowsHide: true, timeout: 120000,
    })
    if (result.status !== 0) {
      const code = /\bP\d{4}\b/.exec(`${result.stdout}\n${result.stderr}`)?.[0] || 'PRISMA_EXECUTION_FAILED'
      console.error(`FAIL migration-${action}: ${code}`); fail('TEST_MIGRATION_FAILED')
    }
    console.log(`PASS migration-${action}: five migrations; daily DATABASE_URL file unchanged`)
  }
  console.log('PASS prepare-agent-eval — next: npm run build, then npm run eval:agent')
} catch (error) { safeFailure(error) }
finally { await db?.$disconnect() }
