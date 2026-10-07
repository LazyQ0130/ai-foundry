import { db } from '../db.js'
import type { Prisma } from '@prisma/client'
export async function hasStageAccess(userId: string, stageSlug: string, client: Prisma.TransactionClient = db) {
  return !!await client.entitlement.findFirst({ where: { userId, status: 'ACTIVE', stage: { slug: stageSlug }, user: { status: 'ACTIVE' } }, select: { id: true } })
}

export const PROJECT_LAB_KEY = 'project-lab' as const
export async function hasProductAccess(userId: string, productKey: typeof PROJECT_LAB_KEY, client: Prisma.TransactionClient = db) {
  return !!await client.productEntitlement.findFirst({ where: { userId, productKey, status: 'ACTIVE', user: { status: 'ACTIVE' } }, select: { id: true } })
}
