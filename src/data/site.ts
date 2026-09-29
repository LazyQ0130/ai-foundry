/** 站点级静态内容：首页模块、学习方式、定价、FAQ、项目详情 */

export const heroStats = [
  { icon: 'layers', value: '4 个学习阶段', desc: '从入门到进阶，系统化成长' },
  { icon: 'box', value: '4 个阶段项目', desc: '每阶段都有可交付的作品' },
  { icon: 'code', value: '29 节正式课程', desc: '按任务、构建、验证逐步学习' },
] as const

export const homeFeatures = [
  {
    icon: 'target',
    title: '项目驱动学习',
    desc: '4 个阶段作品，从简单到复杂，在实践中掌握核心技能。',
  },
  {
    icon: 'focus',
    title: '聚焦真实开发',
    desc: '覆盖前端、后端、RAG、Agent 等主流场景，学完就能用。',
  },
  {
    icon: 'zap',
    title: 'AI 原生方法',
    desc: '不只是传授开发，而是从需求、设计到实现，全面融入 AI 工作流。',
  },
  {
    icon: 'trending',
    title: '清晰的成长路径',
    desc: '4 个阶段循序渐进，每个阶段都有明确的目标和可交付的项目成果。',
  },
] as const

export const homePathSteps = [
  { icon: 'file', title: '任务', desc: '明确学习目标和任务，了解真实的业务场景需求。' },
  { icon: 'sparkles', title: 'Prompt', desc: '学习并编写高质量的 Prompt，驱动 AI 完成任务。' },
  { icon: 'code', title: '构建', desc: '动手开发，结合 AI 工具完成功能实现。' },
  { icon: 'check', title: '检查', desc: '测试和优化，确保应用效果与质量。' },
  { icon: 'send', title: '交付', desc: '完成项目并部署上线，形成可展示的成果。' },
] as const

/* ------------------------------------------------------------------ */
/* 定价                                                                 */
/* ------------------------------------------------------------------ */

export interface PlanFeature {
  text: string
  highlight?: boolean
}

export interface Plan {
  id: string
  tag: string
  title: string
  desc: string
  price: number
  isPurchasable?: boolean
  originPrice?: number
  saveText?: string
  badge?: string
  /** 卡片顶部的强调色 */
  accent: 'emerald' | 'blue' | 'violet' | 'orange' | 'brand'
  meta: string
  features: PlanFeature[]
  cta: string
  featured?: boolean
}

export const planTemplates: Omit<Plan, 'price'>[] = [
  {
    id: 'stage-1',
    tag: '阶段 1',
    title: 'AI 原生开发入门',
    desc: '掌握 AI 工具使用方法，通过第一个 AI 辅助项目，快速上手 AI 原生开发。',
    accent: 'emerald',
    meta: '包含 6 节课 · 1 个阶段项目',
    features: [
      { text: '第一次让 AI 改真实项目' },
      { text: '需求描述与结果验证' },
      { text: 'Debug、Git 保存与恢复' },
      { text: 'Stage 1 Next.js Starter' },
      { text: '课程内排查建议' },
    ],
    cta: '立即购买',
  },
  {
    id: 'stage-2',
    tag: '阶段 2',
    title: 'AI 全栈开发',
    desc: '学习使用现代技术栈，结合 AI 能力构建完整的全栈应用。',
    accent: 'blue',
    meta: '包含 8 节课 · 1 个阶段项目',
    features: [
      { text: '同一个 Next.js 项目持续演进' },
      { text: 'API、Prisma 与云 PostgreSQL' },
      { text: '注册登录与权限隔离' },
      { text: '部署到 Vercel 上线' },
      { text: '课程内排查建议' },
    ],
    cta: '立即购买',
  },
  {
    id: 'stage-3',
    tag: '阶段 3',
    title: 'AI 应用开发',
    desc: '深入 RAG、知识库、数据处理等技术，构建专业的 AI 应用。',
    accent: 'violet',
    meta: '包含 7 节课 · 1 个阶段项目',
    features: [
      { text: '真实模型 API 低预算接入' },
      { text: '结构化输出与流式体验' },
      { text: 'pgvector 向量检索与 RAG' },
      { text: '引用来源与效果评估' },
      { text: '课程内排查建议' },
    ],
    cta: '立即购买',
  },
  {
    id: 'stage-4',
    tag: '阶段 4',
    title: 'Agent 工程进阶',
    desc: '掌握 Agent 设计与多工具协作，构建更强大的自主 AI 智能体。',
    accent: 'orange',
    meta: '包含 8 节课 · 1 个阶段项目',
    features: [
      { text: 'Agent Loop 与多步 Workflow' },
      { text: '只读 Tool 与写操作确认' },
      { text: 'MCP 统一工具接入' },
      { text: '暂停恢复与安全评估' },
      { text: '课程内排查建议' },
    ],
    cta: '立即购买',
  },
  {
    id: 'all-access',
    tag: '全套课程',
    title: '从入门到进阶',
    desc: '一次解锁全部 4 个阶段的课程，系统掌握 AI 开发的完整能力。',
    badge: '最受欢迎',
    accent: 'brand',
    meta: '包含 29 节正式课 · 4 个阶段项目',
    features: [
      { text: '包含全部 4 个阶段课程', highlight: true },
      { text: '第 0 课开始前准备 + 4 次阶段自检' },
      { text: '4 个阶段项目持续演进' },
      { text: '持续免费更新' },
      { text: '配套源码与学习资料' },
      { text: '课程内排查建议' },
      { text: '跨设备学习进度记录' },
    ],
    cta: '立即购买',
    featured: true,
  },
]

