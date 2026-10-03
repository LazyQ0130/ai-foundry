# Stage 4.6 内部 Reference

从 Stage 4 Starter 依次叠加 4.1～4.6。`common/` 增加第五次 migration、持久化 Run/Step/Action、V2 Action 确认、恢复路由与页面。Starter 和历史 4.1～4.5 Reference 不改。A/B 只保留各自原本的页面差异。

```powershell
node scripts/assemble-stage4-reference.mjs 6 a .runtime/stage4-l6-a-new
node scripts/assemble-stage4-reference.mjs 6 b .runtime/stage4-l6-b-new
```

在两个全新装配目录分别运行 `npm ci`、`npx prisma generate`、`npx prisma migrate deploy`、`npx prisma migrate status`、`npm test`、`npm run build`。迁移使用隔离 PostgreSQL `stage4_l6`；旧数据升级使用已含四次 migration 的 `stage4_l5`。

根目录设置进程内且不提交的 `TEST_DATABASE_URL`，然后运行：

```powershell
node --import tsx course-content/internal/stage-4/s4-l6/persistence-route-acceptance.mjs <A/B 绝对路径>
node --import tsx course-content/internal/stage-4/s4-l6/persistence-rollback-acceptance.mjs <A/B 绝对路径>
node --import tsx course-content/internal/stage-4/s4-l6/persistence-provider-stub-acceptance.mjs <A/B 绝对路径>
```

真实 Provider 仅在确定性、数据库、并发、重启和 Stub 验收通过后运行 `real-persistence-acceptance.mjs`。它使用本机未提交凭证，只打印状态与计数，不打印 Key、Cookie、Token 或 Provider 原始响应。

4.6 当前公开写入只通过 persisted AgentAction。4.3/4.5 的历史 V1 replay 行为仍可在其各自的历史装配验证；当前 4.6 路由关闭这些旧写入口。无后台 Worker/Queue 或多实例执行 Lease；幂等保证限于同一个 AgentAction 到一个 Resource 的业务效果。
