import type { Prisma, Purchase } from '@prisma/client'
import { env } from '../config/env.js'
import { ApiError } from '../middleware/error.js'
import { planTemplates } from '../../src/data/site.js'
import { grantPlanEntitlements, PROJECT_LAB_KEY } from './entitlement.js'

export const purchaseInclude = { proof: { select: { version: true } } } satisfies Prisma.PurchaseInclude
export function purchaseView<T extends Purchase & { proof: { version: string } | null }>(row: T) {
  const { proof, ...fields } = row
  return { ...fields, proofUrl: proof ? `/api/purchases/${row.id}/proof?v=${proof.version}` : null }
}

export async function lockPurchaseUser(tx: Prisma.TransactionClient, userId: string) {
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== 'ACTIVE') throw new ApiError(409, 'ACCOUNT_DISABLED', '账号不可用，请联系管理员')
  return user
}

export async function resolvePurchasePlan(tx: Prisma.TransactionClient, planId: string) {
  const template = planTemplates.find((plan) => plan.id === planId)
  if (!template) throw new ApiError(400, 'INVALID_PLAN', '购买方案不存在')
  const stages = await tx.stage.findMany({ where: { slug: { in: planStageSlugs(planId) }, isPublished: true, isPurchasable: true } })
  if (stages.length !== planStageSlugs(planId).length) throw new ApiError(409, 'PLAN_UNAVAILABLE', '此方案暂不开放购买')
  const price = planId === 'all-access-projects' ? env.ALL_ACCESS_PROJECTS_PRICE : planId === 'all-access' ? env.ALL_ACCESS_PRICE : stages[0].price
  return { planId, planName: `${template.tag} · ${template.title}`, price }
}

export function planStageSlugs(planId: string) {
  return planId.startsWith('stage-') ? [planId] : ['stage-1', 'stage-2', 'stage-3', 'stage-4']
}

export async function purchasePlanOwned(tx: Prisma.TransactionClient, userId: string, planId: string) {
  const slugs = planStageSlugs(planId)
  const count = await tx.entitlement.count({ where: { userId, status: 'ACTIVE', stage: { slug: { in: slugs } } } })
  return count === slugs.length && (planId !== 'all-access-projects' || !!await tx.productEntitlement.findFirst({ where: { userId, productKey: PROJECT_LAB_KEY, status: 'ACTIVE' } }))
}

/** Keep original grant dates on existing active access; reactivation gets a new date. */
export async function grantPurchasePlan(tx: Prisma.TransactionClient, purchase: Purchase, adminId: string) {
  await grantPlanEntitlements(tx, purchase.userId, planStageSlugs(purchase.planId), adminId, { source: 'MANUAL_PURCHASE', note: `付款申请 ${purchase.id}` }, purchase.planId === 'all-access-projects')
}
