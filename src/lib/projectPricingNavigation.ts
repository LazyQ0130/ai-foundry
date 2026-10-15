import { capstoneLessons } from '../data/capstoneLessons.js'

export const projectPlanAnchor = 'plan-all-access-projects'

/** Only known workshop routes can become a return destination. */
export function projectPricingIntent(search: string) {
  const params = new URLSearchParams(search)
  if (params.get('plan') !== 'all-access-projects') return null
  const next = params.get('next')
  const lesson = capstoneLessons.find(item => item.published && next === `/capstone/lessons/${item.id}`)
  return {
    lesson,
    returnTo: lesson ? `/capstone/lessons/${lesson.id}` : '/capstone',
  }
}

export function projectPricingPath(lessonId?: string) {
  const lesson = capstoneLessons.find(item => item.id === lessonId && item.published)
  const next = lesson ? `/capstone/lessons/${lesson.id}` : '/capstone'
  return `/pricing?plan=all-access-projects&next=${encodeURIComponent(next)}#${projectPlanAnchor}`
}
