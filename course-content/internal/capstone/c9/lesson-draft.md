---
estimatedTime: "180～240 分钟（不含云账号、DNS 与 Provider 等待）"
difficulty: "高级综合实践"
objective: "把 C1～C8 的研究产品交付成可验证的运行版本，并用真实证据解释产品、架构与局限。"
checklist:
  - "完成生产就绪审查，选择部署方案并区分已验证与未验证项"
  - "修复依赖阻断项，完成环境隔离与 Secret Inventory"
  - "验证容器、正式 migration、私有存储、HTTPS 与 MCP"
  - "验证 stale Run 恢复、幂等和人工审批边界"
  - "通过 C8 release gate、Staging Full Smoke 与 Production Safe Smoke"
  - "基于真实证据完成 README、架构图、三分钟 Demo 和简历材料"
  - "完成面试准备与复盘，保存版本并如实记录剩余风险"
checkKeys:
  - "check-c9a4018e65d20b71"
  - "check-c9b5270d83f16a42"
  - "check-c9c6392f14a75e03"
  - "check-c9d7481a02b36f95"
  - "check-c9e8506b73d19a24"
  - "check-c9f9617c24e08b36"
  - "check-c901723d95a46e08"
---

## 把毕业项目真正交付出去

Capstone C9 · Production Delivery & Portfolio

打开你在 C1 写的产品定位。现在它应该已经能把私人资料、外部研究证据、受限 Agent Workflow、Grounded Report 和人工批准的知识笔记串起来。

这节课的第一个问题是：**换一台机器、换一个用户、遇到一次进程中断，产品还成立吗？** 你需要交付的不只是一个能录屏的页面，还包括别人能运行、你能排查、面试时能拿证据解释的版本。

继续自己的 C8 项目，不覆盖 Product Brief，不重建 RAG/Agent。课程作者验证用 C8 Reference；C9 只增加交付所需的最小工程改动。

| 阶段 | 证明什么 | 不能自动证明什么 |
|---|---|---|
| Code Complete | 代码已经写完 | 功能真的成立 |
| Feature Complete | 主功能验收过 | 质量稳定、安全边界成立 |
| Eval Passed | 固定数据和门槛通过 | 换数据后的真实语义质量 |
| Production Ready | 运行、配置、恢复、发布和真实 smoke 有证据 | 产品有真实用户或商业效果 |
| Portfolio Ready | 可以演示、解释并承认局限 | 可以编造业务指标 |

:::concept{title="Build PASS ≠ Production Ready"}
构建不会替你验证 bucket 私有、生产 MCP HTTPS、云代理时限、备份恢复，也不会知道部署的 SHA 是不是你刚测试的版本。
:::

## 0～25 分钟：先做只读交付审查

先自己检查：C8 结果在哪里？依赖 High/Critical 是否为零？同步 Run 的时限是多少？进程死亡时 RUNNING 会怎样？哪些云配置还没有验证？

建立 Release Matrix：Code、Dependencies、Database、Storage、Provider、MCP、Security、Eval、Recovery、Deployment、Smoke、Artifacts。每项只写 PASS / FAIL / NOT VERIFIED，并附证据路径。不要先让 AI 把全表写成 PASS。

:::prompt{title="1 · 只读 Production Readiness Review"}
```text
只读审查我的 C8 项目，不修改文件，不操作 Git。
阅读 Product Brief、架构、schema/migrations、Provider/MCP/Auth/Approval、C8 Eval 和实际验证记录。
按 Code/Dependencies/Database/Storage/Provider/MCP/Security/Eval/Recovery/Deployment/Smoke/Artifacts 列 Release Matrix。
每项标 PASS、FAIL 或 NOT VERIFIED，引用真实文件/运行证据。
分开 Blocker、Risk、Nice-to-have；不要为未知项推定 PASS。
重点找同步 120 秒 Run、进程中断遗留 RUNNING、private storage、HTTPS、Secret、dependency audit 的缺口。
不实现 queue/worker/新业务功能，不虚构部署 URL。
```
:::

:::task{title="你先划发布边界"}
把审查结果中最影响真实用户的三项写进 `docs/deployment-decision.md` 的 Context。区分“必须上线前解决”和“可以接受但必须说明”。High/Critical 依赖、安全归属边界、未验证生产私有存储都不能靠一句“之后优化”放行。
:::

## 25～45 分钟：部署方案也是产品取舍

