import { curriculumFormalLessonCount, stageLessonCount } from '../data/courses'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LogOut, MessageCircle } from 'lucide-react'
import { api, errorMessage, jsonBody } from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { useCatalogue } from '../data/catalog'
import { usePlans } from '../data/pricing'
import { useProgress } from '../data/progress'
import { Ring } from '../components/ui'
import type { Plan } from '../data/site'
import PurchaseModal from '../components/PurchaseModal'
import ProfileSection from '../components/ProfileSection'
import EmailSecurity from '../components/EmailSecurity'

const sourceLabel: Record<string, string> = {
  MANUAL_PURCHASE: '微信购买',
  GIFT: '赠送',
  COMPENSATION: '补偿',
  TEST: '测试',
  OTHER: '其他',
}

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '—'

type Entitlement = {
  stageSlug: string
  stageTitle: string
  price: number
  grantedAt: string
  source: string
}

/* ---------------------------- 我的课程与权限 ---------------------------- */

function CoursesSection({ onBuy }: { onBuy: (plan: Plan) => void }) {
  const { user } = useAuth()
  const { stages } = useCatalogue()
  const { plans } = usePlans()
  const [granted, setGranted] = useState<Entitlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    api<Entitlement[]>('/me/entitlements')
      .then((rows) => {
        if (alive) setGranted(rows)
      })
      .catch((e) => {
        if (alive) setError(errorMessage(e))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const owned = new Set(user?.entitlements ?? [])
  const locked = stages.filter((stage) => !owned.has(stage.slug))

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">我的课程与权限</h2>
          <p className="mt-1 text-[12.5px] leading-5 text-slate-500">
            课程由管理员确认收款后开通；这里就是你已开通与未开通的阶段。
          </p>
        </div>
        <Link to="/pricing" className="link-more">
          查看全部方案
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <p role="status" className="mt-5 text-[13px] text-slate-500">
          正在加载开通记录…
        </p>
      ) : error ? (
        <p role="alert" className="mt-5 text-[13px] text-red-600">
          {error}
        </p>
      ) : granted.length ? (
        <ul className="mt-5 space-y-2.5">
          {granted.map((item) => (
            <li
              key={item.stageSlug}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-slate-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={2.4} />
                  {item.stageTitle}
                </p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {formatDate(item.grantedAt)} 开通 · {sourceLabel[item.source] ?? item.source}
                </p>
              </div>
              <Link to={`/stage/${item.stageSlug}`} className="btn btn-sm btn-outline shrink-0">
                去学习
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center text-[13px] text-slate-500">
          还没有开通任何阶段。
        </p>
      )}

      {locked.length > 0 && (
        <>
          <h3 className="mt-6 text-[13px] font-semibold text-slate-500">还未开通</h3>
          <ul className="mt-3 space-y-2.5">
            {locked.map((stage) => {
              const plan = plans.find((p) => p.id === stage.slug)
              return (
                <li
                  key={stage.slug}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-slate-900">
                      {stage.tag} · {stage.title}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {stageLessonCount(stage)} 节课 · 1 个阶段项目
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[15px] font-bold text-slate-900">¥{stage.price}</span>
                    {plan && plan.isPurchasable !== false && (
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => onBuy(plan)}>
                        去开通
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
      <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">项目实战 · Project Lab</h3>
        <p className="mt-2 text-sm text-slate-600">{user?.productEntitlements.includes('project-lab') ? 'Project Lab 已开通。可进入 9 节 Capstone 毕业项目实战。' : 'Project Lab 未开通。阶段项目仍属于对应课程阶段。'}</p>
        {!user?.productEntitlements.includes('project-lab') && <Link to="/pricing" className="mt-2 inline-block text-sm text-brand-700">查看项目版</Link>}
      </div>
    </section>
  )
}

/* ------------------------------- 学习概览 ------------------------------- */

function LearningSection() {
  const { completedLessons, overallPercent, lastLessonPath, loading } = useProgress()
  const totalLessons = curriculumFormalLessonCount()
  const hasContinue = lastLessonPath.startsWith('/lesson/')

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-slate-900">学习概览</h2>
        <Link to="/dashboard" className="link-more">
          完整学习看板
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <p role="status" className="mt-5 text-[13px] text-slate-500">
          正在加载学习记录…
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <Ring percent={overallPercent} size={92} stroke={9}>
            <strong className="text-[19px] text-slate-900">{overallPercent}%</strong>
          </Ring>
          <div className="min-w-0 text-[13px] leading-6 text-slate-600">
            已完成 <strong className="text-slate-900">{completedLessons}</strong> / {totalLessons} 节课
            <br />
            <Link to={lastLessonPath} className="text-brand-600">
              {hasContinue ? '继续上次的课程' : '开始学习'}
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

/* ----------------------------- 账号与安全 ------------------------------ */

function SecuritySection({ onContact }: { onContact: () => void }) {
  const { logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [logoutError, setLogoutError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      await api('/auth/password', { method: 'POST', body: jsonBody({ currentPassword, newPassword }) })
      await refreshUser()
      navigate('/login')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <aside className="space-y-4">
      <EmailSecurity />
      <section className="card p-5">
        <h2 className="text-[15px] font-semibold text-slate-900">账号与安全</h2>
        <p className="mt-1.5 text-[12px] leading-5 text-slate-500">修改密码后需要重新登录。</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-[12.5px] text-slate-600">
            当前密码
            <input
              className="mt-1.5 h-10 w-full rounded-lg border px-3 text-[13px]"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={72}
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </label>
          <label className="block text-[12.5px] text-slate-600">
            新密码
            <input
              className="mt-1.5 h-10 w-full rounded-lg border px-3 text-[13px]"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-[12.5px] text-red-600">
              {error}
            </p>
          )}
          <button disabled={pending} className="btn btn-md btn-primary w-full">
            {pending ? '保存中…' : '修改密码'}
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="text-[15px] font-semibold text-slate-900">其他</h2>
        <div className="mt-4 space-y-2">
          <button type="button" className="btn btn-md btn-outline w-full justify-start" onClick={onContact}>
            <MessageCircle className="h-4 w-4" />
            联系管理员
          </button>
          <button
            type="button"
            className="btn btn-md btn-outline w-full justify-start"
            onClick={() => {
              void logout().catch((e) => setLogoutError(errorMessage(e)))
            }}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
        {logoutError && (
          <p role="alert" className="mt-2 text-[12.5px] text-red-600">
            {logoutError}
          </p>
        )}
      </section>
    </aside>
  )
}

/* ------------------------------- 个人中心 ------------------------------- */

export default function AccountPage() {
  const [selected, setSelected] = useState<Plan | null>(null)
  const [consult, setConsult] = useState(false)

  return (
    <>
      <section className="bg-gradient-to-b from-[#E9F2FE] via-[#F5F9FF] to-white">
        <div className="shell py-9 sm:py-10">
          <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">个人中心</span>
          <h1 className="mt-4 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[36px]">我的账号</h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-600">
            查看账号信息、已开通的课程权限，以及当前的学习情况。
          </p>
        </div>
      </section>

      <div className="shell grid grid-cols-1 gap-5 pb-12 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-5">
          <ProfileSection />
          <CoursesSection onBuy={setSelected} />
          <LearningSection />
        </div>
        <SecuritySection onContact={() => setConsult(true)} />
      </div>

      {selected && <PurchaseModal plan={selected} onClose={() => setSelected(null)} />}
      {consult && <PurchaseModal onClose={() => setConsult(false)} />}
    </>
  )
}
