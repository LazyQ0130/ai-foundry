import { stageLessonCount } from '../data/courses'
import { stageCompletedCount } from '../data/learningProgress'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Code2, Target } from 'lucide-react'
import { Icon } from '../components/Icon'
import { Breadcrumb, Progress, StageChip } from '../components/ui'
import { accentClass, stageStatusLabel } from '../data/courses'
import { useProgress } from '../data/progress'
import { getProject } from '../data/site'

export default function ProjectsPage() {
  const { stages } = useProgress()
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 80%)' }}
        />
        <div className="shell relative py-12">
          <Breadcrumb items={[{ label: '项目' }]} />
          <h1 className="mt-4 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[36px]">阶段项目</h1>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-6 text-slate-500">
            每个阶段对应一个完整作品。从第一个 AI 小产品，到全栈应用、RAG 知识库与 Agent 产品，逐步构建你的作品集。
          </p>
        </div>
      </section>

      <section className="shell grid gap-4 pb-8 pt-12 sm:grid-cols-2">
        {stages.map((s) => {
          const p = getProject(s.project.id)
          const a = accentClass[s.accent]
          const locked = s.status === 'locked'
          const doneTasks = stageCompletedCount(s)
          const totalTasks = stageLessonCount(s)
          const percent = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0

          return (
            <Link
              key={s.id}
              to={`/project/${s.project.id}`}
              className={`card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift ${
                locked ? 'opacity-80' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip ${a.softBg} ${a.text}`}>{s.tag}项目</span>
                  <span className="chip bg-slate-100 text-slate-500">{s.title}</span>
                </div>
                <StageChip status={s.status} label={stageStatusLabel[s.status]} />
              </div>

              <h2 className="mt-3.5 text-[16px] font-semibold text-slate-900">{s.project.title}</h2>
              <p className="mt-2 flex-1 text-[12.5px] leading-5 text-slate-500">{s.project.desc}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" strokeWidth={1.9} />
                  {p?.difficulty ?? s.difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.9} />
                  {p?.duration ?? s.shortDuration}
                </span>
                {p?.supportTemplate ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Code2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    代码模板
                  </span>
                ) : null}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between text-[11.5px] text-slate-400">
                  <span>关联课程进度</span>
                  <span className="tabular-nums">
                    {doneTasks} / {totalTasks}
                  </span>
                </div>
                <Progress value={percent} className="mt-2" barClassName={a.bg} />
              </div>

              <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-600">
                查看项目详情
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          )
        })}
      </section>

      <section className="shell pb-8">
        <div className="card flex flex-wrap items-center justify-between gap-4 bg-brand-50/60 p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-brand-100">
              <Icon name="ship" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">作品集不是攒出来的，是做出来的</p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                完成 4 个阶段项目后，你会拥有四个可以写进简历的真实作品。
              </p>
            </div>
          </div>
          <Link to="/pricing" className="btn btn-md btn-primary">
            查看学习方案
          </Link>
        </div>
      </section>
    </>
  )
}
