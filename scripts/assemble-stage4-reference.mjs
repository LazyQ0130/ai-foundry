import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [lessonNumber, variant, outputArg] = process.argv.slice(2)
if (!['1', '2', '3', '4', '5', '6', '7', '8'].includes(lessonNumber) || !['a', 'b'].includes(variant) || !outputArg) {
  throw new Error('Usage: node scripts/assemble-stage4-reference.mjs <1|2|3|4|5|6|7|8> <a|b> <new .runtime directory>')
}
const runtime = path.join(root, '.runtime')
const output = path.resolve(root, outputArg)
if (!output.startsWith(runtime + path.sep) || existsSync(output)) throw new Error('Use a new directory inside .runtime; existing files are never replaced')
const lesson = path.join(root, 'course-content/internal/stage-4/s4-l1')
const nextLesson = path.join(root, 'course-content/internal/stage-4/s4-l2')
const thirdLesson = path.join(root, 'course-content/internal/stage-4/s4-l3')
const fourthLesson = path.join(root, 'course-content/internal/stage-4/s4-l4')
const fifthLesson = path.join(root, 'course-content/internal/stage-4/s4-l5')
const sixthLesson = path.join(root, 'course-content/internal/stage-4/s4-l6')
const seventhLesson = path.join(root, 'course-content/internal/stage-4/s4-l7')
const eighthLesson = path.join(root, 'course-content/internal/stage-4/s4-l8')
const prior = path.join(root, 'course-content/internal/stage-3/s3-l7')
const skip = new Set(['node_modules', '.next', '.runtime', '.git', 'tsconfig.tsbuildinfo'])

function copyTree(source, target) {
  if (!existsSync(source)) return
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (skip.has(entry.name) || (entry.name.startsWith('.env') && entry.name !== '.env.example') || entry.name.endsWith('.log')) continue
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${path.join(source, entry.name)}`)
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyTree(from, to)
    else if (entry.isFile()) copyFileSync(from, to)
  }
}

mkdirSync(output, { recursive: true })
copyTree(path.join(root, 'starter/stage-4'), output)
copyTree(path.join(prior, 'scripts'), path.join(output, 'scripts'))
copyTree(path.join(lesson, 'common'), output)
copyTree(path.join(lesson, `implementation-${variant}`), output)
// Stage 3 unit tests use their original ./common/lib imports; keep that baseline in this clean snapshot.
copyTree(path.join(prior, 'common'), path.join(output, 'common'))
copyTree(path.join(lesson, 'common'), path.join(output, 'common'))
for (const name of ['ai-limit-units.test.mjs', 'stream-units.test.mjs', 'knowledge-units.test.mjs', 'citation-units.test.mjs']) {
  const source = path.join(prior, name)
  if (existsSync(source) && statSync(source).isFile()) copyFileSync(source, path.join(output, name))
}
copyTree(path.join(prior, 'eval'), path.join(output, 'eval'))
copyFileSync(path.join(lesson, 'agent.test.mjs'), path.join(output, 'agent.test.mjs'))
if (Number(lessonNumber) >= 2) {
  if (!existsSync(nextLesson)) throw new Error('Stage 4.2 Reference source is missing')
  copyTree(path.join(nextLesson, 'common'), output)
  copyTree(path.join(nextLesson, `implementation-${variant}`), output)
  copyTree(path.join(nextLesson, 'common'), path.join(output, 'common'))
  copyFileSync(path.join(nextLesson, 'knowledge-agent.test.mjs'), path.join(output, 'knowledge-agent.test.mjs'))
}
if (Number(lessonNumber) >= 3) {
  if (!existsSync(thirdLesson)) throw new Error('Stage 4.3 Reference source is missing')
  copyTree(path.join(thirdLesson, 'common'), output)
  copyTree(path.join(thirdLesson, 'common'), path.join(output, 'common'))
  copyFileSync(path.join(thirdLesson, 'approval-agent.test.mjs'), path.join(output, 'approval-agent.test.mjs'))
}
if (Number(lessonNumber) >= 4) {
  if (!existsSync(fourthLesson)) throw new Error('Stage 4.4 Reference source is missing')
  copyTree(path.join(fourthLesson, 'common'), output)
  copyTree(path.join(fourthLesson, 'common'), path.join(output, 'common'))
  copyFileSync(path.join(fourthLesson, 'mcp-agent.test.mjs'), path.join(output, 'mcp-agent.test.mjs'))
  copyFileSync(path.join(fourthLesson, 'mcp-request-guard.test.mjs'), path.join(output, 'mcp-request-guard.test.mjs'))
}
if (Number(lessonNumber) >= 5) {
  if (!existsSync(fifthLesson)) throw new Error('Stage 4.5 Reference source is missing')
  copyTree(path.join(fifthLesson, 'common'), output)
  copyTree(path.join(fifthLesson, 'common'), path.join(output, 'common'))
  copyFileSync(path.join(fifthLesson, 'workflow-agent.test.mjs'), path.join(output, 'workflow-agent.test.mjs'))
}
if (Number(lessonNumber) >= 6) {
  if (!existsSync(sixthLesson)) throw new Error('Stage 4.6 Reference source is missing')
  copyTree(path.join(sixthLesson, 'common'), output)
  copyTree(path.join(sixthLesson, 'common'), path.join(output, 'common'))
  copyFileSync(path.join(sixthLesson, 'persistence-agent.test.mjs'), path.join(output, 'persistence-agent.test.mjs'))
}
if (Number(lessonNumber) >= 7) {
  if (!existsSync(seventhLesson)) throw new Error('Stage 4.7 Reference source is missing')
  copyTree(path.join(seventhLesson, 'common'), output)
  copyTree(path.join(seventhLesson, 'common'), path.join(output, 'common'))
  copyFileSync(path.join(seventhLesson, 'agent-eval.test.mjs'), path.join(output, 'agent-eval.test.mjs'))
}
if (lessonNumber === '8') {
  if (!existsSync(eighthLesson)) throw new Error('Stage 4.8 Reference source is missing')
  copyTree(path.join(eighthLesson, 'common'), output)
  mkdirSync(path.join(output, 'docs'), { recursive: true })
  copyFileSync(path.join(root, 'docs/architecture.md'), path.join(output, 'docs/architecture.md'))
  copyFileSync(path.join(root, 'docs/stage-4-demo-script.md'), path.join(output, 'docs/stage-4-demo-script.md'))
}
console.log(`Assembled Stage 4.${lessonNumber} ${variant.toUpperCase()} at ${output}`)
