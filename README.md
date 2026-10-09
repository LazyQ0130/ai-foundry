# AIFoundry

AIFoundry 是一套以实际项目贯穿的 AI 开发课程平台。学习路径规划为 4 个 Stage、29 节正式课，另有一节「开始前准备」。学员在同一个知识工作台项目上逐步完成页面、全栈应用、AI 功能和 Agent 工程实践。

本仓库包含课程网站、Express API、服务端 Markdown 正文、学员 Starter，以及课程制作和验收资料。网站本身使用 React 18、TypeScript、Vite、React Router 6、Tailwind CSS；后端使用 Node.js、Express 5、Prisma 6 和 PostgreSQL。学员 Starter 是独立的 Next.js 项目，不是课程网站的技术栈。

## 课程进度

| 阶段 | 主题 | 正式课 | 仓库当前状态 |
| --- | --- | ---: | --- |
| Stage 1 | AI 原生开发入门 | 6 | 正文已制作并发布；第 0 课和 1.1 免费试看 |
| Stage 2 | AI 全栈开发 | 8 | 正文已制作并发布 |
| Stage 3 | AI 应用开发：模型、流式、向量检索、RAG 与评估 | 7 | 7 课正文与配套 Reference 已制作；仓库发布标记已开启 |
| Stage 4 | Agent 工程进阶 | 8 | 8 课正文与配套 Reference 已制作；仓库发布标记已开启 |

发布标记由 `src/data/courses.ts` 经 `npm run db:seed` 同步到数据库；运营后台可以管理 Stage 的展示、购买状态和价格。仓库发布标记已开启；实际开放仍以运行数据库与后台状态为准，仓库存在课程文件不等于已向每位学员授权。详细的正文状态和编写规则见 [course-content/README.md](course-content/README.md)。

## 平台已实现的功能

- 手机号注册与密码登录、Cookie Session、密码修改、邮箱绑定/换绑及邮箱找回密码。手机号目前仅作为登录账号，不验证归属。
- 课程目录、试看和按 Stage 授权的服务端正文读取；学习进度、任务勾选与完成状态保存在数据库。
- 管理后台的用户、权限、课程发布与价格管理，以及操作审计。购买通过微信联系管理员并由管理员人工开课；没有自动支付或订单系统。
- Stage 1 Starter 的登录后下载，以及按独立阶段权限控制的 Stage 3、Stage 4 Starter 下载。ZIP 由构建脚本生成，服务端按固定资源白名单提供，不放入公开静态目录。

Stage 3 的 AI 与 RAG、Stage 4 的受控 Agent 示例属于学员教学项目；这些不是课程网站提供的在线 AI 服务。

## 本地运行

需要 Node.js 20.19+、npm 和 PostgreSQL。先安装依赖，将 `.env.example` 复制为 `.env`，填写 `DATABASE_URL`、至少 32 字符的随机 `SESSION_SECRET`、`ADMIN_PHONE` 与 8～72 字符的 `ADMIN_INITIAL_PASSWORD`。首次 seed 会创建管理员，后续 seed 不会重置现有密码或覆盖后台维护的 Stage 价格与发布状态。不要提交真实 `.env`。

```sh
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

前端默认运行在 `http://localhost:5173`，API 在 `http://127.0.0.1:3001`，Vite 将 `/api` 代理给后端。修改环境变量后重启服务。

可选的 `npm run db:local` 会启动或复用 Docker PostgreSQL 17 容器；它只接受 `DATABASE_URL` 指向 `localhost:55432` 或 `127.0.0.1:55432`。`.env.example` 的数据库端口为 5432，使用该辅助命令前需将 URL 改为 55432；已有 PostgreSQL 时直接使用自己的连接地址。

邮件功能需要服务端配置 `SMTP_USER`、`SMTP_PASSWORD` 等变量；`SMTP_PASSWORD` 填 SMTP 授权码。`npm run check:mail` 只检查 TLS 和身份认证，不发送测试邮件。完整变量模板见 [.env.example](.env.example)。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 同时启动前端和 API |
| `npm run typecheck` | 检查前后端 TypeScript |
| `npm run build` | 生成 Starter ZIP，并编译前端 `dist/` 与后端 `server-dist/` |
| `npm start` | 启动编译后的服务；生产模式同时托管 `dist/` |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:migrate` | 执行已有 Prisma migration |
| `npm run db:seed` | 同步课程目录并创建首位管理员 |
| `npm run check` | 检查正文、已发布目录与 Starter ZIP |
| `npm run check:bundle` | 检查前端构建中没有课程正文 |
| `npm run verify` | 类型、构建、数据库测试、正文及 bundle 完整检查 |
| `npm run test:production` | 编译后服务和生产安全配置冒烟检查 |

`npm test` 使用 PostgreSQL 中独立的 `aifoundry_test` schema；运行 `verify` 前需要可连接的数据库。`npm run check:authored-content` 会检查未发布但已写好的 Stage 3 正文，`npm run check:content` 只检查已发布正文与数据库目录的一致性。

## 主要目录

- `src/`：React 页面、课程目录元数据和前端数据适配层。
- `server/`：认证、课程、进度、附件、管理员和邮件 API。
- `prisma/`：数据库 schema、迁移和 seed。
- `course-content/`：仅由服务端读取的 Markdown 正文；`internal/` 存放制作材料与 Reference。
- `starter/`：Stage 1、Stage 3、Stage 4 学员项目及生成的 ZIP。
- `scripts/`、`tests/`：构建、内容校验及集成测试。
- `docs/`：课程设计、Starter 交付、技术验证和验收记录。

## 部署要点

设置生产 `DATABASE_URL`、`NODE_ENV=production`、HTTPS `APP_ORIGIN` 和随机 `SESSION_SECRET`，按顺序执行安装依赖、`db:generate`、`db:migrate`、首次 `db:seed`、`build`、`check:bundle`，再运行 `npm start`。生产服务需要数据库、`dist/`、`server-dist/`、服务端课程正文和生成的 Starter ZIP；从仓库根目录启动。不要将 `course-content/`、`starter/` 或仓库根目录映射为 Web 静态目录。

`TRUST_PROXY_HOPS=1` 只应在单层可信反向代理后设置，默认值为 0。正式对外运营前还需要配置 HTTPS、数据库备份与恢复、收款联系信息、管理员密码，以及实际运营者信息与相关告知。Stage 3/4 的发布状态应按教学内容与验收结果单独决定。

## 环境信息维护

公开 `/environment` 页面集中维护推荐工具下载、已验证模型和服务端环境变量。对应源文件为 `src/pages/Environment.tsx`；课程正文链接其章节。模型兼容判断仍由各 Starter / Reference 的实现与测试负责，更新推荐值前应完成回归验证。
