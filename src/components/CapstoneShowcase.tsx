import { ArrowDown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { capstoneShowcase } from '../data/capstoneShowcase.js'
import { useCapstone, type CapstoneSummary } from '../data/capstoneProgress.js'

export function CapstoneEntryCard({ data, loading = false, error = '', onRetry }: { data: CapstoneSummary | null; loading?: boolean; error?: string; onRetry?: () => void }) {
  const completed = data?.progress?.completed ?? 0
  const label = !data?.access ? '查看项目版' : completed === 9 ? '查看毕业项目' : completed > 0 ? '继续毕业项目' : '开始毕业项目'
  return <section className="rounded-2xl border border-brand-200 bg-white p-5 shadow-card sm:p-6" aria-label="Capstone Project Lab">
    <span className="chip bg-brand-50 text-brand-700">Stage 1～4 之后 · 毕业项目实战</span>
    <h3 className="mt-3 text-[22px] font-bold text-slate-900">Capstone Project Lab</h3>
    <p className="mt-2 text-[16px] font-semibold text-slate-700">AI 研究 Agent 毕业项目实战</p>
    <p className="mt-2 text-[13px] text-slate-500">AI 研究工作台 · 9 节 · 约 18～23 小时</p>
    <p className="mt-3 max-w-3xl text-[13px] leading-6 text-slate-600">把 Stage 1～4 的 AI Coding、全栈、RAG 和 Agent 能力，组合成一个完整的可部署 AI 产品。</p>
    <div className="mt-5 flex flex-wrap items-center gap-4">
      {loading ? <p role="status" className="text-sm text-slate-500">正在加载项目进度…</p> : error ? <p role="alert" className="text-sm text-red-600">{error}<button onClick={onRetry} className="btn btn-sm btn-outline ml-3">重试</button></p> : <><Link to={data?.access ? '/capstone' : '/pricing'} className="btn btn-md btn-primary">{label}<ArrowRight className="h-4 w-4" /></Link>{data?.access && <span className="text-sm text-slate-500">毕业项目进度 {completed} / {data.progress?.total ?? 9}</span>}</>}
    </div>
  </section>
}

export function CapstonePathCard() {
  const lab = useCapstone()
  return <div className="mt-8 border-t border-slate-200 pt-7">
    <div className="mx-auto mb-4 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-400" aria-hidden="true"><ArrowDown className="h-4 w-4" /></div>
    <CapstoneEntryCard data={lab.data} loading={lab.loading} error={lab.error} onRetry={()=>void lab.refresh()} />
  </div>
}

export function CapstoneHomeTeaser() {
  return (
    <Link to="/capstone" className="mt-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3.5 transition hover:border-brand-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between" aria-label={`${capstoneShowcase.project}，${capstoneShowcase.status}，查看介绍`}>
      <span className="min-w-0">
        <span className="mr-2 text-[11px] font-semibold text-slate-500">毕业项目</span>
        <span className="text-[13.5px] font-semibold text-slate-800">{capstoneShowcase.project}</span>
        <span className="mt-1 block text-[12px] leading-5 text-slate-500">{capstoneShowcase.projectEn} · Project Lab 专属毕业项目</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-slate-700">{capstoneShowcase.status} <ArrowRight className="h-4 w-4" /></span>
    </Link>
  )
}
