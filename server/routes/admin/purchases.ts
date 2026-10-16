import { Router } from 'express'
import { z } from 'zod'
import { db } from '../../db.js'
import { ApiError } from '../../middleware/error.js'
import { idSchema, noteSchema, pageSchema } from '../../utils/validation.js'
import { grantPurchasePlan, lockPurchaseUser, planStageSlugs, purchaseInclude, purchaseView } from '../../services/purchase.js'

export const adminPurchaseRoutes = Router()
const include = { ...purchaseInclude, user: { select: { nickname: true, phone: true, status: true } } }
adminPurchaseRoutes.get('/', async (req, res) => {
  const input = pageSchema.extend({ status: z.enum(['PENDING', 'NEEDS_INFO', 'APPROVED', 'ALL']).default('PENDING'), planId: z.string().max(50).optional() }).parse(req.query)
  const where = { status: input.status === 'ALL' ? { not: 'DRAFT' as const } : input.status, ...(input.planId ? { planId: input.planId } : {}), ...(input.query ? { user: { phone: { contains: input.query } } } : {}) }
  const [rows, total] = await db.$transaction([
    db.purchase.findMany({ where, include, orderBy: [{ submittedAt: 'asc' }, { id: 'asc' }], skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    db.purchase.count({ where }),
  ])
  res.json({ data: { purchases: rows.map(purchaseView), pagination: { page: input.page, pages: Math.ceil(total / input.pageSize), total } } })
})
adminPurchaseRoutes.get('/:id', async (req, res) => {
  const row = await db.purchase.findUnique({ where: { id: idSchema.parse(req.params.id) }, include })
  if (!row) throw new ApiError(404, 'NOT_FOUND', '付款申请不存在')
  res.json({ data: purchaseView(row) })
})
adminPurchaseRoutes.post('/:id/review', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const input = z.object({ action: z.enum(['APPROVE', 'NEEDS_INFO']), note: noteSchema.default(''), version: z.number().int().min(0), confirmedReceived: z.boolean().default(false) }).strict().parse(req.body)
  if (input.action === 'NEEDS_INFO' && !input.note) throw new ApiError(400, 'NOTE_REQUIRED', '请填写需要补充的信息')
  if (input.action === 'APPROVE' && !input.confirmedReceived) throw new ApiError(400, 'RECEIPT_REQUIRED', '请先核对实际收款记录并确认到账')
  const result = await db.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({ where: { id } })
    if (!purchase) throw new ApiError(404, 'NOT_FOUND', '付款申请不存在')
    // All purchase writes lock the owner first, including the existing grant/disable routes.
    await lockPurchaseUser(tx, purchase.userId)
    const current = await tx.purchase.findUniqueOrThrow({ where: { id }, include: purchaseInclude })
    if (current.status === 'APPROVED' && input.action === 'APPROVE') return purchaseView(current)
    if (current.status !== 'PENDING' || current.version !== input.version) throw new ApiError(409, 'STALE_PURCHASE', '申请状态已变化，请刷新后核实')
    if (!current.proof || !current.paymentMethod) throw new ApiError(409, 'INCOMPLETE_PURCHASE', '付款资料不完整，无法审核')
    if (input.action === 'APPROVE') await grantPurchasePlan(tx, current, req.user!.id)
    const row = await tx.purchase.update({ where: { id }, data: { status: input.action === 'APPROVE' ? 'APPROVED' : 'NEEDS_INFO', reviewNote: input.note, reviewedById: req.user!.id, reviewedAt: new Date(), version: { increment: 1 } }, include: purchaseInclude })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: row.userId, action: input.action === 'APPROVE' ? 'APPROVE_PURCHASE' : 'REQUEST_PURCHASE_INFO', detail: input.note || '核实到账并开通课程', metadata: { purchaseId: id, planId: row.planId, price: row.price, paymentMethod: row.paymentMethod, transactionId: row.transactionId, submissionNote: row.note, proofVersion: current.proof.version, stages: input.action === 'APPROVE' ? planStageSlugs(row.planId) : [], products: input.action === 'APPROVE' && row.planId === 'all-access-projects' ? ['project-lab'] : [] } } })
    return purchaseView(row)
  })
  res.json({ data: result })
})
