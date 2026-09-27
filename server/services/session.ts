import { createHash, createHmac, randomBytes } from 'node:crypto'
import type { Request, Response } from 'express'
import type { Prisma } from '@prisma/client'
import { env } from '../config/env.js'

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
const cookieOptions = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }
const lifetime = 30 * 24 * 60 * 60 * 1000
export function clearSessionCookie(res: Response) { res.clearCookie(env.SESSION_COOKIE_NAME, cookieOptions) }
export function sessionCookie(res: Response, token: string) { res.cookie(env.SESSION_COOKIE_NAME, token, { ...cookieOptions, maxAge: lifetime }) }
export async function createSession(tx: Prisma.TransactionClient, userId: string, req: Request) {
  const token = randomBytes(32).toString('base64url')
  await tx.session.create({ data: {
    userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + lifetime),
    userAgent: req.get('user-agent')?.slice(0, 500),
    ipHash: createHmac('sha256', env.SESSION_SECRET).update(req.ip ?? '').digest('hex'),
  } })
  return token
}
