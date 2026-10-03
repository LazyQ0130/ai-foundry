import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type User } from '../auth/AuthProvider'
import { api, errorMessage } from '../lib/api'
import { useCatalogue } from '../data/catalog'
import type { Plan } from '../data/site'
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
      const opened = plan?.id === 'all-access' ? ['stage-1', 'stage-2', 'stage-3', 'stage-4'].every(id => current.entitlements.includes(id)) : current.entitlements.includes(plan?.id ?? '')
      setMessage(opened ? '课程已开通！可进入个人中心，点击对应阶段继续学习。' : '当前尚未开通。若已付款，请通过微信发送注册手机号、购买方案和付款凭据，由管理员核实。')
    } catch (e) { setCheckError(errorMessage(e)) } finally { setChecking(false) }
  }
  const retryContact = () => { setQrFailed(false); void refresh() }

  return (
    <Modal title={plan ? `购买 ${plan.tag} · ${plan.title}` : '购买与账号帮助'} onClose={onClose}>
      {plan ? <p className="text-xl font-bold text-brand-600">¥ {plan.price}</p> : null}
      {plan && <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm leading-6 text-slate-700">图文讲解 · 永久开放阅读。首次开通后 72 小时内可申请退款，具体处理方式以《用户协议》为准。课程不含人工答疑，第三方工具及 API 费用由学员自行承担。<Link to="/terms" className="ml-1 text-brand-600">查看退款说明</Link></div>}

      <ol className="my-5 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-600">
        {plan ? (
          <>
            <li>扫码添加管理员微信，确认课程和付款方式</li>
            <li>注册 AIFoundry 账号</li>
            <li>将注册手机号发送给管理员</li>
            <li>管理员确认后为你开通课程</li>
          </>
        ) : (
          <>
            <li>扫码添加管理员微信</li>
            <li>说明购买、退款、课程开通或账号问题</li>
            <li>涉及已购课程时，提供注册手机号和相关记录，方便核查</li>
          </>
        )}
      </ol>

      {loading ? <p role="status" className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">正在加载联系信息…</p> : error ? (
        <div role="alert" className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-600">
          <p>联系信息暂时无法加载，请稍后重试。</p>
          <button type="button" onClick={retryContact} className="btn btn-sm btn-outline mt-3">重新加载联系信息</button>
        </div>
      ) : <>
      {purchase.wechatQrUrl && !qrFailed ? (
        <figure>
          <img
            src={purchase.wechatQrUrl}
            alt="管理员联系微信二维码"
            className="mx-auto h-60 w-60 max-w-full object-contain"
            onError={() => setQrFailed(true)}
          />
          <figcaption className="mt-2 text-center text-sm text-slate-600">
            扫码添加微信，处理购买、退款、开通或账号问题
          </figcaption>
        </figure>
      ) : qrFailed ? <div role="alert" className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-600"><p>二维码加载失败，请重试{purchase.wechatContact ? '，或通过下方微信号联系。' : '。'}</p><button type="button" onClick={retryContact} className="btn btn-sm btn-outline mt-3">重新加载二维码</button></div> : null}

      {purchase.wechatContact && (
        <p className="mt-3 break-all text-center text-sm">联系微信：{purchase.wechatContact}</p>
      )}
      {!purchase.wechatQrUrl && !purchase.wechatContact && <p role="status" className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">管理员暂未配置联系信息，请稍后再来查看。</p>}
      </>}

      {plan ? (
        <>
          <p className="mt-5 text-sm">注册手机号：{user?.phoneMasked ?? '尚未登录'}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">付款不会自动开通。付款前请与管理员确认课程范围与开通安排；付款后请在微信发送完整注册手机号、购买方案与付款凭据。开通后可在个人中心查看课程权限。</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">请先阅读<Link to="/terms" className="text-brand-600">《用户协议》</Link>与<Link to="/privacy" className="text-brand-600">《隐私政策》</Link>，保留付款与沟通记录。</p>
          {!user && (
            <Link to="/register?next=/pricing" className="mt-2 inline-block text-sm text-brand-600">
              注册账号
            </Link>
          )}
          <button
            className="btn btn-md btn-primary mt-5 w-full"
            onClick={() => setMessage('请在微信向管理员发送付款凭据、购买方案和完整注册手机号。此按钮仅展示操作指引，不会提交开通申请或确认到账。请以管理员核实结果和个人中心课程权限为准。')}
          >
            已付款？查看开通指引
          </button>
          {message && (
            <p role="status" className="mt-3 text-sm leading-6 text-slate-600">
              {message}
            </p>
          )}
          {user && <><button type="button" className="btn btn-md btn-outline mt-3 w-full" disabled={checking} onClick={() => void checkAccess()}>{checking ? '正在查询…' : '查询是否已开通'}</button><Link to="/account" className="mt-3 block text-center text-sm text-brand-600">前往个人中心查看课程</Link></>}
          {checkError && <p role="alert" className="mt-3 text-sm text-red-600">{checkError}</p>}
        </>
      ) : null}
    </Modal>
  )
}
