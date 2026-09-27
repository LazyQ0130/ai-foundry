import { Router } from 'express'
import { db } from '../../db.js'
import { pageSchema } from '../../utils/validation.js'
import { maskPhone } from '../../services/auth.js'
export const auditRoutes = Router()
auditRoutes.get('/', async (req, res) => {
  const input = pageSchema.parse(req.query)
  const where = input.query ? { target: { phone: { contains: input.query.replace(/\s/g, '') } } } : {}
  const [rows, total] = await db.$transaction([
    db.adminAuditLog.findMany({ where, include: { admin: { select: { nickname: true } }, target: { select: { nickname: true, phone: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (input.page - 1) * input.pageSize, take: input.pageSize }),
    db.adminAuditLog.count({ where }),
  ])
  res.json({ data: { activity: rows.map((r) => ({ id: r.id, userId: r.targetUserId, at: r.createdAt, userName: r.target?.nickname ?? '课程设置', phoneMasked: r.target ? maskPhone(r.target.phone) : '', adminName: r.admin.nickname, action: r.action, detail: r.detail, metadata: r.metadata })), pagination: { page: input.page, total, pages: Math.ceil(total / input.pageSize) } } })
})
