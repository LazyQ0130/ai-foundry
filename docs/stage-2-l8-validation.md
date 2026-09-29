# Stage 2.8 交付与验证记录（2026-09-29～30）

## 本轮范围

课程正文 `course-content/stage-2/s2-l8.md` 有 16 个 H2、3 个 H3、3 段 Prompt、5 个全新清单键、18 个有排查顺序的 Stuck。真实 Neon、Vercel 和公开 HTTPS 全链路验收后，`s2-l8` 标记发布。Stage 3 未开始。

## 参考项目与本地证据

`course-content/internal/stage-2/s2-l8/` 沿用 2.7 的 A/B 页面、认证、资源 API、ownerId 检查和三次原有迁移。A 保留日期排序；B 保留清除筛选、自选标题和统计。`postinstall` 执行 `prisma generate`，本地 `build` 执行 `prisma generate && next build`，Vercel Build Command 为 `npm run vercel-build`，对应 `prisma generate && prisma migrate deploy && prisma migrate status && next build`。安装时只允许固定版本 Prisma 依赖运行必要脚本。

现有隔离 A/B 本地项目分别运行 `npm install --no-audit --no-fund`、`npx prisma migrate status`、`npx tsc --noEmit`、`npm run build`，均通过。两边又以最终脚本运行 `npm run vercel-build`，均显示本机各自 schema 中三次迁移已同步，TypeScript 和 Next.js Production 构建通过；这部分属于本地证据。

