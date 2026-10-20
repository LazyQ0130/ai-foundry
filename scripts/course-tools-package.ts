import { readFile } from 'node:fs/promises'
import { zipSync, type Zippable } from 'fflate'

export async function createCourseToolsZip(stage: 2 | 3 | 4) {
  // Exact list only: no credentials, completed app, fixtures, or author tests.
  const files = new Map<string, string>([
    ['scripts/course-env.mjs', 'course-tools/shared/course-env.mjs'],
    ['scripts/course-checks.mjs', 'course-tools/shared/course-checks.mjs'],
    ['README.md', `course-tools/stage-${stage}/README.md`],
  ])
  if (stage === 2) for (const name of ['fault-project.mjs', 'fault-proxy-core.mjs', 'fault-proxy.mjs']) files.set(`scripts/${name}`, `course-tools/stage-2/${name}`)
  if (stage === 3) files.set('scripts/run-rag-eval.mjs', 'course-tools/stage-3/run-rag-eval.mjs')
  if (stage === 4) for (const name of ['prepare-agent-eval.mjs', 'run-agent-eval.mjs', 'check-persisted-run.mjs']) files.set(`scripts/${name}`, `course-tools/stage-4/${name}`)
  const entries: Zippable = {}
  for (const [destination, source] of files) entries[`aifoundry-stage${stage}-tools/${destination}`] = [await readFile(source), { mtime: new Date(2020, 0, 1), level: 9 }]
  return zipSync(entries)
}
