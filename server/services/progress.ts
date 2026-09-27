import { db } from '../db.js'
import { stages, formalLessons, curriculumFormalLessonCount } from '../../src/data/courses.js'

export async function getProgress(userId: string) {
  const [progress, checks, entitlements, published] = await db.$transaction([
    db.lessonProgress.findMany({ where: { userId }, orderBy: { lastVisitedAt: 'desc' } }),
    db.lessonCheck.findMany({ where: { userId } }),
    db.entitlement.findMany({ where: { userId, status: 'ACTIVE' }, include: { stage: true } }),
    db.lesson.findMany({ where: { isPublished: true, stage: { isPublished: true } } }),
  ])
  const owned = new Set(entitlements.map((e) => e.stage.slug))
  // 第 0 课（isPrep）不计入完成率与「下一课」推导。
  const entries = stages.flatMap((stage) => stage.lessons.filter((l) => !l.isPrep).map((lesson) => ({ stageSlug: stage.slug, lessonId: lesson.id })))
  const available = entries.filter((entry) => { const flag = published.find((l) => l.id === entry.lessonId); return flag && (flag.isPreview || owned.has(entry.stageSlug)) })
  const completed = new Set(progress.filter((p) => p.status === 'COMPLETED').map((p) => p.lessonId))
  const recentUnfinished = progress.find((p) => p.status === 'IN_PROGRESS' && available.some((l) => l.lessonId === p.lessonId))
  const recentFinished = progress.filter((p) => p.status === 'COMPLETED' && available.some((l) => l.lessonId === p.lessonId)).sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())[0]
  const next = recentFinished ? available.slice(available.findIndex((l) => l.lessonId === recentFinished.lessonId) + 1).find((l) => !completed.has(l.lessonId)) : undefined
  const lastLesson = available.find((l) => l.lessonId === recentUnfinished?.lessonId) ?? next ?? available.find((l) => !completed.has(l.lessonId)) ?? null
  const grouped: Record<string, Record<string, boolean>> = {}
  for (const row of checks) { (grouped[row.lessonId] ??= {})[row.checkKey] = row.completed }
  return {
    completedLessons: [...completed], inProgressLessons: progress.filter((p) => p.status === 'IN_PROGRESS').map((p) => p.lessonId),
    checks: grouped, lastLesson,
    formalProgress: { completed: entries.filter(l => completed.has(l.lessonId)).length, total: curriculumFormalLessonCount() },
    stageProgress: Object.fromEntries(stages.map((s) => { const lessons = formalLessons(s.lessons); const done = lessons.filter((l) => completed.has(l.id)).length; return [s.slug, { completed: done, total: lessons.length, percent: lessons.length ? Math.round(done / lessons.length * 100) : 0 }] })),
  }
}
