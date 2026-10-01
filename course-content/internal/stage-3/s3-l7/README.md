# Stage 3.7 内部 A/B 参考实现

从 `s3-l6/` 增量演进：沿用四次 migration、同一个 `embed()` 和 `generate()`、A/B 页面差异以及 3.1～3.6 的功能。**本课没有新 migration，也不改变正式用户产品的路由与页面。** 默认 Mock；真实模式使用北京地域 `text-embedding-v4`（1024 维）和 `qwen3.7-flash`。

`common/lib/knowledge-retrieval.ts` 继续在参数化 SQL 的排序与 LIMIT 3 前过滤 ownerId、ready、模型和维度。`knowledge-citations.ts` 从本次 Retrieved Set 的真实 chunkId 产生稳定 `SRC-CHUNK-<id>`，带入 Context。`knowledge-answer.ts` 用 Zod strict 校验模型 JSON，再用本次 Retrieved Set 的 Map 拒绝未知、非 Top-K 或其他账号的来源；标题、位置和预览只从 Map 映射。`POST /api/knowledge/ask` 使用同一个 `generate()` 的 structured 模式；Mock 固定引用实际 Top-1，也走同一验证逻辑。`/retrieve` 保留独立停点。页面分开显示检索候选与最终验证来源。没有问答历史、RAG Streaming 或 Evaluation。

装配：`starter/stage-1/` 静态外壳 + `common/` + `implementation-a/` 或 `implementation-b/`，并把本目录的 `eval/`、`scripts/` 放到装配项目根目录；不要混用两份页面。Prisma 与 Client 固定 6.19.3。登录、同源、每用户 AI 限流和 Key 服务端边界继续沿用。Key 只放入被 Git 忽略的 `.env`，不提交。独立云 PostgreSQL 的 pgvector 权限与增量 migration 仍未验收。

`eval/knowledge-pack.json` 是固定的三篇非敏感资料；`eval/rag-cases.json` 是 8 条可答、4 条无答案的固定题目。明确入库知识包后要等待至少 60 秒，让同账号入库请求离开限流窗口。`scripts/rag-eval.mjs` 只通过现有 `/api/knowledge/ask` 顺序运行，不复制 Embedding、SQL、Prompt 或 Provider；12 题之间至少等待 13 秒，不自动重试。真实模式须显式 `EVAL_REAL_CONFIRM=YES`，账号、密码和本地 URL 只从环境变量读取。详细 JSON 和人工复核 Markdown 只写到运行目录的 `.runtime/`；终端只输出计数、耗时和 Token 摘要。人工逐条判断来源是否支持答案，不由模型给自己打分。

`eval/rag-eval-core.test.mjs` 验证题集格式、重复 ID、两类题目、指标、失败分类、null usage 和摘要；继承的 reference tests 回归 3.1～3.6 与 Resource、Alice/Bob 隔离。结果见 `docs/stage-3-l7-validation.md`。独立云 PostgreSQL pgvector extension 权限和增量 migration 仍未验收。
