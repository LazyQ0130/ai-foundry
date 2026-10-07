import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'starter/capstone')
const allowed = new Set([
  '.env.example', '.gitignore', 'README.md', 'package.json', 'package-lock.json',
  'tsconfig.json', 'next-env.d.ts', 'next.config.ts', 'eslint.config.mjs', 'postcss.config.mjs',
  'app/layout.tsx', 'app/page.tsx', 'app/styles.css', 'test/bootstrap.test.mjs',
  'docs/templates/product-brief.md', 'docs/templates/user-flow.md',
])

function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next'].includes(entry.name) || entry.name.endsWith('.tsbuildinfo')) continue
    const full = path.join(dir, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink: ${full}`)
    if (entry.isDirectory()) visit(full)
    else {
      const relative = path.relative(root, full).replaceAll('\\', '/')
      assert.ok(allowed.has(relative), `Bootstrap has an unexpected product file: ${relative}`)
    }
  }
}
visit(root)
console.log('Student ownership audit passed: bootstrap contains engineering shell and blank templates only')
