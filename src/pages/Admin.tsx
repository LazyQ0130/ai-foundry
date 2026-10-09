import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, NavLink, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDown, ArrowLeft, ArrowRight, Bell, BookOpen, ChevronDown,
  ClipboardList, Crown, Filter, GraduationCap,
  Home, Menu, MoreHorizontal, Search, Settings, ShieldCheck,
  SlidersHorizontal, UserRound, UserRoundPlus, Users,
} from 'lucide-react'
import { BrandLockup } from '../components/Icon'
import { stages } from '../data/courses'
import CoursesSection from '../components/AdminCourses'

import { api, errorMessage } from '../lib/api'
import { AccessModal, DetailModal, actionLabels, formatTime, type AdminUser, type Activity } from '../components/AdminControls'
import { useAuth } from '../auth/AuthProvider'
type AdminState = { users: AdminUser[]; activity: Activity[] }
type Stats = { total: number; enrolled: number; disabled: number; thisWeek: number; allAccess: number }
type Filters = { tab: string; accessFilter: string; statusFilter: string; sortNewest: boolean }
const sectionNames: Record<string, string> = {
  overview: '概览', users: '用户管理', courses: '课程管理', entitlements: '权限记录', settings: '设置',
}
const navItems = [
  { id: 'overview', label: '概览', icon: Home },
  { id: 'users', label: '用户管理', icon: UserRound },
  { id: 'courses', label: '课程管理', icon: BookOpen },
  { id: 'entitlements', label: '权限记录', icon: ClipboardList },
  { id: 'settings', label: '设置', icon: Settings },
]

const accessLabel = (ids: number[]) => ids.length === 4 ? '全阶段课程' : ids.length ? ids.map((id) => `阶段 ${id}`).join('、') : '未开通'

