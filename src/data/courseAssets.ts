// Public presentation metadata only. Filesystem paths remain server-only.
export const courseAssets = {
  'stage1-starter': {
    title: 'Stage 1 Starter', description: '个人知识工作台的起点项目。',
    filename: 'aifoundry-stage1-starter.zip', format: 'ZIP',
    endpoint: '/api/course-assets/stage1-starter',
  },
  'stage3-starter': {
    title: 'Stage 3 Starter', description: 'Stage 2 完成状态的干净全栈知识工作台。',
    filename: 'aifoundry-stage3-starter.zip', format: 'ZIP',
    endpoint: '/api/course-assets/stage3-starter',
  },
  'stage4-starter': {
    title: 'Stage 4 Starter', description: 'AI 知识工作台的 Stage 4 起点项目。',
    filename: 'aifoundry-stage4-starter.zip', format: 'ZIP',
    endpoint: '/api/course-assets/stage4-starter',
  },
} as const
export type CourseAssetId = keyof typeof courseAssets
export function isCourseAssetId(id: string): id is CourseAssetId {
  return Object.prototype.hasOwnProperty.call(courseAssets, id)
}
