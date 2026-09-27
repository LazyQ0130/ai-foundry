import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import { stages } from '../../src/data/courses.js'
import { db } from '../db.js'
import { ApiError } from '../middleware/error.js'
import { hasStageAccess } from './entitlement.js'

const promptSchema = z.object({ intro: z.string(), code: z.string(), note: z.string().optional() })

export const contentSchema = z.object({
  estimatedTime: z.string(), difficulty: z.string(), task: z.object({ intro: z.string(), outcome: z.array(z.string()) }),
  why: z.string(), concepts: z.array(z.object({ title: z.string(), desc: z.string() })),
  /** 单提示词课程（兼容旧结构） */
  prompt: promptSchema.optional(),
  /** 多提示词课程；与 prompt 至少提供一个 */
  prompts: z.array(promptSchema).optional(),
  check: z.array(z.string()), stuck: z.string(), objective: z.string(), checklist: z.array(z.string()), checkKeys: z.array(z.string().regex(/^check-[a-f0-9]{16}$/)),
  todo: z.array(z.string()).optional(), deepDive: z.object({ title: z.string(), body: z.string() }).optional(), warning: z.string().optional(),
}).refine((c) => c.checkKeys.length === c.checklist.length && new Set(c.checkKeys).size === c.checkKeys.length)
// 提示词不是必需项：环境准备课（第 0 课）没有 Prompt。

/** 渲染用：统一为提示词列表 */
export function lessonPrompts(content: z.infer<typeof contentSchema>) {
  return content.prompts ?? (content.prompt ? [content.prompt] : [])
}

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
  const block = text.match(/```json\r?\n([\s\S]*?)\r?\n```/)
  if (!block) throw new Error('Invalid lesson content')
  return contentSchema.parse(JSON.parse(block[1]))
}
