import { cpSync, copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'

// Run from the repository root. Never overwrites an existing project.
const variant = process.argv[2] ?? 'a'
const state = process.argv[3] ?? 'fixed'
if (!['a', 'b'].includes(variant) || !['fixed', 'faulty'].includes(state)) {
  throw new Error('Usage: node course-content/internal/stage-1/s1-l3/prepare.mjs a|b fixed|faulty [new-directory]')
}
const source = fileURLToPath(new URL('.', import.meta.url))
const destination = resolve(process.argv[4] ?? `.runtime/s1-l3-reference-${variant}-${state}`)
if (existsSync(destination)) throw new Error(`Destination already exists: ${destination}. Choose a new directory.`)
mkdirSync(destination, { recursive: true })
cpSync(join(source, 'common'), destination, { recursive: true })
copyFileSync(join(source, `implementation-${variant}`, state === 'fixed' ? 'page.tsx' : 'faulty-page.tsx'), join(destination, 'app/page.tsx'))
console.log(destination)
