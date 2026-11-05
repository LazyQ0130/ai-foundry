# H24｜大型 Agent 系统测试与综合架构分析

正式蓝图：为一条跨模块链建立事实、测试与限制的证据矩阵。固定源码 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，研发基线 H23 `4d68013`。本轮仅H24及第六模块审查准备，未发布。

**作者侧总体 NO-GO：默认 SDK+HTTP 子进程退出在本机仍有P1原生断言。** 当前23项C9/D14与X均通过，使用公开的运行时测试退出钩子，不能覆盖默认exit分支。完整发行Profile/E、产品Web、真实Provider、性能成本、学员与外审分别未验证。学习负担P2继续保留。

- [教材源码](../../../course-content/internal/deepseek-harness/h24/lesson.md)（仓库内实际路径见下方；该相对展示不用于发布）
- [私有阅读预览](reading-preview.html)：实际LessonMarkdown SSR；折叠可展开，静态页用选择复制，React复制另测。
- [质量报告](quality-review.md)、[证据矩阵](coverage-matrix.md)、[50条固定源码断言](source-checklist.md)。
- [准备与蓝图门禁](preparation.md)、[跨课一致性](knowledge-bridge.md)、[差异/失败与修订](discrepancies.md)、[H25前置交接](h25-handoff.md)。
- [四张SVG源图](figures/source/)、[PNG](figures/)、[Renderer报告](renderer-regression.md)。
- [第六模块审查准备包](module-six-review-prep/README.md)：只有准备材料，非正式审查结论。

教材实际位置：`course-content/internal/deepseek-harness/h24/lesson.md`；可运行实践位于其相邻`lab/`，四项A–D、P补充与X，14份完整程序在正文逐字同步。15道折叠思考含答案、推导、误区、Rubric、知识点，8题明确配置/事件/证据推导。

```powershell
node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs X
node docs/deepseek-harness-v2/h24/scripts/run-checks.mjs content
node docs/deepseek-harness-v2/h24/scripts/run-checks.mjs renderer
node docs/deepseek-harness-v2/h24/scripts/run-checks.mjs visual
```

先读preparation的固定源和依赖锚点。命令从AI Foundry根执行；不在这里运行官方仓库build。原始run/stdout/stderr/trace/程序hash保留，失败不自动Record/Refresh。目录保留，端口/进程必须释放。范围保护以[evidence/validation.json](evidence/validation.json)及提交后检查为准；只提交两个H24目录。
