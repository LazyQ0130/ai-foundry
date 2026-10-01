# Stage 3.4 内部 A/B 参考实现

本目录从 `s3-l3/` 增量演进。`common/` 保留 3.1 普通问答、3.2 结构化建议、3.3 流式问答、认证与 Resource CRUD，并新增 KnowledgeDocument → Chunk → Embedding → pgvector 入库。A 的日期排序和 B 的清除筛选、自选标题、统计继续保留。没有检索、Top-K 或 RAG 产品接口。

将 `starter/stage-1/` 外壳、`common/` 和 `implementation-a/` 或 `implementation-b/` 装配为单独 Next.js 项目；不要混用两份页面。学生应在自己的 3.3 项目中增量修改。Prisma 与 Client 固定 6.19.3，四次 migration 要按历史顺序执行。新 migration 在旧表和数据上增加 vector 扩展、KnowledgeDocument、KnowledgeChunk 与 `vector(1024)`，不修改 Resource。

默认 `AI_PROVIDER_MODE=mock`，相同文本得到确定性 1024 维 Mock 向量。真实模式要求服务端独立设置 `AI_EMBEDDING_BASE_URL`、`AI_EMBEDDING_API_KEY`、`AI_EMBEDDING_MODEL=text-embedding-v4`、`AI_EMBEDDING_DIMENSION=1024` 和受控 `AI_TIMEOUT_MS`；Chat 仍用 `AI_CHAT_*`。所有 Key 只在被 Git 忽略的服务端环境文件。调用最多 8 个 Chunk，先在事务外取得所有 Embedding，再用参数化 tagged-template SQL 与短事务写入，失败文档标为 `failed`。GET 只返回当前 Session 用户的安全元数据与短预览，不返回向量。

验证命令与隔离数据库结果见 `docs/stage-3-l4-validation.md`。`knowledge-units.test.mjs` 覆盖确定性切块和向量校验；`knowledge-reference.test.mjs` 覆盖 A/B 的 Mock、Stub、隔离与失败；继承的 `reference.test.mjs` 回归 3.1～3.3 和 Resource；`real-embedding-acceptance.mjs` 仅在显式传入隔离 DB 与本地真实凭证时做短真实调用。测试脚本不输出完整向量、Key 或 Provider 原始响应。
