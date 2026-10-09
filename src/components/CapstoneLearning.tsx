import { ArrowLeft, ArrowRight, Check, Circle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { capstoneLessons, type CapstoneLesson } from '../data/capstoneLessons.js'
import type { CapstoneProgress } from '../data/capstoneProgress.js'
import { Breadcrumb, Progress } from './ui.js'

export const capstonePhases = ['DEFINE', 'ARCHITECT', 'INGEST', 'GROUND', 'ORCHESTRATE', 'EXPAND EVIDENCE', 'CONTROL WRITES', 'EVALUATE', 'DELIVER']

export function CapstoneSidebar({ currentLessonId, progress, onNavigate }: { currentLessonId: string; progress: CapstoneProgress | null; onNavigate?: () => void }) {
  return <div className="flex h-full flex-col">
    <Link to="/capstone" onClick={onNavigate} className="inline-flex items-center gap-1.5 px-4 pt-4 text-[13px] text-slate-500 hover:text-brand-600"><ArrowLeft className="h-3.5 w-3.5" />Project Lab 总览</Link>
    <div className="px-4 pt-4"><div className="card p-4">
      <h2 className="text-[14px] font-bold text-slate-900">Capstone Project Lab</h2>
      <p className="mt-3 flex items-center justify-between text-[12px] text-slate-500"><span>毕业项目进度</span><strong className="text-brand-600">{progress?.completed ?? 0} / {progress?.total ?? 9}</strong></p>
      <Progress value={progress ? progress.completed / progress.total * 100 : 0} className="mt-2" />
    </div></div>
    <nav aria-label="Capstone 九课目录" className="mt-4 min-h-0 flex-1 overflow-y-auto px-4 pb-6"><ul className="space-y-1">
      {capstoneLessons.filter(l => l.published).map(lesson => {
        const current = lesson.id === currentLessonId, done = progress?.completedLessons.includes(lesson.id)
        return <li key={lesson.id}><Link to={'/capstone/lessons/' + lesson.id} onClick={onNavigate} aria-current={current ? 'page' : undefined} className={`flex items-start gap-2 rounded-lg border-l-2 px-2 py-2.5 transition ${current ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}>
          {done ? <Check aria-label="已完成" className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <Circle aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300" />}
          <span className="min-w-0"><span className="flex flex-wrap items-baseline gap-x-2"><strong className="text-[12px]">{lesson.id.toUpperCase()}</strong><span className="text-[10px] text-slate-500">{capstonePhases[lesson.order - 1]}</span></span><span className="mt-1 block text-[13px] font-medium leading-5">{lesson.title}</span><span className="mt-1 block text-[11px] text-slate-400">{lesson.estimatedTime}</span></span>
        </Link></li>
      })}
    </ul></nav>
  </div>
}

export function CapstoneLessonHeader({ lesson, objective }: { lesson: CapstoneLesson; objective: string }) {
  return <>
    <Breadcrumb items={[{ label: '课程目录', to: '/courses' }, { label: 'Capstone Project Lab', to: '/capstone' }, { label: lesson.id.toUpperCase() }]} />
    <header className="lesson-header">
      <span className="chip bg-brand-50 text-brand-600">{lesson.id.toUpperCase()} · {capstonePhases[lesson.order - 1]}</span>
      <h1 className="lesson-title">{lesson.title}</h1>
      <p className="mt-4 text-[16px] leading-7 text-slate-600"><span className="font-semibold text-slate-700">本课目标：</span>{objective}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-slate-500"><Clock className="h-3.5 w-3.5 text-slate-400" />预计学习时间：{lesson.estimatedTime}</p>
    </header>
  </>
}

export function CapstoneLessonNavigation({ lessonId }: { lessonId: string }) {
  const index = capstoneLessons.findIndex(l => l.id === lessonId)
  if (index < 0) return null
  const previous = capstoneLessons[index - 1], next = capstoneLessons[index + 1]
  return <nav aria-label="课时导航" className="mt-10 flex flex-wrap justify-between gap-4 border-t border-slate-200 pt-6">
    {previous && <Link to={'/capstone/lessons/' + previous.id} className="btn btn-md btn-outline"><ArrowLeft className="h-4 w-4" />上一课 · {previous.id.toUpperCase()}</Link>}
    {next && <Link to={'/capstone/lessons/' + next.id} className="btn btn-md btn-outline ml-auto">下一课 · {next.id.toUpperCase()}<ArrowRight className="h-4 w-4" /></Link>}
  </nav>
}
