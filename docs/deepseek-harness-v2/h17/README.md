# H17 内部研发交付

《Session Event Sourcing：Agent 的历史为何可以重建？》。固定官方Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Harness0.2.2-alpha.2 / Cordis4.0.6-alpha.1。作者侧总体 **CONDITIONAL GO**，不代表课程发布批准。

- [正式教材](../../../course-content/internal/deepseek-harness/h17/lesson.md)、[四实践与综合实验](../../../course-content/internal/deepseek-harness/h17/lab/README.md)、[HTML阅读预览](reading-preview.html)
- [质量报告](quality-review.md)、[验收清单](acceptance.md)、[源码38项](source-checklist.md)、[测试与分级](test-evidence.md)
- [Renderer及三宽度](renderer-regression.md)、[知识衔接](knowledge-bridge.md)、[H18前置交接](h18-handoff.md)、[问题与修订](review-log.md)
- [最终保护/门禁](evidence/validation.json)、[交付文件hash](evidence/artifact-inventory.json)、[原始运行记录](evidence/)

## 复验

仓库根使用Node24、Python和当前作者依赖：

```powershell
node docs/deepseek-harness-v2/h17/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h17/scripts/final-audit.py
```

run-checks会重核源码、同步完整程序、执行实验、生成图/HTML、检查正文、运行已有Renderer回归及真实React挂载QA；不自动声称人工看图完成。final-audit要求manual-review中样本hash与当前输出一致，且必须实际看过输出。首次baseline由snapshot.py保留，已有baseline时拒绝覆盖。

HARNESS_SOURCE_CACHE默认 `C:\Users\QYF\.codex\research\harness-v2-source\deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；HARNESS_GIT_CACHE默认 `C:\Users\QYF\.codex\research\deepseek-harness-f3803c9`。二者都核固定Commit的Git blob和SHA256，不追main。核心阅读仅5文件，其余锁定范围含官方依赖源码/文档/测试供身份核对，不代表9556文件全部语义审读。

H17_DEPS_ANCHOR默认 `C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js`；H17_ZOD_ANCHOR默认 `C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js`。换机应在新的独立研究目录按H04证据中的明确版本安装依赖，另装Zod4.4.3，设置锚点；不要运行覆盖旧缓存的升级安装。完整依赖清单与固定上游integrity见[evidence/dependencies.json](evidence/dependencies.json)，runner按每个精确package条目检查直接/传递依赖，不只搜索一个hash字符串。安装等待不计学员时长。

浏览器QA用AIFOUNDRY_QA_NODE_MODULES、AIFOUNDRY_QA_CHROME指定Playwright和Chrome；本机默认沿用前课缓存。HTML由实际LessonMarkdown SSR生成，静态页无未水合复制按钮，原生折叠可用；复制操作在真实React挂载页另验。图片仅在临时localhost映射/course-media，没有写public或接线上路由。

完成范围只有H17两目录。保留H01–H16、四次集中审查、历史证据、output及用户现有页面/Renderer改动；不修改价格、权限、数据库、公开目录、进度或发布状态。不开发H18。
