# AI Foundry Capstone｜Phase 1 Architecture Specification

> 历史规格：Phase 2 已将「从 Stage 4 Final Reference 裁剪 Capstone Base」改为 Greenfield Engineering Bootstrap。Capstone 现为 C1～C9；课程入口与学生起点以 `docs/capstone-phase-2-validation.md` 为准。下文保留 Phase 1 的决策过程，不再作为当前实施指令。

状态：工程规格，供 Capstone 产品开发与课程制作使用。本文件不注册课程、不修改 Stage 1～4、不发布正文。依据 Phase 0 产品蓝图与仓库 `dc5e347` 的实际文件审计整理。

## 1. Repository Audit

### 仓库边界

根仓库是 AI Foundry 课程平台，不是学员 AI 产品：平台前端为 React 18 + Vite + TypeScript，服务端为 Express 5 + TypeScript，课程平台数据库为 Prisma 6.19.3 + PostgreSQL；前端组件使用 Tailwind CSS。平台没有 Next.js、模型 SDK、pgvector 或 MCP 依赖。Stage 3/4 学员项目位于 `starter/` 和 `course-content/internal/`，使用独立 Next.js 项目与数据库，不连接课程平台数据库。

| 能力面 | 仓库实际实现 |
| --- | --- |
| 学员项目 Web | Next.js 15.5.26、React 19.0.8、TypeScript；Stage 4 Starter 锁定依赖版本，Prisma 为 6.19.3。 |
| 数据 | PostgreSQL；Stage 3/4 的本地 Compose 与独立 migration。Stage 3 已验收 PostgreSQL 17 + pgvector 0.8.0，Embedding 为 `vector(1024)`。 |
| AI Provider | 百炼 OpenAI-compatible HTTP 适配器，自有服务端 fetch / SSE / Embedding 实现；模型基线 `qwen3.7-flash`、`text-embedding-v4`。没有 AI SDK 依赖。 |
| 身份 | Stage 4 Starter 的服务端 Session、HttpOnly Cookie、密码哈希和 ownerId 查询约束；沿用 Stage 2 的个人数据隔离形状。 |
| RAG | KnowledgeDocument / KnowledgeChunk、确定性切块、1024 维向量、参数化 pgvector Top-K、owner 过滤、证据充分性和 citation 校验。 |
| Agent / MCP | Stage 4 的有界 Agent Runtime、固定 Tool Registry、strict Zod、AbortSignal、预算与停止状态；官方 MCP SDK 2.2.0，Streamable HTTP。 |
| Tests / Eval | Stage 3 有 Provider、流、pgvector 与 12 题 RAG 验收；Stage 4 有单元/HTTP/隔离 PostgreSQL 回归和 20 个主案例、73 个子案例的确定性 Eval。 |
| Build / Deploy | 独立项目 `npm run build`；生产 `vercel-build` 运行 Prisma generate、`migrate deploy`、migration status、Next build。Stage 3 Reference 有真实 Vercel + Neon 生产验收；Stage 4 README 明确 Agent 项目尚未完成生产部署。 |
| Lint | 课程平台根 `package.json` 没有 lint 脚本。Capstone 新项目若把 lint 列入验收，需在其独立 package 内明确配置 ESLint；不能把不存在的根脚本写成现有能力。 |

### 当前课程与资产管理

- 课程目录是 `src/data/courses.ts` 的静态 `stages`；`prisma/seed.ts` 将目录同步到平台的 `Stage` / `Lesson`，数据库负责发布状态、Preview、权限与进度。正文是 `course-content/stage-N/*.md`，内部参考实现和实验在 `course-content/internal/stage-N/`。
- 正文采用 YAML frontmatter + 受限 Markdown renderer；稳定的 `checkKeys` 全站唯一。具体规则见 `docs/lesson-renderer-v2.md` 与 `course-content/README.md`。
- Stage 4 Starter 是一个完整 Stage 3 AI 知识工作台，包含 4 次 migration；Stage 4 参考实现由 `scripts/assemble-stage4-reference.mjs` 把 Starter 与逐课 `common` overlay 组装到 `.runtime/`。第 6 课 overlay 增加 AgentRun / AgentStep / AgentAction 和第 5 次 migration，第 7 课加入 Eval。这个逐课组装模式比复制八个完整仓库更接近本项目现有约定。
- 正式独立 Starter 来源目录采用 `starter/stage-4/`，下载包是白名单构建；构建/检查约定见 `scripts/build-starter.ts`、`scripts/starter-package.ts`、`docs/starter-delivery.md`。Capstone 课程内容尚未注册；本轮不改 `courses.ts`、seed 或发布标志。
- 目录元数据有一处需与项目完成度区分：`src/data/courses.ts` 当前将 Stage 3 的 7 节设为 `isPublished: false`，Stage 4 的 8 节为 `true`；Stage 3 验收文档也记录其当时未发布。这里报告的是仓库中的发布位，不否定本任务给定的“Stage 1～4 项目工作已完成”，本轮不调整该历史状态。
- Git 当前没有课程级 tag；阶段 Reference 主要由提交、overlay 与本地 `.runtime/` 装配目录表达。课程平台根目录的 `.runtime/` 不应作为学员交付。当前工作树有既存未跟踪的 Stage 4 / UX 审阅文件，本轮规格不触碰。

