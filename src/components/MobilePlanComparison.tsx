import type { Plan } from '../data/site.js'
import { Link } from 'react-router-dom'
export function MobilePlanComparison({ allPlan, stagePlans, onBuy }: { allPlan: Plan; stagePlans: Plan[]; onBuy: (plan: Plan) => void }) {
  const sum = stagePlans.reduce((total, plan) => total + plan.price, 0)
  return <div className="mt-5 space-y-4 md:hidden" aria-label="移动端方案对比">
    <section className="rounded-xl border border-brand-200 bg-brand-50 p-5">
      <p className="text-xs font-semibold text-brand-600">推荐方案</p><h3 className="mt-2 text-xl font-semibold">全套课程</h3><p className="my-3 text-3xl font-bold text-brand-700">¥{allPlan.price}</p>
      <ul className="space-y-2 text-sm text-slate-600">{stagePlans.map((plan, i) => <li key={plan.id}>✓ 包含 Stage {i+1} · {plan.title}</li>)}<li>✓ {stagePlans.length} 个阶段项目</li></ul>
      <p className="mt-4 text-xs leading-6 text-slate-500">单独购买合计 ¥{sum}{sum > allPlan.price && <><br/>全套节省 ¥{sum-allPlan.price}</>}</p>
      <button className="btn btn-md btn-primary mt-4 w-full" disabled={allPlan.isPurchasable === false} onClick={() => onBuy(allPlan)}>{allPlan.isPurchasable === false ? '暂不开放购买' : '了解全套开通方式'}</button>
    </section>
    <h3 className="pt-2 text-sm font-semibold">分别购买</h3>
    {stagePlans.map(plan => <section className="rounded-xl border border-slate-200 p-4" key={plan.id}><div className="flex items-start justify-between gap-3"><h4 className="text-sm font-medium">{plan.title}</h4><span className="shrink-0 font-semibold text-brand-600">¥{plan.price}</span></div><p className="mt-2 text-xs text-slate-500">{plan.meta}</p><Link to={`/stage/${plan.id}`} className="mt-3 inline-block text-sm text-brand-600">查看课程 →</Link></section>)}
  </div>
}
