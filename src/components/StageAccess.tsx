import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Stage } from '../data/courses'
import { usePlans } from '../data/pricing'
import PurchaseModal from './PurchaseModal'

export default function StageAccess({ stage }: { stage: Stage }) {
  const { plans } = usePlans()
  const [open, setOpen] = useState(false)
  const plan = plans.find(item => item.id === stage.slug)
  const next = stage.lessons.find(item => item.status === 'in_progress') ?? stage.lessons.find(item => item.status === 'not_started') ?? stage.lessons.find(item => item.isPublished !== false && item.status !== 'locked')
  if (stage.status !== 'locked') return <Link className="btn btn-md btn-primary w-full" to={next ? `/lesson/${stage.slug}/${next.id}` : '/courses'}>继续学习</Link>
  return <div>
    {stage.lessons.some(l => l.isPreview && l.isPublished !== false) && <Link to={`/lesson/${stage.slug}/${stage.lessons.find(l => l.isPreview && l.isPublished !== false)!.id}`} className="btn btn-md btn-outline mb-3 w-full">开始免费体验</Link>}
    <p className="mb-2 text-sm text-slate-600">未开通 · <strong className="text-brand-700">¥{stage.price}</strong></p>
    <button type="button" className="btn btn-md btn-primary w-full" disabled={!plan || plan.isPurchasable === false} onClick={() => setOpen(true)}>{plan?.isPurchasable === false ? '暂不开放购买' : '开通本阶段'}</button>
    {open && plan && <PurchaseModal plan={plan} onClose={() => setOpen(false)} />}
  </div>
}