### Stage 3 / Stage 4 能力复用表

| 能力 | 当前已有实现 | Capstone 是否复用 | 如何复用 |
| --- | --- | --- | --- |
| Authentication / Session | Stage 4 Starter `lib/auth.ts`；User、Session、HttpOnly Cookie；所有资源按 Session owner 隔离 | 是 | 从 Capstone Base 保留服务端 Session、限流和查询边界；Research API 只接受当前 Session，不接受浏览器 ownerId。 |
| Workspace | 尚无 Workspace；产品按 User / ownerId 隔离 | 有限复用 | Capstone 建立每位 User 唯一的 personal Workspace，做产品导航和所有数据的根作用域；不加团队、邀请或 RBAC。 |
| KnowledgeDocument / Chunk | Stage 4 Starter 有可用知识文档、Chunk、1024 维向量和 pgvector | 是，扩充 | 保留检索结构和 owner 约束；增加私有文件导入、文件元数据、处理状态、解析定位和可重试索引。 |
| Embedding / Retrieval | Stage 3/4 有真实 Provider、Top-K、预算限制、owner filter | 是 | 复用 Provider、参数化向量 SQL 与预算 adapter；为文件来源增加 page / offset 元数据和检索调试页。 |
| Citation / Source Preview | 稳定源 ID、限于本轮 Retrieved Set 的验证、无证据拒答已有实现 | 是，扩充 | 复用验证契约；将检索来源快照绑定 ResearchRun，使文档重索引/删除后历史报告仍能展示当时引用。 |
| Agent Loop / Stop | Stage 4 有有界 Loop、直答和 Tool 分支、max steps/tools、timeout/cancel/budget 状态 | 是，作为库能力 | 移植 runtime 和测试，不再讲如何从零造 Loop；Capstone 开发重心是把它编排进 ResearchTask、证据集和可读报告。 |
| Tool Registry / Read Tool | 固定服务端 allowlist、strict Zod、Session owner 搜索、MCP adapter | 是 | 原样保留信任边界；按 Capstone Research 工具增加输出 schema、trace 摘要和来源标识。 |
| MCP | 公开 `research_reference` MCP、Streamable HTTP、认证/限流/结果校验已经做过 | 是，换成真实研究价值 | 复用 MCP client 与安全 adapter；接入受限的公开学术元数据搜索（建议 OpenAlex，通过自建只读 MCP adapter），验证外部来源 provenance。不是再教协议或再接静态 echo 工具。 |
| Human Approval | HMAC 参数绑定、确认路由、事务锁、Action key 和重复提交幂等已在 4.3 / 4.6 完成 | 是，业务化 | 保留服务端授权和事务语义；把 `save_research_note` 从 Stage 4 Resource 映射为新 `KnowledgeNote`，展示报告来源并做端到端授权回归。 |
| Run / Step / Action | PostgreSQL 状态、刷新后查看、paused Resume、并发确认和 Action 幂等已验证 | 是，产品化 | 采用已验证的状态机与持久化时机；补齐 ResearchTask 关系、报告与 Citation 快照、用户可读 Run 时间线。 |
| Eval | Stage 4 20 案例 / 73 子案例、安全硬门槛；Stage 3 12 题 RAG Eval | 是，作为基线 | 将两者合为 Capstone 全链路回归，并新增上传解析、PDF page citation、报告完整度和跨页面流程用例；不是从 Lesson 7 才开始。 |
| Deployment / README | Stage 3 产品已生产部署；Stage 4 Agent 目前 deployment-ready only | 是，新增交付 | 使用独立 Capstone 数据库、对象存储和 HTTPS 项目；重新完成生产 migration、Smoke、公开 README 与演示，不把 Stage 3 的部署当作 Capstone 上线证明。 |

