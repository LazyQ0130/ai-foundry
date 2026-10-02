# Stage 4.1 最小受限 Agent Loop 验收（2026-10-03）

## 交付范围

以 Stage 3.7 最终 Reference 和 V1.1.1 Reliability Patch 为起点，交付完整 Stage 4 Starter、4.1 课程正文、A/B 内部 Reference 和配套教学图。Starter 包含 Stage 3 的问答、结构化输出、流式回答、知识库、RAG 与引用能力，以及原有四次 Prisma migration；不含 Agent Route、Runtime、Tool 或实验区。本课答案只存在于内部 Reference。Stage 4 保持未发布，价格仍为 299 元，Stage 3 的发布状态不变。

`stage4-starter` 只向有效 Stage 4 权益开放；Stage 3 权益不能替代。匿名、禁用或撤销 Stage 4 权益均无法下载。生成 ZIP 的 allowlist 排除本机环境、依赖、构建结果和内部答案；测试核对 ZIP 字节、条目和四次 migration。

## Agent 边界

Reference 只注册 `echo_research_topic` 一个只读、无外部副作用的工具。模型可提议调用，服务端以严格 Zod Schema 校验工具名、JSON 参数、额外字段和调用 ID，再执行。多个 Tool Call 整轮拒绝。循环默认最多 4 次模型步骤、3 次工具执行；每次真实 Provider 请求前预留 1 个 Provider 单位，保留现有每用户每分钟 5 次 HTTP guard 与 10 个真实 Provider 单位预算。取消、耗尽、参数失败和 Provider 失败都有受控终态。Tool 结果以 `role: tool` 数据回传；Route 使用 Session、同源写保护和固定请求体，不接受浏览器传入用户 ID 或工具实现。没有新增 migration、知识库 Tool、写入、审批、MCP 或持久化。

## 验证记录

- Stage 4 Starter 独立执行 `npm ci` 和 `npm run build` 成功；构建的 Route 列表没有 `/api/agent/run`。
- A/B 从干净目录分别装配，`npm ci`、`npm test`（各 26/26）及 `npm run build` 均通过。两版都包含 `/api/agent/run`。
- 本地隔离 `stage4_l1` PostgreSQL 从空库应用原四次 migration 成功。Mock Route 验收覆盖直答、Tool 往返、额外字段、多调用、预算、匿名、跨域、非法请求体与 HTTP 限流；本地 Provider Stub 通过 12 个直答、工具与失败场景。
- A/B 各自通过 Stage 3.1～3.3 路由回归、Stage 3.4 知识库回归和 Stage 3.5～3.6 RAG/引用回归，使用各自隔离的本地测试库。
- 北京地域 `qwen3.7-flash` 真实 Route 验收：直答为 1 次模型调用、0 次工具执行、360 tokens、816 ms；工具路径为 2 次模型调用、1 次工具执行、809 tokens、1153 ms。工具路径的 finish reasons 为 `tool_calls`、`stop`。仅使用本机被忽略的环境配置；终端不输出 Key、Prompt、答案或原始响应。
- 平台最终检查以本次提交前的 `npm run verify` 与 `npm run check` 结果为准。

## 适用范围

本次真实模型验收仅证明此模型、配置和两条短路径在当次请求中可用；模型仍可选择直答。取消传播在 Runtime 单测和浏览器交互中覆盖，不能据此推断所有网络中断时机均会由上游 Provider 立即终止。Stage 4 课程仍未发布。
