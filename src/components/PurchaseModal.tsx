import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authDestination, authPath } from '../lib/authNavigation'
import { useAuth, type User } from '../auth/AuthProvider'
import { api, ApiError, errorMessage, jsonBody } from '../lib/api'
import { purchaseAuthReturn, purchaseStatusLabels, retryImageUrl, type Purchase } from '../lib/purchases'
import { useCatalogue } from '../data/catalog'
import { learningSupport } from '../data/learningSupport'
import type { Plan } from '../data/site'
import { isPlanOpen } from '../data/planAccess'
import { Modal } from './AdminControls'
import PaymentProofForm from './PaymentProofForm'

function ContactInfo() {
  const { purchase, loading, error, refresh } = useCatalogue()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
    {loading ? <p role="status">正在加载联系信息…</p> : error ? <p role="alert">联系信息暂时无法加载。</p> : <>
      {purchase.wechatQrUrl && !failed && <img src={retryImageUrl(purchase.wechatQrUrl, attempt)} alt="管理员联系微信二维码" className="mx-auto h-40 w-40 object-contain" onError={() => setFailed(true)} />}
      {failed && <p role="alert" className="text-sm">联系二维码加载失败。</p>}
      {purchase.wechatContact && <p className="mt-2 break-all text-sm">管理员微信：<span className="select-all font-semibold">{purchase.wechatContact}</span></p>}
      {!purchase.wechatQrUrl && !purchase.wechatContact && <p role="status" className="text-sm">管理员暂未配置联系信息，请稍后查看。</p>}
    </>}
    {(error || failed) && <button type="button" className="btn btn-sm btn-outline mt-3" onClick={() => { setFailed(false); setAttempt((value) => value + 1); if (error) void refresh() }}>重新加载联系信息</button>}
  </div>
}

