import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { zipSync, type Zippable } from 'fflate'

const rootFiles = new Set(['package.json', 'package-lock.json', 'README.md', 'next.config.ts', 'next-env.d.ts', 'tsconfig.json', 'tailwind.config.ts', 'postcss.config.js', 'prisma.config.ts', '.env.example', 'compose.yaml'])
const sourceRoots = new Set(['app', 'components', 'lib', 'public', 'prisma'])
export function isStarterFile(relative: string, stage: 1 | 3 | 4 = 1) {
  // The only distributable dotfile; nested copies and every other hidden path stay denied.
  if (relative === '.gitignore' || (stage !== 1 && relative === '.env.example')) return true
  const parts = relative.split('/')
  if (parts.some(part => !part || part.startsWith('.') || /^(node_modules|__MACOSX|coverage|dist|build|tests?|__tests__|logs?|tmp|temp|secrets?)$/i.test(part))) return false
  if (/\.(test|spec)\.[^/]+$/i.test(relative)) return false
  if (/\.(log|tmp|temp|bak|swp|tsbuildinfo)$/i.test(relative) || /(^|\/)(Thumbs\.db|desktop\.ini)$/i.test(relative)) return false
  if (parts.length === 1) return rootFiles.has(relative) && (stage !== 1 || !['prisma.config.ts', '.env.example', 'compose.yaml'].includes(relative))
  if (parts[0] === 'prisma') return stage !== 1 && (/^prisma\/(schema\.prisma|migrations\/migration_lock\.toml)$/.test(relative) || /^prisma\/migrations\/\d+_[a-z0-9_]+\/migration\.sql$/.test(relative))
  return sourceRoots.has(parts[0]) && /\.(tsx?|jsx?|css|json|svg|png|jpe?g|webp|ico|woff2?)$/i.test(relative)
}
export async function createStarterZip(root = path.resolve('starter/stage-1'), stage: 1 | 3 | 4 = 1) {
  const folder = `aifoundry-stage${stage}-starter`
  const entries: Zippable = {}
  async function walk(directory: string, prefix = '') {
    const items = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))
    for (const item of items) {
      const relative = prefix + item.name
      if (item.isSymbolicLink()) throw new Error(`Starter 不允许符号链接：${relative}`)
      if (item.isDirectory()) {
        if (!item.name.startsWith('.') && item.name !== 'node_modules' && (prefix || sourceRoots.has(item.name))) await walk(path.join(directory, item.name), relative + '/')
      } else if (item.isFile() && isStarterFile(relative, stage)) {
        entries[`${folder}/${relative}`] = [await readFile(path.join(directory, item.name)), { mtime: new Date(2020, 0, 1), level: 9 }]
      }
    }
  }
  await walk(root)
  const required = stage === 1
    ? ['.gitignore', 'package.json', 'package-lock.json', 'README.md', 'app/page.tsx', 'components/ResourceCard.tsx', 'lib/resources.ts']
    : ['.gitignore', '.env.example', 'package.json', 'package-lock.json', 'README.md', 'app/page.tsx', 'app/api/auth/register/route.ts', 'app/api/resources/route.ts', 'lib/auth.ts', 'prisma/schema.prisma', 'prisma/migrations/migration_lock.toml',
      ...(stage === 4 ? ['app/api/ai/answer/route.ts', 'app/api/knowledge/ask/route.ts', 'lib/knowledge-citations.ts', 'lib/provider-work-budget.ts'] : [])]
  for (const file of required) {
    if (!entries[`${folder}/${file}`]) throw new Error(`Starter 缺少 ${file}`)
  }
  if (stage === 4) {
    const names = Object.keys(entries).map(name => name.slice(`${folder}/`.length))
    if (names.some(name => /(^|\/)(agent|mcp|approval|workflow|eval|reference|tests?)(\/|[-_.])/i.test(name))) throw new Error('Stage 4 Starter 包含后续课程文件')
    if (names.filter(name => /prisma\/migrations\/[^/]+\/migration\.sql$/.test(name)).length !== 4) throw new Error('Stage 4 Starter 必须保留四次 Stage 3 migration')
  }
  return zipSync(entries)
}
