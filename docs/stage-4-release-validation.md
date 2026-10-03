# Stage 4 Final Release｜发布验收

基线：`e96289912f1bc15c4078f887846ec36ec8ec1709`。发布提交以最终 `git log -1` 和本轮发布报告中的完整 SHA 为准。Stage 4 目录保持「Agent 工程进阶」、8 节、约 12～15 小时、价格 299；本轮只将 4.1～4.8 的课节发布位设为 true，并对最终项目 README 的 Node 版本说明做一处事实修正。

## 学员交付与权限

- 从 `starter/aifoundry-stage4-starter.zip` 全新解压，README、包文件、Compose、`.env.example`、Prisma、app/components/lib 齐全，与 Starter 源文件一致。原 ZIP 无 `.env`、`.env.local`、`node_modules`、`.next`、`.runtime` 或 Git 元数据；README 含 Stage 3 → 4 端口 `55433` 排障及不得使用 `down -v` 的说明。
- 解压项目完成 `npm ci`、四次 Starter migration 的 deploy/status、`npm run build`。本机 Mock HTTP Smoke：注册/登录、普通 AI、知识文档 `ready`、带引用的 RAG 均通过；Starter 的 `/api/agent/run` 为 404。
- 本地课程平台发布态 Smoke：Stage 4 目录显示 8 节、299 元；仅有 Stage 4 entitlement 的账号可读取 4.1～4.8、下载受保护 ZIP 并保存 4.1 进度；全套 entitlement 可读 4.8；无权限账号读取正文或 ZIP 得 403，未登录得 401。教学图片 8/8 存在，构建后首末两张可在 `dist/course-media/stage-4/` 找到。
- 本地课程数据库最终为 Stage 1 `7/7`、Stage 2 `8/8`、Stage 3 `7/7`、Stage 4 `8/8` 已发布。阶段 4 数据库阶段位为 true，价格 299。发布操作不要对已有生产库盲目运行全量 `db:seed`：它会按静态目录同步所有课节发布位，可能覆盖由运营发布的 Stage 3 状态。已有库应通过受保护的课程管理路径逐节核对和发布 Stage 4。

## 全新最终项目与回归

- 4.8 A/B 分别从当前 Starter 新装配，分别 `npm ci`、`npx prisma generate`、`npm test` **55/55**、`npm run build` 通过；没有复用旧构建。
- 专用本机 PostgreSQL `stage4_l7` 从零应用现有 **5 次** migration，`prisma migrate status` 显示 schema up to date；无第六次 migration、schema 改动或 `db push`。
- A/B 完整固定 Eval 均 **20/20 主案例、73 子案例**，`cross_user_leaks=0`、`unapproved_writes=0`、`duplicate_confirmed_writes=0`。A 的红灯注入退出码 1、`unapproved_writes=1`、总门槛 FAIL；撤销后 A 完整矩阵恢复 PASS，B 完整矩阵 PASS。
- 4.1～4.6 各从最新源码新装配、安装依赖、生成 Prisma Client、在各自隔离库迁移并生产构建；六个未修改的独立 HTTP acceptance 脚本逐项 PASS。4.7 Eval 与 4.8 交付/构建检查通过。

## 平台与安全交付

- 发布前和发布后均运行 `npm run verify`、`npm run check`、`npm run check:starter`、`npm run check:authored-content`、`npm run check:content`、`npm run check:bundle`。最终：平台测试 **71/71**；30 篇 authored lesson、149 个唯一 checkKey；本地数据库 30 篇已发布正文一致；浏览器 bundle 检查通过，Stage 4 的 8 篇正文进入发布态检查。
- 学员正文不含 `Reference`、`overlay`、`A/B`、`装配` 等作者术语；无待补正文。Git 跟踪文件未发现真实 Key、Token、Cookie、数据库密码或私有 Chunk；Starter ZIP 未打包本机 `.env`。已有 Stage 3 `.env.example` 的 `stage3-local-only` 是公开的本机示例值，不是生产凭证。
- 4.8 项目 README 仍写 `Live Demo: not published yet`，历史验收记录仍写 `Production deployment not independently completed`。**课程发布不等于 AI Research Agent 生产部署**：当前项目仍为 deployment-ready only，没有独立完成 HTTPS Demo、云 PostgreSQL migration 或生产 Smoke。
- 本轮仅改课节发布元数据、上述 Node 文案及本记录；没有新增 Agent 能力、Tool、MCP/Approval/Runtime 行为、Prisma schema、migration、Eval Hard Gate 或教学图片。`docs/stage-4-trial-review.md` 与其他任务的未跟踪 UX 文件未纳入发布提交。

## 线上边界

本轮课程目录、正文、下载和进度的访问结果来自**本地课程平台**。GitHub `main` 的发布提交和本地数据库发布位均可核对；外部课程平台的部署完成时间、生产数据库课节位与外部用户访问尚未独立核实，不应把本地 Smoke 描述为生产访问证明。
