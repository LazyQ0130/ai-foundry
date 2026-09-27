# 免费体验闭环与产品一致性验收

## 权限与数据库同步

- `s1-l0`、`s1-l1` 在 `src/data/courses.ts` 声明 `isPreview: true`，匿名可读；保存 checklist、完成状态必须登录，沿用现有 ACTIVE 检查。
- Starter 固定接口 `/api/course-assets/stage1-starter` 使用 `authenticated-preview` 策略，ACTIVE 登录用户无需 entitlement；匿名和禁用账号返回 401。固定路径、ZIP、MIME、安全检查不变。
- 通用策略还支持 `stage-entitlement`（显式 stage）和 `admin-only`。Admin 也先检查 ACTIVE。
- 匿名下载显示登录/注册按钮，`next` 保留课程地址；登录后返回原课再下载。
- 新环境与已有环境都运行 `npm run db:seed`。upsert 的 create/update 均同步 Preview 与发布状态，不依赖手动改库；不会覆盖现有阶段价格或购买开关。部署时先完成既有迁移，再 seed，最后启动新版服务。
- `npm run check:content` 检查数据库与母目录的 Preview、发布状态、课程和 checklist 一致性。本地正常数据库已同步。

## 体验与进度

无 entitlement 时 Dashboard：未完成第 0 课 → 开始免费体验；完成第 0 课 → 继续 1.1；两课均完成 → 免费体验已完成、查看 Stage 1 / 学习方案。有 entitlement 沿用继续学习。

第 0 课独立反馈 0/1 或 100% 准备完成，不计入正式课。1.1 为正式课：完成两课后 Overall 为 1/29、Stage 1 为 1/6。完整正式分母为 6/8/7/8；`stageLessonCount` 从母目录读取，`stageCompletedCount` 只认可母目录中的正式 ID。Stage 完成必须完成全部正式课，不能只完成当前发布课。

公开目录展示全部 lesson metadata；未发布课标记“即将上线”，不可进入正文。正文 API 仍检查 isPublished 与权益。无权益用户 1.1 的下一步进入 Stage 1 总览；已购用户只进入已发布且有权限的下一课。

原 `.lessons.length` 出现在 `ProjectPage.tsx`、`ProjectsPage.tsx`、`StagePage.tsx`，已清理。Dashboard、Home、AccountPage、pricing、ProgressProvider 与服务端进度统一正式统计。项目详情移除静态示例开始/截止日期与“剩余时间已完成”，改为真实课程完成/待完成数量。

## 展示一致性

- FAQ：弱化“复制问题链接”，键盘 Enter 可操作；使用当前 origin，成功短暂显示“已复制”，失败提供原 hash 链接。
- Mockup：移除 AI 全栈开发实战、AI 记事助手、60%、6 / 10 任务与旧后端/向量库任务；使用当前阶段标题、项目名和课程示例。不展示虚构用户进度。
- 项目示意按现有 assistant/fullstack/rag/agent ID 对应个人知识工作台、全栈知识工作台、RAG 知识库项目、AI 研究 Agent。架构图按阶段展示 Next.js / TypeScript、Prisma / PostgreSQL / Vercel、OpenAI-compatible API / pgvector、Tool / MCP / Workflow。
- Pricing：小于 md 时全套比较卡优先，其后是紧凑阶段卡；读取真实 plans 计算价格与节省金额。md 以上保留表格。购买机制、价格、退款规则不变。

## 验收结果（2026-09-27）

| 检查 | 结果 |
| --- | --- |
| typecheck | 通过 |
| build | 通过；既有主 bundle 超 500 KB 提示保留 |
| tests | 44 / 44 通过 |
| check:content | 通过；4 阶段、2 已发布正文 |
| check:bundle | 通过；未泄漏受保护正文 |
| check:starter | 通过；ZIP 与源一致，24455 字节 |
| production smoke | 编译后生产服务、SPA、Secure Cookie、登出、CSRF、私有文件隔离通过 |

API 测试覆盖匿名两课可读/下载拒绝、零权益下载与两课任务保存/完成、0/29→1/29、Stage1 分母6、已发布非Preview权限边界、未发布404、禁用拒绝、资源策略和原 ZIP 安全校验。项目统计测试覆盖准备课排除、完整分母和两个页面接入统一 helper；状态卡和各阶段 Mockup 有渲染测试。

实际浏览器验收使用隔离 `aifoundry_test` schema，新注册普通零权益测试账号，逐步点击注册 → Dashboard → 第 0 课 → 下载 → 四项任务 → 完成准备 → Dashboard 中间状态 → 1.1 → 五项任务 → 完成 → Dashboard → Stage 1。刷新后完成状态持久化；Projects 与 Project detail 均为 1/6；Stage 1 显示六节正式课及准备课，未发布项不能点正文。

实际下载文件与交付 ZIP 的 SHA256 一致：`D4E95406F8E3040C0C8A3E039EAE51C14882EDCBDCA645C02F2C8DC2185484FF`。

390px 检查 Dashboard、第 0 课资源、1.1 和 Pricing；无整页横向 overflow。全套比较价格、包含项、CTA 可见，开通说明弹窗可打开；1440px 表格保留。FAQ 桌面和手机用 Enter 复制，显示“已复制”；桌面剪贴板确认当前 origin + FAQ hash。匿名 Starter 明确显示登录注册及课程返回路径。

截图保存在本地 `preview/free-dashboard-start.png`、`free-prep-complete.png`、`free-dashboard-ready.png`、`free-dashboard-complete.png`、`free-starter-mobile.png`、`free-lesson-mobile.png`、`free-pricing-mobile.png`、`free-pricing-desktop.png`、`free-faq-copy.png`（preview 不提交）。手工 E2E 验收网站交互与任务持久化，不将勾选任务表述为实际代替学生在 WorkBuddy 完成代码练习。

## 范围

未编写 1.2；未改 29 节课程体系、Stage 2～4 课程内容、价格、支付/退款方式、Auth 架构、数据库模型、Lesson Renderer V2 架构或 Starter 产品功能。

第 0 课仅更新下载权限文案；1.1 仅将五处旧 stage-1 文件夹名称改为实际 ZIP 解压目录 aifoundry-stage1-starter，保持教学主体、目标和 checklist keys。
