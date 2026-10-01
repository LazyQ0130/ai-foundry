# Stage 3 Phase 0｜技术验证记录

2026-10-01，内部 reference spike：`course-content/internal/stage-3/phase-0/`。本轮只验证接口、流与隔离数据库路径，不是 Stage 3 正式产品或课程正文。开工时本地与 `origin/main` 均为 `79b9fad9f5cf061c2736948fa0cc79431439e993`。Stage 2 最终参考项目使用 Next.js 15.5.26、`prisma`/`@prisma/client` 固定 6.19.3、三次原有迁移，`Resource.ownerId`、`User`、`Session`；平台本身是独立 Vite/Express 项目，不把平台数据库当学生项目数据库。

## 验证环境与候选选型

- Node 内置 `fetch` + 本地 HTTP stub 验证 Provider Adapter；`zod` 严格校验结构化结果；Node HTTP 服务测试断连与旧响应；独立 Next.js 15.5.26 Route Handler 测试真实框架传输。代码全部在 internal，未接平台公开路由。
- 独立 Docker 容器 `aifoundry-stage3-spike-pgvector`，`pgvector/pgvector:0.8.6-pg17`，只绑定 `127.0.0.1:55433`，数据库 `stage3_spike`。未连接或 reset 平台现有 `aifoundry-postgres-local`，未访问生产库，也未使用平台用户数据。
- 中国大陆课程候选：阿里云百炼北京地域兼容接口，Chat `qwen-flash`，Embedding `text-embedding-v4`、1024 维。官方 [Embedding API](https://help.aliyun.com/zh/model-studio/text-embedding-synchronous-api/) 列出该维度，[Chat 流式接口](https://help.aliyun.com/zh/model-studio/stream)说明 `stream_options.include_usage`，[qwen-flash 信息](https://help.aliyun.com/en/model-studio/qwen-flash)列出价格。价格与可用地域须在正式授课前复查。**当前环境没有可用 AI Key，因此这只是候选，不是实测通过的 Provider baseline。**

## Spike A：真实模型调用

`provider.mjs` 定义 `generate()`、`stream()`、`embed()`；配置全取服务端环境变量。Mock 确定性返回且含 `kind: mock` / `MOCK:`。本地 HTTP stub 验证了 Authorization 请求头、正常回答、usage 提取、401 映射、503 映射、8 秒超时、取消、输入长度上限及输出 `max_tokens: 256`。代码不打印 Key，也不打印 Provider 错误正文；不自动重试。`AI_CHAT_*`、`AI_EMBEDDING_*` 与 `AI_EMBEDDING_DIMENSION` 均不写进浏览器。

**未验证：真实百炼 Key 有效性、云端成功回答、云端 401、实际 Token usage / 花费、真实 Provider 故障或所在网络可达性。**本地 stub 的 401/503 不等同于云端实测。补验需用专用低预算账号与非敏感短输入，先执行一次正常、一次故意无效 Key、一次受控超时和一次 Embedding 请求；只记录状态、时延、usage、向量长度，不记录 Key 或完整响应。未拿到真实凭证前不得写成已验收。

## Spike B：结构化输出

`parseSuggestion()` 用 Zod strict Schema 校验 `summary: string(1..500)`、`tags: string[1..5]`、`confidence: number[0..1]`，拒绝额外字段。本地测试覆盖正常结构、非法 JSON、缺字段、tags 错类型、confidence 越界和多余字段；均按预期通过或拒绝。结果只供 Preview，不写原 Resource。**真实模型生成这些案例未验证**；本地构造坏输出只验证服务端兜底能力。

## Spike C：Streaming

内部 `stream-bridge.mjs` 通过真实本地 HTTP POST 将 Provider async iterator 转为响应字节流；Node fetch 客户端模拟浏览器读取，观察到 `one`、`two` 两次 Chunk，AbortController 中断后服务端收到连接关闭，Provider 故障终止客户端流。`createLatestResponseState()` 的 generation id 防止旧请求后续 Chunk 写入新请求。适配器还解析兼容模式的 `data:` Chunk 和 `[DONE]`；本地 stub 验证文本分片。

另外在 `next-spike/` 安装固定的 Next.js 15.5.26 / React 19.0.8，运行其真实 `app/api/stream/route.js`。启动 `npm run dev` 后执行 `node course-content/internal/stage-3/phase-0/next-spike.test.mjs`，实测收到分隔约 250ms 的 `MOCK: first`、` second` 两个 Chunk；客户端主动取消可中止读取；空输入返回 400。该路由只用显式 Mock，不连云端，也不接学生或平台数据。正式界面仍需在课程开发阶段实现 pending / streaming / completed / cancelled / failed 视图。**真实浏览器 UI 和云端真实流尚未验收**；本地 Mock 不代表真实供应商网络行为。

## Spike D：Prisma 6.19.3 + PostgreSQL + pgvector

在独立库实际执行：

```powershell
$spikePassword = [guid]::NewGuid().ToString('N')
docker run -d --name aifoundry-stage3-spike-pgvector -e "POSTGRES_PASSWORD=$spikePassword" -e POSTGRES_DB=stage3_spike -p 127.0.0.1:55433:5432 pgvector/pgvector:0.8.6-pg17
$env:STAGE3_SPIKE_DATABASE_URL="postgresql://postgres:$spikePassword@127.0.0.1:55433/stage3_spike?schema=public"
npx prisma migrate deploy --schema course-content/internal/stage-3/phase-0/prisma/schema.prisma
npx prisma generate --schema course-content/internal/stage-3/phase-0/prisma/schema.prisma
node course-content/internal/stage-3/phase-0/db-spike.mjs
```

结果：Prisma Client **v6.19.3** 生成成功；手写 migration 成功创建 `vector` extension、`vector(1024)` 列与 owner 关联；参数化 `$executeRaw` 写入 1024 维向量；3 维写入被数据库拒绝；参数化 `$queryRaw` 的 `<=>` 余弦距离返回 Top-2，最相似分数 1；按 `KnowledgeDocument.ownerId` 过滤后 Alice 不会检索到更相似的 Bob 私有 Chunk。运行输出：`{"status":"pass","pgvector":"0.8.6","dimension":1024,"topK":2,"ownerIsolation":true,"invalidDimensionRejected":true}`。

Prisma 6.19.3 Schema 将向量字段记为 `Unsupported("vector")?`，固定维度在手写 SQL migration 中定义。普通 Prisma 关系和文档写入可用 Prisma Client；向量写入与相似度查询必须走参数化 raw SQL，并把 ownerId 作为查询谓词。当前代码只是独立实验；正式 3.4 迁移必须基于学生自己的 Stage 2 `User` / `Resource` 历史增量演进，不能套用这个测试库的建表 migration。参见 [Prisma 扩展说明](https://www.prisma.io/docs/postgres/database/postgres-extensions)和 [Prisma v6 Unsupported 字段](https://www.prisma.io/docs/orm/v6/prisma-schema/data-model/unsupported-database-features)。

**未验证：真实 `text-embedding-v4` 的 1024 个浮点结果写入 pgvector、真实云 PostgreSQL 扩展权限、学生现有 Stage 2 数据上的增量迁移。**本地合成向量只能证明数据库与 Prisma 路径。

## 重跑、成本与后续门槛

无需真实 Key 的合同测试：`node --test course-content/internal/stage-3/phase-0/provider.test.mjs course-content/internal/stage-3/phase-0/stream-bridge.test.mjs`。Next.js 框架测试：在 `course-content/internal/stage-3/phase-0/next-spike` 执行 `npm install --no-package-lock`、`npm run dev`，另一终端从仓库根目录执行 `node course-content/internal/stage-3/phase-0/next-spike.test.mjs`。数据库脚本内还核对独立测试库地址，避免误连平台或生产库。生成的 Prisma Client 与 Next.js 构建目录被 `.gitignore` 排除。

正式接入前应在服务端 Route 增加登录用户级别限流、每日预算门槛、输入和 Chunk 数量限制、可取消请求、8 秒级超时与明确的 401/429/5xx 恢复反馈；禁用无限重试和自动批量重嵌入。只用非敏感资料测试，日志不含 Key、完整 Prompt、完整响应。模型名、地域、价格、Embedding 维度、云端流行为均以有凭证的真实小额调用结果更新，未通过前不发布 3.1～3.7 正文。

仓库检查结果：内部 Provider / HTTP bridge 的 7/7 测试通过；Next.js Route Handler 框架测试通过；`npm run verify` 通过（67/67 仓库测试、15 篇已发布正文和 bundle 检查）；`npm run check` 通过（内容及 Starter）。四阶段正式课仍为 6/8/7/8、共 29 节；Stage 3 的 7 节均 `isPublished: false`。Stage 1、Stage 2、Stage 4、现有 checkKeys、Starter、教学图片、平台 Auth/支付/权益代码均未修改。
