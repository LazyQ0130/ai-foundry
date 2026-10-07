import { Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Plan } from '../data/site'
import { Check } from 'lucide-react'

const accentChip: Record<Plan['accent'], string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-brand-50 text-brand-600',
  violet: 'bg-violet-50 text-violet-600',
  orange: 'bg-orange-50 text-orange-600',
  brand: 'bg-brand-600 text-white',
}

function Price({ plan, size = 'md' }: { plan: Plan; size?: 'md' | 'lg' }) {
  const num = size === 'lg' ? 'text-[30px]' : 'text-[26px]'
  return (
    <div className="flex items-end gap-1.5">
      <span className={`${num} font-bold leading-none tracking-tight text-slate-900`}>
        <span className="mr-0.5 text-[15px] font-semibold">¥</span>
        {plan.price}
      </span>
      {plan.originPrice ? (
        <span className="pb-0.5 text-[12.5px] text-slate-400 line-through">¥{plan.originPrice}</span>
      ) : null}
    </div>
  )
}

/* ------------------------------- 重点版（全套） ------------------------------ */

export function FeaturedPlanCard({ plan, size = 'md', onBuy }: { plan: Plan; size?: 'md' | 'lg'; onBuy?: (plan: Plan) => void }) {
  return (
    <div className="relative flex flex-col rounded-2xl border-2 border-brand-600 bg-white p-4 shadow-lift sm:p-5">
      <span className="absolute right-3 top-0 -translate-y-1/2 rounded-full rounded-b-none bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white">
        {plan.badge}
      </span>
      <span className={`chip w-fit ${accentChip[plan.accent]}`}>{plan.tag}</span>
      <h3 className="mt-2.5 flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
        <Crown className="h-4 w-4 text-brand-600" strokeWidth={2.2} />
        {plan.title}
      </h3>
      <p className="mt-2 text-[12px] leading-5 text-slate-500">{plan.desc}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Price plan={plan} size={size} />
        {plan.saveText ? (
          <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-600">
            {plan.saveText}
          </span>
        ) : null}
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2">
            <Check
              className={`mt-[3px] h-3.5 w-3.5 shrink-0 ${
                f.highlight ? 'text-brand-600' : 'text-emerald-500'
              }`}
              strokeWidth={2.8}
            />
            <span
              className={`text-[12.5px] leading-5 ${
                f.highlight ? 'font-medium text-brand-700' : 'text-slate-600'
              }`}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <PurchaseButton plan={plan} onBuy={onBuy} featured />
    </div>
  )
}

/* ------------------------------- 完整版（价格页） ----------------------------- */

export function FullPlanCard({ plan, onBuy }: { plan: Plan; onBuy?: (plan: Plan) => void }) {
  if (plan.featured) return <FeaturedPlanCard plan={plan} size="lg" onBuy={onBuy} />
  return (
    <div className="card flex flex-col p-4 sm:p-5">
      <span className={`chip w-fit ${accentChip[plan.accent]}`}>{plan.tag}</span>
      <h3 className="mt-2.5 text-[14.5px] font-semibold text-slate-900">{plan.title}</h3>
      <p className="mt-2 min-h-[40px] text-[12.5px] leading-5 text-slate-500">{plan.desc}</p>
      <div className="mt-3.5">
        <Price plan={plan} size="lg" />
      </div>
      <p className="mt-2 text-[12px] text-slate-500">{plan.meta}</p>
      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2">
            <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
            <span className="text-[12.5px] leading-5 text-slate-600">{f.text}</span>
          </li>
        ))}
      </ul>
      <PurchaseButton plan={plan} onBuy={onBuy} />
    </div>
  )
}

function PurchaseButton({ plan, onBuy, featured=false }: {plan: Plan; onBuy?: (plan: Plan)=>void; featured?: boolean}) {
return onBuy ? <button disabled={!plan.isPurchasable} onClick={()=>onBuy(plan)} className={`btn btn-md mt-5 w-full ${featured ? 'btn-primary' : 'btn-outline'}`}>{plan.isPurchasable ? plan.cta : '暂未开放购买'}</button> : <Link to="/pricing" className="btn btn-md btn-outline mt-5 w-full">查看购买方案</Link>
}
