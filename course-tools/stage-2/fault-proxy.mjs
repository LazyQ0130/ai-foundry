import { readFileSync } from 'node:fs'
import { loadCourseEnv, project, fail, safeFailure } from './course-env.mjs'
import { faultProxy, modes } from './fault-proxy-core.mjs'
import path from 'node:path'

try {
  loadCourseEnv()
  if (process.env.NODE_ENV === 'production') fail('PRODUCTION_REFUSED')
  const marker = JSON.parse(readFileSync(path.join(project, '.fault-demo.json'), 'utf8'))
  if (marker.version !== 1 || !/^s2_l7_demo_[a-f0-9]{16}$/.test(marker.schema) || new URL(process.env.DATABASE_URL).searchParams.get('schema') !== marker.schema || path.basename(project) !== 's2-l7-fault-demo') fail('ISOLATED_DEMO_REQUIRED')
  const mode = process.argv[2]
  if (!modes.includes(mode) || process.argv.length !== 3) fail('DEMO_PROXY_MODE_REQUIRED')
  const server = faultProxy({ mode })
  server.on('error', error => safeFailure(new Error(error.code === 'EADDRINUSE' ? 'DEMO_PORT_BUSY' : 'DEMO_PROXY_FAILED')))
  server.listen(3007, '127.0.0.1', () => console.log(`READY fault-proxy ${mode}: http://localhost:3007 -> demo port 3008; Ctrl+C stops injection`))
  process.on('SIGINT', () => { server.stop(); process.exitCode = 0 })
  process.on('SIGTERM', () => { server.stop(); process.exitCode = 0 })
} catch (error) { safeFailure(error) }
