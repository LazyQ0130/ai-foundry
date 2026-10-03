# Stage 4.6 验收记录：持久化 Agent Run 并安全恢复

基线：`a9c66abc29f49c50a1ab1b9b65dced497aec2d6d`，`main` 与 `origin/main` 一致且开工时 workspace clean。仅扩展 4.6 overlay、装配脚本、4.6 课程正文与元数据、教学图和本记录；Stage 4 Starter 与历史 4.1～4.5 文件未改。

## Migration 与数据

第五次 migration：`20261003120000_add_agent_persistence`。全新隔离 PostgreSQL `stage4_l6` 从零 `prisma migrate deploy` 成功，`prisma migrate status` 显示五次已应用、schema up to date。已有 4.5 测试库 `stage4_l5` 由四次升级到五次，迁移前后 User/Resource/KnowledgeDocument/KnowledgeChunk 数量均为 `32/16/16/16`；新增 AgentRun、AgentStep、AgentAction 表为空。历史 Resource 的 `agentActionKey` 为 null。

`AgentRun` 保存 owner、goal、status、currentStep 和时间；`AgentStep` 保存有序安全摘要，`(runId,position)` 唯一；`AgentAction` 保存精确 canonicalArgs、status 和业务 key，`stepId` 与 `idempotencyKey` 唯一。Resource 的可空 `agentActionKey` 在 PostgreSQL 有真实 UNIQUE index。Step 是时间线，Action 是写入消费状态。

## 状态、授权与恢复

新建 Run 的 ownerId 只取 Session。POST body strict，拒绝 ownerId、userId、status、currentStep、actionId、idempotencyKey。GET 按 owner 过滤并按 position 输出 Step，不输出原始 canonicalArgs、业务 key、密钥、Provider 原文或 Chunk。Bob 对 Alice Run 的 GET/Resume 得到 404，对其 V2 Token Confirm 被拒绝。Alice 的知识搜索仍按 owner 过滤。

正常 Mock Run：`running → waiting_approval`，时间线 `model → tool → model → approval`，确认前无 Resource。Server A 创建、Server B 重新 GET 到同一提议并取得新短期 Token、Server C 再 GET 到 `completed` 和相同 Resource，均用同一 PostgreSQL、签名 Secret 与 Session。UI 在 localStorage 只保存最近 Run ID，刷新后 GET 权威视图；Confirm 后再次 GET，而非浏览器自行把时间线标完成。

可恢复 Mock Provider 故障与第二次模型前预算耗尽均持久化失败/阻塞 Step，Run 为 `paused`，Action/Resource 为 0。Resume 通过原子 `paused → running` 抢执行权，从只读搜索 checkpoint 重做，重新计 Provider 预算。并发 Resume ×2 结果 `200/409`；Provider Stub 只收到一套 `model → embedding → model` 请求。取消等待中的 Run 后不能 Resume 或 Confirm。损坏的待确认 Action 参数在 GET 时转为终态 `failed`。

## V2、事务与业务幂等

V2 HMAC 绑定 `v,userId,runId,actionId,toolName,canonicalArgs,expiresAt,nonce`，Token 不入库；GET proposed Action 可重签。业务 key 是 `SHA-256(JSON.stringify([runId,stepId,toolName,canonicalArgs]))`，单测验证稳定与字段变化。Confirm 仅接受 approvalToken；在 Prisma PostgreSQL 事务中先 `SELECT AgentAction FOR UPDATE`，核对 owner 与 Action，再写 Resource、标 Action executed、补 Step 并完成 Run。Resource 的 `agentActionKey` 是第二层 UNIQUE 约束。旧 V1 可确认写 Route 在 4.6 当前应用返回 410，历史 4.3 Reference 仍保留其当时的 replay 事实。

真实 PostgreSQL HTTP：同一 Action 并发 Confirm ×8 得 1×201、7×200，AgentRun=1、AgentAction=1、Resource(actionKey)=1，Run completed、Action executed；**duplicate confirmed writes = 0**。事务 commit 后模拟响应丢失，重启 Next 后用原 Token 重试返回同一 Resource。直接集成测试在 Resource.create 后注入异常，Resource=0、Action proposed、Run waiting_approval；正常重试后 Resource=1。Confirm 模型和 Provider 调用均为 0。

## 装配、回归与真实 Provider

A/B 全新装配均运行 `npm ci`、Prisma Client generation、`npm test`（各 51 项通过）、`npm run build`（通过）。4.1 有界 Runtime、4.2 owner 搜索/预算/取消、4.3 HMAC 篡改/跨用户/过期、4.4 MCP 协议/鉴权/边界、4.5 搜索到提议/注入/MCP rate 的原有单测包含在 51 项内。历史 4.3 的“同 Token 可写两条”只属于旧版课程装配；4.6 当前 Route 的写入结果由新 PostgreSQL 验收覆盖。

Provider Stub 实际发出 2 次 Chat、1 次 Embedding，确认阶段请求数不增加；检查 `tool_choice=auto`、`enable_thinking=false`、`parallel_tool_calls=false` 与第二次模型的 `role:tool`。真实北京地域 `qwen3.7-flash` + `text-embedding-v4` 第一次尝试到达 `waiting_approval`：2 model、1 embedding、1 read tool、3 Provider units，确认前 Resource +0；重启后找回提议，Confirm 0 model/0 Provider、Resource +1、Action executed/Run completed，再次确认 Resource 仍 +1。

平台 `npm run verify` 通过（71 项测试），`npm run check`、`npm run check:starter`、`npm run check:authored-content`、`npm run check:content`、`npm run check:bundle` 均通过；4.6 正文的 5 个 checkKeys 在全站 139 个唯一键中通过校验。另在历史 4.5 装配重跑 Workflow HTTP（包含旧 replay 事实、Alice/Bob、注入、预算与循环）及 MCP 请求限流，均通过。

## 已知限制

没有后台 Worker/Queue、没有多实例 execution Lease、没有跨 region orchestration。HTTP Provider 调用本身不是 exactly-once。请求、Provider、MCP rate limit 仍是单实例内存。进程在 `running` 且尚未持久化安全 checkpoint 时崩溃，当前版本不会由后台任务自动重跑；本课验证的是 `waiting_approval` 跨重启、`paused` 主动 Resume 和同一 AgentAction→Resource 的幂等业务效果。