function StatCard({ icon, title, value, tone }: { icon: ReactNode; title: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[13px] text-slate-600">{title}</p>
          <p className="mt-1 text-[25px] font-bold leading-none tabular-nums text-slate-900">{value.toLocaleString('zh-CN')}</p>
          <p className="mt-2 text-[11px] text-slate-400">数据库实时数据</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
 return <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center"><Users className="h-10 w-10 text-brand-600" /><h3 className="mt-5 text-lg font-semibold">{filtered ? '没有找到符合条件的用户' : '还没有用户数据'}</h3><p className="mt-2 text-sm text-slate-500">用户注册后会出现在这里，可搜索手机号为其开通课程。</p></div>
}

function UsersSection({ users, stats, query, setQuery, onFilters, onView, onAccess, onToggleStatus }: { users: AdminUser[]; stats: Stats; query: string; setQuery: (value: string) => void; onFilters: (value: Filters) => void; onView: (user: AdminUser) => void; onAccess: (user: AdminUser) => void; onToggleStatus: (user: AdminUser) => void }) {
  const [tab, setTab] = useState('all')
  const [accessFilter, setAccessFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortNewest, setSortNewest] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState(false)
  const enrolled = stats.enrolled
  const thisWeek = stats.thisWeek
  const tabs = [
    { id: 'all', label: '全部用户', count: stats.total },
    { id: 'enrolled', label: '已开通课程', count: enrolled },
    { id: 'unenrolled', label: '未开通课程', count: stats.total - enrolled },
    { id: 'disabled', label: '已禁用', count: stats.disabled },
  ]
  useEffect(() => { onFilters({ tab, accessFilter, statusFilter, sortNewest }) }, [tab, accessFilter, statusFilter, sortNewest, onFilters])
  const filtered = users
  const allSelected = filtered.length > 0 && filtered.every((user) => selected.includes(user.id))

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[330px_repeat(4,minmax(0,1fr))]">
        <div className="py-2"><h1 className="text-[27px] font-bold tracking-tight text-slate-950">用户管理</h1><p className="mt-2 text-[13px] text-slate-500">管理平台用户信息、课程权限及账号状态。</p><p className="mt-2 text-[11px] text-slate-400">搜索注册手机号，确认付款后人工开通课程。</p></div>
        <StatCard icon={<Users className="h-6 w-6" />} title="用户总数" value={stats.total} tone="bg-blue-50 text-brand-600" />
        <StatCard icon={<UserRoundPlus className="h-6 w-6" />} title="本周新增" value={thisWeek} tone="bg-blue-50 text-brand-600" />
        <StatCard icon={<GraduationCap className="h-6 w-6" />} title="已开通用户" value={enrolled} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={<Crown className="h-6 w-6" />} title="全阶段课程用户" value={stats.allAccess} tone="bg-orange-50 text-orange-500" />
      </div>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><div className="flex flex-wrap gap-2">{tabs.map((item) => <button key={item.id} type="button" onClick={() => { setTab(item.id); setSelected([]) }} className={`rounded-lg border px-4 py-2.5 text-[13px] font-medium transition ${tab === item.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'}`}>{item.label} <span className="ml-1 tabular-nums opacity-75">({item.count})</span></button>)}</div></div>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 sm:max-w-[380px]"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索用户姓名或手机号..." className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400" /></label>
          <label className="relative"><span className="sr-only">筛选课程权限</span><select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)} className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-[13px] text-slate-600 outline-none focus:border-brand-500"><option value="all">选择课程权限</option>{stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.tag} · {stage.title}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" /></label>
          <label className="relative"><span className="sr-only">筛选账号状态</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-[13px] text-slate-600 outline-none focus:border-brand-500"><option value="all">选择账号状态</option><option value="active">正常</option><option value="disabled">已禁用</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" /></label>
          <button type="button" onClick={() => setMoreFilters((value) => !value)} className="btn btn-md btn-outline ml-auto"><Filter className="h-4 w-4" />更多筛选</button>
        </div>
        {moreFilters ? <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3 text-[12px] text-slate-600"><SlidersHorizontal className="h-4 w-4 text-brand-600" /><span>排序方式</span><button type="button" onClick={() => setSortNewest(true)} className={`rounded px-2 py-1 ${sortNewest ? 'bg-brand-50 text-brand-700' : ''}`}>最新注册优先</button><button type="button" onClick={() => setSortNewest(false)} className={`rounded px-2 py-1 ${!sortNewest ? 'bg-brand-50 text-brand-700' : ''}`}>最早注册优先</button><button type="button" onClick={() => { setQuery(''); setAccessFilter('all'); setStatusFilter('all'); setTab('all') }} className="ml-auto text-brand-600 hover:underline">清除筛选</button></div> : null}
        <div className="overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-[12px]"><thead className="border-b border-slate-200 bg-[#f8faff] text-slate-500"><tr><th className="w-12 px-4 py-3"><input type="checkbox" aria-label="选择所有当前用户" checked={allSelected} onChange={() => setSelected(allSelected ? [] : filtered.map((user) => user.id))} /></th><th className="min-w-[160px] py-3">用户</th><th className="min-w-[105px] py-3">手机号</th><th className="min-w-[125px] py-3"><button type="button" onClick={() => setSortNewest((value) => !value)} className="inline-flex items-center gap-1">注册时间 <ArrowDown className="h-3 w-3" /></button></th><th className="min-w-[120px] py-3">最近登录</th><th className="min-w-[115px] py-3">已开通阶段</th><th className="min-w-[110px] py-3">学习进度</th><th className="min-w-[90px] py-3">账号状态</th><th className="min-w-[220px] py-3">操作</th></tr></thead><tbody>
          {filtered.map((user) => <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"><td className="px-4 py-3"><input type="checkbox" aria-label={`选择 ${user.name}`} checked={selected.includes(user.id)} onChange={() => setSelected((current) => current.includes(user.id) ? current.filter((id) => id !== user.id) : [...current, user.id])} /></td><td className="py-3"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">{user.name.slice(0, 1)}</span><span className="font-semibold text-slate-800">{user.name}</span></div></td><td className="py-3 text-slate-600">{user.phoneMasked}</td><td className="py-3 text-slate-600">{formatTime(user.createdAt)}</td><td className="py-3 text-slate-500">{formatTime(user.lastLogin)}</td><td className="py-3"><span className={`inline-flex max-w-[125px] truncate rounded-lg px-2 py-1 font-medium ${user.entitlements.length ? 'bg-blue-50 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>{accessLabel(user.entitlements)}</span>{user.productEntitlements.includes('project-lab') && <span className="mt-1 block text-brand-700">项目工坊</span>}</td><td className="py-3"><span className="tabular-nums text-slate-700">{user.progress}%</span><span className="mt-1.5 block h-1.5 w-[85px] rounded-full bg-slate-200"><span className="block h-1.5 rounded-full bg-brand-600" style={{ width: `${user.progress}%` }} /></span></td><td className="py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${user.disabled ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${user.disabled ? 'bg-red-500' : 'bg-emerald-500'}`} />{user.disabled ? '已禁用' : '正常'}</span></td><td className="py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => onView(user)} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-medium text-slate-600 hover:border-brand-200">查看详情</button><button type="button" onClick={() => onAccess(user)} className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1.5 font-medium text-brand-700 hover:bg-brand-100">开通权限</button><button type="button" onClick={() => onToggleStatus(user)} aria-label={`${user.disabled ? '启用' : '禁用'} ${user.name}`} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"><MoreHorizontal className="h-4 w-4" /></button></div></td></tr>)}
        </tbody></table></div>
        {!filtered.length ? <EmptyState filtered={Boolean(query)} /> : <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-[12px] text-slate-500"><span>共 {filtered.length} 条记录{selected.length ? ` · 已选择 ${selected.length} 条` : ''}</span></div>}
      </section>
    </>
  )
}

