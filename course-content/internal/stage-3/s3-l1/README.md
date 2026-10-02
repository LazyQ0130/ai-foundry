# Stage 3.1 内部 A/B 参考实现

在 Stage 2.8 完成版上继续。`common/` 是 Stage 2.8 共享文件的快照，加上 AI 组件、受保护 Route 和 server-only Provider；`implementation-a/app/page.tsx`、`implementation-b/app/page.tsx` 各自保留原页面，只在原有 `ResourcePreview` 后加入 `AiExperiment`。A 的日期排序、B 的清除筛选、自选标题和统计仍各自存在。目录是教学对照源码，不是独立的 Next.js 根目录。

装配参考项目时，以 `starter/stage-1/` 的静态外壳为底，叠加 `common/`，最后只从 A 或 B 选一份实现；B 还包含 Stage 1 延续的 `components/ResourceStats.tsx`。不要混合两份页面。保留 Stage 2 的三次 Prisma migration，不新增表。学生应在自己的 Stage 2 项目按需求增量修改，不能复制参考页面覆盖个性化内容。

`AI_PROVIDER_MODE` 未设置时默认为 `mock`，固定回答明确写 MOCK。真实模式需要在被 Git 忽略的服务端环境文件中设置 `AI_PROVIDER_MODE=real`、`AI_CHAT_BASE_URL`、`AI_CHAT_API_KEY`、`AI_CHAT_MODEL=qwen3.7-flash`、`AI_TIMEOUT_MS=20000`、`AI_CHAT_DISABLE_THINKING=1`。URL 和 Key 必须来自学生自己的北京地域 Workspace；不得写入源码、提交或传给浏览器。真实调用固定 `max_tokens:256`；`enable_thinking:false` 仅对该已验证模型启用。没有自动重试。

`POST /api/ai/answer` 先查同源和 Session，再验证 1～2000 字符输入，并按登录用户限制约 5 次/分钟。限流使用进程内 Map，仅为本地/单实例基础保护，多实例部署不具备全局计费保证。错误响应不携带 Provider 原文或堆栈。页面只提供单次问答状态，不实现流式、历史、结构化输出、Embedding 或 RAG。

Phase 0.5 的真实云端验收见 `docs/stage-3-technical-spike.md`。本参考 TypeScript Adapter 保留了已验收的请求体、超时范围和兼容参数，但与 Phase 0 JavaScript Adapter 是新的正式实现，应另做一次短真实调用验收；默认测试不访问云端。

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