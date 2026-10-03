# Stage 4.8 验收记录：AI 研究 Agent 作品交付

开工基线：`fc3a3879946a80cce5a904b117726e2022a8d0e3`；`main`、`origin/main` 一致，工作区干净。本轮是交付层，不增加 Agent 能力。Stage 4 Starter 未修改；Stage 4 价格仍为 299，课程 `isPublished=false`。

## 交付物与装配范围

- 最终项目 README、完整安全占位 `.env.example`、仅更新说明文字的 `package.json`、Agent 状态提示文案；架构文档和三分钟演示稿由装配脚本放进项目 `docs/`。
- Lesson 4.8 正文、Stage 4 系列风格的新教学图、课程元数据及本记录。4.1～4.7 配图和 Starter 均未动。
- A/B 从 Stage 4 Starter 全新装配到 `.runtime/s4-l8-a-final-20261003` 与 `.runtime/s4-l8-b-final-20261003`；两份页面保留原有 `app/page.tsx` 差异。抽查 Agent Runtime、Registry、Provider、Persistence、Confirm、MCP adapter、Agent Route 与 Prisma schema 共 10 个文件，4.8 与 4.7 哈希相同。只为确定性 Eval 的签名篡改 fixture 修复末位 Base64url 填充位造成的偶发假阴性：改动签名首字符，确保解码字节必变。正式审批验证器和 Hard Gate 定义未改。

## 本地生产构建与数据库

4.8 A/B 各完成 `npm ci`、`prisma generate`、`npm test` **55/55**、`npm run build`。本机隔离 `stage4_l8` PostgreSQL 从零 `prisma migrate deploy`：现有**五次 migration** 全部应用，`prisma migrate status` 为 schema up to date，`vector` 扩展及 `KnowledgeChunk.embedding` 向量列可用。A 另用此隔离库完整运行现有 `vercel-build`（generate → migrate deploy → migrate status → next build），通过；没有改写部署命令。此库是本机验证库，**不是**生产数据库。

## Eval 与历史回归

Eval Runner 按原安全 guard 只在隔离 `stage4_l7` 运行，未因课号变更而放宽。最终全新 4.8 A/B 均 **20/20 主案例、73 子案例**，三个独立 Hard Gates：`cross_user_leaks=0`、`unapproved_writes=0`、`duplicate_confirmed_writes=0`。A 的 `--case unapproved-write --inject-failure unapproved-write` 得退出码 1、`unapproved_writes=1`、总门槛 FAIL；撤销注入后重跑完整矩阵恢复 PASS。

4.1、4.2、4.3、4.4、4.5、4.6 独立 HTTP acceptance 脚本本轮再次运行，逐项 PASS；4.7 的固定 Eval 在 4.8 A/B 均 PASS。平台 `npm run verify` 通过（71/71 测试、30 篇 authored lesson、149 个唯一 checkKey、22 篇 published content 与 bundle 检查）。

## 本机真实 Provider 观察与部署状态

用未提交的本机 Provider 配置、隔离 `stage4_l7` 和最终 A 装配做真实 `qwen3.7-flash` / `text-embedding-v4` Smoke。默认知识搜索目标曾两次得到受控 `UPSTREAM` 失败（第二轮模型又选了 Tool）；只改变自然语言目标为“只调用一次 search_knowledge，随后直接回答”，不改 `tool_choice=auto` 或 Runtime，再跑时 Direct `completed`（1 model/0 tool）、知识搜索 `completed`（2 model/1 tool/1 embedding）、MCP `completed`（2 model/1 tool/1 MCP），持久化 Workflow 到 `waiting_approval`（2 model/1 search/1 embedding）；确认前 Resource +0、确认阶段 model +0、确认后 Resource +1。原始本机观察只留在被忽略的 `.runtime`，不提交。真实模型路径仍有波动，不能用一次 Smoke 替代安全 Eval。

**Production deployment not independently completed；本轮为 deployment-ready only。** 当前没有已绑定的 Vercel 项目、Vercel CLI/部署凭证或云 PostgreSQL 配置；GitHub 仓库也没有现成部署记录。因此没有真实 HTTPS URL、deployed SHA、Production/Preview 数据库隔离的线上验证、生产 migration 状态、MCP HTTPS 状态或 Production Smoke 结果。README 明写 `Live Demo: not published yet`，没有编造 URL。待具备独立云 PostgreSQL、Provider 配置与平台权限后，按 README 的 Production/Preview 隔离策略部署并执行温和 Smoke；不可把本机测试结果写成生产结果。

## 安全交付核对

README 的 Mermaid、Tool/Risk 清单与代码一致：三个 read Tool 和一个只可提出提议的 write Tool。Application Secret 与 Provider Secret 均只列变量名，不含实际值；`.env`、Bearer、Cookie、审批 Token、原始 Eval JSON 和真实 Provider 响应未进入 Git。浏览器 bundle 沿用平台 secret 检查。页面为 `budget_exhausted`、`paused`、`failed`、`cancelled`、`waiting_approval` 增加简短可读提示，不改执行语义。

## Known Limitations

- 无后台 Worker/Queue，无多实例 execution lease；`running` 在持久化 checkpoint 前崩溃不会自动恢复。
- Request、Provider、MCP 限流为单实例内存；真实 Provider、数据库和 MCP 均可能暂时不可用。
- 真实模型 `tool_choice=auto`，可能直接回答或走不同 Tool 路径；回答质量不能由 Tool 成功推断。
- AgentAction → Resource 的唯一业务键只保证同一 Action 的幂等，不宣称全系统 exactly-once delivery。
- 固定 Eval 证明所列案例中的边界；小样本延时不是生产性能基准，Production Smoke 也不是安全证明。