function OverviewSection({ activity, stats }: AdminState & { stats: Stats }) {
  const enrolled = stats.enrolled
  return <div><div className="mb-6"><h1 className="text-[27px] font-bold text-slate-900">管理概览</h1><p className="mt-2 text-[13px] text-slate-500">查看课程平台用户和最近操作。</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={<Users className="h-6 w-6" />} title="用户总数" value={stats.total} tone="bg-blue-50 text-brand-600" /><StatCard icon={<GraduationCap className="h-6 w-6" />} title="已开通用户" value={enrolled} tone="bg-emerald-50 text-emerald-600" /><StatCard icon={<BookOpen className="h-6 w-6" />} title="课程阶段" value={stages.length} tone="bg-violet-50 text-violet-600" /><StatCard icon={<ShieldCheck className="h-6 w-6" />} title="最近操作" value={activity.length} tone="bg-orange-50 text-orange-600" /></div><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">快捷入口</h2><div className="mt-4 grid gap-3">{navItems.slice(1, 4).map((item) => <Link key={item.id} to={`/admin/${item.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-[13px] text-slate-700 hover:border-brand-200"><span className="flex items-center gap-2"><item.icon className="h-4 w-4 text-brand-600" />{item.label}</span><ArrowRight className="h-4 w-4 text-slate-400" /></Link>)}</div></section><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">最近操作</h2>{activity.length ? <ul className="mt-4 space-y-3">{activity.slice(0, 4).map((entry) => <li key={entry.id} className="border-b border-slate-100 pb-3 text-[12px]"><span className="font-medium text-slate-700">{entry.action} · {entry.userName}</span><span className="ml-2 text-slate-400">{formatTime(entry.at)}</span></li>)}</ul> : <p className="mt-10 text-center text-[13px] text-slate-400">暂无操作记录</p>}</section></div></div>
}

function EntitlementsSection({ activity }: { activity: Activity[] }) {
 return <div><h1 className="text-[27px] font-bold">权限记录</h1><p className="mt-2 text-sm text-slate-500">包含开通、撤销、账号与课程设置操作。</p><section className="mt-6 overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b bg-slate-50">{['时间','管理员','用户','操作','权益','备注'].map((v)=><th className="p-4" key={v}>{v}</th>)}</tr></thead><tbody>{activity.map((a)=><tr key={a.id} className="border-b"><td className="p-4">{formatTime(a.at)}</td><td>{a.adminName}</td><td>{a.userName}<br/>{a.phoneMasked}</td><td>{actionLabels[a.action] ?? a.action}</td><td>{[...(a.metadata.stages ?? []), ...(a.metadata.products ?? []), ...(a.metadata.productKey ? [a.metadata.productKey] : [])].join('、') || '—'}</td><td className="max-w-xs break-words p-4">{a.detail}</td></tr>)}</tbody></table>{!activity.length && <p className="p-16 text-center text-sm text-slate-400">暂无操作记录</p>}</section></div>
}
function SettingsSection() {
 const { user, logout } = useAuth()
 return <div><h1 className="text-[27px] font-bold">设置</h1><section className="card mt-6 max-w-2xl p-6"><h2 className="font-semibold">当前管理员：{user?.nickname}</h2><p className="mt-3 text-sm text-slate-500">账号 {user?.phoneMasked}。课程正文通过仓库文件维护，用户权限与学习记录保存在数据库中。</p><Link to="/account" className="btn btn-md btn-outline mt-4">修改密码</Link><button className="btn btn-md btn-outline ml-2" onClick={()=>void logout()}>退出登录</button></section></div>
}

