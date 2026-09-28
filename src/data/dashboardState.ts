import type { Lesson, Stage } from './courses.js'

export type DashboardState =
  | { kind: 'free' }
  | { kind: 'continue'; stage: Stage; lesson: Lesson; path: string }
  | { kind: 'completed'; stage: Stage }
  | { kind: 'owned'; stage: Stage }

export function dashboardState(stages: Stage[], entitlements: string[], lastLessonPath: string): DashboardState {
  if (!entitlements.length) return { kind: 'free' }
  const owned = stages.filter(stage => entitlements.includes(stage.slug))
  const available = owned.filter(stage => stage.status !== 'completed').flatMap(stage => stage.lessons
    .filter(lesson => lesson.isPublished !== false && lesson.status !== 'locked' && lesson.status !== 'completed')
    .map(lesson => ({ stage, lesson, path: `/lesson/${stage.slug}/${lesson.id}` })))
  const next = available.find(item => item.path === lastLessonPath) ?? available[0]
  if (next) return { kind: 'continue', ...next }
  const completed = [...owned].reverse().find(stage => stage.status === 'completed')
  if (completed) return { kind: 'completed', stage: completed }
  return { kind: 'owned', stage: owned[0] ?? stages[0] }
}
