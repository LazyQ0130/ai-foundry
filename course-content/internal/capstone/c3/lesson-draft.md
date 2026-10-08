---
estimatedTime: "120～150 分钟"
difficulty: "高级综合实践"
objective: "让 PDF、Markdown 和 TXT 经私有上传、可观察的处理状态、确定性定位与切片、1024 维索引，成为仅当前 Workspace 可检索的 Evidence，并验证失败恢复和跨用户隔离。"
checklist:
  - "已设计并解释 Document 生命周期、支持格式与文件、文本、Chunk 资源上限"
  - "已安全上传 PDF、MD、TXT 到私有对象存储，验证匿名无法读取原文件"
  - "已解析文件并保存稳定 page、offset 与 citationKey，明确其归一化文本语义"
  - "已完成确定性 Chunk、Embedding 与 pgvector 索引，只有 READY 文档可检索"
  - "已完成 SQL 中按 Workspace 过滤的 Top-K Retrieval，并在 Search Debug 查看片段"
  - "已验证坏/扫描 PDF、Embedding 中断与 Retry、Alice/Bob 隔离"
  - "已运行测试、build 与依赖审计，检查 migration、Git diff 和秘密文件并保存 C3"
checkKeys:
  - "check-c3a3000000000001"
  - "check-c3a3000000000002"
  - "check-c3a3000000000003"
  - "check-c3a3000000000004"
  - "check-c3a3000000000005"
  - "check-c3a3000000000006"
  - "check-c3a3000000000007"
---

## 0～10 分钟：一个 Task 还没有资料

C2 中你建立了「研究 Agent Memory」任务。电脑里还有论文 PDF、自己的 Markdown 笔记和一份 TXT。ResearchTask 已知道**你想研究什么**，却不知道**你手里有什么证据**。

如果只加一个文件输入框，页面说「上传成功」，系统就能搜索到论文第二页的相关段落吗？不能。原文件进入存储之后，还要验格式、解析、保留页号、归一化、切片、生成向量并完成索引。这是一条 Pipeline，不是一个按钮。

```text
Upload → Private Storage → Validate → Parse → Normalize → Chunk
       → Embed → PostgreSQL + pgvector → Workspace-scoped Retrieval
```

本课完成的是**私人知识资料的检索**。`/knowledge/search` 是 Retrieval Debug，只显示命中的文件、片段、页码、偏移与相似度；不生成研究报告，也不创建 Citation Snapshot。C4 才根据这些 Evidence 构造带引用回答。

:::task{title="先把产品要求转成工程要求"}
从自己的 C1 产品说明与 C2 架构图列出：文件不可公开、格式有限、PDF 可定位页、文档可搜索、失败可见、用户互不串资料。为每项写出所需工程边界；不要先选 S3 SDK 函数。
:::

| 产品要求 | 当前工程需要 |
| --- | --- |
| 原文件不可公开 | Private S3-compatible object storage；读取仍要核验 Session 与 Workspace |
| 仅 PDF / MD / TXT | 扩展名、MIME 与处理阶段真实内容验证 |
| 指向 PDF 原文 | 页内 normalized text 与稳定 offset |
| 内容可检索 | 确定性 Chunk、Embedding、pgvector |
| Alice/Bob 不串资料 | SQL 内按当前 Workspace 过滤，再做 Top-K |
| 失败不伪装成功 | Document 状态、错误类别、幂等 Retry |

## 10～25 分钟：先设计生命周期与领域

自己画出四个状态，再让 AI 评审：

```text
PENDING_UPLOAD → PROCESSING → READY
                    └──────→ FAILED → 受控 Retry → PROCESSING
```

`PENDING_UPLOAD` 表示数据库已登记但对象未必存在；`PROCESSING` 表示解析或索引进行中；`READY` 才能检索；`FAILED` 要显示稳定错误原因并允许有条件重试。一个布尔 `uploaded` 无法表达这些事实。同步 V1 没有 Queue，进程被杀可能留下 PROCESSING；用 `processingStartedAt` 的短租约挡住同时处理，并允许明显超时后受控重试。阈值要是代码常量并测试。

领域从 C2 的 Workspace 增量延伸：

```text
Workspace
├─ ResearchTask
└─ KnowledgeDocument
   └─ KnowledgeChunk → vector(1024)
```

Document 存元数据、服务端生成的 `objectKey`、原文件哈希、状态、错误类别、解析/索引版本和处理时间。Chunk 存 `position`、`page`、`startOffset`、`endOffset`、正文、`citationKey`、向量模型、维度和索引版本。C3 不建 Run、Report 或 ResearchCitation。

