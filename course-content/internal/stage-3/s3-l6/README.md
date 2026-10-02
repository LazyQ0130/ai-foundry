# Stage 3.6 内部 A/B 参考实现

从 `s3-l5/` 增量演进：沿用四次 migration、同一个 `embed()` 和 `generate()`、A/B 页面差异以及 3.1～3.5 的功能。**本课没有新 migration。** 默认 Mock；真实模式使用北京地域 `text-embedding-v4`（1024 维）和 `qwen3.7-flash`。Mock 与 Real 分别只检索同模型、同维度的 Chunk。

`common/lib/knowledge-retrieval.ts` 继续在参数化 SQL 的排序与 LIMIT 3 前过滤 ownerId、ready、模型和维度。`knowledge-citations.ts` 从本次 Retrieved Set 的真实 chunkId 产生稳定 `SRC-CHUNK-<id>`，带入 Context。`knowledge-answer.ts` 用 Zod strict 校验模型 JSON，再用本次 Retrieved Set 的 Map 拒绝未知、非 Top-K 或其他账号的来源；标题、位置和预览只从 Map 映射。`POST /api/knowledge/ask` 使用同一个 `generate()` 的 structured 模式；Mock 固定引用实际 Top-1，也走同一验证逻辑。`/retrieve` 保留独立停点。页面分开显示检索候选与最终验证来源。没有问答历史、RAG Streaming 或 Evaluation。

装配：`starter/stage-1/` 静态外壳 + `common/` + `implementation-a/` 或 `implementation-b/`，不要混用两份页面。Prisma 与 Client 固定 6.19.3。登录、同源、每用户 AI 限流和 Key 服务端边界继续沿用。Key 只放入被 Git 忽略的 `.env`，不提交。独立云 PostgreSQL 的 pgvector 权限与增量 migration 仍未验收。

`rag-reference.test.mjs` 在隔离数据库回归 Top-K、owner、ready、模型/维度、Mock/Real、Provider 错误与空库，并验证伪造、非 Top-K、Bob 私有、重复、过量、额外字段、代码围栏及非法 JSON 的引用拒绝；复制的 3.1～3.4 测试继续回归原功能。真实验收只输出耗时与用量摘要，不打印完整向量、Prompt、回答、Key 或 Provider 响应。结果见 `docs/stage-3-l6-validation.md`。

## 干净装配与验证

在 AIFoundry 平台仓库根目录，为本课选择 A 或 B 页面，并使用一个新的 `.runtime` 目录：

```powershell
node scripts/assemble-stage3-reference.mjs LESSON a .runtime/clean-s3-lLESSON-a
cd .runtime/clean-s3-lLESSON-a
npm install
npm test
npm run build
```

把 `LESSON` 换成本课编号。`npm test` 使用项目本地固定版本的 `tsx`，运行本课全部纯单元测试，不要求数据库或 Provider Key。需要数据库的 `reference.test.mjs`、`knowledge-reference.test.mjs`、`rag-reference.test.mjs` 是独立集成测试；先设置独立的 `TEST_DATABASE_URL` 和 `DATABASE_URL`，部署本课已有 migrations，再以 `node <测试文件绝对路径> <装配项目绝对路径>` 运行。RAG 集成测试使用 `node --import tsx`。这些集成测试使用本地 Provider Stub，不产生真实模型费用。