# H07｜插件生命周期：Fiber、Effect 与资源管理

2026-10-29 内部正式教材研发交付。前序H06提交 `1e3c1ac`，采用模块一作者制作标准v1.0；官方源码固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Cordis `4.0.6-alpha.1`。

**结论：CONDITIONAL GO。** 作者侧范围内技术与内容检查通过；学员试读、实际学习时长和独立外审仍待验证。只交付H07，不发布、不自动开始H08。

| 交付 | 入口 |
| --- | --- |
| 1. 正式正文 | [lesson.md](../../../course-content/internal/deepseek-harness/h07/lesson.md) |
| 2. HTML阅读预览 | [reading-preview.html](reading-preview.html)，真实SSR与原生折叠；代码可选择复制 |
| 3. 三图和源文件 | 状态图 [PNG](figures/rendered/h07-01.png) / [SVG](figures/source/h07-01.svg)；Effect图 [PNG](figures/rendered/h07-02.png) / [SVG](figures/source/h07-02.svg)；所有权/依赖图 [PNG](figures/rendered/h07-03.png) / [SVG](figures/source/h07-03.svg)；[生成器](scripts/draw_figures.py) |
| 4. A/B/C实践与详细答案 | 正文内折叠；[完整实验文件](../../../course-content/internal/deepseek-harness/h07/lab) |
| 5. 五道思考题与折叠答案 | 正文末段，问题默认可见 |
| 6. 固定源码核对 | [清单](source-checklist.md) · [机器记录](evidence/source-check.json) |
| 7. 真实Cordis自动实验 | [运行器](scripts/run-labs.mjs) · [结果](evidence/lab-results.json) · [24项测试](evidence/lab-tests.txt) |
| 8. Renderer V2回归 | [9项TAP](evidence/renderer-tests.tap) · [内容检查](evidence/content-check.json) |
| 9. 1440/390/320与交互 | [自动QA](evidence/visual-qa.json) · [作者实际看图](evidence/manual-review.json) · [截图](figures/qa) |
| 10. H05–H07知识衔接 | [knowledge-bridge.md](knowledge-bridge.md) |
| 11. H08边界与交接 | [h08-handoff.md](h08-handoff.md)，仅未来研发输入 |
| 12. 教学质量与验收 | [质量报告](quality-review.md) · [验收](acceptance.md) · [修订记录](review-log.md) · [最终门禁](evidence/validation.json) |

实践真实加载vendor Cordis/Cosmokit；ManualClock与连接布尔值仅替代外部资源，不冒充真实网络连接或整个Harness。另有受控真实Node定时器测试、遗漏清理变异、strict消费方与类型负例。官方Agent资源/磁盘drain测试只选读，没有运行。

在AI Foundry根目录按依赖顺序复验，使用已有依赖：

```powershell
python -X utf8 docs/deepseek-harness-v2/h07/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h07/scripts/draw_figures.py
node docs/deepseek-harness-v2/h07/scripts/run-labs.mjs
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h07/scripts/make-reading-preview.tsx
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h07/scripts/check-content.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h07/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h07/scripts/check-sources.py
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts *> docs/deepseek-harness-v2/h07/evidence/renderer-tests.tap
python -X utf8 docs/deepseek-harness-v2/h07/scripts/final-audit.py
```

固定缓存配置见evidence/source-lock.json；换机可设HARNESS_SOURCE_CACHE/HARNESS_GIT_CACHE，仍需同Commit同字节。运行器新建OS临时目录，仅传必需启动变量，不读取个人Home/.env/凭据、不联网、不递归清理；保留临时路径。浏览器QA使用已有Chrome/Playwright，可设AIFOUNDRY_QA_CHROME/AIFOUNDRY_QA_NODE_MODULES。

重画或修改正文后需重新验证受影响内容并实际审图；旧人工记录不能给新内容背书。作者哈希记录当前工作区字节，换机或Git换行转换后应重生成对应证据并核差异，不能伪造旧记录。本机/course-media映射不表示已上线；素材与答案没有写public。

仅新增两个h07目录，保留H01–H06、output及其他用户文件。未改Stage、Capstone、权限、价格、数据库、Renderer或发布状态，不推送。来源及边界见 [NOTICE](NOTICE.md)、[Harness许可](SOURCE-LICENSE.txt)、[Cordis许可](CORDIS-LICENSE.txt)。
