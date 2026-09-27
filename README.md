# AIFoundry · 课程平台 MVP

React 18 + TypeScript + Vite + React Router 6 + Tailwind，后端为 Node.js / Express 5 / Prisma 6 / PostgreSQL。

已实现手机号注册、密码登录、Cookie Session、人工开课、课程正文鉴权、云端学习进度、管理员用户和权限管理。没有自动支付或订单系统。手机号仅作为登录账号，当前不验证归属。

## 本机启动

当前工作区已创建未提交的 .env、本地 PostgreSQL 容器与数据库。运行：

~~~sh
npm run db:local
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
~~~

前端 http://localhost:5173，API http://127.0.0.1:3001。Vite 将 /api 代理给后端。已有本地管理员手机号为 13900000001，随机初始密码见本机 .env 中 ADMIN_INITIAL_PASSWORD。登录后可在 /account 修改密码，修改会使全部 Session 失效。

新机器：安装 Node.js 20.19+ 和 PostgreSQL，执行 npm install，将 .env.example 复制成 .env 并填写数据库、随机 SESSION_SECRET、管理员手机号及 8～72 字符的初始密码，再运行 generate、migrate、seed、dev。不要提交真实 .env。

本机数据库辅助命令只接受 localhost:55432；使用 Docker PostgreSQL 17、持久化卷 aifoundry-postgres-data，端口仅绑定回环地址。已有外部 PostgreSQL 时直接填写 DATABASE_URL，不必运行 db:local。

## 服务端邮件配置

QQ 邮箱发信使用本机 `.env` 中的 `SMTP_HOST=smtp.qq.com`、`SMTP_PORT=465`、`SMTP_SECURE=true`、`SMTP_USER`、`SMTP_PASSWORD` 和 `SMTP_FROM_NAME`。密码字段填写 SMTP 授权码，禁止使用 `VITE_` 前缀或提交真实凭据。`.env.example` 仅包含空凭据模板。

运行 `npm run check:mail` 检查 TLS 连接和 SMTP 身份认证；该命令不发送邮件，也不代表收件箱投递已验证。服务端发信模块位于 `server/services/mail.ts`。修改配置后重启后端生效；部署到线上时需单独设置服务器环境变量。

个人中心支持绑定与更换邮箱（当前密码 + 邮件验证码，换绑同时验证新旧邮箱），`/forgot-password` 支持邮箱找回。验证码 10 分钟有效、一次使用、最多尝试 5 次；按目标邮箱/操作账号限制 60 秒间隔、每小时 5 次、每天 10 次，并额外按 IP 限流。验证码使用 SESSION_SECRET 的 HMAC 保存；重置后所有登录会话失效，账号禁用、密码或邮箱变更会使旧验证码无效。重置请求对未知账号、禁用账号、发送失败及邮箱限流统一反馈，避免直接暴露账号是否存在。

超过 24 小时的验证码请求记录在下一次请求时清理。SMTP 发送不持有数据库事务，发送失败不会留下可使用的验证码。不提供公开的任意发信接口。测试使用内存邮件接收器，不向真实邮箱发送验证码。注册必须提交 `acceptedTerms: true`，数据库记录协议版本及同意时间。

运营规则：个人运营；图文自主阅读，已购课程永久开放；不提供人工答疑；第三方工具、模型与 API 费用由学员承担。对应方案首次开通后 72 小时内可申请无理由全额退款，人工核实付款后退款，并关闭该次购买对应的权限。仅保留微信用于购买、退款、账号与隐私事项，SMTP 邮箱不作客服渠道。

实际运营者姓名或名称的个人信息告知问题仍需在正式上线前解决；用户目前不希望公开姓名，页面尚未填写真实主体身份，不应视为已完成合规审定。

## 人工开课流程

1. 学生在 /register 注册并自动登录，默认没有任何 Stage 权限。
2. 学生微信向管理员付款，将注册手机号告知管理员。
3. 管理员登录 /admin/users，搜索手机号，查看详情并打开课程权限。
4. 填写来源、备注，单阶段开通或一键开通全套。全套报价保留 ¥599。
5. 学生刷新页面即可学习；勾选任务、完成课程写入数据库，Dashboard / Path / Stage 同步更新。
6. 撤销权限后新正文请求立即拒绝，历史进度和审计记录保留。

购买弹窗读取 WECHAT_QR_URL 和 WECHAT_CONTACT。已接入用户提供的联系微信二维码 public/wechat-contact.jpg，默认地址 /wechat-contact.jpg，用于添加管理员咨询课程和付款方式；“我已完成付款”不创建订单。单阶段价格来自 Stage 表；全套报价来自服务端 ALL_ACCESS_PRICE，默认 599。前台不使用静态价格作为实际报价。

## 命令