export default function Admin() {
  const { section = 'users' } = useParams<{ section?: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [data, setData] = useState<AdminState>({ users: [], activity: [] })
  const [stats, setStats] = useState<Stats>({ total: 0, enrolled: 0, disabled: 0, thisWeek: 0, allAccess: 0 })
  const [query, setQueryValue] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [filters, setFilters] = useState<Filters>({ tab: 'all', accessFilter: 'all', statusFilter: 'all', sortNewest: true })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [accessUser, setAccessUser] = useState<AdminUser | null>(null)
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null)
  const setQuery = (value: string) => { setQueryValue(value); setPage(1) }
  const onFilters = useCallback((value: Filters) => { setFilters(value); setPage(1) }, [])
  useEffect(() => { setPage(1); setQueryValue('') }, [section])
  useEffect(() => {
    let alive = true
    if (!['users','overview','entitlements'].includes(section)) { setLoading(false); return }
    setLoading(true); setError('')
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '20', query })
      if (filters.accessFilter !== 'all') params.set('stage', 'stage-' + filters.accessFilter)
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter.toUpperCase())
      if (filters.tab === 'disabled') params.set('status', 'DISABLED')
      if (['enrolled','unenrolled'].includes(filters.tab)) params.set('access', filters.tab)
      params.set('sort', filters.sortNewest ? 'desc' : 'asc')
      try {
        const result = section === 'entitlements' ? await api<{ activity: Activity[]; pagination: { pages: number } }>('/admin/audit?' + params) : await api<{ users: AdminUser[]; stats: Stats; pagination: { pages: number } }>('/admin/users?' + params)
        if (!alive) return
        if ('users' in result) { setData((d)=>({...d, users: result.users})); setStats(result.stats) }
        else setData((d)=>({...d, activity: result.activity}))
        setPages(result.pagination.pages)
        if (section === 'overview') { const recent = await api<{ activity: Activity[] }>('/admin/audit?pageSize=5'); if(alive) setData((d)=>({...d,activity:recent.activity})) }
      } catch (e) { if(alive) setError(errorMessage(e)) } finally { if(alive) setLoading(false) }
    }, 250)
    return () => { alive = false; window.clearTimeout(timer) }
  }, [section, query, page, filters, revision])
  const view = async (user: AdminUser, access = false) => {
    try { const detail = await api<AdminUser>('/admin/users/' + user.id); if(access) setAccessUser(detail); else setDetailUser(detail) } catch(e) { setError(errorMessage(e)) }
  }
  const updated = async () => {
    if(accessUser) setAccessUser(await api<AdminUser>('/admin/users/' + accessUser.id))
    if(detailUser) setDetailUser(await api<AdminUser>('/admin/users/' + detailUser.id))
    setRevision((v)=>v+1)
  }
  const toggleStatus = async (user: AdminUser) => {
    try { await api('/admin/users/' + user.id + (user.disabled ? '/enable' : '/disable'), { method:'POST' }); await updated() } catch(e) { setError(errorMessage(e)) }
  }
  if (!sectionNames[section]) return <Navigate to="/admin/users" replace />

  return (
    <div className="min-h-screen bg-[#f7faff] text-slate-800">
      <header className="sticky top-0 z-40 flex h-[70px] items-center gap-5 border-b border-slate-200 bg-white px-4 sm:px-6">
        <button type="button" aria-label="打开后台菜单" onClick={() => setMenuOpen((value) => !value)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
        <Link to="/admin/users" className="flex shrink-0 items-center gap-1.5"><BrandLockup /><span className="hidden text-[18px] font-bold text-slate-900 sm:inline">管理后台</span></Link>
        <label className="ml-2 hidden h-11 w-full max-w-[445px] items-center gap-2 rounded-lg bg-slate-100 px-3 text-slate-500 md:flex"><Search className="h-5 w-5" /><input value={query} onChange={(event) => { setQuery(event.target.value); if (!['users','entitlements'].includes(section)) navigate('/admin/users') }} placeholder="搜索注册手机号..." className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400" /></label>
        <div className="ml-auto flex shrink-0 items-center gap-3"><div className="relative"><button type="button" aria-label="通知" onClick={() => setNotificationsOpen((value) => !value)} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Bell className="h-5 w-5" /></button>{notificationsOpen ? <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-slate-200 bg-white p-4 text-[12px] text-slate-500 shadow-xl">暂无新通知</div> : null}</div><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-brand-700"><ShieldCheck className="h-5 w-5" /></span><span className="hidden text-[13px] font-semibold text-slate-800 sm:inline">管理员</span><button className="whitespace-nowrap text-xs text-slate-500" onClick={()=>void logout().catch((e)=>setError(errorMessage(e)))}>退出</button></div>
      </header>
      {menuOpen ? <button type="button" aria-label="关闭菜单" className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden" onClick={() => setMenuOpen(false)} /> : null}
      <aside className={`fixed bottom-0 left-0 top-[70px] z-30 w-[204px] border-r border-slate-200 bg-white px-3 py-5 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}><nav className="space-y-1.5">{navItems.map((item) => <NavLink key={item.id} to={`/admin/${item.id}`} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex h-12 items-center gap-3 rounded-lg px-4 text-[14px] transition ${isActive ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}><item.icon className="h-5 w-5" />{item.label}</NavLink>)}</nav><Link to="/" className="absolute bottom-6 left-6 flex items-center gap-2 text-[12px] text-slate-500 hover:text-brand-600"><ArrowLeft className="h-4 w-4" />返回网站</Link></aside>
      <main className="min-w-0 px-4 py-7 sm:px-6 lg:ml-[204px] lg:px-6 xl:px-6">
        {error && <div role="alert" className="card mb-4 p-5 text-red-600">{error}<button onClick={()=>setRevision((v)=>v+1)} className="btn btn-sm btn-outline ml-3">重试</button></div>}
        {loading && <p role="status" className="mb-4 text-sm text-slate-500">正在加载数据库记录…</p>}
        <div className={loading || error ? 'hidden' : ''}>
        {section === 'users' && <UsersSection users={data.users} stats={stats} query={query} setQuery={setQuery} onFilters={onFilters} onView={(u)=>void view(u)} onAccess={(u)=>void view(u,true)} onToggleStatus={(u)=>void toggleStatus(u)} />}
        {section === 'overview' && <OverviewSection {...data} stats={stats} />}
        {section === 'courses' && <CoursesSection />}
        {section === 'entitlements' && <><label className="sr-only" htmlFor="audit-query">搜索手机号</label><input id="audit-query" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="搜索手机号" className="mb-4 h-10 rounded-lg border px-3"/><EntitlementsSection activity={data.activity}/></>}
        {section === 'settings' && <SettingsSection />}
        {['users','entitlements'].includes(section) && <div className="mt-4 flex items-center justify-end gap-3 text-sm"><button disabled={page<=1} className="btn btn-sm btn-outline" onClick={()=>setPage((p)=>p-1)}>上一页</button><span>{page} / {Math.max(1,pages)}</span><button disabled={page>=pages} className="btn btn-sm btn-outline" onClick={()=>setPage((p)=>p+1)}>下一页</button></div>}
        </div>
      </main>
      {accessUser && <AccessModal user={accessUser} onClose={()=>setAccessUser(null)} onUpdated={updated}/>}
      {detailUser && <DetailModal key={detailUser.id} user={detailUser} onClose={()=>setDetailUser(null)} onUpdated={updated} onAccess={()=>{setAccessUser(detailUser);setDetailUser(null)}}/>}

    </div>
  )
}
