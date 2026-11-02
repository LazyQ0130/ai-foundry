# DeepSeek Harness第四模块集中教学审查

**最终CONDITIONAL GO。** 2026-11-02；基线`2ba063f`，官方固定`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。作者材料与已覆盖局部行为可交付；无未决确认P0/P1。原生Shell/三平台进程沙箱、真实Web、MCP HTTP、完整Harness E、真实学员与独立外审仍未验证。仅内部审查，未发布，未开发H17。

| 交付要求 | 正式入口 |
|---|---|
| 1–2 总审查与完整结论 | [review-report.md](review-report.md) |
| 3 统一真实工具能力模型 | [23站模型与失败分支](unified-tool-model.md) |
| 4 知识/术语与跨课一致性 | [dependency-matrix.md](dependency-matrix.md)、[五组逐项裁决](technical-consistency.md) |
| 5 安全边界专项 | [safety-review.md](safety-review.md) |
| 6 四类组件与行为 | [family-matrix.md](family-matrix.md) |
| 7 A–E矩阵与语义去重 | [test-evidence.md](test-evidence.md)、[139执行项索引](test-case-index.md)、[机器矩阵](evidence/test-matrix.json) |
| 8 新增局部集成/原始记录 | [cross.test.ts](lab/cross.test.ts)、[A](evidence/cross-A.json)/[B](evidence/cross-B.json)/[C](evidence/cross-C.json)；D复用本轮H16 raw |
| 9 全16图/三宽度 | [figures-review.md](figures-review.md)、[视觉记录](evidence/visual-qa.json) |
| 10 18题100分/完整评分 | [折叠题册](assessment.md)、[互动阅读预览](assessment-preview.html)、[结构化题目](assessment.json) |
| 11 负担/时长 | [workload.md](workload.md)、[可重算口径](evidence/workload.json) |
| 12 问题与修订 | [先行台账](issues-initial.md)、[处置/回归](revisions.md)、[4件原文patch](evidence/necessary-revisions.patch) |
| 13 回归与范围保护 | [acceptance.md](acceptance.md)、[最终验证](evidence/validation.json) |
| 14 制作标准补充 | [第四模块增补](production-standard-module-four-addendum.md) |
| 15 H17–H20前置 | [交接](h17-h20-handoff.md) |
| 16 七层最终GO/条件/未验证 | 总报告首表；不将总体条件当作平台安全或发布许可 |

源码复核：[218条逐项索引](source-assertion-index.md)、[语义范围与文档差异](source-review.md)、[409输入身份](evidence/input-inventory.json)、[50历史run身份](evidence/historical-runs-index.json)。9552文件完整性、90正文链接、110AST为定位/防漂移辅助，不能替代行为和学员证据。

主要结果：136原测试执行项+3新增D通过，C90/D49，归20语义主题；这些数量均不是互不重复安全场景数。MCP为真实SDK本地stdio，Shell/Web/模型有明确替身。16图重导字节相同，12项Renderer、四课+测验15个宽度挂载通过。

唯一原课配套修订是R01：H15/H16 README与run-labs补完整文件传递依赖核验，固定readdirp5.0.0的新隔离树，旧缓存/报告不改。四课正文、lab、原图和历史预览保留。新增模型/测验/证据与必要四件修改独立提交；H01–H12、前三审查、output、业务与用户改动受hash保护。

当前四课私有阅读预览：[H13](h13-reading-preview.html)、[H14](h14-reading-preview.html)、[H15](h15-reading-preview.html)、[H16](h16-reading-preview.html)。实际LessonMarkdown SSR与平台CSS，静态阅读预览移除无水合复制按钮，可选择文本；测验预测控件为本地独立JS，不接产品路由/进度/账号。

复验顺序（仓库根）：`python docs/deepseek-harness-v2/module-four-review/scripts/audit-inputs.py` → `node docs/deepseek-harness-v2/module-four-review/scripts/run-labs.mjs` → `node docs/deepseek-harness-v2/module-four-review/scripts/run-aux.mjs` → `node docs/deepseek-harness-v2/module-four-review/scripts/run-checks.mjs all`。run-labs复制新隔离目录，保留时间戳raw；不运行覆盖旧分课证据的总runner。换机先按分课README准备固定缓存/隔离依赖锚点，文件树用本目录prepare-dependencies.py。无Key/外网实验/原生Shell/批量删除。
