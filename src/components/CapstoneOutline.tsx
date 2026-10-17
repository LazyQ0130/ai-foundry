import { Link } from 'react-router-dom'
import { ArrowRight, Check, LockKeyhole } from 'lucide-react'
import type { CapstoneSummary } from '../data/capstoneProgress.js'
import { projectPricingPath } from '../lib/projectPricingNavigation.js'

export function CapstoneOutline({ data, allowed, loading = false }: { data: CapstoneSummary | null; allowed: boolean; loading?: boolean }) {
  if (loading || !allowed || !data?.access) return <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-5">
    <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><LockKeyhole aria-hidden="true" className="h-4 w-4" />项目工坊逐课内容</p>
    <p className="mt-2 text-sm leading-6 text-slate-500">{loading ? '正在确认项目工坊权限…' : '开通项目工坊后，可查看完整九课路线与逐课内容。'}</p>
    {!loading && <div className="mt-4 flex flex-wrap gap-3"><Link to={projectPricingPath()} className="btn btn-md btn-primary">查看项目版<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link><Link to="/capstone/preview/c1" className="btn btn-md btn-outline">免费试看 C1</Link></div>}
  </div>
  return <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {data.lessons.map(lesson => {
      const done = data.progress?.completedLessons.includes(lesson.id)
      const current = data.progress?.continueLessonId === lesson.id
      return <li key={lesson.id}><Link aria-label={`${lesson.id.toUpperCase()} ${lesson.title}，项目工坊`} to={`/capstone/lessons/${lesson.id}`} className={`flex h-full min-h-[132px] flex-col rounded-xl border bg-white p-4 transition hover:shadow-card ${current ? 'border-brand-300 ring-1 ring-brand-100' : 'border-slate-200 hover:border-brand-200'}`}>
        <span className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-brand-700">{lesson.id.toUpperCase()} · {lesson.phase}</span>{done && <Check aria-label="已完成" className="h-3.5 w-3.5 text-emerald-600" />}</span>
        <h4 className="mt-2 text-sm font-semibold text-slate-800">{lesson.title}</h4>
        <p className="mt-2 text-[13px] leading-6 text-slate-600">{lesson.desc}</p>
        <span className="mt-auto pt-3 text-xs font-semibold text-brand-700">{done ? '回顾本课' : current ? '继续学习' : '进入本课'} →</span>
      </Link></li>
    })}
  </ol>
}
