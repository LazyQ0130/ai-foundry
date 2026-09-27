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
  link?: { to: string; label: string }
}

export const faqs: Faq[] = [
  { id: 'refund', category: 'purchase', q: '可以申请退款吗？',
    a: '对应购买方案首次开通后 72 小时内，可通过管理员微信申请三天无理由全额退款，不限制阅读进度。请提供购买账号、所购方案和付款记录用于核对；退款完成后关闭该次购买对应的课程权限。已付款但未开通、重复付款等情况可联系管理员处理。此项承诺不限制依法享有的其他权利。', link: { to: '/terms', label: '查看完整服务与退款说明' } },
  { id: 'self-study', category: 'learning', q: '是否包含人工答疑或辅导？',
    a: '不包含。课程以文字讲解、自主阅读和动手实践为主，不提供人工答疑、一对一辅导、作业批改或代码排错。购买、退款、课程访问和账号问题仍可联系管理员处理。' },
  { id: 'start-from-zero', category: 'getting-started', q: '零基础从哪里开始？',
    a: '建议从「AI 原生开发入门」开始，先认识开发流程、搭建环境，再尝试用 AI 完成一个小功能。按课程任务一步一步操作，不必一开始就进入全栈、RAG 或 Agent 等后续阶段。',
    link: { to: '/stage/stage-1', label: '了解入门阶段' } },
  { id: 'prerequisites', category: 'getting-started', q: '各阶段需要什么基础？',
    a: '入门阶段适合刚开始接触开发的学习者；全栈阶段需要基础编程知识；AI 应用阶段建议先具备全栈开发基础；Agent 阶段建议已有应用开发经验。可以先对照学习路径里的阶段目标，再选择自己的起点。',
    link: { to: '/path', label: '查看学习路径' } },
  { id: 'course-format', category: 'getting-started', q: '课程是什么形式？',
    a: '当前以图文任务课程为主。每节课围绕一个目标组织概念说明、操作任务、参考 Prompt、检查清单和排查建议。你需要在自己的电脑上动手实现，再对照结果完成检查。' },
  { id: 'tools', category: 'getting-started', q: '需要准备哪些工具？',
    a: '建议使用一台可安装开发工具的电脑、现代浏览器、代码编辑器和 AI 编程助手。具体运行环境按课程的环境搭建指引准备。第三方工具、模型及 API 的使用费用由学员自行承担，不包含在课程价格内；账号、使用限制和收费方式请查看对应服务的说明。' },
  { id: 'how-to-purchase', category: 'purchase', q: '如何购买和开通？', featured: true,
    a: '在价格页选择方案，添加管理员微信确认课程和付款方式。注册 AIFoundry 账号，并将注册手机号提供给管理员。管理员确认收款后开通对应课程，刷新页面即可查看；付款不会自动完成开通。',
    link: { to: '/pricing', label: '查看课程方案' } },
  { id: 'buy-a-stage', category: 'purchase', q: '可以单独购买阶段吗？', featured: true,
    a: '可以。你可以根据学习基础和目标选择单个阶段，也可以选择包含四个阶段的全套课程。当前方案和价格以价格页展示为准。',
    link: { to: '/pricing', label: '比较学习方案' } },
  { id: 'lifetime-access', category: 'purchase', q: '课程是否永久开放阅读？', featured: true,
    a: '是的，购买后对应课程永久开放阅读，不另收阅读续费。已开通的阶段可在个人中心查看，请使用购买时提供的注册账号登录。' },
  { id: 'course-updates', category: 'purchase', q: '是否包含后续更新？', featured: true,
    a: '是的，所有已购课程都会持续更新，包含新的项目内容。登录原有账号进入已开通课程，即可查看更新后的内容。' },
  { id: 'find-courses', category: 'learning', q: '在哪里查看已开通课程？',
    a: '登录后点击顶部头像和昵称，进入个人中心，在「我的课程与权限」中查看已开通阶段及开通记录。点击对应阶段的「去学习」即可进入课程。',
    link: { to: '/account', label: '前往个人中心' } },
  { id: 'continue-learning', category: 'learning', q: '怎样继续上次学习？',
    a: '登录后点击顶部蓝色「继续学习」按钮，可回到上次学习的课程。没有学习记录时会进入学习路径，也可以在个人中心的学习概览中找到继续学习入口。' },
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
