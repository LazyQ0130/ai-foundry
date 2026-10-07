import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Boxes, Check, ChevronRight, Clock, Lock, Target } from 'lucide-react'
import { Icon } from '../components/Icon'
import { Breadcrumb, Progress, Ring, SectionHeading, StageChip } from '../components/ui'
import {
  accentClass,
  stageLessonCount,
  stageStatusLabel,
  totalLessons,
  type Stage,
} from '../data/courses'
import { useProgress } from '../data/progress'
import { homePathSteps } from '../data/site'
import StageAccess from '../components/StageAccess'
import { CapstonePathCard } from '../components/CapstoneShowcase'

/* ------------------------------- Hero ------------------------------- */

const heroStatusStyle: Record<Stage['status'], { dot: string; label: string }> = {
  completed: { dot: 'bg-emerald-500', label: 'text-emerald-600' },
  in_progress: { dot: 'bg-brand-600', label: 'text-brand-600' },
  not_started: { dot: 'bg-slate-300', label: 'text-slate-400' },
  locked: { dot: 'bg-slate-300', label: 'text-slate-400' },
}

function Hero() {
  const { stages, completedLessons, overallPercent, lastLessonPath } = useProgress()
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
      <div
        className="grid-bg pointer-events-none absolute inset-0 opacity-60"
        style={{ maskImage: 'linear-gradient(to bottom, black, transparent 80%)' }}
      />
      <div className="shell relative grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:py-14">
        <div>
          <Breadcrumb items={[{ label: '学习路径', to: '/path' }, { label: '你的学习路径' }]} />
          <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[38px]">
            你的学习路径
          </h1>
          <p className="mt-2 text-[16px] font-semibold text-slate-800">一条结构化的 AI 原生开发者成长路径</p>
          <p className="mt-3 max-w-xl text-[13.5px] leading-6 text-slate-500">
            从第 0 课准备开始，完成 4 个学习阶段和 29 节正式课程；项目版可继续加入 Project Lab 毕业项目实战。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={lastLessonPath} className="btn btn-lg btn-primary">
              继续学习
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/courses" className="btn btn-lg btn-outline">
              查看课程目录
            </Link>
          </div>
          <Link to="/guide" className="mt-5 block max-w-xl rounded-xl border border-brand-100 bg-white/90 px-4 py-3 text-[13px] text-slate-600 shadow-sm hover:border-brand-300"><span className="font-semibold text-brand-700">开始前推荐 · 课程导读</span><br />第一次来到 AIFoundry？先用 25～35 分钟看懂 AI 时代、核心概念和整条学习路线。<span className="mt-1 block font-medium text-brand-700">阅读课程导读 →</span></Link>
        </div>

        <div className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-slate-900">总体学习进度</h2>
            <span className="text-[11.5px] text-slate-400">
              4 个学习阶段 · {totalLessons} 节正式课
            </span>
          </div>

          <div className="mt-4 flex items-center gap-5">
            <Ring percent={overallPercent} size={96} stroke={9}>
              <span className="text-[20px] font-bold leading-none text-slate-900">{overallPercent}%</span>
              <span className="mt-1 text-[10.5px] text-slate-400">已完成</span>
            </Ring>

            <ul className="min-w-0 flex-1 space-y-2.5">
              {stages.map((s) => {
                const st = heroStatusStyle[s.status]
                return (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${st.dot}`} />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-slate-600">
                      {s.tag}　{s.title}
                    </span>
                    <span className={`shrink-0 text-[11.5px] font-medium ${st.label}`}>
                      {stageStatusLabel[s.status]}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between text-[11.5px] text-slate-400">
              <span>已完成 {completedLessons} 节课</span>
              <span>共 {totalLessons} 节课</span>
            </div>
            <Progress value={overallPercent} className="mt-2" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* --------------------------- 路径总览（时间轴） --------------------------- */

function StepDot({ stage }: { stage: Stage }) {
  if (stage.status === 'completed') {
    return (
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  }
  if (stage.status === 'in_progress') {
    return (
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-4 ring-brand-100">
        {stage.id}
      </span>
    )
  }
  if (stage.status === 'locked') {
    return (
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-slate-200 text-slate-400">
        <Lock className="h-2.5 w-2.5" strokeWidth={2.4} />
      </span>
    )
  }
  return (
    <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500">
      {stage.id}
    </span>
  )
}

function Timeline() {
  const { stages } = useProgress()
  return (
    <div className="relative mb-5 hidden lg:block">
      <div className="absolute left-[9px] right-0 top-[9px] h-px bg-slate-200" />
      <div className="relative grid grid-cols-4">
        {stages.map((s) => (
          <div key={s.id} className="flex items-center gap-2.5">
            <span className="relative z-10">
              <StepDot stage={s} />
            </span>
            <span className="bg-white pr-3 text-[12.5px] text-slate-500">{s.tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StageOverviewCard({ stage }: { stage: Stage }) {
  const a = accentClass[stage.accent]
  const locked = stage.status === 'locked'
  const frame = locked
    ? 'border-slate-200 bg-slate-50/70'
    : stage.status === 'in_progress'
      ? 'border-brand-300 bg-white ring-4 ring-brand-500/10'
      : stage.status === 'completed'
        ? 'border-emerald-200 bg-emerald-50/40'
        : 'border-slate-200 bg-white'

  const metas = [
    { icon: Target, label: '推荐基础', value: stage.recommend },
    { icon: BookOpen, label: '课程数量', value: `${stageLessonCount(stage)} 个课程` },
    { icon: Clock, label: '预计时长', value: stage.shortDuration },
    { icon: Boxes, label: '阶段项目', value: stage.project.title },
  ]

  return (
    <div className={`flex h-full flex-col rounded-2xl border p-4 shadow-card transition ${frame}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`chip ${a.softBg} ${a.text}`}>{stage.tag}</span>
        <StageChip status={stage.status} label={stageStatusLabel[stage.status]} />
      </div>

      <h3 className={`mt-3 text-[15.5px] font-semibold ${locked ? 'text-slate-400' : 'text-slate-900'}`}>
        {stage.title}
      </h3>
      <p className={`mt-2 text-[12.5px] leading-5 ${locked ? 'text-slate-400' : 'text-slate-500'}`}>
        {stage.subtitle}
      </p>

      <dl className="mt-4 flex-1 space-y-2.5 border-t border-dashed border-slate-200/80 pt-4">
        {metas.map((m) => (
          <div key={m.label} className="flex items-start gap-2 text-[12px]">
            <m.icon
              className={`mt-[2px] h-3.5 w-3.5 shrink-0 ${locked ? 'text-slate-300' : a.solid}`}
              strokeWidth={1.9}
            />
            <dt className="w-[58px] shrink-0 text-slate-400">{m.label}</dt>
            <dd className={`min-w-0 flex-1 font-medium ${locked ? 'text-slate-400' : 'text-slate-700'}`}>
              {m.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        {stage.status === 'in_progress' ? (
          <Link to={`/stage/${stage.slug}`} className="btn btn-md btn-primary w-full">
            继续学习
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : locked ? (
          <StageAccess stage={stage} />
        ) : (
          <Link to={`/stage/${stage.slug}`} className="btn btn-md btn-outline w-full">
            查看详情
          </Link>
        )}
      </div>
    </div>
  )
}

function Overview() {
  const { stages } = useProgress()
  return (
    <section className="shell pb-16">
      <SectionHeading
        title="学习路径总览"
        sub="4 个学习阶段循序渐进；Project Lab 的 Capstone 毕业项目负责综合交付与能力验证。"
      />
      <div className="mt-7">
        <Timeline />
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stages.map((s) => (
            <StageOverviewCard key={s.id} stage={s} />
          ))}
        </div>
        <CapstonePathCard />
      </div>
    </section>
  )
}

/* ------------------------------ 学习方式 ------------------------------ */

function HowToLearn() {
  return (
    <section className="shell pb-16">
      <SectionHeading title="学习方式" sub="基于项目的实践式学习，在真实场景中掌握 AI 开发能力。" />
      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {homePathSteps.map((s, i) => (
          <Fragment key={s.title}>
            <div className="card flex-1 p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-[12px] font-bold text-brand-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Icon name={s.icon} className="h-4 w-4 shrink-0 text-brand-600" />
                <h3 className="text-[13.5px] font-semibold text-slate-900">{s.title}</h3>
              </div>
              <p className="mt-2.5 text-[12px] leading-5 text-slate-500">{s.desc}</p>
            </div>
            {i < homePathSteps.length - 1 ? (
              <ChevronRight className="hidden h-4 w-4 shrink-0 self-center text-slate-300 lg:block" />
            ) : null}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

/* ---------------------------- 4 个阶段项目 ---------------------------- */

function StageProjects() {
  const { stages } = useProgress()
  return (
    <section className="shell pb-8">
      <SectionHeading
        title="4 个阶段项目"
        sub="通过 4 个真实的阶段项目，串联完整的学习路径，从简单到复杂，逐步构建你的 AI 开发作品集。"
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((s) => {
          const a = accentClass[s.accent]
          return (
            <Link
              key={s.id}
              to={`/project/${s.project.id}`}
              className={`group relative overflow-hidden rounded-2xl border ${a.border} ${a.softBg} p-4 transition hover:-translate-y-0.5 hover:shadow-lift`}
            >
              <span className={`chip bg-white/85 ${a.text}`}>{s.tag}项目</span>
              <h3 className="mt-3 text-[14.5px] font-semibold text-slate-900">{s.project.title}</h3>
              <p className="mt-2 max-w-[92%] text-[12.5px] leading-5 text-slate-600">{s.project.desc}</p>
              <Icon
                name="ship"
                className={`pointer-events-none absolute -bottom-3 -right-3 h-20 w-20 ${a.solid} opacity-[0.10]`}
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default function LearningPath() {
  return (
    <>
      <Hero />
      <Overview />
      <HowToLearn />
      <StageProjects />
    </>
  )
}
