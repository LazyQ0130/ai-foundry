import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type User } from '../auth/AuthProvider'
import { api, errorMessage, jsonBody } from '../lib/api'
import PurchaseModal from './PurchaseModal'

const field = 'mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500'
type Challenge = { challengeId: string; requiresOldEmail?: boolean; message?: string }

export default function EmailSecurity({ reset = false }: { reset?: boolean }) {
  const { user, applyUser, refreshUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [code, setCode] = useState('')
  const [oldCode, setOldCode] = useState('')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [wait, setWait] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [contact, setContact] = useState(false)
  useEffect(() => {
    if (!wait) return
    const timer = window.setTimeout(() => setWait(wait - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [wait])

  const send = async (event: FormEvent) => {
    event.preventDefault(); setPending(true); setError(''); setMessage(''); setDone(false)
    try {
      const result = await api<Challenge>(reset ? '/auth/password-reset/code' : '/auth/email/code', {
        method: 'POST', body: jsonBody(reset ? { email } : { email, currentPassword: password }),
      })
      setChallenge(result); setCode(''); setOldCode(''); setWait(60)
      setMessage(result.message ?? (result.requiresOldEmail ? '已向新旧邮箱发送验证码，请分别查收。' : '验证码已发送，请查看收件箱或垃圾邮件。'))
    } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  const confirm = async (event: FormEvent) => {
    event.preventDefault()
    if (reset && password !== repeat) { setError('两次输入的密码不一致'); return }
    setPending(true); setError(''); setMessage('')
    try {
      if (reset) {
        await api('/auth/password-reset/confirm', { method: 'POST', body: jsonBody({ challengeId: challenge!.challengeId, code, newPassword: password }) })
        await refreshUser()
        setMessage('密码已重置，所有设备已退出登录。请使用手机号和新密码登录。')
      } else {
        applyUser(await api<User>('/auth/email/confirm', { method: 'POST', body: jsonBody({ challengeId: challenge!.challengeId, code, oldCode: oldCode || undefined }) }))
        setMessage('邮箱绑定成功，可以用此邮箱找回密码。')
      }
      setDone(true); setChallenge(null); setCode(''); setOldCode(''); setPassword(''); setRepeat(''); setEmail('')
    } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  return <section id="email-security" className="card scroll-mt-24 p-5">
    {reset ? <h1 className="text-2xl font-bold">找回密码</h1> : <h2 className="text-[15px] font-semibold">绑定邮箱</h2>}
    <p className="mt-2 break-all text-sm leading-6 text-slate-600">{reset ? '输入已验证绑定的邮箱，通过验证码设置新密码。' : user?.email ? `已绑定：${user.email}。更换时需同时验证新旧邮箱。` : '尚未绑定邮箱。验证邮箱后，即可在忘记密码时自助找回。'}</p>
    {!done && <>
      <form onSubmit={send} className="mt-4 space-y-3">
        <label className="block text-sm">{reset ? '绑定邮箱' : user?.email ? '新邮箱' : '邮箱地址'}<input type="email" autoComplete="email" required maxLength={254} className={field} value={email} disabled={pending} onChange={e => { setEmail(e.target.value); setChallenge(null); setMessage('') }} /></label>
        {!reset && <label className="block text-sm">当前账号密码<input type="password" autoComplete="current-password" required minLength={8} maxLength={72} value={password} disabled={pending} onChange={e => setPassword(e.target.value)} className={field} /></label>}
        <button className="btn btn-md btn-outline w-full" disabled={pending || wait > 0}>{wait ? `${wait} 秒后可重新发送` : pending ? '处理中…' : '发送验证码'}</button>
      </form>
      {challenge && <form onSubmit={confirm} className="mt-4 space-y-3">
        <p className="text-xs leading-5 text-slate-500">验证码 10 分钟有效，连续输错 5 次后需重新获取。</p>
        <label className="block text-sm">{challenge.requiresOldEmail ? '新邮箱验证码' : '邮箱验证码'}<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={e => setCode(e.target.value)} className={field} /></label>
        {challenge.requiresOldEmail && <label className="block text-sm">原邮箱验证码<input inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" required maxLength={6} value={oldCode} onChange={e => setOldCode(e.target.value)} className={field} /></label>}
        {reset && <>
          <label className="block text-sm">新密码<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} className={field} /><span className="text-xs text-slate-500">8～72 个字符</span></label>
          <label className="block text-sm">再次输入新密码<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={repeat} onChange={e => setRepeat(e.target.value)} className={field} /></label>
        </>}
        <button disabled={pending} className="btn btn-md btn-primary w-full">{pending ? '处理中…' : reset ? '重置密码' : '确认绑定'}</button>
      </form>}
    </>}
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm leading-6 text-brand-700">{message}</p>}
    {done && !reset && <button className="btn btn-sm btn-outline mt-3" onClick={() => setDone(false)}>更换绑定邮箱</button>}
    {reset && <Link to="/login" className="mt-4 block text-sm text-brand-600">返回登录</Link>}
    <p className="mt-4 text-xs leading-5 text-slate-500">未绑定邮箱或原邮箱无法使用？联系管理员核验账号归属。不要向任何人提供密码或验证码。</p>
    <button type="button" onClick={() => setContact(true)} className="mt-2 text-sm text-brand-600">联系管理员</button>
    {contact && <PurchaseModal onClose={() => setContact(false)} />}
  </section>
}
