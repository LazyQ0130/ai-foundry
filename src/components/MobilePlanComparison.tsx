import type { Plan } from '../data/site.js'

export function MobilePlanComparison({ allAccessPlan, projectPlan }: { allAccessPlan: Plan; projectPlan: Plan }) {
  const rows = [
    ['Stage 1–4', true, true],
    ['29 节正式课程', true, true],
    ['4 个阶段项目', true, true],
    ['Project Lab', false, true],
    ['Capstone · 9 节 Project Lab', false, true],
    ['后续综合项目', false, true],
  ] as const
  return <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden" aria-label="移动端方案对比">
    <div className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 bg-slate-50 px-3 py-3 text-[11px] font-semibold text-slate-700"><span>权益对比</span><span className="text-center">课程版</span><span className="text-center text-brand-700">项目版</span></div>
    <div className="divide-y divide-slate-100">{rows.map(([label, course, project]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 px-3 py-2.5 text-[12px]"><span className="min-w-0 text-slate-600">{label}</span><span className="text-center text-slate-700">{course ? '✓' : '—'}</span><span className="text-center font-semibold text-brand-700">{project ? '✓' : '—'}</span></div>)}</div>
    <div className="grid grid-cols-[minmax(0,1fr)_72px_72px] items-center gap-2 border-t border-slate-200 bg-brand-50/50 px-3 py-3 text-[12px]"><span className="text-slate-600">方案价格</span><span className="text-center font-bold">¥{allAccessPlan.price}</span><span className="text-center font-bold text-brand-700">¥{projectPlan.price}</span></div>
    <p className="px-3 pb-3 text-right text-[11px] text-brand-700">项目版仅多 ¥{projectPlan.price - allAccessPlan.price}</p>
  </div>
}
