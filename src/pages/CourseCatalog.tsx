import { CapstonePathCard } from '../components/CapstoneShowcase'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowDown, ArrowRight, BookOpen, ChevronDown, Clock, Lock, Target } from 'lucide-react'
import { Breadcrumb, Progress, StageChip, lessonDot } from '../components/ui'
import { accentClass, stageLessonCount, stageStatusLabel, totalLessons, type Stage } from '../data/courses'
import { stageCompletedCount } from '../data/learningProgress'
import { useProgress } from '../data/progress'
import { useAuth } from '../auth/AuthProvider'
import { homePathSteps } from '../data/site'

const stageProjectImages: Record<string, string> = {
  'stage-1': '/course-media/showcase/stage-1-concept.webp',
  'stage-2': '/course-media/showcase/stage-2-concept.webp',
  'stage-3': '/course-media/showcase/stage-3-concept.webp',
  'stage-4': '/course-media/showcase/stage-4-concept.webp',
}

/** Stage lesson list (collapsed by default). */
function LessonList({ stage }: { stage: Stage }) {
  return <ul className="divide-y divide-slate-100 border-t border-slate-100">
    {stage.lessons.map((l) => {
      const isLocked = l.status === 'locked'
      const isActive = l.status === 'in_progress'
      const inner = <>
        <span className="w-8 shrink-0 text-[12px] tabular-nums text-slate-400">{l.code}</span>
        <span className="shrink-0">{lessonDot[l.status]()}</span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[13px] ${isLocked ? 'text-slate-400' : isActive ? 'font-semibold text-brand-700' : 'font-medium text-slate-800'}`}>
            {l.title}{l.isPublished === false ? ' · 即将上线' : l.isPreview ? ' · 免费体验' : ''}
          </span>
          <span className={`mt-0.5 block text-[11.5px] ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>{l.desc}</span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 text-[11.5px] text-slate-400 sm:inline-flex"><Clock className="h-3 w-3" strokeWidth={2} />{l.duration}</span>
        {isLocked ? <Lock className="h-3.5 w-3.5 shrink-0 text-slate-300" /> : <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
      </>
      return <li key={l.id}>
        {isLocked
          ? <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>
          : <Link to={`/lesson/${stage.slug}/${l.id}`} className={`flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 ${isActive ? 'bg-brand-50/40' : ''}`}>{inner}</Link>}
      </li>
    })}
  </ul>
}

function StageCard({ stage, open, onToggle, showProgress }: { stage: Stage; open: boolean; onToggle: () => void; showProgress: boolean }) {
  const a = accentClass[stage.accent]
  const done = stageCompletedCount(stage)
  const total = stageLessonCount(stage)
  const listId = `stage-${stage.id}-lessons`
  return <article id={stage.slug} className="card scroll-mt-24 overflow-hidden">
    <header className={`flex flex-col gap-3 border-b border-slate-100 ${a.softBg} px-5 py-4 sm:flex-row sm:items-center sm:gap-4`}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`chip bg-white/85 ${a.text}`}>{stage.tag}</span>
          <h2 className="text-[17px] font-semibold text-slate-900">{stage.title}</h2>
          <StageChip status={stage.status} label={stageStatusLabel[stage.status]} />
        </div>
        <p className="mt-2 text-[13px] leading-5 text-slate-600">{stage.subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" strokeWidth={1.9} />{total} 节课</span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" strokeWidth={1.9} />{stage.shortDuration}</span>
        <span className="hidden items-center gap-1.5 sm:inline-flex"><Target className="h-3.5 w-3.5" strokeWidth={1.9} />{stage.difficulty}</span>
        {showProgress && <div className="w-[92px]">
          <Progress value={Math.round((done / Math.max(1, total)) * 100)} barClassName={a.bg} />
          <p className="mt-1.5 text-right text-[11px] tabular-nums text-slate-400">{done}/{total}</p>
        </div>}
      </div>
    </header>

    <div className="grid items-center gap-6 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,32fr)_minmax(0,36fr)_minmax(0,32fr)] lg:py-6">
      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
        <dl className="space-y-4 text-[13.5px] leading-6">
        <div><dt className="text-[12px] font-semibold text-slate-500">适合谁</dt><dd className="mt-1 text-slate-700">{stage.enterState}</dd></div>
        <div><dt className="text-[12px] font-semibold text-slate-500">学完能做到</dt><dd className="mt-1 text-slate-700">{stage.exitState}</dd></div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to={`/stage/${stage.slug}`} className="btn btn-md btn-primary">进入阶段<ArrowRight className="h-4 w-4" /></Link>
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={listId} className="btn btn-md btn-outline">
            {open ? '收起课程列表' : `展开 ${total} 节课`}<ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      <img src={stageProjectImages[stage.slug]} alt={`${stage.project.title}项目概念图`} width={960} height={720} loading="lazy" className={`aspect-[4/3] w-full min-w-0 rounded-xl ${a.softBg} object-contain`} />
      <div className="min-w-0">
        <p className={`text-[11px] font-semibold ${a.text}`}>阶段项目</p>
        <h3 className="mt-1 text-[17px] font-semibold text-slate-900">{stage.project.title}</h3>
        <p className="mt-3 text-[13px] leading-6 text-slate-500">{stage.project.desc}</p>
        <Link to={`/project/${stage.project.id}`} className="mt-4 inline-flex items-center gap-1.5 rounded text-[13px] font-medium text-brand-700 transition hover:text-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">查看项目<ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </div>

    {open && <div id={listId}><LessonList stage={stage} /></div>}
  </article>
}

export default function CourseCatalog() {
  const { stages, lastLessonPath } = useProgress()
  const { user } = useAuth()
  const { hash } = useLocation()
  // The stage that 继续学习 points at; fall back to the first stage in progress.
  const lastSlug = lastLessonPath.match(/^\/(?:lesson|stage)\/([^/]+)/)?.[1]
  const currentStageId = (stages.find((s) => s.slug === lastSlug) ?? stages.find((s) => s.status === 'in_progress'))?.id
  const [toggled, setToggled] = useState<Record<number, boolean>>({})
  // Logged-in learners see the stage they are working on expanded; everything else starts collapsed.
  const isOpen = (s: Stage) => toggled[s.id] ?? (Boolean(user) && s.id === currentStageId)

  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(hash.slice(1))
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
  }, [hash, stages.length])

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" style={{ maskImage: 'linear-gradient(to bottom, black, transparent 80%)' }} />
        <div className="shell relative py-10 sm:py-12">
          <Breadcrumb items={[{ label: '课程' }]} />
          <h1 className="mt-4 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[36px]">课程</h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-slate-600">
            4 个阶段 · {totalLessons} 节正式课 · 每个阶段一个项目。同一个知识工作台，从第一个页面一路升级成 AI 研究 Agent。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {user ? <>
              <Link to={lastLessonPath} className="btn btn-lg btn-primary">继续上次学习<ArrowRight className="h-4 w-4" /></Link>
              <Link to="/dashboard" className="btn btn-lg btn-outline">我的学习</Link>
            </> : <>
              <Link to="/lesson/stage-1/s1-l0" className="btn btn-lg btn-primary">免费体验第 0 课<ArrowRight className="h-4 w-4" /></Link>
              <Link to="/guide" className="btn btn-lg btn-outline">第一次来？先看课程导读</Link>
            </>}
          </div>
        </div>
      </section>

      <section id="projects" className="shell scroll-mt-20 pb-6 pt-8">
        {stages.map((s, i) => <div key={s.id}>
          <StageCard stage={s} open={isOpen(s)} onToggle={() => setToggled((t) => ({ ...t, [s.id]: !isOpen(s) }))} showProgress={Boolean(user)} />
          {i < stages.length - 1 && <p className="flex items-center justify-center gap-2 py-4 text-[12.5px] text-slate-500">
            <ArrowDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />「{s.project.title}」就是下一阶段的起点
          </p>}
        </div>)}
      </section>

      <section className="shell pb-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-5 py-4">
          <p className="text-[12px] font-semibold text-slate-500">每节课的学习方式</p>
          <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] text-slate-700">
            {homePathSteps.map((step, i) => <li key={step.title} className="inline-flex items-center gap-2" title={step.desc}>
              <span className="rounded-md bg-white px-2 py-1 font-medium ring-1 ring-slate-200">{i + 1}. {step.title}</span>
              {i < homePathSteps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />}
            </li>)}
          </ol>
        </div>
      </section>

      <section className="shell pb-12">
        <CapstonePathCard />
      </section>
    </>
  )
}