| 命令 | 作用 |
| --- | --- |
| npm run dev | 同时启动前后端开发服务 |
| npm run typecheck | 前后端类型检查 |
| npm run build | 编译前端 dist/ 和后端 server-dist/ |
| npm start | 启动编译后的后端；production 模式也托管 dist |
| npm run db:generate | 生成 Prisma Client |
| npm run db:migrate | prisma migrate deploy，执行已有迁移 |
| npm run db:seed | 同步 4 Stage 与 Lesson 标记，并创建首次管理员 |
| npm test | 独立 aifoundry_test schema 中执行真实数据库测试 |
| npm run check:content | 检查目录、数据库与正文任务 key |
| npm run check:bundle | 检查全部前端 JS/map 不含课程正文 |
| npm run verify | 类型、构建、测试、内容与 bundle 完整检查 |
| npm run test:production | 编译后服务、生产 Cookie 和私有文件隔离检查 |

构建配置 emptyOutDir=false，避免自动批量清空文件。历史 Demo 构建已移到 .runtime/legacy-build-phase4，仅作本机留档，禁止发布。

## 核心目录

- src/auth/：AuthProvider、身份守卫；src/lib/api.ts：统一请求与错误处理。
- src/data/courses.ts：公开目录；catalog.tsx：服务端发布与价格元数据；progress.tsx：数据库进度适配层；lessonContent.ts：仅类型，无正文。
- server/：配置、中间件、认证、管理员、课程和进度 API。
- prisma/schema.prisma、prisma/migrations/：数据库结构与正式迁移。
- course-content/：服务端 Markdown 课程源；内容结构与编写规则见该目录 README。
- tests/：基于 Supertest 与真实 PostgreSQL 的集成测试。
- docs/IMPLEMENTATION.md：分阶段交付、验收证据与剩余运营工作。

## API

成功响应为 { data: ... }，失败为 { error: { code, message } }。所有写请求须提供与 APP_ORIGIN 完全匹配的 Origin；浏览器自动发送。普通用户响应不含密码哈希、Session 哈希或内部备注。

- POST /api/auth/register、/login、/logout、/password；GET /api/me。
- POST /api/auth/email/code（email、currentPassword）、/email/confirm（challengeId、code、换绑时 oldCode）。
- POST /api/auth/password-reset/code（email）、/password-reset/confirm（challengeId、code、newPassword）。
- GET /api/stages；GET /api/lessons/:lessonId（鉴权后才读取正文）。
- GET /api/progress；POST /api/progress/lessons/:lessonId/visit、/complete；PUT /api/progress/lessons/:lessonId/checks/:checkKey。
- GET /api/admin/users 支持 page、pageSize、query、status、stage、access、sort；GET /api/admin/users/:id。
- PATCH /api/admin/users/:id/note；POST /api/admin/users/:id/disable、/enable。
- POST /api/admin/users/:id/entitlements、/entitlements/all；DELETE /api/admin/users/:id/entitlements/:stageSlug。
- GET /api/admin/audit（手机号搜索、分页）；GET /api/admin/courses；PATCH /api/admin/courses/stages/:slug、/lessons/:id。

所有 admin 接口在路由入口经过 requireAuth + requireAdmin。开通/撤销/禁用与日志在事务中执行；禁用、登录和进度写入对目标用户加锁。每次正文请求读取数据库权限，不依赖前端状态或 Session 内缓存权限。

## 生产部署

1. 设置生产 DATABASE_URL、NODE_ENV=production、HTTPS APP_ORIGIN、随机 SESSION_SECRET。只在可信反向代理后设置 TRUST_PROXY_HOPS=1；默认 0。
2. npm install，npm run db:generate，npm run db:migrate。首次运行 npm run db:seed 创建管理员；seed 不重置已有密码，也不覆盖后台价格/发布状态。
3. npm run build，npm run check:bundle，npm start。通过反向代理将同一 HTTPS 域名转发到 127.0.0.1:3001；后端同时服务 / 和 /api。
4. 登录修改初始管理员密码。配置收款信息，完成真实教学内容，备份数据库后再对外发布。

不要把仓库目录或 course-content 映射为 Web 静态目录；生产只发布 dist，API 从服务端读取私有正文。不要使用 db push 代替正式迁移。添加模型变更后生成并审阅 migration，生产用 migrate deploy。

Session 有效期为 30 天，Cookie 为 HttpOnly / SameSite=Lax / Path=/，生产加 Secure；数据库仅存 SHA-256 token hash。没有将认证或权限存入 localStorage。密码使用 Argon2id。注册每 IP 每分钟 5 次；登录每 IP 每分钟 30 次、每 IP+手机号每 15 分钟 10 次。当前限流存于单 Node 进程内，V1 部署使用一个 API 实例；若部署多实例，需替换共享限流存储。

PostgreSQL 持久化卷不等于备份。上线后使用托管数据库备份或定期 pg_dump，并验证恢复流程。过期 Session 不会通过鉴权，可后续通过专门维护任务清理；本轮未配置自动删除任务。

## 当前限制

- 原 Demo 除 2.3 课外的 21 节正文仍为结构化示例；已完成服务端保护，但正式售课前需要真实教学编写。
- 联系微信二维码已配置；未部署真实域名或 HTTPS。
- Vite 从 5 更新到 6.4.3 以修复 Windows 文件访问漏洞，页面结构不变；React Router 6 按要求保留，npm audit 仍报告其 2 个 moderate 依赖条目，详见实施记录。
- 当前目录不是 Git 仓库，无法生成 Git diff。未批量删除文件或目录。
