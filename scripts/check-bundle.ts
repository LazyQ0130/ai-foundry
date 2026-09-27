import { readFile, readdir } from 'node:fs/promises'
import { stages } from '../src/data/courses.js'
import { readLessonContent } from '../server/services/course-content.js'
const assets = (await readdir('dist/assets')).filter((name) => name.endsWith('.js') || name.endsWith('.map'))
if (!assets.length) throw new Error('Build frontend first')
const bundles = await Promise.all(assets.map((name) => readFile(`dist/assets/${name}`, 'utf8')))
if (process.env.SMTP_PASSWORD && bundles.some(bundle => bundle.includes(process.env.SMTP_PASSWORD!))) throw new Error('Server mail credential found in frontend bundle')
let checked = 0
for (const stage of stages) for (const lesson of stage.lessons) {
  if (lesson.isPublished === false) continue
  const content = await readLessonContent(stage.slug, lesson.id)
  const prompts = content.prompts ?? (content.prompt ? [content.prompt] : [])
  const texts = [...prompts.map((p) => p.code), content.why, content.stuck]
  for (const text of texts) {
    const marker = text.slice(0, 50)
    if (bundles.some((bundle) => bundle.includes(marker) || bundle.includes(JSON.stringify(marker).slice(1, -1)))) throw new Error(`Protected content in bundle: ${lesson.id}`)
  }
  checked++
}
console.info(`PASS: ${assets.length} frontend assets contain no lesson prompt/body markers; ${checked} lessons checked.`)
