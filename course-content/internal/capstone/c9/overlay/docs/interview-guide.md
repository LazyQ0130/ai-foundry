# 面试回答框架

每题按 **结论 → 为什么 → 实现路径 → 验证证据 → 局限** 说自己的选择。下面是准备提纲，不是标准答案；先打开代码再练习。

| 主题/问题 | 回答框架与代码锚点 | 证据/追问与局限 |
|---|---|---|
| Product：为什么做？为什么不是聊天机器人？ | Product Brief 用户流程→长期Task、多次Run、独立证据与笔记 | 展示实际flow；还有哪些需求被砍？没有用户调研就别编调研结论 |
| Architecture：为什么 modular monolith？ | 一开发者/一部署单元，lib领域模块分开 | deployment ADR；什么时候拆worker？当前同步容量受限 |
| Workspace：为何不直接User→Task？ | 文件/任务/Note共同作用域；lib/workspace.ts | Alice/Bob scoped predicate；V1一人一个，不等于Team/RBAC |
| Task/Run：为什么分离？ | 长期目标vs一次执行；prisma/schema.prisma | 同Task多Run和历史snapshot；不是一次modelcall一个Task |
| RAG：为什么pgvector，chunk如何做？ | 关系归属与vector同DB；lib/knowledge-core.ts、knowledge-retrieval.ts | 800/120、page/offset、model+dimension+READY前置过滤；固定Hit@3不保证新资料分布 |
| Citation：为何snapshot不只chunkId？ | ResearchCitation保存本次允许Evidence及出处 | C8 source deletion实验；snapshot保护历史，不保证模型语义忠实 |
| Agent：为什么不直接LangGraph？ | 复用已学bounded原语；research-runtime.ts | steps/tools/budget/deadline/cancel；不声称framework没价值 |
| MCP：为何不给任意联网？metadata与Evidence差别？ | 固定adapter/endpoint/strictquery；external-contract.ts、crossref-adapter.ts | 有abstract才claimEvidence；公开query授权在private retrieval之前；不是全文论文访问 |
| Security：归属如何证明，model能决定权限吗？ | serverSession→User→Workspace；query predicate独立于model | C8 cross-workspace/strictinput；UI不是证据，单一合成测试不替代持续审查 |
| HITL：为何post-run Action？Edit后token为何失效？ | 已持久化报告提议、canonicalArgs/version/hash绑定；knowledge-write-service.ts | C7/C8 edit/tamper/expiry测试；用户仍需审核内容 |
| Idempotency：双击为何只有一Note？ | locked短事务、sourceActionKey唯一约束 | replay/concurrent/rollback实际DB测试；不能只依赖按钮禁用 |
| Eval：Test与Eval、Hit@3、Hard Gate？ | 实现不变量vs产品行为与质量；eval/metrics.mjs | 25固定cases、10queries、八项zero-only；8/9vsJudge9/9仍需人工复核，不能平均掉泄漏 |
| Production：进程挂了怎么办，为何不Resume？ | scripts/reconcile-stale-runs.mjs十分钟无Step活动→FAILED | dry/apply/repeat/fresh/proposed真实DB测试；需要运维触发，不是自动恢复执行 |
| Deployment：Preview为何不共用生产DB？ | 环境/凭据隔离，releasejob迁移一次 | migrationstatus和smoke证据；cloud当前未验证，要坦诚说明 |

练习：挑三题用60秒回答，实际点开代码和验证记录。追问“你的证据能证明什么、不能证明什么？”如果答不上，先补检查，再润色说法。
