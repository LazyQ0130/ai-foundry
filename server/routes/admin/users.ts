import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { db } from '../../db.js'
import { maskPhone } from '../../services/auth.js'
import { idSchema, noteSchema, pageSchema, slugSchema } from '../../utils/validation.js'
import { ApiError } from '../../middleware/error.js'
import { totalLessons } from '../../../src/data/courses.js'

export const usersRoutes = Router()
const include = { entitlements: { where: { status: 'ACTIVE' as const }, include: { stage: true } }, productEntitlements: { where: { status: 'ACTIVE' as const }, select: { productKey: true } }, progress: true } satisfies Prisma.UserInclude
type Row = Prisma.UserGetPayload<{ include: typeof include }>
function summary(user: Row) {
  return { id: user.id, name: user.nickname, phoneMasked: maskPhone(user.phone), createdAt: user.createdAt, lastLogin: user.lastLoginAt, entitlements: user.entitlements.map((e) => e.stage.order), productEntitlements: user.productEntitlements.map((e) => e.productKey), progress: Math.round(user.progress.filter((p) => p.status === 'COMPLETED').length / totalLessons * 100), disabled: user.status === 'DISABLED', role: user.role }
}
usersRoutes.get('/', async (req, res) => {
  const input = pageSchema.extend({ status: z.enum(['ACTIVE', 'DISABLED']).optional(), stage: slugSchema.optional(), access: z.enum(['enrolled', 'unenrolled']).optional(), sort: z.enum(['asc', 'desc']).default('desc') }).parse(req.query)
  const where: Prisma.UserWhereInput = {
    ...(input.query ? { OR: [{ phone: { contains: input.query.replace(/\s/g, '') } }, { nickname: { contains: input.query, mode: 'insensitive' } }] } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.stage ? { entitlements: { some: { status: 'ACTIVE', stage: { slug: input.stage } } } } : input.access ? { entitlements: input.access === 'enrolled' ? { some: { status: 'ACTIVE' } } : { none: { status: 'ACTIVE' } } } : {}),
  }
  const [rows, total, count, enrolled, disabled, thisWeek, allAccess] = await db.$transaction([
    db.user.findMany({ where, include, orderBy: [{ createdAt: input.sort }, { id: input.sort }], skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    db.user.count({ where }), db.user.count(), db.user.count({ where: { entitlements: { some: { status: 'ACTIVE' } } } }),
    db.user.count({ where: { status: 'DISABLED' } }), db.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    db.user.count({ where: { AND: [1, 2, 3, 4].map((order) => ({ entitlements: { some: { status: 'ACTIVE', stage: { order } } } })) } }),
  ])
  res.json({ data: { users: rows.map(summary), pagination: { page: input.page, pageSize: input.pageSize, total, pages: Math.ceil(total / input.pageSize) }, stats: { total: count, enrolled, disabled, thisWeek, allAccess } } })
})
usersRoutes.get('/:id', async (req, res) => {
  const user = await db.user.findUnique({ where: { id: idSchema.parse(req.params.id) }, include })
  if (!user) throw new ApiError(404, 'NOT_FOUND', '用户不存在')
  const activity = await db.adminAuditLog.findMany({ where: { targetUserId: user.id }, orderBy: { createdAt: 'desc' }, take: 20, include: { admin: { select: { nickname: true } } } })
  res.json({ data: { ...summary(user), phone: user.phone, phoneVerified: user.phoneVerified, internalNote: user.internalNote, learning: user.progress, recentLesson: [...user.progress].sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime())[0] ?? null, activity } })
})
usersRoutes.patch('/:id/note', async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const { note } = z.object({ note: noteSchema }).parse(req.body)
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { internalNote: note } })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: 'EDIT_USER_NOTE', detail: note, metadata: {} } })
  })
  res.json({ data: { success: true } })
})
for (const action of ['disable', 'enable'] as const) usersRoutes.post(`/:id/${action}`, async (req, res) => {
  const id = idSchema.parse(req.params.id)
  if (id === req.user!.id && action === 'disable') throw new ApiError(409, 'CONFLICT', '不能禁用当前管理员账号')
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${id} FOR UPDATE`
    await tx.user.update({ where: { id }, data: { status: action === 'disable' ? 'DISABLED' : 'ACTIVE' } })
    if (action === 'disable') await tx.session.deleteMany({ where: { userId: id } })
    await tx.adminAuditLog.create({ data: { adminUserId: req.user!.id, targetUserId: id, action: action === 'disable' ? 'DISABLE_USER' : 'ENABLE_USER', detail: action === 'disable' ? '禁用账号并撤销全部会话' : '恢复账号', metadata: {} } })
  })
  res.json({ data: { success: true } })
})
