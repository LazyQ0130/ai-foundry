import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const common = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lesson = existsSync(path.join(common, 'ai-limit-units.test.mjs')) ? common : path.dirname(common)
const allowed = [
  'ai-limit-units.test.mjs',
  'stream-units.test.mjs',
  'knowledge-units.test.mjs',
  'citation-units.test.mjs',
  'eval/rag-eval-core.test.mjs',
  'agent.test.mjs',
  'knowledge-agent.test.mjs',
  'approval-agent.test.mjs',
  'mcp-agent.test.mjs',
  'mcp-request-guard.test.mjs',
  'workflow-agent.test.mjs',
  'persistence-agent.test.mjs',
]
const files = allowed.map(name => path.join(lesson, name)).filter(existsSync)
if (!files.length) throw new Error('No Reference unit tests found for this lesson')
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], {
  cwd: common, stdio: 'inherit', windowsHide: true,
})
if (result.error) throw result.error
process.exitCode = result.status ?? 1
