# 项目复盘

先用自己的经历填写，不让 AI 虚构用户反馈。以下是 Reference 的可追溯取舍及学生问题。

## 最初砍掉哪些需求？

V1 不做 Team/Membership/RBAC、OCR、任意联网工具、自动知识写入。对照 product-brief.md：你自己的 Non-goals 哪些真的减少了成本？

## 哪些技术选择经验证成立？

monolith 串起完整链路；PostgreSQL 统一归属、事务与pgvector；Citation Snapshot 与原资料生命周期分离；写入在Agent之外经人工批准。这里“成立”指当前测试证据，不是行业唯一方案。

## Eval 暴露了什么？

固定25 cases通过不能替代真实语义复核。C8词法8/9、optionalJudge9/9仍保留1个fidelityflag。C9真实模型两次MODEL_FAILED后受控smoke通过，不能把一次成功当稳定性统计。依赖发布日期也改变安全审计结果；build成功不是安全保证。

## 重做会改什么？

根据自己最难定位的真实故障选择一个改进，写成本和验收方法。Reference 优先补Provider响应分类与更稳定的真实质量样本，而非盲目增加框架；当前仍fail closed，不放宽结构校验来提高通过率。

## 用户量扩大100倍，先改哪里？

先测请求时长/并发/DB连接和费用；同步Research可能首先需要Queue/Worker。再考虑分布式rate limit、observability。不是马上拆所有微服务；这些未来方案本课不实现。

## 如果变成团队产品？

显式Team/Membership/Role政策、资源分享、邀请撤销、审计、迁移当前owner语义；先写权限矩阵和跨角色测试，不把workspaceId变为客户端可信字段。

## KnowledgeNote 回到RAG怎样避免自反馈污染？

区分原始证据与AI派生Note，保留来源/版本/批准记录；建立独立索引入口与可撤销状态，检索时标记派生证据，防止把自身旧结论当独立佐证。先构造污染/撤销Eval再实现Note indexing。当前Notes不回流RAG。

## 交付债务

云生产HTTPS/R2/CORS、备份恢复、回滚和平台实际HTTP时限仍待验证。只有补足这些证据才能改Production Ready。下一轮仍要Final Capstone Release Readiness Audit；课程未解锁。
