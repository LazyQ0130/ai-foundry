import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Prisma } from '@prisma/client'
import { db } from '../db.js'
import { ApiError } from '../middleware/error.js'
import { hasProductAccess, PROJECT_LAB_KEY } from './entitlement.js'
import { capstoneLesson } from '../../src/data/capstoneLessons.js'
import { parseLessonContent } from './lesson-parser.js'

export function requireCapstoneLesson(id: string) {
  const lesson = capstoneLesson(id)
  if (!lesson) throw new ApiError(404, 'NOT_FOUND', 'Project Lab 课程不存在或未发布')
  return lesson
}
export async function requireCapstoneAccess(userId?: string, client: Prisma.TransactionClient = db) {
  if (!userId || (await client.user.findUnique({where:{id:userId},select:{status:true}}))?.status !== 'ACTIVE')
    throw new ApiError(401, 'UNAUTHORIZED', '请先登录')
  // Admin follows the same explicit ProductEntitlement rule; no role bypass.
  if (!await hasProductAccess(userId, PROJECT_LAB_KEY, client)) throw new ApiError(403, 'PROJECT_LAB_ACCESS_REQUIRED', '需要 Project Lab 权益')
}
export async function readCapstoneContent(id: string) {
  const lesson = requireCapstoneLesson(id)
  const content = parseLessonContent(await readFile(path.resolve(lesson.contentPath), 'utf8'))
  if (JSON.stringify(content.meta.checkKeys) !== JSON.stringify(lesson.checkKeys)) throw new Error('CAPSTONE_CATALOGUE_MISMATCH')
  return content
}
export async function getCapstoneContent(id: string, userId?: string) {
  const lesson = requireCapstoneLesson(id)
  await requireCapstoneAccess(userId)
  return {lesson:{id:lesson.id,title:lesson.title,order:lesson.order},content:await readCapstoneContent(lesson.id)}
}
