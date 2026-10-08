import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { env } from './config/env.js'
import { ApiError, errorHandler } from './middleware/error.js'
import { optionalAuth } from './middleware/auth.js'
import { authRoutes } from './routes/auth.js'
import { meRoutes } from './routes/me.js'
import { adminRoutes } from './routes/admin/index.js'
import { courseRoutes } from './routes/courses.js'
import { courseAssetRoutes } from './routes/course-assets.js'
import { capstoneRoutes } from './routes/capstone.js'
import { progressRoutes } from './routes/progress.js'
import { createEmailRoutes } from './routes/email.js'

export const app = express()
app.disable('x-powered-by')
app.set('trust proxy', env.TRUST_PROXY_HOPS)
app.use(helmet({ contentSecurityPolicy: { directives: { 'img-src': ["'self'", 'data:', 'blob:', 'https:'], 'upgrade-insecure-requests': env.NODE_ENV === 'production' ? [] : null } } }))
app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() })
app.use('/api', (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && (req.get('origin') !== env.APP_ORIGIN || req.get('sec-fetch-site') === 'cross-site')) {
    throw new ApiError(403, 'FORBIDDEN', '请求来源不被允许')
  }
  next()
})
app.use(express.json({ limit: '32kb' }))
app.use(cookieParser())
app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok' } }))
// API routes are mounted above this boundary.
app.use('/api', optionalAuth)
app.use('/api/auth', authRoutes)
app.use('/api/auth', createEmailRoutes())
app.use('/api/me', meRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', courseRoutes)
app.use('/api', courseAssetRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/capstone', capstoneRoutes)
app.use('/api', (_req, _res) => { throw new ApiError(404, 'NOT_FOUND', '接口不存在') })
if (env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('dist'), { index: false, dotfiles: 'deny' }))
  app.get('/{*path}', (_req, res) => res.sendFile(path.resolve('dist/index.html')))
}
app.use(errorHandler)
