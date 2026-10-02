import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { stages } from '../src/data/courses.js'
import { parseLessonContent } from '../server/services/lesson-parser.js'

const catalog = new Map<string, string>(stages.flatMap(stage => stage.lessons.map(lesson => [`${stage.slug}/${lesson.id}.md`, lesson.id])))
const keys = new Map<string, string>()
let count = 0
for (const stageDir of await readdir('course-content', { withFileTypes: true })) {
  if (!stageDir.isDirectory() || !/^stage-\d+$/.test(stageDir.name)) continue
  for (const file of await readdir(path.join('course-content', stageDir.name), { withFileTypes: true })) {
    if (!file.isFile() || path.extname(file.name) !== '.md') continue
    const relative = `${stageDir.name}/${file.name}`
    if (!catalog.has(relative)) throw new Error(`Stray authored lesson: ${relative}`)
    const content = parseLessonContent(await readFile(path.join('course-content', relative), 'utf8'))
    for (const key of content.meta.checkKeys) {
      const previous = keys.get(key)
      if (previous) throw new Error(`Duplicate checkKey ${key}: ${previous}, ${relative}`)
      keys.set(key, relative)
    }
    count++
  }
}
console.info(`PASS: ${count} authored lessons, ${keys.size} globally unique checkKeys`)
