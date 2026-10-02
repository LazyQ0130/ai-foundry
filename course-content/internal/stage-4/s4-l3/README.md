# Stage 4.3 内部 Reference

从冻结的 Stage 4 Starter 依次叠加 4.1、4.2 与本课 `common/`。A/B 原页面差异保留；Runtime、Registry、Provider、Route 与 AgentExperiment 由同一公共层提供。无新 migration，Starter 不包含 Agent 答案。

```powershell
node scripts/assemble-stage4-reference.mjs 3 a .runtime/stage4-l3-a-new
node scripts/assemble-stage4-reference.mjs 3 b .runtime/stage4-l3-b-new
```

各装配目录运行 `npm ci`、`npm test`、`npm run build`。测试包括 Stage 3、4.1、4.2 单元回归，以及本课 strict 参数、HMAC、过期和跨用户验证。Route 验收使用隔离本地 `stage4_l3` PostgreSQL，应用 Starter 现有四次 migration 后设置 `TEST_DATABASE_URL`：

```powershell
node course-content/internal/stage-4/s4-l3/approval-route-acceptance.mjs <已构建的 A/B 绝对路径>
node course-content/internal/stage-4/s4-l3/approval-provider-stub-acceptance.mjs <已构建的 A/B 绝对路径>
```

完成确定性、数据库、Stub 与构建验证后，可加载本机被 Git 忽略的真实 Provider 配置，运行 `real-approval-acceptance.mjs`。脚本仅输出调用计数和状态，不输出 Secret、Token、Prompt 或答案。

**当前已知限制：同一有效的无状态 HMAC Token 可以重放。**`approval-route-acceptance.mjs` 故意验证两次确认产生两条 Resource。课程和验收记录必须如实说明，不得宣称 exactly-once；正式消耗状态留到 4.6。
