export const faqCategories = [
  { id: 'getting-started', title: '开始学习', description: '选对起点，做好准备。' },
  { id: 'purchase', title: '购买开通', description: '了解方案、购买方式与课程权益。' },
  { id: 'learning', title: '学习使用', description: '找到课程，保存进度，解决学习中的问题。' },
  { id: 'account', title: '账号帮助', description: '管理个人资料，处理登录与访问问题。' },
] as const

export type Faq = {
  id: string
  category: typeof faqCategories[number]['id']
  q: string
  a: string
  featured?: boolean
  featuredSummary?: string
  link?: { to: string; label: string }
}

export const faqs: Faq[] = [
  { id: 'refund', category: 'purchase', q: '可以申请退款吗？',
    a: '对应购买方案首次开通后 72 小时内，可通过管理员微信提出退款申请。请提供购买账号、所购方案和付款记录，用于确认订单及申请时间；退款处理完成后，对应课程权限将关闭。已付款但尚未开通、重复付款或服务与约定不符等情况，也可以联系管理员核实处理。具体规则以《用户协议》为准，且不影响依法享有的其他权利。', link: { to: '/terms', label: '查看完整服务与退款说明' } },
  { id: 'self-study', category: 'learning', q: '是否包含人工答疑或辅导？',
    a: '不包含。课程以文字讲解、自主阅读和动手实践为主，不提供人工答疑、一对一辅导、作业批改或代码排错。购买、退款、课程访问和账号问题仍可联系管理员处理。' },
  { id: 'start-from-zero', category: 'getting-started', q: '零基础从哪里开始？',
    a: '建议从「AI 原生开发入门」开始，先认识开发流程、搭建环境，再尝试用 AI 完成一个小功能。按课程任务一步一步操作，不必一开始就进入全栈、RAG 或 Agent 等后续阶段。',
    link: { to: '/stage/stage-1', label: '了解入门阶段' } },
  { id: 'prerequisites', category: 'getting-started', q: '各阶段需要什么基础？',
    a: '入门阶段适合刚开始接触开发的学习者；全栈阶段需要基础编程知识；AI 应用阶段建议先具备全栈开发基础；Agent 阶段建议已有应用开发经验。可以先对照学习路径里的阶段目标，再选择自己的起点。',
    link: { to: '/courses', label: '查看全部课程' } },
  { id: 'course-format', category: 'getting-started', q: '课程是什么形式？',
    a: '当前以图文任务课程为主。每节课围绕一个目标组织概念说明、操作任务、参考 Prompt、检查清单和排查建议。你需要在自己的电脑上动手实现，再对照结果完成检查。' },
  { id: 'tools', category: 'getting-started', q: '需要准备哪些工具？',
    a: '建议使用一台可安装开发工具的电脑、现代浏览器、代码编辑器和 AI 编程助手。具体运行环境按课程的环境搭建指引准备。第三方工具、模型及 API 的使用费用由学员自行承担，不包含在课程价格内；账号、使用限制和收费方式请查看对应服务的说明。' },
  { id: 'how-to-purchase', category: 'purchase', q: '如何购买和开通？', featured: true,
    featuredSummary: '选择方案后添加管理员微信，注册账号并提供手机号；管理员确认付款后手动开通对应权益。',
    a: '在价格页选择方案，添加管理员微信确认课程和付款方式。注册 AIFoundry 账号，并将注册手机号提供给管理员。管理员确认收款后开通对应课程，刷新页面即可查看；付款不会自动完成开通。',
    link: { to: '/pricing', label: '查看课程方案' } },
  { id: 'buy-a-stage', category: 'purchase', q: '可以单独购买阶段吗？', featured: true,
    featuredSummary: '可以。既可以按阶段购买，也可以选择 ¥599 全阶段课程版或 ¥699 项目版。',
    a: '可以。单阶段适合只想补某一部分能力的学习者；全阶段课程版包含 Stage 1–4 和四个阶段项目。想在课程之后继续做综合作品，可选择额外包含项目工坊（原 Project Lab）的项目版。当前方案和价格以价格页展示为准。',
    link: { to: '/pricing', label: '比较学习方案' } },
  { id: 'lifetime-access', category: 'purchase', q: '课程是否永久开放阅读？', featured: true,
    featuredSummary: '是。已购买的课程阶段永久开放阅读，不另外收取阅读续费。',
    a: '是的，购买后对应课程永久开放阅读，不另收阅读续费。已开通的阶段可在个人中心查看，请使用购买时提供的注册账号登录。' },
  { id: 'course-updates', category: 'purchase', q: '是否包含后续更新？', featured: true,
    featuredSummary: '已购课程持续获得阶段内内容维护；¥699 项目版额外包含项目工坊后续新增综合项目。',
    a: '已购买的阶段会持续获得该阶段范围内的内容维护与更新。项目版额外解锁项目工坊；该专区后续新增的综合项目实战持续开放，具体项目与更新节奏以上线内容为准。' },
  { id: 'course-vs-project', category: 'purchase', q: '599 和 699 有什么区别？',
    a: '599 是完整 Stage 1–4 课程版，包含 29 节正式课程和 4 个阶段项目。699 在此基础上额外解锁项目工坊，包括毕业项目以及项目工坊后续新增的综合项目。只想系统学习四阶段课程，599 已经完整；希望学完继续做更完整项目，可以选择 699 项目版。' },
  { id: 'find-courses', category: 'learning', q: '在哪里查看已开通课程？',
    a: '登录后点击顶部头像和昵称，进入个人中心，在「我的课程与权限」中查看已开通阶段及开通记录。点击对应阶段的「去学习」即可进入课程。',
    link: { to: '/account', label: '前往个人中心' } },
  { id: 'continue-learning', category: 'learning', q: '怎样继续上次学习？',
    a: '登录后点击顶部蓝色「继续学习」按钮，可回到上次学习的课程。没有学习记录时会进入课程页，也可以在个人中心的学习概览中找到继续学习入口。' },
  { id: 'sync-progress', category: 'learning', q: '进度是否跨设备保存？',
    a: '登录后的课程访问、任务勾选和完成记录会保存到账号中。更换设备后使用同一账号登录，即可读取已保存的进度。操作时保持网络连接，若出现保存失败提示，请重试并确认结果。' },
  { id: 'troubleshooting', category: 'learning', q: '遇到报错怎么办？',
    a: '先查看本课的检查清单和排查建议，核对环境、操作步骤与预期结果。使用 AI 辅助排查时，描述刚做了什么、完整报错和希望得到的结果；分享前去掉密码、密钥等敏感信息。课程不提供人工答疑或代码排错服务；课程访问或账号异常可联系管理员。' },
  { id: 'edit-profile', category: 'account', q: '如何修改头像和昵称？',
    a: '在个人中心点击「修改昵称」即可编辑保存。点击「更换头像」选择 JPG、PNG 或 WebP 静态图片，调整位置和缩放后保存，也可以恢复默认头像。原图最大 5MB、2500 万像素。',
    link: { to: '/account', label: '编辑个人资料' } },
  { id: 'change-password', category: 'account', q: '如何修改密码？',
    a: '登录后进入个人中心，在「账号与安全」中填写当前密码和新密码。新密码需为 8–72 个字符。修改成功后需要重新登录，其他设备上的登录会话也会失效。',
    link: { to: '/account', label: '前往账号设置' } },
  { id: 'forgot-password', category: 'account', q: '忘记密码怎么办？',
    a: '已绑定并验证邮箱的用户，可通过「找回密码」获取验证码并设置新密码；完成后所有设备需要重新登录。未绑定邮箱或邮箱无法使用时，请联系管理员核验账号归属。不要向任何人提供密码或验证码。', link: { to: '/forgot-password', label: '通过邮箱找回密码' } },
  { id: 'access-after-payment', category: 'account', q: '付款后仍无法访问课程怎么办？',
    a: '先确认登录的是购买时提供的注册账号，再刷新页面并查看个人中心的课程权限。若仍未开通，请联系管理员，提供注册手机号、购买阶段和付款凭据，协助核对收款与开通记录。' },
]

export const featuredFaqs = faqs.filter((faq) => faq.featured)
