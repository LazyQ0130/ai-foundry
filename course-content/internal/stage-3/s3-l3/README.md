# Stage 3.3 内部 A/B 参考实现

从 Stage 3.2 完成版继续。`common/` 保留普通问答、结构化建议、认证、Resource CRUD 与三次原有迁移，在原问答区加入普通/流式模式、`POST /api/ai/stream` 与同一个 Provider 的 `stream()`。A 的日期排序、B 的清除筛选、自选标题和统计仍各自存在。本目录是教学对照源码，不是独立的 Next.js 根目录。

装配方式仍是 `starter/stage-1/` 静态外壳 + `common/` + A 或 B 的实现；B 包含它从 Stage 1 延续的 `ResourceStats` 组件。不要混合两份页面。学生应在自己的 3.2 项目按需求增量修改，不覆盖个性化内容。

`AI_PROVIDER_MODE` 未设置时默认为 `mock`。流式 Mock 固定分为四段，每段相隔 800 ms。真实模式继续使用学生自己的北京地域 Workspace 服务端配置 `AI_CHAT_BASE_URL`、`AI_CHAT_API_KEY`、`AI_CHAT_MODEL=qwen3.7-flash`、`AI_TIMEOUT_MS=20000`、`AI_CHAT_DISABLE_THINKING=1`。URL 与 Key 只在被 Git 忽略的服务端环境文件；请求固定 `max_tokens:256`，流式请求带 `stream:true` 与 `stream_options.include_usage:true`，没有无限重试。

`POST /api/ai/answer` 与 `POST /api/ai/suggest` 保持原有行为。新 `POST /api/ai/stream` 先验证同源、Session、JSON、输入和共享限流，再把 Provider SSE 解析为自己的 NDJSON `meta/delta/usage/done/error` 事件。浏览器逐行读取；取消时 AbortSignal 经 Route 传给 Provider，generation id 阻止迟到块污染新回答。suggest 仍用普通 `generate()` 和严格 Schema，只做预览。进程内限流仅是单实例基础保护，不是多实例计费系统。

`stream-units.test.mjs` 测任意 SSE 切分、坏流、提前关闭与 generation id。`reference.test.mjs` 对 A/B 装配项目运行 Mock、Provider Stub、取消、错误边界及 3.1/3.2/Resource 回归；`real-reference-acceptance.mjs` 需显式执行两次短真实请求，一次完成、一次首段后取消，默认测试不会调用云端。验收记录见 `docs/stage-3-l3-validation.md`。

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