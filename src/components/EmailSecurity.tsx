import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type User } from '../auth/AuthProvider'
import { api, errorMessage, jsonBody } from '../lib/api'
import PurchaseModal from './PurchaseModal'
import { Modal } from './AdminControls'

const field = 'mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm focus:border-brand-500'
type Challenge = { challengeId: string; requiresOldEmail?: boolean; message?: string }

type Props = { reset?: boolean; onboarding?: boolean; initialPassword?: string; onVerified?: () => void; onContinue?: () => void }

export default function EmailSecurity({ reset = false, onboarding = false, initialPassword = '', onVerified, onContinue }: Props) {
  const { user, applyUser, refreshUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(initialPassword)
  const [editing, setEditing] = useState(false)
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
        setMessage(user?.email ? '邮箱更换成功，可以用新邮箱找回密码。' : '邮箱验证成功，可以用此邮箱找回密码。')
        setEditing(false)
        onVerified?.()
      }
      setDone(true); setChallenge(null); setCode(''); setOldCode(''); setPassword(''); setRepeat(''); setEmail('')
    } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  const closeEditor = () => {
    if (pending) return
    setEditing(false); setEmail(''); setPassword(''); setChallenge(null); setCode(''); setOldCode(''); setError(''); setMessage('')
  }
  const title = reset ? '找回密码' : onboarding ? '验证邮箱' : user?.email ? '更换邮箱' : '绑定邮箱'
  const description = reset ? '输入已验证绑定的邮箱，通过验证码设置新密码。' : user?.email ? '更换邮箱需要验证当前账号密码，以及新旧邮箱的验证码。' : onboarding ? '账号已创建。验证邮箱后，忘记密码时就能自助找回。' : '验证邮箱后，即可在忘记密码时自助找回。'
  const form = <>
    {!done && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
    {!done && <>
      <form onSubmit={send} className="mt-4 space-y-3">
        <label className="block text-sm">{reset ? '绑定邮箱' : user?.email ? '新邮箱' : '邮箱地址'}<input name="verification-email" type="email" autoComplete="section-verification email" autoFocus={onboarding} required maxLength={254} className={field} value={email} disabled={pending || !!challenge} onChange={e => { setEmail(e.target.value); setChallenge(null); setMessage('') }} /></label>
        {!reset && !onboarding && <label className="block text-sm">当前账号密码<input name="verification-password" type="password" autoComplete="current-password" required minLength={8} maxLength={72} value={password} disabled={pending} onChange={e => setPassword(e.target.value)} className={field} /></label>}
        <button className="btn btn-md btn-outline w-full" disabled={pending || wait > 0}>{wait ? `${wait} 秒后可重新发送` : pending ? '处理中…' : '发送验证码'}</button>
        {challenge && <button type="button" disabled={pending} className="text-sm text-brand-600" onClick={() => { setChallenge(null); setCode(''); setOldCode(''); setError(''); setMessage('') }}>修改邮箱地址</button>}
      </form>
      {challenge && <form onSubmit={confirm} className="mt-4 space-y-3">
        <p className="text-xs leading-5 text-slate-500">验证码 10 分钟有效，连续输错 5 次后需重新获取。</p>
        <label className="block text-sm">{challenge.requiresOldEmail ? '新邮箱验证码' : '邮箱验证码'}<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={code} onChange={e => setCode(e.target.value)} className={field} /></label>
        {challenge.requiresOldEmail && <label className="block text-sm">原邮箱验证码<input inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" required maxLength={6} value={oldCode} onChange={e => setOldCode(e.target.value)} className={field} /></label>}
        {reset && <>
          <label className="block text-sm">新密码<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} className={field} /><span className="text-xs text-slate-500">8～72 个字符</span></label>
          <label className="block text-sm">再次输入新密码<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={repeat} onChange={e => setRepeat(e.target.value)} className={field} /></label>
        </>}
        <button disabled={pending} className="btn btn-md btn-primary w-full">{pending ? '处理中…' : reset ? '重置密码' : user?.email ? '确认更换' : '验证邮箱'}</button>
      </form>}
    </>}
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm leading-6 text-brand-700">{message}</p>}
    {reset && <Link to="/login" className="mt-4 block text-sm text-brand-600">返回登录</Link>}
    {onboarding ? <>
      {!done && <p className="mt-4 text-xs leading-5 text-slate-600">可以稍后在个人中心绑定邮箱；绑定前无法通过邮箱自助找回密码。</p>}
      <button type="button" disabled={pending} className={`btn btn-md mt-4 w-full ${done ? 'btn-primary' : 'btn-outline'}`} onClick={onContinue}>{done ? '完成，继续学习' : '暂时跳过，开始学习'}</button>
    </> : <>
      <p className="mt-4 text-xs leading-5 text-slate-500">未绑定邮箱或原邮箱无法使用？联系管理员核验账号归属。不要向任何人提供密码或验证码。</p>
      <button type="button" onClick={() => { if (editing) closeEditor(); setContact(true) }} className="mt-2 text-sm text-brand-600" disabled={pending}>联系管理员</button>
    </>}
  </>
  return <section id="email-security" className="card scroll-mt-24 p-5">
    {reset || onboarding ? <><h1 className="text-2xl font-bold">{title}</h1>{form}</> : <>
      <h2 className="text-[15px] font-semibold">安全邮箱</h2>
      <p className="mt-3 break-all text-sm text-slate-700">{user?.email ? user.email.replace(/^(.{1,3})[^@]*@/, '$1***@') : '尚未绑定邮箱'}</p>
      <p className="mt-2 text-xs leading-5 text-slate-600">{user?.emailVerifiedAt ? '已验证 · 用于找回密码' : '绑定并验证邮箱，方便忘记密码时自助找回。'}</p>
      {message && !editing && <p role="status" className="mt-3 text-sm leading-6 text-brand-700">{message}</p>}
      <button type="button" className="btn btn-md btn-outline mt-4 w-full" onClick={() => { setDone(false); setError(''); setMessage(''); setEditing(true) }}>{user?.email ? '更换邮箱' : '绑定邮箱'}</button>
      {editing && <Modal title={title} onClose={closeEditor}>{form}<button type="button" disabled={pending} className="btn btn-md btn-outline mt-3 w-full" onClick={closeEditor}>取消</button></Modal>}
    </>}
    {contact && <PurchaseModal onClose={() => setContact(false)} />}
  </section>
}
