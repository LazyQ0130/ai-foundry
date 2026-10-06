import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Boxes, Check, FileCheck2, GraduationCap, LockKeyhole, ShieldCheck } from 'lucide-react'
import { capstoneShowcase } from '../data/capstoneShowcase.js'
import { stages } from '../data/courses.js'

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
  const [notice, setNotice] = useState(false)

  return (
    <div>
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="shell py-9 sm:py-12">
          <nav aria-label="面包屑导航" className="text-[12px] text-slate-500"><Link to="/path" className="hover:text-brand-700">学习路径</Link><span className="px-2" aria-hidden="true">/</span><span className="text-slate-700">毕业项目</span></nav>
          <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500"><GraduationCap className="h-4 w-4" />{capstoneShowcase.title}</span>
              <h1 className="mt-3 max-w-3xl text-[30px] font-bold leading-tight text-slate-950 sm:text-[38px]">{capstoneShowcase.project}</h1>
              <p className="mt-1 text-[14px] font-medium text-slate-500">{capstoneShowcase.projectEn}</p>
              <p className="mt-3 text-[16px] font-semibold text-slate-700">{capstoneShowcase.subtitle}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700"><LockKeyhole className="h-3.5 w-3.5" />{capstoneShowcase.status}</span>
              <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[12px] font-semibold text-brand-800">{capstoneShowcase.badge}</span>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-[14px] leading-7 text-slate-600">{capstoneShowcase.description}</p>
          <p className="mt-5 max-w-3xl border-l-2 border-brand-500 pl-4 text-[13.5px] leading-6 text-slate-700"><span className="font-semibold text-slate-900">最终目标：</span>{capstoneShowcase.exitState}</p>
          <Link to="/path" className="link-more mt-6">返回完整学习路径 <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="shell py-12 sm:py-14">
        <SectionHeading title="这不是新的知识阶段" sub="前四阶段负责学习能力，Capstone 负责证明能力。" />
        <div className="mt-7 grid gap-2 sm:grid-cols-5">
          {stages.map((stage, index) => (
            <div key={stage.slug} className="flex min-h-[78px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:block sm:p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-700">{index + 1}</span>
              <span className="min-w-0 sm:mt-3 sm:block">
                <span className="block text-[11px] text-slate-500">{stage.tag}</span>
                <span className="mt-0.5 block text-[13px] font-semibold leading-5 text-slate-900">{stage.title}</span>
              </span>
            </div>
          ))}
          <div className="flex min-h-[78px] items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3 text-white sm:block sm:p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 text-[11px] font-bold">C</span>
            <span className="min-w-0 sm:mt-3 sm:block"><span className="block text-[11px] text-slate-300">Capstone</span><span className="mt-0.5 block text-[13px] font-semibold leading-5">AI Product Delivery</span></span>
          </div>
        </div>
        <p className="mt-4 text-[12px] text-slate-500">Stage 1–4 · 学习能力 <span className="px-2" aria-hidden="true">→</span><strong className="font-semibold text-slate-700">Capstone · 综合交付</strong></p>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="shell py-12 sm:py-14">
          <SectionHeading title="最终会做出什么" sub={capstoneShowcase.project} />
          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {capstoneShowcase.flow.map((step, index) => (
              <div key={step} className={`flex min-h-[68px] items-center gap-2 rounded-lg border px-3 py-3 ${index === capstoneShowcase.flow.length - 1 ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <span className="text-[10px] font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                <span className="text-[12px] font-semibold leading-5 text-slate-800">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-12 sm:py-14">
        <SectionHeading title="综合交付能力" sub="把前四阶段已经学过的能力，放进一个完整产品里一起验证。" />
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {capstoneShowcase.abilities.map((ability) => {
            const AbilityIcon = abilityIcons[ability.title as keyof typeof abilityIcons]
            return <div key={ability.title} className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700"><AbilityIcon className="h-4 w-4" /></span>
              <h2 className="mt-3 text-[14px] font-semibold text-slate-900">{ability.title}</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-600">{ability.desc}</p>
            </div>
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="shell py-12 sm:py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading title="八课毕业路线" sub="每一课完成一个产品增量，最后交付可验证的完整作品。" />
            <span className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-slate-500"><LockKeyhole className="h-3.5 w-3.5" />全部暂未解锁</span>
          </div>
          {notice && <p className="mt-5 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12.5px] text-slate-600" role="status" aria-live="polite">毕业项目实战暂未解锁</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {capstoneShowcase.lessons.map((lesson) => (
              <button key={lesson.code} type="button" onClick={() => setNotice(true)} aria-label={`${lesson.code} ${lesson.title}，${capstoneShowcase.status}`} className="group flex min-h-[132px] w-full flex-col rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 sm:p-5">
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-slate-500">{lesson.code}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"><LockKeyhole className="h-3 w-3" />{capstoneShowcase.status}</span>
                </span>
                <span className="mt-3 text-[14px] font-semibold leading-5 text-slate-900">{lesson.title}</span>
                <span className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{lesson.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="shell grid gap-10 py-12 sm:py-14 lg:grid-cols-2">
        <div>
          <SectionHeading title="核心技术" sub="按产品需要组合现有能力，不额外堆叠技术关键词。" />
          <div className="mt-5 flex flex-wrap gap-2">{capstoneShowcase.technologies.map((technology) => <span key={technology} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700">{technology}</span>)}</div>
        </div>
        <div>
          <SectionHeading title="最终交付物" sub="最终交付不止代码，也包括可以复核和展示的工程证据。" />
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">{capstoneShowcase.deliverables.map((item) => <li key={item} className="flex items-center gap-2 text-[12.5px] text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-600" />{item}</li>)}</ul>
        </div>
      </section>
    </div>
  )
}