## 2. Capstone 与 Stage 4 的产品差异

Stage 4 已经交付并教授受限 Research Agent 的核心工程能力。Capstone 的课程价值来自把这些能力重新组合成有研究生命周期的独立产品，而不是再教一遍 Agent：

| 维度 | Stage 4 已有基线 | Capstone 新增验收 |
| --- | --- | --- |
| 产品完整度 | 在个人知识工作台里展示 Agent Experiment / Persisted Run Lab | 独立 AI Research Workspace：Workspace、资料、研究任务、报告、Runs 都是正式产品对象。 |
| UI | 实验面板证明工具、审批和 Resume | Dashboard、Knowledge、Search、Research History、Report、Run Detail 的连续任务流和来源查看。 |
| 数据建模 | Resource、KnowledgeDocument/Chunk、AgentRun/Step/Action | Workspace、Document ingestion lifecycle、ResearchTask、ResearchRun、ResearchCitation snapshot、KnowledgeNote；不再把研究笔记伪装成 Resource。 |
| 知识库 | 粘贴或创建文本资料、检索和 Preview | 有限制的 PDF / Markdown / TXT 上传、解析状态、失败恢复、页码/偏移、来源预览和索引重建。 |
| Research Workflow | 单次目标的受限工具 Workflow | Scope/Brief → 多轮 evidence gathering → grounded report → 可保存知识笔记；Task 与多次 Run 分离。 |
| 可视化 | 技术验证 Timeline | 产品级 Run 时间线、Evidence 列表、报告引用跳转和失败原因。 |
| 工程可靠性 | Agent 级状态/Action 硬门槛 | 文档处理、Run、报告、外部来源和 Action 的全链路失败状态、幂等重试、历史快照与交付 Smoke。 |
| Eval | Agent 工具/安全行为 | 合并 RAG + citation + agent + approval + persistence，并新增文件/报告端到端回归。 |
| Deployment | Stage 4 未独立完成 HTTPS Agent 生产验收 | Capstone 独立生产部署、云 DB migration、私有对象存储、真实外部来源和用户流程 Smoke。 |
| GitHub / README | Agent 示例项目说明 | 独立毕业项目仓库、架构与安全说明、Eval 报告、限制、演示脚本和可复现安装。 |
| 简历 / 面试 | Stage 4 讲 Tool / MCP / HITL 实现 | Capstone 讲产品建模、证据可信链、失败恢复、设计取舍、测试证据与真实交付结果。 |

Phase 0 中 Lesson 4 从零构建 Agent Loop、Lesson 5 首次引入 MCP、Lesson 6 首次教 Approval、Lesson 7 首次教 Persistence / Eval，与已经完成的 Stage 4 重复。Phase 1 保留这些功能验收，但将教学目标改为产品集成、证据来源、数据生命周期与系统级回归；详细替换见 [课程与交付计划](capstone-phase-1-delivery-plan.md)。

## 3. Final Architecture

### 技术边界

Capstone 是独立 Next.js 单体应用：Next.js App Router / Route Handlers、React、TypeScript、Prisma、PostgreSQL + pgvector；复用 Stage 4 锁定的 Provider Adapter、Zod、官方 MCP SDK、Session 代码和 Agent Runtime。平台课程应用及其数据库完全在产品运行路径之外。外部服务只有百炼 Chat/Embedding、私有对象存储、云 PostgreSQL，以及一个由应用端 MCP adapter 访问的公开学术元数据来源。

```text
Browser
  └─ Next.js UI + Route Handlers
       ├─ Auth / Workspace boundary
       ├─ Knowledge service ── private object storage
       │       └─ parser → chunker → embedding → PostgreSQL/pgvector
       ├─ Research service → bounded Agent Runtime → Tool Registry
       │       ├─ searchKnowledge → owner/workspace-filtered pgvector
       │       ├─ searchExternal → MCP client → public scholarly metadata
       │       └─ proposeSaveNote → Approval → transactional KnowledgeNote
       └─ Eval / Smoke runner
```

不引入 Multi-Agent、browser agent、任意 URL fetch、复杂 queue、微服务或多向量数据库。MCP 只暴露固定只读学术搜索能力。公开结果在页面显示为外部来源；不得混称成用户自己的知识 Chunk。

### Pages

