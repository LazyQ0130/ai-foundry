import { useState } from 'react'
import { MobilePlanComparison } from '../components/MobilePlanComparison'
import { usePlans } from '../data/pricing'
import type { Plan } from '../data/site'
import PurchaseModal from '../components/PurchaseModal'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { Icon } from '../components/Icon'
import { FullPlanCard } from '../components/PlanCard'
import { compareRows, pricingHighlights } from '../data/site'
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
          <p className="mx-auto mt-3 max-w-2xl text-[12px] text-slate-500">微信付款，管理员确认后开通。开通后 72 小时内可申请无理由全额退款。课程不含人工答疑，第三方工具及 API 费用由学员自行承担。</p>

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
        <h2 className="h-sec">方案对比</h2>
        <MobilePlanComparison allPlan={allPlan} stagePlans={stagePlans} onBuy={setSelected}/>
        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] border-collapse text-[12.5px]">
            <thead>
              <tr>
                <th className="w-[160px] px-4 py-3 text-left align-bottom text-[12px] font-medium text-slate-400" />
                {stagePlans.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center align-bottom">
                    <span className="block text-[13px] font-semibold text-slate-900">{p.title}</span>
                    <span className="mt-1 block text-[12.5px] font-bold text-brand-600">¥ {p.price}</span>
                  </th>
                ))}
                <th className="rounded-t-xl border-x-2 border-t-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center align-bottom">
                  <span className="block text-[13px] font-semibold text-slate-900">全套课程</span>
                  <span className="mt-1 block text-[12.5px] font-bold text-brand-600">¥ {allPlan?.price ?? '—'}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(stagePlans.length === 4 ? compareRows : []).map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 1 ? 'bg-slate-50/60' : ''}>
                  <th className="px-4 py-3 text-left text-[12.5px] font-normal text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Icon name="file" className="h-3.5 w-3.5 text-slate-300" />
                      {row.label}
                    </span>
                  </th>
                  {row.values.map((v, i) => (
                    <td
                      key={`${row.label}-${i}`}
                      className={`px-4 py-3 text-center ${
                        i === 4 ? 'border-x-2 border-brand-600 bg-brand-50/60' : ''
                      } ${ri === 0 && i === 4 ? '' : ''}`}
                    >
                      {row.check ? (
                        row.check[i] ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" strokeWidth={2.8} />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-slate-300" strokeWidth={2.4} />
                        )
                      ) : (
                        <span className={i === 4 ? 'font-medium text-brand-700' : 'text-slate-600'}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="px-4 py-3" />
                {stagePlans.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-center">
                    <Link to={`/stage/${p.id}`} className="btn btn-sm btn-outline w-full">
                      查看课程
                    </Link>
                  </td>
                ))}
                <td className="rounded-b-xl border-x-2 border-b-2 border-brand-600 bg-brand-50/60 px-4 py-3 text-center">
                  <Link to="/path" className="btn btn-sm btn-primary w-full">
                    查看完整路径
                  </Link>
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
