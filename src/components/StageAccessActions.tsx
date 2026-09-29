import { Link } from 'react-router-dom'
import type { Stage } from '../data/courses.js'

/** stage.status and lesson.status must be supplied by ProgressProvider. */
export function StageAccessActions({ stage, purchasable, onPurchase }: {
  stage: Stage
  purchasable: boolean
  onPurchase: () => void
}) {
  if (stage.status === 'completed') {
    const checkpoint = stage.checkpoints[0]
    return <Link className="btn btn-md btn-primary w-full" to={`/stage/${stage.slug}${checkpoint ? `#${checkpoint.id}` : ''}`}>
      查看 {stage.tag} 阶段自检
    </Link>
  }
  if (stage.status !== 'locked') {
    const available = stage.lessons.filter(lesson => lesson.isPublished !== false && lesson.status !== 'locked')
    const next = available.find(lesson => lesson.status === 'in_progress')
      ?? available.find(lesson => lesson.status === 'not_started') ?? available[0]
    return <Link className="btn btn-md btn-primary w-full" to={next ? `/lesson/${stage.slug}/${next.id}` : '/courses'}>继续学习</Link>
  }

  const previews = stage.lessons.filter(lesson => lesson.isPreview && lesson.isPublished !== false)
    .sort((a, b) => a.order - b.order)
  const nextPreview = previews.find(lesson => lesson.status !== 'completed')
  const completed = previews.length > 0 && !nextPreview
  const started = previews.some(lesson => lesson.status === 'completed' || lesson.status === 'in_progress')

  return <div>
    {nextPreview && <Link to={`/lesson/${stage.slug}/${nextPreview.id}`} className="btn btn-md btn-outline mb-3 w-full">{started ? '继续免费体验' : '开始免费体验'}</Link>}
    {completed && <div className="mb-3" role="status">
      <p className="font-semibold text-emerald-700">✓ 免费体验已完成</p>
      <p className="mt-1 text-sm text-slate-600">你已完成本阶段的全部免费体验课程，可以继续了解完整课程。</p>
    </div>}
    <p className="mb-2 text-sm text-slate-600">未开通 · <strong className="text-brand-700">¥{stage.price}</strong></p>
    <button type="button" className="btn btn-md btn-primary w-full" disabled={!purchasable} onClick={onPurchase}>{!purchasable ? '暂不开放购买' : completed ? `开通 Stage ${stage.id}` : '开通本阶段'}</button>
  </div>
}
