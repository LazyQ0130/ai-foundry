import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { api, errorMessage, jsonBody } from '../lib/api'
import { Modal } from './AdminControls'

export default function PasswordSecurity() {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [repeat, setRepeat] = useState('')
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const locked = useRef(false)
  const confirmation = useRef<HTMLInputElement>(null)
  const clear = () => { setCurrent(''); setNew(''); setRepeat(''); setVisible(false); setError('') }
  const close = () => { if (!locked.current) { setOpen(false); clear() } }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (locked.current) return
    if (newPassword !== repeat) { setError('两次输入的新密码不一致，请重新确认。'); confirmation.current?.focus(); return }
    locked.current = true; setPending(true); setError('')
    try {
      await api('/auth/password', { method: 'POST', body: jsonBody({ currentPassword, newPassword }) })
      clear()
      navigate('/login', { replace: true, state: { passwordChanged: true } })
      void refreshUser()
    } catch (err) { setError(errorMessage(err)) }
    finally { locked.current = false; setPending(false) }
  }
  const field = 'mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500'
  return <section className="card p-5">
    <h2 className="text-[15px] font-semibold text-slate-900">登录密码</h2>
    <p className="mt-2 text-xs leading-5 text-slate-600">已设置 · 用于手机号登录</p>
    <button type="button" className="btn btn-md btn-outline mt-4 w-full" onClick={() => setOpen(true)}>修改密码</button>
    {open && <Modal title="修改密码" onClose={close}>
      <p className="text-sm leading-6 text-slate-600">修改成功后，所有设备都会退出登录，请使用新密码重新登录。</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-sm">当前密码<input name="current-password" type={visible ? 'text' : 'password'} autoComplete="current-password" required minLength={8} maxLength={72} disabled={pending} value={currentPassword} onChange={e => setCurrent(e.target.value)} className={field} /></label>
        <label className="block text-sm">新密码<input name="new-password" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={72} disabled={pending} value={newPassword} onChange={e => { setNew(e.target.value); setError('') }} className={field} /><span className="mt-1 block text-xs text-slate-600">8～72 个字符</span></label>
        <label className="block text-sm">确认新密码<input ref={confirmation} name="confirm-password" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={72} disabled={pending} value={repeat} onChange={e => { setRepeat(e.target.value); setError('') }} className={field} /></label>
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={visible} disabled={pending} onChange={e => setVisible(e.target.checked)} />显示密码</label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3"><button type="button" disabled={pending} className="btn btn-md btn-outline flex-1" onClick={close}>取消</button><button disabled={pending} className="btn btn-md btn-primary flex-1">{pending ? '保存中…' : '确认修改'}</button></div>
        <Link to="/forgot-password" className="block text-sm text-brand-600">忘记当前密码？通过邮箱找回</Link>
      </form>
    </Modal>}
  </section>
}
