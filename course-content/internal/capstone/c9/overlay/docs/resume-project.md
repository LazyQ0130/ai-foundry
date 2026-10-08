# AI 研究工作台｜AI Research Workspace

面向复杂资料研究的 Agentic Research Workspace，将私人资料、公开研究摘要、可追溯报告和人工确认的知识沉淀组合为产品流程。

- 设计受限 Research Agent，统一 private retrieval 与 MCP 外部摘要；以4 model turns、3 tool calls、10 provider units和120秒 deadline 限制执行，并记录可观察 Steps。
- 实现 PostgreSQL/pgvector 检索、page/offset locator、结构化 Grounded Report 与 Citation Snapshot，限定 claim 引用本次 Evidence，保留来源删除后的历史证据。
- 将 AI 写入拆为 Proposal → Human Review → Atomic Execution，用精确 HMAC绑定、version、事务锁和幂等键控制参数篡改与重复 Note；Workspace 归属由服务端 Session 推导。
- 建立25-case Product Eval，覆盖Functional/Quality/Safety/Reliability；固定synthetic集合 Hit@3 10/10、MRR0.95，八项zero-only Hard Gates为0；完成Docker真实Provider smoke与stale-run恢复验证。

## 使用前核对

以上数字来自 Reference 的固定数据，不是业务准确率/真实用户结果。学生必须替换成自己的实际测试证据，不能原样声称自己已经测过。

当前没有已验证生产 Demo，不写“生产上线”。C8 real词法8/9、optional Judge9/9仍有 lexical_fidelity_flags=1，需人工复核；C9两次真实模型决策失败后受控链路通过，不构成成功率测量。不要虚构效率、用户数或收入。
