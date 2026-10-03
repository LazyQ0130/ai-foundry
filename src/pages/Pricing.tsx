import { useState } from 'react'
import { MobilePlanComparison } from '../components/MobilePlanComparison'
import { usePlans } from '../data/pricing'
import type { Plan } from '../data/site'
import PurchaseModal from '../components/PurchaseModal'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Icon } from '../components/Icon'
import { FullPlanCard } from '../components/PlanCard'
import { fullPlanBenefits, pricingHighlights } from '../data/site'
import { featuredFaqs } from '../data/help'

export default function Pricing() {
  const { plans, loading, error, refresh } = usePlans()
  const [selected, setSelected] = useState<Plan | null>(null)
  if(loading) return <p role="status" className="shell py-20">正在加载课程价格…</p>
  if(error) return <div role="alert" className="shell py-20">{error}<button className="btn btn-outline ml-3" onClick={()=>void refresh()}>重试</button></div>
  if(!plans.length) return <p className="shell py-20">暂无已发布课程。</p>
  const allPlan = plans.find((p)=>p.id==='all-access')
  const stagePlans = plans.filter((p)=>p.id!=='all-access')

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 80%)' }}
        />
        <div className="shell relative py-14 text-center">
          <span className="chip bg-white text-brand-600 ring-1 ring-brand-100">
            从入门到进阶，系统掌握 AI 时代的开发能力
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-[30px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[40px]">
            选择适合你的<span className="text-brand-600">学习方案</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[13.5px] leading-6 text-slate-500">
            4 个阶段、4 个阶段项目，带你从 AI 原生开发入门到构建完整的 Agent 应用。
            <br className="hidden sm:block" />
            图文讲解，自主阅读，一次购买永久开放。
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[12px] text-slate-500">微信付款，管理员确认后开通。首次开通后 72 小时内可申请退款，具体处理方式见《用户协议》。课程不含人工答疑，第三方工具及 API 费用由学员自行承担。</p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <section className="shell pb-16 pt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {plans.map((p) => (
            <FullPlanCard key={p.id} plan={p} onBuy={setSelected} />
          ))}
        </div>
      </section>

      {/* ------------------------------ 方案对比 ------------------------------ */}
      {allPlan && <section className="shell pb-16">
        <h2 className="h-sec">为什么更推荐全套学习</h2>
        <p className="sub-sec">四个阶段不是互不相关的课程，而是一条持续升级的项目学习路径。</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {fullPlanBenefits.map((benefit, index) => (
            <article key={benefit.title} className="border-t-2 border-brand-200 bg-white py-4 pr-3">
              <div className="flex items-center gap-2 text-brand-600"><Icon name={benefit.icon} className="h-4 w-4"/><span className="text-xs font-semibold">0{index + 1}</span></div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{benefit.desc}</p>
              {index === 2 && <Link to="/capstone" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600">了解毕业项目 <ArrowRight className="h-3.5 w-3.5"/></Link>}
            </article>
          ))}
        </div>
        <MobilePlanComparison allPlan={allPlan} stagePlans={stagePlans} onBuy={setSelected}/>
        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-xs font-medium text-slate-400">比较项目</th>
                <th className="px-4 py-3 text-center">
                  <span className="block text-sm font-semibold text-slate-900">单阶段购买</span>
                  <span className="mt-1 block text-xs text-slate-500">按需选择一个阶段</span>
                </th>
                <th className="rounded-t-lg border-x-2 border-t-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center">
                  <span className="block text-[13px] font-semibold text-slate-900">全套课程</span>
                  <span className="mt-1 block text-[12.5px] font-bold text-brand-600">¥ {allPlan.price}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['学习范围', '选择一个阶段', 'Stage 1–4 完整路径'],
                ['项目衔接', '学习所选阶段项目', '四阶段项目连续演进'],
                ['Capstone 毕业实战', '不包含', '全套专属 · 暂未解锁'],
                ['后续新增综合实战', '不包含', '包含，具体内容以上线页面为准'],
                ['购买成本', `单阶段 ¥${Math.min(...stagePlans.map(p => p.price))} 起`, `全套 ¥${allPlan.price}${stagePlans.reduce((sum, p) => sum + p.price, 0) > allPlan.price ? `，比分开购买省 ¥${stagePlans.reduce((sum, p) => sum + p.price, 0) - allPlan.price}` : ''}`],
              ].map(([label, stageValue, fullValue], index) => (
                <tr key={label} className={index % 2 ? 'bg-slate-50/60' : ''}>
                  <th className="px-4 py-3 text-left font-normal text-slate-500">{label}</th>
                  <td className="px-4 py-3 text-center text-slate-600">{stageValue}</td>
                  <td className="border-x-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center font-medium text-brand-700">{fullValue}</td>
                </tr>
              ))}
              <tr>
                <th className="px-4 py-3" />
                <td className="px-4 py-3 text-center"><Link to="/path" className="btn btn-sm btn-outline">查看阶段并选择</Link></td>
                <td className="rounded-b-lg border-x-2 border-b-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center">
                  <button disabled={allPlan.isPurchasable === false} onClick={() => setSelected(allPlan)} className="btn btn-sm btn-primary">了解全套开通方式</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      }
      {/* ------------------------------ 常见问题 ------------------------------ */}
      <section id="faq" className="shell scroll-mt-24 pb-8">
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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredFaqs.map((f) => (
            <div key={f.id} className="card p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-[15px] font-bold text-brand-600">
                ?
              </span>
              <h3 className="mt-3 text-[13.5px] font-semibold text-slate-900"><Link to={`/faq#${f.id}`} className="hover:text-brand-600 hover:underline">{f.q}</Link></h3>
              <p className="mt-2 text-[12px] leading-5 text-slate-500">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
      {selected && <PurchaseModal plan={selected} onClose={()=>setSelected(null)} />}
    </>
  )
}
