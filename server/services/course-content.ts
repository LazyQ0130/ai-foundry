import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { parseLessonContent } from './lesson-parser.js'
import type { Prisma } from '@prisma/client'
import { stages } from '../../src/data/courses.js'
import { db } from '../db.js'
import { ApiError } from '../middleware/error.js'
import { hasStageAccess } from './entitlement.js'

export async function lessonMetadata(lessonId: string, client: Prisma.TransactionClient = db) {
  const stage = stages.find((s) => s.lessons.some((l) => l.id === lessonId))
  const lesson = stage?.lessons.find((l) => l.id === lessonId)
  if (!stage || !lesson) throw new ApiError(404, 'NOT_FOUND', '课程不存在')
  const row = await client.lesson.findUnique({ where: { id: lesson.id }, include: { stage: true } })
  if (!row?.isPublished || !row.stage.isPublished) throw new ApiError(404, 'NOT_FOUND', '课程未发布')
  return { stage, lesson, row }
}
export async function requireLessonAccess(lessonId: string, userId?: string, client: Prisma.TransactionClient = db) {
  const meta = await lessonMetadata(lessonId, client)
  if (meta.row.isPreview) return meta
  if (!userId) throw new ApiError(401, 'UNAUTHORIZED', '请先登录')
  if (!await hasStageAccess(userId, meta.stage.slug, client)) throw new ApiError(403, 'STAGE_ACCESS_REQUIRED', `该课程属于 ${meta.stage.tag}，购买 / 开通后即可学习`)
  return meta
}
export async function readLessonContent(stageSlug: string, lessonId: string) {
  // Inputs are resolved from the trusted catalogue, never interpolated from raw URLs.
  const stage = stages.find((s) => s.slug === stageSlug && s.lessons.some((l) => l.id === lessonId))
  if (!stage) throw new ApiError(404, 'NOT_FOUND', '课程不存在')
  const text = await readFile(path.resolve('course-content', stage.slug, `${lessonId}.md`), 'utf8')
  return parseLessonContent(text)
}
