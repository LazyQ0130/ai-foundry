import { stageLessonCount } from '../data/courses.js'
import { stageCompletedCount } from '../data/learningProgress.js'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Code2, LockKeyhole, Target } from 'lucide-react'
import { Icon } from '../components/Icon.js'
import { Breadcrumb, Progress, SectionHeading, StageChip } from '../components/ui.js'
import { accentClass, stageStatusLabel } from '../data/courses.js'
import { useProgress } from '../data/progress.js'
import { getProject } from '../data/site.js'
import { capstoneShowcase } from '../data/capstoneShowcase.js'

const capstoneTechnologies = ['RAG', 'Citation', 'Agent', 'MCP', 'Human-in-the-loop', 'Persistence', 'Eval'] as const
const futureDirections = ['AI SaaS 产品', '知识库 Agent', 'AI 工作流自动化', '研究 Agent', '多模态 AI 应用'] as const

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
          <h1 className="mt-4 text-[30px] font-bold tracking-tight text-slate-900 sm:text-[36px]">项目实战</h1>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-6 text-slate-600">
            从四个阶段项目，到持续更新的毕业项目实战。先在项目中建立能力，再把这些能力组合成可以交付的 AI 产品。
          </p>
          <p className="mt-5 text-[11px] font-semibold tracking-wide text-brand-700">01 阶段项目 <span className="mx-2 text-slate-300">/</span> 02 毕业项目实战 <span className="mx-2 text-slate-300">/</span> 03 持续更新</p>
        </div>
      </section>

      <section className="shell pb-12 pt-10 sm:pt-12" aria-labelledby="stage-projects-heading">
        <div id="stage-projects-heading">
          <span className="text-[11px] font-bold tracking-widest text-brand-600">01 / STAGE PROJECTS</span>
          <SectionHeading title="阶段项目" sub="每个阶段对应一个持续演进的项目，用来学习并验证当前阶段的核心能力。" className="mt-2" />
          <p className="mt-2 text-[12px] text-slate-500">前一阶段的项目，也是后一阶段继续升级的起点。</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60" aria-labelledby="capstone-projects-heading">
        <div className="shell py-12 sm:py-14">
          <div id="capstone-projects-heading">
            <span className="text-[11px] font-bold tracking-widest text-brand-600">02 / CAPSTONE</span>
            <SectionHeading title="毕业项目实战" sub="完成阶段学习后，重新组合 AI Coding、全栈、RAG 与 Agent 能力，交付更完整的 AI 产品。" className="mt-2" />
          </div>
          <article className="card mt-6 overflow-hidden border-brand-200">
            <div className="h-1 bg-brand-600" aria-hidden="true" />
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-10">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-slate-900 text-white">CAPSTONE 01</span>
                  <span className="chip bg-brand-50 text-brand-700">毕业项目</span>
                  <span className="chip bg-slate-100 text-slate-600">{capstoneShowcase.badge}</span>
                  <span className="chip border border-slate-200 bg-white text-slate-600"><LockKeyhole className="h-3 w-3" />{capstoneShowcase.status}</span>
                </div>
                <h3 className="mt-5 text-[22px] font-bold leading-tight text-slate-900 sm:text-[26px]">{capstoneShowcase.project}</h3>
                <p className="mt-1 text-[13px] font-medium text-slate-500">{capstoneShowcase.projectEn}</p>
                <p className="mt-2 text-[14px] font-medium text-slate-700">{capstoneShowcase.subtitle}</p>
                <p className="mt-4 max-w-2xl text-[13px] leading-6 text-slate-600">{capstoneShowcase.description}</p>
                <div className="mt-5 flex flex-wrap gap-2" aria-label="核心技术">
                  {capstoneTechnologies.filter((technology) => capstoneShowcase.technologies.includes(technology)).map((technology) => (
                    <span key={technology} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">{technology}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-between gap-5 border-t border-slate-100 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-brand-600">FINAL / 综合交付</p>
                  <p className="mt-3 text-[13px] leading-6 text-slate-700">{capstoneShowcase.exitState}</p>
                </div>
                <Link to="/capstone" className="btn btn-md btn-primary w-full sm:w-fit lg:w-full">查看项目介绍 <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="shell py-12 sm:py-14" aria-labelledby="future-projects-heading">
        <div id="future-projects-heading">
          <span className="text-[11px] font-bold tracking-widest text-brand-600">03 / FUTURE PROJECTS</span>
          <SectionHeading title="更多综合项目实战将持续更新" sub={`${capstoneShowcase.project}是首个毕业项目。后续会根据 AI 技术发展和真实应用场景，继续加入新的综合项目实战。`} className="mt-2" />
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-5 sm:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold text-brand-700">持续更新 <span className="ml-2 text-[11px] font-medium tracking-widest text-slate-500">FUTURE PROJECTS</span></p>
            <span className="text-[11px] text-slate-400">未来方向 · 尚非已上线项目</span>
          </div>
          <p className="mt-4 text-[15px] font-semibold leading-6 text-slate-800">全套课程的综合项目实战会持续扩充。</p>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="未来项目方向">
            {futureDirections.map((direction) => <span key={direction} className="rounded-full border border-brand-100 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600">{direction}</span>)}
          </div>
          <p className="mt-4 text-[11px] leading-5 text-slate-500">未来项目方向仅作展示，具体新增内容与开放时间以上线页面为准。</p>
        </div>
      </section>

      <section className="shell pb-12 sm:pb-14">
        <div className="card flex flex-wrap items-center justify-between gap-5 bg-brand-50/60 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 ring-1 ring-brand-100">
              <Icon name="ship" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-slate-900">从阶段作品，到真正的综合项目交付</p>
              <p className="mt-1 text-[12.5px] text-slate-500">
                四个阶段项目帮你逐步建立能力，毕业项目则要求你把这些能力重新组合成一个可以部署、验证和展示的完整 AI 产品。
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
