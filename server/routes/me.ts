import { Router, raw } from 'express'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { z } from 'zod'
import { db } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { publicUser } from '../services/auth.js'
import { ApiError } from '../middleware/error.js'

export const meRoutes = Router()

meRoutes.get('/', requireAuth, async (req, res) => { res.json({ data: await publicUser(req.user!) }) })

meRoutes.get('/avatar', requireAuth, async (req, res) => {
  const avatar = await db.userAvatar.findUnique({ where: { userId: req.user!.id } })
  if (!avatar || req.query.v !== avatar.version) throw new ApiError(404, 'NOT_FOUND', '头像不存在')
  res.type('image/webp').send(Buffer.from(avatar.data))
})

meRoutes.put('/avatar', requireAuth, (req, _res, next) => {
  if (!req.is('image/webp')) throw new ApiError(415, 'INVALID_IMAGE', '请上传裁剪后的 WebP 图片')
  next()
}, raw({ type: 'image/webp', limit: '1mb' }), async (req, res) => {
  let data: Buffer
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) throw new Error('Empty image')
    const image = sharp(req.body, { limitInputPixels: 25_000_000, failOn: 'warning' })
    const meta = await image.metadata()
    if (meta.format !== 'webp' || (meta.pages ?? 1) > 1) throw new Error('Invalid format')
    data = await image.rotate().resize(512, 512, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()
    if (data.length > 300 * 1024) throw new Error('Output too large')
  } catch {
    throw new ApiError(400, 'INVALID_IMAGE', '图片无效或过大，请选择静态图片后重试')
  }
  const version = randomUUID()
  const storedData = new Uint8Array(data)
  const user = await db.$transaction(async (tx) => {
    // Lock the user before changing the one-to-one image so concurrent updates stay consistent.
    const user = await tx.user.update({ where: { id: req.user!.id }, data: { avatarUrl: `/api/me/avatar?v=${version}` } })
    await tx.userAvatar.upsert({ where: { userId: user.id }, create: { userId: user.id, data: storedData, version }, update: { data: storedData, version } })
    return user
  })
  res.json({ data: await publicUser(user) })
})

meRoutes.delete('/avatar', requireAuth, async (req, res) => {
  const user = await db.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id: req.user!.id }, data: { avatarUrl: null } })
    if (await tx.userAvatar.findUnique({ where: { userId: user.id }, select: { userId: true } })) {
      await tx.userAvatar.delete({ where: { userId: user.id } })
    }
    return user
  })
  res.json({ data: await publicUser(user) })
})

/** 已开通的课程权限，含开通时间与来源。没有订单系统，这条记录就是用户的购买凭据。 */
meRoutes.get('/entitlements', requireAuth, async (req, res) => {
  const rows = await db.entitlement.findMany({
    where: { userId: req.user!.id, status: 'ACTIVE' },
    include: { stage: true },
    orderBy: { stage: { order: 'asc' } },
  })
  res.json({
    data: rows.map((row) => ({
      stageSlug: row.stage.slug,
      stageTitle: row.stage.title,
      price: row.stage.price,
      grantedAt: row.grantedAt,
      source: row.source,
    })),
  })
})

const nicknameSchema = z.object({ nickname: z.string().trim().min(1).max(50) })
meRoutes.patch('/', requireAuth, async (req, res) => {
  const input = nicknameSchema.parse(req.body)
  const user = await db.user.update({ where: { id: req.user!.id }, data: { nickname: input.nickname } })
  res.json({ data: await publicUser(user) })
})
