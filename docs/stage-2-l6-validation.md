# Stage 2.6 发布与验证记录（2026-09-29）

## 范围

本轮发布 2.6《每个人只能看到自己的资料》。正文为 `course-content/stage-2/s2-l6.md`：13 个 H2、4 个 H3、四段分步 Prompt、5 个全新清单键、3 个 Check、1 个 Concept、14 个 Stuck；预计 80～110 分钟。A/B 参考源码在 `course-content/internal/stage-2/s2-l6/`。仅 2.6 标记 `isPublished: true`，2.7/2.8 未发布；Stage 2 保持 8 节，四阶段正式课保持 29 节。

## 旧资料与增量迁移

继续使用本机 PostgreSQL `localhost:55432` 中互不相同的 `s2l3_a_20260928`、`s2l3_b_20260928` schema。连接值仅在两份本地临时项目的 `.env` 中，未进入课程、源码或报告。迁移前两边 Resource 均为 ID `[1,2,4]` 共三条，并逐条记录标题、简介、分类、重要状态和时间。迁移 `20260929054822_add_resource_owner` 的 SQL 只有 `ADD COLUMN "ownerId" INTEGER`、索引和指向 User 的外键（`ON DELETE SET NULL`），没有 DROP、UPDATE、清表或重建。A 以 `prisma migrate dev` 生成并应用，B 以同一 SQL `prisma migrate deploy` 应用；两边 `prisma migrate status` 均报告 3 个迁移且已同步。两边 `prisma generate` 成功。

迁移后直接查询确认原 ID、标题、简介、分类、重要状态和时间完全相同，三条的 `ownerId` 均为 null。测试完成后再查，两边 `[1,2,4]` 仍在且 ownerId 为 null。没有删除历史 Resource，也没有自动认领无归属数据。新 POST 在服务端从 Session 取 `user.id`，因此正常新资料的 ownerId 非空。普通 GET 不返回 null 归属记录。

## 服务端所有权和 HTTP 证据

`GET /api/resources` 在 Prisma `findMany.where.ownerId` 中使用当前 Session 的 `user.id`。`POST` 拒绝请求体的 `ownerId`、`userId`、`owner`，创建数据的 ownerId 只来自 Session。`PATCH` 与 `DELETE` 的 Prisma `update/delete.where` 同时包含唯一 `id` 和当前 `ownerId`，没有先查后无条件写入的窗口。Prisma P2025 一律映射 404，别人已有的 ID 与不存在 ID 文案相同。未登录先返回 401，非法 ID 返回 400，数据库故障返回不含连接串的 503。标题、简介、分类、important、201/200 响应和删除确认沿用 2.4。

A/B 各在生产构建与 `next start` 下使用独立 Alice/Bob Cookie Jar 真实请求，运行时随机生成练习账号凭证，未记录密码或 Cookie 值：

| 验证 | A | B |
| --- | --- | --- |
| 未登录 GET/POST/PATCH/DELETE | 全部 401 | 全部 401 |
| Alice、Bob 各自新建，POST ownerId 等于各自 User ID | 通过 | 通过 |
| Alice/Bob GET 只含自己的 ID，旧三条均不可见 | 通过 | 通过 |
| 双向猜测真实 ID 的 PATCH、DELETE | 全部 404，记录未变 | 同左 |
| 旧无归属 ID 的 PATCH、DELETE | 404，记录未变 | 同左 |
| 不存在 ID / 非法 ID | 404 / 400 | 404 / 400 |
| POST/PATCH 伪造 ownerId | 400，未改变归属 | 同左 |
| 本人 PATCH 与 DELETE | 200，数据库实际变更 | 同左 |
| 异常 Origin + cross-site Fetch Metadata | 403 | 403 |

数据库直查示例：A 中测试 Alice 的 User ID 8 / Resource ID 8，越权尝试后记录标题只被本人 PATCH 改为 `Alice updated`，ownerId 仍为 8；浏览器 Alice 账号 User ID 10 / Resource ID 10 与 Bob 账号 User ID 11 / Resource ID 11 同时存在，彼此列表只见自己。B 中测试 Alice 的 User ID 8 / Resource ID 8，ownerId 仍为 8，Bob 的跨账号修改与删除未改变它。B 的本人 DELETE 删除的只有本轮 Bob 新建的测试记录；原历史三条未动。

