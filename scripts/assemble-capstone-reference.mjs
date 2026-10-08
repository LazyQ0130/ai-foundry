import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [stage, outputArg] = process.argv.slice(2)
if (!['c1', 'c2', 'c3', 'c4'].includes(stage) || !outputArg) {
  throw new Error('Usage: node scripts/assemble-capstone-reference.mjs <c1|c2|c3|c4> <new .runtime directory>')
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
if (stage === 'c2' || stage === 'c3' || stage === 'c4') {
  const source = path.join(root, 'course-content/internal/capstone/c2')
  copyTree(path.join(source, 'overlay'), output)
  copyFileSync(path.join(source, 'architecture-decision.md'), path.join(output, 'docs/architecture-decision.md'))
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
if (stage === 'c3' || stage === 'c4') {
  const source = path.join(root, 'course-content/internal/capstone/c3')
  copyTree(path.join(source, 'overlay'), output)
  copyTree(path.join(root, 'course-content/internal/capstone/fixtures'), path.join(output, 'test/fixtures'))
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c3-reference'
  pkg.scripts.test = 'tsx --test test/*.test.ts'
  pkg.scripts['test:db'] = 'node scripts/c3-http-smoke.mjs'
  pkg.dependencies['@aws-sdk/client-s3'] = '3.1147.0'
  pkg.dependencies['@aws-sdk/s3-request-presigner'] = '3.1147.0'
  pkg.dependencies['pdfjs-dist'] = '6.4.299'
  pkg.devDependencies.tsx = '4.23.15'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  copyFileSync(path.join(source, 'package-lock.json'), path.join(output, 'package-lock.json'))
}
if (stage === 'c4') {
  const source = path.join(root, 'course-content/internal/capstone/c4')
  copyTree(path.join(source, 'overlay'), output)
  const packagePath = path.join(output, 'package.json')
  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))
  pkg.name = 'ai-research-workspace-c4-reference'
  pkg.scripts['test:db'] = 'node scripts/c4-http-smoke.mjs'
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n')
  const lock = JSON.parse(readFileSync(path.join(output, 'package-lock.json'), 'utf8'))
  lock.name = pkg.name
  lock.packages[''].name = pkg.name
  writeFileSync(path.join(output, 'package-lock.json'), JSON.stringify(lock, null, 2) + '\n')
}
console.log(`Assembled ${stage.toUpperCase()} internal reference at ${output}`)