| 页面 / 路由 | V1 决定 | 原因 |
| --- | --- | --- |
| Dashboard `/dashboard` | 保留 | 展示文档就绪数、近期研究、失败任务和继续入口。 |
| Knowledge `/knowledge` | 保留 | 文档列表、状态、上传、详情与原文 Preview；上传用页面内 Dialog。 |
| Knowledge Search `/knowledge/search` | 保留为独立调试面 | 显示命中 Chunk、相似度、文档、页码/偏移；不能把 Retrieval 只藏在 Research 报告后面。 |
| Research `/research` | 保留 | 新建 Task 和历史列表共用一个区域，避免把 New Research 与 History 拆成空壳导航。 |
| Research Detail `/research/[taskId]` | 保留 | 查看 Scope、Runs、当前/历史报告及 Source snapshots；Task 与一次 Run 分开。 |
| Runs `/runs`、`/runs/[runId]` | 保留 | 最近/失败 Runs 列表与时间线详情，支持继续查看、Resume 或取消适用状态。 |
| Settings | V1 不建独立页 | 当前无用户可控 Provider、Team 或复杂偏好；账号/Workspace 名称可在轻量菜单修改。 |

主导航是 Dashboard、Knowledge、Research、Runs。Citation 点击后在 Research Detail 内打开来源侧栏/弹窗，不增加一级导航。

### Database model decisions

Capstone Base 从 Stage 4 最终 Reference 干净装配后建立独立数据库基线；下列模型是 Capstone 自己的 schema，不修改课程平台 `prisma/schema.prisma`。Stage 4 已有等价能力先沿用，新增产品语义只在新项目 migration 中调整。

| Model | 决定的职责 | 关键字段 / 约束 |
| --- | --- | --- |
| User / Session | 复用 Stage 4 身份 | 沿用现有主键形状和 Cookie；私有读取、确认和写入均由 Session 解析出的 Workspace 决定。 |
| Workspace | 新增个人工作区根 | `id, ownerId UNIQUE, name, createdAt, updatedAt`；V1 每人一个，不引入 WorkspaceMember / RBAC。 |
| KnowledgeDocument | 扩展 Stage 4 的同名模型 | `workspaceId, title, originalName, mimeType, byteSize, objectKey, contentHash, status, extractedText, pageCount, parserVersion, indexingVersion, errorCode`；`objectKey` 指向私有对象，不存公开 URL。 |
| KnowledgeChunk | 扩展 Stage 4 的同名模型 | 保留 `documentId, position, content, embeddingModel, embeddingDimension, embedding vector(1024)`；新增 `page, startOffset, endOffset, citationKey UNIQUE`，稳定到该索引版本。 |
| ResearchTask | 新增用户研究请求 | `workspaceId, title, query, brief Json?, createdAt, updatedAt`；一个 Task 可多次 Run，编辑目标不覆写旧 Run。 |
| AgentRun → ResearchRun | 沿用 Stage 4 Run 能力并采用领域名 | `taskId, status, stopReason, errorCategory, startedAt, completedAt, currentStep, report Json?`；Workspace ownership 经 task 关系校验。 |
| AgentStep → ResearchStep | 沿用有序审计轨迹 | `runId, position UNIQUE, kind, status, toolName?, inputSummary?, outputSummary?, latencyMs?, usage?, errorCategory?, startedAt, completedAt`；只存脱敏摘要，不存原始 Prompt / 私有全文。 |
| AgentAction | 沿用独立副作用实体 | `runId, stepId, toolName, canonicalArgs, status, idempotencyKey UNIQUE, approvedAt, executedAt`；仅服务端从 Session 获取身份，Action 和 Run 均做归属校验。 |
| ResearchCitation | 新增来源快照 | `runId, citationKey, sourceType, documentId?, chunkId?, sourceRevision?, title, excerpt, locator?, sourceUrl?, externalId?`；`(runId,citationKey) UNIQUE`。引用来源删除/重索引后，历史 Run 仍能显示当时快照。 |
| KnowledgeNote | 新增真正的研究笔记实体 | `workspaceId, sourceRunId, title, content, actionKey UNIQUE, createdAt`；由已确认 AgentAction 事务创建，不写入通用 Resource。 |

说明：不再创建重复的 `Document` 模型；扩展 `KnowledgeDocument`。不将 Action 合并进 Step。ResearchCitation 是每个 Run 的证据快照，不是全局来源主表。KnowledgeNote 和原 `Resource` 含义不同，不能把 Research Note 继续塞进 Resource。V1 不建 `ResearchMessage`、多成员、独立 Evaluation 数据库或计费表。

