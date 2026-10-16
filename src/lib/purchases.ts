export type PurchaseStatus = 'DRAFT' | 'PENDING' | 'NEEDS_INFO' | 'APPROVED'
export type Purchase = {
  id: string; planId: string; planName: string; price: number; paymentRemark: string
  status: PurchaseStatus; paymentMethod: 'ALIPAY' | 'WECHAT' | null
  transactionId: string; note: string; reviewNote: string; proofUrl: string | null
  version: number; createdAt: string; submittedAt: string | null
}
export type PurchaseList = { purchases: Purchase[]; pagination: { page: number; pages: number; total: number } }
export const purchaseStatusLabels: Record<PurchaseStatus, string> = { DRAFT: '待付款', PENDING: '待核实', NEEDS_INFO: '需补充信息', APPROVED: '已开通' }
export const paymentMethodLabels = { ALIPAY: '支付宝', WECHAT: '微信支付' }

export function retryImageUrl(url: string, attempt: number) {
  if (!attempt) return url
  const [path, hash] = url.split('#')
  return `${path}${path.includes('?') ? '&' : '?'}qrRetry=${attempt}${hash ? `#${hash}` : ''}`
}

/** Reopen the selected checkout after authentication, including its learning destination. */
export function purchaseAuthReturn(planId: string, pathname: string, search: string, hash: string, returnTo?: string) {
  const params = new URLSearchParams(pathname === '/pricing' ? search : '')
  params.set('purchase', planId)
  params.set('purchaseReturnTo', returnTo || pathname + search + hash)
  return `/pricing?${params}${pathname === '/pricing' ? hash : ''}`
}
