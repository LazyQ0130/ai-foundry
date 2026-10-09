import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { stages } from '../data/courses'
import { api, errorMessage, jsonBody } from '../lib/api'

export type Activity = { id: string; userId: string; at: string; userName: string; adminName: string; phoneMasked: string; action: string; detail: string; metadata: { stages?: string[]; products?: string[]; productKey?: string } }
export type AdminUser = { id: string; name: string; phone: string; phoneMasked: string; createdAt: string; lastLogin: string | null; entitlements: number[]; productEntitlements: string[]; progress: number; disabled: boolean; internalNote?: string; recentLesson?: { lessonId: string; lastVisitedAt: string } | null; learning?: { lessonId: string; status: string }[]; activity?: { id: string; action: string; detail: string; createdAt: string }[] }
export const actionLabels: Record<string, string> = { GRANT_ENTITLEMENT: '开通课程', REVOKE_ENTITLEMENT: '撤销课程', GRANT_ALL_ACCESS: '开通全阶段课程版', GRANT_ALL_ACCESS_PROJECTS: '开通项目版', GRANT_PRODUCT_ENTITLEMENT: '开通项目工坊', REVOKE_PRODUCT_ENTITLEMENT: '撤销项目工坊', DISABLE_USER: '禁用账号', ENABLE_USER: '启用账号', EDIT_USER_NOTE: '修改备注', EDIT_STAGE: '修改阶段', EDIT_LESSON: '修改课程' }
export const formatTime = (value: string | null) => value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '—'
export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const dialog = useRef<HTMLElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? []).filter((element) => element.getClientRects().length)
    focusable()[0]?.focus({ preventScroll: true })
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0], last = items[items.length - 1]
      if (!first) { event.preventDefault(); dialog.current?.focus(); return }
      if (!dialog.current?.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus()
      }
    }
    window.addEventListener('keydown', keydown)
    return () => { window.removeEventListener('keydown', keydown); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button type="button" tabIndex={-1} aria-label="关闭弹窗" className="absolute inset-0 bg-slate-900/35" onClick={onClose} /><section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`relative z-10 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${wide ? 'max-h-[94vh] max-w-2xl p-4 sm:p-6' : 'max-h-[90vh] max-w-lg p-6'}`}><div className={`${wide ? 'mb-4' : 'mb-5'} flex justify-between gap-3`}><h2 className="text-xl font-bold">{title}</h2><button type="button" aria-label="关闭" onClick={onClose}><X className="h-5 w-5" /></button></div>{children}</section></div>
}
export function AccessModal({ user, onClose, onUpdated }: { user: AdminUser; onClose: () => void; onUpdated: () => Promise<void> }) {
  const [source, setSource] = useState('MANUAL_PURCHASE')
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const change = async (slug: string, revoke = false) => {
    setPending(true); setError('')
    try { await api(`/admin/users/${user.id}/entitlements${slug === 'all' ? '/all' : revoke ? `/${slug}` : ''}`, { method: revoke ? 'DELETE' : 'POST', body: jsonBody({ stageSlug: slug, source, note }) }); await onUpdated() } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  const changeProduct = async (revoke = false) => {
    setPending(true); setError('')
    try { await api(`/admin/users/${user.id}/products/project-lab`, { method: revoke ? 'DELETE' : 'POST', body: jsonBody({ source, note }) }); await onUpdated() } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  const grantProjects = async () => {
    setPending(true); setError('')
    try { await api(`/admin/users/${user.id}/entitlements/projects`, { method: 'POST', body: jsonBody({ source, note }) }); await onUpdated() } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  return <Modal title={`课程与项目权限 · ${user.name}`} onClose={onClose}><p className="mb-4 text-sm text-slate-500">{user.phone || user.phoneMasked} · 确认收款后开通，刷新即可生效。</p><label className="block text-sm">开通来源<select value={source} onChange={(e) => setSource(e.target.value)} className="my-2 h-10 w-full rounded-lg border px-3">{[['MANUAL_PURCHASE', '微信购买'], ['GIFT', '赠送'], ['COMPENSATION', '补偿'], ['TEST', '测试'], ['OTHER', '其他']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm">备注<textarea maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className="my-2 w-full rounded-lg border p-3" placeholder="例如：测试付款" /></label><div className="space-y-2">{stages.map((s) => <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><div className="text-sm"><strong>{s.tag} · {s.title}</strong><p className="mt-1 text-xs text-slate-500">{user.entitlements.includes(s.id) ? '已开通' : '未开通'}</p></div><button disabled={pending} onClick={() => void change(s.slug, user.entitlements.includes(s.id))} className="btn btn-sm btn-outline">{user.entitlements.includes(s.id) ? '撤销' : '确认开通'}</button></div>)}</div><div className="mt-4 rounded-xl border border-brand-200 bg-brand-50/50 p-3"><strong className="text-sm">项目工坊</strong><p className="mt-1 text-xs text-slate-600">{user.productEntitlements.includes('project-lab') ? '已开通' : '未开通'}</p><button disabled={pending} onClick={() => void changeProduct(user.productEntitlements.includes('project-lab'))} className="btn btn-sm btn-outline mt-3">{user.productEntitlements.includes('project-lab') ? '撤销项目工坊' : '单独开通项目工坊'}</button></div>{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<button disabled={pending} onClick={() => void change('all')} className="btn btn-md btn-outline mt-5 w-full">开通全阶段课程版权益</button><button disabled={pending} onClick={() => void grantProjects()} className="btn btn-md btn-primary mt-3 w-full">开通项目版权益</button></Modal>
}
export function DetailModal({ user, onClose, onUpdated, onAccess }: { user: AdminUser; onClose: () => void; onUpdated: () => Promise<void>; onAccess: () => void }) {
  const [note, setNote] = useState(user.internalNote ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const change = async (action: string) => {
    setPending(true); setError('')
    try { await api(`/admin/users/${user.id}/${action}`, { method: action === 'note' ? 'PATCH' : 'POST', ...(action === 'note' ? { body: jsonBody({ note }) } : {}) }); await onUpdated() } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  return <Modal title="用户详情" onClose={onClose}><h3 className="font-semibold">{user.name} · {user.phone}</h3><dl className="my-5 grid grid-cols-2 gap-4 text-sm">{[['注册时间', formatTime(user.createdAt)], ['最近登录', formatTime(user.lastLogin)], ['账号状态', user.disabled ? '已禁用' : '正常'], ['学习进度', `${user.progress}%`], ['课程权限', user.entitlements.length === 4 ? '全阶段课程已开通' : user.entitlements.length ? `已开通 ${user.entitlements.length} 个阶段` : '未开通'], ['项目工坊', user.productEntitlements.includes('project-lab') ? '已开通' : '未开通']].map(([label, value]) => <div key={label}><dt className="text-slate-400">{label}</dt><dd className="mt-1">{value}</dd></div>)}</dl><p className="text-sm">最近学习：{user.recentLesson ? `${user.recentLesson.lessonId} · ${formatTime(user.recentLesson.lastVisitedAt)}` : '暂无学习记录'}</p><ul className="my-3 space-y-1 text-xs text-slate-500">{user.learning?.map((p) => <li key={p.lessonId}>{p.lessonId} · {p.status === 'COMPLETED' ? '已完成' : '学习中'}</li>)}</ul><label className="block text-sm">管理员备注<textarea maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} className="my-2 w-full rounded-lg border p-3" /></label><div className="flex flex-wrap gap-2"><button disabled={pending} className="btn btn-sm btn-outline" onClick={() => void change('note')}>保存备注</button><button disabled={pending} className="btn btn-sm btn-outline" onClick={() => void change(user.disabled ? 'enable' : 'disable')}>{user.disabled ? '启用账号' : '禁用账号'}</button><button className="btn btn-sm btn-primary" onClick={onAccess}>管理课程与项目权限</button></div>{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<h4 className="mt-5 text-sm font-semibold">最近管理操作</h4><ul className="mt-2 space-y-2 text-xs text-slate-500">{user.activity?.map((a) => <li key={a.id}>{formatTime(a.createdAt)} · {actionLabels[a.action] ?? a.action} · {a.detail}</li>)}</ul></Modal>
}
