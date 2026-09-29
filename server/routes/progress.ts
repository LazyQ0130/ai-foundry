import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { ApiError } from '../middleware/error.js'
import { getProgress } from '../services/progress.js'
import { requireLessonAccess, readLessonContent } from '../services/course-content.js'
import { idSchema } from '../utils/validation.js'

export const progressRoutes = Router()
progressRoutes.use(requireAuth)
progressRoutes.get('/', async (req, res) => { res.json({ data: await getProgress(req.user!.id) }) })
for (const action of ['visit', 'complete', 'check'] as const) {
  const handler = async (req: import('express').Request, res: import('express').Response) => {
    const lessonId = idSchema.parse(req.params.lessonId)
    const userId = req.user!.id
    const check = action === 'check' ? { checkKey: idSchema.parse(req.params.checkKey), completed: z.object({ completed: z.boolean() }).parse(req.body).completed } : null
    await db.$transaction(async (tx) => {
      // Shares the target-user lock with disable and revoke; avoids progress writes racing either operation.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`
      const current = await tx.user.findUniqueOrThrow({ where: { id: userId } })
      if (current.status !== 'ACTIVE') throw new ApiError(401, 'UNAUTHORIZED', '请重新登录')
      const meta = await requireLessonAccess(lessonId, userId, tx)
      if (check) {
        const content = await readLessonContent(meta.stage.slug, lessonId)
        if (!content.meta.checkKeys.includes(check.checkKey)) throw new ApiError(400, 'VALIDATION_ERROR', '任务项不存在')
        await tx.lessonCheck.upsert({ where: { userId_lessonId_checkKey: { userId, lessonId, checkKey: check.checkKey } }, create: { userId, lessonId, ...check }, update: { completed: check.completed } })
      }
      await tx.lessonProgress.upsert({ where: { userId_lessonId: { userId, lessonId } }, create: { userId, lessonId }, update: action === 'visit' ? { lastVisitedAt: new Date() } : {} })
      if (action === 'complete') await tx.lessonProgress.updateMany({ where: { userId, lessonId, status: 'IN_PROGRESS' }, data: { status: 'COMPLETED', completedAt: new Date() } })
    }, { maxWait: 10_000, timeout: 20_000 })
    res.json({ data: await getProgress(userId) })
  }
  if (action === 'check') progressRoutes.put('/lessons/:lessonId/checks/:checkKey', handler)
  else progressRoutes.post(`/lessons/:lessonId/${action}`, handler)
}
