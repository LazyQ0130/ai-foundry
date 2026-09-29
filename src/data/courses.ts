/**
 * 课程体系数据（Stage / Lesson / Checkpoint）—— V1.3 母文档口径
 *
 * 口径：第 0 课（开始前准备）+ 29 节正式课程（6 / 8 / 7 / 8）+ 4 次阶段自检 + 4 个阶段项目。
 * 第 0 课（isPrep: true）在学习路径中展示，但不计入课程数量与任何完成率。
 * 价格、发布状态、权限与进度由 API 返回；isPublished 只在种子同步时写入数据库。
 */

export type Accent = 'blue' | 'violet' | 'orange' | 'emerald'

export type LessonStatus = 'completed' | 'in_progress' | 'not_started' | 'locked'
export type StageStatus = 'completed' | 'in_progress' | 'not_started' | 'locked'

export interface Lesson {
  /** 全局唯一 id，用作路由参数 */
  id: string
  /** 章节编号，如 2.3 */
  code: string
  order: number
  title: string
  desc: string
  duration: string
  status: LessonStatus
  isPreview?: boolean
  isPublished?: boolean
  /** 第 0 课：开始前准备。展示在学习路径中，但不计入 29 节与完成率 */
  isPrep?: boolean
}

export interface Checkpoint {
  id: string
  /** 位于第几节课之后 */
  afterLessonOrder: number
  title: string
  desc: string
  items: string[]
}

export interface Ability {
  icon: 'collab' | 'api' | 'database' | 'deploy' | 'prompt' | 'build' | 'verify' | 'ship'
  title: string
  desc: string
}

export interface Stage {
  id: number
  slug: string
  tag: string
  title: string
  /** 卡片上的一句话定位 */
  subtitle: string
  /** 详情页的完整描述 */
  desc: string
  accent: Accent
  difficulty: string
  /** 首页/路径页展示的「预计时长」 */
  shortDuration: string
  /** 详情页展示的「预计总时长」 */
  totalDuration: string
  recommend: string
  price: number
  status: StageStatus
  isPublished?: boolean
  isPurchasable?: boolean
  enterState: string
  exitState: string
  abilities: Ability[]
  lessons: Lesson[]
  checkpoints: Checkpoint[]
  project: {
    id: string
    title: string
    desc: string
  }
}

export const accentClass: Record<
  Accent,
  { bg: string; softBg: string; text: string; border: string; solid: string; ring: string }
> = {
  blue: {
    bg: 'bg-brand-600',
    softBg: 'bg-brand-50',
    text: 'text-brand-700',
    border: 'border-brand-200',
    solid: 'text-brand-600',
    ring: 'ring-brand-500/15',
  },
  emerald: {
    bg: 'bg-emerald-600',
    softBg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    solid: 'text-emerald-600',
    ring: 'ring-emerald-500/15',
  },
  violet: {
    bg: 'bg-violet-600',
    softBg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    solid: 'text-violet-600',
    ring: 'ring-violet-500/15',
  },
  orange: {
    bg: 'bg-orange-500',
    softBg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    solid: 'text-orange-500',
    ring: 'ring-orange-500/15',
  },
}

