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

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
