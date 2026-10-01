# Stage 3｜AI 应用开发：课程实施蓝图

内部蓝图，2026-10-01。正式课 3.1～3.7 共 7 节，仍未发布；本轮不编写正文。学生始终升级自己的 Stage 2「全栈知识工作台」，不另起产品。项目名称统一为「AI 知识工作台」。

## 输入、退出与连续项目

输入：Next.js 15.5.26 项目、PostgreSQL + Prisma 6.19.3、Resource CRUD、注册登录、服务端 Session、ownerId 隔离、Loading / Empty / Error / Validation、GitHub 仓库及生产部署。Stage 2 参考项目见 `course-content/internal/stage-2/s2-l8/common`；学生自己的结构与内容优先，不用参考项目覆盖。

退出：同一产品可安全调用真实模型，校验结构化建议，显示且取消流式回答；拥有独立的 KnowledgeDocument / KnowledgeChunk、Embedding、PostgreSQL + pgvector、按用户隔离的 Top-K 检索、最小 RAG、真实 Chunk 引用和 10～20 问的小型评估。Mock 路径始终显式标记，不计作真实模型验收。

| 课 | 输入 | 学生动作 | 可观察结果 | 本课边界 |
| --- | --- | --- | --- | --- |
| 3.1 第一次把真实模型接进自己的产品 | Stage 2 同一项目、有效会话 | 服务端 Route 调可替换 Provider；先 Mock 后低预算真实调用；限制输入、输出、超时与频率，显示失败和可得用量 | 浏览器在自己的产品中看到真实回答；Key 不出现在客户端；Mock 有明显标识 | 不做 RAG、Embedding、Tool Calling、Agent |
| 3.2 别让 AI 只返回一段「随缘文字」 | 3.1 模型调用 | 请求 summary / tags / confidence；服务端用严格 Schema 校验，展示建议 Preview | 正常结果可预览；非法 JSON、缺字段、错类型和越界值被拒绝；原 Resource 未自动修改 | 模型输出是不可信输入；不直接把 JSON 写入原数据 |
| 3.3 做出真正像 AI 产品的流式体验 | 3.1 服务端调用与 3.2 的失败状态经验 | 建立服务端到浏览器的流；管理 pending、streaming、completed、cancelled、failed 和 request id | 字逐段出现；用户取消、断开及 Provider 错误可见；旧响应不污染新请求 | 不把课程扩展成 SSE 协议课 |
| 3.4 让自己的资料变成可以检索的向量 | Stage 2 ownerId 隔离与独立练习库 | 粘贴文本或 Markdown 新建 KnowledgeDocument；确定性切块；调用 Embedding；检查维度并写入 pgvector | 文档、Chunk、向量可查，两个账号互不可见；能解释索引与重建状态 | 只处理粘贴文本；不做 PDF/DOCX/TXT 上传或最终 RAG 回答；Resource 不强行改型 |
| 3.5 做出第一条完整 RAG 链路 | 3.4 的真实向量与 Chunk | Question → Query Embedding → ownerId Top-K → Context → Model → Answer；开发模式显示命中 Chunk | 问答实际使用自己资料；可核对命中 Chunk、距离、回答 | 不加 Rerank、Hybrid Search、Query Rewrite、HyDE、GraphRAG、Agentic RAG |
| 3.6 让回答带着来源 | 3.5 的本次检索结果 | Retriever 分配稳定 source id；仅将本次 id 传模型；服务端核验引用，UI 映射标题、片段、位置 | 每条引用可回查到当前 Retrieved Chunk；缺少证据时明确说不知道 | 不允许模型自造文档名、source id 或仅凭 UI 字符串伪造引用 |
| 3.7 判断 AI 功能到底好不好用 | 3.5～3.6 完整链路 | 建 10～20 个含可答与无答案问题的 Eval Set；记录检索命中、引用支持、拒答、延迟和可得 usage/成本 | 可复跑并人工检查错误案例，得出改进依据 | 不引入大型 Evaluation Framework 或自动宣称回答正确 |

