import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { errorMessage } from '../lib/api'

export default function AuthPage({ register = false }: { register?: boolean }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [bindEmail, setBindEmail] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setPending(true); setError('')
    try {
      const user = register ? await auth.register(phone, password, nickname, acceptedTerms) : await auth.login(phone, password)
      if (register && bindEmail) { navigate('/account#email-security', { replace: true }); return }
      const next = params.get('next')
      navigate(next && /^\/(?!\/)/.test(next) && !next.includes('\\') && (user.role === 'ADMIN' || !next.startsWith('/admin')) ? next : user.role === 'ADMIN' ? '/admin/users' : '/dashboard', { replace: true })
    } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  const field = 'mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-500'
  return <section className="shell py-16"><div className="card mx-auto max-w-md p-8"><h1 className="text-2xl font-bold">{register ? '注册 AIFoundry' : '登录 AIFoundry'}</h1><p className="mt-3 text-sm text-slate-500">{register ? '创建账号，保存你的课程权限与学习进度。' : '继续你的 AI 原生开发学习。'}</p><form onSubmit={submit} className="mt-6 space-y-4">
    <label className="block text-sm">手机号<input autoComplete="tel" inputMode="tel" pattern="1[3-9][0-9]{9}" title="请输入 11 位中国大陆手机号" maxLength={11} required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} /></label>
    {register && <label className="block text-sm">昵称（可选）<input autoComplete="nickname" maxLength={50} value={nickname} onChange={(e) => setNickname(e.target.value)} className={field} /></label>}
    <label className="block text-sm">密码<input autoComplete={register ? 'new-password' : 'current-password'} type="password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} className={field} /><span className="mt-1 block text-xs text-slate-400">8～72 个字符</span></label>
    {register && <>
      <p className="text-xs leading-5 text-slate-500">请核对手机号，管理员将据此开通课程；目前手机号不验证归属。</p>
      <label className="flex items-start gap-2 text-sm leading-6"><input className="mt-1.5" type="checkbox" checked={bindEmail} onChange={e => setBindEmail(e.target.checked)} />注册后绑定邮箱，用于找回密码（可选）</label>
      <label className="flex items-start gap-2 text-sm leading-6"><input className="mt-1.5" type="checkbox" required checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} /><span>我已阅读并同意<Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-600">《用户协议》</Link>与<Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600">《隐私政策》</Link></span></label>
    </>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <button disabled={pending || (register && !acceptedTerms)} className="btn btn-md btn-primary w-full">{pending ? '请稍候…' : register ? '注册并登录' : '登录'}</button>
    {!register && <Link to="/forgot-password" className="block text-sm text-brand-600">忘记密码？</Link>}
  </form><p className="mt-4 text-xs leading-6 text-slate-500">手机号用于登录，请妥善保管密码。</p><Link className="mt-4 block text-sm text-brand-600" to={`${register ? '/login' : '/register'}${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`}>{register ? '已有账号？登录' : '还没有账号？注册'}</Link></div></section>
}
