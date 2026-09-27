/** Metadata is separate from the protected Markdown body. Checklist keys are durable. */
export interface LessonMeta {
  estimatedTime: string
  difficulty: string
  objective: string
  checklist: string[]
  checkKeys: string[]
}

export interface LessonContent {
  meta: LessonMeta
  body: string
}
