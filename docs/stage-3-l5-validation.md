# Stage 3.5 第一条 RAG 链路验收（2026-10-01）

## 范围

从 3.4 A/B 参考实现增量加入 `knowledge-retrieval.ts`、`knowledge-rag.ts`、`POST /api/knowledge/retrieve`、`POST /api/knowledge/ask` 与页面的「先看检索命中 / 从我的资料回答」。3.1～3.4 的接口、Resource 和 A/B 差异继续存在。Prisma schema 与四次 migration 同 3.4 完全一致，**没有新增 migration**；全新隔离库 `stage3_l5_test` 成功按原四次 migration 部署，状态 up to date。仅使用本地 Docker pgvector 0.8.6、PostgreSQL 17，未连接平台或生产数据库。

SQL 使用 Prisma tagged-template `$queryRaw` 绑定向量、ownerId、模型、维度和固定 K=3。`JOIN KnowledgeChunk → KnowledgeDocument`，先限制 `d."ownerId"`、`status='ready'`、非空向量、`embeddingModel` 和 `embeddingDimension`，再按 `<=>` cosine distance 排序、`LIMIT 3`。`similarity=1-distance` 仅用于观察排序，不能解释为答案正确率。缺少兼容 Chunk 时不调用 Chat。响应只给回答、标题/位置/160 字符预览/similarity 与可选用量/耗时，不给向量、ownerId、完整内部 Prompt 或 Provider 原始响应。

## Mock / Stub / 隔离

- A/B Next.js 构建通过。`rag-reference.test.mjs` 在两版均通过：401、403、空白和超长问题、客户端字段拒绝、429、空库不调用 Chat、Mock 全链与独立检索停点、固定 Top-3、cosine 顺序、ready only、模型/维度一致性、Bob 高相似私有 Chunk 不泄漏、Mock/Real 互不混用。
- 维度兼容性测试在**专用隔离测试库**中临时注入元数据为 999 的旧行，确认 SQL 排除后立即删除该行并恢复数据库 CHECK 约束；正式 schema 未改。
- 真实 Provider 本地 Stub 覆盖 Query Embedding 配置缺失、401、5xx、超时、错误维度，以及 Chat 401、5xx、超时；响应脱敏。Chat 失败前后知识文档行数不变。
- 继承的 `knowledge-units.test.mjs` 与 `stream-units.test.mjs` 共 6/6；3.4 文档索引测试 A/B 均通过；3.1 普通问答、3.2 结构化建议、3.3 流式取消与 Resource 隔离的原 reference 测试 A/B 均通过。

## 北京地域真实 RAG

本地被 Git 忽略的 `.env` 仅由服务端读取。用三篇非常短的非敏感 Git、PostgreSQL、Cookie 文档建立真实 `text-embedding-v4`、1024 维索引；另以 Bob 账号建立一篇合成的高相关私有文档。Alice 问「什么工具可以帮助我保存代码版本？」：

| 阶段 | 实测摘要 |
| --- | --- |
| Query Embedding | `text-embedding-v4`，1024 维，96 ms，9 tokens |
| Retrieval | Top-3；Top-1 `Git 学习笔记`、Chunk 0、similarity 0.7444；Bob 私有文档未进入命中 |
| Chat | `qwen3.7-flash`，667 ms，273 tokens；回答非空且提及 Git |
| 总流程 | HTTP 200，767 ms |

资料外问题「量子计算机的纠错原理是什么？」返回 HTTP 200、仍有 3 个 Top-K 命中，模型表达「当前资料中没有足够依据」，总耗时 425 ms。固定 Top-3 没有相似度阈值，所以**有命中不代表有答案**。这一例只证明首次链路与一次拒答行为，不是可靠性或幻觉率评估。日志没有完整向量、完整回答、真实资料、API Key、Provider response 或内部 Prompt。

## 剩余边界

3.4 遗留的**独立云 PostgreSQL pgvector extension 权限与增量 migration 尚未验收**继续保留。没有正式 Citation、引用验证、对话记忆、RAG Streaming 或质量评估。

平台 `npm run verify` 通过，原 67/67 测试全部通过；`npm run check` 通过，Starter ZIP 与源文件一致。Stage 3 仍为 7 节且全部未发布，正式课总数 29。仅新增 3.5 正文、A/B 快照、验收文档并修改 3.5 目录时长；Stage 1/2/4、Starter、课程图片、平台 Auth/支付/权益无改动。

现有 `LessonMarkdown` 渲染器在桌面与 390px 均检查过标题、提示词、SQL 和停点；窄屏代码块在自身容器横向滚动。两条新 Prompt 的 Copy 均实际点击并粘贴到被 Git 忽略的本地预览输入框，首尾内容完整。A 版参考页面的 390px 视口也检查了「问我的知识库」输入框与两个按钮，均在卡片内完整显示；B 版有相同的新增组件并已构建和接口验收。

提交前暂存范围为 3.5 正文、A/B 参考快照、验收文档及 3.5 目录时长。`git diff --cached --check` 通过；暂存补丁未含本地 `.env` 里的真实 Key 或数据库连接串，未出现完整 Key 模式或字面数据库 URL；暂存路径没有 `.env`、`.runtime`、`node_modules`、`.next`、日志与构建缓存。真实调用日志只保留用量、耗时、Top-1 摘要和回答布尔结果。没有修改课程图片。
