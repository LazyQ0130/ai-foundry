# AI Foundry Capstone｜Phase 1 Delivery Plan

> 历史计划：Phase 2 已调整为 C1～C9 与 Greenfield Engineering Bootstrap。当前安排见 `docs/capstone-phase-2-validation.md`；下文用于追溯 Phase 1，不再作为学生起点或课时安排。

本计划将 [架构规格](capstone-phase-1-architecture.md) 转成八课的 Starter / Reference、工程增量和验收顺序。本轮仅确定计划，不写 Lesson 1 正文、不生成产品代码或下载包。

## 1. Starter / Reference Strategy

### 推荐基线

采用独立 Capstone Base，源自 Stage 4 最终 Reference（4.8 的干净装配），不是 Stage 4 Starter：

```text
Stage 4 Starter
  + Stage 4 lesson overlays 1–8
  = Stage 4 final Reference
      ↓ curate into a new project root; retain working agent/approval/persistence/eval
Capstone Base
      ↓ remove only Lesson 1 product outcome
L1 Starter → L1 Reference
      ↓ remove only Lesson 2 ingestion outcome
L2 Starter → L2 Reference
      ↓ ...
L8 Starter → L8 Reference
```

Stage 4 Reference 由 `scripts/assemble-stage4-reference.mjs 8 a <new .runtime path>` 组装。Phase 2 应先验证该命令能在干净 `.runtime` 路径重建出 4.8 Reference；然后用白名单把产品代码复制到全新的 `starter/capstone/` Base，不将 `.runtime` 产物、Stage 4 原始 lesson overlay 或平台 `.env` 直接打包。Base 继承必要的 5 次 schema lineage，但数据库名、应用名、README、部署项目、Cookie/Secret 均独立。凡是为 Capstone 删除或替换 Stage 4 旧行为，都在新的 Base/overlay 中完成，不回写 Stage 4 文件。

理由：A 直接续做会让学员觉得是在 Stage 4 实验页加几个控件；B 裁掉 Agent 后又会重复 4.1–4.7。独立 Base 可以保留既有工程能力，同时通过新的产品壳、Task/Report/Citation 领域和文件知识流水线形成真实新产品。

### 当前仓库目录映射

沿用仓库现有 Starter + `course-content/internal` overlay + `scripts/assemble-stage4-reference.mjs` 模式，不建立另一套平行课程目录：

```text
starter/capstone/                         # Capstone Base / L1 前置项目
course-content/internal/capstone/
  README.md                                # 作者约定、装配和版本矩阵
  l1/ ... l8/                              # 每课 common overlay、测试、README
  evals/                                   # 固定数据集、Runner、报告 schema
  fixtures/                                # 无敏感 PDF/MD/TXT 与失效文件
scripts/assemble-capstone-reference.mjs   # Base + 1..N overlays -> .runtime
course-content/capstone/                   # 后续发布时才放受限 Markdown 正文
docs/capstone-phase-1-*.md                 # 设计与验收记录
```

发布阶段再将 Capstone 注册到 `src/data/courses.ts`，由现有 `prisma/seed.ts` 同步 Stage / Lesson，按 `docs/lesson-renderer-v2.md` 检查稳定 `checkKeys`，并扩展 Starter asset 白名单。Phase 1 不提前改总课数、售价、entitlement 或发布状态。平台现有课程表和课程内容文件不能承载学员 ResearchTask 数据。

### Reference 与 Git 约定

- 每个 Reference 从 Capstone Base 按顺序 overlay 组装；每课只有本课目标缺失的 Starter 和包含该目标的 Reference。不要靠手工复制不明来源的“废版项目”。
- Reference 验收用当前项目的提交 SHA、migration 状态、单测/Eval 报告和 `assemble-capstone-reference.mjs` 可重建性记录。当前仓库没有课程级 Git tags 的既有做法，本计划不增加 `capstone-lN-starter/reference` tags。
- 学员最终项目仓库须能独立 `npm ci`、启动、迁移、测试和部署；不依赖 AI Foundry 平台私有目录。Starter ZIP 使用现有白名单打包原则，不含 `.env`、`node_modules`、`.next`、`.runtime`、测试数据库或真实资料。
- 若未来教学需要版本回退，下载/切换对应 Starter 快照或提交 SHA；不要将课程平台 Git branch/tag 与学生个人 Git 仓库混为一谈。

## 2. Eight-Lesson Engineering Matrix

