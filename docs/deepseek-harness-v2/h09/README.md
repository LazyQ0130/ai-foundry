# H09｜Agent 实例如何创建、管理和销毁？

2026-10-29内部正式教材研发。前序基线`d4b6b82`；官方Commit固定`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。采用第一模块制作标准v1及第二模块增补。

**结论：CONDITIONAL GO。** 作者材料与已覆盖的真实局部运行通过，无未决作者P0/P1；学员试读、真实耗时和独立外审待做。只交付H09，不开发H10、不发布，不改变课程状态、权限、价格或数据库。

| 交付 | 入口 |
| --- | --- |
| 完整正文、三实践和七道折叠思考题 | [lesson.md](../../../course-content/internal/deepseek-harness/h09/lesson.md) |
| HTML阅读预览 | [reading-preview.html](reading-preview.html)，实际Renderer静态输出，原生折叠；代码可选择复制 |
| 四图及源文件 | [PNG](figures/rendered)、[SVG](figures/source)、[生成器](scripts/draw_figures.py) |
| 真实局部实验与完整程序 | [lab](../../../course-content/internal/deepseek-harness/h09/lab)、[原始TAP](evidence/lab-tests.txt)、[demo轨迹](evidence/lab-demo.txt) |
| 37条源码断言 | [source-checklist.md](source-checklist.md)、[字节/范围记录](evidence/source-check.json) |
| 测试等级与复验边界 | [test-evidence.md](test-evidence.md)、[运行结果](evidence/lab-results.json) |
| 9项Renderer与三宽度阅读检查 | [renderer-regression.md](renderer-regression.md)、[浏览器QA](evidence/visual-qa.json)、[作者看图](evidence/manual-review.json) |
| H07–H09知识衔接 | [knowledge-bridge.md](knowledge-bridge.md) |
| H10前置交接（仅说明） | [h10-handoff.md](h10-handoff.md) |
| 质量、修订与最终验收 | [quality-review.md](quality-review.md)、[review-log.md](review-log.md)、[acceptance.md](acceptance.md)、[validation.json](evidence/validation.json) |

24项作者行为用例互斥分级为C3、D21。C使用真实Registry及结构Agent/工厂替身；D使用真实AgentLoop、Session和Scope。恢复的存储端仅为作者内存夹具，未运行官方JSONL、磁盘/跨进程恢复、真实模型、完整应用或官方Vitest套件。不能把这些局部PASS写成E级集成通过。

在AI Foundry根按顺序复验，不需要更改产品文件：

```powershell
python -X utf8 docs/deepseek-harness-v2/h09/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h09/scripts/write-source-checklist.py
python -X utf8 docs/deepseek-harness-v2/h09/scripts/check-sources.py
node docs/deepseek-harness-v2/h09/scripts/run-labs.mjs
python -X utf8 docs/deepseek-harness-v2/h09/scripts/draw_figures.py
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h09/scripts/make-reading-preview.tsx
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h09/scripts/check-content.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h09/scripts/preview-and-qa.tsx
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts
python -X utf8 docs/deepseek-harness-v2/h09/scripts/final-audit.py
```

图或正文改变后，重新查看新图并更新manual-review样本哈希，再生成最终记录；旧看图记录不能替新图背书。最终脚本只检查已经实际取得的证据，不生成假的人工审阅或外审结论。

换机可设置`HARNESS_SOURCE_CACHE`、`HARNESS_GIT_CACHE`为同Commit缓存；`H09_DEPS_ANCHOR`指向前课隔离固定依赖的commander入口，`H09_ZOD_ANCHOR`指向隔离Zod 4.4.3入口。运行器逐项核包版本和完整性，并要求Zod完整性出现在固定pnpm-lock。没有在AI Foundry根安装Harness依赖。浏览器沿用`AIFOUNDRY_QA_NODE_MODULES`及`AIFOUNDRY_QA_CHROME`覆盖项。

临时夹具和失败运行都保留，不批量删除。保护快照记录开始时全部已跟踪文件与`output/`字节，最终验收逐一比对。许可与教学改编范围见[NOTICE.md](NOTICE.md)。
