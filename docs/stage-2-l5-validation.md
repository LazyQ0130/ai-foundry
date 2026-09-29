# Stage 2.5 发布与验证记录（2026-09-29）

## 范围与实现

本轮只发布 2.5《加入真实的注册和登录》。正文在 `course-content/stage-2/s2-l5.md`，5 个新 checkKeys，三段可复制 Prompt、两个 Deep Dive、七个卡住排查块、四处配图建议。A/B 源码在 `course-content/internal/stage-2/s2-l5/`。没有修改 Stage 1 Starter、AIFoundry 平台 Auth、价格、支付、权益逻辑或进度算法；2.6～2.8 仍未发布，正式课总数保持 29。

`Resource` 模型完全沿用 2.4，无 `ownerId`/`userId`。增量 migration `20260928155143_add_user_session` 只创建 User、Session、唯一键、索引与外键。User 保存 username、salted scrypt passwordHash；Session 保存 SHA-256 tokenHash、userId、expiresAt。注册时 User 与 Session 在同一 Prisma 事务中创建。Cookie 用随机 32 字节 Token、HttpOnly、SameSite=Lax、Path=/、7 天；生产环境 Secure=true，本地 HTTP Secure=false。前端页面不读取 Token，不使用 localStorage/sessionStorage。认证 API 只返回公开用户信息。资源四种 Route Handler 先查有效 Session，未登录 401；登录后继续 2.4 CRUD 契约。Alice/Bob 仍共享同一 Resource 集合，这是 2.5 的明确教学边界。

