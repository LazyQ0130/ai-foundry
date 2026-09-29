# 个人知识工作台

把资料保存到个人账号的全栈知识工作台。支持静态示例浏览、搜索和筛选，以及注册登录后独立保存、修改和删除自己的资料；A 版本保留日期排序，B 版本另有自选标题和统计。

**在线演示：** 部署完成后填入真实 Production HTTPS 地址。未部署前不要写一个不可用的假链接。

## 技术栈与本地运行

Next.js 15、React 19、Prisma 6、PostgreSQL。需要 Node.js 20、一个独立 PostgreSQL 数据库和环境变量 `DATABASE_URL`。将变量放在本地 `.env`；`.env*` 应由 `.gitignore` 排除，不提交真实值。

```bash
npm install
npx prisma migrate deploy
npx prisma migrate status
npm run dev
```

首次安装会运行 `prisma generate`。已有三次迁移依次建立 Resource、User/Session 和 Resource.ownerId；保留全部 `prisma/migrations`。`npm run build` 在本地生成 Client 并构建 Next.js。Vercel 的 Build Command 设置为 `npm run vercel-build`，按 `prisma generate → prisma migrate deploy → next build` 执行。生产 `DATABASE_URL` 只填在 Vercel **Production** 服务端环境变量。Preview 如需连接数据库，使用独立库或 Neon branch。

## 结构与数据流

```text
app/page.tsx              页面与交互
app/api/auth/             注册、登录、Session、退出
app/api/resources/        当前用户资料的 CRUD
lib/                     Prisma、密码哈希、Session 与同源写保护
prisma/schema.prisma      User、Session、Resource 模型
prisma/migrations/        三次版本化数据库迁移

GitHub → Vercel deployment
Browser → Next.js Page → Route Handler → Session / Ownership → Prisma → PostgreSQL
```

页面发出 JSON 请求，Route Handler 验证输入和 Session，按服务端 `ownerId` 访问资料，Prisma 写入 PostgreSQL，响应回到页面并驱动 Loading、Empty、Error 或 Validation 状态。

## API

| 方法与路径 | 用途 |
| --- | --- |
| `POST /api/auth/register` | 注册并建立 Session |
| `POST /api/auth/login` | 登录并建立 Session |
| `GET /api/auth/me` | 读取当前用户 |
| `POST /api/auth/logout` | 使当前 Session 失效 |
| `GET /api/resources` | 只列出当前用户资料 |
| `POST /api/resources` | 创建当前用户资料 |
| `PATCH /api/resources/[id]` | 修改本人资料 |
| `DELETE /api/resources/[id]` | 删除本人资料 |

密码存储为哈希；Session 使用 `HttpOnly`、`SameSite=Lax` Cookie，生产 HTTPS 下启用 `Secure`。服务端对 GET、PATCH、DELETE 执行 ownerId 限制，写请求检查 Origin 与 Fetch Metadata，输入由服务端最终验证。生产错误响应不包含连接串或异常堆栈。
