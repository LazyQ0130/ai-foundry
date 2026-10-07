import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../db.js'
import { idSchema, noteSchema, slugSchema } from '../../utils/validation.js'
import { ApiError } from '../../middleware/error.js'
import { PROJECT_LAB_KEY } from '../../services/entitlement.js'

export const entitlementRoutes = Router()
const grantSchema = z.object({ source: z.enum(['MANUAL_PURCHASE', 'GIFT', 'COMPENSATION', 'TEST', 'OTHER']), note: noteSchema.default('') })
for (const all of [false, true]) entitlementRoutes.post(`/:id/entitlements${all ? '/all' : ''}`, async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const input = (all ? grantSchema : grantSchema.extend({ stageSlug: slugSchema })).parse(req.body)
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`
    const user = await tx.user.findUnique({ where: { id } })
    if (!user) throw new ApiError(404, 'NOT_FOUND', '用户不存在')
    const stages = await tx.stage.findMany({ where: all ? { slug: { in: ['stage-1', 'stage-2', 'stage-3', 'stage-4'] } } : { slug: (input as z.infer<typeof grantSchema> & { stageSlug: string }).stageSlug } })
    if (stages.length !== (all ? 4 : 1)) throw new ApiError(404, 'NOT_FOUND', '课程阶段不存在')
    for (const stage of stages) {
      const data = { status: 'ACTIVE' as const, grantedAt: new Date(), grantedByUserId: req.user!.id, revokedAt: null, revokedByUserId: null, source: input.source, note: input.note }
      await tx.entitlement.upsert({ where: { userId_stageId: { userId: id, stageId: stage.id } }, create: { userId: id, stageId: stage.id, ...data }, update: data })
    }
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: all ? 'GRANT_ALL_ACCESS' : 'GRANT_ENTITLEMENT', detail: input.note, metadata: { stages: stages.map((s) => s.slug), source: input.source } } })
  })
  res.json({ data: { success: true } })
})
entitlementRoutes.delete('/:id/entitlements/:stageSlug', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const stageSlug = slugSchema.parse(req.params.stageSlug)
  const { note } = z.object({ note: noteSchema.default('') }).parse(req.body ?? {})
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`
    const row = await tx.entitlement.findFirst({ where: { userId: id, stage: { slug: stageSlug } } })
    if (!row) throw new ApiError(404, 'NOT_FOUND', '权限记录不存在')
    if (row.status === 'REVOKED') return
    await tx.entitlement.update({ where: { id: row.id }, data: { status: 'REVOKED', revokedAt: new Date(), revokedByUserId: req.user!.id } })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: 'REVOKE_ENTITLEMENT', detail: note, metadata: { stages: [stageSlug] } } })
  })
  res.json({ data: { success: true } })
})

// The course bundle and Project Lab are separate records, committed together for the project plan.
entitlementRoutes.post('/:id/entitlements/projects', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const input = grantSchema.parse(req.body)
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`
    if (!await tx.user.findUnique({ where: { id }, select: { id: true } })) throw new ApiError(404, 'NOT_FOUND', '用户不存在')
    const stages = await tx.stage.findMany({ where: { slug: { in: ['stage-1', 'stage-2', 'stage-3', 'stage-4'] } }, orderBy: { order: 'asc' } })
    if (stages.length !== 4) throw new ApiError(404, 'NOT_FOUND', '课程阶段不存在')
    const data = { status: 'ACTIVE' as const, grantedAt: new Date(), grantedByUserId: req.user!.id, revokedAt: null, revokedByUserId: null, source: input.source, note: input.note }
    for (const stage of stages) await tx.entitlement.upsert({ where: { userId_stageId: { userId: id, stageId: stage.id } }, create: { userId: id, stageId: stage.id, ...data }, update: data })
    await tx.productEntitlement.upsert({ where: { userId_productKey: { userId: id, productKey: PROJECT_LAB_KEY } }, create: { userId: id, productKey: PROJECT_LAB_KEY, ...data }, update: data })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: 'GRANT_ALL_ACCESS_PROJECTS', detail: input.note, metadata: { stages: stages.map((s) => s.slug), products: [PROJECT_LAB_KEY], source: input.source } } })
  })
  res.json({ data: { success: true } })
})

entitlementRoutes.post('/:id/products/project-lab', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const input = grantSchema.parse(req.body)
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`
    if (!await tx.user.findUnique({ where: { id }, select: { id: true } })) throw new ApiError(404, 'NOT_FOUND', '用户不存在')
    const data = { status: 'ACTIVE' as const, grantedAt: new Date(), grantedByUserId: req.user!.id, revokedAt: null, revokedByUserId: null, source: input.source, note: input.note }
    await tx.productEntitlement.upsert({ where: { userId_productKey: { userId: id, productKey: PROJECT_LAB_KEY } }, create: { userId: id, productKey: PROJECT_LAB_KEY, ...data }, update: data })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: 'GRANT_PRODUCT_ENTITLEMENT', detail: input.note, metadata: { productKey: PROJECT_LAB_KEY, source: input.source } } })
  })
  res.json({ data: { success: true } })
})

entitlementRoutes.delete('/:id/products/project-lab', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const { note } = z.object({ note: noteSchema.default('') }).parse(req.body ?? {})
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`
    const row = await tx.productEntitlement.findUnique({ where: { userId_productKey: { userId: id, productKey: PROJECT_LAB_KEY } } })
    if (!row) throw new ApiError(404, 'NOT_FOUND', '权限记录不存在')
    if (row.status === 'REVOKED') return
    await tx.productEntitlement.update({ where: { id: row.id }, data: { status: 'REVOKED', revokedAt: new Date(), revokedByUserId: req.user!.id } })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: 'REVOKE_PRODUCT_ENTITLEMENT', detail: note, metadata: { productKey: PROJECT_LAB_KEY, source: row.source } } })
  })
  res.json({ data: { success: true } })
})