Phase 0 原 L4–L7 从零教学 Loop、MCP、Approval、Persistence/Eval，与已完成的 Stage 4 重复。本矩阵保留完整项目链路，但把每课的主要成果改成产品实现和系统级验证。时长作为 Phase 1 估算，制作试讲后再校准。

| Lesson | Starter 状态 | 本节唯一主要成果 | 数据库变化 | AI 能力变化 | UI 变化 | 验收结果 |
| --- | --- | --- | --- | --- | --- | --- |
| L1 产品骨架：从 Agent Demo 到 Research Workspace | Base 已有 Auth、Knowledge/RAG、bounded Agent、MCP、Approval、Run/Step/Action；没有 Capstone 导航和 Task 产品流 | 用户可建立 ResearchTask 并在新工作台跟踪任务 | 加 Workspace（一人一个）、ResearchTask；迁移现有用户生成 Workspace，Stage 4 AgentRun 映射/命名 ResearchRun | 无新 Agent 原理；接通确定性 mock Research service | Dashboard、Knowledge、Research、Runs 主导航与有数据/空/失败状态 | 注册登录后创建任务、刷新后历史仍在；两个用户看不到彼此 Task；能解释 Workspace、Task、Run 是不同生命周期 |
| L2 知识导入：让资料成为可搜索 Evidence | L1 Reference，Task 已存，Knowledge 仍是文本创建或 Stage 4 状态 | 用户可上传受限 PDF/MD/TXT 并得到可定位、可检索 Chunks | 扩展 KnowledgeDocument 元数据/状态/版本，扩展 KnowledgeChunk 页码/offset/citationKey；不重复建 Document | 复用现有 Embedding 与向量检索；新增 Parser 与重试/失败映射 | 上传进度/状态、Document detail/source preview、Knowledge Search Debug | 三类 fixture 正常；空/坏/超大/不支持/扫描 PDF 显示稳定失败；重复处理不残留半套 Chunk；owner 隔离保持 |
| L3 有证据的研究报告与 Citation | L2 的 READY 文档 + Retrieval Debug | 一个 Task 可生成有证据、可点开的 grounded Research Report | 新增 ResearchCitation（Run 局部来源快照）；ResearchRun 增 `report` / completion 字段 | 复用 Stage 3 grounding/citation contract；只允许本次检索结果作引用，无证据时 abstain | Research Detail 显示 Summary/Findings/Analysis/Conclusion/Sources；citation 打开原文位置 | eval 断言每个 citation key 属于本 Run Retrieved Set；伪造 ID 被拒；重建/删除文档后旧报告仍显示快照 |
| L4 Research Workflow：把已学 Agent 变成可观察的任务执行 | L3 报告链 + Stage 4 Agent runtime | ResearchTask 执行成为可解释的多步 ResearchRun，并有明确 stop / error outcome | Run/Step 采用 Stage 4 持久模型；补齐 Task FK、started/completed 时间和必要错误类别 | 复用 Loop/Tool Registry；新增 brief/sub-question 的有限研究流程和有界 `search_knowledge` 调度，不教 Tool Calling 基础 | Runs list + Run Detail 展示状态、每步输入输出摘要、时间和错误 | 固定 Provider Stub 可复现 read→synthesize→final；max steps、timeout、cancel 均是终态；无新工具越权 |
| L5 外部研究来源：用 MCP 补足私有知识之外的信息 | L4 Run timeline，现有 MCP client/adapter | 同一报告可纳入有 provenance 的外部学术证据 | 沿用通用 ResearchCitation，增加 sourceType / DOI / canonical URL 快照字段（若 L3 schema 未预留则加一次迁移） | 复用 MCP protocol 与鉴权；新增只读 `search_external_references` (OpenAlex adapter) 和真实外部结果到报告的证据映射 | 外部来源与私有文档分组显示；标出来源类型、年份、外链和外部错误 | fixture 与真实低频 Smoke；错 schema、超时、非 HTTPS/异常 URL 不污染 citation；MCP 失败按策略停止或回退到本地来源 |
| L6 批准研究笔记：把报告变成受控可保存成果 | L5 的报告/citations 与 Stage 4 Action 交易逻辑 | 用户对精确笔记提案批准/拒绝/编辑后，只创建一条 KnowledgeNote | 新增 KnowledgeNote；AgentAction 目标绑定 Note 并使用唯一 actionKey | 复用已完成的签名 Approval、状态机、事务锁与幂等，不重讲 HITL 原理 | Run Detail 显示待确认内容、来源、编辑/拒绝/确认；Knowledge 增 Notes 视图 | 未授权写入=0、参数篡改拒绝、跨用户拒绝、重复/并发确认只产生一条 Note、事务失败可重试 |
| L7 Product Eval：证明完整研究工作流可靠 | L6 全部能力；Eval 从 L1 开始积累 | 一条统一命令给出 Capstone 产品和 AI 行为验收报告 | 无领域 schema 变化；测试库从 migration 创建，不使用生产/平台 DB | 冻结 prompt/tool 变更回归：RAG、citation、tool selection、MCP、stop、Approval、Resume 与成本 | Admin/dev only 的 Eval 报告页或 CLI 输出，展示失败案例、硬门槛与版本 | 固定 fixture + 隔离 Postgres 全矩阵通过；未授权写/跨 Workspace 泄露/重复 Note 硬门槛都为 0；注入红灯能使命令非零退出 |
| L8 生产交付：让独立作品可以运行、复核和展示 | L7 验收通过的产品 | 可公开复现的 HTTPS Capstone Demo 与求职交付包 | 最终生产 `migrate deploy`；无新功能 migration | 不新增 AI 概念，固定模型预算与失败配置 | 首屏产品态、Demo seed/引导账号、受保护失败提示与移动端核验 | 生产 Smoke 覆盖登录、上传、检索、Research、引用、MCP、Approval、Run reload/resume；README、架构图、3 分钟 Demo、简历 bullet、面试问答完成 |

