# Stage 4.3 验收记录｜提议、确认、执行

日期：2026-10-03。开工 `main` / `origin/main`：`c02d70a7856802884b555d49c6a045da496e9870`，工作区干净。范围为 4.2 Embedding 预算缺省值硬化、4.3 课程、增量 Reference、教学图、装配器及本记录。Stage 4 Starter、Prisma schema 与 migration、4.4～4.8 没有改动。Stage 4 仍未发布，价格维持 299。

## 写入边界

- 固定 Registry：`echo_research_topic` 和 `search_knowledge` 为 read；`save_research_note` 为 write。模型仅看到 `title`、`content` 的 JSON Schema。服务端 strict Zod 对两字段 trim，限制 1～100 与 1～500 字符，拒绝额外字段、错误类型、空值和超长值。
- Runtime 在单个写 Tool Call 验证后返回 `waiting_approval`、规范化的精确 proposal 和 Approval Token，**不调用 write execute**。提议的 `toolCalls=0`，确认前 PostgreSQL `Resource` 增量为 0。未知写工具、坏参数和缺少签发能力均受控失败。既有 4 步、3 工具上限及只读路径保持。
- HMAC-SHA256 Token payload：`v=1`、当前 Session `userId`、固定 `toolName=save_research_note`、服务端固定字段顺序生成的 `canonicalArgs`、`expiresAt` 和随机 `nonce`。TTL 为 5 分钟。Secret 是服务器专用 `AGENT_APPROVAL_SECRET`；Reference 只有空占位符，测试随机生成本地 Secret。验签使用恒时比较。Token 由浏览器作为不透明凭证转交。
- `POST /api/agent/confirm` 先做同源检查与 Session 校验，请求体严格只有 `approvalToken`。验签后检查期限、当前 userId、固定工具名，再用同一 strict Zod 重新解析 canonicalArgs。数据库写入仅在这里发生：`Resource.title=title`、`desc=content`、`tag="文章"`、`ownerId=当前 Session user.id`、`important=false` 默认值。返回安全字段与 `saved`，确认阶段模型调用 0。
- UI 在确认前显示标题与内容的精确提议；取消清掉提议。pending 时禁用确认按钮仅防误触，**不提供服务器防重放保证**。

## 安全与数据库实测

隔离本地 PostgreSQL `stage4_l3` 仅应用 Starter 原四次 migration。A/B 两版的 `approval-route-acceptance.mjs` 与 `approval-provider-stub-acceptance.mjs` 均通过：

| 检查 | 结果 |
| --- | --- |
| 有效模型写提议 | `waiting_approval`，模型 1 次，工具执行 0，Resource 增量 0 |
| 精确确认 | 签名中的规范化标题、内容写入当前用户 Resource；分类「文章」，`important=false`，增量 +1；确认模型 0 次 |
| 请求体附加 title | strict body 拒绝 |
| 修改 payload 的 title、content、toolName、userId、expiresAt、nonce | 旧签名全部拒绝，DB 不变 |
| 修改签名 | 拒绝，DB 不变 |
| Alice Token + Bob Session | 拒绝；Bob DB 不变 |
| 已过期但签名有效的 Token | 拒绝，DB 不变；用测试时钟/签名 fixture，无五分钟等待 |
| 未知写 Tool / 多余写入参数 | 受控失败，工具执行 0 |
| 同源限制 | 跨源确认拒绝 |
| 只读 echo、search_knowledge | 回归通过 |

**CURRENT KNOWN LIMITATION: stateless HMAC approval is replayable.**同一仍有效的合法 Token 在隔离数据库确认两次，两次验签均成功，生成 2 条 Resource。4.3 尚未解决 replay，不能保证 exactly-once。没有添加内存 `usedTokens` 假保护；持久消费状态、唯一幂等键和事务留给 4.6。

## 4.2 Fail-Closed 小硬化

`runAgent` 启用 `search_knowledge`、有有效 userId、却漏传 `reserveEmbedding` 时，Tool Context 不再默认允许 Provider 工作。新增单测通过：返回 `budget_exhausted`，`embeddingCalls=0`、`toolCalls=0`、实际 Embedding 启动 0。正式 4.2 Route 原本显式传入回调，正常搜索行为未改；A/B 真实数据库与 Provider Stub 搜索回归通过。

## A/B、平台与真实 Provider

- A/B 均从全新 `.runtime` 目录装配，分别执行 `npm ci`、`npm test`、`npm run build`。各 36 项单测全通过，Next 构建包含 `/api/agent/run` 与 `/api/agent/confirm`。
- A/B 均通过 Stage 3 AI/Structured/Stream、Knowledge、RAG/Citation 路由回归，以及 4.1 Mock/Provider Stub、4.2 Alice/Bob Top-K、空结果、身份伪造、预算与取消单测、Provider Stub 回归。4.3 本地 Provider Stub 证实 `tool_choice=auto`、`enable_thinking=false`、`parallel_tool_calls=false`，1 次模型提议后 DB 仍 0，确认后 +1 且无新模型调用。
- 平台 `npm run verify` 通过：71 项平台测试；25 篇正文、124 个全局唯一 checkKeys；22 篇已发布正文的目录一致性；bundle 不含受保护 Markdown。另行执行的 `npm run check`、`check:starter`、`check:authored-content`、`check:content`、`check:bundle` 结果见本次终验记录。
- 真实北京地域 `qwen3.7-flash` 在第 1 次自然语言尝试返回 `waiting_approval`：`modelCalls=1`、`toolCalls=0`、`providerUnits=1`、`finishReasons=[tool_calls]`；确认前 DB 增量 0，确认后 +1，保存参数与提议一致，确认模型调用 0。真实配置、Token、原始模型响应与笔记内容未写入验收输出。

## 边界

本课不包含 MCP、Workflow Resume、AgentRun/Step/Action、审批表、幂等迁移或完整持久化状态。Token 的 5 分钟期限和 HMAC 防篡改不等于防重放。此 Reference 在 Stage 4 未发布状态下用于教学；正式可靠消费语义需后续持久状态与事务验证。
