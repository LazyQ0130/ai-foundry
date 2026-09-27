import { Router } from 'express'
import { db } from '../db.js'
import { stages } from '../../src/data/courses.js'
import { env } from '../config/env.js'
import { idSchema } from '../utils/validation.js'
import { requireLessonAccess, readLessonContent } from '../services/course-content.js'
export const courseRoutes = Router()
courseRoutes.get('/stages', async (_req, res) => {
  const rows = await db.stage.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' }, include: { lessons: true } })
  res.json({ data: {
    stages: rows.map((row) => {
      const meta = stages.find((s) => s.slug === row.slug)!
      return { ...meta, status: 'locked', price: row.price, isPublished: row.isPublished, isPurchasable: row.isPurchasable,
        lessons: meta.lessons.map((lesson) => ({ ...lesson, status: 'locked', isPreview: row.lessons.find(l => l.id === lesson.id)?.isPreview ?? false, isPublished: row.lessons.find(l => l.id === lesson.id)?.isPublished ?? false })) }
    }),
    purchase: { wechatQrUrl: env.WECHAT_QR_URL, wechatContact: env.WECHAT_CONTACT, allAccessPrice: env.ALL_ACCESS_PRICE },
  } })
})
courseRoutes.get('/lessons/:lessonId', async (req, res) => {
  const meta = await requireLessonAccess(idSchema.parse(req.params.lessonId), req.user?.id)
  const content = await readLessonContent(meta.stage.slug, meta.lesson.id)
  res.json({ data: { lesson: { id: meta.lesson.id, title: meta.lesson.title, stageSlug: meta.stage.slug, isPreview: meta.row.isPreview }, content } })
})
