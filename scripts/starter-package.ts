import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { zipSync, type Zippable } from 'fflate'

const rootFiles = new Set(['package.json', 'package-lock.json', 'README.md', 'next.config.ts', 'next-env.d.ts', 'tsconfig.json', 'tailwind.config.ts', 'postcss.config.js'])
const sourceRoots = new Set(['app', 'components', 'lib', 'public'])
export function isStarterFile(relative: string) {
  // The only distributable dotfile; nested copies and every other hidden path stay denied.
  if (relative === '.gitignore') return true
  const parts = relative.split('/')
  if (parts.some(part => !part || part.startsWith('.') || /^(node_modules|__MACOSX|coverage|dist|build|tests?|__tests__)$/i.test(part))) return false
  if (/\.(test|spec)\.[^/]+$/i.test(relative)) return false
  if (/\.(log|tmp|temp|bak|swp|tsbuildinfo)$/i.test(relative) || /(^|\/)(Thumbs\.db|desktop\.ini)$/i.test(relative)) return false
  if (parts.length === 1) return rootFiles.has(relative)
  return sourceRoots.has(parts[0]) && /\.(tsx?|jsx?|css|json|svg|png|jpe?g|webp|ico|woff2?)$/i.test(relative)
}
export async function createStarterZip(root = path.resolve('starter/stage-1')) {
  const entries: Zippable = {}
  async function walk(directory: string, prefix = '') {
    const items = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))
    for (const item of items) {
      const relative = prefix + item.name
      if (item.isSymbolicLink()) throw new Error(`Starter 不允许符号链接：${relative}`)
      if (item.isDirectory()) {
        if (!item.name.startsWith('.') && item.name !== 'node_modules' && (prefix || sourceRoots.has(item.name))) await walk(path.join(directory, item.name), relative + '/')
      } else if (item.isFile() && isStarterFile(relative)) {
        entries[`aifoundry-stage1-starter/${relative}`] = [await readFile(path.join(directory, item.name)), { mtime: new Date(2020, 0, 1), level: 9 }]
      }
    }
  }
  await walk(root)
  for (const required of ['.gitignore', 'package.json', 'package-lock.json', 'README.md', 'app/page.tsx', 'components/ResourceCard.tsx', 'lib/resources.ts']) {
    if (!entries[`aifoundry-stage1-starter/${required}`]) throw new Error(`Starter 缺少 ${required}`)
  }
  return zipSync(entries)
}
