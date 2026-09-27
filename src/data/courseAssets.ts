// Public presentation metadata only. Filesystem paths remain server-only.
export const courseAssets = {
  'stage1-starter': {
    title: 'Stage 1 Starter', description: '个人知识工作台的起点项目。',
    filename: 'aifoundry-stage1-starter.zip', format: 'ZIP',
    endpoint: '/api/course-assets/stage1-starter',
  },
} as const
export type CourseAssetId = keyof typeof courseAssets
export function isCourseAssetId(id: string): id is CourseAssetId {
  return Object.prototype.hasOwnProperty.call(courseAssets, id)
}
