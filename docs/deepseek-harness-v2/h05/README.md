# H05｜一切皆插件：Cordis 的设计思想

2026-10-29 内部正式正文研发交付。前序采用第一模块集中修订与作者制作标准 v1.0；官方源码锁定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Cordis `4.0.6-alpha.1`。

**结论：CONDITIONAL GO。** 技术和作者内容审查在本轮范围内通过；真实试读、时长与独立外审未验证。未发布，完成后停止于 H05。

| 交付 | 入口 |
| --- | --- |
| 完整正文 | [lesson.md](../../../course-content/internal/deepseek-harness/h05/lesson.md) |
| HTML 阅读预览 | [reading-preview.html](reading-preview.html)，原生折叠；代码可选择复制 |
| 图一：紧耦合与插件化 | [PNG](figures/rendered/h05-01.png) · [SVG](figures/source/h05-01.svg) |
| 图二：Context、Service、Plugin | [PNG](figures/rendered/h05-02.png) · [SVG](figures/source/h05-02.svg) |
| 图三：最小插件流程 | [PNG](figures/rendered/h05-03.png) · [SVG](figures/source/h05-03.svg) |
| 图源与作者绘制程序 | [draw_figures.py](scripts/draw_figures.py) |
| 两项实践、答案与测试 | 正文含全部；[lab](../../../course-content/internal/deepseek-harness/h05/lab) 保留受测文件 |
| 固定源码核对 | [source-checklist.md](source-checklist.md)、[机器清单](evidence/source-check.json) |
| H04–H05 衔接、H05–H08 边界 | [knowledge-bridge.md](knowledge-bridge.md) |
| 教学质量报告 | [quality-review.md](quality-review.md) |
| H06 交接 | [h06-handoff.md](h06-handoff.md)，仅后续研发输入 |
| 验收与问题修正 | [acceptance.md](acceptance.md)、[review-log.md](review-log.md) |
| 来源许可与限制 | [NOTICE.md](NOTICE.md)、[SOURCE-LICENSE.txt](SOURCE-LICENSE.txt) |

练习 A 是独立 TypeScript 参数注入；B 是真实固定 vendor Cordis 的库级运行，未用 Mock 代替框架。作者运行9项实验测试、错误答案变异与类型负例；Renderer 9项回归；三宽度各检查完整复制、折叠、横滚与原图。技术测试不自动证明理解效果。

在 AI Foundry 根目录按依赖顺序复验（依赖已存在，无需在根安装 Harness）：

```powershell
python -X utf8 docs/deepseek-harness-v2/h05/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h05/scripts/draw_figures.py
node docs/deepseek-harness-v2/h05/scripts/run-labs.mjs
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h05/scripts/make-reading-preview.tsx
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h05/scripts/check-content.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h05/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h05/scripts/check-sources.py
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts
python -X utf8 docs/deepseek-harness-v2/h05/scripts/final-audit.py
```

源码缓存沿用上级 evidence/source-lock.json，换机可用 `HARNESS_SOURCE_CACHE`/`HARNESS_GIT_CACHE` 指定同 Commit。run-labs 将课程文件复制进全新 OS 临时目录，报告保留路径，不清理目录、不读个人 Home/.env/Key。QA 使用已有 Chrome/Playwright，可由 `AIFOUNDRY_QA_CHROME`/`AIFOUNDRY_QA_NODE_MODULES` 指定。重画或改文后必须更新实际审查记录，旧 manual-review 不能替新内容背书。

正文、答案与图片均保留私有研发路径；本机 `/course-media` 映射不是发布。未接课程目录/权限/进度，不改 Stage、Capstone、价格、数据库或发布状态；`output/` 和全部原文件保留。独立提交范围只含两个 h05 目录，不推送。
