import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [stage, outputArg] = process.argv.slice(2)
if (!['c1', 'c2'].includes(stage) || !outputArg) {
  throw new Error('Usage: node scripts/assemble-capstone-reference.mjs <c1|c2> <new .runtime directory>')
}
const runtime = path.join(root, '.runtime')
const output = path.resolve(root, outputArg)
if (!output.startsWith(runtime + path.sep) || existsSync(output)) {
  throw new Error('Output must be a new directory inside .runtime; existing files are never replaced')
}
const skip = new Set(['node_modules', '.next', '.git', 'tsconfig.tsbuildinfo'])
function copyTree(source, target) {
  if (!existsSync(source)) throw new Error(`Missing reference source: ${source}`)
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (skip.has(entry.name) || (entry.name.startsWith('.env') && entry.name !== '.env.example')) continue
    if (entry.isSymbolicLink()) throw new Error(`Symlink is not allowed: ${entry.name}`)
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyTree(from, to)
    else if (entry.isFile()) copyFileSync(from, to)
  }
}

copyTree(path.join(root, 'starter/capstone'), output)
const c1 = path.join(root, 'course-content/internal/capstone/c1')
copyTree(path.join(c1, 'docs'), path.join(output, 'docs'))
copyFileSync(path.join(c1, 'README.md'), path.join(output, 'README.md'))
if (stage === 'c2') {
  const source = path.join(root, 'course-content/internal/capstone/c2')
  copyTree(path.join(source, 'overlay'), output)
  // These are reviewed engineering primitives, not a copied product shell.
  const primitiveFiles = [
    'lib/auth.ts', 'lib/password.ts', 'lib/prisma.ts',
    'app/api/auth/login/route.ts', 'app/api/auth/logout/route.ts', 'app/api/auth/me/route.ts',
  ]
  for (const file of primitiveFiles) {
    const target = path.join(output, file)
    mkdirSync(path.dirname(target), { recursive: true })
    copyFileSync(path.join(root, 'starter/stage-4', file), target)
  }
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c2-reference'
  pkg.scripts.build = 'prisma generate && next build'
  pkg.scripts.typecheck = 'prisma generate && tsc --noEmit'
  pkg.scripts['db:migrate'] = 'prisma migrate deploy'
  pkg.scripts['test:db'] = 'node scripts/c2-http-smoke.mjs'
  pkg.dependencies['@prisma/client'] = '6.19.3'
  pkg.devDependencies.prisma = '6.19.3'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lock = path.join(source, 'package-lock.json')
  if (existsSync(lock)) copyFileSync(lock, path.join(output, 'package-lock.json'))
}
console.log(`Assembled ${stage.toUpperCase()} internal reference at ${output}`)
