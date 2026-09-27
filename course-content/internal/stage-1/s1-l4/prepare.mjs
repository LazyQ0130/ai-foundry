import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'

const variant = process.argv[2] ?? 'a'
const state = process.argv[3] ?? 'after'
if (!['a', 'b'].includes(variant) || !['before', 'after'].includes(state)) {
  throw new Error('Usage: node course-content/internal/stage-1/s1-l4/prepare.mjs a|b before|after [new-directory]')
}
const source = fileURLToPath(new URL('.', import.meta.url))
const destination = resolve(process.argv[4] ?? `.runtime/s1-l4-reference-${variant}-${state}`)
if (existsSync(destination)) throw new Error(`Destination already exists: ${destination}. Choose a new directory.`)
mkdirSync(destination, { recursive: true })
cpSync(join(source, '../s1-l3/common'), destination, { recursive: true })
cpSync(join(source, `implementation-${variant}`, state), destination, { recursive: true })
console.log(destination)
