# Stage 4.7 验收记录：Agent Behavior Eval

基线：`7fea4bf6d7f2f47671cd278f69dd425bc1e9ecfa`。本轮仅增加 Lesson 4.7 的固定行为评估、报告、只读 UI 示例、课程正文和图片；4.1～4.6 的 Agent Runtime、Tool Registry、Provider、Route、Approval、Prisma schema/migration 和 Stage 4 Starter 均未改动。Stage 4 仍为 299 元，4.7 仍未发布。没有 4.8 实现。

## 装配与数据库

- 从 Stage 4 Starter 分别独立装配 A/B 4.1～4.7，路径为 `.runtime/s4-l7-a-final` 与 `.runtime/s4-l7-b-final`。
- A/B 均完成 `npm ci`、`prisma generate`、`npm test`（55/55）、`npm run build`。
- 本机隔离 PostgreSQL `127.0.0.1:55433/stage4_l7` 从零部署现有五次 migration；Eval Runner 拒绝其他 URL 和生产环境。各案例创建独立用户及资料，以 HTTP、Stub 和 PostgreSQL 事实作断言。报告保存在各自未跟踪的 `.runtime/stage4-agent-eval/`。

## 固定矩阵与硬门槛

矩阵为 20 个主案例、73 个固定子案例：功能 6、可靠性 3、安全 11。覆盖 Direct、只读 Tool、私有知识、MCP、持久化工作流、批准后精确写入、重启和 Resume；故障覆盖未知 Tool、无效参数、多 Tool、浏览器伪造、跨用户读取与 Run、未批准写入、参数篡改、过期批准、重复确认、注入、上限、预算、超时、取消、并发、回滚及 MCP 鉴权/限流。

| 装配 | 主案例 | 子案例 | 跨用户泄露 | 未批准写入 | 重复确认写入 | 安全门槛 | Mock Provider 单位 | p50 / p95 |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| A | 20/20 | 73 | 0 | 0 | 0 | PASS | 0 | 99 / 1306 ms |
| B | 20/20 | 73 | 0 | 0 | 0 | PASS | 0 | 95 / 1350 ms |

单案例 `--case cross-user-read` 通过。`--case unapproved-write --inject-failure unapproved-write` 只在 Eval 观测值中注入假未批准写入，实际 Resource 不变；结果为案例 FAIL、`unapproved_writes=1`、总门槛 FAIL、退出码非零。去掉注入参数后 A 的完整 20/20 再次通过。任何案例执行异常标为 `INCOMPLETE`，不能显示安全通过。通过率不会覆盖任一安全硬门槛。

报告仅保留 ID、受控类别、次数、延时、断言与数据库 delta。固定案例检查敏感 fixture 标记不进入报告或 AgentStep 摘要；不保存凭证、Cookie、Approval Token、完整 Chunk、向量或原始 Provider 响应。p50/p95 仅为这批小样本的观察值，不是生产性能基准。

## 平台与历史回归

- 平台 `npm run verify` 通过：typecheck、生产构建、71/71 测试、29 篇 authored content / 144 个唯一 checkKey、22 篇 published content、bundle 检查。
- 旧课独立 HTTP 回归：4.1、4.3、4.4、4.5 通过。4.7 固定矩阵重新覆盖 4.2 的用户隔离搜索和 4.6 的持久化、确认、重启、并发、篡改与回滚。
- 旧版 4.2 独立脚本在全新 `stage4_l2_regression` 库停在 `knowledge-route-acceptance.mjs:78`：脚本断言短资料的 preview 不等于原文，但该资料短于当前 preview 上限。该脚本没有完成后续断言。
- 旧版 4.6 独立脚本在全新 `stage4_l6_regression` 库先通过重启与 8 次并发确认，之后停在 `persistence-route-acceptance.mjs:137` 的篡改后 GET 状态断言；该脚本没有完成后续断言。没有为这两个旧脚本改动已验收的 Agent 或 Lesson 4.7 范围外代码。
- Eval 首轮出现的用户名 fixture 超过 Starter 24 字限制，导致 12/20；仅缩短 Eval fixture 用户名后，A/B 从零装配均 20/20。正式 Agent 未改。

## 真实 Provider Smoke

使用本机未提交凭证、隔离 `stage4_l7` 库，真实 `qwen3.7-flash` + `text-embedding-v4`，保留模型的 `tool_choice=auto`。最后一次观察：Direct `completed`（1 model/0 tool）；私有知识搜索 `completed`（2 model/1 tool/1 embedding）；持久化搜索到提议 `waiting_approval`（2 model/1 search/1 embedding），确认前 Resource +0、确认阶段 model +0、确认后 Resource +1；MCP `completed`（2 model/1 tool/1 MCP）。记录位于 A 的未跟踪 `real-smoke.json`。

早两次真实尝试曾分别出现 Direct 与知识搜索 `failed`，第三次均完成；这表明 `tool_choice=auto` 的模型路径会波动。确定性矩阵和数据库硬门槛才是安全验收依据，真实 Smoke 只验证集成连通性与实际观察。

## 当前边界

没有后台 Worker/Queue、跨实例 execution Lease；running 状态若在持久化 checkpoint 之前崩溃，不会自动恢复。请求、Provider、MCP 限流是单实例内存状态。写入幂等只覆盖同一个 AgentAction 对应一条 Resource，不宣称全系统 exactly-once delivery。报告不使用 LLM-as-a-Judge。
