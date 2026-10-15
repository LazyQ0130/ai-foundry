import { Link } from 'react-router-dom'
import type { projectPricingIntent } from '../lib/projectPricingNavigation.js'

export function ProjectPlanContext({ intent, access }: { intent: NonNullable<ReturnType<typeof projectPricingIntent>>; access: boolean }) {
  const label = intent.lesson ? `${intent.lesson.id.toUpperCase()} · ${intent.lesson.title}` : '项目工坊 · 毕业项目'
  return <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50/60 p-4" aria-label="原课程与对应方案">
    <p className="text-xs font-semibold text-brand-700">{access ? '已具备项目工坊权益' : '项目工坊所需方案'}</p>
    <h2 className="mt-2 text-[15px] font-semibold leading-6 text-slate-900">{label}</h2>
    <p className="mt-2 text-[13px] leading-6 text-slate-600">{access
      ? '可以直接返回继续学习，无需重复开通。'
      : '完整毕业项目需要项目版；单阶段和全阶段课程版均不含项目工坊。管理员核实开通后，可返回这里继续学习。'}</p>
    <Link to={intent.returnTo} className="link-more mt-3">{access ? '返回并继续学习' : intent.lesson ? `返回 ${intent.lesson.id.toUpperCase()} 课程` : '返回项目工坊'} →</Link>
    {!access && intent.lesson && <Link to="/capstone#lessons" className="mt-3 block text-[13px] text-slate-500 hover:text-brand-700">先回项目工坊浏览课程</Link>}
  </div>
}
