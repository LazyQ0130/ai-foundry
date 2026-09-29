# Stage 2 V1.2｜教学坡度与备用路径跟进（2026-09-30）

本轮开始时本地 `main` 与 GitHub `origin/main` 均为 `da2a792d15d85f41162f83277903f14aaa98f60d`，工作区干净。已阅读 2.1～2.8 正文、课程蓝图、最终验收及 V1.1 跟进记录。范围是教学说明与配套文档；Stage 2 仍为 2.1～2.8 八节，四阶段正式课仍为 29 节。未改 Starter ZIP、已验证 API、Session、ownerId、迁移、平台 Auth、价格、支付或权益算法。

## 修复位置

| 任务 | 修复位置 | 结果 |
| --- | --- | --- |
| 2.3 学习坡度 | `course-content/stage-2/s2-l3.md` 开头、第一次和第二次停止点；`src/data/courses.ts` 2.3 时长 | 两次各 45～60 分钟，安装/下载/注册等待另计。第一次以固定版本、迁移状态、只读表计数和本地 commit 收束；第二次从同项目同库恢复，以 POST/GET 同 ID、刷新、重启和错误证据收束。 |
| 无 Neon/Docker/本机数据库 | 2.3「没有 Neon、Docker 或现成 PostgreSQL」 | 给出 Windows 官方 EDB 安装入口、SQL Shell 建独立练习库、`.env`、迁移、`COUNT`；macOS 给出 PostgreSQL 官方下载页与 EDB/pgAdmin 路径。只作为 2.3～2.7 本机练习库，2.8 仍需生产云库。 |
| 2.6/2.7 重复 | `s2-l6.md` 切换账号段与第四段 Prompt；`s2-l7.md` GET Prompt、401 段 | 2.6 维持旧私有状态和旧异步结果不能跨账号的验收，由 AI 实现并解释技术保护；2.7 沿用该保护，专讲异步反馈、401 和恢复。服务端隔离验收未降低。 |
| 2.2 请求测试 | `s2-l2.md`「页面还没改，先验证接口本身」 | 使用 Node 内置 fetch 的同一段代码适用于 PowerShell、macOS、Linux；真实打印四类请求的 HTTP 状态与响应正文，仅对本机地址发送非敏感内容。 |
| 环境恢复 | `s2-l4.md` 开头；2.3 第二次停止点引用 | 重新安装后核对同一练习库与迁移状态，需要时运行 `npx prisma generate`。其他课程未复制该段。 |
| README 地址归属 | `s2-l8.md` README 段；`course-content/internal/stage-2/s2-l8/common/README.md` | 明确作者参考演示地址与学员自己的交付地址不同；现有参考部署域名未变。 |
| 教学图 | 本文下方规格 | 仅完成四张优先图的可执行制作规格，尚无真实素材或成品图。 |

## 第二家云 PostgreSQL 调查：Supabase，仅为候选

