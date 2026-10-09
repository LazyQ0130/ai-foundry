import { db } from '../db.js'
import { capstoneLessons, capstoneTotal } from '../../src/data/capstoneLessons.js'
export async function getCapstoneProgress(userId: string) {
  const [rows, checks] = await db.$transaction([
    db.capstoneLessonProgress.findMany({where:{userId}}), db.capstoneCheck.findMany({where:{userId}}),
  ])
  const lessons = capstoneLessons.filter(l=>l.published)
  const grouped: Record<string, Record<string, boolean>> = {}
  for (const row of checks) if(lessons.some(l=>l.id===row.lessonId&&l.checkKeys.includes(row.checkKey))) (grouped[row.lessonId]??={})[row.checkKey]=row.completed
  const completedLessons=lessons.filter(l=>rows.some(r=>r.lessonId===l.id&&r.status==='COMPLETED')).map(l=>l.id)
  return {completed:completedLessons.length,total:capstoneTotal,completedLessons,checks:grouped,
    inProgressLessons:rows.filter(r=>!completedLessons.includes(r.lessonId)&&lessons.some(l=>l.id===r.lessonId)).map(r=>r.lessonId),
    continueLessonId:lessons.find(l=>!completedLessons.includes(l.id))?.id??null}
}
