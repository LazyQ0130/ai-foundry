import { ApiError } from '../middleware/error.js'
import { hasProductAccess, PROJECT_LAB_KEY } from './entitlement.js'

/** Use at every future Project Lab lesson or resource endpoint. */
export async function requireProductAccess(userId: string, productKey: typeof PROJECT_LAB_KEY = PROJECT_LAB_KEY) {
  if (!await hasProductAccess(userId, productKey)) throw new ApiError(403, 'PRODUCT_ACCESS_REQUIRED', '请先开通项目版以访问项目工坊')
}