:::prompt{title="Prompt 1：Schema 与生命周期"}

```text
先读我自己的 C1 Product Brief、C2 ADR/architecture、当前 Prisma schema 和测试。我已画出 PENDING_UPLOAD → PROCESSING → READY/FAILED，请先评审遗漏，再实现 C3 最小领域。
新增 Workspace 下的 KnowledgeDocument 与其 KnowledgeChunk；记录文件元数据、server-generated objectKey、contentHash、errorCode、pageCount、parserVersion、indexingVersion、processingStartedAt；Chunk 保存 page、normalized-text offsets、content、citationKey、embedding model/dimension/version。
使用正式 PostgreSQL/Prisma migration，SQL 创建 pgvector extension 与 vector(1024) 列；增加防重复唯一约束。不要 db push，不改 C1/C2 语义，不建 ResearchRun、ResearchCitation、Report 或 Note。完成后解释状态转移和所有 SQL 约束，不操作 Git。
```

:::

看 migration SQL：`CREATE EXTENSION IF NOT EXISTS vector`、`vector(1024)`、Workspace/Document 外键、索引、唯一约束。Prisma 6 对 vector 使用 `Unsupported("vector(1024)")`；正式向量 DDL 与参数化读写仍需明确 SQL。`(documentId, indexingVersion, position)` 至多有一行，是 Retry 不重复的一道数据库防线。

:::check
- Document 在上传前不被误标 READY；Chunk 不直接接受浏览器传来的 Workspace ID。
- migration 可从空测试库部署；没有 `db push`。
- `PROCESSING` 的新租约拒绝重入，过期后才可重试。
:::

## 25～45 分钟：私有原文件与签名上传

本项目让 PostgreSQL 保存关系、文本和向量，原始文件放私有对象存储。这是当前产品的取舍：文件生命周期独立，数据库备份不被大文件占满，下载权限可独立控制。本地文件系统开发时能用，但不能当作未来部署的可靠持久存储；PDF 二进制放数据库也不是绝对错误，只是当前不选。

Reference 使用本地单节点 Garage（S3-compatible）。它是教学基础设施，**不是生产存储承诺**。先配置私有 Bucket 和本地浏览器来源 CORS；Secret 只在服务端。应用数据库保存 objectKey，不保存永久公开 URL。

```text
Browser → POST /api/knowledge/uploads → Session → Workspace
        → server-generated objectKey + PENDING_UPLOAD + 5 min signed PUT
Browser → PUT 原文件到私有 Bucket
Browser → POST /api/knowledge/documents/:id/process
```

签名 URL 只给固定对象、固定动作和短时间授权，不会把 Bucket 变公开。`objectKey` 应由服务端身份生成；即使 Bob 猜到 Alice 的 Key，读取签名 GET 前仍需通过 Session → Workspace → Document。签名 PUT 也不能让浏览器声明的大小或 MIME 成为最终事实：处理阶段再次 HEAD、GET、检查实际字节数、类型与内容。签名 PUT 在过期前可能被重放；Reference 把验证后的字节写到新的**仅服务端可写 sealed key**，READY 文档只引用 sealed key，避免上传暂存对象被覆盖后改变证据原文。

:::prompt{title="Prompt 2：私有存储适配层"}

```text
实现一个仅服务端可用的 S3-compatible storage adapter，集中处理 signed PUT、HEAD、GET 和短时 signed GET。配置 endpoint、region、private bucket、access key、secret、path style；Secret 不进入客户端。使用本地 Garage 作为教学测试环境，并提供 bucket/CORS/health 的最小设置说明。签名 PUT 最多 5～10 分钟，GET 最多 5 分钟。数据库只存 objectKey，不存永久 URL。不把 SDK 调用散在 Route，不改成 public uploads、本地持久文件或 BYTEA。列出权限验证方法，不操作 Git。
```

:::

:::prompt{title="Prompt 3：上传与可观察状态"}

```text
在当前 C3 schema/storage adapter 上实现 PDF、MD、TXT 的 presigned private upload：initiate route 校验 metadata、10 MB 上限、格式，并由 Session 推导 Workspace 和 objectKey，建 PENDING_UPLOAD；浏览器 signed PUT 后调用受保护 process route。Knowledge 页面至少有 idle、uploading、processing、ready、failed 与列表、错误、retry。处理阶段重新核实真实对象，不信浏览器的 Content-Type、byteSize、objectKey、workspaceId。暂不加入解析以外的报告/Agent 功能；先报告 diff 和边界，再运行检查，不操作 Git。
```

:::

