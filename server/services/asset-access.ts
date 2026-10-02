import type { User } from '@prisma/client'
import { ApiError } from '../middleware/error.js'
import { hasStageAccess } from './entitlement.js'

export type AssetAccess = { access: 'authenticated-preview' } | { access: 'stage-entitlement'; stage: string } | { access: 'admin-only' }
export async function requireAssetAccess(user: User | undefined, policy: AssetAccess) {
  if (!user || user.status !== 'ACTIVE') throw new ApiError(401, 'UNAUTHORIZED', '请先登录')
  if (user.role === 'ADMIN' && policy.access !== 'stage-entitlement') return
  switch (policy.access) {
    case 'authenticated-preview': return
    case 'stage-entitlement': if (await hasStageAccess(user.id, policy.stage)) return; break
    case 'admin-only': break
    default: throw new ApiError(403, 'FORBIDDEN', '资源访问策略无效')
  }
  throw new ApiError(403, 'FORBIDDEN', '当前账号没有此资源的下载权限')
}
