# Stage 3.5 内部 A/B 参考实现

从 `s3-l4/` 增量演进：沿用四次 migration、KnowledgeDocument/KnowledgeChunk、同一个 `embed()`、A/B 页面差异以及 3.1～3.4 的功能。**本课没有新 migration。** 默认 Mock，可用已有 Mock 索引跑 Question → Query Embedding → ownerId 隔离 Top-3 → Context → Mock 回答；真实模式使用北京地域 `text-embedding-v4`（1024 维）和 `qwen3.7-flash`。Mock 与 Real 分别只检索同模型、同维度的 Chunk。

`common/lib/knowledge-retrieval.ts` 在参数化 `$queryRaw` 中 JOIN Chunk 和 Document，并在 cosine distance 排序与固定 LIMIT 3 **之前**过滤 Session ownerId、ready、非空向量、Embedding 模型与维度。`knowledge-rag.ts` 把命中块整理为可读 Context；服务端 system instruction 说明资料是不可信参考数据、无依据应拒答。`POST /api/knowledge/retrieve` 是只看命中的教学停点，不调用 Chat；`POST /api/knowledge/ask` 使用普通 `generate()` 完成单轮回答。两个接口只接受 `question`，没有问答历史、RAG Streaming、正式引用或 Evaluation。

装配：`starter/stage-1/` 静态外壳 + `common/` + `implementation-a/` 或 `implementation-b/`，不要混用两份页面。Prisma 与 Client 固定 6.19.3。登录、同源、每用户 AI 限流和 Key 服务端边界继续沿用。Key 只放入被 Git 忽略的 `.env`，不提交。独立云 PostgreSQL 的 pgvector 权限与增量 migration 仍未验收。

`rag-reference.test.mjs` 在隔离数据库运行 A/B 的 Top-K、owner、status、模型/维度、排序、限制、Mock/Real、Provider 错误与空库测试；复制的 3.1～3.4 测试继续回归原功能。`real-rag-acceptance.mjs` 仅在显式配置真实服务端凭证与隔离数据库时运行短真实调用，输出耗时与用量摘要，不打印完整向量、Prompt、回答、Key 或 Provider 响应。结果见 `docs/stage-3-l5-validation.md`。
