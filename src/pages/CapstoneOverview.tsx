import { CapstoneOverviewStart } from '../components/CapstoneOverviewStart.js'
import { useCapstone } from '../data/capstoneProgress.js'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, BookOpen, Boxes, Check, FileCheck2, GraduationCap, LockKeyhole, ShieldCheck } from 'lucide-react'
import { capstoneShowcase } from '../data/capstoneShowcase.js'
import { stages } from '../data/courses.js'
import { useOptionalAuth } from '../auth/AuthProvider.js'

const futureDirections = ['AI SaaS 产品', '知识库 Agent', 'AI 工作流自动化', '研究 Agent', '多模态 AI 应用'] as const

const abilityIcons = {
  '产品架构': Boxes,
  '研究 Agent': BookOpen,
  '工程可靠性': ShieldCheck,
  '项目交付': FileCheck2,
}

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return <div><h2 className="text-[22px] font-bold text-slate-900">{title}</h2><p className="mt-2 text-[13.5px] leading-6 text-slate-500">{sub}</p></div>
}

export default function CapstoneOverview() {
  const lab = useCapstone()
  // Entitlement from the session is known immediately, so owners never see a flash of purchase CTAs.
  const hasProjectLab = useOptionalAuth()?.user?.productEntitlements.includes('project-lab') ?? false
  const access = lab.data ? lab.data.access : hasProjectLab
  const progress = lab.data?.progress

  return (
    <div>
      {/* 首屏：左侧说明与操作，右侧课程信息（未购）或学习进度（已购） */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#EEF4FE] to-slate-50/60">
        <div className="shell py-8 sm:py-11">
          <nav aria-label="面包屑导航" className="text-[12px] text-slate-500"><Link to="/courses" className="hover:text-brand-700">课程</Link><span className="px-2" aria-hidden="true">/</span><span className="text-slate-700">毕业项目</span></nav>
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-[12px] font-semibold text-brand-700"><GraduationCap className="h-3.5 w-3.5" />毕业项目 · {capstoneShowcase.badge}</span>
              <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[40px]">{capstoneShowcase.project}</h1>
              <p className="mt-1 text-[14px] font-medium text-slate-500">{capstoneShowcase.projectEn}</p>
              <p className="mt-4 max-w-2xl text-[17px] font-semibold leading-7 text-slate-800">{capstoneShowcase.subtitle}</p>
              <p className="mt-3 max-w-2xl text-[14px] leading-7 text-slate-600">{capstoneShowcase.description}</p>
              <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-500"><span className="font-semibold text-slate-700">适合谁：</span>完成 Stage 1～4，或具备等效的 AI Coding、全栈、RAG 与 Agent 基础。</p>
              {access ? <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a href="#lessons" className="btn btn-lg btn-outline">查看九课路线 <ArrowDown className="h-4 w-4" /></a>
                <span className="text-[13px] text-slate-500">9 节课 · 约 18～23 小时 · 交付可部署的 AI 产品</span>
              </div> : <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/capstone/preview/c1" className="btn btn-lg btn-primary">免费试看 C1 <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/pricing" className="btn btn-lg btn-outline">查看项目版</Link>
              </div>}
              {lab.error && <p role="alert" className="mt-4 text-sm text-red-600">{lab.error}<button className="btn btn-sm btn-outline ml-3" onClick={() => void lab.refresh()}>重试</button></p>}
            </div>
            <CapstoneOverviewStart data={lab.data} loading={lab.loading} />
          </div>
        </div>
      </section>

      {/* 产品流程：用中文说清这个产品做什么 */}
      <section className="shell py-9 sm:py-10">
        <SectionHeading title="最终会做出什么" sub="一个能把个人资料和外部证据变成可信研究报告的 AI 产品。" />
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          {capstoneShowcase.flow.map((step, index) => (
            <li key={step.title} className={`relative rounded-lg border p-4 ${index === capstoneShowcase.flow.length - 1 ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'}`}>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">{index + 1}</span>
              <h3 className="mt-3 text-[14px] font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-[12.5px] leading-5 text-slate-500">{step.desc}</p>
              {index < capstoneShowcase.flow.length - 1 && <ArrowRight aria-hidden="true" className="absolute -right-[15px] top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-slate-400 lg:block" />}
            </li>
          ))}
        </ol>
      </section>

      {/* 与四阶段的关系 + 综合能力 + 技术栈，合并为一节 */}
      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="shell py-9 sm:py-10">
          <SectionHeading title="把前四阶段的能力放进一个完整产品" sub="Stage 1–4 负责学会，毕业项目负责证明你能独立交付。" />
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[12.5px]">
            {stages.map((stage) => (
              <span key={stage.slug} className="inline-flex items-center gap-2">
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600"><span className="text-slate-400">{stage.tag}</span> · {stage.title}</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-slate-300" />
              </span>
            ))}
            <span className="rounded-md bg-slate-900 px-2.5 py-1.5 font-semibold text-white">毕业项目 · 综合交付</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {capstoneShowcase.abilities.map((ability) => {
              const AbilityIcon = abilityIcons[ability.title as keyof typeof abilityIcons]
              return <div key={ability.title} className="rounded-lg border border-slate-200 bg-white p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700"><AbilityIcon className="h-4 w-4" /></span>
                <h3 className="mt-2 text-[14px] font-semibold text-slate-900">{ability.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-slate-600">{ability.desc}</p>
              </div>
            })}
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
            <span className="font-semibold text-slate-600">用到的技术</span>
            {capstoneShowcase.technologies.map((technology) => <span key={technology} className="rounded border border-slate-200 bg-white px-2 py-0.5 text-slate-600">{technology}</span>)}
          </p>
        </div>
      </section>

      {/* 九课路线 */}
      <section id="lessons" className="shell scroll-mt-20 py-9 sm:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title="九课毕业路线" sub="每一课完成一个产品增量，最后交付可验证的完整作品。" />
          <span className="mb-1 text-[12px] font-medium text-slate-500">9 节课 · 约 18～23 小时</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {capstoneShowcase.lessons.map((lesson) => {
            const id = lesson.code.toLowerCase()
            const preview = !access && id === 'c1'
            const locked = !access && !preview
            const done = progress?.completedLessons.includes(id)
            const current = access && progress?.continueLessonId === id
            const to = access ? `/capstone/lessons/${id}` : preview ? '/capstone/preview/c1' : '/pricing'
            const action = preview ? '免费试看' : done ? '回顾本课' : current ? (progress?.completed ? '继续学习' : '开始学习') : access ? '进入本课' : ''
            return <Link key={lesson.code} aria-label={`${lesson.code} ${lesson.title}，${preview ? '免费节选' : '项目工坊'}`} to={to} className={`group flex min-h-[132px] flex-col rounded-lg border bg-white p-4 transition sm:last:col-span-2 lg:last:col-span-1 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${preview || current ? 'border-brand-300 ring-1 ring-brand-100' : 'border-slate-200 hover:border-brand-200'}`}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-500">{lesson.code} · {lesson.phase}</span>
                {preview ? <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">免费节选</span>
                  : done ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" />已完成</span>
                  : locked ? <LockKeyhole aria-label="需项目工坊权益" className="h-3.5 w-3.5 text-slate-400" /> : null}
              </span>
              <span className="mt-2 text-[14px] font-semibold leading-5 text-slate-900">{lesson.title}</span>
              <span className="mt-1 text-[12.5px] leading-5 text-slate-500">{lesson.desc}</span>
              {action && <span className="mt-auto pt-3 text-[13px] font-semibold text-brand-700">{action} →</span>}
            </Link>
          })}
        </div>
        {!access && <div className="mt-5 flex flex-col gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13.5px] leading-6 text-slate-700"><span className="font-semibold text-slate-900">C2–C9 需要项目工坊权益。</span>项目版包含完整四阶段课程和全部 9 节毕业项目。</p>
          <Link to="/pricing" className="btn btn-md btn-primary shrink-0">获取项目工坊权益 <ArrowRight className="h-4 w-4" /></Link>
        </div>}
      </section>

      {/* 项目工坊后续内容：仅展示方向，不代表已上线 */}
      <section className="shell pb-12">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
          <p className="text-[12.5px] font-semibold text-slate-800">更多综合项目实战将持续更新</p>
          <span className="text-[11px] text-slate-500">未来方向 · 尚非已上线项目</span>
          <div className="flex flex-wrap gap-1.5" aria-label="未来项目方向">{futureDirections.map((direction) => <span key={direction} className="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200">{direction}</span>)}</div>
        </div>
        <p className="mt-2 text-[12px] leading-5 text-slate-500">项目版用户可持续获得项目工坊后续项目。未来项目方向仅作展示，具体新增内容与开放时间以上线页面为准。</p>
      </section>
    </div>
  )
}
