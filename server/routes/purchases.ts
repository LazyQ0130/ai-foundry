import { Router, raw } from 'express'
import { randomUUID } from 'node:crypto'
import { rateLimit } from 'express-rate-limit'
import sharp from 'sharp'
import { z } from 'zod'
import { db } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { ApiError } from '../middleware/error.js'
import { idSchema, noteSchema, pageSchema } from '../utils/validation.js'
import { lockPurchaseUser, purchaseInclude, purchasePlanOwned, purchaseView, resolvePurchasePlan } from '../services/purchase.js'

export const purchasesRoutes = Router()
purchasesRoutes.use(requireAuth)
const mutationLimit = rateLimit({ windowMs: 60_000, limit: 30, keyGenerator: (req) => req.user!.id, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: '操作过于频繁，请稍后重试' } } })
purchasesRoutes.use((req, res, next) => ['POST', 'PUT'].includes(req.method) ? mutationLimit(req, res, next) : next())

purchasesRoutes.post('/prepare', async (req, res) => {
  const { planId } = z.object({ planId: z.string().max(50) }).strict().parse(req.body)
  const result = await db.$transaction(async (tx) => {
    const user = await lockPurchaseUser(tx, req.user!.id)
    // Resume existing payments even if a plan is subsequently taken off sale.
    const existing = await tx.purchase.findFirst({ where: { userId: user.id, planId, status: { not: 'APPROVED' } }, include: purchaseInclude })
    if (existing) {
      if (existing.status === 'DRAFT' && await purchasePlanOwned(tx, user.id, planId)) throw new ApiError(409, 'ALREADY_OWNED', '此方案已开通，可直接前往学习')
      return purchaseView(existing)
    }
    const plan = await resolvePurchasePlan(tx, planId)
    if (await purchasePlanOwned(tx, user.id, planId)) throw new ApiError(409, 'ALREADY_OWNED', '此方案已开通，可直接前往学习')
    return purchaseView(await tx.purchase.create({ data: { userId: user.id, ...plan, paymentRemark: `${user.phone}｜${plan.planName}` }, include: purchaseInclude }))
  })
  res.json({ data: result })
})

purchasesRoutes.get('/', async (req, res) => {
  const { page, pageSize } = pageSchema.parse(req.query)
  const where = { userId: req.user!.id, status: { not: 'DRAFT' as const } }
  const [purchases, total] = await db.$transaction([
    db.purchase.findMany({ where, include: purchaseInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
    db.purchase.count({ where }),
  ])
  res.json({ data: { purchases: purchases.map(purchaseView), pagination: { page, pages: Math.ceil(total / pageSize), total } } })
})

purchasesRoutes.get('/:id', async (req, res) => {
  const row = await db.purchase.findFirst({ where: { id: idSchema.parse(req.params.id), userId: req.user!.id }, include: purchaseInclude })
  if (!row) throw new ApiError(404, 'NOT_FOUND', '付款申请不存在')
  res.json({ data: purchaseView(row) })
})

purchasesRoutes.get('/:id/proof', async (req, res) => {
  const row = await db.purchase.findFirst({ where: { id: idSchema.parse(req.params.id), ...(req.user!.role === 'ADMIN' ? {} : { userId: req.user!.id }) }, select: { proof: true } })
  if (!row?.proof || req.query.v !== row.proof.version) throw new ApiError(404, 'NOT_FOUND', '付款凭据不存在')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.type('image/webp').send(Buffer.from(row.proof.data))
})

purchasesRoutes.put('/:id/proof', (req, _res, next) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].some((type) => req.is(type))) throw new ApiError(415, 'INVALID_IMAGE', '请选择 JPEG、PNG 或 WebP 图片')
  next()
}, raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '5mb' }), async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const owner = await db.purchase.findFirst({ where: { id, userId: req.user!.id }, select: { id: true } })
  if (!owner) throw new ApiError(404, 'NOT_FOUND', '付款申请不存在')
  let data: Buffer
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw new Error('Empty image')
    const image = sharp(req.body, { limitInputPixels: 25_000_000, failOn: 'warning', animated: true })
    const meta = await image.metadata()
    if (!['jpeg', 'png', 'webp'].includes(meta.format ?? '') || (meta.pages ?? 1) !== 1) throw new Error('Invalid image')
    data = await image.rotate().resize({ width: 2000, height: 4000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90 }).toBuffer()
  } catch { throw new ApiError(400, 'INVALID_IMAGE', '图片无效、过大或包含动画，请选择静态付款截图') }
  const row = await db.$transaction(async (tx) => {
    await lockPurchaseUser(tx, req.user!.id)
    const current = await tx.purchase.findUniqueOrThrow({ where: { id } })
    if (!['DRAFT', 'NEEDS_INFO'].includes(current.status)) throw new ApiError(409, 'INVALID_STATE', '此申请已经提交，不能修改付款凭据')
    const version = randomUUID()
    await tx.purchaseProof.upsert({ where: { purchaseId: id }, create: { purchaseId: id, data: new Uint8Array(data), version }, update: { data: new Uint8Array(data), version } })
    return tx.purchase.update({ where: { id }, data: { version: { increment: 1 } }, include: purchaseInclude })
  })
  res.json({ data: purchaseView(row) })
})

purchasesRoutes.post('/:id/submit', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const input = z.object({ paymentMethod: z.enum(['ALIPAY', 'WECHAT']), transactionId: z.string().trim().max(100).default(''), note: noteSchema.default(''), version: z.number().int().min(0) }).strict().parse(req.body)
  const row = await db.$transaction(async (tx) => {
    await lockPurchaseUser(tx, req.user!.id)
    const current = await tx.purchase.findFirst({ where: { id, userId: req.user!.id }, include: purchaseInclude })
    if (!current) throw new ApiError(404, 'NOT_FOUND', '付款申请不存在')
    if (current.status === 'PENDING' || current.status === 'APPROVED') return current
    if (current.version !== input.version) throw new ApiError(409, 'STALE_PURCHASE', '申请已更新，请刷新后重试')
    if (!current.proof) throw new ApiError(400, 'PROOF_REQUIRED', '请先上传付款截图')
    const { version: _version, ...details } = input
    return tx.purchase.update({ where: { id }, data: { ...details, status: 'PENDING', submittedAt: new Date(), version: { increment: 1 } }, include: purchaseInclude })
  })
  res.json({ data: purchaseView(row) })
})
