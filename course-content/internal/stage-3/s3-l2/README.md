# Stage 3.2 内部 A/B 参考实现

从 Stage 3.1 完成版继续。`common/` 保留 3.1 的问答、认证、Resource CRUD 与三次原有迁移，新增结构化建议组件、Zod strict Schema 和受保护的 `POST /api/ai/suggest`。A 的日期排序、B 的清除筛选、自选标题和统计仍各自存在；两版只在现有页面增加同一个建议区。本目录是教学对照源码，不是独立的 Next.js 根目录。

装配方式仍是 `starter/stage-1/` 静态外壳 + `common/` + A 或 B 的实现；B 包含它从 Stage 1 延续的 `ResourceStats` 组件。不要混合两份页面。学生应在自己的 3.1 项目按需求增量修改，不覆盖个性化内容。

`AI_PROVIDER_MODE` 未设置时默认为 `mock`。结构化 Mock 固定输出合法 JSON，但仍由同一个 `JSON.parse → Zod` 路径校验后才返回。真实模式继续使用学生自己的北京地域 Workspace 配置 `AI_CHAT_BASE_URL`、`AI_CHAT_API_KEY`、`AI_CHAT_MODEL=qwen3.7-flash`、`AI_TIMEOUT_MS=20000`、`AI_CHAT_DISABLE_THINKING=1`。URL 与 Key 只在被 Git 忽略的服务端环境文件；请求固定 `max_tokens:256`，structured 选项发送 `response_format:json_object`，没有自动重试。

`POST /api/ai/answer` 保持 3.1 行为。`POST /api/ai/suggest` 同样先查同源和 Session，验证 1～3000 字符内容，复用同一用户级每分钟五次限流 Map。两个 Route 共享 Provider 配置、fetch、超时和安全错误映射。suggest 只返回严格 Schema 通过的 `summary`、`tags`、`confidence`，不调用 Resource 写入。进程内限流仅是单实例基础保护，不是多实例计费系统。页面只做预览，不实现 Streaming、Embedding 或 RAG。

`reference.test.mjs` 对 A/B 装配项目运行 Mock、Provider Stub 和坏输出测试；`real-reference-acceptance.mjs` 是需显式执行的一次真实低成本验收，不在默认测试中调用云端。历史 baseline 与 3.1 验收见 `docs/stage-3-technical-spike.md`、`docs/stage-3-l1-validation.md`。
