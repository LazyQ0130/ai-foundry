import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { loadCourseEnv, ignored, agentDatabase, project, fail, safeFailure } from './course-env.mjs'
try {
  loadCourseEnv()
  ignored('.runtime/course-check-proof')
  const target = agentDatabase()
  const args = process.argv.slice(2)
  // Pass arguments directly to Node, never through a command shell.
  const result = spawnSync(process.execPath, ['--import', 'tsx', path.join(project, 'eval/stage4-agent-eval.mjs'), ...args], {
    cwd: project, env: { ...process.env, TEST_DATABASE_URL: target }, stdio: 'inherit', windowsHide: true,
  })
  if (result.error) fail('EVAL_START_FAILED')
  process.exitCode = result.status ?? 1
} catch (error) { safeFailure(error) }