## 数据模型草案

- 保留 Stage 2 的 `Resource`、`User`、`Session` 和既有 ownerId 语义。新增 `KnowledgeDocument(id, ownerId, title, content, createdAt, status)`；内容限非敏感粘贴文本或 Markdown。`KnowledgeChunk(id, documentId, position, content, embedding, embeddingModel, embeddingDimension)`，`(documentId, position)` 唯一。`ownerId` 可通过 Document 关联并在每条查询中强制过滤；服务端绝不信任客户端传来的 ownerId。
- Stage 3 V1 的已验收 Embedding baseline 固定为 **1024 维**。`vector(1024)` 由手写 SQL migration 建立，Prisma 6.19.3 Schema 用 `Unsupported("vector")` 表示，向量写入和余弦查询用参数化 `$executeRaw` / `$queryRaw`。切换 Embedding 模型或维度须显式迁移与重建，绝不自动批量重算。
- 引用 ID 由服务端根据本次检索结果的真实 Chunk id 生成，例如 `SRC-CHUNK-123`；回答输出中的每个引用须在本次 Retrieved Set 中，UI 再显示服务端映射的标题、片段、位置。没有可信检索证据时返回“资料中没有足够依据”，不让模型补造。

## Provider 与安全成本边界

内部适配器最小接口为 `generate(input, options)`、`stream(input, options)`、`embed(input, options)`。Chat 与 Embedding 各从服务端 `AI_CHAT_BASE_URL` / `AI_CHAT_API_KEY` / `AI_CHAT_MODEL`、`AI_EMBEDDING_BASE_URL` / `AI_EMBEDDING_API_KEY` / `AI_EMBEDDING_MODEL` 读取，维度取 `AI_EMBEDDING_DIMENSION`；任何 Secret 不使用 `NEXT_PUBLIC_`，不进入浏览器、响应或日志。Mock Provider 可确定性复现并显式返回 `kind: mock`。

**Stage 3 V1 已验收 baseline（2026-10-01）**：阿里云百炼 China (Beijing) Workspace 的 OpenAI 兼容 API；Chat `qwen3.7-flash`；Embedding `text-embedding-v4`，明确请求 `dimensions: 1024`。真实短 Chat、401 映射、流式与取消、结构化校验、1024 维返回及隔离 pgvector Top-K 已通过，证据与限制见 [Phase 0.5 技术记录](stage-3-technical-spike.md)。这是课程验证基线，不要求永久使用同一模型；正式授课前复查型号、地域、价格与账号额度。适配器保留模型环境变量，默认 8 秒超时；本次验收使用服务端可配置的 20 秒上限和关闭思考模式，输出仍限 256 token。

Route 在鉴权后限制单次输入长度与输出 token，设置超时和单用户简单限流；对失败返回受控错误，不自动无限重试。用户取消须传递 AbortSignal。一次最多嵌入受限数量 Chunk，不自动批量重算。日志只记请求 id、状态、耗时、可得 token usage，不记录 Key、完整 Prompt、完整 Provider 响应或真实资料。测试只用非敏感文本，学生可设置账户预算告警。

## 完成标准与 Stage 4 边界

保留 29 节正式课中的 7 节 Stage 3，全部七课的可观察结果都须在同一 Stage 2 产品中复现；至少 3 份非敏感粘贴文档完成向量化和 ownerId 隔离，RAG 引用回查本次 Chunk，10～20 问评估含无答案问题，记录延迟与可得 usage。保存 `stage-3-complete` Git 点。

PDF/DOCX/TXT 上传、多知识库、网页抓取、Hybrid Search、Rerank 均为项目扩展挑战，不是 V1 完成条件。Stage 4 才进入 Tool Calling、Agent Loop、MCP、多步 Workflow、写操作人工确认及恢复；Stage 3 不提前教授或验收这些能力。