A 的完整可部署源码在独立仓库 [LazyQ0130/aifoundry-stage2-workbench-reference](https://github.com/LazyQ0130/aifoundry-stage2-workbench-reference)，Stage 2 完成提交为 [`1dee13b`](https://github.com/LazyQ0130/aifoundry-stage2-workbench-reference/commit/1dee13b728c1c744a8a630a711a560b6a61ead91)。本地与远端 main SHA 一致，Git 工作区干净；`.env`、`node_modules` 和 `.next` 不在提交中。该仓库不是 AIFoundry 平台仓库。

发布前平台检查：`npm run verify` 通过（包含 typecheck、build、67/67 测试、14 篇已发布正文检查和构建产物保护检查）；`npm run check:starter` 通过。该 14 篇统计不包含当时未发布的 2.8；新增正文另通过课程解析器检查：5 个 checkKeys、16 个 H2、18 个 Stuck。发布后验证结果见下文。

## 云端实测状态

| 证据 | 当前状态 |
| --- | --- |
| 专用 Neon PostgreSQL | 已建立免费项目 `aifoundry-stage2-reference`（`wispy-silence-27659356`），AWS US East 2，`production` 分支，`neondb`；不是平台业务数据库。 |
| Production `DATABASE_URL` | 仅写入 Vercel Production 的 Secret 环境变量；Preview 未配置。真实值没有进入源码、报告或 Git。 |
| Neon 三次 production migration 与 `migrate status` | Vercel 最终 Build Logs：`3 migrations found`、`No pending migrations to apply`、`Database schema is up to date!`；Neon SQL 编辑器只读查到三条 `_prisma_migrations.finished_at` 均非空。 |
| Vercel 项目与 Build Logs | [最终 Production 部署](https://vercel.com/qyfs-projects-cd4b4834/aifoundry-stage2-workbench-reference/3GxxJ2VVyMJgYLQPhAyNouZct6ne) 为 Ready，来源 GitHub main `1dee13b`。 |
| 公开 Production HTTPS URL | [aifoundry-stage2-workbench-referenc.vercel.app](https://aifoundry-stage2-workbench-referenc.vercel.app/) 返回 200。 |
| Production 注册、Session、CRUD、失败状态、同源写保护 | 公网注册、登录态刷新、GET/POST/PATCH/DELETE、退出后 401、缺失资源 404、Validation 400、恶意 Origin 403 均已实测。 |
| Alice/Bob 双向所有权隔离 | 独立浏览器会话各自只列出自己的资源；独立 HTTP Session 双向猜测对方 ID 的 PATCH/DELETE 均返回 404。 |
| Neon 只读核对 ownerId、Session、表与本地数据未迁入 | 直接查询确认 `Resource`、`User`、`Session` 与 migration 表存在；两条演示资源各自关联 Alice/Bob，分别有有效 Session；无 `ownerId IS NULL` 资源。四个验收用户的密码哈希均为 `scrypt-v1` 格式，未复制本地历史记录。 |

首次部署在 `prisma migrate deploy` 阶段报 P1001。逐项排查发现 Neon 弹窗默认以星号遮住密码，Vercel Secret 收到了遮罩文本。Neon SQL 编辑器已证明库可用；改用弹窗显示的真实值后，Vercel 的迁移和 Next.js 构建均成功。未重建项目、未清空数据库。随后最终参考提交再次触发 Production 部署并通过 `migrate status`。最终地址另复验首页 200、匿名资源 401 和恶意 Origin 403。

## 平台发布后检查

Docker Desktop 本机启动时遇到其 Inference manager 套接字错误；本机原有 PostgreSQL 容器因此不可用。已把尝试更改的 Docker AI 本机设置逐字节恢复。为了验证平台，在同一免费 Neon 组织新建与参考生产库分离的 `aifoundry-platform-validation` 项目，测试连接仅通过回环地址临时表单交给本机验证进程，未写入仓库或聊天。平台的三次已有 migration 在主 schema 与 `aifoundry_test` schema 成功应用，`db:seed` 已运行。`npm run check:content` 确认四阶段、15 篇已发布正文与稳定清单键一致；`npm run check:starter` 通过。平台 typecheck、build 和 `check:bundle` 再次通过，构建产物扫描了 122 个文件，没有包含受保护的 15 篇课程正文。

首次全量 `npm run verify` 的 67 项中 65 项通过；新增 Stage 2 学生完成八节课后，旧测试仍断言该学生的进度数组为空，导致同一测试的父子两项失败。已改为断言该学生不能看到另一人的 Stage 1 进度、同时保有自己的 Stage 2.8 进度。修正后单独重跑 `tests/learning.test.ts`，9/9 通过，其中 Stage 2 八节清单和完成状态达到 8/8、100%，Stage 3 内容仍为 404。

直连 Neon 的下一轮全量测试在多次进度写入期间偶发 Prisma 500，另一次在数据库计算实例休眠后遇到连接失败；这两轮均未记为通过。进度写入的交互事务现在允许 10 秒等待和 20 秒执行，服务端日志只记录 Prisma 错误类型与错误码，不输出原始异常或连接信息。测试连接改用该独立 Neon 项目的官方连接池地址，并在控制台只读查询确认数据库可用后重新运行 `db:seed` 与完整 `npm run verify`。最终结果：**67/67 测试通过**，typecheck 与 production build 通过，`check:content` 确认四阶段和 15 篇已发布正文，`check:bundle` 检查 125 个构建文件，未发现受保护课程正文。`npm run check:starter` 另通过。

课程页面使用独立 Neon 测试库的授权账号实测：桌面 1280px 与移动 390px 均正常显示，页面宽度未超过视口；三个 Prompt 块可见，复制第一段后剪贴板与该 Prompt 正文完全一致。勾选一项清单、刷新后仍为 1/5；验收后取消勾选，恢复 0/5。Stuck、目标、架构说明和清单均正常渲染。未登录的 2.8 页面提示登录；授权账号可读取全文，下一课没有指向未发布的 Stage 3。

## 边界

没有可调用的 WorkBuddy、Neon 或 Vercel 专用工具；Neon 与 Vercel 由官方浏览器界面操作。没有真人学生完整试学。未开始 Stage 3，未修改 Stage 1 Starter、历史 migration、ownerId 规则、同源写保护、AIFoundry 平台价格、支付或 Auth；没有把生产 Cookie、密码或连接串写入 Git。
