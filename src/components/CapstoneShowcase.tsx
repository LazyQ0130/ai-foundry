import { ArrowDown, ArrowRight, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { capstoneShowcase } from '../data/capstoneShowcase.js'

export function CapstonePathCard() {
  return (
    <div className="mt-8 border-t border-slate-200 pt-7">
      <div className="mx-auto mb-4 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-400" aria-hidden="true">
        <ArrowDown className="h-4 w-4" />
      </div>
      <Link
        to="/capstone"
        className="group grid gap-5 rounded-xl border border-slate-300 bg-slate-50 p-5 shadow-card transition hover:border-brand-300 hover:bg-white hover:shadow-lift sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
        aria-label={`${capstoneShowcase.title}，${capstoneShowcase.status}，查看毕业项目介绍`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-slate-900 text-white">CAPSTONE · FINAL PROJECT</span>
            <span className="chip bg-white text-slate-600 ring-1 ring-slate-200">{capstoneShowcase.badge}</span>
          </div>
          <h3 className="mt-3 text-[20px] font-bold text-slate-900">{capstoneShowcase.title}</h3>
          <p className="mt-1 text-[14px] font-medium text-slate-700">{capstoneShowcase.subtitle}</p>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-slate-500">前四阶段建立能力，Capstone 将这些能力组合成一个可以部署、验证和展示的 AI 产品。</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700">
            <LockKeyhole className="h-3.5 w-3.5" />{capstoneShowcase.status}
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 group-hover:text-brand-800">了解毕业项目 <ArrowRight className="h-4 w-4" /></span>
        </div>
      </Link>
    </div>
  )
}

export function CapstoneHomeTeaser() {
  return (
    <Link to="/capstone" className="mt-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3.5 transition hover:border-brand-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between" aria-label={`${capstoneShowcase.title}，${capstoneShowcase.status}，查看介绍`}>
      <span className="min-w-0">
        <span className="mr-2 text-[11px] font-semibold text-slate-500">毕业项目</span>
        <span className="text-[13.5px] font-semibold text-slate-800">AI Foundry Capstone Project</span>
        <span className="mt-1 block text-[12px] leading-5 text-slate-500">4 个学习阶段 + Capstone 毕业项目</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-slate-700">{capstoneShowcase.status} <ArrowRight className="h-4 w-4" /></span>
    </Link>
  )
}