export const stages: Stage[] = [
  {
    id: 1,
    slug: 'stage-1',
    tag: '阶段 1',
    title: 'AI 原生开发入门',
    subtitle: '从「会用 AI」到「能带 AI 完成一个小产品」，从第一次真实页面变化开始。',
    desc: '在本阶段，你会在同一个 Next.js 项目上，学会让 AI 读懂项目、按需求修改、判断改动范围、验证结果，并亲手修复 Bug、保存和恢复版本。完成本阶段后，你能独立带着 AI 做出一个有搜索、筛选和自己定义功能的小产品。',
    accent: 'emerald',
    difficulty: '初级',
    shortDuration: '2 周',
    totalDuration: '约 4 小时',
    recommend: '零基础友好',
    price: 99,
    status: 'in_progress',
    enterState: '我会用 AI，但是不会真正做项目。',
    exitState: '我能带着 AI 完成一个小软件产品。',
    abilities: [
      { icon: 'prompt', title: '需求描述', desc: '把「我想要」说成 AI 能做对的需求：用户做什么、成功是什么样、什么别动。' },
      { icon: 'verify', title: '运行与验证', desc: 'AI 说完成不算完成，亲手刷新页面、点一遍功能确认结果。' },
      { icon: 'build', title: '看懂改动', desc: '知道 AI 改了哪个文件、为什么是它、有没有动无关内容。' },
      { icon: 'ship', title: 'Debug 与版本', desc: '描述一个 Bug 的复现步骤，保存可用版本，改坏了能恢复。' },
    ],
    lessons: [
      {
        id: 's1-l0',
        code: '0',
        order: 0,
        title: '开始前准备',
        desc: '装好 Node.js 和 WorkBuddy，下载 Starter，把个人知识工作台第一次跑起来。',
        duration: '30 分钟',
        status: 'completed',
        isPreview: true,
        isPrep: true,
      },
      {
        id: 's1-l1',
        isPreview: true,
        code: '1.1',
        order: 1,
        title: '第一次让 AI 改一个真实项目',
        desc: '改产品名、介绍和一个视觉元素，刷新后立刻看到两次真实变化。',
        duration: '15 分钟',
        status: 'in_progress',
      },
      {
        id: 's1-l2',
        code: '1.2',
        order: 2,
        title: '把「我想要」说成 AI 能做对的需求',
        desc: '做出「只看重要资料」等真正可点击的小功能。',
        duration: '30 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's1-l3',
        code: '1.3',
        order: 3,
        title: '页面不对时，怎样让 AI 帮你修',
        desc: '修复一个稳定可复现的交互 Bug。',
        duration: '30 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's1-l4',
        code: '1.4',
        order: 4,
        title: 'AI 到底改了什么',
        desc: '第一次看懂项目里的文件变化，把代码改动和页面结果对应起来。',
        duration: '25 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's1-l5',
        code: '1.5',
        order: 5,
        title: '改坏了怎么办：保存和恢复版本',
        desc: '保存一个可恢复版本，并亲手恢复一次。',
        duration: '25 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's1-l6',
        code: '1.6',
        order: 6,
        title: '独立带 AI 做一个自己的功能',
        desc: '自己定义一个小功能，验证结果、检查修改并保存完成版本。',
        duration: '40 分钟',
        status: 'not_started',
        isPublished: true,
      },
    ],
    checkpoints: [
      {
        id: 'cp-1',
        afterLessonOrder: 6,
        title: 'Stage 1 阶段自检',
        desc: '不看教程，独立完成下面几件事。做不到的部分，回到对应课程再看一遍。',
        items: [
          '能从自己的需求开始，让 AI 新增一个小功能，亲自验证并保存完成版本',
          '能描述一个 Bug 的操作、预期和实际',
          '能看出本轮改了哪些文件',
          '能保存并恢复一个可用版本',
        ],
      },
    ],
    project: {
      id: 'assistant',
      title: '个人知识工作台',
      desc: '完成一个能在本地运行、带搜索与筛选的小型前端产品，亲自验证自己决定的功能，并用本地 Git 保存可恢复的完成版本。',
    },
  },
  {
    id: 2,
    slug: 'stage-2',
    tag: '阶段 2',
    title: 'AI 全栈开发',
    subtitle: '从「会改页面」到「能带 AI 做一个有数据库、登录和权限的完整软件」。',
    desc: '在本阶段，你继续使用 Stage 1 的同一个 Next.js 项目，看懂页面、API、服务端和数据库如何配合，接入云 PostgreSQL 和 Prisma，完成 CRUD、注册登录和权限隔离，最后把产品部署到 Vercel。',
    accent: 'blue',
    difficulty: '中级',
    shortDuration: '3-4 周',
    totalDuration: '约 10 小时',
    recommend: '完成 Stage 1 阶段自检',
    price: 199,
    status: 'not_started',
    enterState: '我会让 AI 修改页面，但是还不会做完整软件。',
    exitState: '我可以带着 AI 完成一个真正的全栈应用。',
    abilities: [
      { icon: 'collab', title: '读懂全栈结构', desc: '知道页面、API、服务端和数据库分别放在项目的哪里、怎么配合。' },
      { icon: 'api', title: 'API 与数据流', desc: '建立第一条 POST API，理解请求、响应和 JSON。' },
      { icon: 'database', title: '数据库与 CRUD', desc: '用 Prisma + 云 PostgreSQL 让数据真正持久化，完成完整增删改查。' },
      { icon: 'deploy', title: '登录、权限与部署', desc: '注册登录、资源所有权隔离、失败状态处理，并部署上线。' },
    ],
    lessons: [
      {
        id: 's2-l1',
        code: '2.1',
        order: 1,
        title: '从页面到完整产品：读懂全栈项目',
        desc: '在同一个项目里，第一次看懂页面、API、服务端和数据库将怎样配合。',
        duration: '30～40 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l2',
        code: '2.2',
        order: 2,
        title: '浏览器怎么把数据交给服务端',
        desc: '建立第一条 POST API，页面提交的数据能到服务端并得到真实响应。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l3',
        code: '2.3',
        order: 3,
        title: '让数据刷新和重启以后还存在',
        desc: '接入云 PostgreSQL + Prisma，把第一条资料真正写入数据库。',
        duration: '分两次各 45～60 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l4',
        code: '2.4',
        order: 4,
        title: '完成一条资料的完整 CRUD',
        desc: '资料可以创建、查看、修改和删除。',
        duration: '70～100 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l5',
        code: '2.5',
        order: 5,
        title: '加入真实的注册和登录',
        desc: '用户可以注册、登录、刷新保持登录并登出。',
        duration: '80～110 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l6',
        code: '2.6',
        order: 6,
        title: '每个人只能看到自己的资料',
        desc: '完成真正的资源所有权隔离。',
        duration: '80～110 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l7',
        code: '2.7',
        order: 7,
        title: '把失败状态也做成产品的一部分',
        desc: '加入 Loading、Empty、Error、Validation 等真实状态。',
        duration: '80～110 分钟',
        status: 'not_started',
        isPublished: true,
      },
      {
        id: 's2-l8',
        code: '2.8',
        order: 8,
        title: '把全栈产品真正交付出去',
        desc: '部署到 Vercel，连接云 PostgreSQL，并提供最短运行说明。',
        duration: '90～120 分钟',
        status: 'not_started',
        isPublished: true,
      },
    ],
    checkpoints: [
      {
        id: 'cp-2',
        afterLessonOrder: 8,
        title: 'Stage 2 阶段自检',
        desc: '能做到下面几件事，就说明你已经从「改页面」进入「做完整软件」。',
        items: [
          '能解释一次页面请求如何经过 API 到数据库',
          '能让 AI 新增一个小 API，并自己验证请求/响应',
          '能完成 CRUD、登录与最基本的资源隔离',
          '能把项目部署后重新走一遍核心功能',
        ],
      },
    ],
    project: {
      id: 'fullstack',
      title: '全栈知识工作台',
      desc: 'Stage 1 的产品升级为有真实数据库、账号系统、个人数据和线上地址的完整 Web 产品。完成后保存一个可恢复的阶段版本（stage-2-complete）。',
    },
  },
  {
    id: 3,
    slug: 'stage-3',
    tag: '阶段 3',
    title: 'AI 应用开发',
    subtitle: '从「会做普通软件」到「能把模型能力真正放进产品」。',
    desc: '在本阶段，你会在自己的产品里接入真实模型 API，做出结构化输出和流式体验，用 PostgreSQL + pgvector 把资料变成可检索的向量，完成第一条完整 RAG 链路、引用来源和评估。整阶段真实 API 实验按低预算设计。',
    accent: 'violet',
    difficulty: '中级',
    shortDuration: '3-4 周',
    totalDuration: '约 10 小时',
    recommend: '完成 Stage 2 阶段自检',
    price: 269,
    status: 'not_started',
    enterState: '普通 Web 产品我能做，但是不知道怎么真正加入 AI。',
    exitState: '我能把模型、RAG、引用真正放进产品。',
    abilities: [
      { icon: 'api', title: '模型接入与调用', desc: 'API Key 只在服务端，Provider 可替换，成本可控。' },
      { icon: 'build', title: '结构化输出与流式', desc: '模型返回可校验的结构，答案逐段出现、可取消。' },
      { icon: 'database', title: 'Embedding 与检索', desc: 'Chunk、Embedding、pgvector，让资料变成可检索的向量。' },
      { icon: 'verify', title: 'RAG、引用与评估', desc: '回答带着来源，用小型评估集判断质量与成本。' },
    ],
    lessons: [
      {
        id: 's3-l1',
        code: '3.1',
        order: 1,
        title: '第一次把真实模型接进自己的产品',
        desc: '先 Mock 跑通接口，再配置低成本 Provider，完成一次真实模型调用。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's3-l2',
        code: '3.2',
        order: 2,
        title: '别让 AI 只返回一段「随缘文字」',
        desc: '模型返回可校验的结构化结果，例如 summary / tags / confidence。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's3-l3',
        code: '3.3',
        order: 3,
        title: '做出真正像 AI 产品的流式体验',
        desc: '答案逐段出现，用户可以取消，失败时有清晰状态。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's3-l4',
        code: '3.4',
        order: 4,
        title: '让资料变成可以检索的向量',
        desc: '资料被切成 Chunk、生成 Embedding，保存到 PostgreSQL + pgvector。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's3-l5',
        code: '3.5',
        order: 5,
        title: '做出第一条完整 RAG 链路',
        desc: '完成 Query → Embedding → Top-K → Context → Model 的闭环。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's3-l6',
        code: '3.6',
        order: 6,
        title: '让回答带着来源，而不是只让人「相信 AI」',
        desc: '回答展示来源标题、引用片段和可回查位置。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's3-l7',
        code: '3.7',
        order: 7,
        title: '判断 AI 功能到底好不好用',
        desc: '建立小型问题集，记录检索、回答、引用和成本表现。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
    ],
    checkpoints: [
      {
        id: 'cp-3',
        afterLessonOrder: 7,
        title: 'Stage 3 阶段自检',
        desc: '能独立做到下面几件事，你的产品就已经是真正的 AI 应用。',
        items: [
          '能安全接入真实模型并知道 Key 为什么只能在服务端',
          '能解释 Chunk、Embedding、Vector、Top-K 在 RAG 中分别做什么',
          '能做带来源的 RAG 回答，而不是只套聊天框',
          '能用小型评估集和成本记录判断 AI 功能质量',
        ],
      },
    ],
    project: {
      id: 'rag',
      title: 'RAG 知识库项目',
      desc: '在全栈知识工作台上加入资料索引、RAG 问答、引用来源和评估能力。完成后保存一个可恢复的阶段版本（stage-3-complete）。',
    },
  },
  {
    id: 4,
    slug: 'stage-4',
    tag: '阶段 4',
    title: 'Agent 工程进阶',
    subtitle: '从「模型会回答」到「AI 可以在受控条件下调用工具并完成任务」。',
    desc: '在本阶段，你会做出最小 Agent Loop，让模型调用只读 Tool，高风险写操作经过人工确认，用 MCP 统一工具接入，拆出多步 Workflow，支持暂停、失败和恢复，最后完成安全评估并把项目交付成作品。',
    accent: 'orange',
    difficulty: '高级',
    shortDuration: '3-4 周',
    totalDuration: '约 12 小时',
    recommend: '完成 Stage 3 阶段自检',
    price: 299,
    status: 'not_started',
    enterState: '我会做 AI 应用，但 Agent 仍然停留在概念层。',
    exitState: '我能构建受控 Tool / Workflow Agent。',
    abilities: [
      { icon: 'build', title: 'Agent Loop 与 Workflow', desc: '最小决策循环、多步任务、清晰状态与停止条件。' },
      { icon: 'api', title: 'Tool 与 MCP', desc: '只读 Tool、写操作人工确认、用 MCP 统一工具接入。' },
      { icon: 'verify', title: '状态与恢复', desc: '任务状态持久化、断点恢复、写操作幂等保护。' },
      { icon: 'ship', title: '评估与交付', desc: '安全与可靠性案例集，把 Demo 交付成别人能用的作品。' },
    ],
    lessons: [
      {
        id: 's4-l1',
        code: '4.1',
        order: 1,
        title: '从 AI 应用到 Agent：让模型开始「行动」',
        desc: '做出最小 Agent Loop，模型可以选择回答或提出一个动作。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l2',
        code: '4.2',
        order: 2,
        title: '让 Agent 调用第一个只读 Tool',
        desc: 'Agent 能调用「搜索我的知识库」等只读 Tool。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l3',
        code: '4.3',
        order: 3,
        title: '写操作不能让 AI 想做就做',
        desc: '高风险写操作必须经过人工确认，确认后的参数不能被偷换。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l4',
        code: '4.4',
        order: 4,
        title: '用 MCP 把工具接入方式统一起来',
        desc: '接入一个最小 MCP 只读工具，并能在 Agent 中正常使用。',
        duration: '45 分钟',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l5',
        code: '4.5',
        order: 5,
        title: '从一次 Tool 调用到多步 Workflow',
        desc: '一个任务经过多个 Step，有清晰状态和最终结果。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l6',
        code: '4.6',
        order: 6,
        title: '让 Agent 能暂停、失败和恢复',
        desc: '任务状态持久化，支持 Resume，写操作幂等保护。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l7',
        code: '4.7',
        order: 7,
        title: 'Agent 到底能不能信：做一次真实评估',
        desc: '覆盖正常任务、错误参数、越权、注入、循环、超时、取消等案例。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
      {
        id: 's4-l8',
        code: '4.8',
        order: 8,
        title: '把 Agent 项目交付成真正的作品',
        desc: '线上 Demo、README、架构图、三分钟演示和清晰限制说明。',
        duration: '1 小时',
        status: 'not_started',
        isPublished: false,
      },
    ],
    checkpoints: [
      {
        id: 'cp-4',
        afterLessonOrder: 8,
        title: 'Stage 4 阶段自检',
        desc: '能说清并做到下面几件事，你就完成了从 AI 用户到 Agent Builder 的全过程。',
        items: [
          '能解释 Agent、Tool、Workflow 和普通模型调用的区别',
          '知道读 Tool 与写 Tool 为什么需要不同风险处理',
          '能让 Agent 多步执行，同时限制步骤、重试和权限',
          '能对 Agent 做最基本的安全与可靠性评估',
        ],
      },
    ],
    project: {
      id: 'agent',
      title: 'AI 研究 Agent',
      desc: '把 RAG 知识库升级成可以调用只读/写入工具、经过人工确认、支持多步任务与恢复的 AI 研究 Agent。完成后保存一个可恢复的阶段版本（stage-4-complete）。',
    },
  },
]

/* ------------------------------------------------------------------ */
/* 派生数据                                                             */
/* ------------------------------------------------------------------ */

/** 正式课程的统计一律排除第 0 课（isPrep） */
export const formalLessons = (lessons: Lesson[]) => lessons.filter((l) => !l.isPrep)

export const allLessons: Lesson[] = stages.flatMap((s) => formalLessons(s.lessons))

export const totalLessons = allLessons.length

export const totalProjects = stages.length

export function curriculumFormalLessonCount(slug?: string) {
  return stages.filter(s => !slug || s.slug === slug).reduce((sum, s) => sum + formalLessons(s.lessons).length, 0)
}
export const publishedLessons = (lessons: Lesson[]) => lessons.filter(l => l.isPublished !== false)

export function stageLessonCount(stage: Stage) {
  return curriculumFormalLessonCount(stage.slug)
}

export function getStageBySlug(slug: string) {
  return stages.find((s) => s.slug === slug)
}

export function getStageById(id: number) {
  return stages.find((s) => s.id === id)
}

export function getLesson(stageSlug: string, lessonId: string) {
  const stage = getStageBySlug(stageSlug)
  if (!stage) return undefined
  const lesson = stage.lessons.find((l) => l.id === lessonId)
  if (!lesson) return undefined
  return { stage, lesson }
}

/** 学习路径页顶部总体进度里展示的阶段状态文案 */
export const stageStatusLabel: Record<StageStatus, string> = {
  completed: '已完成',
  in_progress: '进行中',
  not_started: '未开始',
  locked: '未开通',
}

export const lessonStatusLabel: Record<LessonStatus, string> = {
  completed: '已完成',
  in_progress: '学习中',
  not_started: '未开始',
  locked: '未开通',
}
