# Stage 3 V1.1 Pre-release Polish

## Fixed

- 3.3 全文统一为 idle、pending、streaming、completed、cancelled、failed 六态；原有 checkKey 不变。
- 3.2 的 summary 限制为 200 字符；3.6 的 answered / insufficient answer 分别限制为 300 / 120 字符。Prompt 与 Schema 均使用短输出约束，Provider 继续固定 `max_tokens: 256`。Structured Output 的 `finish_reason: length` 映射为独立、脱敏的 `OUTPUT_TRUNCATED` 错误。
- 3.4 新增可执行的 PostgreSQL 17 + pgvector Docker 路线、独立 Neon 路线和 extension 故障排查。
- 清除七课正文与提示词中的内部开发术语；3.7 以学员阶段自检收尾。
- 新增 Stage 3 Starter，作为中性的 Stage 2 完成版入口。它只对 ACTIVE Stage 3 entitlement 开放，不要求 Stage 2 entitlement。Stage 1 Starter 的权限保持原样。
- 新增 `check:authored-content`，对所有已经写出的课程正文执行解析与全局 checkKey 唯一性检查，并接入 `verify` 和 `check`。
- 增加 Stage 3 独立授权、进度持久化和撤权测试；更新课程 README。
- 在实际风险位置新增 Key、私人资料、Prompt Injection 与评估边界 Warning；补充有教学价值的 Concept、Task 和 DeepDive。
- 新增六张完整 SVG 教学信息图，分别解释模型调用边界、Streaming 取消、向量入库、RAG、Citation 校验和 Evaluation。

## Validation

- **Starter**：从新生成的 ZIP 解压到干净临时目录，执行 `npm install`、Prisma generate、三次 Stage 2 migration、build；注册、登录、Resource CRUD、Alice/Bob 隔离均通过，AI Route 不存在。
- **Docker pgvector**：新建 `pgvector/pgvector:0.8.6-pg17` 容器，`CREATE EXTENSION vector` 成功，`extversion=0.8.6`；独立测试库顺序部署 Stage 2 三次与 Stage 3 第四次正式 migration，状态为最新。Neon 路线沿用已有独立 Neon PostgreSQL 17 Final Acceptance 证据，未额外建立云项目。
- **Structured Output**：Stub 覆盖正常结构、非法 JSON、多余字段、错误 sourceId 与 `finish_reason=length`；截断返回独立受控错误。3.2 `qwen3.7-flash` 真实短文本调用 HTTP 200，Schema 通过，summary 27 字符、tags 3 项、总用量 139 tokens。3.6 真实 Citation 请求 HTTP 200，来源属于检索集合，Chat 用量 380 tokens；资料外问题正确返回 insufficient。
- **Evaluation**：在独立本地数据库使用三篇非敏感资料，真实 12 Case 顺序运行，未并发、未自动重试。8 条可答、4 条依据不足；retrieval 8/8、answered 8/8、refusal 4/4、citation document 8/8、Provider 失败 0；中位耗时 986 ms，最高 1564 ms，Embedding 131 tokens、Chat 5100 tokens。完整模型回答与向量仅留在 Git 忽略的本地运行目录。
- **A/B regression**：Stage 3.1～3.7 共 28 条 Reference 集成命令与 41 条单元测试均通过；Stage 3.2～3.7 的 A/B 构建均通过。
- **Course UI**：七课在内部未发布正文预览中检查桌面和 390px；图、标题、Callout、Starter Resource、代码滚动、Caption 和 Checklist 无明显溢出。七课 Prompt Copy 均显示已复制。真实平台的临时授权课程页也完成正文与资源组件抽查，测试 publication fixture 已恢复。
- **Platform**：`npm run verify` 通过（typecheck、build、70/70 tests、authored content、published catalogue、bundle）；`npm run check` 通过（authored content、published catalogue、两个 Starter ZIP 一致性）。`check:authored-content` 检查 22 篇已写正文及 109 个全局唯一 checkKey；Stage 3 原有 35 个 checkKey 未改变。提交前检查 92 个暂存文件及 ZIP 内 33 个条目，未发现真实 Key、连接 Secret、构建缓存、日志、测试目录或未授权环境文件；`.env.example` 只含已明确标注的本机学习库示例口令。
- **Production Reference**：只同步最终 Implementation A 所需的五个运行文件；Reference build 通过，GitHub `main` 与 Vercel Production Deployment 均对应 `01b330b5e5617a060a6de774382042a1fccf2d90`。正式 HTTPS 上 Chat 200、Structured 200、Streaming 200、Embedding 入库 201 且 1024 维、RAG/Citation 200 且引用属于检索结果。没有在 Production 重跑 12 Case Evaluation。

## Still not validated

- 真人新学员独立完成 Stage 3 全流程。
- 大规模并发和分布式 rate limit。
- 更广的知识包、多地区网络与长期 Provider 可用性。
- PDF、DOCX 等资料类型扩展。
- 模型未来版本的长期稳定性。

Stage 3 七课继续保持 `isPublished: false`；本轮没有发布 Stage 3，也没有开始 Stage 4。
