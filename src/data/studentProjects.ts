export type StudentProject = {
  id: string
  title: string
  category: string
  description: string
  features: readonly string[]
  tags: readonly string[]
  image: string
  thumbnail: string
}

export const studentProjects: readonly StudentProject[] = [
  {
    id: 'academic-assistant',
    title: 'AI 学术助手',
    category: 'AI 应用开发',
    description: '把散落的论文与资料，变成随时可以提问的个人知识库。',
    features: ['上传 PDF，建立学术资料库', '基于 RAG 检索与对话问答', '引用溯源，让答案有据可查'],
    tags: ['RAG', 'PDF 解析', '引用溯源'],
    image: '/images/student-projects/01-academic-assistant.webp',
    thumbnail: '/images/student-projects/01-academic-assistant-thumb.webp',
  },
  {
    id: 'campus-marketplace',
    title: '校园二手交易平台',
    category: '校园生活',
    description: '让闲置好物在校园里流转，连接有需要的同学。',
    features: ['发布闲置商品，管理个人信息', '分类筛选与关键词搜索', '收藏心仪商品，查看交易动态'],
    tags: ['校园闲置', '分类检索', '商品收藏'],
    image: '/images/student-projects/02-campus-marketplace.webp',
    thumbnail: '/images/student-projects/02-campus-marketplace-thumb.webp',
  },
  {
    id: 'plant-care',
    title: '植物识别与养护助手',
    category: 'AI 生活助手',
    description: '从认识一株植物开始，让每一次养护都有迹可循。',
    features: ['拍照识别，了解植物与生长习性', '记录植物生长，建立专属档案', '养护日历与浇水施肥提醒'],
    tags: ['图像识别', '植物档案', '养护提醒'],
    image: '/images/student-projects/03-plant-care.webp',
    thumbnail: '/images/student-projects/03-plant-care-thumb.webp',
  },
  {
    id: 'course-analytics',
    title: '课程成绩分析系统',
    category: '数据可视化',
    description: '把一张成绩单，变成看得懂的学习趋势与成长记录。',
    features: ['导入课程成绩，汇总学分与绩点', '多维图表呈现成绩与能力分布', '对比学期变化，发现提升空间'],
    tags: ['绩点统计', '学期对比', '能力雷达'],
    image: '/images/student-projects/04-course-analytics.webp',
    thumbnail: '/images/student-projects/04-course-analytics-thumb.webp',
  },
  {
    id: 'habit-tracker',
    title: '习惯养成与自律打卡',
    category: '效率工具',
    description: '把想做的事放进每一天，用清晰的记录看见自己的坚持。',
    features: ['创建个人习惯，完成每日打卡', '追踪连续天数与目标进度', '用日历和热力图回顾成长'],
    tags: ['打卡日历', '连续天数', '热力图'],
    image: '/images/student-projects/05-habit-tracker.webp',
    thumbnail: '/images/student-projects/05-habit-tracker-thumb.webp',
  },
  {
    id: 'personal-blog',
    title: '个人博客与作品集',
    category: '个人创作',
    description: '给学习笔记、生活灵感和自己的作品，留一个长期更新的空间。',
    features: ['撰写与管理 Markdown 文章', '分类标签与文章检索', '展示个人项目与开发经历'],
    tags: ['Markdown', '内容创作', '作品集'],
    image: '/images/student-projects/06-personal-blog.webp',
    thumbnail: '/images/student-projects/06-personal-blog-thumb.webp',
  },
  {
    id: 'smart-accounting',
    title: '智能记账与消费分析',
    category: '生活管理',
    description: '从每一笔小支出开始，了解自己的消费习惯与预算去向。',
    features: ['快速记录日常收入与支出', '管理分类预算，追踪使用进度', '查看消费占比与收支变化趋势'],
    tags: ['分类记账', '预算管理', '消费趋势'],
    image: '/images/student-projects/07-smart-accounting.webp',
    thumbnail: '/images/student-projects/07-smart-accounting-thumb.webp',
  },
  {
    id: 'research-agent',
    title: 'AI 研究 Agent',
    category: 'Agent 开发',
    description: '让 AI 围绕研究问题查找资料、整理证据，逐步完成一份研究报告。',
    features: ['拆解研究问题，规划多步任务', '调用工具，检索本地与外部资料', '生成带引用的报告，支持人工审核'],
    tags: ['MCP', '工具调用', '人工审核'],
    image: '/images/student-projects/08-research-agent.webp',
    thumbnail: '/images/student-projects/08-research-agent-thumb.webp',
  },
]
