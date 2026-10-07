# AI Foundry Capstone｜Phase 2 Greenfield validation

日期：2026-10-07（Asia/Shanghai）。本轮只制作工程起点、内部 C1/C2 Reference 和技术 Spike；没有注册、解锁或发布 Capstone，也没有修改 Stage 1～4 课程。

## 1. Phase 2 Verdict

**PASS WITH CHANGES.** 十二项 Phase 2 Exit Gate 均有可复跑的最低限度证据，允许下一轮开始 C1 正文。变化是：学生起点必须是工程 Bootstrap；C1/C2 的产品成果只出现在内部 Reference；本地私有对象存储实验改用 Garage。下列剩余风险须在对应课程实现时继续验证，当前 Spike 不等于 C3～C9 已完成。

## 2. Greenfield Strategy

产品从问题、用户和任务开始，不从 Stage 4 的成熟知识工作台开始。`starter/capstone/` 只有独立 Next.js 工程骨架；Stage 4 Final Reference 仅是内部能力来源。C2 装配时只提取经验证的 auth/password/Prisma 原语及必要路由，再围绕新的 User→Workspace→ResearchTask 边界编排。Research UI、Agent、MCP、文件和报告都没有进入 Bootstrap。

## 3. Product Development Workflow

发现问题 → 定义目标用户与 JTBD → 当前流程 → MVP/Non-goals → User Flow → 成熟产品参考 → 技术需求 → 技术选型/ADR → 系统与领域模型 → 工程初始化 → 第一个 Vertical Slice → 逐课增量交付 → 测试与 Eval → 生产部署 → 作品集 → 复盘。

| 课 | Why：用户问题 | What：产品变化 | How：设计与证明 |
| --- | --- | --- | --- |
| C1 | 研究流程和来源容易散失 | Product Brief、User Flow、页面结构 | 问题/用户/JTBD/MVP/Non-goals；评审成功标准 |
| C2 | 任务必须有可信账户和持久起点 | Workspace 与 ResearchTask | ADR、架构、migration、Auth、跨工作区 HTTP 验证 |
| C3 | 自己的资料无法统一检索 | PDF/MD/TXT 私有知识库 | 私有存储、解析、Chunk、Embedding、pgvector、失败/重试 |
| C4 | 结论缺乏可追溯证据 | Evidence、引用与报告 | locator、来源快照、预览、无证据拒答 |
| C5 | 手动调用能力仍不能完成研究 | ResearchRun 工作流 | 复用 bounded runtime，学生设计编排、步骤和停止状态 |
| C6 | 内部资料不足以回答问题 | 外部只读证据 | MCP、安全 contract、来源标识、失败降级 |
| C7 | 报告结果难以安全沉淀 | 审批后 KnowledgeNote | 精确参数、编辑/拒绝、事务、幂等、归属 |
| C8 | 功能能跑不代表可信 | 统一 Eval 报告 | 隔离、解析、引用、Agent、MCP、审批、恢复硬门槛 |
| C9 | 本地演示不是交付 | 线上产品与作品集 | migration、存储、Smoke、README、演示、复盘 |

## 4. Bootstrap

`starter/capstone/` 包含锁定的 Next.js 15.5.26 / React 19.0.8、TypeScript、ESLint、基础 CSS、Node test 命令、env 示例、空应用页和 README。Node 版本下限 `>=20.19`。它没有 Prisma、数据库、Auth、Workspace、ResearchTask、文件、引用、Agent、MCP 或任何领域页面。C1 在 Bootstrap 上只添加产品定义；C2 才加 Prisma 与第一条完整产品竖切。

`node scripts/check-capstone-bootstrap.mjs` 用文件白名单持续约束学生起点。不能将内部 C2 Reference 或 `.runtime/` 目录发给学生作为 Starter。

## 5. Capability Reuse Map

