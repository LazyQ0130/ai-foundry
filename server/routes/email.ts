import { Router } from 'express'
import argon2 from 'argon2'
import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import { ApiError } from '../middleware/error.js'
import { db } from '../db.js'
import { passwordSchema, hashPassword, publicUser } from '../services/auth.js'
import { emailSchema, codeSchema, emailVerification } from '../services/email-verification.js'
import { clearSessionCookie } from '../services/session.js'

export function createEmailRoutes(service = emailVerification()) {
  const router = Router()
  const message = { error: { code: 'RATE_LIMITED', message: '请求过于频繁，请稍后重试' } }
  const sendLimit = rateLimit({ windowMs: 3600000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message })
  const verifyLimit = rateLimit({ windowMs: 900000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message })
  router.post('/email/code', requireAuth, sendLimit, async (req, res) => {
    const input = z.object({ email: emailSchema, currentPassword: passwordSchema }).parse(req.body)
    if (!await argon2.verify(req.user!.passwordHash, input.currentPassword)) throw new ApiError(400, 'INVALID_CREDENTIALS', '当前密码错误')
    if (input.email === req.user!.email) throw new ApiError(400, 'SAME_EMAIL', '此邮箱已绑定，请输入新的邮箱')
    if (await db.user.findUnique({ where: { email: input.email } })) throw new ApiError(409, 'EMAIL_UNAVAILABLE', '此邮箱暂不可绑定，请使用其他邮箱')
    res.json({ data: await service.issue('BIND', input.email, req.user!) })
  })
  router.post('/email/confirm', requireAuth, verifyLimit, async (req, res) => {
    const input = z.object({ challengeId: z.uuid(), code: codeSchema, oldCode: codeSchema.optional() }).parse(req.body)
    const userId = await service.confirm('BIND', input.challengeId, input.code, { userId: req.user!.id, oldCode: input.oldCode })
    res.json({ data: await publicUser(await db.user.findUniqueOrThrow({ where: { id: userId } })) })
  })
  router.post('/password-reset/code', sendLimit, async (req, res) => {
    const { email } = z.object({ email: emailSchema }).parse(req.body)
    const user = await db.user.findUnique({ where: { email } })
    const result = await service.issue('RESET', email, user?.emailVerifiedAt ? user : null)
    res.json({ data: { challengeId: result.challengeId, message: '如果该邮箱已绑定有效账号，你将收到验证码。请查看收件箱或垃圾邮件，未收到时请稍后重试或联系管理员。' } })
  })
  router.post('/password-reset/confirm', verifyLimit, async (req, res) => {
    const input = z.object({ challengeId: z.uuid(), code: codeSchema, newPassword: passwordSchema }).parse(req.body)
    await service.confirm('RESET', input.challengeId, input.code, { passwordHash: await hashPassword(input.newPassword) })
    clearSessionCookie(res)
    res.json({ data: { success: true } })
  })
  return router
}
