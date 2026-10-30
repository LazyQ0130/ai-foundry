# H11｜System Prompt：从插件贡献到模型真正看到的上下文

作者侧结论 **CONDITIONAL GO**。正式正文和本轮验证已完成，无已知未决作者P0/P1；学员试读、实际学习时长、独立外审与完整Harness集成均未验证。此结论不代表发布批准。本轮未发布，也未开发H12。

官方源码固定为 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Harness `0.2.2-alpha.2`、Cordis `4.0.6-alpha.1`。实验直接导入锁定源码，没有改写SystemPrompt算法。真实公共模型请求到达官方MockAdapter即为本节观察终点。

| 交付 | 入口 |
| --- | --- |
| 正式完整正文 | [lesson.md](../../../course-content/internal/deepseek-harness/h11/lesson.md) |
| 实际Renderer静态阅读页 | [reading-preview.html](reading-preview.html)，折叠可用，代码可选择复制 |
| 四张图与可再生成源文件 | [SVG](figures/source)、[PNG](figures/rendered)、[Python生成器](scripts/draw_figures.py) |
| 四项实践、完整程序、折叠参考答案 | [实验目录](../../../course-content/internal/deepseek-harness/h11/lab)、正文实践A–D |
| 十道折叠思考题 | 正文“十道思考题”；排序、求值、抑制、工具、作用域、清空均要求推导 |
| 48条源码断言 | [source-checklist.md](source-checklist.md)、[机器清单](evidence/source-assertions.json) |
| 40项真实行为测试与原始轨迹 | [test-evidence.md](test-evidence.md)、[TAP](evidence/lab-tests.txt)、[完整原始结果](evidence/lab-results.json)、[实践输出](evidence/practice-output.json) |
| 9项Renderer及新增检查 | [renderer-regression.md](renderer-regression.md)、[TAP](evidence/renderer-tests.tap) |
| 1440／390／320与交互 | [浏览器证据](evidence/visual-qa.json)、[21项作者看图记录](evidence/manual-review.json) |
| H10→H11衔接、重复审查 | [knowledge-bridge.md](knowledge-bridge.md) |
| 仅交接H12前置能力 | [h12-handoff.md](h12-handoff.md) |
| 教学质量、修订、验收 | [quality-review.md](quality-review.md)、[review-log.md](review-log.md)、[acceptance.md](acceptance.md) |

最终互斥计数为 **C25、D15**。C使用真实SystemPrompt、Cordis与Scope，部分Schema是固定测试数据；D使用真实AgentLoop、SystemPrompt、Session、LLM Runtime，必要时使用真实Tools与NativeExecutor。模型使用逐字节保留的官方MockAdapter，工具只返回固定文本。A独立模拟器、B独立Cordis专项、E完整应用均未运行；Cordis在C/D中实际运行但不重复计数。官方Vitest用例只选读，没有声称整套上游测试通过。

从仓库根目录复现（依赖已经准备好；不运行安装或清理命令）：

```powershell
python -X utf8 docs/deepseek-harness-v2/h11/scripts/check-sources.py
node docs/deepseek-harness-v2/h11/scripts/run-labs.mjs
python -X utf8 docs/deepseek-harness-v2/h11/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h11/scripts/write-source-checklist.py
node --import tsx docs/deepseek-harness-v2/h11/scripts/make-reading-preview.tsx
node --import tsx docs/deepseek-harness-v2/h11/scripts/check-content.ts
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts
python -X utf8 docs/deepseek-harness-v2/h11/scripts/draw_figures.py
node --import tsx docs/deepseek-harness-v2/h11/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h11/scripts/final-audit.py
```

修改正文、图或重新截屏后，必须重新看图并更新manual-review，不能复制旧的人工通过结论。脚本保留OS临时夹具，不批量删除文件。源码缓存由 `HARNESS_SOURCE_CACHE` 指定，默认路径记录于source-lock；依赖锚点可用 `H11_DEPS_ANCHOR`、`H11_ZOD_ANCHOR` 覆盖，默认复用H04隔离依赖与H09 Zod缓存。路径中的H09不是本轮测试等级。浏览器依赖可用 `AIFOUNDRY_QA_NODE_MODULES` 指定；当前使用已安装Playwright与Chrome。具体版本与integrity见原始结果、[Zod记录](evidence/zod-dependency.json)及H04依赖清单。

[准备阅读记录](evidence/preparation.json)记录蓝图、两次模块审查及衔接材料；[最终验收](evidence/validation.json)核对3716个已有文件（含915个output文件）未变；[文件清单](evidence/artifact-inventory.json)记录交付物哈希。版权与复制范围见[NOTICE](NOTICE.md)。本包只位于H11两个目录，未接入线上课程目录。
