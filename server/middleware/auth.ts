import type { RequestHandler } from 'express'
import type { User } from '@prisma/client'
import { db } from '../db.js'
import { env } from '../config/env.js'
import { ApiError } from './error.js'
import { clearSessionCookie, hashToken } from '../services/session.js'

declare global { namespace Express { interface Request { user?: User; sessionId?: string } } }
export const optionalAuth: RequestHandler = async (req, res, next) => {
  const token = req.cookies[env.SESSION_COOKIE_NAME]
  if (typeof token !== 'string' || !/^[\w-]{43}$/.test(token)) { next(); return }
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } })
  if (!session || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') {
    clearSessionCookie(res); next(); return
  }
  req.user = session.user; req.sessionId = session.id
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) await db.session.updateMany({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
  next()
}
export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) throw new ApiError(401, 'UNAUTHORIZED', '请先登录')
  next()
}
