import { db } from '../db.js'
import type { EntitlementSource, Prisma } from '@prisma/client'
import { ApiError } from '../middleware/error.js'
export async function hasStageAccess(userId: string, stageSlug: string, client: Prisma.TransactionClient = db) {
  return !!await client.entitlement.findFirst({ where: { userId, status: 'ACTIVE', stage: { slug: stageSlug }, user: { status: 'ACTIVE' } }, select: { id: true } })
}

export const PROJECT_LAB_KEY = 'project-lab' as const
/** Caller locks the owner; existing active rights retain their original provenance and date. */
export async function grantPlanEntitlements(tx: Prisma.TransactionClient, userId: string, slugs: string[], adminId: string, input: { source: EntitlementSource; note: string }, withProjects = false) {
  const stages = await tx.stage.findMany({ where: { slug: { in: slugs } }, orderBy: { order: 'asc' } })
  if (stages.length !== slugs.length) throw new ApiError(404, 'NOT_FOUND', '课程阶段不存在')
  const data = { status: 'ACTIVE' as const, grantedAt: new Date(), grantedByUserId: adminId, revokedAt: null, revokedByUserId: null, source: input.source, note: input.note }
  for (const stage of stages) {
    const where = { userId_stageId: { userId, stageId: stage.id } }
    const current = await tx.entitlement.findUnique({ where })
    if (current?.status === 'ACTIVE') continue
    await tx.entitlement.upsert({ where, create: { userId, stageId: stage.id, ...data }, update: data })
  }
  if (withProjects) {
    const where = { userId_productKey: { userId, productKey: PROJECT_LAB_KEY } }
    const current = await tx.productEntitlement.findUnique({ where })
    if (current?.status !== 'ACTIVE') await tx.productEntitlement.upsert({ where, create: { userId, productKey: PROJECT_LAB_KEY, ...data }, update: data })
  }
  return stages
}
export async function hasProductAccess(userId: string, productKey: typeof PROJECT_LAB_KEY, client: Prisma.TransactionClient = db) {
  return !!await client.productEntitlement.findFirst({ where: { userId, productKey, status: 'ACTIVE', user: { status: 'ACTIVE' } }, select: { id: true } })
}
