import { useState } from 'react'
import { MobilePlanComparison } from '../components/MobilePlanComparison'
import { usePlans } from '../data/pricing'
import type { Plan } from '../data/site'
import PurchaseModal from '../components/PurchaseModal'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Icon } from '../components/Icon'
import { FullPlanCard } from '../components/PlanCard'
import { pricingHighlights } from '../data/site'
import { featuredFaqs } from '../data/help'

export default function Pricing() {
  const { plans, loading, error, refresh } = usePlans()
  const [selected, setSelected] = useState<Plan | null>(null)
  if(loading) return <p role="status" className="shell py-20">正在加载课程价格…</p>
  if(error) return <div role="alert" className="shell py-20">{error}<button className="btn btn-outline ml-3" onClick={()=>void refresh()}>重试</button></div>
  if(!plans.length) return <p className="shell py-20">暂无已发布课程。</p>
  const allPlan = plans.find((p)=>p.id==='all-access')
  const projectPlan = plans.find((p)=>p.id==='all-access-projects')
  const stagePlans = plans.filter((p)=>p.id.startsWith('stage-'))

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 80%)' }}
        />
        <div className="shell relative py-9 text-center sm:py-11">
          <span className="chip bg-white text-brand-600 ring-1 ring-brand-100">
            从入门到进阶，系统掌握 AI 时代的开发能力
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[40px]">
            选择适合你的<span className="text-brand-600">学习方案</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[13.5px] leading-6 text-slate-500">
            4 个阶段、4 个阶段项目，带你从 AI 原生开发入门到构建完整的 Agent 应用。
            <br className="hidden sm:block" />
            想系统学习，可选择全阶段课程版；希望学完继续完成综合作品，可选择项目版。
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pricingHighlights.map((h) => (
              <div key={h.title} className="flex items-center gap-3 text-left">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-brand-100">
                  <Icon name={h.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{h.title}</p>
                  <p className="mt-0.5 text-[11.5px] text-slate-500">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ 价格卡片 ------------------------------ */}
      <section className="shell pb-10 pt-8">
        <h2 className="h-sec">按阶段学习</h2>
        <p className="sub-sec">只需要一个阶段时，选择对应课程与阶段项目。</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stagePlans.map((p) => (
            <FullPlanCard key={p.id} plan={p} onBuy={setSelected} />
          ))}
        </div>
        {allPlan && projectPlan && <>
          <h2 className="h-sec mt-10">一次解锁完整路径</h2>
          <p className="sub-sec">两种方案都包含完整四阶段课程与 4 个阶段项目；项目版另外开放 Project Lab。</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FullPlanCard plan={allPlan} onBuy={setSelected} />
            <FullPlanCard plan={projectPlan} onBuy={setSelected} />
          </div>
        </>}
      </section>

      {/* ------------------------------ 方案对比 ------------------------------ */}
      {allPlan && projectPlan && <section className="shell pb-10">
        <h2 className="h-sec">怎么选？</h2>
        <div className="mt-4 grid overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-slate-200">
          <div className="px-4 py-3 sm:py-4"><p className="text-[13px] font-semibold text-slate-900">¥{allPlan.price} 全阶段课程版</p><p className="mt-1 text-[12px] text-slate-600">想系统学完四阶段，完成阶段项目。</p></div>
          <div className="border-t border-slate-200 bg-brand-50/50 px-4 py-3 sm:border-t-0 sm:py-4"><p className="text-[13px] font-semibold text-brand-700">¥{projectPlan.price} 项目版 · 推荐</p><p className="mt-1 text-[12px] text-slate-600">想继续做综合作品，获得 Project Lab 权益。</p></div>
        </div>
        <h3 className="mt-8 text-[16px] font-semibold text-slate-900">权益对比</h3>
        <MobilePlanComparison allAccessPlan={allPlan} projectPlan={projectPlan}/>
        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-slate-400">比较项目</th>
                <th className="px-4 py-3 text-center">
                  <span className="block text-sm font-semibold text-slate-900">单阶段购买</span>
                  <span className="mt-1 block text-xs text-slate-500">按需选择一个阶段</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="block text-[13px] font-semibold text-slate-900">全阶段课程版</span>
                  <span className="mt-1 block text-[12.5px] font-bold text-brand-600">¥ {allPlan.price}</span>
                </th>
                <th className="rounded-t-lg border-x-2 border-t-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center"><span className="block text-[13px] font-semibold text-slate-900">项目版 · 推荐</span><span className="mt-1 block text-[12.5px] font-bold text-brand-600">¥ {projectPlan.price}</span></th>
              </tr>
            </thead>
            <tbody>
              {[
                ['学习范围', '一个阶段', 'Stage 1–4', 'Stage 1–4'],
                ['正式课程', '对应阶段', '29 节', '29 节'],
                ['阶段项目', '1 个', '4 个', '4 个'],
                ['Project Lab', '不包含', '不包含', '包含'],
                ['Capstone', '不包含', '不包含', '项目版专属 · 暂未开放'],
                ['后续综合项目', '不包含', '不包含', 'Project Lab 内持续更新'],
                ['价格', `单阶段 ¥${Math.min(...stagePlans.map(p => p.price))} 起`, `¥${allPlan.price}`, `¥${projectPlan.price} · 只比课程版多 ¥${projectPlan.price - allPlan.price}`],
              ].map(([label, stageValue, fullValue, projectValue], index) => (
                <tr key={label} className={index % 2 ? 'bg-slate-50/60' : ''}>
                  <th className="px-4 py-3 text-left font-normal text-slate-500">{label}</th>
                  <td className="px-4 py-3 text-center text-slate-600">{stageValue}</td>
                  <td className="px-4 py-3 text-center text-slate-700">{fullValue}</td>
                  <td className="border-x-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center font-medium text-brand-700">{projectValue}</td>
                </tr>
              ))}
              <tr>
                <th className="px-4 py-3" />
                <td className="px-4 py-3 text-center"><Link to="/path" className="btn btn-sm btn-outline">查看阶段并选择</Link></td>
                <td className="px-4 py-3 text-center"><button disabled={allPlan.isPurchasable === false} onClick={() => setSelected(allPlan)} className="btn btn-sm btn-outline">选择课程版</button></td>
                <td className="rounded-b-lg border-x-2 border-b-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center"><button disabled={projectPlan.isPurchasable === false} onClick={() => setSelected(projectPlan)} className="btn btn-sm btn-primary">选择项目版</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      }
      {/* ------------------------------ 常见问题 ------------------------------ */}
      <section id="faq" className="shell scroll-mt-24 pb-10">
        <p className="mb-6 text-[12px] leading-5 text-slate-500">微信付款，管理员确认后开通。首次开通后 72 小时内可申请退款，具体处理方式见<Link to="/terms" className="text-brand-600">《用户协议》</Link>。课程不含人工答疑，第三方工具及 API 费用由学员自行承担。</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="h-sec">常见问题</h2>
            <p className="sub-sec">帮助你更好地了解课程和购买相关问题。</p>
          </div>
          <Link to="/faq" className="link-more">
            查看全部问题
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredFaqs.map((f) => (
            <article key={f.id} className="card flex flex-col p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-[15px] font-bold text-brand-600">
                ?
              </span>
              <h3 className="mt-3 text-[13.5px] font-semibold text-slate-900">{f.q}</h3>
              <p className="mt-2 text-[12px] leading-5 text-slate-500">{f.featuredSummary ?? f.a}</p>
              <Link to={`/faq#${f.id}`} className="mt-3 inline-flex items-center gap-1 self-start text-[12px] font-medium text-brand-600 hover:text-brand-700 hover:underline">查看详情 <ArrowRight className="h-3 w-3" /></Link>
            </article>
          ))}
        </div>
      </section>
      {selected && <PurchaseModal plan={selected} onClose={()=>setSelected(null)} />}
    </>
  )
}