| 候选 | 何时适合 | 当前需要证明 |
|---|---|---|
| Serverless Next.js | 短请求、弹性与 Preview 重要 | 真实 plan 的 duration、cold start、文件系统、PDF 兼容；120 秒 workflow 是否能完成 |
| Long-lived Node / Docker | 当前同步 research、PDF、MCP，统一 Node runtime | PORT、HTTPS proxy、资源上限、发布和故障恢复 |
| Frontend/API + Worker | 长任务需排队或独立扩缩容 | 队列、状态机、重试、幂等的复杂度是否已值得承担 |

三个都是合理候选。本 Reference 选择第二种：一个 Node 部署单元，加 PostgreSQL/pgvector、私有 S3-compatible storage。没有因为毕业项目就加 Kubernetes。

云目标采用 Render paid Docker + Render Postgres + private R2 的设计，具体配置见 Reference 的 deployment-decision.md。作者当前云部署若未验证，会明确保留 **CLOUD DEPLOYMENT NOT VERIFIED**；学生可以按自己的可用平台做同样的证据检查。

部署前阅读并记录当天的官方文档：[Next self-hosting](https://nextjs.org/docs/15/app/guides/self-hosting)、[Render Docker](https://render.com/docs/docker)、[Render deploy](https://render.com/docs/deploys)、[Postgres extensions](https://render.com/docs/postgresql-extensions)、[R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)。不要把 build command timeout 当成 HTTP request timeout；有 Docker 也不代表代理没有时限。

ADR 写清 runtime/DB/storage/HTTPS/migration/environments/recovery/rollback/known limits。学生自己选标准和最终方案，AI 审核遗漏。

:::deepdive{title="为什么这节课暂不拆 Worker？"}
异步执行确实能缓解长 HTTP 请求，但还要设计任务投递、重复消费、取消、进度、并发与权限。C9 先让现有同步产品可交付，未来排队和吞吐需求出现再迁移。要承认现有同步架构的容量限制，不把它描述成无限扩展。
:::

## 45～75 分钟：依赖修复与环境隔离

先运行并保存报告到 ignored `.runtime`：

```bash
npm outdated
npm audit --omit=dev
npm audit
```

outdated 不是漏洞清单。逐项写 direct/transitive、根因、patched version、升级风险。C8 当时继承了 1 moderate / 4 high / 0 critical，条目包含 @prisma/config、deepmerge-ts、next、postcss、prisma；它们不等于五个独立根因。你运行当天的结果才是你项目的事实。

Reference 在 C9 锁定 Next 15.5.27、PostCSS 8.5.23、deepmerge-ts 8.0.2；保留 Prisma 6.19.3 并对其间接依赖使用明确 override。deepmerge 跨 major override 必须以 generate/migration/HTTP/Eval 回归证明兼容。全量审计中的未修复 braces 开发依赖链通过调整 lint 配置移除；TypeScript 和 React Hooks 检查继续执行。不是隐藏 dev audit，也不是把 Prisma 自动降级。

:::warning{title="不要用 force 换一张绿图"}
不要执行 `npm audit fix --force`。修复 Next/Prisma/React/MCP 后要重跑 lint、typecheck、test、build、migration、HTTP、Eval 和受控 real smoke。High/Critical 未清零就阻断交付；Moderate 必须修复或记录具体路径、可利用条件和接受理由。
:::

环境分 Local / Test-Eval / Staging / Production，各自有 DB、bucket 与凭据。Preview 不能拿生产 DATABASE_URL；没有独立 Preview DB 就关闭相应 Preview。生产没有 TEST_DATABASE_URL，不运行 C8 故障注入。

打开 `docs/deployment.md` 的 Secret Inventory。DATABASE_URL、S3_*、AI_EMBEDDING_*、AI_CHAT_*、MCP_*、ACTION_APPROVAL_SECRET 都只在服务端。embedding 1024 与历史向量一致。MCP 和 Approval 两个 secret 分别用至少 32 随机字节生成，不能共用。

静态 checker 检查缺失/形状/明显不安全配置，不能证明 entropy、TLS 网络、IAM 或 bucket 私有。不要把真实值粘进 Prompt。Provider API key 可以来自同一 provider 账户，应用安全 secret 仍须独立。

## 75～100 分钟：进程死亡以后，谁来处理 RUNNING？

假设模型请求已经发出，Node 被杀了。你不知道第三方是否执行、是否已经计费。自动 Resume 可能重复请求；当前选择 **fail closed**：陈旧执行明确失败，让用户发起一个新 Run。

条件：RUNNING，开始时间超过十分钟，且最近 Step started/completed 也超过十分钟。阈值大于正常两分钟 deadline。锁 Run 后重新检查，Run → FAILED / PROCESS_INTERRUPTED，运行中 Steps 同终态。已完成 Run 不变，PROPOSED Action 不变，不写 KnowledgeNote。

:::prompt{title="2 · 修依赖并建立最小 Recovery"}
```text
先根据实际 audit 报告提出依赖修复，解释每条直接/间接路径、patched version 和兼容性风险，再实施最小改动。
不要 audit fix --force；不要改业务范围或旧课程历史快照。
为现有 ResearchRun 实现 scripts/reconcile-stale-runs.mjs：默认 dry-run，--apply 显式写入，十分钟阈值。
锁 Run 后复核 RUNNING/startedAt/所有近期 Step 活动；保护新鲜 Run。
陈旧 Run 和 RUNNING Steps 标 FAILED / PROCESS_INTERRUPTED；幂等，不 Resume，不批准 Action，不创建 Note。
增加独立测试 DB 的真实测试：dry-run 无改动、stale/fresh/completed、recent Step、PROPOSED Action、重复/并发执行。
记录安全计数；不打印数据库 URL/异常对象/Secret。运行必要回归并报告真实结果，不操作 Git。
```
:::

:::task{title="Break → Fix → Re-run：模拟一次进程中断"}
只在隔离 Test DB 建一个旧 RUNNING 和旧 MODEL Step，再建一个 10 秒的新 Run，以及带近期完成 Step 的旧 Run。先 dry-run，观察 eligible，不应有写入。apply 后旧 Run/Step 失败；新鲜/近期活动的 Run 不变。再 apply 应为零。检查 PROPOSED 和 Note 数量不变。

不能为实验杀生产进程或篡改生产 DB。Reference 的 `npm run test:recovery` 自带 DB allowlist；先阅读它的 guard。
:::

## 100～135 分钟：做出真正可运行的容器

构建阶段 npm ci → Prisma generate → Next build；runtime 只带生成的运行文件，production、非 root、PORT；release target 单独保留 CLI/schema。build 不需要数据库 Secret，不做 migration。

`.dockerignore` 排除 `.env*`、`.runtime`、node_modules、.git、logs。不是把 env COPY 进去后再删掉，因为镜像层可能已经保留了它。

:::prompt{title="3 · Docker、环境检查和部署工件"}
```text
阅读我的部署 ADR，生成 multi-stage Dockerfile/.dockerignore 与部署 runbook。
使用支持的 Node>=20.19、production mode、平台 PORT、非 root；若用 standalone 必须实际 build/run 验证。
新增 GET /api/health，只返回 status ok；不要调用 DB/Provider/Crossref/S3。
建立 check-production-env.mjs：必需配置/HTTPS/remote DB TLS/1024维度/real modes/独立随机32字节安全secret。
拒绝 TEST_DATABASE_URL、local HTTP、mock/fault flags、NEXT_PUBLIC secret；只输出变量名和状态。
建立 production-smoke.mjs：显式 opt-in、公开HTTPS、synthetic only、调用预算和超时；禁止故障注入/泄密。
Staging full smoke 与 Production safe smoke 分开。增加 release:check 复用 C8 deterministic Eval，绝不真实付费。
写清 private bucket/CORS、单独 migrate deploy/status、备份/回滚、recovery运行时机。
关键 Research 事件用 allowlist structured logs，不记录prompt、providerbody、private chunks、token或URL。
不加新业务功能，不操作 Git，不替我声称云部署成功。
```
:::

实际运行 build 后启动容器，验证 health、register/login、受保护 Task 读写。然后用真实 PDF upload/process 检查镜像是否带了解析资源；只在宿主机 PDF test 通过还不够。

数据库 release 顺序必须是：Build image → backup/verify DB → migrate deploy once → migrate status → deploy app → smoke。生产禁用 migrate dev、db push、reset。确认 pgvector extension version 和 vector(1024) 查询真的可用。

:::stuck{title="build 成功，容器却不能启动"}
先看 PORT/host 和进程退出码，再看 standalone 中 Prisma engine 与 PDF 资源；不要把 DB migration 加进 build 碰运气。health 成功但登录失败，再查 DB 连接/正式 migration。不要在排错日志输出完整 DATABASE_URL。
:::

## 135～170 分钟：发布验证不是在线故障注入

先在隔离 Test/Eval shell 运行 `npm run release:check`。Reference 先检查 C8 DB allowlist，清除 paid key、强制 mock；生产 env check 在另一个安全进程进行。

可靠性边界：Note Proposal 若唯一错误为超长，可压缩该 Proposal 一次，初次生成与压缩共享 30 秒 deadline；保留数字、实体、否定、不确定性及适用限制，最终仍执行严格长度校验。其他 Provider 错误安全失败，不产生半 Action 或伪报告。

Staging Full Smoke：Register/Login → synthetic TXT/PDF → READY → private search → Task → private Run → external enabled Run → Grounded Report → Citation/source → Proposal → Human approval → replay → one Note。再检验 bucket anonymous denied、MCP HTTPS、recovery。C8 的破坏性实验只能在 Test/Eval，不能迁到 Production。

Production Safe Smoke：显式 opt-in，只用一个 synthetic TXT、一个 bounded mixed Run，检查 health/HTTPS/auth/READY/Citation/Proposal/Approve/replay/source。最多 60 HTTP calls、8 分钟，Run 还有现有预算。数据用 [SMOKE]/smoke- 前缀，不为清理加用户删除 API。

:::check{title="你能拿出的运行证据"}
- 空 DB 的正式 migration 和 vector(1024) scoped retrieval。
- 容器真实运行，health 不依赖第三方。
- anonymous object GET denied，signed GET 可用；真实浏览器 CORS/upload 成立。
- 生产 HTTPS，MCP HTTPS，没有 local HTTP flag。
- replay 同一个 Note，不因 recovery 自动写入。
- C8 25-case 全量 PASS，全部 Hard Gates 和 baseline 不回退。
:::

:::prompt{title="4 · 只读 Release Verification"}
```text
只读核对实际命令、镜像运行、migration、HTTP smoke、C8 Eval、audit 和日志证据。
区分 Local production-like、Staging、Production。不得把 localhost、mock storage、静态配置检查算成生产证据。
逐项验证部署 SHA、private bucket匿名拒绝/签名访问、浏览器CORS、HTTPS/MCP、recovery、approval replay。
把 Release Matrix 更新建议写出来，不修改文件；未知项明确 NOT VERIFIED。
保留 C8 real默认词法8/9、optional Judge9/9、lexical_fidelity_flags=1及人工语义复核限制。
发现阻断项就说明实际条件，不能用平均分覆盖安全 Hard Gate。不要自动调用付费 Provider，不操作 Git。
```
:::

实际 cloud 不可用时可以完成本地验证，记录 **LOCAL PRODUCTION-LIKE VERIFIED / CLOUD DEPLOYMENT NOT VERIFIED**。这一状态不能勾选“Production Safe Smoke 已通过”，也不能宣称 Production Ready。等真实目标可用再完成该项，无须伪造 URL。

## 170～195 分钟：用事实完成作品集首页

到这里再写 README。中文主名 **AI 研究工作台**，副名 AI Research Workspace，说明是 AI 研究 Agent 毕业项目实战。

先说用户为什么需要它，再说主价值链：Private Knowledge → Research Agent → Evidence → Grounded Report → Human-approved Knowledge。技术栈放后面。

`docs/architecture.mmd` 给面试官二十秒看懂主边界；第二张 Trust Boundary 画出 model proposes、server validates、read-only tools，以及 Human Review → exact approval → transaction → KnowledgeNote。

:::prompt{title="5 · 基于证据写 README 与 Architecture"}
```text
阅读 Product Brief、真实代码与 release-evidence/Eval 验证报告，完善中文 README、docs/architecture.md 与 architecture.mmd。
结构包括 Demo、Why、What it does、Product Flow、Features、Trust & Safety、Architecture、Eval、Stack、Local Run、Deployment、Known Limitations。
只写真实事实和真实测过的数字；没有HTTPS部署就明确未部署，不填写假URL。
画系统图和Trust Boundary，不画无依据的新服务。保留同步执行/no worker/stale fail-closed/provider变化/小数据集/人工判断限制。
C8 deterministic实际25/25与Hit@3 10/10只代表固定数据；real词法8/9、Judge9/9仍有lexical_fidelity_flags=1和人工语义复核。
禁止虚构用户量、效率、准确率或生产可用性。报告改动供我审核，不操作Git。
```
:::

## 195～220 分钟：三分钟讲清你做了什么

Demo 用 synthetic data，提前准备已完成 Run。耗时等待可剪辑，但注明“预先完成的 Run”，不要剪出不存在的实时速度。

| 时间 | 演示 |
|---|---|
| 0～20 秒 | 用户痛点与定位 |
| 20～45 秒 | 私人资料上传/READY |
| 45～75 秒 | ResearchTask 与来源策略 |
| 75～115 秒 | Brief/Steps、private + external evidence |
| 115～145 秒 | Grounded Report、Citation snapshot/source |
| 145～165 秒 | Proposal 审核、Approve、one Note |
| 165～180 秒 | Eval 证据与一个真实局限 |

简历用“问题 + 设计 + 结果/验证”写三四条，不是技术名词列表。不要写效率提升80%、准确率99%、服务1000人，除非真有测量。

:::prompt{title="6 · Demo、Resume、Interview 与复盘"}
```text
根据真实代码和验证证据生成 docs/demo-script.md（180秒）、resume-project.md、interview-guide.md、retrospective.md。
中文主表达；Demo仅synthetic；简历3～4条问题/设计/验证结果，不虚构业务指标。
面试涵盖Product/monolith/Workspace/Task-Run/RAG与chunk locator/Citation snapshot/bounded runtime/MCP metadata与evidence/ownership/exact approval/idempotency/Eval/production recovery。
每题给结论→原因→代码路径→证据→局限的回答框架和追问，不给长篇背诵答案。
复盘回答砍掉的需求、技术取舍、Eval暴露的问题、重做选择、100倍用户、团队权限、Note回RAG的自反馈污染。
只讨论未来queue/worker/RBAC/OCR/note indexing，不实现。引用实际Eval数字及告警。不要操作Git。
```
:::

## 最后：你能解释，才算你的项目

学生必须自己决定部署标准、接受风险、环境与 Secret 所有权、恢复策略、哪些成果值得宣称。AI 可写 Docker/scripts/docs，但你必须核对镜像、migration、ownership/approval、失败恢复与 smoke。不能用 AI 的“看起来安全”替代运行结果。

:::prompt{title="7 · 最终只读 Delivery Audit"}
```text
只读审核最终项目：Product/Security/Reliability/Quality/Production/Portfolio/Honesty。
把每个README/简历数字映射到证据；检查部署SHA、剩余NOT VERIFIED、Secret、dependency High/Critical、C8 Hard Gates、recovery与人工审批边界。
检查Demo不会暴露私人资料，材料没有虚构URL/准确率/用户数。
不修改文件、不付费调用、不操作Git、不创建tag、不解锁课程。输出PASS/PASS WITH CHANGES/BLOCKED以及具体剩余动作。
没有真实云验证就明确CLOUD DEPLOYMENT NOT VERIFIED，不能给Production Ready。
```
:::

查看并保存自己的版本：

```bash
git status
git diff
git diff --check
```

确认 .env、DATABASE_URL、安全 Secret、test DB、logs、signed URLs 都未进入 Git。提交信息可用 `deliver research workspace production version`。固定 SHA；后续 Demo 必须追溯到实际部署 SHA。

:::warning{title="课程发布仍有一道独立审查"}
C9 仍为 Internal Authoring。Capstone 暂未解锁，正式 Stage 课程仍为29节。不改 entitlement、购买入口、统计，不创建 capstone-v1 tag。下一轮单独执行 Final Capstone Release Readiness Audit。
:::

毕业项目现在应当既能操作，也能解释：你为什么这样设计、如何证明边界、失败时怎样处理，以及哪些事情还没有被验证。

可靠性补充：AI Proposal → One bounded compression → Grounded deterministic fallback。仅当两次结果都只是 content 超长时，服务器从当前 Run 已持久化并验证的 Grounded Report 中，以完整 Claim 确定性组装不超过 1850 字符的可编辑草稿，复用初始合法标题；不截断、不增加事实、不再调用模型。安全日志区分 MODEL、MODEL_COMPRESSED、GROUNDED_FALLBACK。这是安全降级，不代表 AI 总结成功。模型负责可读性，服务器负责产品契约；草稿仍为 PROPOSED，必须经用户 Edit / Reject / Approve，sourceRunId 保留报告与引用来源。其他错误继续安全失败。