另以临时错误 `DATABASE_URL` 启动 B 的独立生产服务，带合法格式的测试 Cookie 请求四种资料方法，GET/POST/PATCH/DELETE 全部实际返回 503，响应没有凭证或连接串；随后停止该服务，未改真实数据库连接文件。两边开发服务也实际启动，首页为 200、未登录 GET 为 401。

Prisma 6 中唯一 ID 与其他非唯一条件可同时放入 `update/delete.where`，参考 [Prisma Client v6 文档](https://www.prisma.io/docs/orm/v6/reference/prisma-client-reference)。同源写入最小检查同时覆盖资源和注册/登录/退出接口：出现异源 Origin、`Sec-Fetch-Site: cross-site` 或 `same-site` 时回 403；真实浏览器同源注册、保存与退出正常，异常来源的 logout 在 A/B 开发服务均为 403。`SameSite=Lax` 仍仅作一层保护，完整生产 CSRF 与部署安全复核留给 2.8；依据 [OWASP CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)。

## 账号切换、静态资料与页面

`ResourcePreview` 在登录成功或退出成功时清空资料、列表状态、编辑草稿、预览、输入和旧提示；`AbortController` 取消旧 GET，账号请求代次阻止旧 GET/POST/PATCH/DELETE 的结果写入新账号页面。A 的真实浏览器按 Alice→创建 ID 10→退出→Bob→创建 ID 11 操作，Bob 页面只显示 ID 11，没有 Alice 的草稿或成功提示。又在仅用于测试的 A 临时服务中将 GET 人为延迟 8 秒：Alice 请求发出后退出并登录 Bob，旧响应结束时 Bob 页面仍只显示 ID 11。延迟代码已从临时项目恢复，最终构建重新通过。

A 保留日期排序，B 保留清除筛选、自选标题与统计。两边的 Stage 1 静态九条仍只读，标题改为“本地示例资料（只读）”，个人列表单独标为“我的数据库资料”。B 浏览器中“工具”筛选得到 2/9，清除后回到 9/9。A/B 在 390px 浏览器视口下测得 `innerWidth=390`、`clientWidth=scrollWidth=375`，无横向溢出。Stage 1 Starter ZIP 的独立 `check:starter` 通过且源码未修改。

## 平台、课程与自动测试

执行既有 `npm run db:seed`。首次 `verify` 揭示旧测试仍假定 2.6 未发布，随后仅更新两处发布预期，并增加 2.6 的 Stage 2 付费访问、5 个清单键保存与 2.7 未发布断言。最终 `npm run verify` 全部通过：typecheck、build、65/65 测试、`check:content`（4 阶段、13 篇已发布正文）、`check:bundle`（113 个 dist/public 文件、13 篇正文均未泄露受保护 Markdown）。`npm run check:starter` 通过。平台目录浏览器显示 2.6“未开通”、2.7/2.8“即将上线”，首页仍是 29 节正式课。

本地开发库临时创建一名仅用于课程页面验收的 TEST 权益账号，绕开真实用户及支付流程，验收后注销并清理其 Session、清单、进度、权益与账号。付费浏览器实际打开 2.6：四段 Prompt、Concept/Check/Stuck 和 H2/H3 正常；第一段复制按钮显示“已复制”，但浏览器剪贴板读取接口返回空，未把按钮反馈声称为已读取复制文本。提示词仅复制代码块由 Lesson Renderer V2 自动测试验证。第一项清单勾选后刷新仍为 1/5；390px 课程页 `innerWidth=390`、`clientWidth=scrollWidth=375`，截图目视无截断。浏览器目录显示 Stage 2 8 节。

当前工具集中没有 WorkBuddy、Network 或 Neon 的可调用工具。本轮使用本地 PostgreSQL 和真实本地 HTTP/浏览器；这些结果不称为 WorkBuddy、Network 或 Neon 云端验证。

## 未修改范围

没有提前开发 2.7 或 2.8 部署；没有修改 Stage 1 Starter、AIFoundry 平台 Auth、价格、支付或进度算法。平台仅改了 2.6 发布元数据与课程内容，并调整对应的测试预期。按本轮任务说明，**未自动提交或推送 Git**。
