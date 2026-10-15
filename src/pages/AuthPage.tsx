import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth, type User } from '../auth/AuthProvider.js'
import { errorMessage } from '../lib/api.js'
import EmailSecurity from '../components/EmailSecurity.js'
import { authDestination, authPath, isLessonDestination } from '../lib/authNavigation.js'
import { projectPricingIntent } from '../lib/projectPricingNavigation.js'

export default function AuthPage({ register = false }: { register?: boolean }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const returnPath = params.get('next')
  const pricingIntent = returnPath?.startsWith('/pricing?') ? projectPricingIntent(returnPath.slice('/pricing'.length).split('#')[0]) : null
  const pricingReturnMessage = `完成${register ? '账号设置' : '登录'}后会回到项目版方案，并保留${pricingIntent?.lesson ? ` ${pricingIntent.lesson.id.toUpperCase()} 的课程去向` : '项目工坊入口'}。`
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [registration, setRegistration] = useState<{ user: User; password: string } | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const continueToApp = (user: User) => {
    const next = params.get('next')
    setRegistration(null)
    setPassword('')
    navigate(authDestination(next, user.role), { replace: true })
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setPending(true); setError('')
    try {
      const user = register ? await auth.register(phone, password, nickname, acceptedTerms) : await auth.login(phone, password)
      if (register) {
        setRegistration({ user, password })
        setPassword('')
        return
      }
      continueToApp(user)
    } catch (e) { setError(errorMessage(e)) } finally { setPending(false) }
  }
  const field = 'mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-brand-500'
  if (register && registration) return <section className="shell py-8 sm:py-12"><div className="mx-auto max-w-lg">
    <p className="mb-4 text-sm font-medium text-brand-700">第 2 步 / 共 2 步 · 验证邮箱</p>
    {isLessonDestination(params.get('next')) && <p className="mb-4 text-sm leading-6 text-slate-600">验证邮箱或选择稍后绑定后，会返回刚才的课程。</p>}
    {pricingIntent && <p className="mb-4 text-sm leading-6 text-slate-600">{pricingReturnMessage}</p>}
    <EmailSecurity onboarding initialPassword={registration.password} onVerified={() => setRegistration(current => current ? { ...current, password: '' } : null)} onContinue={() => continueToApp(auth.user ?? registration.user)} />
  </div></section>
  return <section className="shell py-8 sm:py-12"><div className="card mx-auto grid max-w-5xl overflow-hidden lg:grid-cols-[45%_55%]">
    <div className="border-b border-slate-200 bg-brand-50/50 px-5 py-4 sm:px-8 sm:py-5 lg:flex lg:flex-col lg:justify-center lg:border-b-0 lg:border-r lg:p-10">
      <div><p className="text-sm font-bold text-brand-700">AIFoundry</p><h1 className="mt-1 text-[21px] font-bold leading-tight text-slate-900 sm:hidden">从 AI Coding 学到 Agent</h1><h1 className="mt-2 hidden text-[28px] font-bold leading-tight text-slate-900 sm:block">从 AI Coding 到 Agent，沿着一条路径完成学习与实践。</h1><p className="mt-1 text-[12px] text-slate-600 sm:mt-2 sm:text-[12.5px] lg:mt-4 lg:text-sm">4 个学习阶段 · 29 节正式课程 · 4 个阶段项目</p></div>
      <div className="hidden lg:mt-6 lg:block"><p className="text-[13px] leading-7 text-slate-600">AI Coding → Full Stack → RAG → Agent</p><Link to="/lesson/stage-1/s1-l0" className="mt-3 inline-flex text-sm font-medium text-brand-700 hover:underline">从第 0 课开始免费体验 →</Link></div>
    </div>
    <div className="p-5 sm:p-8 lg:p-10">{register && <p className="mb-3 text-sm font-medium text-brand-700">第 1 步 / 共 2 步 · 创建账号</p>}<h2 className="text-2xl font-bold">{register ? '注册 AIFoundry' : '登录 AIFoundry'}</h2><p className="mt-2 text-sm text-slate-500">{register ? '创建账号后验证邮箱，方便忘记密码时自助找回。' : '继续你的 AI 原生开发学习。'}</p>
    {isLessonDestination(params.get('next')) && <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[13px] leading-6 text-brand-700">{register ? '完成注册后的邮箱步骤，即可返回刚才的课程；邮箱也可以稍后绑定。' : '登录成功后会返回刚才的课程，继续阅读并记录进度。'}</p>}
    {pricingIntent && <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[13px] leading-6 text-brand-700">{pricingReturnMessage}</p>}
    {!register && location.state?.passwordChanged && <p role="status" className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm leading-6 text-brand-700">密码修改成功，所有设备已退出登录。请使用新密码重新登录。</p>}
    <form onSubmit={submit} className="mt-5 space-y-4">
    <label className="block text-sm">手机号<input autoComplete="tel" inputMode="tel" pattern="1[3-9][0-9]{9}" title="请输入 11 位中国大陆手机号" maxLength={11} required value={phone} onChange={(e) => setPhone(e.target.value)} className={field} /></label>
    {register && <label className="block text-sm">昵称（可选）<input autoComplete="nickname" maxLength={50} value={nickname} onChange={(e) => setNickname(e.target.value)} className={field} /></label>}
    <label className="block text-sm">密码<input autoComplete={register ? 'new-password' : 'current-password'} type="password" required minLength={8} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} className={field} /><span className="mt-1 block text-xs text-slate-400">8～72 个字符</span></label>
    {register && <>
      <p className="text-xs leading-5 text-slate-500">请核对手机号，管理员将据此开通课程；目前手机号不验证归属。</p>
      <label className="flex items-start gap-2 text-sm leading-6"><input className="mt-1.5" type="checkbox" required checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} /><span>我已阅读并同意<Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-brand-600">《用户协议》</Link>与<Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-600">《隐私政策》</Link></span></label>
    </>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <button disabled={pending || (register && !acceptedTerms)} className="btn btn-md btn-primary w-full">{pending ? '请稍候…' : register ? '创建账号，下一步' : '登录'}</button>
    {!register && <Link to="/forgot-password" className="block text-sm text-brand-600">忘记密码？</Link>}
  </form><p className="mt-4 text-xs leading-6 text-slate-500">手机号用于登录，请妥善保管密码。</p><Link className="mt-4 block text-sm text-brand-600" to={authPath(register ? 'login' : 'register', params.get('next'))}>{register ? '已有账号？登录' : '还没有账号？注册'}</Link></div></div></section>
}
