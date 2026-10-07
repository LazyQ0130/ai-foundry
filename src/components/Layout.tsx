import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronRight, Menu, X } from 'lucide-react'
import { BrandLockup } from './Icon'
import { useAuth } from '../auth/AuthProvider'
import { useProgress } from '../data/progress'
import UserAvatar from './UserAvatar'
import PurchaseModal from './PurchaseModal'

function AccountLinks() {
  const { user, loading } = useAuth()
  const { lastLessonPath, loading: progressLoading, error: progressError } = useProgress()
  return <>{loading ? <span className="text-xs text-slate-400">加载中…</span> : user ? <>
    <Link to="/account" title={user.nickname} aria-label={`${user.nickname}，个人中心`} className="inline-flex min-w-0 max-w-[180px] items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-[13px] font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"><UserAvatar nickname={user.nickname} avatarUrl={user.avatarUrl} size={28} /><span className="min-w-0 truncate">{user.nickname}</span></Link>
    {user.role === 'ADMIN' && <Link to="/admin/users" className="btn btn-sm btn-outline">后台</Link>}
    {progressLoading
      ? <button type="button" disabled aria-busy="true" className="btn btn-sm btn-primary shrink-0 whitespace-nowrap">继续学习</button>
      : <Link to={progressError ? '/dashboard' : lastLessonPath} className="btn btn-sm btn-primary shrink-0 whitespace-nowrap">继续学习</Link>}
  </> : <><Link to="/login" className="btn btn-sm btn-outline">登录</Link><Link to="/register" className="btn btn-sm btn-primary">开始学习</Link></>}</>
}

const navLinks = [
  { to: '/dashboard', label: '我的学习', match: (p: string) => p.startsWith('/dashboard') },
  { to: '/path', label: '学习路径', match: (p: string) => p.startsWith('/path') },
  {
    to: '/courses',
    label: '课程',
    match: (p: string) => p.startsWith('/courses') || p.startsWith('/stage') || p.startsWith('/lesson'),
  },
  { to: '/projects', label: '项目', match: (p: string) => p.startsWith('/project') },
  { to: '/pricing', label: '价格', match: (p: string) => p.startsWith('/pricing') },
]

function Navbar() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="shell flex h-14 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
            <BrandLockup />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => {
              const active = l.match(pathname)
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={`relative rounded-lg px-3 py-1.5 text-[13.5px] transition ${
                    active ? 'font-semibold text-brand-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l.label}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-[9px] h-[2px] rounded-full bg-brand-600" />
                  ) : null}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <AccountLinks />
        </div>

        <button
          type="button"
          aria-label="打开菜单"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200/70 bg-white md:hidden">
          <div className="shell flex flex-col py-3">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                  l.match(pathname) ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600'
                }`}
              >
                {l.label}
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </NavLink>
            ))}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AccountLinks />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

type FooterLink = { label: string; to?: string; contact?: boolean }

const footerCols: { title: string; links: FooterLink[] }[] = [
  {
    title: '课程',
    links: [
      { label: '学习路径', to: '/path' },
      { label: '课程目录', to: '/courses' },
      { label: '项目实战', to: '/projects' },
      { label: 'Capstone 毕业项目', to: '/capstone' },
      { label: '价格方案', to: '/pricing' },
    ],
  },
  {
    title: '阶段',
    links: [
      { label: '阶段 1 · AI 原生开发入门', to: '/stage/stage-1' },
      { label: '阶段 2 · AI 全栈开发', to: '/stage/stage-2' },
      { label: '阶段 3 · AI 应用开发', to: '/stage/stage-3' },
      { label: '阶段 4 · Agent 工程进阶', to: '/stage/stage-4' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '产品理念', to: '/about' },
      { label: '常见问题', to: '/faq' },
      { label: '用户协议', to: '/terms' },
      { label: '隐私政策', to: '/privacy' },
      { label: '联系我们', contact: true },
    ],
  },
]

const footerLinkClass = 'text-[13px] text-slate-500 transition hover:text-brand-600'

function Footer({ compact = false }: { compact?: boolean }) {
  const [contact, setContact] = useState(false)
  return (
    <footer className={`${compact ? 'mt-0' : 'mt-20'} border-t border-slate-200 bg-slate-50/70`}>
      <div className="shell py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <BrandLockup />
            </Link>
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-slate-500">
              面向大学生和初级开发者的 AI 原生开发成长平台。带着 AI，真正做出软件。
            </p>
            <div className="mt-4 flex gap-2">
              <span className="chip bg-white text-slate-500 ring-1 ring-slate-200">Build</span>
              <span className="chip bg-white text-slate-500 ring-1 ring-slate-200">Ship</span>
              <span className="chip bg-white text-slate-500 ring-1 ring-slate-200">AI Native</span>
            </div>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.contact ? (
                      <button type="button" className={footerLinkClass} onClick={() => setContact(true)}>
                        {l.label}
                      </button>
                    ) : (
                      <Link to={l.to ?? '/'} className={footerLinkClass}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-[12.5px] text-slate-400">
          <span>© {new Date().getFullYear()} AIFoundry. 保留所有权利。</span>
          <span>学到的东西，要能跑起来。</span>
        </div>
      </div>
      {contact && <PurchaseModal onClose={() => setContact(false)} />}
    </footer>
  )
}

export default function Layout() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    const instant = 'instant' as ScrollBehavior
    if (!hash) {
      window.scrollTo({ top: 0, behavior: instant })
      return
    }
    let id: string
    try { id = decodeURIComponent(hash.slice(1)) } catch { window.scrollTo({ top: 0, behavior: instant }); return }
    let elapsed = 0
    let stable = 0
    let lastHeight = -1
    let timer = 0
    const tick = () => {
      const target = document.getElementById(id)
      if (target) {
        // 等异步内容把页面撑完再定位，否则目标会被后来的内容推走。
        const height = document.documentElement.scrollHeight
        if (height === lastHeight) stable++
        else {
          stable = 0
          lastHeight = height
        }
        if (stable >= 2) {
          target.scrollIntoView({ behavior: instant, block: 'start' })
          return
        }
      }
      elapsed += 120
      if (elapsed < 6000) {
        timer = window.setTimeout(tick, 120)
        return
      }
      if (target) target.scrollIntoView({ behavior: instant, block: 'start' })
      else window.scrollTo({ top: 0, behavior: instant })
    }
    timer = window.setTimeout(tick, 120)
    return () => window.clearTimeout(timer)
  }, [pathname, hash, key])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer compact={pathname === '/pricing'} />
    </div>
  )
}
