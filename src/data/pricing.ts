import { planTemplates, type Plan } from './site'
import { curriculumFormalLessonCount } from './courses'
import { useCatalogue } from './catalog'
export function usePlans() {
  const catalogue = useCatalogue()
  // 课时数取母文档目录口径（courses.ts），不随课程发布节奏变化。
  const individual: Plan[] = catalogue.stages.map((stage) => ({ ...planTemplates.find((p) => p.id === stage.slug)!, price: stage.price, isPurchasable: stage.isPurchasable, meta: `包含 ${curriculumFormalLessonCount(stage.slug)} 节课 · 1 个阶段项目` }))
  const total = individual.reduce((sum, p) => sum + p.price, 0)
  const complete = ['stage-1', 'stage-2', 'stage-3', 'stage-4'].every((id) => individual.some((p) => p.id === id && p.isPurchasable))
  const all: Plan = { ...planTemplates.find((p) => p.id === 'all-access')!, price: catalogue.purchase.allAccessPrice, isPurchasable: complete, originPrice: total > catalogue.purchase.allAccessPrice ? total : undefined, saveText: total > catalogue.purchase.allAccessPrice ? `立省 ¥${total - catalogue.purchase.allAccessPrice}` : undefined }
  const project: Plan = { ...planTemplates.find((p) => p.id === 'all-access-projects')!, price: catalogue.purchase.allAccessProjectsPrice, isPurchasable: complete, saveText: catalogue.purchase.allAccessProjectsPrice > catalogue.purchase.allAccessPrice ? `+¥${catalogue.purchase.allAccessProjectsPrice - catalogue.purchase.allAccessPrice} 解锁 Project Lab` : undefined }
  return { ...catalogue, plans: [...individual, ...(complete ? [all, project] : [])] }
}
