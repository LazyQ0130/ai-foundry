import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import type { User } from '@prisma/client'
import { z } from 'zod'
import { db } from '../db.js'
import { env } from '../config/env.js'
import { ApiError } from '../middleware/error.js'
import { hashToken } from './session.js'
import { sendMail } from './mail.js'

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254))
export const codeSchema = z.string().regex(/^\d{6}$/)
const digest = (id: string, code: string) => createHmac('sha256', env.SESSION_SECRET).update(`${id}:${code}`).digest('hex')
const matches = (id: string, code: string, hash: string) => timingSafeEqual(Buffer.from(digest(id, code), 'hex'), Buffer.from(hash, 'hex'))
const invalid = () => new ApiError(400, 'INVALID_CODE', '验证码无效、已过期或尝试次数过多，请重新获取')

// Dependency injection is limited to this internal service; there is no public test bypass.
export function emailVerification(deliver: typeof sendMail = sendMail) {
  return {
    async issue(purpose: 'BIND' | 'RESET', email: string, user: User | null) {
      const id = randomUUID()
      const code = String(randomInt(0, 1000000)).padStart(6, '0')
      const oldCode = purpose === 'BIND' && user?.email ? String(randomInt(0, 1000000)).padStart(6, '0') : null
      const scope = purpose === 'RESET' ? `reset:${email}` : `bind:${user!.id}`
      const now = new Date()
      await db.emailChallenge.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - 86400000) } } })
      const reserved = await db.$transaction(async tx => {
        // A stable lock order covers both account and destination quotas across API instances.
        for (const key of [`email:${email}`, scope].sort()) {
          await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text`
        }
        const recent = await tx.emailChallenge.findMany({ where: {
          OR: [{ scope }, { email }], createdAt: { gte: new Date(now.getTime() - 86400000) },
        }, select: { createdAt: true } })
        if (recent.some(c => c.createdAt.getTime() > now.getTime() - 60000) || recent.length >= 10 || recent.filter(c => c.createdAt.getTime() > now.getTime() - 3600000).length >= 5) return false
        await tx.emailChallenge.updateMany({ where: { scope, consumedAt: null }, data: { consumedAt: now } })
        await tx.emailChallenge.create({ data: {
          id, scope, userId: user?.id, email, previousEmail: user?.email, purpose,
          passwordVersion: user ? hashToken(user.passwordHash) : '',
          codeHash: digest(id, code), oldCodeHash: oldCode ? digest(id, oldCode) : null,
          expiresAt: new Date(now.getTime() + 600000),
        } })
        return true
      })
      if (!reserved) {
        if (purpose === 'RESET') return { challengeId: id, requiresOldEmail: false }
        throw new ApiError(429, 'RATE_LIMITED', '请间隔 60 秒重试；每小时最多 5 次，每天最多 10 次')
      }
      if (!user || user.status !== 'ACTIVE') return { challengeId: id, requiresOldEmail: false }
      try {
        await deliver(email, `AIFoundry · ${purpose === 'RESET' ? '重置密码' : '绑定邮箱'}验证码`, `你的验证码是：${code}。10 分钟内有效，只能使用一次。请勿向任何人提供验证码。如果不是你本人操作，请忽略本邮件。`)
        if (oldCode && user.email) await deliver(user.email, 'AIFoundry · 更换邮箱确认', `你正在更换账号绑定邮箱。原邮箱验证码是：${oldCode}。10 分钟内有效。若不是你本人操作，请勿提供验证码，并修改账号密码。`)
        await db.emailChallenge.update({ where: { id }, data: { delivered: true } })
      } catch {
        await db.emailChallenge.update({ where: { id }, data: { consumedAt: new Date() } })
        // Reset requests have identical public responses for unknown/disabled accounts and delivery failures.
        console.error('Verification email delivery failed')
        if (purpose === 'BIND') throw new ApiError(503, 'MAIL_UNAVAILABLE', '邮件暂时发送失败，请稍后重新获取')
      }
      return { challengeId: id, requiresOldEmail: Boolean(oldCode) }
    },

    async confirm(purpose: 'BIND' | 'RESET', id: string, code: string, options: { userId?: string; oldCode?: string; passwordHash?: string }) {
      // Return errors from the transaction so failed-attempt counters are committed.
      const result = await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "EmailChallenge" WHERE id = ${id} FOR UPDATE`
        const challenge = await tx.emailChallenge.findUnique({ where: { id } })
        if (!challenge || challenge.purpose !== purpose || !challenge.userId || !challenge.delivered || challenge.consumedAt || challenge.expiresAt <= new Date() || challenge.attempts >= 5 || (purpose === 'BIND' && challenge.userId !== options.userId)) return null
        const correct = matches(id, code, challenge.codeHash) && (!challenge.oldCodeHash || Boolean(options.oldCode && matches(id, options.oldCode, challenge.oldCodeHash)))
        await tx.emailChallenge.update({ where: { id }, data: { attempts: { increment: 1 } } })
        if (!correct) return null
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${challenge.userId} FOR UPDATE`
        const user = await tx.user.findUnique({ where: { id: challenge.userId } })
        if (!user || user.status !== 'ACTIVE' || hashToken(user.passwordHash) !== challenge.passwordVersion || user.email !== challenge.previousEmail) return null
        if (purpose === 'RESET' && (!user.emailVerifiedAt || user.email !== challenge.email)) return null
        if (purpose === 'BIND') {
          const owner = await tx.user.findUnique({ where: { email: challenge.email } })
          if (owner && owner.id !== user.id) return null
          await tx.user.update({ where: { id: user.id }, data: { email: challenge.email, emailVerifiedAt: new Date() } })
        } else {
          if (!options.passwordHash) return null
          await tx.user.update({ where: { id: user.id }, data: { passwordHash: options.passwordHash } })
          await tx.session.deleteMany({ where: { userId: user.id } })
        }
        await tx.emailChallenge.update({ where: { id }, data: { consumedAt: new Date() } })
        return user.id
      })
      if (!result) throw invalid()
      return result
    },
  }
}
