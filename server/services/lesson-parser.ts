import { parseDocument } from 'yaml'
import { z } from 'zod'
import type { LessonContent } from '../../src/data/lessonContent.js'
import { validateLessonMarkdown } from '../../src/lib/lessonMarkdown.js'

const text = z.string().trim().min(1)
export const lessonMetaSchema = z.object({
  estimatedTime: text, difficulty: text, objective: text,
  checklist: z.array(text).min(1).max(50),
  checkKeys: z.array(z.string().regex(/^check-[a-f0-9]{16}$/)).min(1).max(50),
}).strict().refine(meta => meta.checklist.length === meta.checkKeys.length && new Set(meta.checkKeys).size === meta.checkKeys.length,
  'checklist 与 checkKeys 必须数量一致，且 key 不重复')

export function parseLessonContent(source: string): LessonContent {
  if (source.length > 200_000) throw new Error('课程文件过大')
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error('课程必须使用 YAML frontmatter + Markdown 正文')
  const document = parseDocument(match[1], { schema: 'core', uniqueKeys: true })
  if (document.errors.length || document.warnings.length) throw new Error('无效的课程 frontmatter')
  const meta = lessonMetaSchema.parse(document.toJS({ maxAliasCount: 0 }))
  const body = text.parse(match[2])
  validateLessonMarkdown(body)
  return { meta, body }
}
