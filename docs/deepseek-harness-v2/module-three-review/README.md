# H09–H12第三模块集中审查

2026-11-02。**最终：CONDITIONAL GO。** 无未决确认P0/P1；作者研发材料及列明真实组件/局部集成可交付。完整Harness E、真实模型性能、学员理解/时长与独立外审仍未验证。未发布、未开发H13。

官方仍锁定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；课程基线至 `325a9b7`。原144项复验+新增5项D通过，共A1/C65/D83；B未独立跑、E未跑。共同Renderer12项，16图及测验三宽度通过。两次新探针失败与修复完整保留。没有确认需要修改原四课正文/图的技术错误，本轮只新增此目录。

| 交付 | 入口 |
|---|---|
| 1 总报告与15最终门禁 | [集中审查总报告](review-report.md)、[最终验收](acceptance.md) |
| 2 统一执行模型 | [25站执行链/分支/类型标注](unified-execution-model.md) |
| 3 知识依赖 | [跨课矩阵与阅读停顿卡](dependency-matrix.md) |
| 4 技术/术语一致性 | [相邻四组交接与八项不变式](technical-consistency.md) |
| 5 源码断言 | [语义复核](source-review.md)、[172项索引](source-assertion-index.md)、[机器身份/引用结果](evidence/source-check.json) |
| 6 A/B/C/D/E | [测试证据矩阵](test-evidence.md)、[144项逐例索引](test-case-index.md) |
| 7 新增验证 | [A/B/C场景、实际事件与模型输入](cross-course-verification.md)、[可运行探针](probes/cross-course.test.ts) |
| 8 配图 | [16图逐张审查](figures-review.md)、[实际看图记录](evidence/manual-review.json) |
| 9 综合测验 | [16题题册](assessment.md)、[详细答案/推导/Rubric/误答](assessment-answers.md)、[折叠交互预览](assessment-preview.html) |
| 10 负担 | [字数/概念/源码/时长及假设](workload.md) |
| 11 问题修订 | [修订前清单](issues-initial.md)、[处置与失败记录](revisions.md) |
| 12 自动回归 | [复现与分级](test-evidence.md)、[baseline运行记录](evidence/baseline/run-labs.json)、[最终内容回归](evidence/final-content/run-content.json) |
| 13 制作标准 | [第三模块增补](production-standard-module-three-addendum.md) |
| 14 后续前置 | [H13–H16衔接说明](h13-h16-handoff.md) |

建议先读统一模型，再独立做综合A–D，对照实际请求与轨迹；技术审阅从源码语义和逐例证据进入。HTML是本地内部预览，无线上课程路由或发布动作。全部作者估时不是实测；自评分与代码绿色不证明学员已经理解。
