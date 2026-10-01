# Stage 3.4 增量迁移与真实 Embedding 验收（2026-10-01）

## 范围与隔离

从 `s3-l3/` 延续 A/B 参考项目，只新增知识文档的切块、Embedding 与入库。未实现提问向量、Top-K、RAG 或引用。数据库验收只连接本地 Docker `aifoundry-stage3-spike-pgvector` 的隔离数据库（pgvector 0.8.6、PostgreSQL 17、localhost:55433），未连接平台库、Stage 2 对外演示库或生产库。真实云调用只用本地被忽略的 `.env` 的北京地域百炼 Workspace 配置。

## Migration gate：正文开发前完成

全新空库 `stage3_l4_fresh`：先从原有三次 Stage 2 migration 部署 Stage 3.3 schema，插入非敏感 User/Resource 旧数据并确认旧应用 HTTP 200；随后部署第四次 `20261001120000_add_knowledge_vectors`。`prisma migrate status` 报告 up to date。旧 User/Resource 数据仍在；`pg_extension` 中 `vector` 版本为 `0.8.6`；`KnowledgeChunk.embedding` 实际是 `vector(1024)`；四次 migration 均成功，无失败记录。未使用 `db push` 或 `migrate reset`。

另一个隔离库 `stage3_l4_clean` 的首次操作曾误从平台项目根目录执行 `prisma migrate deploy`，平台的首个迁移因旧 User 表已存在而失败，没有修改旧表数据。已只在该隔离库用 `migrate resolve --rolled-back` 解除失败记录，并以正确的 3.4 装配项目完成迁移。最终迁移结论以另建的、没有这段失败历史的 `stage3_l4_fresh` 为准。

新增 schema：`KnowledgeDocument`（id、非空 ownerId、title、content、status、createdAt、updatedAt）与 `KnowledgeChunk`（id、documentId、position、content、embedding、embeddingModel、embeddingDimension、createdAt）。Document→User、Chunk→Document 外键级联；`(documentId,position)` 唯一，status 与维度有数据库约束。旧 Resource 模型未改。没有 ANN 索引。独立云 PostgreSQL 的 pgvector extension 权限与增量 migration **尚未验收**，需在 Stage 3 独立云库再做。

## 参考实现与自动验收

- A/B 装配项目都已执行 `npm run build` 成功，Prisma 与 Client 均为 6.19.3。
- `node --import tsx --test course-content/internal/stage-3/s3-l4/knowledge-units.test.mjs`：3/3。确定性段落优先切块、过长硬切、6000 字符/8 块限制、Mock 确定性 1024 维，以及 3/1023/1025 维、NaN、Infinity 拒绝。
- `knowledge-reference.test.mjs` 在 A/B 均通过：Session、Origin、输入/客户端字段限制、Mock ready、Alice/Bob GET 隔离、安全响应、真实 Provider 本地 Stub、配置缺失、401、5xx、错误维度、超时及数据库写入失败后的 failed 状态。写入失败通过隔离库临时 trigger 注入，测试后移除；Provider/数据库错误正文未返回。
- 继承的 `reference.test.mjs` 在 A/B 均通过：3.1 普通问答、3.2 严格结构化建议、3.3 流式/取消/错误、Resource CRUD 与隔离。
- 隔离库只读 SQL：ready 文档存在；所有已存 KnowledgeChunk 的 `vector_dims(embedding)=1024`，无空向量；旧 Resource 测试行仍在。

## 北京地域真实 Provider

显式运行 `real-embedding-acceptance.mjs`，通过正式 Next.js `POST /api/knowledge/documents` 调用 TypeScript `embed()`，再以数据库只读查询验证维度。没有打印 Key、完整原文、Provider response 或完整向量。

| 用例 | HTTP | 状态 | 模型 | Chunk | 数据库实际维度 | 总耗时 | usage total tokens |
| --- | --- | --- | --- | ---: | --- | ---: | ---: |
| 短文本 | 201 | ready | text-embedding-v4 | 1 | 1024 | 257 ms | 9 |
| 三分块短文 | 201 | ready | text-embedding-v4 | 3 | 1024, 1024, 1024 | 391 ms | 708 |

地域：China (Beijing)。请求明确 `dimensions:1024`；所有返回元素在服务端经长度与 finite 检查，数据库再次验证。`kind:real`、模型与维度由实际响应和入库路径确认。以上是一次低成本功能验收，不是质量、吞吐或价格评估。

## 边界与待检查项

文档状态只用 indexing/ready/failed；Embedding 网络调用不在数据库事务内，写 Chunk 与 ready 在同一短事务。GET 只按 Session ownerId 列表读取，不返回完整向量。单实例 AI 限流继续复用原实现。独立云数据库 pgvector migration 尚未验收。

平台 `npm run verify` 通过，原有 67/67 测试仍全通过；`npm run check` 通过，Starter ZIP 与源文件一致。Stage 3 仍 7 节且全部 `isPublished:false`，正式课总数仍 29。只改 Stage 3.4 新课、内部参考实现、验收文档和该课目录时长；Stage 1/2/4、Starter、课程图片、平台 Auth/支付/权益没有修改。

现有 `LessonMarkdown` 渲染器桌面与 390px 预览已检查：标题、两个停点、Prompt、SQL 代码块都可阅读；窄屏代码块在容器内横向滚动。两条新 Prompt 的 Copy 均实际点击，并粘贴进本地预览输入框，首尾文本完整。预览辅助文件仅在被 Git 忽略的 `.runtime/`。

提交前暂存范围为 49 个文件：新增 Stage 3.4 课程与 A/B 快照、验收文档，仅修改 3.4 目录时长。`git diff --cached --check` 通过；暂存补丁未含本机 `.env` 中的实际 Key/DB URL、Key 模式或字面数据库连接串；暂存路径没有 `.env`、`.runtime`、`node_modules`、`.next`、日志或构建目录。完整向量、Provider 原始响应和完整真实测试文档均未写入报告。
