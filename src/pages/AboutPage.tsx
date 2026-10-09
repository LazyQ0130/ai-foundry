import { Link } from 'react-router-dom'
import { ArrowRight, Check, Code2, GraduationCap, Lightbulb } from 'lucide-react'

const steps = [
  { title: '任务', subtitle: '先说清要做什么', description: '从一个具体需求开始，写下用户要完成的事和你期待的结果。' },
  { title: 'Prompt', subtitle: '让 AI 理解上下文', description: '交代目标、现有条件和限制，把大问题拆成能执行的小步骤。' },
  { title: '构建', subtitle: '一次推进一小步', description: '借助 AI 实现功能，阅读关键改动，在自己的环境里运行。' },
  { title: '检查', subtitle: '亲自验证结果', description: '尝试正常操作和出错情况，核对结果，追问不理解的实现。' },
  { title: '交付', subtitle: '留下可用的成果', description: '整理运行方式和使用说明，保存一个能继续迭代的版本。' },
]
const audiences = [
  { icon: GraduationCap, title: '刚开始接触开发', text: '从入门阶段建立基本认识，跟着环境搭建和小任务，逐步完成第一个项目。' },
  { icon: Code2, title: '已经有一些编程基础', text: '把已有知识串成完整应用，继续学习前后端协作、数据处理与部署。' },
  { icon: Lightbulb, title: '想把 AI 用进自己的项目', text: '在具备相应基础后，进一步探索知识库、RAG 与 Agent 的应用方式。' },
]

export default function AboutPage() {
  return <>
    <section className="bg-gradient-to-b from-[#E9F2FE] via-[#F5F9FF] to-white">
      <div className="shell py-14 sm:py-20">
        <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">产品理念</span>
        <h1 className="mt-5 max-w-3xl text-[34px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[48px]">带着 AI，<br />真正做出软件。</h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-8 text-slate-600">AIFoundry 面向大学生、初级开发者，以及希望通过项目学习 AI 开发的人。我们把学习组织成一个个具体任务，让你从想法出发，经过实现与验证，留下一个可以运行的作品。</p>
        <Link to="/courses" className="btn btn-lg btn-primary mt-7">找到我的学习起点<ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>

    <section className="shell py-8 sm:py-10">
      <h2 className="h-sec">从你现在的基础出发</h2>
      <p className="sub-sec">不同的起点，选择不同的阶段。</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {audiences.map(({ icon: Icon, title, text }) => <div key={title} className="card p-6">
          <span className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600"><Icon className="h-5 w-5" aria-hidden="true" /></span>
          <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-[13.5px] leading-7 text-slate-600">{text}</p>
        </div>)}
      </div>
      <p className="mt-4 text-[13px] leading-6 text-slate-500">入门阶段适合新手；全栈阶段需要基础编程知识，AI 应用与 Agent 阶段则需要相应的全栈或应用开发基础。</p>
    </section>

    <section className="shell py-10 sm:py-14">
      <h2 className="h-sec">把学习放进一次完整的开发过程</h2>
      <p className="sub-sec">AI 参与每一步，你负责理解目标、作出选择并验证结果。</p>
      <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-xs font-semibold tracking-widest text-brand-600">0{index + 1}</span>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-[13px] font-medium text-slate-700">{step.subtitle}</p>
          <p className="mt-2 text-[13px] leading-6 text-slate-500">{step.description}</p>
        </li>)}
      </ol>
    </section>

    <section className="shell py-5">
      <div className="grid gap-8 rounded-3xl border border-brand-100 bg-brand-50/60 p-6 sm:p-9 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div>
          <span className="text-xs font-semibold tracking-wide text-brand-600">以「个人知识工作台」为例</span>
          <h2 className="mt-3 text-[24px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[28px]">从一个小功能，<br />走完这五步。</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">假设你想给工作台增加一个「只看重要资料」的筛选。先做一个能点、能筛的小版本，再逐步扩展它。</p>
          <p className="mt-3 text-xs leading-6 text-slate-500">这是学习方法的示例。具体课程任务与要求以课程页面为准。</p>
          <Link to="/project/assistant" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600">了解阶段项目<ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ol className="space-y-3 rounded-2xl border border-white bg-white p-5 sm:p-6">
          {[
            ['任务', '明确筛选什么、按什么筛，以及筛完的页面是什么样。'],
            ['Prompt', '把目标、已有项目结构和本次改动范围告诉 AI。'],
            ['构建', '实现筛选功能，刷新页面查看效果。'],
            ['检查', '逐个点标签和搜索，确认筛选结果符合预期、其他功能没被改坏。'],
            ['交付', '保存可用版本，写下启动步骤和目前支持的功能。'],
          ].map(([title, text]) => <li key={title} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><span className="w-14 shrink-0 text-xs font-semibold leading-6 text-brand-600">{title}</span><p className="text-[13px] leading-6 text-slate-600">{text}</p></li>)}
        </ol>
      </div>
    </section>

    <section className="shell py-12 sm:py-16">
      <h2 className="h-sec">怎样知道自己学会了？</h2>
      <p className="sub-sec">用可检查的结果，确认自己的进步。</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {['能按自己的运行说明启动项目，完成一次真实操作。', '能解释关键代码的作用，以及为什么这样实现。', '能设计检查步骤，发现并描述结果中的问题。', '能独立提出一个小改动，带着 AI 实现并重新验证。'].map((text) => <li key={text} className="flex items-start gap-3 rounded-xl bg-slate-50 px-5 py-4"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" /><span className="text-sm leading-6 text-slate-700">{text}</span></li>)}
      </ul>
      <p className="mt-4 text-[13px] leading-7 text-slate-500">课程中的任务清单和完成记录帮助你回顾进度；阶段项目则是把知识串起来、反复练习的机会。</p>
    </section>

    <section className="shell pb-12">
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 p-6 sm:p-8 lg:flex-row lg:items-center">
        <div><h2 className="text-xl font-semibold text-slate-900">从一个能完成的任务开始。</h2><p className="mt-2 text-sm leading-6 text-slate-500">先找到适合的阶段，再把第一步做出来。</p></div>
        <div className="flex flex-wrap gap-3"><Link to="/courses" className="btn btn-lg btn-primary">查看全部课程<ArrowRight className="h-4 w-4" /></Link><Link to="/faq" className="btn btn-lg btn-outline">查看常见问题</Link></div>
      </div>
    </section>
  </>
}
