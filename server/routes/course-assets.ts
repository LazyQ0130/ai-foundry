import { Router } from 'express'
import path from 'node:path'
import { stat } from 'node:fs/promises'
import { requireAuth } from '../middleware/auth.js'
import { ApiError } from '../middleware/error.js'
import { hasStageAccess } from '../services/entitlement.js'
import { courseAssets, isCourseAssetId, type CourseAssetId } from '../../src/data/courseAssets.js'

// Fixed server-only allowlist: never resolve any request parameter as a file path.
const files: Record<CourseAssetId, { path: string; stage: string }> = {
  'stage1-starter': { path: path.resolve('starter/aifoundry-stage1-starter.zip'), stage: 'stage-1' },
}
function asset(id: unknown) {
  if (typeof id !== 'string' || !isCourseAssetId(id)) throw new ApiError(404, 'NOT_FOUND', '课程资源不存在')
  return { ...courseAssets[id], ...files[id] }
}
export const courseAssetRoutes = Router()
courseAssetRoutes.get('/course-assets/:assetId/info', async (req, res) => {
  const item = asset(req.params.assetId)
  const info = await stat(item.path)
  res.json({ data: { bytes: info.size, format: item.format } })
})
courseAssetRoutes.get('/course-assets/:assetId', requireAuth, async (req, res, next) => {
  const item = asset(req.params.assetId)
  if (req.user!.role !== 'ADMIN' && !await hasStageAccess(req.user!.id, item.stage)) {
    throw new ApiError(403, 'STAGE_ACCESS_REQUIRED', 'Starter 属于 Stage 1 付费课程资源，开通 Stage 1 后即可下载。')
  }
  res.type('application/zip')
  res.download(item.path, item.filename, { cacheControl: false, acceptRanges: false, dotfiles: 'deny' }, error => {
    if (error) next(error)
  })
})
