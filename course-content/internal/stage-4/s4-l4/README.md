# Stage 4.4 内部 Reference

4.4 由 Stage 4 Starter、4.1、4.2、4.3 和本课 `common/` 顺序装配。A/B 原页面差异保留；MCP Server、Client、adapter、Agent Runtime 和 UI 只维护一份公共代码。Starter、Prisma schema 与原四次 migration 不改。

```powershell
node scripts/assemble-stage4-reference.mjs 4 a .runtime/stage4-l4-a-new
node scripts/assemble-stage4-reference.mjs 4 b .runtime/stage4-l4-b-new
```

各新装配目录运行 `npm ci`、`npm test`、`npm run build`。本课 overlay 自带与 `@modelcontextprotocol/server@2.2.0`、`@modelcontextprotocol/client@2.2.0` 匹配的 `package-lock.json`。

路由验收需隔离本地 PostgreSQL `stage4_l4`，仅应用 Starter 原四次 migration，并在根目录设置 `TEST_DATABASE_URL`：

```powershell
node course-content/internal/stage-4/s4-l4/mcp-route-acceptance.mjs <已构建的 A/B 绝对路径>
node course-content/internal/stage-4/s4-l4/mcp-failure-acceptance.mjs <已构建的 A/B 绝对路径>
node course-content/internal/stage-4/s4-l4/mcp-provider-stub-acceptance.mjs <已构建的 A/B 绝对路径>
```

确定性、HTTP、数据库、Stub 和构建通过后，可加载本机被 Git 忽略的 `qwen3.7-flash` 配置运行 `real-mcp-acceptance.mjs`。验收只打印状态和调用计数，不输出 Secret、Bearer 或原始 Provider 响应。

本机用 `MCP_REFERENCE_URL=http://127.0.0.1:<port>/api/mcp/reference` 并显式设置 `MCP_ALLOW_LOCAL_HTTP=1`；生产 URL 使用 HTTPS。`MCP_AUTH_SECRET` 与 `AGENT_APPROVAL_SECRET` 必须分别生成，`.env.example` 中保持空值。

教学图 `public/course-media/stage-4/s4-4-01.png`。按用户补充要求，4.1～4.3 的三张 Stage 4 图也改为前几阶段的白底蓝青技术插图风格，正文图片路径不变。