文件上传使用私有、持久化的 S3-compatible object storage adapter；本地通过 MinIO/同协议服务配置，部署用独立 Bucket。Next/Vercel 本地磁盘不是持久存储。对象下载由服务端 Session 授权后返回短期 URL 或代理流。V1 单文件上限 10 MB，白名单仅 PDF/MD/TXT；文本 PDF 可解析，扫描件/加密 PDF 明确 `FAILED_UNSUPPORTED_PDF`，不加 OCR。限制文档数量和总存储量，避免课程 Demo 无限累积成本。

### Knowledge Pipeline

```text
Upload → Parse → Chunk → Embed → Retrieve
```

1. **Upload**：`POST /api/knowledge/documents`；先验证 Session、扩展名/MIME/签名、10 MB 上限和数量，再存私有对象并建 `UPLOADED` 文档记录；重传相同 SHA-256 可提示已有资料或显式创建新版本。
2. **Parse**：服务端 `knowledge/parser.ts`；PDF 用成熟 PDF text extraction library，MD/TXT UTF-8；保留页码/文本偏移。解析在同步请求内限大小，不启 queue。空文本、加密/扫描 PDF 或解析异常转为稳定错误类别。
3. **Chunk**：`knowledge/chunk.ts` 按确定性字符/token 上限分块，保留 overlap、page、start/end offset；同一 `indexingVersion` 可重复生成相同顺序。写 Chunk 前清理失败版本的部分数据，最终文档切至 READY。
4. **Embed**：复用 Stage 3/4 Provider Adapter；限制每次 chunk 数和输入字符数，验证 `text-embedding-v4` 1024 维。数据库扩展沿用参数化 SQL + pgvector，不让 Prisma Unsupported vector 变成无校验原始 SQL。
5. **Retrieve**：先以 Session 得到 Workspace，再在 SQL 的 `KnowledgeDocument.workspaceId` 谓词内做 pgvector Top-K；不能先搜全库再在应用中过滤。返回 Chunk ID、分数、标题、页码/偏移和限长 Preview。零命中给明确空态。

同步处理的 V1 可将 `PROCESSING` 暴露为请求中的中间状态，但浏览器重载后的结果必须来自数据库；无 queue 的限制要在 README 说明。重试对同一文档版本幂等，不能留半套 READY chunks。

### Agent Runtime / Research Workflow

- **复用而不重教**：移植 Stage 4 `agent-runtime.ts`、Registry/Schema、Provider Adapter、预算、取消和 stop state；Capstone 的服务层提供 `createResearchRun(taskId, sessionContext)`。浏览器不能提交 `ownerId`、工具实现、risk 或 status。
- **Scope / Brief**：在 Run 开始时生成结构化 brief（目标、子问题、时间范围、预期报告结构）；Schema 验证失败进入受控错误或有限重试，不自动扩大上下文。
- **Loop**：每个模型调用前检查 deadline/cancel、最大步骤、Tool 次数和 Provider units；单次接受一个 Tool call。V1 上限先取 Stage 4 已测配置 `maxAgentSteps=4`、`maxToolCalls=3`，用 Capstone fixed eval 调整，不提供无限搜索。
- **Tools**：只有 `search_knowledge(query)`、`search_external(query, filters)`、`propose_save_note(title, content, citationKeys)`。前两者只读；写 Tool 只产生 Action Proposal。所有参数服务端 strict Zod，工具输出是不可信数据。
- **Stop**：`completed`, `waiting_approval`, `paused`, `failed`, `cancelled`, `max_steps`, `max_tools`, `budget_exhausted`。将 max limit 映射为可解释结果；不把超限假装成完整报告。
- **Persistence**：先创建 ResearchRun，再在每个模型/Tool 执行前写 started Step，完成后更新 outcome、时长和脱敏摘要；工具结果作为后续模型输入前先保存安全 checkpoint。失败事务不生成伪造成功 Step。
- **Approval**：Action 参数规范化并持久化，UI 展示精确参数和引用；批准端点重新读取 Session、Run、Action 并验证短期签名，不接受客户端的新参数。事务锁 Action，创建 KnowledgeNote 并保存 `actionKey`；重复确认返回同一结果。Reject/Cancel 有明确终态。
- **Resume**：Resume endpoint 只允许从具有持久化 checkpoint 的 `paused` 状态原子取得执行权；`waiting_approval` 是重新读取原提案并由用户批准/拒绝，不等同于 Resume。读工具可从最后安全 checkpoint 重跑，写操作先检查 Action/业务 actionKey，绝不重放已完成写入。无后台 Worker 时，`running` 进程崩溃不承诺自动拾取；检测到过期 run 时显示 failed/retry，不伪称自动恢复。
- **Final report**：用结构化 JSON 生成 Executive Summary、Key Findings、Analysis、Conclusion、citation keys；服务端只接纳本 Run Retrieved Set 内的 citation key，并从已验证 evidence 快照建立 ResearchCitation。无证据则报告明确标注资料不足。

