# H14｜工具执行流水线：从模型调用到结果返回

作者侧结论：**CONDITIONAL GO**。正式稿和覆盖范围的技术验证完成；学员试读、实测时长、独立外审及E级完整应用仍待验证。只完成H14，没有开发H15或发布课程。

| 交付 | 入口 |
| --- | --- |
| 正式正文、四实践、十道折叠题 | [lesson.md](../../../course-content/internal/deepseek-harness/h14/lesson.md) |
| 实际Renderer的HTML阅读页 | [reading-preview.html](reading-preview.html) |
| 四张原创SVG/PNG及生成器 | [figures](figures/)、[draw_figures.py](scripts/draw_figures.py) |
| 完整实验程序与测试 | [lab](../../../course-content/internal/deepseek-harness/h14/lab/) |
| 固定Commit的53条源码断言 | [source-checklist](source-checklist.md)、[source-lock](evidence/source-lock.json) |
| C32+D13=45项真实检查 | [test-evidence](test-evidence.md)、[原始TAP](evidence/lab-tests.txt)、[完整对象与轨迹](evidence/practice-output.json) |
| Renderer/三宽度与交互 | [说明](renderer-regression.md)、[visual-qa](evidence/visual-qa.json)、[作者看图](evidence/manual-review.json) |
| H12–H14衔接与重复 | [knowledge-bridge](knowledge-bridge.md) |
| H15前置交接，仅说明 | [h15-handoff](h15-handoff.md) |
| 教学质量与研发修订 | [quality-review](quality-review.md)、[issue-log](issue-log.md) |
| 保护范围与文件哈希 | [validation](evidence/validation.json)、[artifact-inventory](evidence/artifact-inventory.json) |

已准备本机依赖时，在仓库根运行：

```powershell
node docs/deepseek-harness-v2/h14/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h14/scripts/write-reports.py
python -X utf8 docs/deepseek-harness-v2/h14/scripts/final-audit.py
```

run-checks顺序核源、同步六份完整程序、生成图和预览、运行C/D与故意错误答案、检查AST/内容、跑既有Renderer与浏览器交互。每次保存参数、退出值、stdout/stderr和输入哈希；原始失败保留。作者看图单独进行，脚本不替代视觉审阅。prepare.py为初始脚手架，已拒绝覆盖成品；snapshot.py拒绝覆盖已有保护基线。

实验使用Node24.16.0、本仓库已有tsx、独立官方源码缓存，锁定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。换机时准备包含该commit的官方checkout，`HARNESS_SOURCE_CACHE` 指向源文件，`HARNESS_GIT_CACHE` 指向其Git仓库；check-sources以ls-tree核Git blob，再写SHA256。不要换成最新分支。

独立依赖目录可用以下固定版本准备，安装时使用 `--ignore-scripts --save-exact`，不在AI Foundry安装另一套Harness：

```powershell
npm install --ignore-scripts --save-exact commander@15.0.0 js-yaml@4.3.2 @eslint-community/regexpp@4.12.2 ajv@8.20.0 node-addon-require-builtin@0.1.9 resolve.exports@2.0.3 semver@7.8.5
```

`H14_DEPS_ANCHOR` 指向该目录的 `node_modules/commander/index.js`。另在新隔离目录安装 `zod@4.4.3 --ignore-scripts --save-exact`，`H14_ZOD_ANCHOR` 指向其 `node_modules/zod/index.js`。传递版本与integrity必须符合 H04 [probe-dependencies](../h04/evidence/probe-dependencies.json)和本课[Zod记录](evidence/zod-dependency.json)；未来解析不同时会明确失败，应按锁对齐，不能放宽验证。默认复用仓库外H04/H09缓存。

每次实验在新OS临时目录复制完整lab，写新fixture-home，使用锁定tsconfig与Node resolve hook。最小环境不传模型凭据；业务只整理代码内字符串，没有文件/Shell/Web能力。目录保留，不删除文件或目录。scratch中可沿相同tsx、`--tsconfig tsconfig.json --import bootstrap.mjs` 单独运行demo或 `--test pipeline.test.ts`。

本课B实际使用完整局部链路，因此记D而非按实践字母记B；C里的scheduler与D_internal使用Native实例私有pipeline作故障注入，仿照官方tool-calls测试。这不是公开API、不改变官方源码，也不是自制调度器替代实现。

QA使用既有Chrome/Playwright，可设 `AIFOUNDRY_QA_CHROME` / `AIFOUNDRY_QA_NODE_MODULES`。静态HTML移除未水合复制按钮，保留原生折叠，图片映射相邻文件；真实复制等交互由实际React挂载验证。没有修改产品路由、媒体部署或数据库。许可见[NOTICE](NOTICE.md)。
