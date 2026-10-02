# Stage 4｜AI 研究 Agent 课程蓝图（Phase 0，待人工审核）

日期：2026-10-02。基线 `ac548e166ce1cb26e55b198e65e02a9b64c03c0e`。本文件是内部设计，不修改 `courses.ts`，不发布课程，也不编写 4.1 正文。

## A. Positioning

连续产品：个人知识工作台 → 全栈知识工作台 → AI 知识工作台 → **AI 研究 Agent**。Stage 3 让模型读取资料并回答；Stage 4 让模型在服务端规定的工具、权限、预算和停止条件内提出动作。控制链为 Model decides → application validates → policy checks → tool executes → result returns → loop continues or stops。模型和工具结果均不获得应用权限。

## B. Input / Exit

入口是 Stage 3 最终能力，或等价的 Stage 4 Starter：Auth、Resource、知识文档与 Chunk、pgvector、Chat、Structured、Streaming/Cancel、Embedding、ownerId Top-K RAG、Verified Citation、评估与最终可靠性修复。购买 Stage 4 不以保留 Stage 3 项目为前提。出口是能解释并实现受限 Agent Loop、工具定义和验证、读写风险、人工审批、MCP、Workflow、状态持久化与 Resume、写入幂等、注入防御、行为评估和线上交付。

## C. 8 Lessons

保留 4.1～4.8 的顺序，调整标题和时长；4.1 先教停止条件，4.3 前置审批边界，4.6 才引入持久化。4.4 的 MCP 与 4.2 的原生工具各教一层，不重复教 Agent Loop。预计合计约 12～15 小时动手时间，现有 45～60 分钟占位普遍偏低。所有课沿用「先看到结果 → deterministic path → 动手 → 观察 → 故意失败 → 解释 → 真实调用 → Git diff → 保存版本」。每课制作一张生图式教学图，不制作纯 SVG 工程图。

| 课 | 建议标题 / 时间 | 输入 | 学生动作与可观察结果 | 唯一概念与故障练习 | 边界 / 教学图 |
|---|---|---|---|---|---|
| 4.1 | 从普通 AI 调用到受限 Agent Loop；75–90 分钟 | Starter、Chat Provider | deterministic echo 工具跑直答与工具两条分支，显示 `completed`、`max_steps` | Loop、严格参数验证、step limit；故意返回未知工具和坏 JSON | 不接业务工具、MCP、写入、DB；普通 AI vs Loop |
| 4.2 | 搜索自己的知识库：第一个业务只读 Tool；75–90 分钟 | 4.1、Stage 3 Top-K | `search_knowledge(query)` 调用 Embedding、ownerId 检索，返回标题、位置、短预览和相似度 | Session 身份与工具结果仅为数据；故意让 Bob 的高相似 Chunk 参与检索，证明不可见 | 不返回向量、ownerId、全文；Model → Tool → Result → Model |
| 4.3 | 提议、确认、执行：安全保存研究笔记；90–120 分钟，可分两次 | 只读工具、Resource CRUD | `save_research_note` 生成待确认提案，界面展示精确标题/内容，确认后执行相同参数 | 写工具审批、签名和参数绑定；故意篡改参数、过期 token、重复确认 | 不做删除或批量写；纯签名尚不防 replay；Proposal → Confirm → Exact Write |
| 4.4 | 用 MCP 接入外部只读能力；90–120 分钟，可分两次 | 内部 Tool Registry | 自建 `research_reference` MCP server，HTTP client 列表和调用，再经 adapter 进入 Registry | Tool 是能力，MCP 是接入协议；故意返回额外字段和恶意结果 | 主线 Streamable HTTP；stdio 概念演示；不接私有无鉴权工具；Agent → Registry → Client → Server |
| 4.5 | 从搜索到笔记的多步 Workflow；90–120 分钟 | 4.2、4.3、4.4 | 搜索、综合、提出保存、等待确认、执行、最终答复；显示每步状态 | step/tool/timeout/cancel/budget 终态；故意触发循环与取消 | 暂不引入持久化，审批跨请求只靠短期 token；Workflow State Flow |
| 4.6 | 持久化 Agent Run 并安全恢复；120 分钟，可分两次 | Workflow、Prisma | 落库 Run/Step/Action；重启后 Resume，同一确认动作只产生一条笔记 | 状态机、事务与唯一幂等键；故意并发/重复 Resume | 此课才提交正式 migration；Persist → Pause → Resume → Idempotent Write |
| 4.7 | 用固定案例评估 Agent 行为；90–120 分钟 | 完整运行链 | 执行案例矩阵，分别输出完成率、安全硬指标、时延与用量 | 程序观察真实 DB 与工具调用；故意植入文档注入 | 安全不使用 LLM-as-a-Judge；Agent Eval Matrix |
| 4.8 | 把 AI 研究 Agent 交付成作品；75–90 分钟 | 评估通过 | HTTPS demo、README、架构图、工具清单、审批/MCP/Resume 演示和三分钟脚本 | 线上限制与失败说明；故意演示预算耗尽 | 不发布 Stage 4 课程时提前部署；Final Production Architecture |

