import { Router } from 'express'
import path from 'node:path'
import { stat } from 'node:fs/promises'
import { requireAuth } from '../middleware/auth.js'
import { ApiError } from '../middleware/error.js'
import { requireAssetAccess, type AssetAccess } from '../services/asset-access.js'
import { courseAssets, isCourseAssetId, type CourseAssetId } from '../../src/data/courseAssets.js'

// Fixed server-only allowlist: never resolve any request parameter as a file path.
const files: Record<CourseAssetId, { path: string; policy: AssetAccess }> = {
  'stage1-starter': { path: path.resolve('starter/aifoundry-stage1-starter.zip'), policy: { access: 'authenticated-preview' } },
  'stage3-starter': { path: path.resolve('starter/aifoundry-stage3-starter.zip'), policy: { access: 'stage-entitlement', stage: 'stage-3' } },
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
  await requireAssetAccess(req.user, item.policy)
  res.type('application/zip')
  res.download(item.path, item.filename, { cacheControl: false, acceptRanges: false, dotfiles: 'deny' }, error => {
    if (error) next(error)
  })
})
