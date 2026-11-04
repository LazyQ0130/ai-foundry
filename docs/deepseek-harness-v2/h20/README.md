# H20 内部研发交付

《Agent 可靠性工程：取消、重试与故障恢复》。固定官方Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，研发前基线H19 `6f454c03ecef232cde1fa0c99c63dc87d44d58df`。作者侧有条件接收，最终证据与范围见质量报告。

- [正式教材](../../../course-content/internal/deepseek-harness/h20/lesson.md)、[HTML阅读预览](reading-preview.html)、[四项实践与综合实验](../../../course-content/internal/deepseek-harness/h20/lab/README.md)
- [教学质量报告](quality-review.md)、[覆盖矩阵](coverage-matrix.md)、[56项源码断言](source-checklist.md)、[差异与修订](discrepancies.md)
- [跨课知识一致性](knowledge-bridge.md)、[H21前置说明](h21-handoff.md)、[第五模块审查准备包](module-five-review-prep/README.md)
- [Renderer与三宽度](renderer-regression.md)、[原始记录](evidence/)、[最终保护验收](evidence/validation.json)、[保留临时材料](evidence/temporary-artifacts.json)

## 复验

仓库根使用Node24与Python：

```powershell
node docs/deepseek-harness-v2/h20/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h20/scripts/final-audit.py
```

检查按固定源码/断言、完整代码同步、45项真实行为、导图、实际LessonMarkdown预览、内容/AST/12项Renderer、三宽度真实React交互、源码终核顺序运行。实际看图单独记录当前hash；重新生成后若hash改变，须重看相关样本。已有workspace-before不可覆盖。final-audit保护H01–H19、历史审查、output、用户改动以及H18/H19保留文件与空目录；只允许H20目录暂存。

| 环境变量 | 本机默认锚点 |
|---|---|
| HARNESS_SOURCE_CACHE | C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3 |
| HARNESS_GIT_CACHE | C:/Users/QYF/.codex/research/deepseek-harness-f3803c9 |
| H20_DEPS_ANCHOR | C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js |
| H20_ZOD_ANCHOR | C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js |
| H20_NATIVE_ANCHOR | C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js |
| H20_LIMIT_ANCHOR | C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js |

换机先取固定Git源码与blob；在新的隔离研究目录按H04依赖清单准备基础包，另准备精确Zod4.4.3、Koffi3.1.1、p-limit7.3.3、yocto-queue1.2.2、@js-temporal/polyfill0.5.1、jsbi4.3.2，保留package-lock。全部直接与传递name/version/integrity必须匹配固定pnpm条目；不修改旧缓存或往业务项目安装。46项包含其他平台可选包，未安装不等于运行过。

浏览器默认本机Chrome与既有Playwright缓存，可覆盖AIFOUNDRY_QA_CHROME/AIFOUNDRY_QA_NODE_MODULES。静态HTML移除未水合复制按钮，原生折叠可用；复制在真实React作者夹具另验。图片只在本地映射/course-media，未放入public、注册产品课、权限、价格、数据库或线上发布。

第五模块包只整理H17–H20现有证据和候选审查问题，不给模块正式审查结论，也不重跑旧课冒充新审查。H21只有前置交接，完成H20后停止。
