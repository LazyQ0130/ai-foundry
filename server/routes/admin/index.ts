import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { requireAdmin } from '../../middleware/admin.js'
import { usersRoutes } from './users.js'
import { entitlementRoutes } from './entitlements.js'
import { auditRoutes } from './audit.js'
import { adminCourseRoutes } from './courses.js'
export const adminRoutes = Router()
adminRoutes.use(requireAuth, requireAdmin)
adminRoutes.use('/users', usersRoutes, entitlementRoutes)
adminRoutes.use('/audit', auditRoutes)
adminRoutes.use('/courses', adminCourseRoutes)
