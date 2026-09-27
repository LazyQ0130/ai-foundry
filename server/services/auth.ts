import argon2 from 'argon2'
import { z } from 'zod'
import type { User } from '@prisma/client'
import { db } from '../db.js'

export const phoneSchema = z.string().max(32).transform((value) => value.replace(/\s/g, '')).pipe(z.string().regex(/^1[3-9]\d{9}$/))
export const passwordSchema = z.string().min(8).max(72)
export const credentialsSchema = z.object({ phone: phoneSchema, password: passwordSchema })
export const TERMS_VERSION = '2026-09-26.2'
export const registerSchema = credentialsSchema.extend({ nickname: z.string().trim().min(1).max(50).optional(), acceptedTerms: z.literal(true) })
export const hashPassword = (password: string) => argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 })
export const dummyHash = hashPassword('unusable-random-comparison-password')
export const maskPhone = (phone: string) => `${phone.slice(0, 3)}****${phone.slice(-4)}`
export async function publicUser(user: User) {
  const active = await db.entitlement.findMany({ where: { userId: user.id, status: 'ACTIVE' }, include: { stage: true } })
  return {
    id: user.id, phoneMasked: maskPhone(user.phone), phoneVerified: user.phoneVerified,
    nickname: user.nickname, avatarUrl: user.avatarUrl, role: user.role,
    email: user.email, emailVerifiedAt: user.emailVerifiedAt,
    entitlements: active.map((e) => e.stage.slug),
    createdAt: user.createdAt, lastLoginAt: user.lastLoginAt,
  }
}
