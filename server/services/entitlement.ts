import { db } from '../db.js'
import type { Prisma } from '@prisma/client'
export async function hasStageAccess(userId: string, stageSlug: string, client: Prisma.TransactionClient = db) {
  return !!await client.entitlement.findFirst({ where: { userId, status: 'ACTIVE', stage: { slug: stageSlug }, user: { status: 'ACTIVE' } }, select: { id: true } })
}
