export const guideSections = [
  ['change', 'AI 正在改变什么'],
  ['work', '工作方式正在变化'],
  ['map', 'AI 世界地图'],
  ['concepts', '核心概念'],
  ['mistakes', '三个学习误区'],
  ['agent', '为什么不直接学 Agent'],
  ['roadmap', '四阶段路径'],
  ['practice', '教学理念'],
  ['abilities', '学完获得什么'],
  ['position', '这门课不是什么'],
  ['how', '如何学习'],
  ['start', '开始'],
] as const

export const guideConcepts = [
  { name: 'LLM', short: '理解和生成语言的模型', detail: 'Large Language Model，可以理解为很多 AI 应用背后的语言理解与生成引擎。它本身不天然拥有你的数据库权限，也不会自动知道你的私人资料。' },
  { name: 'Prompt', short: '给模型的任务说明', detail: 'Prompt 不是咒语。把目标、背景、约束和期望结果描述清楚，通常比寻找神奇措辞更有用。' },
  { name: 'Context', short: '模型当前能看到的信息', detail: '当前消息、提供的资料和工具结果都可能成为 Context。很多时候，给 AI 什么信息和怎么问 AI 一样重要。' },
  { name: 'Token', short: '模型处理信息的基本单位', detail: '输入和输出都会占用 Token。上下文越长、调用越多，通常意味着更高的成本和延迟；这里无需先学 tokenizer 的数学细节。' },
  { name: 'Embedding', short: '可比较的语义表示', detail: 'Embedding 把内容转换成一组数字，用来比较语义关系。数据库怎么找到与问题最相关的资料？Stage 3 会让你实际使用它。' },
  { name: 'RAG', short: '先找资料，再基于资料回答', detail: '模型不知道你的私人知识时，可以先检索相关内容，再把结果交给模型作答。RAG 不等于训练模型；Stage 3 会真正实现这条链路。' },
  { name: 'Tool / Tool Calling', short: '模型请求应用调用能力', detail: '模型可以提出搜索知识库、读取资料、查询外部信息或写入的请求。模型提出调用，不等于模型拥有权限。真正执行工具的应该是应用。' },
  { name: 'Agent', short: '模型参与决定下一步的应用结构', detail: '模型在受控范围内选择回答、请求工具、读取结果并继续，直到任务完成或触发停止条件。Agent 不等于无限自主。' },
  { name: 'Workflow', short: '明确连接起来的一组任务步骤', detail: 'Workflow 的路径相对明确；Agent 可以在其中一些节点参与决定下一步。两者可以组合，不必硬分成两类产品。' },
  { name: 'MCP', short: '连接外部能力的一种标准协议', detail: 'MCP 让 AI 应用以更统一的方式连接工具和数据。MCP 服务暴露了能力，不代表模型自动拥有这些能力的权限。' },
  { name: 'Skill', short: '可重复使用的任务能力组合', detail: '“Skill”在不同 AI 产品里的实现并不完全相同，不像 MCP 指向统一的底层连接协议。通常它组合任务说明、流程、知识或工具，帮助某类任务更稳定地完成。' },
  { name: 'Human-in-the-loop', short: '关键动作由人最终确认', detail: '删除数据、写入重要资料、发消息和付款等动作，AI 可以提议，却不该自行作最终决定。Stage 4 会实践这种人工确认边界。' },
  { name: 'Eval', short: '系统验证 AI 是否可靠', detail: '“看起来能用”还不够。Eval 用固定案例与明确指标持续检查功能、安全和可靠性；Stage 3 做小型评估，Stage 4 进一步做 Agent Eval。' },
] as const

export const guideRoadmap = [
  { stage: 'Stage 1', name: 'AI 原生开发入门', lead: '让 AI 帮你做东西', from: '会用 AI 聊天', to: '能带着 AI 做出东西的人', skills: '需求 · Prompt · 看修改 · Debug · Git · 验证' },
  { stage: 'Stage 2', name: 'AI 全栈开发', lead: '把它做成完整软件', from: '能改页面', to: '能带着 AI 做一个完整软件的人', skills: 'API · 数据库 · CRUD · 登录 · 权限 · 部署' },
  { stage: 'Stage 3', name: 'AI 应用开发', lead: '给产品真正接入 AI', from: '会做普通软件', to: '能把真实 AI 能力放进产品的人', skills: 'LLM · Structured Output · Streaming · Embedding · Vector Search · RAG · Citation · Eval' },
  { stage: 'Stage 4', name: 'Agent 工程进阶', lead: '让 AI 在边界内行动', from: '会调用模型', to: '能设计受控 Agent 系统的人', skills: 'Agent Loop · Tool · MCP · Workflow · Human Approval · Persistence · Eval' },
] as const
