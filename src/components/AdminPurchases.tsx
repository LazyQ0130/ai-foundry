import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage, jsonBody } from '../lib/api'
import { paymentMethodLabels, purchaseStatusLabels, type Purchase } from '../lib/purchases'
import { planTemplates } from '../data/site'
import { Modal } from './AdminControls'

type AdminPurchase = Purchase & { user: { nickname: string; phone: string; status: string } }
type Result = { purchases: AdminPurchase[]; pagination: { page: number; pages: number; total: number } }

function ReviewModal({ id, onClose, onUpdated }: { id: string; onClose: () => void; onUpdated: () => void }) {
  const [row, setRow] = useState<AdminPurchase | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [received, setReceived] = useState(false)
  const [proofFailed, setProofFailed] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let alive = true
    setLoading(true); setError(''); setReceived(false); setProofFailed(false)
    void api<AdminPurchase>(`/admin/purchases/${id}`).then((result) => { if (alive) { setRow(result); setNote('') } }).catch((e) => { if (alive) setError(errorMessage(e)) }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [id, revision])
  const review = async (action: 'APPROVE' | 'NEEDS_INFO') => {
    if (!row) return
    setBusy(true); setError('')
    try {
      await api(`/admin/purchases/${id}/review`, { method: 'POST', body: jsonBody({ action, note, version: row.version, confirmedReceived: received }) })
      onUpdated(); onClose()
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <Modal title="核实付款申请" wide onClose={() => { if (!busy) onClose() }}>
    {loading ? <p role="status">正在加载申请详情…</p> : row && <>
      <div className="rounded-xl bg-slate-50 p-4 text-sm leading-7"><p className="break-all">申请编号：{row.id}</p><p>{row.user.nickname} · <strong>{row.user.phone}</strong>{row.user.status !== 'ACTIVE' && '（账号已禁用）'}</p><p>{row.planName} · <strong className="text-brand-700">¥{row.price}</strong> · {purchaseStatusLabels[row.status]}</p><p>付款方式：{row.paymentMethod ? paymentMethodLabels[row.paymentMethod] : '—'}</p><p className="break-all">付款备注：{row.paymentRemark}</p><p className="break-all">交易单号：{row.transactionId || '未填写'}</p><p>提交时间：{row.submittedAt ? new Date(row.submittedAt).toLocaleString('zh-CN', { hour12: false }) : '尚未提交'}</p></div>
      {row.note && <p className="mt-3 whitespace-pre-wrap break-words text-sm">用户说明：{row.note}</p>}
      {row.reviewNote && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-amber-800">上次反馈：{row.reviewNote}</p>}
      {row.proofUrl && <div className="mt-4"><p className="mb-2 text-sm font-semibold">付款截图</p>{proofFailed ? <p role="alert" className="text-sm text-red-600">截图加载失败，请刷新详情后重试。</p> : <a href={row.proofUrl} target="_blank" rel="noreferrer" className="block"><img src={row.proofUrl} alt="用户提交的付款截图，点击查看原图" onError={() => setProofFailed(true)} className="max-h-96 max-w-full rounded-lg border object-contain" /></a>}</div>}
      {row.status === 'PENDING' && <div className="mt-5 space-y-4 border-t pt-4"><p className="text-sm leading-6 text-amber-800">请在支付宝或微信实际收款记录中核对金额、备注与交易单号，防止同一笔付款重复开通。</p><label className="block text-sm">审核说明（要求补充信息时必填）<textarea value={note} onChange={(event) => setNote(event.target.value)} disabled={busy} maxLength={2000} rows={3} className="mt-2 w-full rounded-lg border p-3" /></label><label className="flex items-start gap-2 text-sm leading-6"><input type="checkbox" checked={received} onChange={(event) => setReceived(event.target.checked)} disabled={busy} className="mt-1" />我已核对实际收款记录，确认此笔付款到账且未重复用于开通。</label><div className="flex flex-wrap gap-3"><button type="button" disabled={busy || !received || proofFailed || row.user.status !== 'ACTIVE'} className="btn btn-md btn-primary" onClick={() => void review('APPROVE')}>{busy ? '正在处理…' : '确认到账并开通'}</button><button type="button" disabled={busy || !note.trim()} className="btn btn-md btn-outline" onClick={() => void review('NEEDS_INFO')}>要求补充信息</button></div></div>}
    </>}
    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    <button type="button" disabled={busy || loading} className="btn btn-sm btn-outline mt-4" onClick={() => setRevision((value) => value + 1)}>刷新详情</button>
  </Modal>
}

export default function AdminPurchases({ query }: { query: string }) {
  const [status, setStatus] = useState('PENDING')
  const [planId, setPlanId] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phoneQuery, setPhoneQuery] = useState(query)
  useEffect(() => { setPhoneQuery(query); setPage(1) }, [query])
  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ status, page: String(page), pageSize: '20', query: phoneQuery })
      if (planId) params.set('planId', planId)
      void api<Result>(`/admin/purchases?${params}`).then((result) => { if (alive) setData(result) }).catch((e) => { if (alive) setError(errorMessage(e)) }).finally(() => { if (alive) setLoading(false) })
    }, 250)
    return () => { alive = false; window.clearTimeout(timer) }
  }, [phoneQuery, status, planId, page, revision])
  return <section>
    <h1 className="text-[27px] font-bold">付款申请</h1><p className="mt-2 text-sm leading-6 text-slate-500">此处保留此前已提交的付款申请。新的扫码付款请核对实际到账记录，按备注中的注册手机号和课程方案到用户管理开通。</p>
    <Link to="/admin/users" className="btn btn-md btn-primary mt-4">前往用户管理开通</Link>
    <div className="mt-5 flex flex-wrap items-end gap-3"><label className="text-xs">注册手机号<input value={phoneQuery} onChange={(event) => { setPhoneQuery(event.target.value); setPage(1) }} placeholder="搜索注册手机号" className="mt-1 block h-10 w-44 rounded-lg border px-3 text-sm" /></label><label className="text-xs">状态<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="mt-1 block h-10 rounded-lg border px-3 text-sm"><option value="PENDING">待核实</option><option value="NEEDS_INFO">需补充信息</option><option value="APPROVED">已开通</option><option value="ALL">全部已提交</option></select></label><label className="min-w-0 text-xs">课程方案<select value={planId} onChange={(event) => { setPlanId(event.target.value); setPage(1) }} className="mt-1 block h-10 max-w-full rounded-lg border px-3 text-sm"><option value="">全部方案</option>{planTemplates.map((plan) => <option key={plan.id} value={plan.id}>{plan.tag} · {plan.title}</option>)}</select></label><button type="button" disabled={loading} className="btn btn-md btn-outline" onClick={() => setRevision((value) => value + 1)}>刷新列表</button></div>
    {loading ? <p role="status" className="mt-6 text-sm">正在加载付款申请…</p> : error ? <p role="alert" className="mt-6 text-sm text-red-600">{error}</p> : <>
      <div className="mt-5 overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b bg-slate-50"><tr>{['提交时间', '账号', '购买方案', '金额 / 付款方式', '状态', '操作'].map((title) => <th key={title} className="p-4 text-xs font-semibold">{title}</th>)}</tr></thead><tbody>{data?.purchases.map((row) => <tr key={row.id} className="border-b last:border-0"><td className="p-4 text-xs">{row.submittedAt && new Date(row.submittedAt).toLocaleString('zh-CN', { hour12: false })}</td><td className="p-4"><p>{row.user.nickname}</p><p className="mt-1 text-xs text-slate-500">{row.user.phone}</p></td><td className="p-4">{row.planName}</td><td className="p-4">¥{row.price}<p className="mt-1 text-xs text-slate-500">{row.paymentMethod && paymentMethodLabels[row.paymentMethod]}</p></td><td className="p-4">{purchaseStatusLabels[row.status]}</td><td className="p-4"><button type="button" className="btn btn-sm btn-outline" onClick={() => setSelected(row.id)}>{row.status === 'PENDING' ? '核实申请' : '查看详情'}</button></td></tr>)}</tbody></table>{!data?.purchases.length && <p className="p-10 text-center text-sm text-slate-500">暂无符合条件的付款申请。</p>}</div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-xs"><span>共 {data?.pagination.total ?? 0} 条</span><button type="button" className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</button><span>{page} / {Math.max(1, data?.pagination.pages ?? 0)}</span><button type="button" className="btn btn-sm btn-outline" disabled={page >= (data?.pagination.pages ?? 0)} onClick={() => setPage((value) => value + 1)}>下一页</button></div>
    </>}
    {selected && <ReviewModal key={selected} id={selected} onClose={() => setSelected(null)} onUpdated={() => setRevision((value) => value + 1)} />}
  </section>
}
