# Stage 4.5 内部 Reference

从 Stage 4 Starter 依次叠加 4.1、4.2、4.3、4.4、4.5；A/B 仍保留各自页面差异。4.5 的 Runtime、Mock、Route、Timeline 和 UI 只维护在 `common/`。Stage 4 Starter、Prisma schema、原四次 migration 不改，4.4 MCP package 与匹配的 lock 继续随装配保留。

```powershell
node scripts/assemble-stage4-reference.mjs 5 a .runtime/stage4-l5-a-new
node scripts/assemble-stage4-reference.mjs 5 b .runtime/stage4-l5-b-new
```

在全新装配目录分别运行 `npm ci`、`npm test`、`npm run build`。隔离 PostgreSQL `stage4_l5` 仅应用 Starter 原四次 migration；本机设置不提交的 `TEST_DATABASE_URL` 后运行：

```powershell
node --import tsx course-content/internal/stage-4/s4-l5/workflow-route-acceptance.mjs <A/B 绝对路径>
node course-content/internal/stage-4/s4-l5/mcp-rate-acceptance.mjs <A/B 绝对路径>
node --import tsx course-content/internal/stage-4/s4-l5/workflow-provider-stub-acceptance.mjs <A/B 绝对路径>
```

再对 A/B 跑 4.1～4.4 路由与 Stub 回归。所有确定性门槛通过后，用本机被 Git 忽略的北京地域 `qwen3.7-flash` 凭证运行 `real-workflow-acceptance.mjs`；该脚本只打印状态和计数，不输出 Key、Token、Cookie、笔记内容或 Provider 原始响应。真实模型选择 Tool 是概率行为，不强制调用。

MCP request guard 是固定内部客户端每进程 60 协议请求/分钟；鉴权后计数、超限 429 并跳过 handler。它不是多实例全局限流。Workflow 只存在于请求、页面内存与短期 Approval Token；刷新或进程重启不能 Resume。原有 Approval Token replay 限制仍在，4.6 才引入持久化与幂等。
