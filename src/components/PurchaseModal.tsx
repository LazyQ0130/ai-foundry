import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type User } from '../auth/AuthProvider'
import { api, errorMessage } from '../lib/api'
import { useCatalogue } from '../data/catalog'
import type { Plan } from '../data/site'
import { isPlanOpen } from '../data/planAccess'
import { Modal } from './AdminControls'

/**
 * 传入 plan：购买指定方案（价格页使用）。
 * 不传 plan：纯咨询场景（首页「购买与账号帮助」），不显示价格与付款步骤。
 */
export default function PurchaseModal({ plan, onClose }: { plan?: Plan; onClose: () => void }) {
  const { user, applyUser } = useAuth()
  const { purchase, loading, error, refresh } = useCatalogue()
  const [message, setMessage] = useState('')
  const [qrFailed, setQrFailed] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const checkAccess = async () => {
    setChecking(true); setCheckError('')
    try {
      const current = await api<User>('/me'); applyUser(current)
      const opened = isPlanOpen(plan?.id ?? '', current.entitlements, current.productEntitlements)
      setMessage(opened ? '方案已开通！可在个人中心查看课程及项目实战权益。' : plan?.id === 'all-access-projects' ? '当前尚未完整开通项目版。若已付款，请通过微信发送注册手机号、购买方案和付款凭据，由管理员核实。' : '当前尚未开通。若已付款，请通过微信发送注册手机号、购买方案和付款凭据，由管理员核实。')
    } catch (e) { setCheckError(errorMessage(e)) } finally { setChecking(false) }
  }
  const retryContact = () => { setQrFailed(false); void refresh() }

  return <Modal title={plan ? `购买 ${plan.tag} · ${plan.title}` : '购买与账号帮助'} onClose={onClose} wide={!!plan}>
    <div className={plan ? 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]' : ''}>
      {plan && <div className="min-w-0"><p className="text-[28px] font-bold leading-none text-brand-600">¥{plan.price}</p><p className="mt-3 text-[13px] leading-5 text-slate-700">所购阶段课程永久开放阅读。{plan.id === 'all-access-projects' ? '项目版另含 Project Lab，后续综合项目实战持续开放，内容与节奏以上线页面为准。' : ''}</p><p className="mt-3 hidden text-[12px] leading-5 text-slate-600 sm:block">扫码添加管理员，确认课程范围、付款方式与开通安排。</p></div>}
      <div className="min-w-0 rounded-xl border border-brand-100 bg-brand-50/40 p-3 text-center">
        {loading ? <p role="status" className="py-16 text-sm text-slate-500">正在加载联系信息…</p> : error ? <div role="alert" className="py-8 text-sm text-slate-600"><p>联系信息暂时无法加载。</p><button type="button" onClick={retryContact} className="btn btn-sm btn-outline mt-3">重新加载</button></div> : <>
          {purchase.wechatQrUrl && !qrFailed ? <img src={purchase.wechatQrUrl} alt="管理员联系微信二维码" className="mx-auto h-44 w-44 max-w-full object-contain" onError={() => setQrFailed(true)} /> : qrFailed ? <div role="alert" className="py-6 text-sm text-slate-600">二维码加载失败<button type="button" onClick={retryContact} className="btn btn-sm btn-outline mt-3 w-full">重新加载二维码</button></div> : null}
          {purchase.wechatContact && <div className="mt-2 text-[12px] text-slate-700">微信号：<span className="select-all break-all font-semibold">{purchase.wechatContact}</span><button type="button" className="ml-2 text-brand-700 underline" onClick={() => void navigator.clipboard.writeText(purchase.wechatContact)}>复制</button></div>}
          {!purchase.wechatQrUrl && !purchase.wechatContact && <p role="status" className="py-8 text-sm text-slate-500">管理员暂未配置联系信息，请稍后再来查看。</p>}
        </>}
      </div>
    </div>
    {plan ? <>
      <p className="mt-4 text-[12px] font-medium text-slate-700">① 加微信确认 → ② 注册账号 → ③ 发送手机号和付款凭据 → ④ 管理员核实开通</p>
      <p className="mt-3 text-[12px] leading-5 text-slate-600">注册手机号：{user?.phoneMasked ?? '尚未登录'}。付款不会自动开通；付款前请与管理员确认，开通后可在个人中心查看权限。{!user && <Link to="/register?next=/pricing" className="ml-1 text-brand-700">注册账号</Link>}</p>
      <p className="mt-3 text-[11px] leading-5 text-slate-500">首次开通后 72 小时内可申请退款；课程不含人工答疑，第三方工具及 API 费用自理。请阅读<Link to="/terms" className="text-brand-700">《用户协议》及退款说明</Link>、<Link to="/privacy" className="text-brand-700">《隐私政策》</Link>，保留付款与沟通记录。</p>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" className="text-[12px] text-brand-700 underline" onClick={() => setMessage('请在微信向管理员发送付款凭据、购买方案和完整注册手机号。此按钮仅展示操作指引，不会提交开通申请或确认到账。请以管理员核实结果和个人中心课程权限为准。')}>已付款？查看开通指引</button>{user && <><button type="button" className="btn btn-sm btn-outline" disabled={checking} onClick={() => void checkAccess()}>{checking ? '正在查询…' : '查询是否已开通'}</button><Link to="/account" className="text-[12px] text-brand-700">前往个人中心</Link></>}</div>
      {message && <p role="status" className="mt-3 text-[12px] leading-5 text-slate-600">{message}</p>}{checkError && <p role="alert" className="mt-3 text-sm text-red-600">{checkError}</p>}
    </> : <p className="mt-4 text-[13px] leading-6 text-slate-600">添加管理员微信，说明购买、退款、课程开通或账号问题；涉及已购课程时，请提供注册手机号和相关记录。</p>}
  </Modal>
}
