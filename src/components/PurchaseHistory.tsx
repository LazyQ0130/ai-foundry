import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../lib/api'
import { paymentMethodLabels, purchaseStatusLabels, type PurchaseList } from '../lib/purchases'
import PurchaseModal from './PurchaseModal'

export default function PurchaseHistory() {
  const [data, setData] = useState<PurchaseList | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1)
    window.addEventListener('purchases:updated', refresh)
    return () => window.removeEventListener('purchases:updated', refresh)
  }, [])
  useEffect(() => {
    let alive = true
    setLoading(true); setError('')
    void api<PurchaseList>(`/purchases?page=${page}&pageSize=10`).then((result) => { if (alive) setData(result) }).catch((e) => { if (alive) setError(errorMessage(e)) }).finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [page, revision])
  if (!loading && !error && !data?.purchases.length) return null
  return <section className="card p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">历史付款申请</h2><button type="button" disabled={loading} className="btn btn-sm btn-outline" onClick={() => setRevision((value) => value + 1)}>刷新记录</button></div>
    <p className="mt-2 text-xs leading-5 text-slate-500">这里保留此前提交的付款申请及审核反馈。新购买扫码付款并备注手机号和课程方案即可，无需提交截图。</p>
    {loading ? <p role="status" className="mt-4 text-sm">正在加载付款申请…</p> : error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : !data?.purchases.length ? <p className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">暂无已提交的付款申请。</p> : <ul className="mt-4 space-y-3">{data.purchases.map((row) => <li key={row.id} className="rounded-xl border p-4">
      <div className="flex flex-wrap justify-between gap-3"><strong className="text-sm">{row.planName} · ¥{row.price}</strong><span className={`text-xs font-semibold ${row.status === 'APPROVED' ? 'text-emerald-700' : row.status === 'NEEDS_INFO' ? 'text-amber-700' : 'text-brand-700'}`}>{purchaseStatusLabels[row.status]}</span></div>
      <p className="mt-2 break-all text-xs leading-5 text-slate-500">申请编号：{row.id}<br />{row.paymentMethod && paymentMethodLabels[row.paymentMethod]} · {new Date(row.submittedAt || row.createdAt).toLocaleString('zh-CN', { hour12: false })}</p>
      {row.reviewNote && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">管理员反馈：{row.reviewNote}</p>}
      <div className="mt-3 flex flex-wrap gap-3"><button type="button" className="btn btn-sm btn-outline" onClick={() => setSelected(row.id)}>{row.status === 'NEEDS_INFO' ? '补充付款信息' : '查看申请详情'}</button>{row.status === 'APPROVED' && <Link to={row.planId === 'all-access-projects' ? '/capstone' : row.planId === 'all-access' ? '/dashboard' : `/stage/${row.planId}`} className="btn btn-sm btn-primary">前往学习</Link>}</div>
    </li>)}</ul>}
    {data && data.pagination.pages > 1 && <div className="mt-4 flex items-center justify-end gap-3 text-xs"><button type="button" className="btn btn-sm btn-outline" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>上一页</button><span>{page} / {data.pagination.pages}</span><button type="button" className="btn btn-sm btn-outline" disabled={page >= data.pagination.pages || loading} onClick={() => setPage((value) => value + 1)}>下一页</button></div>}
    {selected && <PurchaseModal key={selected} purchaseId={selected} onClose={() => { setSelected(null); setRevision((value) => value + 1) }} />}
  </section>
}
