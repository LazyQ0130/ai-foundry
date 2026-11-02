# H16 内部研发交付

《Agent工具生态：File、Shell、Web与MCP的组合实践》。固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。作者结论 **CONDITIONAL GO**。仅H16与第四模块审查准备，未发布，未开始H17或正式集中审查。

- [正式教材](../../../course-content/internal/deepseek-harness/h16/lesson.md)、[完整lab](../../../course-content/internal/deepseek-harness/h16/lab/)、[HTML阅读预览](reading-preview.html)
- [质量报告](quality-review.md)、[14项验收](acceptance.md)、[源码60条](source-checklist.md)、[实验分级及原始证据](test-evidence.md)
- [平台/后端覆盖](backend-coverage.md)、[Renderer与三宽度](renderer-regression.md)、[修订与范围差异](review-log.md)
- [跨课衔接](knowledge-bridge.md)、[H17前置](h17-handoff.md)、[第四模块集中审查准备包](module-four-review-prep/README.md)
- [最终门禁](evidence/validation.json)、[文件清单](evidence/artifact-inventory.json)

## 复现入口

仓库根使用Node24、Python及当前仓库开发依赖。运行 `node docs/deepseek-harness-v2/h16/scripts/run-checks.mjs`；各子脚本可单独复查。prepare.py只保留首次脚手架记录，有lab时拒绝覆盖，不在日常门禁中运行。固定源码缓存由HARNESS_SOURCE_CACHE / HARNESS_GIT_CACHE选择，脚本核Git blob与SHA256，不跟随main。

H16_DEPS_ANCHOR指向H04隔离依赖中的commander/index.js，H16_FS_DEPS_ANCHOR指向H15隔离chokidar/index.js，H16_ECO_DEPS_ANCHOR指向本课隔离依赖目录的package.json。H16_ZOD_ANCHOR保留H09锁定Zod核验入口；实际解析用本课同版本4.4.3。新增SDKclient/server/core2.2.0、turndown7.2.4、GFM1.0.67、diff9.0.0等完整依赖树见ecosystem-dependencies.json，全部integrity与固定上游pnpm-lock一致。为避免宽范围依赖漂移，eventsource-parser3.1.0、jose6.2.3、zod4.4.3显式固定。安装仅在研究目录，不修改业务依赖。

Playwright入口由AIFOUNDRY_QA_NODE_MODULES / AIFOUNDRY_QA_CHROME配置。静态HTML来自实际LessonMarkdown SSR；原生折叠可用，静态页不保留未水合复制按钮，复制用真实React挂载另测。私有localhost服务测试后关闭，无公开路由。

MCP实际启动随附Node Server经stdio通信，源文件可审阅，无npx、网络抓取或未知Server安装。Shell为显式Mock执行器；Web为内存提供方。文件只触碰新夹具，逐个明确文件清理，空目录按用户禁止批量删除规则保留。
