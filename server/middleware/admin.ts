import type { RequestHandler } from 'express'
import { ApiError } from './error.js'
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'ADMIN') throw new ApiError(403, 'FORBIDDEN', '需要管理员权限')
  next()
}
