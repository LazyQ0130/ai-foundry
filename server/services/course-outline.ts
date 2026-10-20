import type { Stage } from '../../src/data/courses.js'

/** Lesson names are public; only the server returns paid outlines after checking stage rights. */
export function catalogueStage(stage: Stage, outlineAccess: boolean): Stage {
  return {
    ...stage,
    outlineAccess,
    enterState: outlineAccess ? stage.enterState : '开通本阶段后查看学习起点',
    exitState: outlineAccess ? stage.exitState : '开通本阶段后查看学习目标',
    checkpoints: outlineAccess ? stage.checkpoints : [],
    lessons: stage.lessons.map(lesson => outlineAccess || (lesson.isPreview && lesson.isPublished !== false) ? { ...lesson } : {
      id: lesson.id, code: lesson.code, order: lesson.order,
      title: lesson.title, desc: '', duration: '',
      status: 'locked', isPreview: false, isPublished: lesson.isPublished, isPrep: lesson.isPrep,
    }),
  }
}
