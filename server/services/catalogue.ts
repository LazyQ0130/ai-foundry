import { stages } from '../../src/data/courses.js'
import { db } from '../db.js'

export async function assertCatalogue() {
  const stored = await db.stage.findMany({ include: { lessons: true } })
  for (const stage of stages) {
    const row = stored.find((s) => s.slug === stage.slug)
    if (!row || stage.lessons.some((lesson) => !row.lessons.some((item) => item.id === lesson.id))) {
      throw new Error('Course catalogue out of sync. Run npm run db:seed.')
    }
  }
}