export const pricingHighlights = [
  { icon: 'path', title: '系统的学习路径', desc: '从基础到进阶，循序渐进' },
  { icon: 'gem', title: '真实的项目实战', desc: '4 个阶段项目' },
  { icon: 'refresh', title: '持续更新的内容', desc: '跟随 AI 技术的发展同步更新' },
  { icon: 'users', title: '清晰的任务反馈', desc: '完成清单后再进入下一课' },
] as const

export const compareRows: { label: string; values: string[]; check?: boolean[] }[] = [
  { label: '包含课程内容', values: ['阶段 1', '阶段 2', '阶段 3', '阶段 4', '全部 4 个阶段'] },
  { label: '阶段项目', values: ['1 个', '1 个', '1 个', '1 个', '4 个'] },
  { label: '是否永久开放阅读', values: ['是', '是', '是', '是', '是'], check: [true, true, true, true, true] },
  { label: '是否包含更新', values: ['是', '是', '是', '是', '是'], check: [true, true, true, true, true] },
  {
    label: '是否支持分阶段购买',
    values: ['是', '是', '是', '是', '—'],
    check: [true, true, true, true, false],
  },
  {
    label: '适合人群',
    values: ['初学者', '有一定基础的开发者', '希望构建专业 AI 应用的开发者', '希望深入 Agent 开发的开发者', '系统学习，全面提升'],
  },
]

/* ------------------------------------------------------------------ */
/* 项目详情                                                             */
/* ------------------------------------------------------------------ */

export interface ProjectTask {
  title: string
}

export interface ProjectDetail {
  id: string
  stageId: number
  stageTag: string
  stageTitle: string
  title: string
  desc: string
  difficulty: string
  duration: string
  supportTemplate: boolean
  goalsIntro: string
  goals: { icon: 'search' | 'database' | 'build' | 'deploy'; title: string; desc: string }[]
  featuresIntro: string
  features: { title: string; desc: string }[]
  extensionsIntro: string
  extensions: string[]
  standardsIntro: string
  standards: string[]
  deliverIntro: string
  deliverables: string[]
  githubTips: string[]
  tasks: ProjectTask[]
  startDate: string
  dueDate: string
  remain: string
  resources: { kind: string; title: string; meta: string }[]
}

