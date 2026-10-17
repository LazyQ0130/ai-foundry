import { Router } from 'express'
import { db } from '../db.js'
import { stages } from '../data/courses.js'
import { env } from '../config/env.js'
import { idSchema } from '../utils/validation.js'
import { requireLessonAccess, readLessonContent } from '../services/course-content.js'
import { catalogueStage } from '../services/course-outline.js'
export const courseRoutes = Router()
courseRoutes.get('/stages', async (req, res) => {
  const rows = await db.stage.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' }, include: { lessons: true } })
  const entitlements = req.user ? await db.entitlement.findMany({ where: { userId: req.user.id, status: 'ACTIVE', user: { status: 'ACTIVE' } }, select: { stageId: true } }) : []
  const owned = new Set(entitlements.map(item => item.stageId))
  res.setHeader('Cache-Control', 'private, no-store')
  res.vary('Cookie')
  res.json({ data: {
    stages: rows.map((row) => {
      const meta = stages.find((s) => s.slug === row.slug)!
      return catalogueStage({ ...meta, status: 'locked', price: row.price, isPublished: row.isPublished, isPurchasable: row.isPurchasable,
        lessons: meta.lessons.map((lesson) => ({ ...lesson, status: 'locked', isPreview: row.lessons.find(l => l.id === lesson.id)?.isPreview ?? false, isPublished: row.lessons.find(l => l.id === lesson.id)?.isPublished ?? false })) }, owned.has(row.id))
    }),
    purchase: { wechatQrUrl: env.WECHAT_QR_URL, wechatContact: env.WECHAT_CONTACT, allAccessPrice: env.ALL_ACCESS_PRICE, allAccessProjectsPrice: env.ALL_ACCESS_PROJECTS_PRICE,
      paymentMethods: [
        { id: 'ALIPAY', label: '支付宝', qrUrl: env.ALIPAY_PAYMENT_QR_URL, recipient: env.ALIPAY_PAYMENT_NAME },
        { id: 'WECHAT', label: '微信支付', qrUrl: env.WECHAT_PAYMENT_QR_URL, recipient: env.WECHAT_PAYMENT_NAME },
      ] },
  } })
})
courseRoutes.get('/lessons/:lessonId', async (req, res) => {
  const meta = await requireLessonAccess(idSchema.parse(req.params.lessonId), req.user?.id)
  const content = await readLessonContent(meta.stage.slug, meta.lesson.id)
  res.json({ data: { lesson: { id: meta.lesson.id, title: meta.lesson.title, stageSlug: meta.stage.slug, isPreview: meta.row.isPreview }, content } })
})
