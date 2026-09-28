# 2.3 内部 A/B 参考实现与真实持久化验收

这里是课程作者的参考源码，不属于学生 Starter。学生应在自己的 2.2 项目中增量实施，保留已有页面结构、资料和 1.6 自选功能。`implementation-a/app/page.tsx` 与 2.2 A 页面一致，保留日期排序；`implementation-b/app/page.tsx` 与 2.2 B 页面一致，保留清除筛选、自选标题及原 `ResourceStats`。本课的共享变更在 `common/`：固定版本的 `package.json`、Prisma 配置和迁移、服务端 Client、升级后的同一 Route Handler，以及原表单组件的数据库展示区。B 的 `ResourceStats` 继续取 1.6 完成态。

## 数据与接口

- `prisma/schema.prisma` 的 `Resource` 为数据库生成的整数 `id`、`title`、`desc`、`tag`、默认 `false` 的 `important`、`createdAt`、`updatedAt`。迁移文件 `20260928124525_init_resource/migration.sql` 是 Prisma 实际生成的 PostgreSQL 建表迁移。
- `POST /api/resources` 保留 2.2 的类型、空白、长度与真实分类校验。成功创建后返回 HTTP 201、`ok:true`、`status:"saved"`、`saved:true`、Prisma 返回的真实记录和“资料已保存到数据库。”。输入错误仍为 400；数据库不可用为 503，不回传凭证或假 ID。
- `GET /api/resources` 从 Prisma `findMany` 读取，创建时间倒序，`Cache-Control: no-store`。读库失败返回 503。
- `ResourcePreview` 保留本页预览，新增独立的“保存到数据库”操作和“数据库中已保存的资料”区。首次加载、刷新及 POST 成功后都通过 GET 读取；若 POST 成功而 GET 失败，保存成功事实仍保留，列表单独提示失败并提供“重新读取”，不会自动重发 POST。
- 原始 `lib/resources.ts`、ResourceCard、九条静态资料和各自旧搜索/筛选/统计逻辑未修改；两种来源在页面上分区显示，不混入旧总数。

只在受控本地环境运行匿名写入实验。参考项目 `.gitignore` 原已忽略 `.env*`；真实 `DATABASE_URL` 只存在临时项目各自的本地 `.env`，本目录没有连接字符串。不要将匿名写入应用公开部署。

## 2026-09-28 实际环境与命令

临时运行项目：`C:\Users\QYF\AppData\Local\Temp\aifoundry-s2-l3-20260928-1\a`、`b`。它们从正式 Starter 的允许源文件及 2.2 两种页面复制而来，再叠加本课 `common`。测试使用本机 PostgreSQL `localhost:55432` 的两个**新建、隔离 schema**：`s2l3_a_20260928` 与 `s2l3_b_20260928`；没有连接 AIFoundry 平台的业务 schema 或修改其表。这里仅记录非秘密标识，不记录账号、密码和连接 URL。测试 schema 与临时项目保留供复核，没有执行 reset、drop、清表或目录批量删除。

Node.js 24.16.0、Next.js 15.5.26、TypeScript 5.9.3，`prisma` 与 `@prisma/client` 均固定 6.19.3，`dotenv` 固定 16.5.0。A/B 均实际完成 `npm install`、`npx prisma generate`、`npx tsc --noEmit --incremental false`、`npm run dev`、`npm run build`。另用隔离 `init-probe` 运行了 `prisma init --datasource-provider postgresql`；该 CLI 当前生成的默认文件含 `prisma.config.ts`，参考实现核对并采用与 v6 实际可运行的 `prisma-client-js` schema。

A 在确认空的新 schema 后执行 `npx prisma migrate dev --name init_resource`，生成并应用本目录所存迁移；B 用同一迁移文件执行 `npx prisma migrate deploy`。两边均成功生成 Prisma Client，构建显示 `/api/resources` 为动态路由。Neon 免费计划与迁移支持依据官方资料核对，但本轮没有创建或操作 Neon 账号；云端地区、额度和具体账号权限未实测，不能代称云端已验证。

## 真实 HTTP、数据库与浏览器结果

| 验证 | A | B |
| --- | --- | --- |
| 初始 GET | 200，空数组 | 200，空数组 |
| 合法 POST | 201，`saved:true`，数据库 ID `1` | 201，`saved:true`，数据库 ID `1` |
| 再 GET + 直接 Prisma 只读查询 | 同一 ID，记录数 1 | 同一 ID，记录数 1 |
| 非法请求 | 空标题、空简介、非法分类、“全部”、标题类型错误、格式错误 JSON 均 400，数据库仍 1 条 | 同左 |
| 重复 GET | 两次读取后记录数仍 1 | 同左 |
| 浏览器提交 | 新增 ID `2`，页面展示从 GET 重读的记录 | 新增 ID `2`，页面展示从 GET 重读的记录 |
| 原功能 | 原列表仍 9/9；“最早优先”从 React 哲学开始 | 搜索 Next.js + 教程 + 重要为 1/9，清除回 9/9，自选标题仍在 |

A/B 浏览器刷新后输入清空，GET 重新显示各自 ID `1` 和 `2`；停止并重启 Next.js 后再次刷新，两边的数据库记录仍在。B 浏览器的空白简介显示服务端 400 错误，不保留旧成功提示。A/B 原始列表始终为 9 条，数据库记录不进入其统计。

故障测试只修改 B 临时项目的 `.env`，把端口暂指向本机不可用端口，**没有停掉共享 PostgreSQL 实例**。重启 B 的 Next.js 后，真实 GET 与 POST 都得到 503 JSON，页面分别显示读取失败和保存失败，不出现 `saved:true`。恢复原本地 `.env` 并重启后 GET 为 200，仍只有此前 2 条记录，故障期间没有新增记录。

本轮使用真实浏览器、API 响应、Next.js 请求日志和直接 Prisma 查询交叉核对。浏览器开发工具 Network 面板尚未直接打开；因此不把 Network Payload 面板核对记为完成。默认 WorkBuddy 也未实测。

## 依赖审计说明

`npm install` 报告 3 项 high，来自 Prisma CLI 的 `@prisma/config → deepmerge-ts <8` 依赖链；没有运行 `npm audit fix --force` 或擅自跨主版本升级。此参考只在受控本地运行，不公开匿名写入接口；后续升级 Prisma 时应在兼容性验证后重新审计。该结果不会被写成“零漏洞”。
