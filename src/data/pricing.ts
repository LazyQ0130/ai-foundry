import { planTemplates, type Plan } from './site'
import { curriculumFormalLessonCount } from './courses'
import { useCatalogue } from './catalog'
export function usePlans() {
  const catalogue = useCatalogue()
  // 课时数取母文档目录口径（courses.ts），不随课程发布节奏变化。
  const individual: Plan[] = catalogue.stages.map((stage) => ({ ...planTemplates.find((p) => p.id === stage.slug)!, price: stage.price, isPurchasable: stage.isPurchasable, meta: `包含 ${curriculumFormalLessonCount(stage.slug)} 节课 · 1 个阶段项目` }))
  const total = individual.reduce((sum, p) => sum + p.price, 0)
  const all: Plan = { ...planTemplates.find((p) => p.id === 'all-access')!, price: catalogue.purchase.allAccessPrice, isPurchasable: individual.length === 4 && individual.every((p) => p.isPurchasable), originPrice: total > catalogue.purchase.allAccessPrice ? total : undefined, saveText: total > catalogue.purchase.allAccessPrice ? `立省 ¥${total - catalogue.purchase.allAccessPrice}` : undefined }
  return { ...catalogue, plans: [...individual, ...(individual.length === 4 ? [all] : [])] }
}
