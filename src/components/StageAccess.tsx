import { useState } from 'react'
import type { Stage } from '../data/courses'
import { usePlans } from '../data/pricing'
import PurchaseModal from './PurchaseModal'
import { StageAccessActions } from './StageAccessActions'

export default function StageAccess({ stage, placement }: { stage: Stage; placement?: 'combined' | 'hero' | 'purchase' }) {
  const { plans } = usePlans()
  const [open, setOpen] = useState(false)
  const plan = plans.find(item => item.id === stage.slug)
  return <div>
    <StageAccessActions stage={stage} placement={placement} purchasable={!!plan && plan.isPurchasable !== false} onPurchase={() => setOpen(true)} />
    {stage.status === 'locked' && open && plan && <PurchaseModal plan={plan} onClose={() => setOpen(false)} />}
  </div>
}
