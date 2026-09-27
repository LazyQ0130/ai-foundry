import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../db.js'
import { idSchema, slugSchema } from '../../utils/validation.js'
import { stages } from '../../../src/data/courses.js'
export const adminCourseRoutes = Router()
adminCourseRoutes.get('/', async (_req, res) => {
  const rows = await db.stage.findMany({ include: { lessons: true }, orderBy: { order: 'asc' } })
  res.json({ data: rows.map((r) => ({ ...r, lessons: stages.find((s) => s.slug === r.slug)!.lessons.map((l) => ({ ...l, ...r.lessons.find((row) => row.id === l.id) })) })) })
})
adminCourseRoutes.patch('/stages/:slug', async (req, res) => {
  const slug = slugSchema.parse(req.params.slug)
  const input = z.object({ price: z.number().int().min(0).max(1000000).optional(), isPublished: z.boolean().optional(), isPurchasable: z.boolean().optional() }).strict().refine((v) => Object.keys(v).length > 0).parse(req.body)
  await db.$transaction(async (tx) => {
    await tx.stage.update({ where: { slug }, data: input })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, action: 'EDIT_STAGE', detail: `更新 ${slug}`, metadata: { stages: [slug], changes: input } } })
  })
  res.json({ data: { success: true } })
})
adminCourseRoutes.patch('/lessons/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const input = z.object({ isPreview: z.boolean().optional(), isPublished: z.boolean().optional() }).strict().refine((v) => Object.keys(v).length > 0).parse(req.body)
  await db.$transaction(async (tx) => {
    const row = await tx.lesson.update({ where: { id }, data: input, include: { stage: true } })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, action: 'EDIT_LESSON', detail: `更新 ${id}`, metadata: { stages: [row.stage.slug], lessonId: id, changes: input } } })
  })
  res.json({ data: { success: true } })
})
