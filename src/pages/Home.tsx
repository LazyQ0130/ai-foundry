import { curriculumFormalLessonCount } from '../data/courses'
import { useState } from 'react'
import { usePlans } from '../data/pricing'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Database,
  FileText,
  MessageCircle,
  Search,
  Sparkles,
  Wrench,
  Rocket,
  Boxes,
} from 'lucide-react'
import { Icon } from '../components/Icon'
import { HeroAppMockup } from '../components/mockups'
import PurchaseModal from '../components/PurchaseModal'
import { SectionHeading } from '../components/ui'
import { accentClass, stages, type Stage } from '../data/courses'
import { heroStats, homeFeatures } from '../data/site'
import { CapstoneHomeTeaser } from '../components/CapstoneShowcase'

/* ------------------------------- Hero ------------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
      <div
        className="grid-bg pointer-events-none absolute inset-0 opacity-70"
        style={{ maskImage: 'linear-gradient(to bottom, black, transparent 78%)' }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-brand-200/30 blur-3xl" />

      <div className="shell relative grid grid-cols-1 items-center gap-8 pb-10 pt-8 lg:grid-cols-[minmax(0,43%)_minmax(0,57%)] lg:pb-5 lg:pt-5">
        <div className="animate-fade-up">
          <span className="chip bg-white text-brand-600 ring-1 ring-brand-100">
            面向开发者的 AI 原生学习平台
          </span>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.16] tracking-tight text-slate-900 sm:text-[44px]">
            带着 <span className="text-brand-600">AI</span> ，
            <br />
            真正做出软件。
          </h1>
          <p className="mt-3 text-[15px] font-medium text-slate-700">
            从第一个 AI 辅助项目，到全栈、RAG 与 Agent 开发。
          </p>
          <p className="mt-1.5 max-w-[420px] text-[13.5px] leading-6 text-slate-500">
            AIFoundry 帮助你通过真实项目，系统掌握 AI 时代的软件开发技能，把想法变成可以上线的产品。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/path" className="btn btn-lg btn-primary">
              查看学习路径
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/stage/stage-1" className="btn btn-lg btn-outline">
              开始学习
            </Link>
          </div>
          <Link to="/guide" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand-700 hover:underline">第一次来？先看课程导读 <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        <div className="relative">
          <div className="relative mx-auto w-full max-w-[620px]">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-[7px] shadow-hero">
              <HeroAppMockup />
            </div>
            <div className="mx-auto h-2.5 w-[86%] rounded-b-[16px] bg-gradient-to-b from-slate-200/90 to-slate-300/40" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ 数据条 ------------------------------ */

