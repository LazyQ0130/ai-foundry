import 'dotenv/config'
import { spawnSync } from 'node:child_process'

const url = new URL(process.env.DATABASE_URL!)
if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.port !== '55432') throw new Error('Local database helper expects localhost:55432')
const name = 'aifoundry-postgres-local'
function docker(args: string[]) {
  const result = spawnSync('docker', args, { stdio: 'inherit', windowsHide: true })
  if (result.status !== 0) throw new Error('Docker command failed')
}
const found = spawnSync('docker', ['container', 'inspect', name], { stdio: 'ignore', windowsHide: true })
if (found.status === 0) docker(['start', name])
else docker(['run', '-d', '--name', name, '--restart', 'unless-stopped', '-p', '127.0.0.1:55432:5432', '-e', `POSTGRES_USER=${decodeURIComponent(url.username)}`, '-e', `POSTGRES_PASSWORD=${decodeURIComponent(url.password)}`, '-e', `POSTGRES_DB=${url.pathname.slice(1)}`, '-v', 'aifoundry-postgres-data:/var/lib/postgresql/data', 'postgres:17-alpine'])
