# Stage 3 Final Acceptance（2026-10-02）

范围：独立 Stage 3.7 Implementation A Reference 产品的云数据库、正式 migration、Vercel Production 和低成本公网功能检查。Stage 3.1～3.7 仍未发布；此记录只证明 V1 技术基线，不代替真人教学验证。未连接 AIFoundry 平台数据库或 Stage 2 Reference Production。

## A. Git / Build

- 起始平台 Git HEAD 与远端 main 均为 `be03bafb1ce9862a0fcb387d20edb176d5a49727`。Reference 使用独立 GitHub 仓库 [aifoundry-stage3-workbench-reference](https://github.com/LazyQ0130/aifoundry-stage3-workbench-reference)，只装配 Stage 3.7 Implementation A 的产品文件；Implementation B 留在本地 A/B 回归。
- Reference 技术栈为 Next.js 15.5.26、React 19、Prisma 6.19.3、PostgreSQL 17、pgvector。Reference 的 `npm run build` 已通过；Production Build Command 为 `npm run vercel-build`。
- 正式 Prisma schema 与数据库结构 `prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --exit-code` 无差异；`prisma validate` 通过。没有使用 `migrate reset`、`db push` 或手工建业务表。
- 平台 `npm run verify` 与 `npm run check` 通过；平台测试 67/67。Stage 3.1～3.7 A/B Reference 共 28 项集成测试命令和 9 项单元测试命令全部通过，包含文档、RAG、引用、流式及 Eval Runner。

## B. Independent Cloud PostgreSQL

- Provider：Neon；项目名：`aifoundry-stage3-reference-production`；用途：AIFoundry Stage 3 Reference Production；新建时 `public` 业务表数量为 0。
- PostgreSQL 17.11；region：AWS US East 2（Ohio）。这是全新项目，与平台、Stage 2 Production、本地测试库隔离。文档不记录连接串或密码。
- 公网测试后的只读汇总：User 2、Resource 0（CRUD 测试创建后删除）、KnowledgeDocument 4、KnowledgeChunk 4；文档 ready 4、failed 0。Alice 3 篇文档 / 3 个 Chunk，Bob 1 篇 / 1 个 Chunk。

## C. pgvector

- 在新库独立执行 `CREATE EXTENSION IF NOT EXISTS vector;` 成功；只读查询 `pg_extension.extversion` 得到 `0.8.0`。
- `KnowledgeChunk.embedding` 的实际 PostgreSQL 类型为 `vector(1024)`；四条入库 Chunk 的 `vector_dims(embedding) = 1024` 全为真。未读取或记录完整向量。

## D. Four Migrations

- 从空库通过正式 `prisma migrate deploy` 顺序应用四次 migration：Resource、User/Session、Resource.ownerId、KnowledgeDocument/KnowledgeChunk 与 pgvector。 `prisma migrate status` 报告 up to date；`_prisma_migrations` 四条均成功。
- 只读结构核对存在 Resource、User、Session、KnowledgeDocument、KnowledgeChunk、`_prisma_migrations` 六表；存在 `KnowledgeDocument_status_check`、`KnowledgeChunk_dimension_check`、`(documentId, position)` 唯一索引和 owner / document 外键。

## E. Vercel Production

- 独立 Vercel 项目：`aifoundry-stage3-workbench-reference`；GitHub 来源为上面的 Reference 仓库 `main`，没有覆盖 Stage 2 项目。Production 部署 commit 为 `cb0fb22f7c7671006077326635e051c015ef4e70`；GitHub Production Deployment 记录的 ref / SHA 与之完全一致且状态为 success。部署于 2026-10-02 03:03:29 CST 创建，Vercel ID 为 `dpl_5JCdC6jca8mn66h8i66iBctvQvCp`。正式 HTTPS alias：[aifoundry-stage3-workbench-referenc.vercel.app](https://aifoundry-stage3-workbench-referenc.vercel.app/)。
- 最终 Production Build 日志逐层确认依赖安装、Prisma Client 生成、`migrate deploy`、`migrate status` up to date、Next.js build 和 Deployment Ready；最终 alias 再次返回 HTTP 200。
- Production 环境将 `DATABASE_URL`、`AI_CHAT_API_KEY`、`AI_EMBEDDING_API_KEY` 设为 Secret；其余服务端配置为 `AI_PROVIDER_MODE=real`、Chat / Embedding endpoint、模型 `qwen3.7-flash` / `text-embedding-v4`、关闭思考模式、1024 维和 20 秒超时。上述变量只配置在 Production，均未使用 `NEXT_PUBLIC_` 前缀。

## F. Stage 2 Regression

- 使用隔离 Cookie jar 和两个新建临时账号 Alice / Bob：注册均为 201；登录、`/api/auth/me`、刷新后会话、登出与登出失效均通过。Cookie 带 `HttpOnly`、`Secure`、`SameSite=Lax`。
- Alice 的 Resource 空列表、POST、GET、PATCH、DELETE 均通过；Bob 列表不可见 Alice 的 Resource，猜中 ID 的 PATCH / DELETE 都返回 404。正常同源写入成功，异常 Origin 返回 403。

## G. Stage 3.1～3.6 Production Smoke

| 课 | 公网真实结果 |
| --- | --- |
| 3.1 | 短 Chat 返回 HTTP 200、`kind=real`、非空回答和可得 usage；本记录不保存完整回答。 |
| 3.2 | Structured Suggestion 返回 HTTP 200，`summary`、`tags`、`confidence` 符合严格 Schema；原 Resource 未改变。 |
| 3.3 | Streaming 返回 HTTP 200，首段约 1539 ms、10 个 delta 后 `done`；另一次在首段约 732 ms 后中止，保留已收到的部分内容且未继续追加。公网检查在 API 客户端执行取消；生产浏览器 UI 取消动作未单独操作，本地 Reference 测试覆盖 UI 状态逻辑。 |
| 3.4 | Alice 的 Git、PostgreSQL、Cookie / Session 三篇短文档和 Bob 一篇私有短文档均为 `ready`；真实 `text-embedding-v4` 产生四个 1024 维 Chunk。Alice 文档列表不含 Bob 文档。 |
| 3.5 | Alice 问“什么工具可以帮助我保存代码版本？”：Query Embedding 成功，检索 3 条、Top-1 为 Git 文档，similarity 约 0.7883；真实 RAG 回答非空。Embedding / 检索 / Chat / 总耗时约 273 / 66 / 796 / 1136 ms，可得 usage 为 Embedding 9、Chat 369 tokens。Bob 私有文档未进入 Alice 的 Top-K。 |
| 3.6 | 同一题返回 `answered`，已验证来源 1 条；来源属于本次 Retrieved Set，其真实文档标题、position 与 preview 和数据库 Chunk 一致。资料外问题“量子计算机的纠错原理是什么？”实际返回 `insufficient`、来源 0。Bob 的 RAG 仅命中其私有文档。 |

知识隔离在服务端 SQL 执行：检索以服务端会话的 `ownerId` 作为 `KnowledgeDocument` 谓词，客户端不能指定别人的 ownerId；公网 Alice / Bob 实测和数据库所有者汇总与该边界一致。Production 没有重跑完整 12 题。

## H. Stage 3.7 Existing Evaluation Evidence

已有 [3.7 验收记录](stage-3-l7-validation.md)使用本地隔离 PostgreSQL + pgvector 和真实 Provider 对固定三篇资料、12 道题顺序评估：可答题预期文档进入 Top-K 8/8，可答题返回 `answered` 8/8，无答案拒答 4/4，最终来源包含预期文档 8/8。人工来源支持复核为 supported 8、unsupported 0、uncertain 0。这是小型固定知识包结果，不能推广为所有资料或问法的可靠性结论。

## I. Secret Audit

- Reference 仓库只提交产品运行文件；未提交课程、私有 Eval、`.runtime`、`.env`、`node_modules` 或 `.next`。部署环境 Secret 留在 Vercel Production 配置。
- 检查 Reference Git tracked files、Production Build 与抽样 Runtime 日志、浏览器加载资源、首页 HTML 和六个 JS bundle；未发现数据库连接串、API Key、Bearer、Session token、passwordHash、完整 Provider 回答或完整向量。检查使用变量名和受控模式，没有将真实 Secret 放入搜索命令。此项是对本次提交与样本的审计，不保证所有未来日志内容。

## J. Network Accessibility

- 当前 Windows 桌面所用网络：Production HTTPS 首页返回 200，Edge 页面正常加载；该网络上的 API、数据库与真实 Provider 链路通过。未确认该网络的公网出口地域或 ISP。
- 其他地区、运营商与企业网络：未验证。上述可访问性只适用于实际测试网络；部署技术验收由 Build、Runtime、数据库、AI 和 RAG 的独立证据支持。

## K. Remaining Limitations

- 尚无真实新学员完成 Stage 3 全流程。
- Evaluation 只覆盖固定三篇短资料和 12 题；不代表所有知识包、问法或模型长期稳定性。
- 单实例 rate limit 不是分布式全局限流；未做大量并发或压测。
- V1 不含 PDF / DOCX 上传等扩展能力。
- 公网 UI 取消未单独人工操作；本次生产验证覆盖 API 流式中止，本地 A/B Reference 回归覆盖相应 UI 状态逻辑。
- Stage 3 七课保持 `isPublished=false`，正式课程仍为 29 节；完成技术验收后仍需人工决定是否发布。