## D. Agent Runtime Architecture

Next.js Route 从 Session 获取用户，建立一次 AgentRun 的短期 execution context；服务端固定 system policy、Tool Registry 与模型配置。每轮先检查 deadline/cancel、step/tool 上限和 Provider 预算，再调用模型。直答终止；最多一个 `tool_call` 经 Registry 校验和 policy，工具结果以 `role: tool` 数据回传。多调用受控拒绝。默认 `maxAgentSteps=4`、`maxToolCalls=3`；4.1 的教学案例可用 3 步，4.2 的一次搜索 + 最终回答用 4 步留出一个受控余量。终态为 `completed`、`waiting_approval`、`failed`、`cancelled`、`max_steps`、`max_tools`、`budget_exhausted`。`AbortSignal` 贯穿模型 fetch、Embedding 与 MCP HTTP；取消后不启动新工具。Provider 不提供工具调用的强制保证，因此支持直答。

## E. Tool Registry

每个服务端工具有 `name`、`description`、模型可见 JSON Schema、服务端 strict Zod Schema、`risk: read|write`、`execute(validatedArgs, sessionContext)`。Registry 固定 allowlist；浏览器不能提供实现、风险级别或任意函数名。校验 `tool_call_id`、工具名、argument 字节/字符上限、JSON 解析、缺字段、类型、额外字段。Tool 输入不含 `ownerId`/`userId`。`search_knowledge` 沿用 Stage 3 Session ownerId 筛选；输出只有标题、Chunk 位置、短预览、相似度。工具文本与 MCP 返回值只作为不可信数据。

## F. Read / Write Policy

只读工具可在校验、Session 隔离与预算通过后执行。第一写工具建议 `save_research_note`，仅向当前用户新增一条简单研究笔记；不允许删除、账户/Session 修改、KnowledgeDocument 操作或批量写。写提议只能进入 `waiting_approval`，不能由模型自行执行。

## G. Human Approval

4.3 先用服务端密钥 HMAC 签 `userId|toolName|canonicalArgs|expiresAt|nonce`，浏览器仅持精确可展示 proposal 与 opaque token。确认请求重新验证当前 Session、签名、过期时间、工具与 canonicalArgs，并执行 token 内绑定的参数；不再次向模型询问参数。密钥仅用服务端环境变量，无 `NEXT_PUBLIC_`。纯签名 token 可以重复提交，4.3 必须明确此限制；4.6 加 `AgentAction` consumed/executed 状态和唯一幂等键。若 4.3 需要上线真实写入，应提前加最小持久化去重，不能以纯签名宣称 exactly once。

## H. MCP

内部原生工具继续存在：Agent → Registry → native tool 或 MCP client adapter。MCP 只统一外部能力的发现与调用。4.4 正式产品主线使用 Streamable HTTP；stdio 只用于本地 Host 启动子进程的比较。V1 自建只读、无私有数据的 `research_reference`。HTTP endpoint 必须有服务端到服务端认证、短期且限定 audience/scope 的 bearer、HTTPS、Origin/Host 校验与限流；私有知识库 MCP 另需把验证后的 Session 身份映射到 owner filter，绝不让模型传 ownerId。此复杂度列为扩展，不把私有 Tool 裸露公网。

## I. Workflow

主任务「根据知识库整理一份 Git 恢复版本的研究笔记」：搜索 → 模型综合 → 提议保存 → 用户确认 → 执行 → 最终回复。每步计数、每次 Provider 调用逐步扣预算，超限立即进入明确终态。初版不并行工具调用，也不提供无限自主运行。

## J. Persistence / Resume

