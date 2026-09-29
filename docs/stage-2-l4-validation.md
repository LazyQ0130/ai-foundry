# Stage 2.4 发布与验证记录（2026-09-28）

## 范围和真实环境

本课只发布 2.4《完成一条资料的完整 CRUD》。正文 5 个全新 checkKeys，2.5～2.8 仍未发布，Stage 2 权益边界和 29 节正式课总数不变。参考 A/B 延续 2.3 的 Next.js 15.5.26、Prisma CLI/Client 6.19.3、TypeScript 5.9.3。A 保存日期排序，B 保存清除筛选与自选标题。没有修改 Stage 1 Starter、原始 `lib/resources.ts`、Resource Schema 或迁移内容，没有加入 User、Session 或 owner。

使用本机 PostgreSQL `localhost:55432` 的独立 `s2l3_a_20260928` 和 `s2l3_b_20260928` schema；这是 2.3 留存的隔离练习数据，非 AIFoundry 平台业务 schema。两边原有 ID 1、2 全程保留。数据库 `.env` 仅在各自临时项目，未写入仓库或报告。迁移状态为 1 个已应用迁移；没有运行 `migrate reset`、drop、清空表或批量删除。

## API 与数据库验收

两边均先运行 `npm install`、`npx prisma generate`、`npx tsc --noEmit --incremental false` 和 `npm run build`，通过。Next 构建输出 `/api/resources`、`/api/resources/[id]` 动态路由。Next.js 15 [官方 Route Handler 文档](https://nextjs.org/docs/15/app/api-reference/file-conventions/route)确认 `context.params` 是 Promise；参考实现按此读取 ID。

| 实测步骤 | A schema | B schema |
| --- | --- | --- |
| 开始时真实 Resource 数 | 2 | 2 |
| POST 新建两条练习资料 | ID 3、4，201 | ID 3、4，201 |
| GET 与 Prisma 直接查询 | 两个 ID 均存在，数量 4 | 同左 |
| PATCH 只改 ID 3 标题，再改简介、分类、important | 200，返回实际记录；分类变“教程”，important 变 true | 同左 |
| 时间字段 | ID 3 `createdAt` 保持原值，`updatedAt` 晚于创建时值 | 同左 |
| 其他记录 | ID 4 的 ID、标题、简介、分类、时间均未变 | 同左 |
| 无效 PATCH | ID 0、字母、空标题、坏分类、字符串 important 均 400；不存在的 ID 404 | 同左 |
| 无效 DELETE | ID 0、字母均 400；不存在的 ID 404 | 同左 |
| DELETE ID 3 | 200，`deletedId:3`；数据库查无 ID 3，记录数从 4 到 3；ID 4 仍在 | 同左 |
| 再 DELETE ID 3 | 404；没有影响其他资料 | 同左 |
| 最后 GET | 无 ID 3，有 ID 4；数据库直查一致 | 同左 |

浏览器中 A/B 均打开 ID 4 的编辑表单，预填实际数据库记录；A 点击“取消”未发送 PATCH，随后两边各编辑 ID 4 的标题并保存，重新 GET 后出现新标题。刷新后 A 为“浏览器编辑后的第二条资料”，B 为“B 浏览器编辑后的资料”。两边又分别通过页面 POST 新建仅供删除实验的 ID 5，首次取消删除确认时 ID 5 仍在；再次明确确认后页面发送 DELETE，返回成功并重新 GET，记录数从 4 回到 3。刷新后 ID 5 仍不存在，ID 4 仍在。A 原始静态列表保持 9/9，B 保留原始 9/9 与清除筛选入口；数据库记录不混入静态计数。

B 的故障测试只将本地临时 `.env` 的数据库端口改为不可用的本机端口并重启 Next.js；GET、PATCH ID 4、DELETE ID 4 均为 503 JSON，`ok:false`，没有假成功。恢复 `.env` 后直接 Prisma 查询仍有 ID 4 的原浏览器修改标题，ID 5 不存在。共享 PostgreSQL 服务未停止，原 schema 未被更改。

## 安全与依赖审计

原 `npm audit` 对 2.3 参考包报告 3 项 high，分别标在 `prisma`、`@prisma/config`、`deepmerge-ts`，根因是一个传递依赖：`prisma@6.19.3` → `@prisma/config@6.19.3` → `deepmerge-ts@7.1.5`。这是开发时 Prisma CLI 配置链；参考应用运行时代码没有导入 `@prisma/config`。npm 包元数据表明该 Prisma 配置版本固定依赖 7.1.5，未发现其同版本内的官方兼容修复。GitHub [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) 指出 `<8.0.0` 受影响，8.0.0 已修复；触发条件是传入递归对象图。`npm audit` 建议回退 Prisma 6.12.0，并将其标成破坏性修复，未采用。

本课在参考 `package.json` 使用 npm override 固定 `deepmerge-ts@8.0.2`，**不改变 Prisma 6 或 Next 15 主版本**。A/B 重新安装后 `npm audit` 报 0；`npm ls` 在 A 显示 8.0.2 overridden，两边 Prisma Client 生成、`migrate status`、TypeScript 和 Next 构建均通过。这个覆盖方案通过本课环境验证，不代表 Prisma 官方保证所有 CLI 分支都兼容。正式公开部署前仍需用固定 lockfile、生产构建和当前审计复核，并优先评估 Prisma 官方依赖更新；若不能确认兼容，暂停公开部署。没有运行 `npm audit fix --force`。

连接字符串没有写入源码。A/B `.next/static` 分别扫描 19 / 11 个文件，均未命中实际连接地址、密码或 `DATABASE_URL`。参考 Route Handler 只返回通用数据库失败提示，不把底层错误或密码发给浏览器。本节无登录与所有权，因此匿名 PATCH/DELETE 只可在受控本地环境用于非敏感练习，不能公开部署。

## 平台验收与未实测项

平台执行 `npm run db:seed`、`npm run verify`、`npm run check:starter`，均通过。`verify` 包含 TypeScript、Starter 构建、平台构建、65/65 测试、内容与 bundle 检查；内容检查为 4 个阶段、11 份已发布正文（含第 0 课），bundle 检查 107 个 dist/public 文件未包含受保护 Markdown。自动测试覆盖匿名、Stage 1、Stage 2 和未发布 2.5 的权限，以及 2.4 checklist 持久化。

用仅为本次 QA 创建并获 Stage 2 权益的测试账号打开真实课程页面：H2/H3、Concept 表格、三段 Prompt、Task、Check、Warning、Stuck 和默认折叠的 DeepDive 均显示；点击第一段 Prompt 见“已复制”。第一项 checklist 勾选为 1/5，刷新后仍为 1/5，测试结束恢复 0/5。390px 视口读数为 `innerWidth=390`、`clientWidth=375`、`scrollWidth=375`，无横向溢出；1280px 桌面视口为 `clientWidth=1265`、`scrollWidth=1265`，页面布局正常。测试时发现首段 Markdown 加粗符号未被解析，已去掉该符号并刷新确认正文正常。

Neon 没有可用的专用测试账号和数据库，本轮仍**未实测云端连接、迁移或 CRUD**；不能把本地 PostgreSQL 结果写成 Neon 通过。WorkBuddy 未实测。没有直接打开浏览器开发工具的 Network 面板；真实请求由 Next.js 请求日志、HTTP 响应、浏览器页面和 Prisma 直接查询交叉核对。
