# Stage 4.2 内部 Reference

从冻结的 Stage 4 Starter 依次叠加 4.1 common、原 A/B 页面，再叠加本课 `common/`。本课不需要 A/B 代码分叉：原页面差异继续保留，Tool、Runtime、Provider、Route 和 UI 都由公共层提供。无新 migration，Starter 不包含这些答案。

在平台根目录，向两个全新 `.runtime` 目录装配并验证：

```powershell
node scripts/assemble-stage4-reference.mjs 2 a .runtime/stage4-l2-a-new
node scripts/assemble-stage4-reference.mjs 2 b .runtime/stage4-l2-b-new
```

在各装配目录运行 `npm ci`、`npm test`、`npm run build`。`npm test` 包含 Stage 3 和 4.1 回归及 4.2 的严格参数、预算、取消单测。

数据库路由验收使用隔离的本地 `stage4_l2` PostgreSQL，应用 Starter 原四次 migration 后，在根目录设置 `TEST_DATABASE_URL` 并运行：

```powershell
node --import tsx course-content/internal/stage-4/s4-l2/knowledge-route-acceptance.mjs <已构建的 A/B 绝对路径>
node --import tsx course-content/internal/stage-4/s4-l2/knowledge-provider-stub-acceptance.mjs <已构建的 A/B 绝对路径>
```

两脚本分别验证真实数据库 owner Top-K、空结果、身份伪造、预算，以及本地 Chat/Embedding Stub 的三段闭环、严格参数和上游错误。真实验证脚本 `real-knowledge-acceptance.mjs` 只在前述验证通过后运行，读取本机被 Git 忽略的北京地域配置；它只打印调用计数、finish reasons、Token 总量和耗时，不记录 Prompt、答案或 Key。

教学图：`public/course-media/stage-4/s4-2-01.png`。Stage 4 仍未发布。
