# Stage 3.6 可验证来源验收（2026-10-01）

## 范围与实现

从 3.5 A/B 参考项目增量复制。3.1～3.5 的接口、Resource CRUD、A/B 页面差异、Prisma schema 与四次 migration 保留；没有新增数据库表或迁移。`/api/knowledge/retrieve` 仍可独立观察 Top-3；`/api/knowledge/ask` 在 ownerId、ready、模型、维度约束的 Top-3 后，由服务端把实际 chunkId 变成 `SRC-CHUNK-<id>`。真实 Chat 复用原 Provider `generate()` 的 structured 模式。Mock 固定选择实际 Top-1 ID，经过同一 JSON.parse、Zod strict、去重、当前 Retrieved Set 成员检查。来源标题、位置和短预览只由本次 Retrieved Chunk 映射；不按模型 ID 查询任意数据库行。

严格结果分为 `answered`（非空回答，最多 1500 字符，1～3 个唯一 sourceIds）与 `insufficient`（非空回答，最多 500 字符，空 sourceIds）。任何未知 ID、当前 Top-3 外 ID、Bob 私有 ID、重复或错误结构都返回受控 502，不泄露模型原文。无兼容 Chunk 直接返回 `insufficient`，不调用 Chat。页面分开显示 Retriever 的「本次检索命中」和验证后的「回答实际引用」。

## 本地 A/B 与回归

- A/B Next.js 15 生产构建均通过。`rag-reference.test.mjs` 两版均通过：401/403、输入与限流、空库、Mock/Real 隔离、ownerId/ready/model/dimension/cosine Top-3、Provider 错误、Mock Citation 与来源映射。
- Stub 强制返回不存在的 `SRC-CHUNK-999999`、真实但不在 Top-3 的 Chunk、Bob 私有 Chunk，均受控拒绝。answered 空来源、insufficient 带来源、重复、超过三项、额外模型字段、代码围栏、坏 JSON 与未知状态均拒绝；insufficient 空来源通过。sourceId 纯规则单测验证相同 id 稳定，0、负数、小数、非有限和非安全整数被拒绝。
- 继承的 3.1～3.3 reference 两版通过：普通回答、严格建议、流式与取消、认证、同源、限流、Provider 错误、Resource 隔离。3.4 文档入库 reference 两版通过；知识/流式单测 6/6，Citation ID 单测 1/1。
- 隔离 Docker PostgreSQL 17 + pgvector 0.8.6 的 `stage3_l6_test` 已有原四次 migration，`prisma migrate deploy` 无待执行迁移。未连接平台或生产数据库。

## 北京地域真实模型

在被 Git 忽略的本地 `.env` 中使用百炼北京地域 Workspace。Alice 入库三篇短的非敏感 Git、PostgreSQL、Cookie 文档；Bob 单独入库高相关合成私有文档。Chat 为 `qwen3.7-flash`，Embedding 为 `text-embedding-v4`、1024 维。

| 场景 | 实测摘要 |
| --- | --- |
| 资料内：保存代码版本 | HTTP 200；Top-3；Top-1 `Git 学习笔记` Chunk 0，similarity 0.7444；`answered`，1 个来源；全部来源属于本次返回的 Top-3，至少一个为 Git，标题/位置/预览与 Alice 的真实 Chunk 一致；Bob 私有标题未进入命中；回答非空且提及 Git |
| 资料内耗时 / 用量 | Query Embedding 94 ms / 9 tokens；Chat 706 ms / 368 tokens；总计 807 ms |
| 资料外：量子计算纠错 | HTTP 200；仍有 Top-3；`insufficient`，0 个来源；Chat 933 ms / 363 tokens；总计 1020 ms |

真实调用输出仅含状态、数量、标题、用量与耗时摘要；没有打印完整向量、回答、内部 Prompt、Key 或 Provider 原始响应。上述一次资料外拒答只说明这次结果，不能推断模型始终正确拒答。服务端成员检查保证来源来自本次检索，**不能保证来源支持回答的每一句话**；后者留给 3.7。

## 平台与页面

`npm run verify` 成功，平台原有测试 67/67；`npm run check` 成功，Starter ZIP 与源文件一致。Stage 3 仍为 7 节且全部 `isPublished: false`，正式课总数仍为 29。Stage 1/2/4、Starter、教学图片、平台 Auth/支付/权益未修改。

两段 3.6 Prompt 的 Copy 均在浏览器实际点击并粘贴校对；桌面和 390px 的课程正文、代码块与提示词排版可阅读，窄屏代码块在自身容器横向滚动。A 版参考页在 390px 用 Mock 建立短 Git 文档并提问，实际看到 `回答实际引用` 与 `本次检索命中` 两张不同卡片，按钮与来源内容均在卡片内显示。B 版共用该组件并通过构建与 API 验收。

独立云 PostgreSQL 的 pgvector extension 权限与增量 migration **仍未验收**；本轮仅验证本地隔离数据库。没有做逐句 inline citation、RAG streaming、质量自动打分或 3.7 Evaluation。