建议三表：`AgentRun(id, ownerId, goal, status, currentStep, createdAt, updatedAt)`；`AgentStep(id, runId, position, kind, toolName?, inputSummary?, outputSummary?, status, latencyMs?, usage?, errorCategory?, createdAt)`；`AgentAction(id, runId, stepId, toolName, canonicalArgs, status, idempotencyKey UNIQUE, approvedAt?, executedAt?)`。三表分别承载运行状态、审计顺序与写操作去重；合并 Action 到 Step 会把可重试执行状态与观察日志混在一起。状态迁移先设计：`running → waiting_approval → running → completed`，并允许 `running/waiting_approval → failed|cancelled`，`failed` 仅在明确可恢复原因时进入 `paused → running`。终态不可继续写。

幂等键由服务端固定 `runId, stepId, toolName, canonicalArgs` 的稳定编码计算，DB unique；事务内锁定 Action、检查已执行、创建 Resource/Note 并记录 actionKey 唯一，提交后标记 executed。Resume 读取 Action 状态，已成功写入不重放；进程在 DB 提交后失联时依靠业务行唯一 actionKey 恢复。Phase 0 仅用隔离的内存 SQL 验证最小机制，PostgreSQL 事务/并发仍待 4.6 正式实测。日志只保存 ID、步骤、工具、状态、时延、usage、脱敏摘要、错误类别；不存 Key、Authorization、完整 system prompt、原始模型响应、embedding 或无必要的知识全文。

## K. Evaluation

建议固定 20 案例：直答、单次只读、读后回答、读后写提案确认；未知工具、坏 JSON、缺参数、错类型、额外字段、过大参数；Bob 越权读取、浏览器伪造 userId、MCP 越权；未批准写、参数篡改、工具篡改、过期、重复确认；文档注入；步数/循环、timeout、cancel、resume、重复 resume 可按子案例扩为 24。记录 task completion、read success、unauthorized read、unapproved write、tamper rejection、step enforcement、duplicate write、timeout/cancel/resume、provider failure、latency、usage。硬门槛：`unapproved writes=0`、`cross-user leaks=0`、`duplicate confirmed writes=0`，以工具调用和数据库变化证明，不用 LLM 自评安全。

## L. Provider / Cost

沿用北京地域百炼 `qwen3.7-flash`、Stage 3 `text-embedding-v4`、现有 request limiter 与 weighted provider budget。每个模型调用 1 unit，搜索 Tool 的 Embedding 再 1 unit；一条最小 Tool 闭环是 2 model units，真实知识搜索闭环至少 3 units。现有 10 units/minute 足够单条最小链路，但同用户连续多次运行可能很快耗尽；先维持生产配置，正式课提供可见的 `budget_exhausted` 与退避提示。每轮执行前逐步 reserve，不把一条 Agent HTTP 请求当 1 unit。保留原有按用户限流，并为 Agent 单次 Run 设独立上限。

## M. Threat Model

具体威胁与控制见 [Stage 4 threat model](./stage-4-threat-model.md)。

## N. Stage 4 Starter

从 Stage 3 最终完成状态制作干净项目基线，包含 Auth、Resource CRUD、KnowledgeDocument/Chunk、pgvector、Chat、Structured、Streaming/Cancel、Embedding、RAG、Citation 与 Stage 3 最终可靠性修复。排除 Agent Loop、Tool Calling、MCP、AgentRun/Step/Action、Approval、Workflow 与任何 Stage 4 答案。独立售价 `299` 与独立 entitlement 决定了下载不依赖 Stage 3 购买记录。本轮只固定边界，不生成 ZIP。

## O. Production / Delivery

最终作品需要 HTTPS Demo、README、架构图、工具清单和读写风险、人工审批、MCP、Workflow、Resume 演示、评估摘要、已知限制与三分钟脚本。生产 endpoint 维持私有数据认证和 Server Secret；Provider、MCP 和 DB 故障映射受控状态。Stage 3 未发布；本轮不部署 Stage 4，不改 Stage 3 Reference Production。

## P. Explicit Non-goals

V1 主线不教 Multi-Agent/swarm、无限长研究、browser computer use、不受限 shell/文件/SQL/HTTP/代码执行、自修改、向量长期记忆、图 Agent 框架、LangChain/LangGraph/AutoGen/CrewAI 作为主线或复杂规划算法。技术主线为 TypeScript、Next.js、现有 Provider、Zod、Prisma、PostgreSQL、官方 MCP SDK。
