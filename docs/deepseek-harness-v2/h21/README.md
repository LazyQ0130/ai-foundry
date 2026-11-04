# H21 内部研发交付

《Subagent、任务委派与多智能体协作》。遵循30讲正式蓝图，记录与任务暂定标题的差异，未更改蓝图。基线第五模块审查 `0aeaa54`；官方固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。

- [完整教材](../../../course-content/internal/deepseek-harness/h21/lesson.md)、[HTML阅读预览](reading-preview.html)、[实验入口](../../../course-content/internal/deepseek-harness/h21/lab/README.md)
- [质量结论](quality-review.md)、[38项源码断言](source-checklist.md)、[覆盖矩阵](coverage-matrix.md)、[版本差异及修订](discrepancies.md)
- [前置阅读与定位](preparation.md)、[跨课衔接审查](knowledge-bridge.md)、[H22前置说明](h22-handoff.md)
- [Renderer/三宽度](renderer-regression.md)、[原始证据](evidence/)、[范围保护验收](evidence/validation.json)

作者侧总体 **CONDITIONAL GO**：确认P0/P1已关闭，21项C/D、12项Renderer及1440/390/320检查通过；学员试读、真实时长、独立外审、真实外部Provider与E级完整应用均未验证。不构成发布许可，完成H21后停止。

## 复验与隔离环境

在仓库根使用Node24.16.0及Python；复验只写本课目录和全新临时目录，不改产品路由或public。

```powershell
node docs/deepseek-harness-v2/h21/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h21/scripts/final-audit.py
```

也可单独运行 `run-checks.mjs labs`、`content`、`renderer` 或 `visual`。每次原始记录保留args/exit/stdout/stderr及程序hash，不将历史重跑叠加计数。首次workspace-before不得覆盖。

| 环境变量 | 本机默认值 |
| --- | --- |
| HARNESS_SOURCE_CACHE | C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3 |
| HARNESS_GIT_CACHE | C:/Users/QYF/.codex/research/deepseek-harness-f3803c9 |
| H21_DEPS_ANCHOR | C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js |
| H21_ZOD_ANCHOR | C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js |
| H21_NATIVE_ANCHOR | C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js |
| H21_LIMIT_ANCHOR | C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js |

换机在**新建的独立研究目录**取得官方Git仓库并checkout固定Commit，保留Git对象供blob核验；HARNESS_SOURCE_CACHE也可指向该checkout。不要在AI Foundry根安装Harness依赖。四组锚点分别解析下列精确包，安装时保留各自package-lock：

| 新隔离依赖目录 | 精确依赖 |
| --- | --- |
| base | @eslint-community/regexpp 4.12.2、ajv 8.20.0、commander 15.0.0、fast-uri 3.1.8、js-yaml 4.3.2、node-addon-require-builtin 0.1.9、resolve.exports 2.0.3、semver 7.8.5 |
| schema | zod 4.4.3 |
| native | koffi 3.1.1、chokidar 5.0.0、readdirp 5.0.0、yaml 2.9.0；override readdirp=5.0.0 |
| persistence | p-limit 7.3.3、yocto-queue 1.2.2、@js-temporal/polyfill 0.5.1、jsbi 4.3.2 |

以这些目录的commander/index.js、zod/index.js、koffi/index.js、p-limit/index.js覆盖四个锚点。所有直接及传递name/version/integrity必须与固定pnpm-lock相符；遇漂移修独立锁树，不能放宽检查。缓存46个记录包含可选平台包；并非全部已在Windows加载或被本课触发。

普通依赖齐备的固定Harness checkout可把lab完整复制到新建 `tmp/h21-lab`，使用上游tsx和tsconfig运行demo或node:test；作者bootstrap仅适用于四锚点隔离解析方式。默认runner会提供全新的DSH_HOME，不继承API密钥。Directory协作者不访问磁盘目录；真实JSONL only写本次新根，所有文件与空目录保留，未执行递归删除。

视觉复验默认使用本机Chrome和既有Playwright，可覆盖 `AIFOUNDRY_QA_CHROME` / `AIFOUNDRY_QA_NODE_MODULES`。HTML为实际LessonMarkdown的SSR，移除未水合复制按钮；九份完整程序的复制另在真实React挂载下逐字核验。`/course-media`只作私有本地映射，图片没有复制到public或接入在线课程。
