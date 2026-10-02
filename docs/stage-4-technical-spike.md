# Stage 4｜Agent 技术 Spike

查询与实测日期：**2026-10-02（Asia/Shanghai）**。隔离目录：`course-content/internal/stage-4/phase-0/`。开工本地与远端 `main`：`ac548e166ce1cb26e55b198e65e02a9b64c03c0e`。本轮不改 `courses.ts`、Stage 3 Reference、正式 migration 或 Production。

## 1. 官方资料与技术选择

### 百炼 Function Calling

- [阿里云官方 Function Calling 指南](https://help.aliyun.com/en/model-studio/qwen-function-calling) 的 supported models 包含 Qwen3.7-Flash；示例使用北京地域 Workspace 专属 OpenAI-compatible Chat endpoint、`tools`、`tool_calls[].id/function.name/function.arguments` 和 `role: tool` 回传。`function.arguments` 是 JSON **字符串**，必须由服务端解析。工具调用的 `finish_reason` 为 `tool_calls`，普通完成为 `stop`；Chat Completion 返回 `usage`。查询日期如上。
- 同一指南写明 `tool_choice` 默认 `auto`；Qwen 在非思考模式下的 `required` 不能保证调用，在思考模式下 `required` 与指定工具对象不受支持。课程固定 `auto`，直答与工具两条路径都处理。Spike 使用 `enable_thinking:false` 与 Stage 3 配置一致。官方展示 `parallel_tool_calls:true` 能调用多个独立工具；V1 请求传 `false`，即使 Provider 返回多个也整轮拒绝。见 [parallel 示例](https://help.aliyun.com/en/model-studio/qwen-function-calling)。
- 官方有 streaming tool-call delta 示例；Phase 0/课程 4.1–4.5 走 **非流式工具决策**，减少拼接参数与审批状态复杂度。最终自然语言答案可以沿用 Stage 3 Streaming，但 streaming tool call 暂非 V1 教学路径。Stage 3 原有普通回答流不受影响。

### MCP

- [当前官方规范主页](https://modelcontextprotocol.io/specification/2026-07-28) 是 **2026-07-28** 版；[TypeScript SDK 官方仓库](https://github.com/modelcontextprotocol/typescript-sdk) 将 v2 列为 stable release line。本机 npm registry 于 2026-10-02 查到 `@modelcontextprotocol/server@2.2.0`、`@modelcontextprotocol/client@2.2.0`；本 Spike 固定这两个包，并使用 Zod 4。v1 的单包 `@modelcontextprotocol/sdk` 不是新课程主线。
- [SDK transport 文档](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/clients/connect.md)：stdio 用于 Host 启动本地进程；Streamable HTTP 用于远端连接。[Serving 文档](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/http.md) 推荐 `createMcpHandler`；旧 server-side HTTP+SSE transport 为迁移路径，[v2 迁移说明](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/migration/upgrade-to-v2.md) 已移除旧 `SSEServerTransport`，新课不选它。
- [MCP 2026-07-28 Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) 与 [MCP 安全原则](https://modelcontextprotocol.io/specification/2026-07-28) 要求用户同意和访问控制。正式 Streamable HTTP 私有工具需 HTTPS、验证来源、bearer audience/scope、服务端身份映射到 ownerId；本 Spike 仅用本地无私有数据的只读工具，不能把这个无鉴权实验 endpoint 直接部署公网。正式课优先 Streamable HTTP，stdio 放概念演示。

## 2. 可复跑实验

在隔离目录运行：

```text
cd course-content/internal/stage-4/phase-0
npm ci
npm test
npm run accept:real
```

`npm test` 的脚本显式使用隔离目录锁定的本地 `tsx`，不依赖作者机器全局 `jiti`。真实验收读取根目录被 `.gitignore` 排除的 `.env`，需要既有 `AI_CHAT_BASE_URL`、`AI_CHAT_API_KEY`、`AI_CHAT_MODEL=qwen3.7-flash`、`AI_TIMEOUT_MS`；只打印模型、地域、调用数、finish reasons、token 总量、用量与延时，不打印 Key、完整 prompt/answer 或 Provider 原始响应。

### Tool Registry、Stub 与 Agent Loop

`echo_research_topic` 是无副作用 deterministic read tool。模型看到 name、description、JSON Schema；服务端保留 strict Zod、risk 和 execute。`validateToolCall` 拒绝未知工具、缺失 ID、非法 JSON、缺参数、错类型、额外字段、空字符串与过大 arguments。Tool 输入不包含 ownerId/userId。模型返回内容和工具结果始终视为数据。Provider Stub 真实 HTTP 收到 `tools`、`tool_choice:auto`、`parallel_tool_calls:false`，验证直答、工具回传、usage、401、503、timeout、多工具、参数错误；未实现任意函数名 dispatch。

`runAgent` 用有限 `for` 循环，默认 4 model steps / 3 tool calls；每次模型调用前 `reserve('chat')`。真实知识库 Tool 接入时还需在 Embedding 调用前 reserve 一个 unit。终态覆盖 `completed`、`failed`、`cancelled`、`max_steps`、`max_tools`、`budget_exhausted`、`waiting_approval`。AbortSignal 传到 Provider fetch 与工具 context；后续正式 Embedding/MCP HTTP adapter 需沿同一路径传递。Stub 验证预算不足和已取消时没有启动模型；没有在本 Spike 中声称已验证真实 MCP HTTP 中途取消。

### 真实北京地域 Provider 验收

2026-10-02 使用现有 Stage 3 非敏感凭证，本机北京地域 Workspace endpoint，`qwen3.7-flash`，非思考模式，`tool_choice:auto`，非流式。直答：1 model call、0 tool calls、`finish_reason=stop`、354 tokens、1 provider unit、约 962 ms。工具闭环：`echo_research_topic` 真实 `tool_calls`，解析并执行，再作为 `tool` message 回传；2 model calls、1 tool call、`finish_reason=tool_calls → stop`、755 tokens、2 provider units、约 1973 ms。实际模型是否选择工具仍是概率行为；此一次成功验收不等于之后每次必调。未测试真实 `parallel_tool_calls:false` 在大量采样下是否绝对抑制多调用，因此本地拒绝分支必须保留。未记录单轮 usage 明细或完整响应。

现有 10 units/minute 足够这条最小闭环（2 units），知识检索再多一个 Embedding unit 后约 3 units。建议暂不提高生产预算；正式课再以并发与多次 Agent Run 测试确认限流体验。

### MCP 双传输

官方 SDK `2.2.0` 的 `research_reference` 只读工具返回公开 deterministic 数据。`StreamableHTTPClientTransport` 经 `createMcpHandler.fetch` 的真实 HTTP Request/Response 边界完成 handshake、listTools、callTool；`StdioClientTransport` 启动 Node 子进程也完成同样链路。client 对结果再做 strict Zod 校验；输入额外 `ownerId` 被 MCP Tool 拒绝。HTTP 测试通过内存 fetch 桥接，未开放公网端口，也未验证远端网络部署、认证或负载均衡。正式产品需要单独实现 scoped auth。

### Signed approval

HMAC-SHA256 绑定 `userId`、固定写工具名、canonicalArgs、到期时间与随机 nonce。测试验证合法 token、参数/工具/用户篡改、过期、签名损坏。**同一合法 token 重复验签仍成功**：纯签名没有 consumed state，也不能保证单次写；4.6 必须以持久化 Action 和 DB unique 幂等实现。4.3 若接生产真实写动作，必须给这一限制设计临时持久化补丁或把写操作保持为教学沙盒。

### Persistence 草案与隔离 SQL 验证

建议三表 AgentRun / AgentStep / AgentAction，字段与状态迁移见[课程蓝图](./stage-4-course-blueprint.md)。内存 SQLite SQL Spike 用 `idempotencyKey UNIQUE` 与业务行 `actionKey UNIQUE`，同一 Resume 调用两次只产生一条 Action 和一条 Note，均在事务内完成。**这只验证设计机制，不等于 PostgreSQL/Prisma 并发、锁语义已验收**；4.6 正式 migration 前须在隔离 PostgreSQL 中做并发 Resume、崩溃恢复和 ownerId 隔离测试。不在 Stage 3 Reference 或学生项目加 migration。

## 3. 已知缺口与下一阶段验收

Phase 0 Spike 不是可上线 Agent 服务。4.2 要把真实 `search_knowledge` 接到 Session ownerId / Top-K / Embedding budget；4.3 要完成浏览器精确展示和单次写入保障；4.4 要实现有鉴权的远程 MCP adapter；4.6 要用 PostgreSQL 测试事务并发和重复 Resume；4.7 要跑固定安全案例集。Agent 产出的答案仍需 Citation 语义验收，不能因为 Tool 调用成功就视为研究正确。

## 4. 本轮验证记录

隔离目录 `npm ci && npm test`：7/7 通过，包含 Provider Stub、参数安全、审批篡改/过期/replay 限制、MCP 双传输、内存 SQL 重复 Resume；`npm run accept:real`：直答和真实 Tool 闭环均通过。平台 `npm run verify`：TypeScript、构建、70/70 测试、内容及 bundle 检查通过；`npm run check`：内容与 Stage 1/3 Starter 一致性检查通过。已核对暂存差异，不含本机 `.env` 的 Key/数据库密钥、完整 Provider 响应、node_modules、`.next` 或运行日志。`git diff --cached --check` 无空白错误。