:::warning
不要把「PUT 返回成功」显示成「可搜索」。此时最多证明对象可能已上传；只有完整索引提交并标为 READY 才可检索。原文件不得通过公共 `/uploads` 或永久 URL 暴露。
:::

## 45～65 分钟：解析与可解释失败

处理阶段重新验证：PDF 的扩展名、MIME 与 `%PDF-` 签名；MD/TXT 的扩展名、允许的类型和严格 UTF-8 decode。不要用 replacement characters 静默吞掉坏编码。PDF 用已验证的 pdfjs-dist 6.4.299 提取每页文本；一页一个 `{ page, text }`。MD/TXT 的 `page = null`。Markdown 在 C3 只是可搜索文本，不做渲染器。

扫描 PDF 没有可提取文本，应明确失败：本课不做 OCR。损坏、空文本、加密 PDF 也要进入稳定的错误类别，页面不显示 pdfjs stack trace。对非敏感 fixture 至少跑正常两页 PDF、空 TXT、损坏 PDF、无文本 PDF；可再加密 PDF。

:::prompt{title="Prompt 4：Parser、Chunk 与 Locator"}

```text
实现只面向 C3 的 parser contract：ParsedPage = { page: number|null, text: string }。PDF 逐页提取 normalized text；MD/TXT 严格 UTF-8；坏、空、扫描/无文本、加密 PDF 返回稳定类别，不泄露内部 stack。然后用确定性、有限上限的 chunking；先尝试约 800 字符、120 重叠，PDF 不跨页，MD/TXT 按 normalized document text。每个 Chunk 保留 position、page、startOffset、endOffset、content 与稳定 citationKey。给我打印一份 fixture 的 Page/Offset/Preview，并加入单测。不要做报告、Agent 或 Citation UI，不操作 Git。
```

:::

`startOffset`/`endOffset` 是 normalized text 的字符位置：PDF 是**页内**，MD/TXT 是**整份文档内**；Reference 以 JavaScript UTF-16 字符索引计，绝不是 PDF 原始字节偏移。归一化策略改变就应提升 parser/indexing version。`citationKey` 由原文件 contentHash、索引版本、页、区间与片段确定性计算；同文件同配置稳定，内容或算法版本变化则变化。C4 会用它识别 Evidence，但 C3 不建立引用快照表。

文件上限 10 MB 还不够。Reference 同时限制 normalized extracted text 约 100,000 字符、Chunk 最多 160、查询最多 500 字，Embedding 顺序执行（并发上限 1）。800/120 配置下约 100,000 字符需约 148 个 Chunk，低于 160；超限就失败，不能只索引前半份却显示 READY。学生可调整数值，但要写出 fixture 与 Provider 输入上限的理由。

:::stuck{title="PDF 文件可下载却没有搜索结果"}
先看 Document status/errorCode，再确认 parser 是否有文本、每页的 normalized text 是否非空、Chunk 数量及 page/offset 是否能切回原文。扫描 PDF 在本课应是明确失败，不应生成空 READY。
:::

## 65～110 分钟：Embedding、事务与 pgvector

不要复制 Stage 4 整个 Chat/Streaming Provider；只提取聚焦的 Embedding adapter。默认 deterministic Mock 用于测试流程、维度和隔离，不能据它宣称真实语义质量。真实模式可用已验证的 `text-embedding-v4`、1024 维，配置和 Key 只在服务端；真实 Smoke 用非敏感小文件且是 opt-in，标准测试不能依赖云 Key。

最关键的边界：**先把所有 bounded Chunk 在事务外解析并 Embedding；把原文封存到服务端专用 key；全部成功后才开短事务替换索引、切换 objectKey 并标 READY**。如果第 N 次 Embedding 失败，Document 为 FAILED，不得有可检索的半成品。不要开启数据库事务后再等待 100 次外部请求。

:::prompt{title="Prompt 5：Embedding 与原子索引"}

```text
实现 focused embedding-provider：默认 deterministic mock、可选真实 text-embedding-v4，严格校验 1024 个有限数值和模型名，服务端超时/错误映射，顺序或很小的有界并发。处理流程先 Parse → Chunk → Embed 全部片段，最后短事务内替换该 Document 的 Chunk 并切到 READY；任一步失败切 FAILED，READY 检索不能看到半索引。加入第 N 个 Embedding 故意失败、Retry 后无重复 Chunk 的确定性测试。PROCESSING 使用有时限 lease；不要加 Queue、Redis、Agent 或 Report，不操作 Git。
```

:::

### Break：故意折断第 N 个 Embedding