| Capability | Stage 4 source | Why reusable | Introduced | Student integration | Intentionally not copied |
| --- | --- | --- | --- | --- | --- |
| Auth/Session | `starter/stage-4/lib/auth.ts`, `password.ts`, `app/api/auth/*` | 哈希、同源写入、服务端 Session 已验证 | C2 | 注册事务同时建立唯一 personal Workspace；所有任务从 Session 查 owner | Stage 4 Resource、Knowledge UI 与整个 app |
| Provider Adapter | `starter/stage-4/lib/ai-provider.ts`, `provider-work-budget.ts` | 百炼协议、预算已有验收 | C3/C5 | 为 Embedding 和研究调用重新绑定课程产品配置 | 旧 AI 实验面板 |
| Embedding/Chunk/Retrieval | `starter/stage-4/lib/knowledge-retrieval.ts`, `knowledge-citations.ts`; Stage 3/4 单测 | 1024 维和 owner-filtered Top-K 已验证 | C3/C4 | 新文件生命周期、workspace 谓词和 locator | 粘贴资料的既有产品模型与页面 |
| Bounded Agent Runtime | `course-content/internal/stage-4/s4-l5/common/lib/agent-runtime.ts` | 步数、工具、预算、取消有测试 | C5 | 学生设计 ResearchTask→Run→Brief→Evidence→Report→Steps | Stage 4 Agent Experiment / workflow UI |
| MCP Client/Guard | `course-content/internal/stage-4/s4-l4/common/lib/mcp-reference-adapter.ts`, `mcp-request-guard.ts` | 固定工具、结果校验、Auth/timeout/cancel 边界 | C6 | 只读研究来源映射为 External Evidence | echo/reference 演示工具和完整旧研究链 |
| Approval | `course-content/internal/stage-4/s4-l6/common/lib/agent-approval-v2.ts`, `agent-confirm-transaction.ts` | 精确参数、签名和事务幂等已验证 | C7 | 提案/编辑/拒绝映射为 KnowledgeNote | Stage 4 Resource 写入业务 |
| Persistence | `course-content/internal/stage-4/s4-l6/common/lib/agent-persistence.ts`, `agent-idempotency.ts` | Run/Step/Action checkpoint 和幂等已有回归 | C5/C7 | 领域关系、可读时间线、恢复语义 | 旧 AgentRun 产品表与实验页的整包迁移 |
| Eval utilities | `course-content/internal/stage-4/s4-l7/common/eval/` 与 Stage 3 RAG eval | 固定案例和安全硬门槛已有基线 | C8，逐课积累 | 加入文件、引用、跨工作区和部署案例 | 旧样本结果作为 Capstone 成绩 |

来源验证：`scripts/assemble-stage4-reference.mjs 8 a` 在独立 `.runtime` 重建成功，锁定依赖 `npm ci` 成功，Reference `npm test` **55/55** 通过，覆盖 runtime、检索/引用、MCP guard、审批、预算和 workflow。此处是来源与基础 contract 的重建验收；没有声称本轮重新调用真实 AI Provider 或完成 Capstone 全链路 Eval。

## 6. C1 Product Design Foundation

学生使用 `docs/templates/product-brief.md`，包含 Problem、Target User、Current Workflow、JTBD、MVP、Non-goals、User Flow、Success Criteria、Open Questions。内部示例在 `course-content/internal/capstone/c1/docs/product-brief.md`；学生 Bootstrap 不带答案。主导航基于任务流为 Dashboard、Knowledge、Research、Runs，详情页在各自区域内。C1 原则上不进入复杂编码。

## 7. C2 Architecture Foundation

学生使用 `docs/templates/architecture-decision.md`，明确 Decision、Context、Options、Criteria、Trade-offs、Final Choice、Consequences。内部 ADR 在 `course-content/internal/capstone/c2/architecture-decision.md`，对 Next.js 单体、React+Express、React+FastAPI 给出六维决策矩阵。当前选 Next.js + TypeScript modular monolith：同一工程内服务端 API 与 UI、既有课程 TypeScript 原语可选择性复用、单人项目部署面较小。FastAPI 的解析生态是优势，但引入第二语言与契约维护；Express 有清楚的 API 边界，但额外管理两个应用的构建/部署。

Agent 选择复用有界 runtime，C5 再接入研究领域。LangGraph 可用于更复杂的图和 checkpoint，但当前单人 V1 会增加抽象与集成成本；另一个选项是重新写 ad hoc loop，但会舍弃已验证的预算和审批边界。PostgreSQL + Prisma 保持关系/事务主体，C3 使用 pgvector；Prisma 6 的 vector 类型仍需迁移 SQL 和参数化查询。系统边界：Browser → Next.js（Auth/Knowledge/Research/Runs/API）→ PostgreSQL+pgvector、私有 S3-compatible storage、AI Provider、固定外部 MCP。