export const projects: ProjectDetail[] = [
  {
    id: 'rag',
    stageId: 3,
    stageTag: '阶段 3',
    stageTitle: 'AI 应用开发',
    title: 'RAG 知识库项目',
    desc: '在全栈知识工作台上加入资料索引、RAG 问答、引用来源和评估能力，打造一个真正基于自己资料的 AI 应用。',
    difficulty: '中级难度',
    duration: '预计 3-5 天',
    supportTemplate: true,
    goalsIntro:
      '掌握 RAG（检索增强生成）的核心原理，独立完成一个可用的知识库应用，能够上传本地文档、进行向量化存储，并基于用户问题进行语义检索与生成回答。',
    goals: [
      { icon: 'search', title: '理解 RAG 原理', desc: '掌握检索 + 生成的实现思路' },
      { icon: 'database', title: '掌握向量数据库', desc: '学会使用向量数据库进行文档检索' },
      { icon: 'build', title: '构建完整应用', desc: '从后端到前端完成实现' },
      { icon: 'deploy', title: '具备工程化能力', desc: '实现可部署、可扩展的知识库应用' },
    ],
    featuresIntro: '完成以下核心功能，构建一个完整可用的 RAG 知识库应用。',
    features: [
      { title: '文档上传与解析', desc: '支持常见格式（PDF、DOCX、TXT 等）的文档上传与解析' },
      { title: '向量化存储', desc: '将文档切分并生成向量，存入向量数据库' },
      { title: '基于知识的问答', desc: '用户输入问题，基于检索结果调用大模型生成回答' },
      { title: '知识库管理', desc: '支持文档的查看、删除与重新索引' },
      { title: '引用来源展示', desc: '在回答中展示引用的文档片段和来源' },
      { title: '简洁的前端界面', desc: '提供友好的对话界面和知识库管理页面' },
    ],
    extensionsIntro: '在完成必做功能的基础上，尝试以下扩展功能，让你的项目更加出色。',
    extensions: [
      '支持多知识库管理（如按部门或项目分类）',
      '支持网页内容抓取并加入知识库',
      '实现流式输出，提升用户体验',
      '增加权限控制（如仅登录用户可访问）',
      '优化检索策略（如混合检索、重排序）',
      '部署到云服务器，生成可公开访问的链接',
      '完善文档管理功能（如批量操作、版本控制）',
    ],
    standardsIntro: '当你满足以下标准时，即可认为完成了本项目。',
    standards: [
      '成功上传至少 3 个文档并完成向量化存储',
      '能够基于文档内容回答用户问题，且回答准确',
      '在回答中正确展示引用来源',
      '具备基本的知识库管理功能',
    ],
    deliverIntro: '把项目整理成一份可以展示的成果，便于写进简历或作品集。',
    deliverables: [
      '可公开访问的在线演示链接',
      '结构清晰的 GitHub 仓库与 README',
      '一段 1-2 分钟的演示视频或 GIF',
      '一篇复盘：遇到什么问题、怎么解决的',
    ],
    githubTips: [
      'README 里说明技术选型、架构图和本地启动方式',
      '把提示词、切分参数等配置抽到 .env.example',
      '不要提交任何 API Key 与真实业务文档',
    ],
    tasks: [
      { title: '搭建项目开发环境' },
      { title: '实现文档上传与解析' },
      { title: '集成向量数据库' },
      { title: '实现向量化存储' },
      { title: '开发问答接口' },
      { title: '实现前端对话界面' },
      { title: '添加引用来源展示' },
      { title: '完善知识库管理功能' },
      { title: '部署到云服务器' },
      { title: '撰写项目总结' },
    ],
    startDate: '2026-09-22',
    dueDate: '2026-09-29',
    remain: '2 天',
    resources: [
      { kind: '课程', title: '让资料变成可以检索的向量', meta: '1 小时' },
      { kind: '课程', title: '做出第一条完整 RAG 链路', meta: '1 小时' },
      { kind: '项目', title: 'RAG 知识库项目（本阶段项目）', meta: '3-5 天' },
    ],
  },
  {
    id: 'assistant',
    stageId: 1,
    stageTag: '阶段 1',
    stageTitle: 'AI 原生开发入门',
    title: '个人知识工作台',
    desc: '在 Stage 1 的 Next.js Starter 上，做出一个带搜索、筛选和你自己定义功能的小型前端产品。这是你带着 AI 完成的第一个完整小产品。',
    difficulty: '入门难度',
    duration: '预计 1-2 天',
    supportTemplate: true,
    goalsIntro:
      '完整走一遍「想清楚要什么 → 让 AI 动手 → 看它改了什么 → 亲手验证」的闭环，形成第一次独立做出功能的经验。',
    goals: [
      { icon: 'build', title: '跑通完整闭环', desc: '从想法到可运行的小产品' },
      { icon: 'search', title: '学会描述需求', desc: '把「我想要」说成 AI 能做对的需求' },
      { icon: 'database', title: '看懂改动范围', desc: '知道 AI 改了哪个文件、为什么是它' },
      { icon: 'deploy', title: '验证与交付', desc: '亲手验证结果，保存可恢复的阶段版本' },
    ],
    featuresIntro: '完成以下核心功能，即可得到一个可用的个人知识工作台。',
    features: [
      { title: '资料卡片', desc: '展示你收集的资料，包含标题、简介与分类标签' },
      { title: '搜索', desc: '按关键字快速过滤资料' },
      { title: '筛选', desc: '按标签或重要程度筛选内容' },
      { title: '一个自己的功能', desc: '至少有一个功能不是照抄教程，而是由你自己决定' },
    ],
    extensionsIntro: '在完成必做功能的基础上，可以继续尝试：',
    extensions: ['给卡片加收藏标记', '支持自定义分类', '给资料加备注', '做一个「随手记」入口'],
    standardsIntro: '请亲自核对以下交付要求；平台不会自动验收项目。',
    standards: [
      '项目可以在本地正常启动',
      '搜索和筛选真实可用，不是摆设',
      '至少有一个功能由你自己决定并完成',
      '亲自操作并验证搜索、筛选和自己的功能',
      '本地 Git 中保存了可恢复的完成版本，版本说明由自己写',
    ],
    deliverIntro: '完成阶段要求后，如想对外展示作品，可以再整理材料。',
    deliverables: ['进一步优化 README，说明使用方式和自己增加的功能', '制作一段演示录屏，展示实际操作'],
    githubTips: ['可以把项目放到 GitHub，方便分享', '分享前确认项目能在本地正常启动', '不要提交密钥或私人资料'],
    tasks: [
      { title: '用第 0 课的 Starter 跑通本地运行' },
      { title: '实现并验证搜索与筛选' },
      { title: '决定并完成至少一个自己的功能' },
      { title: '亲自验证最终结果和组合操作' },
      { title: '在本地 Git 保存可恢复的完成版本' },
    ],
    startDate: '2026-09-20',
    dueDate: '2026-09-22',
    remain: '已完成',
    resources: [
      { kind: '课程', title: '第一次让 AI 改一个真实项目', meta: '15 分钟' },
      { kind: '课程', title: '独立带 AI 做一个自己的功能', meta: '40 分钟' },
    ],
  },
  {
    id: 'fullstack',
    stageId: 2,
    stageTag: '阶段 2',
    stageTitle: 'AI 全栈开发',
    title: '全栈知识工作台',
    desc: '把 Stage 1 的个人知识工作台升级成有真实数据库、账号系统、个人数据和线上地址的完整 Web 产品。完成后你将拥有一个可部署上线的全栈应用。',
    difficulty: '中级难度',
    duration: '预计 5-7 天',
    supportTemplate: false,
    goalsIntro: '打通前端、API、数据库、账号与权限的完整链路，具备独立开发可部署全栈应用的能力。',
    goals: [
      { icon: 'build', title: '完成全栈闭环', desc: '前端、后端、数据库真正连起来' },
      { icon: 'database', title: '设计数据模型', desc: '完成完整的增删改查' },
      { icon: 'search', title: '账号与权限', desc: '真实注册登录，并由服务端隔离每个人的资料' },
      { icon: 'deploy', title: '部署上线', desc: '生成可公开访问的链接' },
    ],
    featuresIntro: '完成以下核心功能，把工作台升级成真正的全栈产品。',
    features: [
      { title: 'API 与数据流', desc: '建立 POST API，理解请求、响应与 JSON' },
      { title: '数据库持久化', desc: 'Prisma + 云 PostgreSQL，数据重启后依然存在' },
      { title: '资料 CRUD', desc: '创建、查看、编辑、删除自己的资料' },
      { title: '注册与登录', desc: '真实账号、服务端会话与退出' },
      { title: '资源所有权隔离', desc: '服务端限制用户只能操作自己的资料' },
      { title: '失败状态', desc: 'Loading、Empty、Error、Validation 都有清晰反馈' },
      { title: '部署上线', desc: '部署到 Vercel 并配置生产数据库' },
    ],
    extensionsIntro: '在完成必做功能的基础上，可以继续尝试：',
    extensions: ['支持协同编辑', '支持导出 Markdown', '增加操作日志', '接入邮件通知'],
    standardsIntro: '满足以下标准即视为完成。',
    standards: [
      '页面通过真实 API 提交资料，并用 Prisma + PostgreSQL 保存和重新读取',
      '能完整地增删改查资料数据',
      '能注册登录、刷新后保持会话，并真实退出',
      '不同账号只能查看和操作自己的资料，异常与输入错误有清晰反馈',
      '项目已完成数据库迁移和部署，可在可达网络通过链接复验核心功能；所在地可访问性单独记录',
    ],
    deliverIntro: '整理成一份可展示的成果。',
    deliverables: ['在线演示链接', 'GitHub 仓库与 README', '架构说明与接口文档'],
    githubTips: ['README 附上架构图', '区分 dev / prod 环境变量', '提交前跑一次完整流程自测'],
    tasks: [
      { title: '读懂同一个项目的全栈结构' },
      { title: '建立第一条 POST API' },
      { title: '接入云 PostgreSQL 与 Prisma' },
      { title: '完成资料 CRUD' },
      { title: '实现注册登录与资源隔离' },
      { title: '补齐失败状态' },
      { title: '部署上线' },
    ],
    startDate: '2026-09-23',
    dueDate: '2026-10-02',
    remain: '进行中',
    resources: [
      { kind: '课程', title: '浏览器怎么把数据交给服务端', meta: '45 分钟' },
      { kind: '课程', title: '让数据刷新和重启以后还存在', meta: '1 小时' },
    ],
  },
  {
    id: 'agent',
    stageId: 4,
    stageTag: '阶段 4',
    stageTitle: 'Agent 工程进阶',
    title: 'AI 研究 Agent',
    desc: '把 RAG 知识库升级成可以调用工具、经过人工确认、支持多步任务与恢复的 AI 研究 Agent。完成后你将拥有一个真正可控的 Agent 产品。',
    difficulty: '高级难度',
    duration: '预计 7-10 天',
    supportTemplate: false,
    goalsIntro: '掌握 Agent Loop、工具调用与工作流编排，能够交付一个可控、可恢复的 Agent 产品。',
    goals: [
      { icon: 'build', title: '实现 Agent Loop', desc: '让 Agent 自主规划并执行任务' },
      { icon: 'search', title: '设计工具 Schema', desc: '让 Agent 稳定调用外部能力' },
      { icon: 'database', title: '管理运行状态', desc: '支持重试、恢复与人工确认' },
      { icon: 'deploy', title: '评估与运维', desc: '建立评估方式并部署上线' },
    ],
    featuresIntro: '完成以下核心功能，构建一个受控、可恢复的 Agent 产品。',
    features: [
      { title: 'Agent Loop', desc: '最小决策循环，模型可以选择回答或提出动作' },
      { title: '只读 Tool', desc: '调用「搜索我的知识库」等只读工具' },
      { title: '写操作确认', desc: '高风险写操作必须经人工确认，参数不可偷换' },
      { title: 'MCP 接入', desc: '用 MCP 统一接入受限的只读工具' },
      { title: '多步 Workflow', desc: '任务拆成多个 Step，状态清晰、失败不无限重试' },
      { title: '暂停与恢复', desc: '任务状态持久化，中断后从正确节点继续' },
    ],
    extensionsIntro: '在完成必做功能的基础上，可以继续尝试：',
    extensions: ['接入 MCP 生态工具', '支持自定义工具插件', '增加成本与调用统计', '实现 Agent 评估集'],
    standardsIntro: '满足以下标准即视为完成。',
    standards: [
      'Agent 能自主完成一个多步骤任务',
      '能正确调用至少 3 个工具',
      '任务中断后可以恢复继续执行',
      '服务已部署并可访问',
    ],
    deliverIntro: '整理成一份可展示的成果。',
    deliverables: ['在线演示链接', 'GitHub 仓库与 README', 'Agent 运行轨迹截图'],
    githubTips: ['README 说明 Agent 架构与工具清单', '记录失败重试策略', '不要提交密钥'],
    tasks: [
      { title: '实现最小 Agent Loop' },
      { title: '接入第一个只读 Tool' },
      { title: '实现写操作人工确认' },
      { title: '接入 MCP 只读工具' },
      { title: '拆出多步 Workflow 并持久化状态' },
      { title: '完成安全评估' },
      { title: '部署上线' },
    ],
    startDate: '—',
    dueDate: '—',
    remain: '未开通',
    resources: [
      { kind: '课程', title: '从 AI 应用到 Agent：让模型开始「行动」', meta: '45 分钟' },
      { kind: '课程', title: '用 MCP 把工具接入方式统一起来', meta: '45 分钟' },
    ],
  },
]

export function getProject(id: string) {
  return projects.find((p) => p.id === id)
}
