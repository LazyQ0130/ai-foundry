import type { Plan } from '../data/site.js'
import { Link } from 'react-router-dom'
export function MobilePlanComparison({ allPlan, stagePlans, onBuy }: { allPlan: Plan; stagePlans: Plan[]; onBuy: (plan: Plan) => void }) {
  const sum = stagePlans.reduce((total, plan) => total + plan.price, 0)
  return <div className="mt-5 space-y-4 md:hidden" aria-label="移动端方案对比">
    <section className="rounded-xl border border-brand-200 bg-brand-50 p-5">
      <p className="text-xs font-semibold text-brand-600">完整学习路径</p><h3 className="mt-2 text-lg font-semibold">Stage 1 → 2 → 3 → 4</h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-700">
        <li><span className="font-semibold">四阶段自然承接</span><span className="mt-0.5 block text-xs text-slate-500">同一项目从 AI Coding 升级到全栈、RAG 与 Agent</span></li>
        <li><span className="font-semibold">全套专属 Capstone</span><span className="mt-0.5 block text-xs text-slate-500">AI Research Workspace，当前暂未解锁</span></li>
        <li><span className="font-semibold">后续新增综合实战</span><span className="mt-0.5 block text-xs text-slate-500">具体内容以上线页面为准</span></li>
      </ul>
      <div className="mt-5 border-t border-brand-200 pt-4"><p className="text-xs text-slate-600">全套课程</p><p className="mt-1 text-2xl font-bold text-brand-700">¥{allPlan.price}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">单独购买合计 ¥{sum}{sum > allPlan.price && <> · 立省 ¥{sum-allPlan.price}</>}</p></div>
      <button className="btn btn-md btn-primary mt-4 w-full" disabled={allPlan.isPurchasable === false} onClick={() => onBuy(allPlan)}>{allPlan.isPurchasable === false ? '暂不开放购买' : '了解全套开通方式'}</button>
    </section>
    <h3 className="pt-2 text-sm font-semibold">也可以单独购买某一个阶段</h3>
    {stagePlans.map(plan => <section className="rounded-xl border border-slate-200 p-4" key={plan.id}><div className="flex items-start justify-between gap-3"><h4 className="text-sm font-medium">{plan.title}</h4><span className="shrink-0 font-semibold text-brand-600">¥{plan.price}</span></div><p className="mt-2 text-xs text-slate-500">{plan.meta}</p><Link to={`/stage/${plan.id}`} className="mt-3 inline-block text-sm text-brand-600">查看课程 →</Link></section>)}
  </div>
}
