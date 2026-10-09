import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { guideConcepts, guideRoadmap, guideSections } from '../data/courseGuide.js'

const sectionClass = 'scroll-mt-20 border-t border-slate-200 pt-9 outline-none sm:pt-12'
const prose = 'max-w-[760px] text-[15px] leading-7 text-slate-600'

function Section({ index, children }: { index: number; children: React.ReactNode }) {
  const [id, title] = guideSections[index]
  return <section id={id} tabIndex={-1} className={sectionClass}>
    <p className="text-xs font-semibold tracking-widest text-brand-600">{String(index + 1).padStart(2, '0')} / 12</p>
    <h2 className="mt-2 text-[23px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[27px]">{title}</h2>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
}

function Flow({ items }: { items: string[] }) {
  return <ol className="flex flex-wrap items-center gap-2" aria-label="工作流程">{items.map((item, i) =>
    <li key={item} className="flex items-center gap-2"><span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-medium text-slate-700">{item}</span>{i < items.length - 1 && <span aria-hidden="true" className="text-brand-500">→</span>}</li>
  )}</ol>
}

function LandscapeMap() {
  const groups = [
    { title: '基础模型', items: ['LLM', 'Multimodal Model'] },
    { title: 'AI 应用能力', items: ['Prompt', 'Context', 'Structured Output', 'RAG · Chunk / Embedding / Vector Search', 'Tool Calling'] },
    { title: 'Agent', items: ['Tool', 'Workflow', 'State / Persistence', 'Human-in-the-loop', 'Eval'] },
    { title: '能力连接与复用', items: ['MCP', 'Skill', 'External Services'] },
  ]
  return <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-3 sm:p-5" aria-label="AI 世界地图">
    <div className="mb-3 flex items-center gap-2"><span className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-bold text-white">AI</span><span className="text-xs text-slate-500">从模型到应用、行动和连接</span></div>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{groups.map(group => <div key={group.title} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="border-b border-slate-100 pb-2 text-sm font-semibold text-brand-700">{group.title}</h3>
      <ul className="mt-2 space-y-1.5">{group.items.map(item => <li key={item} className="break-words rounded-md bg-slate-50 px-2 py-1.5 text-[12px] leading-5 text-slate-700">{item}</li>)}</ul>
    </div>)}</div>
  </div>
}

function Toc({ mobile = false }: { mobile?: boolean }) {
  const links = <ol className="grid gap-1.5 text-[12.5px] sm:grid-cols-2 lg:grid-cols-1">{guideSections.map(([id, title], i) => <li key={id}><a href={`#${id}`} className="block rounded-md px-2 py-1.5 text-slate-600 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"><span className="mr-2 text-brand-500">{String(i + 1).padStart(2, '0')}</span>{title}</a></li>)}</ol>
  return mobile ? <details className="rounded-xl border border-slate-200 bg-white p-3 lg:hidden"><summary className="cursor-pointer text-sm font-semibold text-slate-800">本页目录 · 12 个章节</summary><div className="mt-3">{links}</div></details> : <nav aria-label="课程导读目录" className="sticky top-20 hidden self-start rounded-xl border border-slate-200 bg-white p-3 lg:block"><p className="mb-2 px-2 text-xs font-semibold text-slate-900">本页目录</p>{links}</nav>
}

