import 'dotenv/config'
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
const url = new URL(process.env.DATABASE_URL!)
// Separate schema: tests never reset, delete or overwrite production/user tables.
url.searchParams.set('schema', 'aifoundry_test')
const environment = { ...process.env, DATABASE_URL: url.toString(), NODE_ENV: 'test' }
function run(args: string[]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: environment, windowsHide: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
run(['node_modules/prisma/build/index.js', 'migrate', 'deploy'])
run(['--import', 'tsx', 'prisma/seed.ts'])
run(['--import', 'tsx', '--test', '--test-concurrency=1', ...readdirSync('tests').filter((p) => p.endsWith('.test.ts')).map((p) => `tests/${p}`)])
