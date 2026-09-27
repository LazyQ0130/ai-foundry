import { Router } from 'express'
import argon2 from 'argon2'
import { db } from '../db.js'
import { env } from '../config/env.js'
import { ApiError } from '../middleware/error.js'
import { requireAuth } from '../middleware/auth.js'
import { loginIpLimit, loginAccountLimit, registerLimit } from '../middleware/rate-limit.js'
import { credentialsSchema, registerSchema, hashPassword, dummyHash, publicUser, passwordSchema, TERMS_VERSION } from '../services/auth.js'
import { createSession, sessionCookie, clearSessionCookie, hashToken } from '../services/session.js'
import { z } from 'zod'

export const authRoutes = Router()
authRoutes.post('/register', registerLimit, async (req, res) => {
  const input = registerSchema.parse(req.body)
  const passwordHash = await hashPassword(input.password)
  const { user, token } = await db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { phone: input.phone, nickname: input.nickname ?? '同学', passwordHash, lastLoginAt: new Date(), acceptedTermsAt: new Date(), termsVersion: TERMS_VERSION } })
    const token = await createSession(tx, user.id, req)
    return { user, token }
  })
  sessionCookie(res, token)
  res.status(201).json({ data: { user: await publicUser(user) } })
})
authRoutes.post('/login', loginIpLimit, loginAccountLimit, async (req, res) => {
  const input = credentialsSchema.parse(req.body)
  const user = await db.user.findUnique({ where: { phone: input.phone } })
  const valid = await argon2.verify(user?.passwordHash ?? await dummyHash, input.password)
  if (!user || !valid) throw new ApiError(401, 'INVALID_CREDENTIALS', '手机号或密码错误')
  const token = await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`
    const current = await tx.user.findUniqueOrThrow({ where: { id: user.id } })
    if (current.status !== 'ACTIVE') throw new ApiError(403, 'ACCOUNT_DISABLED', '账号已禁用，请联系管理员')
    if (current.passwordHash !== user.passwordHash) throw new ApiError(401, 'INVALID_CREDENTIALS', '手机号或密码错误')
    await tx.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    const old = req.cookies[env.SESSION_COOKIE_NAME]
    if (typeof old === 'string') await tx.session.deleteMany({ where: { tokenHash: hashToken(old) } })
    return createSession(tx, user.id, req)
  })
  sessionCookie(res, token)
  res.json({ data: { user: await publicUser(user) } })
})
authRoutes.post('/logout', async (req, res) => {
  const token = req.cookies[env.SESSION_COOKIE_NAME]
  if (typeof token === 'string') await db.session.deleteMany({ where: { tokenHash: hashToken(token) } })
  clearSessionCookie(res)
  res.json({ data: { success: true } })
})
authRoutes.post('/password', requireAuth, loginIpLimit, async (req, res) => {
  const input = z.object({ currentPassword: passwordSchema, newPassword: passwordSchema }).parse(req.body)
  if (!await argon2.verify(req.user!.passwordHash, input.currentPassword)) throw new ApiError(401, 'INVALID_CREDENTIALS', '当前密码错误')
  const passwordHash = await hashPassword(input.newPassword)
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${req.user!.id} FOR UPDATE`
    const current = await tx.user.findUniqueOrThrow({ where: { id: req.user!.id } })
    if (current.status !== 'ACTIVE' || current.passwordHash !== req.user!.passwordHash) throw new ApiError(401, 'UNAUTHORIZED', '请重新登录')
    await tx.user.update({ where: { id: current.id }, data: { passwordHash } })
    await tx.session.deleteMany({ where: { userId: current.id } })
  })
  clearSessionCookie(res)
  res.json({ data: { success: true } })
})
