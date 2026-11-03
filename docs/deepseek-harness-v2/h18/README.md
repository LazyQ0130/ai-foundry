# H18 内部研发交付

《Session 持久化、恢复与 Fork：如何可靠延续 Agent 的历史？》。2026-11-03；官方固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；课程基线 `97f87c9`。总体 **CONDITIONAL GO**，仅限内部作者交付。

- [正式教材](../../../course-content/internal/deepseek-harness/h18/lesson.md)、[实验入口](../../../course-content/internal/deepseek-harness/h18/lab/README.md)、[HTML预览](reading-preview.html)
- [教学质量报告](quality-review.md)、[验收14项](acceptance.md)、[源码50断言与差异](source-checklist.md)、[测试证据](test-evidence.md)
- [JSONL范围与平台](jsonl-platform-coverage.md)、[Renderer/三宽度](renderer-regression.md)、[知识衔接](knowledge-bridge.md)、[H19交接](h19-handoff.md)、[修订台账](review-log.md)
- [最终保护验收](evidence/validation.json)、[交付hash](evidence/artifact-inventory.json)、[原始执行记录](evidence/)

## 复验与环境

仓库根用Node24、Python及作者依赖：

```powershell
node docs/deepseek-harness-v2/h18/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h18/scripts/final-audit.py
```

run-checks依次核源码、生成断言/同步完整程序、运行实验与错误负例、导图/实际Renderer SSR、内容/Renderer回归/三宽度真实React交互。final-audit要求人工样本hash当前、原保护文件不变、暂存仅H18。已有baseline拒绝覆盖。重新运行会产生新的时间戳证据，图变更后需重新实际看图，不能只重写manual-review冒称完成。

| 环境变量 | 本机默认锚点 |
|---|---|
| HARNESS_SOURCE_CACHE | C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3 |
| HARNESS_GIT_CACHE | C:/Users/QYF/.codex/research/deepseek-harness-f3803c9 |
| H18_DEPS_ANCHOR | C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js |
| H18_ZOD_ANCHOR | C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js |
| H18_NATIVE_ANCHOR | C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js |
| H18_LIMIT_ANCHOR | C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js |

换机先取得固定Git源码并核blob；在**新的隔离研究目录**按H04清单准备基础依赖、Zod4.4.3、Koffi3.1.1，再安装精确p-limit7.3.3、yocto-queue1.2.2、@js-temporal/polyfill0.5.1、jsbi4.3.2。所有直接及传递package按固定pnpm精确条目核name/version/integrity，缺失或漂移拒绝；46条包括其他平台可选包，未安装不等于运行过。不要升级旧缓存或往业务项目安装。

Windows原生Koffi包必须有对应win32-x64预编译件，默认Zstd需Node内置支持。POSIX需要官方native system预编译flock，本轮未安装/运行该路径；不能照抄Windows通过结论。作者浏览器使用AIFOUNDRY_QA_NODE_MODULES与AIFOUNDRY_QA_CHROME，默认前课Playwright缓存和本机Chrome。

实际磁盘root由mkdtemp创建，和代码副本一起位于本轮scratch；不接触用户Home/DSH_HOME或数据库。正常单产物练习只删除一个明确文件，空目录保留；综合/故障复核产物保留。AGENTS明确禁止批量删除，未执行递归清理或清除未知路径。路径清单可由本轮原始记录和保留产物报告审查。

HTML使用实际LessonMarkdown、parser与平台CSS，仅本地映射/course-media；静态页无未水合复制按钮，原生折叠可用，复制在真实React页另验。没有复制正文/答案到public，也未注册线上课、权限、价格、进度或发布状态。H18完成即停止。
