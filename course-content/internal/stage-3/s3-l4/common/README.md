# 个人知识工作台

把资料保存到个人账号的全栈知识工作台。支持静态示例浏览、搜索和筛选，以及注册登录后独立保存、修改和删除自己的资料；A 版本保留日期排序，B 版本另有自选标题和统计。

**作者在线演示：** [Production HTTPS 站点](https://aifoundry-stage2-workbench-referenc.vercel.app/)。这是 A 版本的独立参考部署，不是学员自己的交付地址；学员 README 应填写各自实际部署并复验的地址。

## 技术栈与本地运行

Next.js 15、React 19、Prisma 6、PostgreSQL。需要 Node.js 20、一个独立 PostgreSQL 数据库和环境变量 `DATABASE_URL`。先将变量放在本地 `.env`，再执行 `npm install`；安装后脚本会运行 `prisma generate`，它也要读取该变量。`.env*` 应由 `.gitignore` 排除，不提交真实值。

```bash
npm install
npx prisma migrate deploy
npx prisma migrate status
npm run dev
```

已有三次迁移依次建立 Resource、User/Session 和 Resource.ownerId；第四次增量迁移建立知识文档与 pgvector。保留全部 `prisma/migrations`。`npm run build` 在本地生成 Client 并构建 Next.js。Vercel 的 Build Command 设置为 `npm run vercel-build`，按 `prisma generate → prisma migrate deploy → prisma migrate status → next build` 执行。生产 `DATABASE_URL` 只填在 Vercel **Production** 服务端环境变量。Preview 如需连接数据库，使用独立库或 Neon branch。

## 结构与数据流

Stage 3.1 在原有结构上增加 `components/AiExperiment.tsx`、`app/api/ai/answer/route.ts`、`lib/ai-provider.ts` 与 `lib/ai-rate-limit.ts`。AI Route 只允许已登录用户同源提交，Key 只由服务端环境变量读取。默认 Mock；切换真实模型时请使用自己的北京地域 Workspace 配置，勿将 Key 放入 Git。

Stage 3.2 再增加 `components/AiSuggestion.tsx`、`app/api/ai/suggest/route.ts`、`lib/ai-suggestion.ts` 与共享的 `lib/ai-http.ts`。suggest 只做严格校验后的预览，不新增或修改 Resource；Zod 固定为 4.6.5。原有问答和资料 API 仍在。

Stage 3.3 在同一问答输入框加入普通与流式模式，新增 `app/api/ai/stream/route.ts`、`lib/provider-sse.ts` 和 `lib/ai-stream-generation.ts`。Provider `stream()` 复用原配置、请求、超时与错误映射；Route 将上游 SSE 转为本产品的 NDJSON 事件。页面区分等待首段、逐段生成、完成、取消与失败，取消会向上游传递 AbortSignal。

Stage 3.4 新增 `KnowledgeDocument`、`KnowledgeChunk` 和第四次增量 migration：在已有三次 migration 上启用 pgvector、建立 `vector(1024)`。`lib/ai-provider.ts` 的 `embed()` 继续复用同一 fetch、超时及错误映射，但读取独立 `AI_EMBEDDING_*` 服务端配置；默认 Mock 用确定性 1024 维向量。`POST /api/knowledge/documents` 只接收 title/content，Session 决定 ownerId；正文最多 6000 字符、8 个分块。Embedding 在事务外生成并逐个检查，短事务用参数化 SQL 写向量及 ready 状态，失败标记 failed。GET 只返回本人安全元数据和短预览，不返回向量。本课没有搜索接口。

```text
app/page.tsx              页面与交互
app/api/auth/             注册、登录、Session、退出
app/api/resources/        当前用户资料的 CRUD
lib/                     Prisma、密码哈希、Session 与同源写保护
prisma/schema.prisma      User、Session、Resource 与 KnowledgeDocument/Chunk 模型
prisma/migrations/        四次版本化数据库迁移

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
| `POST /api/ai/answer` | 登录用户同源提问，Mock 或真实模型回答 |
| `POST /api/ai/suggest` | 登录用户同源生成严格校验后的资料建议预览 |
| `POST /api/ai/stream` | 登录用户同源提问，逐段返回 `meta/delta/usage/done/error` NDJSON 事件 |
| `GET /api/knowledge/documents` | 只列出当前 Session 用户的知识文档与安全元数据 |
| `POST /api/knowledge/documents` | 同源创建知识文档，切块、Embedding、入库 |

密码存储为哈希；Session 使用 `HttpOnly`、`SameSite=Lax` Cookie，生产 HTTPS 下启用 `Secure`。服务端对 GET、PATCH、DELETE 执行 ownerId 限制，写请求检查 Origin 与 Fetch Metadata，输入由服务端最终验证。生产错误响应不包含连接串或异常堆栈。