实现参考 [Node crypto 文档](https://nodejs.org/api/crypto.html)中的 `scrypt`、`randomBytes` 与 `timingSafeEqual`，以及 [Next.js Cookie 文档](https://nextjs.org/docs/app/api-reference/functions/cookies)和 [NextResponse 文档](https://nextjs.org/docs/app/api-reference/functions/next-response)的 Route Handler Cookie 用法。

## 独立数据库迁移与数据保护

继续使用本机 PostgreSQL `localhost:55432` 中独立的 `s2l3_a_20260928` 与 `s2l3_b_20260928` schema；A/B 的真实连接值只在各临时项目 `.env`，未写入仓库或本报告。迁移前两边 Resource ID 均为 `[1,2,4]`，共 3 条。A 以 `prisma migrate dev --name add_user_session` 生成并应用；B 以相同 migration `prisma migrate deploy` 应用。两边 `prisma migrate status` 均报告 2 个迁移、数据库已同步。迁移后 `[1,2,4]` 及内容保留；测试 CRUD 仅新增、修改并删除当轮专用练习记录，最后又回到 `[1,2,4]`。无 reset、drop、清表或批量删除。

## A/B 真实 HTTP 与数据库测试

两份参考项目均已运行 `npm install`（各审计 0 漏洞）、`prisma generate`、迁移状态、`npx tsc --noEmit`、`next build`、生产服务，以及针对各自 schema 的真实 HTTP + Prisma 直查。测试凭证运行时随机生成，明文密码与 Cookie 值不写入本报告或仓库。

| 检查 | A | B |
| --- | --- | --- |
| 注册、公开用户响应、HttpOnly/SameSite=Lax/Path Cookie | 201，通过 | 201，通过 |
| 重复 username、错误密码/不存在用户 | 409、401、401 | 409、401、401 |
| 携 Cookie 的 `/me` 与再次请求 | 200、200 | 200、200 |
| passwordHash 与原密码、tokenHash 与原 Token 比较 | 不相等；Token Hash 与 SHA-256 一致 | 同左 |
| 未登录 GET/POST/PATCH/DELETE | 全部 401 | 全部 401 |
| 已登录 GET/POST/PATCH/DELETE | 全部正常，指定练习记录实际变更 | 同左 |
| Alice/Bob 读取集合 | 同一 ID 集合，Bob 能看到当轮新增资料 | 同左 |
| logout 后旧 Cookie 的 `/me`、Resource GET | 均 401；DB Session 数归零 | 同左 |
| 重新登录与专用 Session 过期 | 登录 200；`expiresAt` 调整到过去后均 401 | 同左 |
| 原 Resource ID | `[1,2,4]` 保留 | `[1,2,4]` 保留 |

浏览器另在 A/B 页面各注册一个临时练习账号；注册后账号区域显示当前用户，数据库区重新 GET 显示 3 条；刷新后同一账号及三条资料仍显示。A 的 Next.js 开发服务实际重启后，同一浏览器 Cookie 仍被 `/api/auth/me` 识别。A 页面退出后登录表单重新出现，数据库管理区隐藏；服务端退出后 401 另经 HTTP 验证。A 保留日期排序和原始静态 9 条；B 保留清除筛选入口、自选标题和静态 9 条。生产构建与生产服务在最终代码上再次通过整套 HTTP 测试。

开发服务运行期间执行 `next build` 曾使旧开发进程的 `.next` 缓存不一致，出现一次 `Cannot find module './331.js'`。停止开发进程、重新构建、以 `next start` 启动后 A/B 全部 HTTP 测试通过；这是验证进程共享构建目录造成的暂态问题，不是最终源码或数据库问题。没有删除缓存目录。

## 安全、课程与平台

A/B 最终 `.next/static` 各扫描 23 个客户端文件：`passwordHash`、`tokenHash`、`DATABASE_URL` 字段字面量及各自真实 DATABASE_URL 均未出现。注册与登录响应未包含秘密字段；数据库直接核对密码与 Session Token 均只存哈希。测试账号为隔离本地练习数据，原始 Token 和密码从未写进源码或报告。

运行 `npm run db:seed` 后，`npm run check:content` 报告 4 阶段、12 篇已发布正文与稳定清单键一致。`npm run verify` 通过：typecheck、build、65/65 测试、内容检查、bundle 检查；`npm run check:starter` 通过。`check:bundle` 检查 110 个 dist/public 文件、12 篇课程，未发现受保护正文进入客户端包。自动测试覆盖 2.5 Stage 2 权益 403/200、5 个清单键保存、2.6 未发布 404；Lesson Renderer V2 验证提示词仅复制代码块、教学特殊块与独特键。Stage 2 仍 8 节，平台首页仍显示 29 节正式课。浏览器中 Stage 2 目录显示 2.5「未开通」，2.6～2.8「即将上线」。

浏览器检查了 A/B 页面与平台目录的桌面布局；390px 视口下 A、B 与平台目录的 `scrollWidth` 均未超过 `clientWidth`。B 注册、刷新，以及 A 注册、刷新、重启、退出都经过真实浏览器。另在本地平台开发库建立一名专用 `TEST` 权益账号，登录后实际打开受 Stage 2 权益保护的 2.5 正文页：三段 Prompt、Concept/Check/Stuck/Deep Dive 与五项清单可见；点击第一段复制按钮显示“已复制”；第一项勾选后刷新仍为 1/5；390px 下 `scrollWidth=clientWidth=375px`，无横向溢出，截图保存在本地可视化目录。验收后只清理了这名专用平台测试用户及其关联会话、测试权益和清单记录，没有触碰 A/B Resource。浏览器自动化接口无法读到剪贴板内容，因此剪贴板文本本身依赖 Lesson Renderer V2 自动测试验证，不把按钮反馈误写为已直接读取剪贴板。页面检查还发现并修正一处加粗 Markdown 未正确渲染。默认 WorkBuddy 未提供可调用工具，未实测；Codex 的 A/B 验证不称作 WorkBuddy 验证。

## 保留边界

2.5 只解决 Authentication：服务端认得有效登录用户，并拒绝未登录者操作资料。没有 Resource ownerId、按用户过滤、Alice/Bob 隔离、OAuth、JWT、第三方 Auth SDK、2.6 正文、完整 2.7 失败状态或 2.8 部署。当前共享集合仍不适合当成多人私有资料产品公开交付。