export default function CourseGuide() {
  useEffect(() => { const old = document.title; document.title = '课程导读｜AI 时代，你到底应该学什么？ · AIFoundry'; return () => { document.title = old } }, [])
  return <>
    <header className="border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white"><div className="shell py-9 sm:py-12">
      <p className="text-sm font-semibold text-brand-600">课程导读</p>
      <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[40px]">AI 时代，你到底应该学什么？</h1>
      <p className="mt-4 max-w-[760px] text-[14px] leading-7 text-slate-600">在开始正式课程之前，先看懂 AI 正在改变什么、LLM / RAG / Agent / MCP 等概念分别处在哪里，以及 AIFoundry 为什么设计成现在这条学习路径。</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="chip bg-white text-brand-700 ring-1 ring-brand-200">免费公开</span><span className="chip bg-white text-slate-600 ring-1 ring-slate-200">开始前推荐阅读</span><span className="chip bg-white text-slate-600 ring-1 ring-slate-200">预计 25～35 分钟</span></div>
    </div></header>
    <div className="shell grid min-w-0 gap-8 py-7 lg:grid-cols-[minmax(0,1fr)_220px] xl:gap-10">
      <main className="min-w-0 space-y-10 pb-12 lg:max-w-[850px]"><Toc mobile />
        <Section index={0}><p className={prose}>过去，许多软件时代的任务主要沿着这一条路完成：</p><Flow items={['人理解任务', '自己操作软件', '完成大量步骤', '得到结果']} /><p className={prose}>现在，越来越多任务开始由人定义目标，让 AI 生成内容或调用能力，再由人判断、约束和验收：</p><Flow items={['定义目标', '提供 Context', 'AI / 工具协作', '判断与约束', '完成交付']} /><p className={prose}>AI 最值得关注的地方，不只是“它能回答问题”，而是它正在成为一种新的生产力接口。这不表示它已经能稳定替代所有知识工作。</p></Section>
        <Section index={1}><p className={prose}>AI 降低了一些执行工作的门槛。做网站时，你可以先说明需求，让 AI 协助实现，观察页面、检查代码、发现问题并继续修正；不必在第一次动手前把 HTML、CSS、JavaScript 与框架全部学完。</p><p className={prose}>但需求判断、Debug、验证、架构理解、权限、安全和交付仍需要人负责。<strong className="text-slate-900">AI 降低的是很多“执行动作”的门槛，而不是做好一个产品的门槛。</strong></p></Section>
        <Section index={2}><p className={prose}>先用这张地图定位概念：基础模型提供理解与生成能力，应用把资料与工具接进来，Agent 参与受控的多步行动，连接机制让能力更容易复用。</p><LandscapeMap /><aside className="rounded-xl border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-900"><strong>如果你现在大部分词都没听懂，非常正常。</strong>导读的目的不是让你现在记住这些知识，而是先拥有一张地图。后面的四个阶段，会让你一个个真正使用它们。</aside></Section>
        <Section index={3}><p className={prose}>这些词会在项目里反复出现。此处只需要知道各自解决什么问题，不需要背定义。</p><div className="grid gap-2 md:grid-cols-2">{guideConcepts.map(concept => <article key={concept.name} className="min-w-0 rounded-xl border border-slate-200 p-3.5"><h3 className="text-[14px] font-semibold text-slate-900">{concept.name}</h3><p className="mt-0.5 text-[12px] font-medium text-brand-700">{concept.short}</p><p className="mt-2 text-[13px] leading-6 text-slate-600">{concept.detail}</p></article>)}</div><div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[420px] text-left text-[12.5px]"><caption className="px-3 py-2 text-left text-sm font-semibold text-slate-900">概念速查</caption><thead className="bg-slate-50 text-slate-700"><tr><th className="px-3 py-2">概念</th><th className="px-3 py-2">一句话理解</th></tr></thead><tbody>{guideConcepts.map(c => <tr key={c.name} className="border-t border-slate-100"><th scope="row" className="px-3 py-1.5 font-medium text-slate-800">{c.name === 'Human-in-the-loop' ? 'HITL' : c.name}</th><td className="px-3 py-1.5 text-slate-600">{c.short}</td></tr>)}</tbody></table></div></Section>
        <Section index={4}><div className="grid gap-3 md:grid-cols-3">{[['会 ChatGPT = 会 AI？', '聊天只是入口。真实产品还需要 Context、数据、RAG、Tool、权限与 Eval。'], ['AI 会写代码，技术不用学？', 'AI 降低写代码的门槛，不降低做产品的门槛。目标是能带着 AI 完成真实软件。'], ['工具学得越多越好？', '工具变化很快。需求、构建、Debug、数据、验证与交付的方法更值得学习。']].map(([title, body], i) => <article key={title} className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold text-brand-600">误区 {i + 1}</p><h3 className="mt-1 text-sm font-semibold text-slate-900">{title}</h3><p className="mt-2 text-[13px] leading-6 text-slate-600">{body}</p></article>)}</div><p className={prose}>比记住二十个热门工具更有用的是反复走完一条可迁移的过程：需求 → AI 协作 → 构建 → Debug → 数据 → AI 能力 → Tool → Agent → Eval → Delivery。工具会变，解决问题的方法值得留下。</p></Section>
        <Section index={5}><p className={prose}>Agent 很吸引人，但它最终仍运行在软件系统中。页面、API、服务端、数据库、用户、权限、模型和工具都要协作。如果跳过这些基础，很容易复制出 Agent Demo，却不知道它为什么能运行、哪里有风险。</p><p className={prose}>因此先带着 AI 修改真实项目，再做完整软件、接入模型，最后让 AI 在受控条件下调用工具并完成多步任务。</p></Section>
        <Section index={6}><p className={prose}>AIFoundry 的阶段顺序是一条能力升级路线：会使用 AI → 带 AI 做功能 → 做完整软件 → 做 AI 应用 → 做受控 Agent。项目工坊则让你重新组合这些能力，交付更完整的作品。</p><ol className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">{guideRoadmap.map((item, i) => <li key={item.stage} className="min-w-0 rounded-xl border border-brand-100 bg-white p-3.5 shadow-sm"><p className="text-xs font-bold text-brand-600">{item.stage} <span className="ml-1 text-slate-400">{String(i + 1).padStart(2, '0')}</span></p><h3 className="mt-1 text-sm font-semibold text-slate-900">{item.name}</h3><p className="mt-2 text-[12px] text-brand-700">{item.lead}</p><p className="mt-3 text-[12px] leading-5 text-slate-600">从“{item.from}”到<strong className="text-slate-900">“{item.to}”</strong></p><p className="mt-2 border-t border-slate-100 pt-2 text-[11.5px] leading-5 text-slate-500">{item.skills}</p></li>)}</ol><div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-[13px] leading-6 text-slate-600"><strong className="text-slate-900">项目工坊</strong>：从跟着课程完成阶段项目，到重新组合能力、交付完整 AI 产品。它是属于<a className="text-brand-700 underline" href="/pricing">项目版</a>的课程后综合项目实战专区。</div></Section>
        <Section index={7}><p className={prose}>我们做 AIFoundry，源于一个简单观察：AI 资料已经很多，但有人看完 Prompt、RAG、Agent、MCP 教程，真正要从零做产品时，仍不知道第一步该做什么。</p><p className={prose}>所以我们尽量把关键概念放进真实项目。课程整体遵循这样的实践逻辑：</p><Flow items={['先看到结果', '动手', '理解原因', '遇到失败', '修好并验证', '看 Git diff', '保存版本']} /><p className={prose}>我们希望收获的不只是“听懂了”，而是做出来、出错、修好、验证并完成交付。</p></Section>
        <Section index={8}><div className="grid gap-2 sm:grid-cols-2">{[['AI 协作能力', '描述需求 · 提供 Context · 拆任务 · 判断结果 · AI Debug · 检查修改'], ['软件产品能力', '页面 · API · 数据库 · 登录 · 权限 · 部署'], ['AI 应用能力', 'LLM · Structured Output · Streaming · Embedding · RAG · Citation · Eval'], ['Agent 工程能力', 'Tool · MCP · Workflow · Human Approval · Persistence · Agent Eval']].map(([title, body]) => <div key={title} className="rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{title}</h3><p className="mt-2 text-[13px] leading-6 text-slate-600">{body}</p></div>)}</div><p className={prose}>这些内容不是为了背术语，而是逐渐建立独立完成 AI 产品的能力。职业机会与收入取决于很多课程之外的因素。</p></Section>
        <Section index={9}><div className="overflow-hidden rounded-xl border border-slate-200 text-[13px]"><div className="grid grid-cols-2 bg-slate-50 font-semibold text-slate-900"><div className="p-3">AIFoundry 不是</div><div className="border-l border-slate-200 p-3">更希望做的是</div></div>{[['AI 工具大全', '建立可迁移的 AI 开发能力'], ['Prompt 咒语合集', '学会描述需求和验证结果'], ['速成专家班', '用项目逐步建立能力'], ['固定项目照抄', '理解并完成真实构建过程'], ['保就业 / 保赚钱', '提供学习路径和实践环境']].map(([a, b]) => <div key={a} className="grid grid-cols-2 border-t border-slate-100 text-slate-600"><div className="p-3">{a}</div><div className="border-l border-slate-100 p-3">{b}</div></div>)}</div></Section>
        <Section index={10}><ol className="space-y-3">{[['边读边做', '读一点，马上动手，看到结果后再继续。不要攒完整个阶段才统一操作。'], ['验证 AI 的修改', '至少运行、测试、观察页面、看报错与 diff；不要直接相信生成的代码。'], ['缩小报错范围', '先复现，读第一条错误，定位范围，让 AI 只修当前问题，再次验证。'], ['做过再复习', '不必背所有概念。真正使用过以后，再回来复习定义。']].map(([title, body], i) => <li key={title} className="flex gap-3 rounded-lg border border-slate-200 p-3"><span className="text-xs font-bold text-brand-600">{String(i + 1).padStart(2, '0')}</span><div><h3 className="text-sm font-semibold text-slate-900">{title}</h3><p className="mt-1 text-[13px] leading-6 text-slate-600">{body}</p></div></li>)}</ol></Section>
        <Section index={11}><div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-7"><h3 className="text-xl font-bold text-slate-900">你不需要先把这些概念全部学会。</h3><p className="mt-3 max-w-2xl text-[14px] leading-7 text-slate-600">接下来真正重要的是开始动手。在 Stage 1，你会先带着 AI 改一个真实项目，从第一次看到页面发生变化开始。</p><div className="mt-5 flex flex-wrap gap-3"><Link to="/lesson/stage-1/s1-l1" className="btn btn-lg btn-primary">免费开始第一课 <ArrowRight className="h-4 w-4" /></Link><Link to="/courses" className="btn btn-lg btn-outline">查看全部课程</Link></div></div></Section>
      </main><Toc />
    </div>
  </>
}
