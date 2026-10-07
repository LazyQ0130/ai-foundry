# AI 研究工作台｜产品简报（C1 内部 Reference）

## Problem

研究一个主题时，个人资料、外部公开信息和正在写的报告分散在不同地方。研究者反复搜索、复制、整理；写完后常要重新寻找某句话的出处。缺少可信来源的结论很难复核，也难以安全地沉淀为以后可用的知识。

## Target User

V1 服务一位经常阅读多份资料、补充外部信息并写研究报告的个人研究者。示例场景是开发者调研「AI Agent 在企业知识管理中的应用」；学生可以改成课程论文、行业或竞品研究，但仍先服务一个主要用户和一条个人研究流程。

## Current Workflow

打开已有 PDF/笔记 → 手动搜关键词 → 复制片段 → 打开浏览器补充资料 → 整理笔记 → 写报告 → 被问及依据时回找原文。最痛的三处是资料分散、内部外部证据难以合并、报告结论与来源脱节。

## JTBD

当我要研究一个主题时，我希望系统能利用自己的资料和可信的外部来源整理证据，并生成带引用的研究报告，这样我能更快形成结论，而且能检查重要结论来自哪里。

## MVP

- **Identity**：登录与个人 Workspace，所有私有数据只属于当前用户。
- **Knowledge**：上传文本型 PDF、Markdown、TXT，建立私有资料库并检索相关片段。
- **Research**：创建 ResearchTask；一次任务可有多次 ResearchRun；汇集内部与外部 Evidence，形成报告。
- **Trust**：重要结论带 Citation，可打开 Source Preview；证据不足时明确说明，不编造确定答案。
- **Agent**：有界研究流程，只使用固定的只读研究工具。
- **Write**：Agent 只能提出 KnowledgeNote；人查看准确内容后批准、编辑或拒绝。
- **Engineering**：Run Timeline、Eval 和可复现的生产部署。

## Non-goals

V1 不做 Multi-Agent、团队/RBAC、OCR、Browser Agent、任意网页抓取、Mobile App、Payment、复杂异步 Queue、多模型路由、Marketplace 或无人批准的高风险写入。OCR 会引入扫描质量与识别异常；多人协作需要新的权限模型；多个 Agent 目前没有被核心任务证明有必要。这些是当前版本的范围决定，不是永久禁令。

## User Flow

登录 → 进入个人 Workspace → 加入资料 → 创建 ResearchTask → 发起 ResearchRun → 查看内部/外部 Evidence → 阅读带引用的 Report → 检查来源 → 批准、编辑或拒绝 Note Proposal → 回看 Run Timeline 与已保存的 KnowledgeNote。详情与失败分支见 `docs/user-flow.md`。

## Success Criteria

- 用户能完成「资料 → 研究任务 → 报告 → 引用检查 → 是否保存」的完整流程；刷新后任务与结果仍在。
- 每条展示的关键 Citation 都能回到本次研究保存的 Evidence 快照；资料重索引或删除后，历史报告仍能说明当时引用的内容。
- `cross_workspace_leaks = 0`，`unapproved_writes = 0`；重复确认不会产生重复笔记。
- Run 的成功、失败、取消、等待确认均有可理解状态，用户知道下一步能做什么。
- 项目可部署、可复现、可演示，作者能解释产品范围与工程取舍。

## Open Questions

- 哪类外部只读来源最适合主要用户？C6 以真实可用性和来源质量决定，不预设单一 API。
- 扫描或加密 PDF 怎样向用户解释失败并允许重试？C3 定义状态与提示，不加入 OCR。
- 用户如何判断一条报告结论需要更弱的表述？C4 通过证据充分性与拒答案例验证。
