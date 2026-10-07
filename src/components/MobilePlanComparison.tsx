import type { Plan } from '../data/site.js'
import { Link } from 'react-router-dom'
export function MobilePlanComparison({ allAccessPlan, projectPlan, stagePlans, onBuy }: { allAccessPlan: Plan; projectPlan: Plan; stagePlans: Plan[]; onBuy: (plan: Plan) => void }) {
  const sum = stagePlans.reduce((total, plan) => total + plan.price, 0)
  return <div className="mt-5 space-y-4 md:hidden" aria-label="移动端方案对比">
    <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">全阶段课程版 · ¥{allAccessPlan.price}</h3><p className="mt-2 text-xs leading-5 text-slate-600">Stage 1–4 · 29 节正式课 · 4 个阶段项目。不含 Project Lab。</p><p className="mt-2 text-xs text-slate-500">单买合计 ¥{sum}{sum > allAccessPlan.price && <> · 立省 ¥{sum - allAccessPlan.price}</>}</p><button className="btn btn-md btn-outline mt-4 w-full" disabled={allAccessPlan.isPurchasable === false} onClick={() => onBuy(allAccessPlan)}>选择课程版</button></section>
    <section className="rounded-xl border-2 border-brand-600 bg-brand-50 p-5"><p className="text-xs font-semibold text-brand-700">推荐</p><h3 className="mt-1 font-semibold">项目版 · ¥{projectPlan.price}</h3><p className="mt-2 text-xs leading-5 text-slate-600">包含课程版全部权益，另有 Project Lab：Capstone 毕业项目及专区后续新增综合项目。</p><p className="mt-2 text-xs text-brand-700">只比课程版多 ¥{projectPlan.price - allAccessPlan.price}；Capstone 当前暂未开放。</p><button className="btn btn-md btn-primary mt-4 w-full" disabled={projectPlan.isPurchasable === false} onClick={() => onBuy(projectPlan)}>选择项目版</button></section>
    <h3 className="pt-2 text-sm font-semibold">单阶段购买</h3>
    {stagePlans.map(plan => <section className="rounded-xl border border-slate-200 p-4" key={plan.id}><div className="flex items-start justify-between gap-3"><h4 className="text-sm font-medium">{plan.title}</h4><span className="shrink-0 font-semibold text-brand-600">¥{plan.price}</span></div><p className="mt-2 text-xs text-slate-500">{plan.meta}</p><Link to={`/stage/${plan.id}`} className="mt-3 inline-block text-sm text-brand-600">查看课程 →</Link></section>)}
  </div>
}
