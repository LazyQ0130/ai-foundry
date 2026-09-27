import { stages } from '../src/data/courses.js'
import { readLessonContent } from '../server/services/course-content.js'
import { assertCatalogue } from '../server/services/catalogue.js'
import { db } from '../server/db.js'
try {
  await assertCatalogue()
  // 只校验已发布的课程正文；未制作的课程保持占位（isPublished: false）。
  const published = await db.lesson.findMany({ where: { isPublished: true, stage: { isPublished: true } } })
  let count = 0
  for (const stage of stages) {
    for (const lesson of stage.lessons) {
      const row = published.find((l) => l.id === lesson.id)
      if (!lesson.isPublished && !row) continue
      if (!row) throw new Error(`Lesson ${lesson.id} is published in courses.ts but not in the database. Run npm run db:seed.`)
      if (row.isPreview !== (lesson.isPreview ?? false)) throw new Error(`Lesson ${lesson.id} preview policy out of sync. Run npm run db:seed.`)
      await readLessonContent(stage.slug, lesson.id)
      count++
    }
  }
  console.info(`PASS: database catalogue, 4 stages, ${count} published content files and stable checklist keys are consistent.`)
} finally { await db.$disconnect() }
