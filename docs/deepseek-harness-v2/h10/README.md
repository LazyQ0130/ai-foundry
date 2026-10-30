# H10｜Agent Loop：Turn、Step 与任务执行状态机

2026-10-30内部正式教材研发。基线`e7dc928`；官方固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。沿用第一模块制作标准v1及第二模块增补。

**作者内容与列明局部验证：GO；总体CONDITIONAL GO。** 没有已知未解决作者P0/P1；真实试读、耗时和独立外审仍PENDING。条件来自证据范围，不能用来放行已知技术错误或理解障碍。只交付H10，停止于本课，不开发H11或发布。

| 交付 | 入口 |
| --- | --- |
| 正文、四项实践、八道折叠思考题 | [lesson.md](../../../course-content/internal/deepseek-harness/h10/lesson.md) |
| 实际Renderer静态阅读页 | [reading-preview.html](reading-preview.html)，折叠可用，代码可选择复制 |
| 四图、矢量源与生成器 | [PNG](figures/rendered)、[SVG](figures/source)、[draw_figures.py](scripts/draw_figures.py) |
| 真实实验程序与答案校验 | [lab](../../../course-content/internal/deepseek-harness/h10/lab)、[TAP](evidence/lab-tests.txt)、[完整demo](evidence/lab-demo.txt)、[结构化轨迹](evidence/trace-fixtures.json) |
| 40条固定源码断言 | [source-checklist.md](source-checklist.md)、[源码锁](evidence/source-lock.json)、[引用核对](evidence/source-check.json) |
| 31项行为用例的等级与局限 | [test-evidence.md](test-evidence.md)、[原始结果](evidence/lab-results.json) |
| 9项Renderer、三宽度与作者看图 | [renderer-regression.md](renderer-regression.md)、[浏览器证据](evidence/visual-qa.json)、[看图记录](evidence/manual-review.json) |
| 跨课与重复审查 | [knowledge-bridge.md](knowledge-bridge.md) |
| H11前置交接，仅说明 | [h11-handoff.md](h11-handoff.md) |
| 质量、修订、保护验收 | [quality-review.md](quality-review.md)、[review-log.md](review-log.md)、[acceptance.md](acceptance.md)、[validation.json](evidence/validation.json) |

本轮互斥分级为C4、D27。C是实际Inbox/AssistantStream组件；D是实际Loop+Session+LLM Runtime+Tools，模型使用逐字节保留的官方MockAdapter，工具只返回代码内固定字符串。A独立模拟器、B独立Cordis专项和E完整应用均未运行；真实Cordis已包含在C/D，不重复计数。官方Vitest只选读，不声称整套官方测试通过。

在AI Foundry根顺序复验（不改产品代码或依赖）：

```powershell
python -X utf8 docs/deepseek-harness-v2/h10/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h10/scripts/write-source-checklist.py
python -X utf8 docs/deepseek-harness-v2/h10/scripts/check-sources.py
node docs/deepseek-harness-v2/h10/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h10/scripts/run-labs.mjs course-content/internal/deepseek-harness/h10/lab/answer.reference.json
node docs/deepseek-harness-v2/h10/scripts/run-labs.mjs course-content/internal/deepseek-harness/h10/lab/answer.multi.reference.json multi
python -X utf8 docs/deepseek-harness-v2/h10/scripts/draw_figures.py
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h10/scripts/make-reading-preview.tsx
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h10/scripts/check-content.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h10/scripts/preview-and-qa.tsx
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts
python -X utf8 docs/deepseek-harness-v2/h10/scripts/final-audit.py
```

默认读取本机`.codex/research`里已存在的固定源码/依赖缓存，不访问个人Harness Home。跨机器先准备同Commit完整Git缓存及源码工作副本，分别设`HARNESS_GIT_CACHE`、`HARNESS_SOURCE_CACHE`。check-sources将1592份文件与指定Git tree的blob逐项比较；运行前再次比较SHA256。它不从main自动取新源码。

隔离依赖清单沿用[H04固定清单](../h04/evidence/probe-dependencies.json)。在仓库外单独npm工程按该清单的精确name@version安装，再设`H10_DEPS_ANCHOR`为该工程`node_modules/commander/index.js`绝对路径；运行器核该工程package-lock里每项version/integrity。在另一个隔离工程安装`zod@4.4.3`，设`H10_ZOD_ANCHOR`为其`node_modules/zod/index.js`绝对路径；完整性必须出现在固定pnpm-lock。默认复用H09已隔离的Zod目录，没有修改本仓库package.json或node_modules。依赖缺失应报错，不能改用最新包求通过。

本次Node 24.16.0、Python 3.14.2，根仓库已有tsx等前端依赖。浏览器QA用`AIFOUNDRY_QA_NODE_MODULES`指向含playwright的独立运行时，`AIFOUNDRY_QA_CHROME`可指定Chrome；默认值在脚本中。QA只开localhost临时服务，结束关闭服务/浏览器，文件与夹具不删除。

两个H10目录的局部.gitattributes保留文件原字节，避免Windows检出时行尾转换破坏官方fixture与证据哈希；根仓库和旧课的行尾规则不变。

正文、图或程序改变后，重新同步并跑受影响检查，实际查看新截图，再更新manual-review样本哈希。最终脚本只核已有证据；不能生成虚假的看图、试读或外审。完整HTML保持私有，不接课程目录、数据库、价格、权限或发布状态。来源与许可见[NOTICE.md](NOTICE.md)。
