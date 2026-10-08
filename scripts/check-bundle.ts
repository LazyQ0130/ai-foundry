import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import {capstoneLessons} from '../src/data/capstoneLessons.js'
import {readCapstoneContent} from '../server/services/capstone-content.js'
import {unzipSync} from 'fflate'
import {capstoneStarterFiles} from './capstone-starter-package.js'
import { stages } from '../src/data/courses.js'
import { readLessonContent } from '../server/services/course-content.js'

async function files(directory: string, skipGenerated = false): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.filter(entry => !skipGenerated || !['node_modules', '.next', '.runtime', '.git'].includes(entry.name)).map(entry => entry.isDirectory() ? files(path.join(directory, entry.name), skipGenerated) : [path.join(directory, entry.name)]))).flat()
}
const paths = [...await files('dist'), ...await files('public')]
if (!paths.some(name => name.endsWith('.js'))) throw new Error('Build frontend first')
if (paths.some(name => /(?:^|[\\/])course-content(?:[\\/]|$)/.test(name))) throw new Error('Course source directory is publicly exposed')
if (paths.some(name => /\.zip$/i.test(name) || /(?:^|[\\/])starter(?:[\\/]|$)/.test(name))) throw new Error('Starter attachment must not be in dist/public')
if (paths.some(name => /(?:^|[\\/])(?:\.env(?:\.[^\\/]*)?|\.runtime|\.git|node_modules)(?:[\\/]|$)/.test(name))) throw new Error('Private environment or generated server directory publicly exposed')
const assets = await Promise.all(paths.filter(name => /\.(?:js|css|html|json|map|md|txt|mjs|ts|tsx|sql)$/i.test(name)).map(async name => ({ name, text: await readFile(name, 'utf8') })))
// Internal authoring artifacts are never student downloads or frontend imports.
const internalFiles = [
  ...await files('course-content/internal/capstone', true),
  ...(await files('docs')).filter(name => /capstone.*(?:validation|audit)/i.test(name)),
]
let internalChecked = 0
const publicHashes = new Set(await Promise.all(paths.map(async name => createHash('sha256').update(await readFile(name)).digest('hex'))))
for (const name of internalFiles) {
  if (publicHashes.has(createHash('sha256').update(await readFile(name)).digest('hex')))
    throw new Error(`Exact internal Capstone artifact exposed: ${name}`)
  if (!/\.(?:md|mmd|txt|json|ts|tsx|mjs|sql)$/i.test(name) || /package-lock\.json$/.test(name)) continue
  const source = await readFile(name, 'utf8')
  // Long, complete author-only paragraphs avoid matching shared framework boilerplate.
  const markers = source.split(/\r?\n\s*\r?\n/).map(part => part.trim())
    .filter(part => part.length >= 140 && !/^(?:import |export |\{|\/\/|#)/.test(part))
  for (const marker of markers) {
    const found = assets.find(asset => asset.text.includes(marker) || asset.text.includes(JSON.stringify(marker).slice(1, -1)))
    if (found) throw new Error(`Internal Capstone artifact in public output: ${name} (${found.name})`)
  }
  internalChecked++
}
for (const asset of assets) {
  if (/(?:course-content[\\/]+internal[\\/]+capstone|PRIVATE KEY-----|AKIA[0-9A-Z]{16})/.test(asset.text))
    throw new Error(`Internal path or credential marker in public output: ${asset.name}`)
}
for (const [key, value] of Object.entries(process.env)) {
  if (/DATABASE_URL|(?:API_KEY|SECRET|PASSWORD|ACCESS_KEY|APPROVAL_TOKEN)$/.test(key) && value && value.length >= 8 &&
      assets.some(asset => asset.text.includes(value) || asset.text.includes(JSON.stringify(value).slice(1, -1))))
    throw new Error(`Server credential found in frontend bundle: ${key}`)
}
const zip=unzipSync(await readFile('starter/aifoundry-capstone-starter.zip'))
const names=Object.keys(zip).map(name=>name.replace(/^aifoundry-capstone-starter\//,''))
if(names.length!==capstoneStarterFiles.length||names.some(name=>!capstoneStarterFiles.includes(name as typeof capstoneStarterFiles[number])))throw new Error('Forbidden file in Capstone Starter ZIP')
for(const lesson of capstoneLessons){
 const {body}=await readCapstoneContent(lesson.id)
 for(const part of body.split(/\r?\n\s*\r?\n/).map(p=>p.trim()).filter(p=>p.length>=80)){
  if(assets.some(a=>a.text.includes(part)||a.text.includes(JSON.stringify(part).slice(1,-1))))throw new Error('Protected Capstone Markdown in public output: '+lesson.id)
 }
}
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
console.info(`PASS: ${paths.length} dist/public files contain no protected Markdown markers; ${checked} Stage content files + ${capstoneLessons.length} protected Capstone labs and ${internalChecked} internal Capstone artifacts checked.`)
