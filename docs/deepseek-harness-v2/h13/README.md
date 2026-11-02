# H13｜Tool Registry：工具定义、Schema、作用域与步骤准入

作者侧结论：**CONDITIONAL GO**。正式稿、四图、实践及覆盖范围内的技术验证完成；学员试读、实测时长、独立外审与 E 级完整应用集成仍待验证。没有开发 H14，没有发布课程。

| 交付 | 入口 |
| --- | --- |
| 正式正文、四项实践与十道折叠题 | [lesson.md](../../../course-content/internal/deepseek-harness/h13/lesson.md) |
| HTML 阅读页 | [reading-preview.html](reading-preview.html)，实际 Renderer 的静态输出，折叠可用 |
| 四张原创图与生成器 | [figures](figures/)、[draw_figures.py](scripts/draw_figures.py) |
| 七步示例与完整程序 | [lab](../../../course-content/internal/deepseek-harness/h13/lab/) |
| 固定源码逐条断言 | [53 条断言](source-checklist.md)、[字节锁](evidence/source-lock.json) |
| C31 + D6 真实检查 | [证据说明](test-evidence.md)、[TAP](evidence/lab-tests.txt)、[完整输出](evidence/practice-output.json) |
| 既有 Renderer、内容/AST 与交互 | [renderer-regression.md](renderer-regression.md)、[visual-qa](evidence/visual-qa.json) |
| H11–H13 衔接与重复审查 | [knowledge-bridge.md](knowledge-bridge.md) |
| H14 前置交接，仅说明 | [h14-handoff.md](h14-handoff.md) |
| 教学质量与修订 | [quality-review.md](quality-review.md)、[issue-log.md](issue-log.md) |
| 保护范围与交付哈希 | [validation.json](evidence/validation.json)、[artifact-inventory.json](evidence/artifact-inventory.json) |

已准备依赖的本机，从仓库根运行 `node docs/deepseek-harness-v2/h13/scripts/run-checks.mjs`，顺序核源、同步折叠程序、运行实验、生成预览、检查 AST/SSR、跑既有 Renderer 与浏览器交互。每次运行保存参数、退出值、stdout/stderr、输入哈希；旧记录保留。`prepare.py` 是研发初始脚手架，已加防覆盖；不要用它重建正式程序。`snapshot.py` 也拒绝覆盖起始保护基线。

实验锁定官方 Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；Node 24.16.0，使用本仓库既有 tsx。换机时准备独立官方 checkout，设置 `HARNESS_SOURCE_CACHE` 和 `HARNESS_GIT_CACHE` 分别指向源文件与含该 commit 的 Git 仓库。check-sources 使用该 commit 的 ls-tree 核对每个 Git blob，再写 SHA256；不要改用最新分支。

依赖安装只在新建、明确的独立目录进行，不在 AI Foundry 增加 Harness 依赖。可按以下版本准备隔离 npm 项目（`--ignore-scripts`），其 lock 必须通过运行器与固定 pnpm-lock 的 integrity 核对：

```powershell
npm install --ignore-scripts --save-exact commander@15.0.0 js-yaml@4.3.2 @eslint-community/regexpp@4.12.2 ajv@8.20.0 node-addon-require-builtin@0.1.9 resolve.exports@2.0.3 semver@7.8.5
```

将 `H13_DEPS_ANCHOR` 指向该目录的 `node_modules/commander/index.js`。另一个隔离目录安装 `zod@4.4.3 --ignore-scripts --save-exact`，将 `H13_ZOD_ANCHOR` 指向其 `node_modules/zod/index.js`。完整传递依赖期望在 H04 的 [probe-dependencies](../h04/evidence/probe-dependencies.json)，Zod 在 [记录](evidence/zod-dependency.json)。未来 registry 若解析出不同的传递版本，核验会明确失败；先按锁定清单对齐，不放宽断言。

默认锚点复用仓库外 H04/H09 的隔离安装。每次实验创建新 OS 临时目录、最小环境与 fixture-home，复制完整 lab，再用锁定 tsconfig 和 Node resolve hook 导入真实包。目录保留，不运行删除或上游递归清理。运行器给出的 scratch 中可用同一 tsx、`--tsconfig tsconfig.json --import bootstrap.mjs` 单独运行 demo 或 `--test registry.test.ts`；这些函数文件也可由自己的入口 import 后调用。

浏览器 QA 使用既有 Playwright 与 Chrome，可设 `AIFOUNDRY_QA_NODE_MODULES` / `AIFOUNDRY_QA_CHROME`。HTML 是私有审阅页，图片映射到相邻文件，不改教材 `/course-media` 路径或产品路由。静态页移除没有水合的复制按钮；真实复制、键盘与原图交互由挂载后的实际 LessonMarkdown 验证。作者看图另存记录，不称作独立外审。

最后运行 `python -X utf8 docs/deepseek-harness-v2/h13/scripts/final-audit.py` 核已有文件与暂存范围。许可见 [NOTICE](NOTICE.md)。
