# H12｜LLM Adapter 与流式响应：模型输出如何进入 Harness？

作者侧结论 **CONDITIONAL GO**：本轮正式材料和覆盖范围内的验证完成，无已知未决作者P0/P1；试读、实际时长、独立外审、E级完整应用及实际提供方性能未验证。没有发布课程，没有开发H13，也没有启动第三模块集中审查。

源码固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Harness `0.2.2-alpha.2`、Cordis `4.0.6-alpha.1`。当前真实组件/局部链路49项通过，互斥计A1、C33、D15；B未另跑独立专项，Cordis在C/D内部实际运行但不重复计数；E未运行。

| 交付 | 入口 |
| --- | --- |
| 完整正式正文 | [lesson.md](../../../course-content/internal/deepseek-harness/h12/lesson.md) |
| 实际Renderer静态阅读页 | [reading-preview.html](reading-preview.html)，原生折叠可用，代码可选择复制 |
| 四图、SVG/PNG与可再生成源码 | [源图](figures/source)、[成图](figures/rendered)、[生成器](scripts/draw_figures.py) |
| 四项实践及详细答案 | 正文A–D、[完整lab](../../../course-content/internal/deepseek-harness/h12/lab)、[实际对象/事件/请求](evidence/practice-output.json) |
| 十道折叠思考题 | 正文末段，至少四题推导具体分片、块、回放或结算 |
| 47条固定源码断言 | [source-checklist.md](source-checklist.md)、[机器清单](evidence/source-assertions.json) |
| C/D真实测试与原始执行 | [test-evidence.md](test-evidence.md)、[TAP](evidence/lab-tests.txt)、[stdout/stderr与退出值](evidence/lab-results.json) |
| 9 Renderer及新增检查 | [renderer-regression.md](renderer-regression.md)、[TAP](evidence/renderer-tests.tap) |
| 三宽度与真实交互 | [visual-qa](evidence/visual-qa.json)、[21样本作者看图](evidence/manual-review.json) |
| H10–H12衔接/重复审查 | [knowledge-bridge.md](knowledge-bridge.md) |
| H13前置交接，仅说明 | [h13-handoff.md](h13-handoff.md) |
| 教学质量与修订 | [quality-review.md](quality-review.md)、[review-log.md](review-log.md)、[acceptance.md](acceptance.md) |
| 第三模块审查准备包 | [准备包索引](module-three-review-prep/README.md)，不含集中审查结论 |

从仓库根目录复现（既有依赖已准备好时，不运行安装或清理）：

```powershell
python -X utf8 docs/deepseek-harness-v2/h12/scripts/write-source-checklist.py
python -X utf8 docs/deepseek-harness-v2/h12/scripts/check-sources.py
node docs/deepseek-harness-v2/h12/scripts/run-labs.mjs
python -X utf8 docs/deepseek-harness-v2/h12/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h12/scripts/draw_figures.py
node --import tsx docs/deepseek-harness-v2/h12/scripts/make-reading-preview.tsx
node --import tsx docs/deepseek-harness-v2/h12/scripts/check-content.ts
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts
node --import tsx docs/deepseek-harness-v2/h12/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h12/scripts/final-audit.py
```

manual-review是实际查看当前截图后的人工作者记录，脚本不会替你看图；重新改图/正文/截屏后需重新核对，不能复制旧通过结论。QA使用实际React组件与平台CSS、本地临时HTTP服务、Chrome和Playwright；静态HTML移除未水合的复制按钮。没有改产品路由或线上媒体路径。

源码默认缓存路径和Git blob身份在[source-lock](evidence/source-lock.json)，可用 `HARNESS_SOURCE_CACHE` / `HARNESS_GIT_CACHE` 改位置；1594份相关源码/配置/文档在执行前核字节。`H12_DEPS_ANCHOR`默认复用仓库外H04隔离依赖，`H12_ZOD_ANCHOR`默认复用H09的Zod4.4.3目录，名称不表示重跑旧课。版本与integrity按H04清单及[Zod记录](evidence/zod-dependency.json)核验，不在AI Foundry安装另一套Harness。浏览器可用 `AIFOUNDRY_QA_NODE_MODULES` / `AIFOUNDRY_QA_CHROME` 指定既有环境。

运行器保留每次新建OS夹具与run记录，不批量删除。ScriptedAdapter替代模型，read_fixture只返回代码内字符串；官方DeepSeek.translate为纯事件翻译组件测试，没有网络。版权见[NOTICE](NOTICE.md)。[准备记录](evidence/preparation.json)注明阅读范围和重复材料；[最终保护验收](evidence/validation.json)及[交付哈希](evidence/artifact-inventory.json)核对只新增H12、3809个已有文件不变。
