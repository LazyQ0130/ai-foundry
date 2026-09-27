export interface ConceptItem {
  title: string
  desc: string
}

export interface PromptItem {
  intro: string
  code: string
  note?: string
}

export interface LessonContent {
  estimatedTime: string
  difficulty: string
  /** 本课任务 */
  task: { intro: string; outcome: string[] }
  /** 为什么要做这个 */
  why: string
  /** 核心概念 */
  concepts: ConceptItem[]
  /** 参考提示词（单提示词课程） */
  prompt?: PromptItem
  /** 参考提示词（多提示词课程，如两次小修改） */
  prompts?: PromptItem[]
  /** 动手检查 */
  check: string[]
  /** 卡住了？ */
  stuck: string
  /** 右侧工作台：本课目标 */
  objective: string
  /** 右侧工作台：学习任务清单 */
  checklist: string[]
  checkKeys: string[]
  /** 正文：开始任务 */
  todo?: string[]
  /** 深入了解（默认折叠） */
  deepDive?: { title: string; body: string }
  /** 安全提醒 */
  warning?: string
}

/** 渲染用：统一为提示词列表 */
export function lessonPrompts(content: LessonContent): PromptItem[] {
  return content.prompts ?? (content.prompt ? [content.prompt] : [])
}
