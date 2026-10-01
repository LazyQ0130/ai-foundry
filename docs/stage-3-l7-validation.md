# Stage 3.7 固定小型 RAG Evaluation 验收（2026-10-01）

## 范围

从 3.6 A/B 快照继续。正式用户的 API、页面、Provider、检索 SQL、Citation Schema、Prisma schema 和原四次 migration 均未修改；没有新增 Eval 数据表或公开评估按钮。固定知识包为三篇非敏感短资料：Git、PostgreSQL、Cookie / Session。Eval Set 固定 12 题，其中 8 题可答、4 题无答案；无答案题包含与资料领域接近、但资料未覆盖的问题。Runner 登录隔离本地账号，顺序调用现有 `POST /api/knowledge/ask`，两题间至少 13 秒，不自动重试。真实调用需显式 `EVAL_REAL_CONFIRM=YES`。

自动指标分别计算：预期文档进入 Top-K、可答题状态、无答案拒答、最终来源是否包含预期文档、服务端已验证来源、每段耗时和 Token Usage。它们不是回答正确率，也不合成单一分数。`unsupported_generation` 与 `citation_support_problem` 由人工对照完整回答和实际来源后判断；Runner 不让模型给自己评分。详细 JSON 和人工复核 Markdown 仅保存在被 Git 忽略的 `.runtime/`，不写正式用户数据库；终端只打印安全摘要。

## 工具与 Mock

`rag-eval-core.test.mjs` 的 5 个用例通过：非法题集、重复 ID、缺少可答或无答案题、检索/状态/预期文档引用分别计算、失败分类、耗时中位数和最大值、null usage，以及未显式确认时阻止真实付费调用。来源 ID、知识切块及流式单测共 7/7。Mock 第一轮完整跑完 12 题，验证报告写入 `.runtime` 与 429 的 `provider_failure` 分类：刚入库三篇资料后立刻评估，前几题撞上同一用户的 5 次/分钟限流。验收流程因此在**入库后等待 61 秒**，没有更改生产限流，也没有自动重试。

修正验收准备节奏后的第二轮 Mock：12/12 完成、Provider 失败 0，预期文档进入 Top-K 8/8，可答题状态 8/8，无答案拒答 0/4，预期文档来源 2/8。Mock 固定引用 Top-1、不会真正判断资料是否足够，这些质量数字不代表真实 RAG 表现；它们证明 Runner 会把不同指标分别记录、不会把 Mock 包装成全绿。

## 北京地域真实 12 题

使用被 Git 忽略的本地 `.env`，Chat 为 `qwen3.7-flash`，Embedding 为 `text-embedding-v4`、1024 维；仅连接本地隔离 Docker PostgreSQL 17 + pgvector 0.8.6 的 `stage3_l7_test`。原四次 migration 从空库部署成功。知识包入库并等待限流窗口结束后，一次顺序运行 12 题，无并发、无自动重试。

| 独立指标 | 本次结果 |
| --- | ---: |
| 预期文档进入 Top-K（可答） | 8/8 |
| 可答题返回 answered | 8/8 |
| 无答案题返回 insufficient | 4/4 |
| 最终来源包含预期文档（可答） | 8/8 |
| 服务端验证来源的响应 | 12/12 |
| Provider 失败 | 0 |
| 总耗时中位数 / 最大值 | 934.5 ms / 1255 ms |
| Embedding tokens 合计 | 131 |
| Chat tokens 合计 | 4848 |
| Usage 缺失 | 0 |

人工逐条核对 8 条 `answered` 的完整回答与真实 Citation preview，核心结论均由引用片段直接支持：**supported 8，unsupported 0，uncertain 0**。四条无答案题无来源卡片。该轮没有真实失败案例；没有为了 Eval Set 改产品逻辑或 Prompt。三篇短资料和 12 道题只能构成小型课程验收，不能推断其他资料、问法或长期可靠性。详细答案和复核备注只在本机 `.runtime`，未写入此文档。

## 回归、页面与边界

3.1 普通问答、3.2 结构化建议、3.3 流式取消与 Resource 隔离的 A/B reference tests 均通过；3.4 入库 reference A/B 均通过；3.5 Top-K 与 3.6 伪造、非 Top-K、Bob 私有引用等测试 A/B 均通过。A/B Next.js 生产构建通过。平台 `npm run verify` 的原有测试 67/67，`npm run check` 通过；Stage 3 仍为 7 节、全部未发布，正式课总数 29，Starter 不变。Stage 1/2/4、课程图片、平台 Auth/支付/权益未修改。

两段 3.7 Prompt 的 Copy 已实际点击并粘贴核对；桌面与 390px 的正文、代码块和提示词可阅读，窄屏代码块在自身容器滚动。独立云 PostgreSQL 的 pgvector extension 权限与四次 migration **仍未验收**，留给单独的 Stage 3 Final Acceptance；本轮未发布 Stage 3，也未开始 Stage 4。
