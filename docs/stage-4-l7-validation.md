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
- 旧课独立 HTTP 回归：4.1、4.3、4.4、4.5 通过。以下 4.2 与 4.6 悬案在 Stage 4.7.1 用全新装配和新隔离库重跑，两个**原样的完整 historical script** 均通过；没有删除或放宽断言。

### 4.2 历史脚本收口

原失败在 `knowledge-route-acceptance.mjs:78`，`preview === aliceContent`。真正原因是当时复用的 `.runtime/stage4-l2-a-final` 是过期装配：其中 `lib/knowledge-search.ts` 的 SHA-256 为 `781B127D…`，执行的是 `chunk.content.slice(0, 160)`；当前 4.2 overlay 与新装配文件的 SHA-256 都是 `55208083…`，执行 `slice(0, Math.min(160, Math.floor(length * 0.75)))`。两个装配的 Next `BUILD_ID` 也不同。此前“短资料低于 160 所以全文返回”只解释了过期实现的结果，不能解释当前代码，现予以纠正。

新装配 `.runtime/regression-l2-a-20261003-v2` 经 `npm ci`、Prisma generate、build 后，在从零迁移的 `stage4_l2_regression_v2` 上诊断：Alice fixture 全文长 36、preview 长 27、两者不相等，匹配标题是 Alice 自己的资料。随后撤掉临时诊断，再运行**未改动**的完整 `knowledge-route-acceptance.mjs`：PASS，继续覆盖 Bob 高相似度但 Alice 不可见、Bob 自有检索、空用户、浏览器与 Tool owner 伪造、预算 A/B/C。该 route 脚本本身没有取消用例；取消前模型、Embedding 与最终模型等路径由同一新装配的 `knowledge-agent.test.mjs` 覆盖。正式代码未修改，测试脚本未修改。

### 4.6 历史脚本收口

原失败在 `persistence-route-acceptance.mjs:137`：损坏 Action 后，GET 响应中的 `status` 为 `undefined`；当时未记录 HTTP 状态码。复用的 `.runtime/s4-l6-a-final/lib/agent-persistence.ts` SHA-256 为 `9275BCA7…`，没有当前 `safeRunView()` 的损坏 Action 修复分支；当前 4.6 overlay 与新装配文件的 SHA-256 均为 `CD3CC452…`，包含 `JSON.parse`、canonicalize 校验、Run 和 Approval Step 转 `failed`。旧装配与新装配的 Next `BUILD_ID` 不同。原因是过期装配/构建，而非当前持久化代码的安全缺陷。

新装配 `.runtime/regression-l6-a-20261003-v2` 经 `npm ci`、Prisma generate、build 后，在从零迁移的 `stage4_l6_regression_v2` 上诊断：损坏前 Run=`waiting_approval`、Action=`proposed`、canonicalArgs 有效；Action count=1，更新命中 1 行，损坏后 JSON 无效；GET HTTP 200、响应 `failed`，数据库 Run=`failed`、Approval Step=`failed`，该 Action 对应 Resource 数为 0。旧 Token 的 Confirm 被原脚本断言为 400，`failed` 视图不签发新 Token。撤掉临时诊断后，**未改动**的完整 `persistence-route-acceptance.mjs` 三段 Server A/B/C 均 PASS，涵盖后续预算和取消。正式代码未修改，测试脚本未修改；因此无需新增 4.7 Eval 子案例。

### 4.7.1 复核

4.2 新装配单测 32/32，4.6 新装配单测 51/51。再次从 Starter 分别新装配 4.7 A/B，各自 `npm ci`、Prisma generate、单测 55/55、生产构建通过；隔离 `stage4_l7` 库的确定性矩阵均 20/20、73 子案例、三个 Hard Gates 各为 0。A 的红灯注入结果为退出码 1、`unapproved_writes=1`、总门槛 FAIL；不带注入重跑完整矩阵恢复 PASS。4.1、4.3、4.4、4.5 独立 HTTP 脚本也在本轮再次执行并通过。故 4.1～4.7 的独立回归与固定矩阵均通过。上轮 Eval 首轮曾因 fixture 用户名超过 Starter 24 字限制而只有 12/20；当时仅缩短 Eval 用户名后恢复 20/20，正式 Agent 未改。

## 真实 Provider Smoke

使用本机未提交凭证、隔离 `stage4_l7` 库，真实 `qwen3.7-flash` + `text-embedding-v4`，保留模型的 `tool_choice=auto`。最后一次观察：Direct `completed`（1 model/0 tool）；私有知识搜索 `completed`（2 model/1 tool/1 embedding）；持久化搜索到提议 `waiting_approval`（2 model/1 search/1 embedding），确认前 Resource +0、确认阶段 model +0、确认后 Resource +1；MCP `completed`（2 model/1 tool/1 MCP）。记录位于 A 的未跟踪 `real-smoke.json`。

早两次真实尝试曾分别出现 Direct 与知识搜索 `failed`，第三次均完成；这表明 `tool_choice=auto` 的模型路径会波动。确定性矩阵和数据库硬门槛才是安全验收依据，真实 Smoke 只验证集成连通性与实际观察。

## 当前边界

没有后台 Worker/Queue、跨实例 execution Lease；running 状态若在持久化 checkpoint 之前崩溃，不会自动恢复。请求、Provider、MCP 限流是单实例内存状态。写入幂等只覆盖同一个 AgentAction 对应一条 Resource，不宣称全系统 exactly-once delivery。报告不使用 LLM-as-a-Judge。
