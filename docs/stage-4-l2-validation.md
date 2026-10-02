# Stage 4.2 私有知识库只读 Tool 验收（2026-10-03）

## 基线与范围

本轮从干净的 `main` / `origin/main` `96e1cc74ce382f61975a7a75e317675c55211522` 开始。仅新增 4.2 正文、教学图、内部 A/B 公共 Reference、验收脚本，扩展 Stage 4 装配器并更新 4.2 课程元数据。Stage 4 Starter 源文件、ZIP、Prisma schema 与四次 migration 均未改动；Stage 4 保持未发布，价格 299。没有 4.3 写工具、审批、MCP、Workflow 或持久化。

## 数据与权限路径

`POST /api/agent/run` 从 `currentSession(request)` 取得 userId，交给仅在服务端使用的 Tool Execution Context。模型可见的 `search_knowledge` 参数只有 strict `{ query: string }`（trim，1～1000 字符，`additionalProperties: false`）；浏览器和 Tool 参数中的 `userId/ownerId` 均被拒绝。服务端每次搜索先检查取消并预留 Embedding 单位，然后直接复用 Stage 3 `embed(query)` 和 `retrieveTopK(userId, embedding)`。既有 SQL 在 `ORDER BY`/`LIMIT 3` 前按 owner、ready 状态、模型、维度筛选。Tool Result 只含 `matches[{title, position, preview, similarity}]`，`preview` 最多 160 字符，短 Chunk 也不返回全文；空结果是 `matches=[]`。返回值作为 `role:tool` 数据交回模型。

真实 Provider 工作按发生顺序分别预留：首次模型 1、Embedding 1、最终模型 1。Mock 不扣真实 Provider 单位。4.1 的 4 步/3 工具上限、单次 Tool Call、未知工具拒绝和全部终态保留。

## 确定性验收

- A/B 两个全新 `.runtime` 装配均完成 `npm ci`、`npm test`（各 31/31）和 Next.js 生产构建。
- 本地隔离 `stage4_l2` PostgreSQL 从空库应用原四次 migration。Mock 路由测试中，Bob 的三条 Chunk 都使用与查询完全相同的向量；Alice 有三条合法但相似度更低的 Chunk，其中第一条使用查询向量的 0.84 加另一向量的 0.16。Bob 的实测相似度高于 Alice；若错误地先全局 Top-3 再过滤，三条 Bob 结果会挤掉 Alice。实际 Alice 的 Tool Result 恰有自己的三条摘要，没有 Bob 标题或短预览；Bob 登录后能查到自己的三条资料。空账号得到 `matches=[]`。A/B 均通过。
- 浏览器请求体带 `userId/ownerId` 返回 400；模型参数带 `ownerId` 被 strict Schema 拒绝，Embedding 与工具执行均为 0。缺失、类型、空值、超长及其他额外字段由单测拒绝。
- 预算单测覆盖 A：0 model/0 embedding/0 tool；B：1/0/0；C：1/1/1，最终模型不发送；D：2/1/1，真实模式 3 units。Mock 路由也验证 A/B/C 停止路径。取消单测覆盖模型前、Embedding 前、Embedding 中和第二次模型前，Abort 后没有开启下一项工作。
- A/B 本地 Chat + Embedding Provider Stub 均通过真实 Route 的 model → embedding → model 三段路径（3 units），以及伪造参数、坏 JSON、Embedding 401/timeout 和浏览器身份伪造。上游私有错误文本不进入响应。
- 在 4.2 A/B 上运行 4.1 Mock 和原 12 个 Provider Stub 路由案例，全部通过。Stage 3.1～3.3 AI、3.4 Knowledge、3.5～3.6 RAG/Verified Citation 路由回归在 A/B 均通过。

## 北京地域真实调用

在已通过上述验证和构建后，用最终 A 版、被 Git 忽略的本地配置与 `stage4_l2` 数据库，使用 `qwen3.7-flash`、`text-embedding-v4`（1024 维）运行一次直答和一次知识搜索。直答：`completed`，1 model、0 embedding、0 tool、1 Provider unit，`stop`，446 Chat tokens，687 ms。知识搜索：`completed`，2 model、1 embedding、1 tool、3 Provider units，`tool_calls → stop`，1015 Chat tokens，1 条安全 match，1595 ms。验收输出没有 Prompt、答案、Key 或原始响应。

## 平台检查与限制

平台 `npm run verify`、`npm run check`、`npm run check:starter` 和 `npm run check:bundle` 均通过：平台测试 71/71，24 篇已写正文和 119 个 checkKeys 通过校验，22 篇已发布内容不变，Starter ZIP 与源文件一致。Stage 4 仍未发布。上述真实调用只证明本次短路径和当前 Provider 配置，`tool_choice=auto` 仍可能直答。取消测试证明应用 Abort 后不启动下一步，不声称所有真实网络中断都能瞬间物理停止。Tool 预览可能包含知识文档里的恶意文字，本轮以 `role:tool` 数据分层和固定 Registry 限制执行；更完整的注入评估留在 4.7。Provider 预算沿用 Stage 3 的单实例内存计数器，未验证多实例共享限流。
