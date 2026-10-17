import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Bot, Code2, Database, Layers, Users } from 'lucide-react'
import { accentClass, formalLessons, stages as publicStages, totalLessons } from '../data/courses'
import { useAuth } from '../auth/AuthProvider'
import { useCatalogue } from '../data/catalog'
import { CourseOutline } from '../components/CourseOutline'
import { CapstoneOutline } from '../components/CapstoneOutline'
import { useCapstone } from '../data/capstoneProgress'
import { capstoneShowcase } from '../data/capstoneShowcase'
import { learningSupport } from '../data/learningSupport'

const sections = [
  ['studio', 'FY 工作室'],
  ['curriculum', '四阶段课程'],
  ['practice', '项目实战'],
] as const

const stageIcons = [Code2, Database, BookOpen, Bot]

function Actions() {
  return <div className="flex flex-wrap gap-3">
    <Link to="/lesson/stage-1/s1-l0" className="btn btn-lg btn-primary">开始免费体验<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
    <Link to="/pricing" className="btn btn-lg btn-outline">查看学习方案</Link>
  </div>
}

export default function CourseIntroduction() {
  const auth = useAuth()
  const catalogue = useCatalogue()
  const lab = useCapstone()
  const stages = catalogue.stages.length ? catalogue.stages : publicStages
  return <>
    <section className="border-b border-slate-200 bg-gradient-to-b from-[#E9F2FE] to-slate-50/60">
      <div className="shell py-12 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">课程介绍 · FY 工作室出品</span>
            <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-tight text-slate-950 sm:text-[44px]">从第一次改页面，<br />到交付自己的 AI 产品。</h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-8 text-slate-600">AI Foundry 面向 AI 开发学习者，从 AI 辅助编程出发，逐步学习全栈开发、AI 应用与 Agent 工程。通过连续项目和综合实战，把学到的知识用进真正能运行的软件。</p>
            <div className="mt-6"><Actions /></div>
          </div>
          <div className="card p-6 sm:p-7">
            <p className="text-sm font-semibold text-slate-900">你的学习路线</p>
            <ol className="mt-5 space-y-4">
              {stages.map(stage => <li key={stage.id} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${accentClass[stage.accent].softBg} ${accentClass[stage.accent].text}`}>{stage.id}</span>
                <a href={`#intro-${stage.slug}`} className="text-sm font-medium text-slate-700 hover:text-brand-700 hover:underline">{stage.title}</a>
                <span className="ml-auto shrink-0 text-xs text-slate-500">{formalLessons(stage.lessons).length} 课</span>
              </li>)}
            </ol>
            <div className="mt-5 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">{totalLessons} 节正式课程 · 4 次阶段自检 · 4 个阶段项目<br />另含第 0 课开始前准备；项目工坊提供 9 课综合实战。</div>
          </div>
        </div>
        <p className="mt-7 text-sm leading-6 text-slate-600">图文讲解 · 任务练习 · AI 辅助学习。第三方开发工具与模型 API 费用由学员自行承担。</p>
      </div>
    </section>

    <nav aria-label="课程介绍页内导航" className="shell flex flex-wrap gap-x-6 gap-y-3 border-b border-slate-100 py-5 text-sm">
      {sections.map(([id, label]) => <a key={id} href={`#${id}`} className="font-medium text-slate-600 hover:text-brand-700 hover:underline">{label}</a>)}
    </nav>

    <section id="studio" className="shell scroll-mt-24 py-12 sm:py-16">
      <div>
        <div>
          <Users aria-hidden="true" className="h-7 w-7 text-brand-600" />
          <h2 className="mt-3 h-sec">认识 FY 工作室</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">课程设计方 · 由大学生发起的 AI 产品与技术实践团队</p>
          <div className="mt-5 flex flex-wrap gap-2">{['人工智能应用', 'AI Agent', '软件开发', '产品工程'].map(tag => <span key={tag} className="chip bg-slate-50 text-slate-600">{tag}</span>)}</div>
        </div>
        <div className="mt-6 grid gap-x-8 gap-y-4 text-[14px] leading-7 text-slate-600 md:grid-cols-2">
          <p>FY 工作室是一支由大学生发起的 AI 产品与技术实践团队，主要关注人工智能应用、AI Agent、软件开发与产品工程。团队成员具有一定的软件开发和 AI 项目实践经验，部分成员曾在字节跳动、腾讯、携程、京东、阿里巴巴等互联网大厂实习。</p>
          <p>我们希望做的不只是学习和研究新技术，而是尝试将这些技术真正应用到产品中，从需求分析、产品设计、功能开发，到测试、部署和后续优化，积累完整的软件开发经验。</p>
          <p>AI Foundry 是工作室目前推出的核心产品之一。这是一个面向 AI 开发学习者的实践平台，课程从 AI 辅助编程开始，逐步涉及全栈开发、AI 应用和 Agent 工程，并通过连续项目与综合实战，帮助学习者建立实际开发能力。</p>
          <p>未来，我们也希望继续探索更多有实际价值的 AI 应用和软件产品，与更多对技术、产品和创业感兴趣的人一起交流、实践。</p>
        </div>
      </div>
    </section>

    <section id="curriculum" className="scroll-mt-24 border-y border-slate-200 bg-slate-50/60">
      <div className="shell py-10 sm:py-12">
        <h2 className="h-sec">四阶段课程</h2>
        <p className="sub-sec">先做出能用的小工具，再补齐数据库与账号，接入 AI，最后让 Agent 在明确边界内完成任务。</p>
        <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
          {stages.map(stage => {
            const accent = accentClass[stage.accent]
            const lessons = formalLessons(stage.lessons)
            const StageIcon = stageIcons[stage.id - 1]
            return <article id={`intro-${stage.slug}`} key={stage.id} className="card scroll-mt-24 overflow-hidden">
              <header className={`flex items-start gap-3 px-5 pb-3 pt-5 ${accent.softBg}`}>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white ${accent.text}`}><StageIcon aria-hidden="true" className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1"><span className={`text-xs font-semibold ${accent.text}`}>{stage.tag}</span><h3 className="mt-1 text-xl font-semibold text-slate-900">{stage.title}</h3></div>
              </header>
              <div className={`flex flex-wrap gap-2 px-5 pb-4 ${accent.softBg}`}><span className="rounded-md bg-white px-2.5 py-1 text-sm font-semibold text-slate-800">{lessons.length} 节课</span><span className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-slate-700">建议学习 {stage.shortDuration}</span></div>
              <div className="p-5">
                <p className="text-sm leading-6 text-slate-700 sm:min-h-[48px]">{stage.subtitle}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {stage.abilities.map(ability => <div key={ability.title} className="rounded-xl bg-slate-50 p-3 sm:min-h-[108px]"><h4 className="text-sm font-semibold text-slate-800">{ability.title}</h4><p className="mt-1 text-[13px] leading-5 text-slate-600">{ability.desc}</p></div>)}
                </div>
                <CourseOutline stage={stage} allowed={!!auth.user?.entitlements.includes(stage.slug)} loading={auth.loading || catalogue.loading} />
              </div>
            </article>
          })}
        </div>
      </div>
    </section>

    <section id="practice" className="shell scroll-mt-24 py-12 sm:py-16">
      <h2 className="h-sec">项目实战</h2>
      <p className="sub-sec">综合实战从需求开始，练习独立交付完整产品。四个阶段项目的作品示意可在<Link to="/#why" className="text-brand-700 underline underline-offset-4">首页作品区</Link>查看。</p>
      <article className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/60 p-6 sm:p-8">
        <span className="chip bg-white text-brand-700"><Layers aria-hidden="true" className="mr-1 h-3.5 w-3.5" />综合实战 · 项目工坊专属</span>
        <h3 className="mt-4 text-2xl font-bold text-slate-900">{capstoneShowcase.project}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{capstoneShowcase.description}</p>
        <p className="mt-3 text-xs leading-6 text-slate-500">适合完成四阶段课程或具备等效基础的学习者。共 {capstoneShowcase.lessons.length} 节课，需包含项目工坊权益的学习方案。</p>
        <CapstoneOutline data={lab.data} allowed={!!auth.user?.productEntitlements.includes('project-lab')} loading={lab.loading} />
        {lab.error && <p role="alert" className="mt-3 text-sm text-red-600">{lab.error}<button type="button" onClick={() => void lab.refresh()} className="btn btn-sm btn-outline ml-3">重试</button></p>}
        <div className="mt-6"><h4 className="text-sm font-semibold text-slate-800">最终交付</h4><ul className="mt-3 flex flex-wrap gap-2">{capstoneShowcase.deliverables.map(item => <li key={item} className="rounded-lg border border-brand-100 bg-white px-3 py-2 text-xs text-slate-700">{item}</li>)}</ul></div>
        <Link to="/capstone" className="btn btn-md btn-primary mt-6">查看项目工坊<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </article>
    </section>

    <section className="shell pb-12">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 sm:p-8">
        <BookOpen aria-hidden="true" className="h-6 w-6 text-brand-600" />
        <h2 className="mt-3 text-2xl font-bold text-slate-900">先体验一课，再决定怎么学。</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">通过公开的第一课了解讲解方式与任务设计，或查看各阶段课程和项目工坊的学习方案。</p>
        <div className="mt-4 max-w-3xl space-y-2 text-sm leading-7 text-slate-600"><p>{learningSupport.guidance}</p><p>{learningSupport.contact}</p></div>
        <div className="mt-5"><Actions /></div>
      </div>
    </section>
  </>
}
