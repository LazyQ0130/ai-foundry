import { useEffect, useState, type FormEvent } from 'react'
import { api, errorMessage, jsonBody } from '../lib/api'
import { paymentMethodLabels, type Purchase } from '../lib/purchases'

export default function PaymentProofForm({ purchase, method, onUpdated }: { purchase: Purchase; method: 'ALIPAY' | 'WECHAT'; onUpdated: (purchase: Purchase) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState(purchase.paymentMethod ?? method)
  const [transactionId, setTransactionId] = useState(purchase.transactionId)
  const [note, setNote] = useState(purchase.note)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (!purchase.paymentMethod) setPaymentMethod(method) }, [method, purchase.paymentMethod])
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('')
    if (!file && !purchase.proofUrl) { setError('请上传一张付款截图'); return }
    if (file && (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { setError('请选择不超过 5 MB 的 JPEG、PNG 或 WebP 图片'); return }
    setBusy(true)
    let current = purchase
    try {
      if (file) {
        current = await api<Purchase>(`/purchases/${purchase.id}/proof`, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
        onUpdated(current)
        setFile(null)
      }
      const result = await api<Purchase>(`/purchases/${purchase.id}/submit`, { method: 'POST', body: jsonBody({ paymentMethod, transactionId, note, version: current.version }) })
      onUpdated(result)
    } catch (e) { setError(errorMessage(e)) } finally { setBusy(false) }
  }
  return <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-4 rounded-xl border border-slate-200 p-4">
    <h3 className="font-semibold">提交付款凭据</h3>
    <p className="text-xs leading-5 text-slate-500">请选择实际使用的付款方式。截图用于核对，管理员确认到账后开通。</p>
    <fieldset disabled={busy} className="space-y-4">
      <label className="block text-sm">付款方式<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)} className="mt-1 h-10 w-full rounded-lg border px-3">{Object.entries(paymentMethodLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label className="block text-sm">付款截图 <span className="text-xs text-slate-500">（一张，最大 5 MB）</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full min-w-0 text-xs" /></label>
      {purchase.proofUrl && <a href={purchase.proofUrl} target="_blank" rel="noreferrer" className="inline-block text-xs text-brand-700 underline">查看已上传的付款截图（可重新选择替换）</a>}
      <label className="block text-sm">交易单号 <span className="text-xs text-slate-500">（选填）</span><input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} maxLength={100} className="mt-1 h-10 w-full rounded-lg border px-3" /></label>
      <label className="block text-sm">补充说明 <span className="text-xs text-slate-500">（选填）</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={2} className="mt-1 w-full rounded-lg border p-3" /></label>
      <button type="submit" disabled={busy} className="btn btn-md btn-primary w-full">{busy ? '正在提交…' : purchase.status === 'NEEDS_INFO' ? '补充信息并重新提交' : '提交付款申请'}</button>
    </fieldset>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </form>
}
