import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [lessonNumber, variant, outputArg] = process.argv.slice(2)
if (!/^[1-7]$/.test(lessonNumber ?? '') || !['a', 'b'].includes(variant) || !outputArg) {
  throw new Error('Usage: node scripts/assemble-stage3-reference.mjs <1-7> <a|b> <new .runtime directory>')
}
const runtime = path.join(root, '.runtime')
const output = path.resolve(root, outputArg)
if (!output.startsWith(runtime + path.sep) || existsSync(output)) throw new Error('Use a new directory inside .runtime; existing files are never replaced')
const lesson = path.join(root, 'course-content', 'internal', 'stage-3', `s3-l${lessonNumber}`)
const skip = new Set(['node_modules', '.next', '.runtime', '.git', 'package-lock.json', 'tsconfig.tsbuildinfo'])

function copyTree(source, target) {
  if (!existsSync(source)) return
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (skip.has(entry.name) || entry.name.startsWith('.env') || entry.name.endsWith('.log')) continue
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${path.join(source, entry.name)}`)
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyTree(from, to)
    else if (entry.isFile()) copyFileSync(from, to)
  }
}

mkdirSync(output, { recursive: true })
copyTree(path.join(root, 'starter', 'stage-1'), output)
copyTree(path.join(lesson, 'common'), output)
copyTree(path.join(lesson, `implementation-${variant}`), output)
// Unit tests keep their original ./common/lib imports in a clean assembled project.
copyTree(path.join(lesson, 'common'), path.join(output, 'common'))
for (const name of ['ai-limit-units.test.mjs', 'stream-units.test.mjs', 'knowledge-units.test.mjs', 'citation-units.test.mjs']) {
  const source = path.join(lesson, name)
  if (existsSync(source) && statSync(source).isFile()) copyFileSync(source, path.join(output, name))
}
copyTree(path.join(lesson, 'eval'), path.join(output, 'eval'))
copyTree(path.join(lesson, 'scripts'), path.join(output, 'scripts'))
console.log(`Assembled Stage 3.${lessonNumber} ${variant.toUpperCase()} at ${output}`)