### Starter 演进规则

```text
L1 Starter = Capstone Base - L1 Workspace / ResearchTask / 正式导航结果
L1 Reference = 加入 L1 Task / Workspace 与产品壳
L2 Starter = L1 Reference - 文件导入流水线
...
L8 Starter = L7 Reference - 生产交付材料
L8 Reference = 全部产品能力 + Eval 通过 + 部署/作品材料
```

每课只移除本课目标相关代码和内容；Starter 必须能独立安装、迁移和运行，不通过删除身份/数据库/上一课能力制造“残废项目”。Base 与第一课移除点须在 Phase 2 先做装配实验验证。

## 3. Unified Lesson Body Template

Phase 0 提议的 10 段内容适合课程设计审查，但正文每课都重复十个大标题会拖慢动手。正文统一用 7 个主段，项目问题、参考产品、架构取舍和 AI Coding 全保留：

1. **产品问题与本课交付**：从用户任务开始，明确一件可演示的成果和“不做”边界。
2. **参考方案与取舍**：选择一个成熟开源产品/架构作为观察对象，回答解决的问题、可借鉴点和本项目不同处；不做源码漫游或克隆。
3. **本课数据流 / 结构变化**：展示 Before → After、文件范围、迁移和信任边界。
4. **AI Coding 实作**：给出分阶段 Prompt；学生观察 Diff、解释关键函数并按 TODO/验收点改代码。复用旧知识以短的“知识回扣”嵌入，不开基础概念课。
5. **人工验收与故障实验**：正常路径、故意破坏、受控失败、恢复后再运行；每课有可复现输入和预期证据。
6. **架构解释 / 面试追问**：只问本课新增决定，提供可用工程事实回答的提示，不背术语答案。
7. **交付物与 Git 保存**：明确页面/API/schema/tests/eval/demo 中本课改变的文件和一次完整验收命令。

Renderer block 使用现有 Concept / Task / Prompt / Check / Stuck / DeepDive；每课 checklist 与稳定 checkKey 一一对应。不是每节都要把 6 种 block 强塞齐。

## 4. AI Coding Boundary

| AI 可大量生成 | 可生成，但学员必须理解并用证据验收 | 学员必须亲自决定并能解释 |
| --- | --- | --- |
| Dashboard/列表/空态样式、表单和 CRUD boilerplate、类型初稿、迁移草稿、普通单测初稿、README/图的初稿 | Parser 的边界处理、Chunk 定位、pgvector owner 过滤、Citation validator、Research Runtime adapter、Tool schema、MCP 结果归一化、Approval 参数绑定、Action 事务与 Resume/Eval assertions | Workspace 是否单用户；原文件放哪里和保留多久；哪些数据进入报告快照；Tool 的读写风险；何时暂停/停止；Approval 究竟批准哪组参数；哪个 failure 可 Resume；为何不用 OCR/Browser Agent/Multi-Agent/Queue |

