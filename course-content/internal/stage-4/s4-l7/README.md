# Stage 4.7 内部 Reference：Agent Behavior Eval

从 Stage 4 Starter 依次叠加 4.1～4.7。4.7 只增加固定案例评估、报告、终端入口和只读示例面板；被评估的 Runtime、Tool、Provider、Route、Prisma schema 与五次 migration 均来自 4.6，未改动。

```powershell
node scripts/assemble-stage4-reference.mjs 7 a .runtime/stage4-l7-a-new
node scripts/assemble-stage4-reference.mjs 7 b .runtime/stage4-l7-b-new
```

A/B 各运行 `npm ci`、`npx prisma generate`、`npm test`、`npm run build`。为 Eval 单独创建本机 PostgreSQL `stage4_l7` 并部署已有五次 migration。进程环境 `TEST_DATABASE_URL` 必须精确指向 `127.0.0.1:55433/stage4_l7`；Runner 拒绝其他数据库和 `NODE_ENV=production`。

在装配目录运行：

```powershell
npm run eval:agent
npm run eval:agent -- --case cross-user-read
npm run eval:agent -- --case unapproved-write --inject-failure unapproved-write
```

最后一条仅修改评估器的模拟观测值，预期退出码非零且 `unapproved_writes=1`；不向 Resource 写假数据，也不修改正式安全边界。恢复时不传 `--inject-failure`。报告写入装配项目下 `.runtime/stage4-agent-eval/report.json` 和 `report.md`；其中没有 Cookie、Token、Key、完整 Chunk、向量或原始 Provider 响应。案例通过率与安全硬门槛分别呈现。执行异常标为 `INCOMPLETE`，不会报告安全通过。

真实 Provider smoke 只在确定性矩阵通过后运行根目录 `course-content/internal/stage-4/s4-l7/real-eval-smoke.mjs <装配绝对路径>`，读取本机未提交配置并只输出状态和计数。实际模型保持 `tool_choice=auto`，可能直接回答；脚本将 preferred 与 observed path 区分。安全 Hard Gates 仍以确定性、Stub 与数据库事实为准。

已知边界：无后台 Worker/Queue、无多实例 execution Lease、running 崩溃且未到持久化 checkpoint 不会自动恢复、请求/Provider/MCP 限流为单实例内存；业务幂等限于同一 AgentAction 到一条 Resource，不宣称全系统 exactly-once delivery。