依据：[Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)、[Next.js 部署选项](https://nextjs.org/docs/app/getting-started/deploying)、[Prisma v6 PostgreSQL extension](https://docs.prisma.io/docs/orm/v6/prisma-schema/postgresql-extensions)、[pgvector](https://github.com/pgvector/pgvector)。

## 8. Database Spike

C2 独立 migration 实建 `User`, `Session`, `Workspace`, `ResearchTask`；`Workspace.ownerId UNIQUE` 保证 V1 每用户一个空间。注册事务同时创建 User、Workspace 和 Session。任务 GET/POST 仅从服务端 Session 解析 Workspace；详情查询在 DB predicate 中要求 `workspace.ownerId = session.userId`。HTTP smoke 验证 Alice 创建、刷新后读取、Bob 列表不可见且详情 404、匿名写入 401、客户端注入 workspaceId 400。隔离 PostgreSQL 17 + pgvector 0.8.6 migration 成功。C2 不提前创建 C3～C9 表。

## 9. Storage / Parser

选择 AWS SDK v3 的 S3-compatible adapter 形状，应用只保存私有 object key，不保存永久公开 URL。教学本地实验采用 Garage 2.4.1 单节点；签名 Put/Get 成功，匿名 Get 返回拒绝。s3rver 与 LocalStack 默认配置虽能 Put/Get，却把匿名 Get 放行，不能作为私有性验收环境。生产 provider 在 C9 根据可用的 S3-compatible 服务选定并重新做权限 Smoke；本地单节点无冗余，不能作生产承诺。依据：[AWS S3 private access/presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)、[Garage quick start](https://garagehq.deuxfleurs.fr/documentation/quick-start/)、[LocalStack S3 auth defaults](https://docs.localstack.cloud/aws/services/s3/)。

Parser Spike 用 pdfjs-dist 6.4.299 提取两页生成 PDF 文本，保留页号；MD/TXT 经严格 UTF-8 decode；空页/扫描件按无可索引文本处理，损坏 PDF 失败。C3 仍须完成实际上传入口、10 MB 上限、MIME/签名验证、处理状态、重试和 workspace 隔离。当前 Spike 未测试加密 PDF 的用户可见错误分类。

## 10. Citation

定位约定为 `page`, `startOffset`, `endOffset`, `citationKey`；Key 对文档、索引版本、页、区间及摘录做确定性哈希。页内文本偏移由解析后归一化文本定义，不冒充原 PDF 字节偏移。测试证实相同输入 Key 稳定、改版改变 Key。隔离 PostgreSQL 表验证 `ResearchCitation` 风格快照保留标题、摘录和 locator；删除来源文档级联删除 Chunk 后，历史引用行仍存在，`chunk_id` 变 null；pgvector 相似度查询可运行。C4 需要把快照纳入正式 schema 和报告渲染。

## 11. External Research Source

| 候选 | 类型 | 可引用内容 | 本轮结果 | 决定 |
| --- | --- | --- | --- | --- |
| Crossref | 结构化学术元数据 | DOI、题名；不能据元数据声称全文结论 | 真实只读查询 200，规范化通过 | C6 的首选结构化来源 |
| OpenAlex | 结构化学术元数据 | Work ID、DOI、年份；同样不等于全文证据 | 首次 200、后续 429 | 保留候选，需处理额度/退避，不锁为唯一来源 |
| Wikipedia REST search | 通用只读检索 | 页面标题、描述、固定主机链接 | 真实只读查询 200，规范化通过 | 用于对照与可选补充，不与学术来源混同 |

固定 adapter 限查询长度、数量和主机，校验响应、保留 sourceType/externalId，拒绝把外部文本当工具指令。官方依据：[Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)、[OpenAlex API](https://help.openalex.org/api/)、[MediaWiki 搜索 API](https://www.mediawiki.org/wiki/API:REST_API/Reference/en)。

## 12. MCP Spike

Stage 4.8 的 55 个重建单测包括固定本地工具注册、strict schema、远端额外工具拒绝、取消、bearer audience/scope/expiry、受限 URL、异常结果拒绝，以及外部结果只作为 `role:tool` 数据、不跳过审批。Phase 2 的 `external-source` Spike 对 Crossref/OpenAlex/Wikipedia 再验证固定主机、有限请求、provenance、非 200/畸形响应和元数据边界。C6 才把选定的真实来源接进 MCP Tool 并做 HTTP 集成验收；本轮没有虚构这条端到端链路已完成。

## 13. Student Ownership Audit

| 成果 | Bootstrap 已完成？ | 学生完成 |
| --- | --- | --- |
| Product Brief / User Flow | 否 | C1 |
| ADR / 系统架构 | 否 | C2 |
| 工程初始化 | 最小 scaffold | C2 配置并扩展 |
| Workspace / ResearchTask | 否 | C2 |
| 文件导入 / 检索 | 否 | C3 |
| ResearchCitation / Report | 否 | C4 |
| ResearchRun orchestration | 否 | C5 |
| External Evidence | 否 | C6 |
| KnowledgeNote | 否 | C7 |
| 产品 Eval | 否 | C8 |
| 生产交付 | 否 | C9 |

白名单审计通过。C2 内部 Reference 的代码、schema 和页面全部位于 `course-content/internal/capstone/c2/` 或仅在装配时选择性提取，不在 Bootstrap。

## 14. Reference Assembly

`node scripts/assemble-capstone-reference.mjs c1 .runtime/<new>` 将 Bootstrap 加内部 Product Brief；`c2` 继续叠加新领域 schema、API、UI、ADR，并复制六个已验证 Auth/Prisma 原语文件。脚本只允许新的 `.runtime` 目标，不替换既有目录。C1/C2 均从新目录执行 `npm ci`, lint, typecheck, test, build 成功。C2 的第一次 migration 和真实 HTTP smoke 在独立数据库/运行服务上通过。未来 C3～C9 沿此增量装配，不将结果回填学生 Bootstrap。

## 15. Verification

| 检查 | 结果 |
| --- | --- |
| Bootstrap `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` | 全通过；1 个基础测试 |
| 新目录 C1 同五条命令 | 全通过 |
| 新目录 C2 同五条命令 | 全通过 |
| C2 `prisma migrate deploy`, `node scripts/c2-http-smoke.mjs` | 通过：归属、刷新、输入契约 |
| Stage 4.8 A 重建、`npm ci`, `npm test` | 55/55 通过 |
| Phase 2 Spike `npm test`（Garage + live sources + PostgreSQL 环境） | 8 通过、1 个未启用的 LocalStack 私有性测试跳过 |
| `node scripts/check-capstone-bootstrap.mjs` | 通过 |
| 平台根目录 `npm run check` | 通过：既有课程目录与 Stage 1/3/4 Starter 一致 |
| `git diff --check` | 通过 |

复跑 Spike 需独立 `CAPSTONE_SPIKE_DATABASE_URL`、本地 Garage 服务，并设 `CAPSTONE_GARAGE_S3=1`；低频真实来源另设 `CAPSTONE_LIVE_SOURCES=1`。测试账号、数据库和容器均为本机隔离实验。没有读取根 `.env` 的 AI 凭证。

## 16. Remaining Risks

1. C3 的生产对象存储服务尚未选定；必须重测私有 bucket、短期授权、文件限制和故障恢复。Garage 实验仅验证本地签名/匿名边界。
2. PDF Spike 覆盖文本页、空页和损坏输入；加密、扫描、复杂排版、中文字体及 10 MB 上限待 C3 集成验收。
3. Crossref/OpenAlex 主要提供元数据。报告不能把元数据当论文全文结论；C4/C6 需定义可支持的 claim 范围与 abstain。
4. OpenAlex 本轮出现 429，若后续采用需配置 API key、速率预算及失败降级。
5. C5～C9 仍是教学与产品增量，尤其真实 MCP→External Evidence、审批后的 KnowledgeNote、全链路 Eval 和生产 Smoke 尚未实现。

## 17. Files Changed

本轮变更的完整路径如下（42 个）：

```text
course-content/internal/capstone/README.md
course-content/internal/capstone/c1/docs/product-brief.md
course-content/internal/capstone/c2/architecture-decision.md
course-content/internal/capstone/c2/overlay/.env.example
course-content/internal/capstone/c2/overlay/README.md
course-content/internal/capstone/c2/overlay/app/api/auth/register/route.ts
course-content/internal/capstone/c2/overlay/app/api/research/tasks/[id]/route.ts
course-content/internal/capstone/c2/overlay/app/api/research/tasks/route.ts
course-content/internal/capstone/c2/overlay/app/page.tsx
course-content/internal/capstone/c2/overlay/lib/task-input.ts
course-content/internal/capstone/c2/overlay/lib/workspace.ts
course-content/internal/capstone/c2/overlay/prisma/migrations/20261007000000_initial/migration.sql
course-content/internal/capstone/c2/overlay/prisma/migrations/migration_lock.toml
course-content/internal/capstone/c2/overlay/prisma/schema.prisma
course-content/internal/capstone/c2/overlay/scripts/c2-http-smoke.mjs
course-content/internal/capstone/c2/package-lock.json
course-content/internal/capstone/spikes/external-source.mjs
course-content/internal/capstone/spikes/external-source.test.mjs
course-content/internal/capstone/spikes/package-lock.json
course-content/internal/capstone/spikes/package.json
course-content/internal/capstone/spikes/phase2.test.mjs
docs/capstone-phase-1-architecture.md
docs/capstone-phase-1-delivery-plan.md
docs/capstone-phase-2-validation.md
docs/templates/architecture-decision.md
docs/templates/product-brief.md
scripts/assemble-capstone-reference.mjs
scripts/check-capstone-bootstrap.mjs
starter/capstone/.env.example
starter/capstone/.gitignore
starter/capstone/README.md
starter/capstone/app/layout.tsx
starter/capstone/app/page.tsx
starter/capstone/app/styles.css
starter/capstone/eslint.config.mjs
starter/capstone/next-env.d.ts
starter/capstone/next.config.ts
starter/capstone/package-lock.json
starter/capstone/package.json
starter/capstone/postcss.config.mjs
starter/capstone/test/bootstrap.test.mjs
starter/capstone/tsconfig.json
```

## 18. Git

开工时 `HEAD` 与 `origin/main` 均为 `ea7930560c7f25964361266cbd3c09e91d5056ef`，工作树干净；本轮不推送远端。最终 commit SHA 与工作树状态在本轮交付消息中记录。
