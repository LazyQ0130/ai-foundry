import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { formalLessons, type Stage } from '../data/courses.js'

export function CourseOutline({ stage, allowed, loading = false }: { stage: Stage; allowed: boolean; loading?: boolean }) {
  const showDetails = !loading && allowed && !!stage.outlineAccess
  return <details className="group mt-4 border-t border-slate-100 pt-4">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded text-sm font-semibold text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 [&::-webkit-details-marker]:hidden"><span>{showDetails ? '展开学习起点与逐课内容' : '展开课程名称'}</span><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition group-open:rotate-180" /></summary>
    {showDetails && <dl className="mt-4 grid gap-3 text-sm leading-7 sm:grid-cols-2">
      <div><dt className="font-semibold text-slate-800">开始前</dt><dd className="text-slate-600">{stage.enterState}</dd></div>
      <div><dt className="font-semibold text-slate-800">完成后</dt><dd className="text-slate-600">{stage.exitState}</dd></div>
    </dl>}
    <ol className="mt-4 divide-y divide-slate-100">
      {formalLessons(stage.lessons).map(lesson => <li key={lesson.id} className="flex gap-3 py-3"><span className="w-7 shrink-0 text-xs leading-6 text-slate-400">{lesson.code}</span><div><h4 className="text-sm font-medium text-slate-800">{lesson.title}</h4>{showDetails && <p className="mt-1 text-[13px] leading-6 text-slate-600">{lesson.desc}</p>}</div></li>)}
    </ol>
    {stage.id === 1 && <p className="mt-3 rounded-lg bg-brand-50 p-3 text-xs leading-6 text-slate-600">另含第 0 课「开始前准备」。</p>}
    <Link to={`/stage/${stage.slug}`} className="btn btn-md btn-outline mt-4">进入阶段详情页<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
  </details>
}
