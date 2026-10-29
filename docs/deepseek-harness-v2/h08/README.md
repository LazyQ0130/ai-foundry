# H08｜动态组装Agent系统：Profile、Bundle与Patch

2026-10-29内部正式教材研发交付，前序H07 `e3a5a65`。官方Commit固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，采用模块一作者制作标准v1.0。

**结论：CONDITIONAL GO。** 已验证范围内作者技术/内容检查通过；试读、真实时长、独立外审待做。仅交付H08和第二模块审查准备材料，不发布，不开发H09，不开展集中审查。

| 交付 | 入口 |
| --- | --- |
| 正式正文、三实践与七思考题/折叠答案 | [lesson.md](../../../course-content/internal/deepseek-harness/h08/lesson.md) |
| HTML阅读预览 | [reading-preview.html](reading-preview.html)，实际SSR，原生折叠，代码可选择复制 |
| 四图及可复现源 | [PNG](figures/rendered) / [SVG](figures/source) / [生成器](scripts/draw_figures.py) |
| 实验文件、五层YAML与答案 | [lab](../../../course-content/internal/deepseek-harness/h08/lab) |
| 固定源码与37条断言 | [source-checklist.md](source-checklist.md)、[机器字节/行范围](evidence/source-check.json) |
| 自动化与原始证据 | [20项结果](evidence/lab-results.json)、[原始TAP](evidence/lab-tests.txt)、[错误变异](evidence/lab-mutation.txt) |
| Renderer与三宽度 | [回归报告](renderer-regression.md)、[9项TAP](evidence/renderer-tests.tap)、[自动QA](evidence/visual-qa.json)、[实际看图](evidence/manual-review.json) |
| 知识递进 | [H05–H08衔接](knowledge-bridge.md) |
| 教学质量与验收 | [quality-review.md](quality-review.md)、[acceptance.md](acceptance.md)、[修订记录](review-log.md)、[最终证据](evidence/validation.json) |
| H09接口 | [h09-handoff.md](h09-handoff.md)，仅未来研发输入 |
| 第二模块审查准备包 | [module-two-review-prep](module-two-review-prep/README.md)，索引/哈希、待审问题、候选跨课题及验证空缺 |

验证明确分四层：自制平面模拟器；真实Cordis/Loader；真实隔离Profile/App Boot；完整官方应用集成。前三层按证据执行，第四层NOT_RUN。五个随附Profile只读解析，未启动其默认Shell/模型/服务器；原生HMR模块替换也未运行。没有用作者夹具冒称完整官方套件通过。

在AI Foundry根用已有依赖复验，按顺序执行：

```powershell
node docs/deepseek-harness-v2/h08/scripts/write-fixtures.mjs
python -X utf8 docs/deepseek-harness-v2/h08/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h08/scripts/draw_figures.py
python -X utf8 docs/deepseek-harness-v2/h08/scripts/write-source-checklist.py
python -X utf8 docs/deepseek-harness-v2/h08/scripts/check-sources.py
node docs/deepseek-harness-v2/h08/scripts/run-labs.mjs
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h08/scripts/make-reading-preview.tsx
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h08/scripts/check-content.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h08/scripts/preview-and-qa.tsx
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts *> docs/deepseek-harness-v2/h08/evidence/renderer-tests.tap
```

图或正文修改后，先重跑受影响检查并实际查看新图，再执行record-packet.py记录样本/索引，最后final-audit.py。不能用旧manual-review给新图背书。workspace-before.json是本轮开始时的保护快照，不应换成新状态掩盖旧文件变更。

运行器使用新OS临时目录、允许列表环境和锁定缓存，保留所有夹具而不递归清理。换机可设HARNESS_SOURCE_CACHE、HARNESS_GIT_CACHE、H08_DEPS_ANCHOR；隔离外部依赖版本/完整性来自既有H04固定清单，未在AI Foundry安装依赖。浏览器可设AIFOUNDRY_QA_NODE_MODULES、AIFOUNDRY_QA_CHROME。路径和版本不匹配会失败，不自动追最新包。

哈希记录本机当前字节。换机或Git换行转换后，应重生成对应证据、核对差异，不能伪造旧哈希继续通过。

保留H01–H07、output与其他文件；未改现有课程、权限、价格、数据库、Renderer、public或发布状态。许可和限制见[NOTICE](NOTICE.md)。
