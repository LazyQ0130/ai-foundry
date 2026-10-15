import { loadCourseEnv, ignored, fail, safeFailure } from './course-env.mjs'
import { constants, copyFileSync, lstatSync, mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
try {
  loadCourseEnv()
  ignored('.runtime/course-check-proof')
  if (!['mock', 'real'].includes(process.env.EVAL_MODE)) fail('EVAL_MODE_REQUIRED')
  if (process.env.EVAL_MODE === 'real' && process.env.EVAL_REAL_CONFIRM !== 'YES') fail('REAL_EVAL_CONFIRM_REQUIRED')
  // Preserve previous local evidence before the learner's runner can overwrite it.
  // Copy only; neither current reports nor an earlier archive are deleted/replaced.
  const runtime = path.resolve('.runtime'), history = path.join(runtime, 'stage3-eval-history')
  for (const directory of [runtime, history]) {
    const info = lstatSync(directory, { throwIfNoEntry: false })
    if (info && (info.isSymbolicLink() || !info.isDirectory())) fail('EVAL_REPORT_PATH_REQUIRED')
  }
  const reports = ['stage3-eval-report.json', 'stage3-eval-review.md'].filter(name => lstatSync(path.join(runtime, name), { throwIfNoEntry: false }))
  for (const name of reports) {
    const file = path.join(runtime, name)
    if (!lstatSync(file).isFile() || lstatSync(file).isSymbolicLink()) fail('EVAL_REPORT_PATH_REQUIRED')
    ignored(`.runtime/${name}`)
  }
  if (reports.length) {
    const relative = `.runtime/stage3-eval-history/${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`
    for (const name of reports) ignored(`${relative}/${name}`)
    mkdirSync(relative, { recursive: true, mode: 0o700 })
    for (const name of reports) copyFileSync(path.join(runtime, name), path.join(relative, name), constants.COPYFILE_EXCL)
    console.log(`PREVIOUS_REPORT_ARCHIVED: ${relative}; previous evidence only, not this run`)
  }
  await import('./rag-eval.mjs')
} catch (error) { safeFailure(error) }
