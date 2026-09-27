import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Lock } from 'lucide-react'
import { Breadcrumb, Progress, StageChip, lessonDot } from '../components/ui'
import {
  accentClass,
  stageCompletedCount,
  stageLessonCount,
  stageStatusLabel,
  totalLessons,
} from '../data/courses'
import { useProgress } from '../data/progress'

export default function CourseCatalog() {
  const { stages, completedLessons, overallPercent, lastLessonPath } = useProgress()
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 80%)' }}
        />
        <div className="shell relative py-12">
          <Breadcrumb items={[{ label: '课程' }]} />
          <h1 className="mt-4 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[36px]">课程目录</h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-6 text-slate-500">
            4 个阶段共 {totalLessons} 节课，每节课都围绕一个具体任务展开。按顺序学习，完成阶段项目后即可进入下一阶段。
          </p>

          <div className="mt-7 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
            <div className="card p-4">
              <p className="text-[12px] text-slate-400">总体进度</p>
              <p className="mt-1 text-[24px] font-bold leading-none text-slate-900">{overallPercent}%</p>
              <Progress value={overallPercent} className="mt-3" />
              <p className="mt-2 text-[11.5px] text-slate-400">
                已完成 {completedLessons} / {totalLessons} 课
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/path" className="btn btn-md btn-primary">
                查看学习路径
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to={lastLessonPath} className="btn btn-md btn-outline">
                继续上次学习
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="shell space-y-8 pb-8 pt-12">
        {stages.map((s) => {
          const a = accentClass[s.accent]
          const locked = s.status === 'locked'
          const done = stageCompletedCount(s)
          const total = stageLessonCount(s)
          return (
            <div key={s.id} className="card overflow-hidden">
              <div className={`flex flex-wrap items-center gap-4 border-b border-slate-100 ${a.softBg} px-5 py-4`}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`chip bg-white/85 ${a.text}`}>{s.tag}</span>
                    <h2 className={`text-[16px] font-semibold ${locked ? 'text-slate-400' : 'text-slate-900'}`}>
                      {s.title}
                    </h2>
                    <StageChip status={s.status} label={stageStatusLabel[s.status]} />
                  </div>
                  <p className={`mt-2 text-[12.5px] leading-5 ${locked ? 'text-slate-400' : 'text-slate-500'}`}>
                    {s.subtitle}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <div className="hidden items-center gap-1.5 text-[12px] text-slate-500 sm:flex">
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={1.9} />
                    {total} 节课
                  </div>
                  <div className="hidden items-center gap-1.5 text-[12px] text-slate-500 sm:flex">
                    <Clock className="h-3.5 w-3.5" strokeWidth={1.9} />
                    {s.shortDuration}
                  </div>
                  <div className="w-[92px]">
                    <Progress value={Math.round((done / total) * 100)} barClassName={a.bg} />
                    <p className="mt-1.5 text-right text-[11px] tabular-nums text-slate-400">
                      {done}/{total}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="divide-y divide-slate-100">
                {s.lessons.map((l) => {
                  const isLocked = l.status === 'locked'
                  const isActive = l.status === 'in_progress'
                  const Inner = (
                    <>
                      <span className="w-8 shrink-0 text-[12px] tabular-nums text-slate-400">{l.code}</span>
                      <span className="shrink-0">{lessonDot[l.status]()}</span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[13px] ${
                            isLocked
                              ? 'text-slate-400'
                              : isActive
                                ? 'font-semibold text-brand-700'
                                : 'font-medium text-slate-800'
                          }`}
                        >
                          {l.title}{l.isPublished === false ? ' · 即将上线' : l.isPreview ? ' · 免费体验' : ''}
                        </span>
                        <span className={`mt-0.5 block text-[11.5px] ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                          {l.desc}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1.5 text-[11.5px] text-slate-400 sm:inline-flex">
                        <Clock className="h-3 w-3" strokeWidth={2} />
                        {l.duration}
                      </span>
                      {isLocked ? (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      )}
                    </>
                  )
                  return (
                    <li key={l.id}>
                      {isLocked ? (
                        <div className="flex items-center gap-3 px-5 py-3.5">{Inner}</div>
                      ) : (
                        <Link
                          to={`/lesson/${s.slug}/${l.id}`}
                          className={`flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50 ${
                            isActive ? 'bg-brand-50/40' : ''
                          }`}
                        >
                          {Inner}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                <span className="text-[12px] text-slate-500">
                  阶段项目：<span className="font-medium text-slate-700">{s.project.title}</span>
                </span>
                <Link to={`/project/${s.project.id}`} className="link-more">
                  查看项目
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
