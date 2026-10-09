import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { capstoneLessons } from '../data/capstoneLessons.js'
import type { CapstoneSummary } from '../data/capstoneProgress.js'
import { capstoneShowcase } from '../data/capstoneShowcase.js'
import { CourseResource } from './CourseResource.js'
import { Progress } from './ui.js'

/** Right-hand hero card on /capstone: progress for owners, course facts for everyone else. */
export function CapstoneOverviewStart({ data, loading }: { data: CapstoneSummary | null; loading: boolean }) {
  const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6'
  if (loading) return <div className={card}><p role="status" className="text-sm text-slate-500">正在加载项目进度…</p></div>
  const progress = data?.progress
  if (data?.access && progress) {
    const current = capstoneLessons.find(l => l.id === progress.continueLessonId)
    return <div className={card}>
      <p className="text-[12px] font-semibold text-brand-600">我的毕业项目</p>
      <p className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700"><span>毕业项目进度</span><span>{progress.completed} / {progress.total}</span></p>
      <Progress value={progress.completed / progress.total * 100} className="mt-2" />
      {current ? <>
        <p className="mt-5 text-xs font-semibold text-slate-500">{progress.completed ? '继续' : '开始'}：{current.id.toUpperCase()}</p>
        <p className="mt-1 font-semibold leading-6 text-slate-900">{current.title}</p>
        <Link className="btn btn-md btn-primary mt-4 w-full" to={'/capstone/lessons/' + current.id}>{progress.completed ? '继续学习' : '开始毕业项目'}</Link>
      </> : <>
        <p className="mt-5 text-sm text-slate-600">9 节毕业项目已全部完成。</p>
        <Link className="btn btn-md btn-outline mt-4 w-full" to="/capstone/lessons/c9">查看毕业项目</Link>
      </>}
      <div className="mt-5 border-t border-slate-100 pt-4"><CourseResource asset="capstone-starter" compact /></div>
    </div>
  }
  return <div className={card}>
    <p className="text-[12px] font-semibold text-slate-500">课程包含</p>
    <dl className="mt-3 grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-slate-50 p-3"><dt className="text-[11px] text-slate-500">课时</dt><dd className="mt-0.5 text-[15px] font-semibold text-slate-900">9 节课</dd></div>
      <div className="rounded-lg bg-slate-50 p-3"><dt className="text-[11px] text-slate-500">预计时长</dt><dd className="mt-0.5 text-[15px] font-semibold text-slate-900">约 18～23 小时</dd></div>
    </dl>
    <p className="mt-5 text-[12px] font-semibold text-slate-500">最终交付</p>
    <ul className="mt-2 grid gap-1.5 text-[13px] text-slate-700">
      {capstoneShowcase.deliverables.map(item => <li key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}</li>)}
    </ul>
    <p className="mt-5 border-t border-slate-100 pt-4 text-[12.5px] leading-5 text-slate-500">C1 可免费试看；完整 9 节需要项目工坊权益（项目版）。</p>
  </div>
}
