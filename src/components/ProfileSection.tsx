import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import { Camera, CheckCircle2, Pencil, X } from 'lucide-react'
import { useAuth, type User } from '../auth/AuthProvider'
import { api, errorMessage, jsonBody } from '../lib/api'
import { prepareAvatar } from '../lib/avatar'
import UserAvatar from './UserAvatar'

const AvatarCropModal = lazy(() => import('./AvatarCropModal'))
const date = (value: string | null) => value ? new Date(value).toLocaleDateString('zh-CN') : '—'

export default function ProfileSection() {
  const { user, applyUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const locked = useRef(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [source, setSource] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => () => { if (source) URL.revokeObjectURL(source) }, [source])
  if (!user) return null

  // A synchronous lock covers decode, nickname writes and avatar writes, including rapid double clicks.
  const save = async (path: string, options: RequestInit, message: string) => {
    if (locked.current) throw new Error('正在保存，请稍候')
    locked.current = true; setPending(true); setError(''); setSuccess('')
    try {
      const next = await api<User>(path, options)
      if (alive.current) { applyUser(next); setSuccess(message) }
    } finally { locked.current = false; if (alive.current) setPending(false) }
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const nickname = draft.trim()
    if (!nickname || nickname.length > 50) { setError('昵称去除首尾空格后需为 1–50 个字符'); setSuccess(''); return }
    try { await save('/me', { method: 'PATCH', body: jsonBody({ nickname }) }, '昵称已保存'); setEditing(false) }
    catch (err) { setError(errorMessage(err)) }
  }
  const select = async (file?: File) => {
    if (!file || locked.current) return
    locked.current = true; setPending(true); setError(''); setSuccess('')
    try {
      const url = await prepareAvatar(file)
      if (alive.current) setSource(url)
      else URL.revokeObjectURL(url)
    } catch (err) { if (alive.current) setError(errorMessage(err)) }
    finally { locked.current = false; if (alive.current) setPending(false) }
  }
  return <section className="card p-5 sm:p-6" aria-label="个人资料">
    <div className="mb-5 flex items-center justify-between"><h2 className="text-[16px] font-semibold text-slate-900">个人资料</h2><span className="text-xs text-slate-400">让大家认识你</span></div>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:gap-3">
        <button type="button" disabled={pending} aria-label="更换头像" onClick={() => input.current?.click()} className="group relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
          <UserAvatar nickname={user.nickname} avatarUrl={user.avatarUrl} size={80} />
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white bg-brand-600 p-1.5 text-white"><Camera className="h-3.5 w-3.5" /></span>
        </button>
        <div className="flex flex-col items-start gap-2 sm:items-center">
          <button type="button" disabled={pending} onClick={() => input.current?.click()} className="text-xs font-medium text-brand-600 hover:underline">更换头像</button>
          {user.avatarUrl && <button type="button" disabled={pending} className="text-xs text-slate-500 hover:text-slate-800" onClick={() => { void save('/me/avatar', { method: 'DELETE' }, '已恢复默认头像').catch((err) => setError(errorMessage(err))) }}>恢复默认头像</button>}
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" tabIndex={-1} onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ''; void select(file) }} />
      </div>
      <div className="min-w-0 flex-1">
        {editing ? <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={50} required autoFocus disabled={pending} aria-label="昵称" aria-describedby="nickname-help" className="h-10 w-full min-w-0 rounded-lg border px-3 text-[15px] sm:w-auto sm:flex-1" />
          <button disabled={pending} className="btn btn-md btn-primary">{pending ? '保存中…' : '保存'}</button>
          <button type="button" disabled={pending} aria-label="取消昵称修改" className="btn btn-md btn-outline" onClick={() => { setEditing(false); setError('') }}><X className="h-4 w-4" /></button>
          <p id="nickname-help" className="w-full text-xs text-slate-400">1–50 个字符，首尾空格会自动去除</p>
        </form> : <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="min-w-0 break-all text-[22px] font-bold tracking-tight text-slate-900">{user.nickname}</h3>
          <button type="button" disabled={pending} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={() => { setDraft(user.nickname); setEditing(true); setError(''); setSuccess('') }}><Pencil className="h-3.5 w-3.5" />修改昵称</button>
        </div>}
        <p className="mt-2 text-[13px] text-slate-500">{user.phoneMasked}</p>
        <p className="mt-3 text-xs leading-5 text-slate-400">头像支持 JPG、PNG、WebP 静态图片，最大 5MB、2500 万像素。</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs"><div><dt className="text-slate-400">注册时间</dt><dd className="mt-1 text-slate-600">{date(user.createdAt)}</dd></div><div><dt className="text-slate-400">最近登录</dt><dd className="mt-1 text-slate-600">{date(user.lastLoginAt)}</dd></div></dl>
      </div>
    </div>
    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    {success && <p role="status" className="mt-4 flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{success}</p>}
    {source && <Suspense fallback={<p role="status" className="mt-3 text-sm text-slate-500">正在加载裁剪工具…</p>}><AvatarCropModal source={source} pending={pending} onClose={() => setSource(null)} onSave={async (blob) => { await save('/me/avatar', { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/webp' } }, '头像已保存'); setSource(null) }} /></Suspense>}
  </section>
}
