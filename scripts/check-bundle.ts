import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { stages } from '../src/data/courses.js'
import { readLessonContent } from '../server/services/course-content.js'

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))).flat()
}
const paths = [...await files('dist'), ...await files('public')]
if (!paths.some(name => name.endsWith('.js'))) throw new Error('Build frontend first')
if (paths.some(name => /(?:^|[\\/])course-content(?:[\\/]|$)/.test(name))) throw new Error('Course source directory is publicly exposed')
const assets = await Promise.all(paths.map(async name => ({ name, text: await readFile(name, 'utf8') })))
if (process.env.SMTP_PASSWORD && assets.some(asset => asset.text.includes(process.env.SMTP_PASSWORD!))) throw new Error('Server mail credential found in frontend bundle')
let checked = 0
for (const stage of stages) for (const lesson of stage.lessons) {
  if (lesson.isPublished === false) continue
  const { body } = await readLessonContent(stage.slug, lesson.id)
  // Sample every substantive paragraph/code block, not just the document header.
  const markers = body.split(/\r?\n\s*\r?\n/).map(part => part.trim()).filter(part => part.length >= 40)
  for (const part of markers) {
    const marker = part.slice(0, 80)
    const found = assets.find(asset => asset.text.includes(marker) || asset.text.includes(JSON.stringify(marker).slice(1, -1)))
    if (found) throw new Error(`Protected course body in public output: ${lesson.id} (${found.name})`)
  }
  checked++
}
console.info(`PASS: ${paths.length} dist/public files contain no protected Markdown markers; ${checked} lessons checked.`)
