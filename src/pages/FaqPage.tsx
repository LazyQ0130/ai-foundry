import { FaqPermalink } from '../components/FaqPermalink'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react'
import { faqCategories, faqs } from '../data/help'
import PurchaseModal from '../components/PurchaseModal'

export default function FaqPage() {
  const { hash, key } = useLocation()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [contact, setContact] = useState(false)

  useEffect(() => {
    let id: string
    try { id = decodeURIComponent(hash.slice(1)) } catch { return }
    if (faqs.some((faq) => faq.id === id)) {
      setExpanded((previous) => new Set(previous).add(id))
      document.getElementById(`${id}-button`)?.focus({ preventScroll: true })
    } else if (faqCategories.some((category) => category.id === id)) {
      document.getElementById(id)?.focus({ preventScroll: true })
    }
  }, [hash, key])

  const toggle = (id: string) => setExpanded((previous) => {
    const next = new Set(previous)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return <>
    <section className="bg-gradient-to-b from-[#E9F2FE] to-white">
      <div className="shell py-12 sm:py-16">
        <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">学习帮助</span>
        <h1 className="mt-4 text-[32px] font-bold tracking-tight text-slate-900 sm:text-[42px]">常见问题</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">从选课到开始动手，把你可能遇到的问题放在这里。<br className="hidden sm:block" />选择一个分类，找到下一步怎么做。</p>
      </div>
    </section>

    <div className="shell grid items-start gap-8 pb-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-24">
        <p className="mb-3 text-xs font-medium text-slate-500">按主题查找</p>
        <nav aria-label="常见问题分类" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {faqCategories.map((category, index) => <Link key={category.id} to={`/faq#${category.id}`} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
            <span>{category.title}</span><span className="text-xs text-slate-400">0{index + 1}</span>
          </Link>)}
        </nav>
        <Link to="/about" className="mt-5 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600">了解我们的学习方法<ArrowRight className="h-3.5 w-3.5" /></Link>
      </aside>

      <div className="min-w-0 space-y-10">
        {faqCategories.map((category) => <section key={category.id} id={category.id} tabIndex={-1} aria-labelledby={`${category.id}-title`} className="scroll-mt-24 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
          <h2 id={`${category.id}-title`} className="text-xl font-semibold tracking-tight text-slate-900">{category.title}</h2>
          <p className="mb-4 mt-1 text-[13px] text-slate-500">{category.description}</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {faqs.filter((faq) => faq.category === category.id).map((faq) => <div key={faq.id} id={faq.id} className="scroll-mt-24 border-b border-slate-100 last:border-0">
              <h3><button id={`${faq.id}-button`} type="button" aria-expanded={expanded.has(faq.id)} aria-controls={`${faq.id}-answer`} onClick={() => toggle(faq.id)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600">
                {faq.q}<ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${expanded.has(faq.id) ? 'rotate-180' : ''}`} />
              </button></h3>
              <div id={`${faq.id}-answer`} hidden={!expanded.has(faq.id)} className="px-5 pb-5 text-[13.5px] leading-7 text-slate-600">
                <p>{faq.a}</p>
                {faq.link && <Link to={faq.link.to} className="mt-2 inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">{faq.link.label}<ArrowRight className="h-3.5 w-3.5" /></Link>}
                <FaqPermalink id={faq.id}/>
              </div>
            </div>)}
          </div>
        </section>)}

        <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 sm:p-7">
          <MessageCircle className="h-6 w-6 text-brand-600" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">还没找到答案？</h2>
          <p className="mt-2 text-[13px] leading-6 text-slate-600">购买、退款、课程开通或账号问题，可联系管理员处理。课程采用自主阅读方式，不提供人工答疑或代码排错服务。</p>
          <button type="button" className="btn btn-md btn-primary mt-5" onClick={() => setContact(true)}>联系管理员<ArrowRight className="h-4 w-4" /></button>
        </section>
      </div>
    </div>
    {contact && <PurchaseModal onClose={() => setContact(false)} />}
  </>
}
