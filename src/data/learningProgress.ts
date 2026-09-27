import { formalLessons, getStageBySlug, stageLessonCount, type Stage, type StageStatus, type Lesson } from './courses.js'

/** Helpers take runtime stages from ProgressProvider, never infer a user from the curriculum. */
export function stageCompletedCount(stage: Stage) {
  const ids = new Set(formalLessons(getStageBySlug(stage.slug)?.lessons ?? []).map(l => l.id))
  return stage.lessons.filter(l => ids.has(l.id) && l.status === 'completed').length
}

export function stagePercent(stage: Stage) {
  return Math.round((stageCompletedCount(stage) / Math.max(1, stageLessonCount(stage))) * 100)
}

export function stageLearningStatus(stage: Stage, access: boolean): StageStatus {
  if (!access) return 'locked'
  if (stageCompletedCount(stage) === stageLessonCount(stage)) return 'completed'
  return formalLessons(stage.lessons).some(l => l.status === 'completed' || l.status === 'in_progress') ? 'in_progress' : 'not_started'
}

/** 下一节课（用于「下一课」按钮与「下一节」卡片） */
export function nextLessonOf(stage: Stage, lesson: Lesson): Lesson | undefined {
  return stage.lessons.find((l) => l.order === lesson.order + 1 && l.status !== 'locked' && l.isPublished !== false)
}

export function prevLessonOf(stage: Stage, lesson: Lesson): Lesson | undefined {
  return stage.lessons.find((l) => l.order === lesson.order - 1 && l.status !== 'locked' && l.isPublished !== false)
}
