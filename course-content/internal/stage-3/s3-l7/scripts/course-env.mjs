import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

export const project = process.cwd()
export const projectRequire = createRequire(path.join(project, 'package.json'))
export function fail(code) { throw new Error(code) }
export function loadCourseEnv() {
  if (!existsSync(path.join(project, 'package.json'))) fail('PROJECT_DIRECTORY_REQUIRED')
  projectRequire('@next/env').loadEnvConfig(project, true, { info() {}, error() {} })
  const config = path.join(project, '.env.course-checks')
  if (existsSync(config)) {
    ignored('.env.course-checks')
    const values = projectRequire('dotenv').parse(readFileSync(config))
    applyCheckValues(values)
  }
}
export function applyCheckValues(values) {
  for (const [key, value] of Object.entries(values)) {
    if (!/^(CHECK_BASE_URL|CHECK_TAG|CHECK_UI_USERNAME|EVAL_[A-Z_]+|TEST_DATABASE_URL|AGENT_EVAL_PORT)$/.test(key)) fail('UNSUPPORTED_CHECK_CONFIG_KEY')
    // A contradictory old terminal/file must not silently switch a paid run or DB target.
    if (process.env[key] !== undefined && process.env[key] !== value) fail('CHECK_CONFIG_CONFLICT')
  }
  for (const [key, value] of Object.entries(values)) process.env[key] = value
}
export function ignored(file) {
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', file], { cwd: project, stdio: 'ignore', windowsHide: true })
  const ignore = spawnSync('git', ['check-ignore', '--quiet', '--', file], { cwd: project, stdio: 'ignore', windowsHide: true })
  if (tracked.status === 0 || ignore.status !== 0) fail('GIT_IGNORE_REQUIRED')
}
export function localOrigin(value) {
  let url
  try { url = new URL(value) } catch { fail('LOCAL_URL_REQUIRED') }
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(url.hostname) || url.username || url.password || url.search || url.hash || url.pathname !== '/') fail('LOCAL_URL_REQUIRED')
  return url.origin
}
export function sessionCookie(headers) {
  // Require 32 random bytes, without imposing an undocumented application cookie name.
  const combined = headers.get('set-cookie')
  // Older fetch implementations combine headers. Split only before a cookie name,
  // never at the weekday comma inside Expires, and never borrow another cookie's flags.
  const lines = headers.getSetCookie?.() ?? (combined ? combined.split(/,(?=\s*[!#$%&'*+.^_`|~0-9A-Za-z-]+=)/) : [])
  const candidates = lines.filter(line => {
    const pair = line.trim().split(';')[0]
    const match = /^([!#$%&'*+.^_`|~0-9A-Za-z-]+)=([A-Za-z0-9_-]{43}|[a-fA-F0-9]{64})$/.exec(pair)
    return match && (match[2].length === 64 || Buffer.from(match[2], 'base64url').toString('base64url') === match[2])
  })
  if (candidates.length !== 1) fail('SESSION_COOKIE_CONTRACT_FAILED')
  const attributes = candidates[0].split(';').slice(1).map(value => value.trim().toLowerCase())
  if (!attributes.includes('httponly') || !attributes.includes('samesite=lax') || !attributes.includes('path=/')) fail('COOKIE_ATTRIBUTES_FAILED')
  return candidates[0].trim().split(';')[0]
}
export function agentDatabase() {
  if (process.env.NODE_ENV === 'production') fail('PRODUCTION_REFUSED')
  let url
  try { url = new URL(process.env.TEST_DATABASE_URL || process.env.DATABASE_URL) } catch { fail('DATABASE_CONFIG_REQUIRED') }
  if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.port !== '55433' || url.hash) fail('AGENT_TEST_DATABASE_REQUIRED')
  if (process.env.TEST_DATABASE_URL) {
    if (url.pathname !== '/stage4_l7') fail('AGENT_TEST_DATABASE_REQUIRED')
  } else {
    if (url.pathname !== '/stage4_learning') fail('AGENT_LEARNING_DATABASE_REQUIRED')
    url.pathname = '/stage4_l7'
  }
  if (url.searchParams.has('schema') && url.searchParams.get('schema') !== 'public') fail('PUBLIC_SCHEMA_REQUIRED')
  return url.toString()
}
export function safeFailure(error) {
  const code = /^[A-Z][A-Z0-9_]+$/.test(error?.message ?? '') ? error.message : 'CHECK_EXECUTION_FAILED'
  console.error(`FAIL ${code} — 按课程排障步骤检查；不要粘贴密码、Cookie 或连接串。`)
  process.exitCode = 1
}