关键代码生成后沿用 Explain → Diff → Run → Break → Fix → Re-run。Code review 必须检视 API 与 Prisma migration diff；不能只让模型自证安全。学生至少亲自解释一次 Citation 映射、一次 DB owner predicate 和一次 Action 幂等事务。

## 5. Verification Matrix

| 验收 | 从哪课开始 | 方式 / 硬要求 |
| --- | --- | --- |
| lint + typecheck + build | L1 起，每个 Reference | Capstone project 独立 `npm run lint`, `npm run typecheck`, `npm run build`; 不借用课程平台根脚本。 |
| unit test | L1 起 | Zod、状态迁移、chunk boundaries、canonical citation/action key、时间线排序；每课新增的 unit test 随 Reference 保留。 |
| PostgreSQL integration / migration | L1 schema 起；每次 migration | 每个 Reference 从当前 Capstone Base / prior migration deploy；只用隔离 `TEST_DATABASE_URL`；禁止 `db push` / `migrate reset` 覆盖持久数据。 |
| auth / workspace isolation smoke | L1 起 | Alice/Bob 对 Document、Search、Task、Run、Citation 与 Note 的 HTTP 授权测试；不能只断言 UI 隐藏。 |
| parser / upload fixture tests | L2 | 有效 PDF/MD/TXT、空/损坏/加密/扫描/超限文件；fixture 不含真实个人文件。 |
| retrieval / RAG eval | L2 retrieval 单测；L3 固定集 | Top-K expected source、无答案拒答和 owner filter；记录 embedding/model/config 版本。 |
| citation eval | L3 | 每个显示引用必须在该 Run 的证据集合；伪造、删除来源、重索引历史快照都要测。 |
| tool selection / stop eval | L4 | 确定性 Provider Stub 覆盖本地问题选知识检索、预算/step/tool limit、timeout/cancel，不用 LLM-as-a-Judge 作安全证据。 |
| MCP contract / provenance | L5 | schema、timeout、auth、非 HTTPS/错误 host、外部 URL 显示、恶意返回值；Fixture 是主回归，真实 API 为低频连通 Smoke。 |
| Action safety / idempotency | L6 | 未批准、篡改、过期、跨用户、拒绝、编辑、并发重复确认；DB 事实 hard gate `unapproved_writes=0`, `cross_workspace_leaks=0`, `duplicate_notes=0`。 |
| persistence / resume | L4 起点测试；L6 完整动作链；L7 回归 | Run/Step 顺序、waiting_approval reload、paused Resume、重复 Resume/Confirm、checkpoint 后进程重启、失败分类；不能承诺无 Worker 自动恢复任意 running call。 |
| full smoke + production | L8 | 生产环境独立 DB/对象存储与真实低频 Provider，走核心用户链；生产 smoke 不运行破坏性 eval 和 prompt injection。 |

统一命令建议：`npm run verify` 做 lint/typecheck/build/unit/authored eval；`npm run test:db` 做隔离 PostgreSQL integration；`npm run eval:capstone` 输出固定 RAG/Agent 报告并对硬门槛失败返回非零；`npm run smoke:production` 仅执行部署后的正向小流量流程。报告保存版本、模型名、prompt/tool 版本、fixture 集、延时和可得 usage，不保存 API Key、Cookie、完整私有文档或完整 Provider 原始响应。

## 6. Phase 2 Readiness Gates

进入 Lesson 1 正文制作/Capstone Base 构建之前，先完成以下技术 spike，并把结果附到 Phase 1 文档或新技术验收记录：

- 用装配脚本从 Stage 4.8 Base 重建 clean Reference，记录实际路径与 commit/file provenance。
- 确认 `starter/capstone` 白名单包完整可装、Agent persistence/Eval 跑通；Capstone DB 与 Stage 4/课程平台 DB 隔离。
- 验证 Workspace backfill migration 和新 Task/Run 的所有权谓词。
- 选定 Node engine、文件 parser、对象存储本地/生产 adapter、PDF 许可与上限；私有 bucket 访问不得产生长期公开 URL。
- 用固定小数据验证 Chunk 页码/偏移、1024 维向量、source snapshot、删除/重索引后旧引用可显示。
- 评估 OpenAlex API 额度/条款及 MCP adapter 的低频真实 smoke；外部服务故障路径使用 fixture 覆盖。
- 固定最终 package scripts、迁移次数、seed 行为和 8 lesson Reference 重建命令。

以上 Readiness Gate 未满足前，不将 Phase 0 中的产品范围直接视为已经在当前仓库实现，也不注册/发布 Capstone 课程。