function StatsBar() {
  return (
    <section className="shell pb-6 pt-2">
      <div className="card grid divide-y divide-slate-100 overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {heroStats.map((s) => (
          <div key={s.value} className="flex items-center gap-3.5 px-5 py-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name={s.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] font-bold tracking-tight text-slate-900">{s.value}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-slate-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------------- 各阶段卡片插画 --------------------------- */

const chipTone: Record<Stage['accent'], string> = {
  emerald: 'bg-white/80 text-emerald-700 ring-1 ring-emerald-100',
  blue: 'bg-white/80 text-brand-700 ring-1 ring-brand-100',
  violet: 'bg-white/80 text-violet-700 ring-1 ring-violet-100',
  orange: 'bg-white/80 text-orange-700 ring-1 ring-orange-100',
}

function StageArt({ stage }: { stage: Stage }) {
  const tone = chipTone[stage.accent]

  if (stage.id === 1) {
    const rows = [
      { icon: Sparkles, label: '用自然语言修改代码' },
      { icon: Wrench, label: '调试与优化' },
      { icon: Rocket, label: '完成第一个 AI 项目' },
    ]
    return (
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5">
          {rows.map((r) => (
            <span key={r.label} className={`chip ${tone}`}>
              <r.icon className="h-3 w-3" />
              {r.label}
            </span>
          ))}
        </div>
        <div className="hidden w-[62px] shrink-0 flex-col gap-1 rounded-md bg-white/70 p-1.5 sm:flex">
          <span className="h-1 w-full rounded bg-slate-200" />
          <span className="h-1 w-3/4 rounded bg-slate-200" />
          <span className="h-6 w-full rounded bg-slate-100" />
          <span className="h-1 w-2/3 rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  if (stage.id === 2) {
    return (
      <div className="rounded-md bg-white/75 p-2">
        <p className="text-[10.5px] font-semibold text-slate-700">AI 任务管理</p>
        <div className="mt-1.5 flex gap-1.5">
          <div className="w-[38px] shrink-0 space-y-1 rounded bg-slate-50 p-1">
            <span className="block h-1 w-full rounded bg-brand-200" />
            <span className="block h-1 w-3/4 rounded bg-slate-200" />
            <span className="block h-1 w-2/3 rounded bg-slate-200" />
          </div>
          <div className="flex-1 space-y-1">
            {['设计接口结构', '实现数据校验', '联调前端请求'].map((t) => (
              <div key={t} className="flex items-center gap-1 rounded bg-slate-50 px-1.5 py-[3px]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span className="text-[9px] text-slate-500">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stage.id === 3) {
    const chips = [
      { icon: FileText, label: '文档解析' },
      { icon: Database, label: '向量检索' },
      { icon: Search, label: '问答对话' },
    ]
    return (
      <div className="rounded-md bg-white/75 p-2.5">
        <div className="flex items-center gap-1.5">
          <Boxes className="h-3.5 w-3.5 text-violet-600" />
          <p className="text-[10.5px] font-semibold text-slate-700">企业知识库</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c.label} className={`chip ${tone}`}>
              <c.icon className="h-3 w-3" />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const tools = ['搜索工具', '代码执行', '数据库', '第三方服务']
  return (
    <div className="rounded-md bg-white/75 p-2.5">
      <div className="flex items-center gap-1.5">
        <span className="chip bg-orange-100 text-orange-700">用户任务</span>
        <ArrowRight className="h-3 w-3 text-orange-400" />
        <span className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-1.5 py-1 text-[10px] font-semibold text-white">
          <Bot className="h-3 w-3" />
          Agent
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tools.map((t) => (
          <span key={t} className={`chip ${tone}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function StagePreviewCard({ stage }: { stage: Stage }) {
  const a = accentClass[stage.accent]
  return (
    <Link
      to={`/stage/${stage.slug}`}
      className="card group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="p-4 pb-3.5">
        <span className={`chip ${a.softBg} ${a.text}`}>{stage.tag}</span>
        <h3 className="mt-2.5 text-[14.5px] font-semibold text-slate-900">{stage.title}</h3>
        <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{stage.subtitle}</p>
      </div>
      <div className={`mt-auto border-t ${a.border} ${a.softBg} p-3`}>
        <StageArt stage={stage} />
      </div>
    </Link>
  )
}

function PathSection() {
  return (
    <section className="shell pb-12">
      <SectionHeading
        title="系统化的学习路径"
        sub="4 个学习阶段、4 个阶段作品；项目版另含 Project Lab 毕业项目实战。"
        right={
          <Link to="/path" className="link-more">
            查看完整学习路径
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((s) => (
          <StagePreviewCard key={s.id} stage={s} />
        ))}
      </div>
      <CapstoneHomeTeaser />
    </section>
  )
}

/* ---------------------------- 为什么选择我们 ---------------------------- */

function WhySection() {
  return (
    <section id="why" className="shell scroll-mt-24 pb-12">
      <SectionHeading
        title="为什么选择 AIFoundry"
        sub="我们专注于帮助开发者在 AI 时代，真正掌握可以落地的开发能力。"
      />
      <Link to="/about" className="link-more mt-4 inline-flex">了解我们的学习方法<ArrowRight className="h-3.5 w-3.5" /></Link>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {homeFeatures.map((f) => (
          <div key={f.title} className="card p-5 transition hover:shadow-lift">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon name={f.icon} className="h-4 w-4" />
            </span>
            <h3 className="mt-3.5 text-[14px] font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------ 学习方案 ------------------------------ */

function PlansSection() {
  const { plans, stages: catalogueStages, loading, error, refresh } = usePlans()
  const [consult, setConsult] = useState(false)

  if (loading) return <p role="status" className="shell py-12">正在加载课程价格…</p>
  if (error) return <div role="alert" className="shell py-12">{error}<button onClick={()=>void refresh()} className="btn btn-outline ml-3">重试</button></div>

  const stagePlans = plans.filter((p) => p.id.startsWith('stage-'))
  const allPlan = plans.find((p) => p.id === 'all-access')
  const projectPlan = plans.find((p) => p.id === 'all-access-projects')
  const minPrice = stagePlans.length ? Math.min(...stagePlans.map((p) => p.price)) : null
  const stageCount = catalogueStages.length
  const lessonCount = curriculumFormalLessonCount()

  return (
    <section className="shell pb-12">
      <div className="card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-50/70" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <span className="chip bg-brand-50 text-brand-600">学习方案</span>
            <h2 className="mt-3 text-[21px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[23px]">
              系统化的 AI 图文课程，一次购买永久阅读
            </h2>
            {(minPrice != null || allPlan) && (
              <p className="mt-2 text-[13.5px] leading-6 text-slate-500">
                {minPrice != null && (
                  <>
                    单阶段 <span className="text-[15px] font-bold text-brand-600">¥{minPrice}</span> 起
                  </>
                )}
                {minPrice != null && allPlan ? ' · ' : null}
                {allPlan && (
                  <>
                    全阶段课程版 <span className="text-[15px] font-bold text-brand-600">¥{allPlan.price}</span>
                    {allPlan.originPrice ? (
                      <span className="ml-1 text-[12.5px] text-slate-400 line-through">
                        ¥{allPlan.originPrice}
                      </span>
                    ) : null}
                  </>
                )}
                {projectPlan && <> · 项目版 <span className="text-[15px] font-bold text-brand-600">¥{projectPlan.price}</span></>}
                {stageCount > 0 && lessonCount > 0
                  ? `（含 ${stageCount} 个阶段、${lessonCount} 节课）`
                  : null}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/pricing" className="btn btn-lg btn-primary">
              查看完整方案
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" className="btn btn-lg btn-outline" onClick={() => setConsult(true)}>
              <MessageCircle className="h-4 w-4" />
              购买与账号帮助
            </button>
          </div>
        </div>
      </div>

      {consult && <PurchaseModal onClose={() => setConsult(false)} />}
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <PathSection />
      <WhySection />
      <PlansSection />
    </>
  )
}
