// Public presentation metadata only. Filesystem paths remain server-only.
export const courseAssets = {
  'stage2-tools': { title: 'Stage 2 验收工具', description: '在自己的本机知识工作台验证 Cookie、Session、双账号和 Origin。只复制 scripts，不替换项目。', filename: 'aifoundry-stage2-tools.zip', format: 'ZIP', endpoint: '/api/course-assets/stage2-tools' },
  'stage3-tools': { title: 'Stage 3 验收工具', description: '本机 HTTP 边界检查与 RAG 评估配置加载入口；评估 Runner 仍由本课实现。', filename: 'aifoundry-stage3-tools.zip', format: 'ZIP', endpoint: '/api/course-assets/stage3-tools' },
  'stage4-tools': { title: 'Stage 4 验收工具', description: '指定本机评估库的准备与 Agent Eval 启动入口，不改日常学习库配置。', filename: 'aifoundry-stage4-tools.zip', format: 'ZIP', endpoint: '/api/course-assets/stage4-tools' },
  'capstone-starter': { title:'毕业项目 Starter', description:'AI 研究工作台的起点、空白模板、Bootstrap 测试与本地数据库/私有存储配置。',filename:'aifoundry-capstone-starter.zip',format:'ZIP',endpoint:'/api/course-assets/capstone-starter' },
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