### Citation Contract

1. Retriever 为真实 `KnowledgeChunk.citationKey` 生成模型可见 ID，例如 `K:<citationKey>`；MCP 来源使用其规范 URL/外部 ID 映射成 Run 局部 `E:<stableExternalId>`。模型不能自造来源文本或文档名。
2. 模型输出每条 finding 的 `citationKeys`；服务端要求它们属于本次 Run 的已检索集合，去重后写入 `ResearchCitation` snapshot。缺失、伪造或不可映射引用视为不合约结果，不显示为已验证引用。
3. UI 把 `[1]` / citation key 映射到该 Run 的 citation snapshot，显示来源类型、标题、原文片段、页码/位置或外部 canonical URL。内部来源支持跳到文档预览；外部来源用安全的 HTTPS 链接。
4. 删除或重索引文档不级联删除 ResearchCitation snapshot。Chunk 外键可 `SetNull`，Run 快照仍可解释历史报告；权限撤销/用户删除按产品删除策略清除关联数据。

### MCP Scenario

V1 使用一个只读 `search_external_references` MCP tool，面向学术研究常见的“个人资料缺乏最新/外部来源”问题。建议由自建 MCP adapter 调用 OpenAlex 的作品/作者元数据搜索，返回标题、作者、年份、摘要、DOI/URL 和 OpenAlex ID；不做通用 Browser Agent、任意 URL 抓取或网页指令执行。MCP 让外部能力 schema 化并作为 Tool Registry 的 adapter；它不是权限系统，结果仍需本地 schema/host 校验、速率限制、超时与 citation provenance。真实 API 不可用时固定 fixture/stub 供测试，生产 UI 显示外部搜索失败并继续/停止策略。选定 OpenAlex 前需复核服务条款、额度与当前 MCP server 可用性；服务端将 provider/source adapter 可替换。

## 4. Phase 1 Decisions / Risks

- **L1 Starter 采用 C 的修订版**：建立独立 `starter/capstone/`，内容来自 Stage 4 最终 Reference 的干净装配与精选可复用服务；保留 Agent、审批、持久化和 Eval 后端，替换 Agent 实验 UI，提供干净的 Capstone scaffold，但缺少 Workspace / Research 正式产品骨架。不是从 Stage 4 Starter（无 Agent）重新开始，也不直接让学员在 Stage 4 项目继续加页面。
- **Capstone Base** 是新项目根提交，不是 Stage 5 知识讲义。它包含 Stage 4 完成能力和可运行 mock/fixture；L1 Starter 再省略本课的产品壳/核心任务体验。Reference 以 overlay 生成并测试；最终下载项目独立于课程平台数据库、环境变量和 Git 历史。
- **范围冲突调整**：Agent Loop、MCP protocol、HITL 原理、Action 幂等和基础 Resume 已在 Stage 4 覆盖，Capstone lessons 改为应用这些既有能力，并验证它们与文件、报告和 Citation 连通。阶段验收仍包含所有能力，但不重新上课。
- **持久文件存储是新增系统依赖**：Vercel ephemeral disk 不能承担上传文档持久化；需要云对象存储与本地兼容实现、额度和删除策略。若课程运维不希望维护对象存储，Phase 2 可以缩成粘贴文本/Markdown，但那会降低相对 Stage 3/4 的产品差异；本规格选择保留受限文件上传。
- **生产限制**：无 queue 时文件索引与 research run 必须有明确体积/时间预算；不承诺长任务后台继续运行。任何真实外部数据都需保留来源 ID/URL 与条款边界。
- **迁移隔离**：课程平台的 Prisma migrations / seed 只管理平台 catalogue。Capstone migrations 在独立 Starter 项目的 `prisma/migrations/`；部署只 `migrate deploy`，绝不对生产用 `db push`、`migrate reset`。Stage 4 五次 migration 可作为 Base lineage，第一课增加 Workspace/Task 等新 migration。
