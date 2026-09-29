# Stage 2.8 交付与验证记录（进行中，2026-09-29）

## 本轮范围

课程正文 `course-content/stage-2/s2-l8.md` 已准备：16 个 H2、3 个 H3、3 段 Prompt、5 个全新清单键、18 个有排查顺序的 Stuck。课程仍保持未发布，直至真实 Neon、Vercel 和公开 HTTPS 全链路验收完成。Stage 3 未开始。

## 参考项目与本地证据

`course-content/internal/stage-2/s2-l8/` 沿用 2.7 的 A/B 页面、认证、资源 API、ownerId 检查和三次原有迁移。A 保留日期排序；B 保留清除筛选、自选标题和统计。`postinstall` 执行 `prisma generate`，本地 `build` 执行 `prisma generate && next build`，Vercel Build Command 计划设为 `npm run vercel-build`，对应 `prisma generate && prisma migrate deploy && next build`。

现有隔离 A/B 本地项目分别运行 `npm install --no-audit --no-fund`、`npx prisma migrate status`、`npx tsc --noEmit`、`npm run build`，均通过。两边 `migrate status` 显示本机 `localhost:55432` 独立 schema 中三次迁移已同步；这不是 Neon 证据。A 另外运行 `npm run vercel-build`，顺序与命令均通过，迁移结果为 No pending migrations；目标仍是本地隔离 schema，不是生产数据库。

A 的完整可部署源码已独立整理，Git 暂存检查没有 `.env`、`node_modules` 或 `.next`，`git diff --cached --check` 通过；参考仓库为 [LazyQ0130/aifoundry-stage2-workbench-reference](https://github.com/LazyQ0130/aifoundry-stage2-workbench-reference)，初始 commit `0e3cf86`。该仓库不是 AIFoundry 平台仓库。

平台预备检查：`npm run verify` 通过（包含 typecheck、build、67/67 测试、14 篇已发布正文检查和构建产物保护检查）；`npm run check:starter` 通过。2.8 尚未发布，所以此轮的 14 篇已发布正文统计**不包含** 2.8；新增正文另通过课程解析器检查：5 个 checkKeys、16 个 H2、18 个 Stuck。

## 云端实测状态

| 证据 | 当前状态 |
| --- | --- |
| 专用 Neon PostgreSQL | 未建立：官方控制台当前要求账号登录，已请账号所有者在官方页面完成。 |
| Production `DATABASE_URL` | 未配置；真实值不得进入本文档。 |
| Neon 三次 production migration 与 `migrate status` | 未执行。 |
| Vercel 项目与 Build Logs | 未部署；Vercel 工作区已登录，但账号提示需由所有者处理。 |
| 公开 Production HTTPS URL | 尚无。 |
| Production 注册、Session、CRUD、失败状态、同源写保护 | 未验证。 |
| Alice/Bob 双向所有权隔离 | 未验证。 |
| Neon 只读核对 ownerId、Session、表与本地数据未迁入 | 未验证。 |

不得把本地构建、已创建 GitHub 参考仓库或 Vercel 控制台登录称作云端交付成功。补齐上述证据后，再更新本报告、参考 README 在线地址、发布标记并运行平台全套验证。

## 仍需执行的检查

云端通过并发布后：`npm run db:seed`，重新运行 `npm test`、`npm run typecheck`、`npm run build`、`npm run check:content`、`npm run check:bundle`、`npm run check:starter`、`npm run verify`。生产：公开首页、注册、`/me`、刷新 Session、退出、GET/POST/PATCH/DELETE、401、404、Validation、Alice/Bob 隔离、Cookie Secure/HttpOnly、异常 Origin 403、Neon 安全只读核对。课程页：Desktop/390px、Prompt 复制、Checklist 持久化、特殊块和横向溢出。

## 边界

没有可调用的 WorkBuddy、Neon 或 Vercel 专用工具；Vercel 和 Neon 使用官方浏览器界面。未开始 Stage 3，未修改 Stage 1 Starter、历史 migration、ownerId 规则、同源写保护、AIFoundry 平台价格、支付或 Auth。云端仍待实测，不能冻结 Stage 2。