官方 [Supabase Prisma 指引](https://supabase.com/docs/guides/database/prisma)确认可连接 PostgreSQL 和 Prisma；[连接方式说明](https://supabase.com/docs/guides/database/connecting-to-postgres)区分 Direct、Session pooler（5432）及 Transaction pooler（6543），迁移通常使用 Direct，IPv4 网络可用 Session pooler；[Prisma 6 配置文档](https://www.prisma.io/docs/orm/v6/reference/connection-urls)确认 PostgreSQL URL 格式。Supabase 当前指引的安装与生成示例可能使用较新的 Prisma 和 adapter，**不能直接复制到固定 6.19.3 的课程参考项目**。

课程参考项目已检查：`prisma`、`@prisma/client` 固定 6.19.3；`prisma.config.ts` 仅从 `DATABASE_URL` 读取一个连接；现有三次迁移依次为 Resource、User/Session、Resource.ownerId；Vercel Build Command `npm run vercel-build` 会用同一部署环境先 `generate`、`migrate deploy`、`migrate status`，再 `next build`。因此不能把 Supabase 的 Transaction pooler URL 直接塞进现有生产变量并宣称迁移也会成功。候选验收须先确定迁移的 Direct/Session 连接与运行时连接是否需要分开，再在**专用空白 Supabase 项目**真实执行固定 6.19.3 的 generate、三次原有迁移、只读表/迁移查询，接入隔离的 Vercel Production 配置，复验注册、Session、CRUD、ownerId 与失败状态；同时检查 IPv4/IPv6 可达性、池连接及日志无秘密。

**本轮没有 Supabase 专用账号或空白云库，没有执行上述迁移和部署。** 已有 Neon 与本地 PostgreSQL 参考验证不能替代 Supabase 实测。Supabase 只列为候选，不写入学员主线为“已验收备用”。不引入第二套 ORM，不改现有迁移或生产连接配置。

## 四张优先教学图规格（未制作）

| 图 | 画面与准确数据流 | 必要标签 | 脱敏与验收 |
| --- | --- | --- | --- |
| 2.3 第一次持久化 | 左侧显示 2.2 `POST → 服务端回复 saved:false`；右侧显示 `页面 POST → Route Handler 校验 → Prisma → PostgreSQL Resource`，下方独立 `GET → Prisma → Resource → 页面`，刷新/重启后再次 GET。原静态 9 条画为另一来源，不进入库。 | “收到≠保存”“迁移建表”“POST 201 + ID”“GET 同 ID”“刷新/重启仍在”。 | 可用真实脱敏 Neon SQL Editor 的 `COUNT` 小图或纯矢量示意；不出现连接串、密码、项目账号、真实资料。 |
| 2.5 会话 | `注册/登录 → 服务端验证 → User + passwordHash → Session tokenHash`；浏览器只持有 HttpOnly Cookie，刷新时 Cookie 随 `/api/auth/me` 请求，服务端查 Session；退出使会话失效。 | “明文密码不入库”“Cookie ≠ User 表”“刷新后 me”“logout 后 401”。 | 不画真实密码、Cookie、Token、哈希或账号；示意值必须明显标为示意。 |
| 2.6 所有权 | Alice/Bob 两列独立 Cookie/Session → 各自 user.id → 服务端四个 Resource API → 带 ownerId 的数据库查询/写入；交叉 PATCH/DELETE 返回 404；切换账号时旧页面状态立即清空，延迟 Alice 响应不进入 Bob 页面。 | “ownerId 来自服务端 Session”“列表按 ownerId”“他人 ID 404”“旧响应丢弃”。 | 不使用真实用户 ID、Cookie、资源标题；不把仅前端隐藏画成权限检查。 |
| 2.8 部署交付 | 上方 `学生本地 commit → 学生 GitHub 仓库 → Vercel Build（generate → migrate deploy → status → next build）`；下方 `浏览器 HTTPS → Next.js API → Prisma → 独立生产 PostgreSQL`，与本地练习库分离。作者参考演示与学员 Production URL 分置。 | “代码版本”“生产 DATABASE_URL 只在 Vercel Secret”“三次 migration”“技术部署证据”“所在地网络实测”。 | 不展示真实连接串、Secret、Cookie、仓库私有信息；作者现有演示域名只能在明确标为参考时使用，学员地址用明显占位。 |

四张图待作者用真实脱敏截图或准确矢量图制作并复核；本轮普通占位说明不算完成配图。

## 验证与待办

- 逐篇比对原有 checkKeys；课程正文、蓝图、四阶段学习路径与 Stage 2 项目页口径核对；Starter ZIP 和参考部署域名未改。
- `npm run verify` 通过：67/67 测试，四阶段、15 篇已发布正文与稳定清单键一致；`check:bundle` 扫描 131 个构建文件，未发现受保护正文。`npm run check` 通过：`check:content` 与 `check:starter` 均通过，Starter ZIP 与源文件一致。原 `package.json` 没有 `check` 脚本，本轮只增加对这两项现有检查的聚合入口，不改检查器实现。
- 2.2 Node 示例在本机 Windows PowerShell 使用临时 `127.0.0.1:3999` 回环测试服务实跑，四项分别显示 HTTP 200、400、400、400 和响应正文。这个服务只验证命令可执行与输出格式，**不是学生 Next.js Route Handler**；macOS/Linux shell 未在本机实跑。
- Windows 原生 PostgreSQL 安装路径是按官方安装器与 SQL Shell 文档写出的可执行路线；本机未发现 PostgreSQL Windows 服务或 `psql` 命令，**本轮未在全新 Windows/macOS 机器走完安装**。macOS 命令未在当前 Windows 主机实测。
- 本轮未进行真人学员试学、Supabase 云端迁移/部署或大陆三种网络的实际访问测量；以前的 Neon/Vercel 参考验收仍以原始验证报告为准，不转记为本轮新测试。
