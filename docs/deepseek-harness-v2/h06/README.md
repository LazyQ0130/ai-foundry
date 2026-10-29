# H06｜事件驱动：Cordis 插件之间如何通信？

2026-10-29 内部正式教材交付。承接 H05 `d8aab26` 与模块一作者制作标准 v1.0；官方源码固定为 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Cordis `4.0.6-alpha.1`。

**结论：CONDITIONAL GO。** 本轮技术与作者内容审查通过；学员试读、实际学习时长和独立外审仍待验证。完成后停止于 H06，未发布。

| 交付 | 入口 |
| --- | --- |
| 1. 正式正文与 HTML | [lesson.md](../../../course-content/internal/deepseek-harness/h06/lesson.md) · [阅读预览](reading-preview.html) |
| 2. 三张图与源文件 | 图一 [PNG](figures/rendered/h06-01.png) / [SVG](figures/source/h06-01.svg)；图二 [PNG](figures/rendered/h06-02.png) / [SVG](figures/source/h06-02.svg)；图三 [PNG](figures/rendered/h06-03.png) / [SVG](figures/source/h06-03.svg)；[生成器](scripts/draw_figures.py) |
| 3. 三项实践和答案 | 正文 A/B/C 与折叠参考答案；[完整 lab](../../../course-content/internal/deepseek-harness/h06/lab) |
| 4. 四道折叠思考题 | 正文末段，题目默认可见、详细答案折叠 |
| 5. 固定源码核对 | [source-checklist.md](source-checklist.md) · [机器清单](evidence/source-check.json) |
| 6. 真实 Cordis 实验 | [运行器](scripts/run-labs.mjs) · [结果](evidence/lab-results.json) · [27项测试](evidence/lab-tests.txt) |
| 7. Renderer 回归 | [9项 TAP](evidence/renderer-tests.tap) · [正文检查](evidence/content-check.json) |
| 8. 三宽度与交互 | [自动 QA](evidence/visual-qa.json) · [实际看图记录](evidence/manual-review.json) · [截图](figures/qa) |
| 9. H05–H06 衔接 | [knowledge-bridge.md](knowledge-bridge.md) |
| 10. H07/H08/H14 边界 | [knowledge-bridge.md](knowledge-bridge.md) 的范围审查 |
| 11. 教学质量报告 | [quality-review.md](quality-review.md) · [验收](acceptance.md) · [问题记录](review-log.md) |
| 12. H07 交接 | [h07-handoff.md](h07-handoff.md)，仅后续研发输入 |

另保留 [来源说明](NOTICE.md)、[MIT 许可](SOURCE-LICENSE.txt)、[前置阅读记录](evidence/prerequisites.json) 和 [最终门禁](evidence/validation.json)。

练习真实加载锁定 vendor Cordis/Cosmokit；业务数据为固定内存夹具。27项测试之外，错误答案变异、emit/bail拒绝子进程、严格消费方类型检查、TS2769负例和声明擦除分别留证。官方 Harness 测试只选读，未运行完整工具管线、Agent或模型 API。

在 AI Foundry 根目录复验，使用已有依赖：

```powershell
python -X utf8 docs/deepseek-harness-v2/h06/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h06/scripts/draw_figures.py
node docs/deepseek-harness-v2/h06/scripts/run-labs.mjs
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h06/scripts/make-reading-preview.tsx
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h06/scripts/check-content.ts
node node_modules/tsx/dist/cli.mjs docs/deepseek-harness-v2/h06/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h06/scripts/check-sources.py
node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts *> docs/deepseek-harness-v2/h06/evidence/renderer-tests.tap
python -X utf8 docs/deepseek-harness-v2/h06/scripts/final-audit.py
```

源码缓存配置在本课 `evidence/source-lock.json`；换机可设 `HARNESS_SOURCE_CACHE`/`HARNESS_GIT_CACHE`，仍须同 Commit、同字节。运行器新建 OS 临时目录，复制课程夹具并仅传启动必需环境变量，不读 Home/.env/真实凭据、不联网、不递归清理。QA 使用已有 Chrome/Playwright，可设 `AIFOUNDRY_QA_CHROME`/`AIFOUNDRY_QA_NODE_MODULES`。

改正文或重画图后须重新检查受影响项目并实际审图；人工记录不能靠脚本重写成“已看”。静态预览使用真实 SSR 与平台 CSS、原生折叠，代码可选择复制；实际复制按钮另在 React 挂载夹具测四份完整程序。私有图与答案未写 public；本机 `/course-media` 映射不代表上线。

仅新增两个 h06 目录，保留原有 `output/`、H01–H05及其他用户文件。未改 Stage、Capstone、权限、价格、数据库、发布状态或 Renderer；不推送，不自动进入 H07。