export default function PurchaseModal({ plan, purchaseId, returnTo, onClose }: { plan?: Plan; purchaseId?: string; returnTo?: string; onClose: () => void }) {
  const { user, applyUser } = useAuth()
  const { purchase: config, loading: configLoading, error: configError, refresh } = useCatalogue()
  const location = useLocation()
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [method, setMethod] = useState<'ALIPAY' | 'WECHAT'>('ALIPAY')
  const [failedQr, setFailedQr] = useState(false)
  const [qrAttempt, setQrAttempt] = useState(0)
  const [expandedQr, setExpandedQr] = useState(false)
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(false)
  const checkout = !!plan || !!purchaseId
  const owned = !!user && !!plan && isPlanOpen(plan.id, user.entitlements, user.productEntitlements)
  const safeReturnTo = returnTo ? authDestination(returnTo, 'STUDENT') : undefined
  const learningReturnTo = safeReturnTo && /^\/(?:lesson\/|stage\/|capstone(?:\/|$))/.test(safeReturnTo) ? safeReturnTo : undefined
  const learningTo = learningReturnTo || (purchase?.planId === 'all-access-projects' || plan?.id === 'all-access-projects' ? '/capstone' : (purchase?.planId || plan?.id || '').startsWith('stage-') ? `/stage/${purchase?.planId || plan?.id}` : '/dashboard')
  const authReturnTo = plan ? purchaseAuthReturn(plan.id, location.pathname, location.search, location.hash, safeReturnTo) : location.pathname + location.search + location.hash
  useEffect(() => {
    if (!checkout || !user || owned) return
    let alive = true
    setLoading(true); setError(''); setPurchase(null)
    const request = purchaseId ? api<Purchase>(`/purchases/${purchaseId}`) : api<Purchase>('/purchases/prepare', { method: 'POST', body: jsonBody({ planId: plan!.id }) })
    void request.then((row) => { if (alive) { setPurchase(row); if (row.paymentMethod) setMethod(row.paymentMethod) } }).catch(async (e) => {
      if (!alive) return
      if (e instanceof ApiError && e.code === 'ALREADY_OWNED') {
        try { const current = await api<User>('/me'); if (alive) applyUser(current) }
        catch (refreshError) { if (alive) setError(errorMessage(refreshError)) }
      } else setError(errorMessage(e))
    }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [checkout, user?.id, owned, plan?.id, purchaseId, revision])
  useEffect(() => { setFailedQr(false); setExpandedQr(false) }, [method])
  const payment = config.paymentMethods.find((item) => item.id === method)
  const copyRemark = async () => {
    if (!purchase) return
    try {
      await navigator.clipboard.writeText(purchase.paymentRemark)
      setMessage('付款备注已复制')
    } catch { setMessage('复制失败，请长按或选中上方完整备注手动复制') }
  }
  const check = async () => {
    if (!purchase) return
    setChecking(true); setError('')
    try {
      const row = await api<Purchase>(`/purchases/${purchase.id}`)
      setPurchase(row)
      const current = await api<User>('/me'); applyUser(current)
      setMessage(row.status === 'PENDING' ? '申请仍在等待管理员核实，可稍后刷新查看。' : '')
    } catch (e) { setError(errorMessage(e)) } finally { setChecking(false) }
  }
  return <Modal title={checkout ? '购买与开通' : '购买与账号帮助'} onClose={onClose} wide={checkout}>
    {!checkout ? <><ContactInfo /><p className="mt-4 text-sm leading-6 text-slate-600">添加管理员微信，说明购买、退款、课程开通或账号问题；涉及付款时，请提供注册手机号、购买方案和付款记录。</p></> : <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-4"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{purchase?.planName || (plan && `${plan.tag} · ${plan.title}`)}</p><p className="mt-1 text-xs leading-5 text-slate-600">所购阶段课程永久开放阅读。{(purchase?.planId || plan?.id) === 'all-access-projects' && '项目版另含项目工坊。'}</p></div><strong className="text-2xl text-brand-700">¥{purchase?.price ?? plan?.price ?? '—'}</strong></div>
      {owned ? <div className="mt-5"><p role="status" className="text-sm font-semibold text-emerald-700">此方案已开通，可直接开始学习。</p><Link to={learningTo} onClick={onClose} className="btn btn-md btn-primary mt-4">前往学习</Link></div> : !user ? <div className="mt-5 rounded-xl border p-5"><h3 className="font-semibold">请先登录，再扫码付款</h3><p className="mt-2 text-sm leading-6 text-slate-600">登录后生成“完整注册手机号｜课程方案”付款备注，便于核对并开通正确账号。已保留所选方案及原课程去向。</p><div className="mt-4 flex gap-3"><Link className="btn btn-md btn-primary" to={authPath('login', authReturnTo)}>登录付款</Link><Link className="btn btn-md btn-outline" to={authPath('register', authReturnTo)}>注册账号</Link></div></div> : loading ? <p role="status" className="py-8 text-sm">正在加载付款信息…</p> : purchase && <>
        <p className="mt-3 text-xs leading-6 text-slate-600 sm:mt-4">复制备注 → 扫码付款 → 管理员核实后开通</p>
        <div className="mt-3 rounded-xl border border-brand-200 p-3 sm:p-4"><p className="text-xs font-semibold text-brand-700">付款务必备注：注册手机号＋购买的课程方案</p><p className="mt-2 select-all break-all text-sm font-semibold">{purchase.paymentRemark}</p><button type="button" className="btn btn-sm btn-outline mt-3" onClick={() => void copyRemark()}>一键复制付款备注</button></div>
        {purchase.status === 'DRAFT' && <>
          <div className="mt-4 flex gap-2" role="group" aria-label="选择扫码付款方式">{config.paymentMethods.map((item) => <button type="button" key={item.id} aria-pressed={method === item.id} onClick={() => setMethod(item.id)} className={`btn btn-md flex-1 ${method === item.id ? 'btn-primary' : 'btn-outline'}`}>{item.label}</button>)}</div>
          <div className="mt-3 rounded-xl border bg-slate-50 p-3 text-center sm:p-4">
            {configLoading ? <p role="status">正在加载收款信息…</p> : configError ? <p role="alert" className="text-sm">收款信息暂时无法加载。</p> : !payment?.qrUrl ? <p role="status" className="text-sm">此付款方式暂未配置收款码，请选择其他方式或联系管理员。</p> : failedQr ? <p role="alert" className="text-sm">收款码加载失败，请重试或联系管理员。</p> : <>
              <button type="button" aria-label={`放大${payment.label}收款码`} onClick={() => setExpandedQr((value) => !value)} className="mx-auto block max-w-full"><img src={retryImageUrl(payment.qrUrl, qrAttempt)} alt={`${payment.label}收款码，收款方：${payment.recipient}`} className={`mx-auto h-auto max-w-full bg-white object-contain ${expandedQr ? 'w-[440px]' : 'w-56 min-[360px]:w-64'}`} onError={() => setFailedQr(true)} /></button>
              <p className="mt-3 text-sm font-semibold">收款方：{payment.recipient}</p><p className="mt-1 text-xs text-slate-500">核对收款方及金额 ¥{purchase.price}，付款时填写上方完整备注。</p>
              <div className="mt-3 flex justify-center gap-4 text-xs text-brand-700"><button type="button" className="underline" onClick={() => setExpandedQr((value) => !value)}>{expandedQr ? '收起' : '放大收款码'}</button><a href={payment.qrUrl} download={`AIFoundry-${payment.id}.png`} target="_blank" rel="noreferrer" className="underline">保存收款码</a></div>
            </>}
            {(configError || failedQr || !payment?.qrUrl) && <button type="button" className="btn btn-sm btn-outline mt-3" onClick={() => { setFailedQr(false); setQrAttempt((value) => value + 1); if (configError || !payment?.qrUrl) void refresh() }}>重新加载收款码</button>}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">付款后无需提交截图。管理员根据付款备注中的注册手机号和课程方案核实后开通，可在<Link to="/account" onClick={onClose} className="text-brand-700">个人中心</Link>查看课程权限。</p>
        </>}
        {purchase.status !== 'DRAFT' && <div role="status" className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4"><h3 className="font-semibold">{purchaseStatusLabels[purchase.status]}</h3><p className="mt-2 break-all text-xs">申请编号：{purchase.id}</p><p className="mt-2 text-sm leading-6">{purchase.status === 'APPROVED' ? '管理员已核实并开通对应权益。' : purchase.status === 'NEEDS_INFO' ? '请按管理员反馈补充信息后重新提交，无需再次付款。' : '已收到付款申请，管理员核实后开通。请勿重复付款。'}</p>{purchase.reviewNote && <p className="mt-2 whitespace-pre-wrap break-words text-sm">管理员反馈：{purchase.reviewNote}</p>}</div>}
        {purchase.status === 'NEEDS_INFO' && <PaymentProofForm purchase={purchase} method={method} onUpdated={(row) => { setPurchase(row); setMessage(''); window.dispatchEvent(new Event('purchases:updated')) }} />}
        {purchase.status !== 'DRAFT' && <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={checking} onClick={() => void check()} className="btn btn-sm btn-outline">{checking ? '正在查询…' : '刷新申请状态'}</button>{purchase.status === 'APPROVED' ? <Link to={learningTo} onClick={onClose} className="btn btn-sm btn-primary">前往学习</Link> : <Link to="/account" onClick={onClose} className="btn btn-sm btn-outline">个人中心查看记录</Link>}</div>}
      </>}
      {error && <div role="alert" className="mt-4 text-sm text-red-600">{error}<button type="button" className="ml-3 underline" onClick={() => setRevision((value) => value + 1)}>重新加载付款信息</button></div>}
      {message && <p role="status" className="mt-3 text-sm text-brand-700">{message}</p>}
      <details className="mt-5 border-t pt-4"><summary className="cursor-pointer text-sm text-brand-700">有问题？联系管理员</summary><div className="mt-3"><ContactInfo /></div></details>
      <p className="mt-4 text-xs leading-5 text-slate-500">付款不会自动开通，管理员核实后开通。首次开通后 72 小时内可申请退款；{learningSupport.short}第三方工具及 API 费用自理。请阅读<Link to="/terms" className="text-brand-700">《用户协议》及退款说明</Link>、<Link to="/privacy" className="text-brand-700">《隐私政策》</Link>，保留付款记录。</p>
      {safeReturnTo && <p className="mt-3 text-xs text-slate-500">已保留原课程去向。<Link to={safeReturnTo} onClick={onClose} className="ml-2 text-brand-700">返回原页面 →</Link></p>}
    </>}
  </Modal>
}