选择一个超过 800 字符的无敏感 TXT，令第二个片段 Embedding 失败。验收：`FAILED`、该文档可检索 Chunk 为 0；恢复后 Retry 进入 READY，Chunk 数与 locator 一致，`(documentId, indexingVersion, position)` 没有重复。再把 READY 文档临时设为 PROCESSING 验证搜索不返回它。恢复测试库状态，不要把这种故障开关注入正式用户请求。

:::check
- 向量列确为 `vector(1024)`；坏维度被拒绝。
- 第 N 个 Embedding 失败时，不会出现部分 READY 索引。
- Retry 重新生成同一套稳定 Chunk，完成后只有一份。
:::

## 110～130 分钟：工作区内 Top-K Retrieval

Search Debug 只接受 `query`。服务端从 Session 获取 User，再取得 Workspace，把问题转向量。SQL 必须在 Top-K 前同时筛：Document 的 Workspace、READY 状态、相同 embeddingModel 与 1024 维；随后按向量距离排序并限制 K。**不能全库 Top-K 后在 Node.js 过滤**，那会让其他用户的资料影响结果，甚至泄漏信息。

:::prompt{title="Prompt 6：检索 API 与 Search Debug"}

```text
新增受保护的 POST /api/knowledge/search（或当前架构等价路由），只接受 1～500 字 query，strict 拒绝 workspaceId/ownerId。Session → Workspace → query embedding；参数化 pgvector SQL 在排序和 LIMIT 前过滤当前 Workspace、READY、匹配模型与维度。最多返回 5 个片段的 Document Title、Chunk Preview、Similarity、Page/Offset 与 citationKey。/knowledge/search 只做 Retrieval Debug，不生成自然语言回答。Mock 模式明确标注不能证明真实语义效果。加 Alice/Bob 与 PROCESSING 不可见测试，不操作 Git。
```

:::

在 UI 实际看一次命中：标题是否是原文件、PDF 是否指向正确页、offset 能否切回 normalized text、preview 是否能让你判断相关性。真实 Embedding Smoke 放在确定性测试全部通过之后，用非敏感小文件，并记录模型与检索结果；没有真实 Key 时标记未运行，不能把 Mock 写成真实语义验收。

## 130～150 分钟：四组 Break 与最终审查

1. **Private Storage**：Alice 上传，匿名不带签名访问对象应拒绝；Alice 的受保护 Route 能取得短时 signed GET，Bob 即使猜到 Document ID 也拿不到。
2. **Broken Index**：第 N 次 Embedding 失败 → FAILED 且无可检索半索引；Retry → READY 且无重复。
3. **Alice/Bob**：Bob 列表不可见、不能 process/retry、不能取得 signed GET、搜索不能命中 Alice Chunk；同时检查 API、SQL 和数据库事实。
4. **坏/扫描 PDF**：进入 FAILED 与可理解错误，不展示 pdfjs stack trace，不偷偷 OCR。

:::prompt{title="Prompt 7：只读安全与故障审查"}

```text
只读审查 C3 真实代码、migration 与测试，不改文件。指出：objectKey 如何生成、Bucket 为什么仍 private、实际字节/格式在哪里复核、四种状态怎样转移、PDF page 与 offset 指向哪份 normalized text、citationKey 何时变化、向量维度在哪里验证、SQL 是否在 Top-K 前筛 Workspace/READY/model/dimension、失败时为什么没有半索引、stale PROCESSING 和 Retry 怎样工作。列出最多五个真实剩余风险；不要建议提前实现报告、Citation Snapshot、Agent、MCP、Note 或 OCR。不要把页面隐藏当权限证据。
```

:::

最后从空的独立 PostgreSQL 17 + pgvector 测试库执行正式 migration。运行 unit、Garage 私有性、DB 向量查询和 Alice/Bob HTTP smoke，再运行 lint、typecheck、build、`npm audit --omit=dev`。检查新增 runtime 依赖的版本、license 与来源，区分新引入的发现和 C2 既有锁定依赖问题。查看 `git status`、`git diff`、`git diff --check`、migration SQL；确保 `.env`、真实 DB/S3/Provider Secret 和日志不进入 Git。保存自己的 C3 版本。

:::concept
正确失败也是产品能力。上传的文件如果没能形成完整、可归属、可定位的索引，就不应被展示为 READY。C4 才会把本课的 Evidence 变成带来源快照的报告。
:::

:::deepdive{title="为什么 C3 仍是同步处理"}
单人 V1 用同步处理和 lease 先证明完整生命周期。长文件、外部 Provider 延迟或进程重启会让请求时长成为部署风险；C9 再根据实际运行环境决定后台任务与生产存储，不在本课引入 Queue 或 Redis。
:::
