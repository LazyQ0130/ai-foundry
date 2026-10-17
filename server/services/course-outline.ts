import type { Stage } from '../../src/data/courses.js'

/** Only the server may return full learning outlines, after checking stage rights. */
export function catalogueStage(stage: Stage, outlineAccess: boolean): Stage {
  return {
    ...stage,
    outlineAccess,
    enterState: outlineAccess ? stage.enterState : '开通本阶段后查看学习起点',
    exitState: outlineAccess ? stage.exitState : '开通本阶段后查看学习目标',
    checkpoints: outlineAccess ? stage.checkpoints : [],
    lessons: stage.lessons.map(lesson => outlineAccess || (lesson.isPreview && lesson.isPublished !== false) ? { ...lesson } : {
      id: lesson.id, code: lesson.code, order: lesson.order,
      title: `第 ${lesson.code} 课`, desc: '开通本阶段后查看逐课内容', duration: '',
      status: 'locked', isPreview: false, isPublished: lesson.isPublished, isPrep: lesson.isPrep,
    }),
  }
}
