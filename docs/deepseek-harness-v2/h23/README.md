# H23｜CLI、Web UI、SDK 与远程通信

2026-11-04；正式蓝图唯一目标：**追踪一个控制动作与一条状态订阅穿过载体边界**。固定源码 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Harness 0.2.2-alpha.2 / Cordis 4.0.6-alpha.1。作者侧结论 **CONDITIONAL GO**，当前无确认未解决 P0/P1；学习负担 P2、完整应用与外部验证仍开放。没有发布。

| 交付 | 入口 |
| --- | --- |
| 正式正文、四实践与答案、综合实验、12 折叠思考 | [lesson.md](../../../course-content/internal/deepseek-harness/h23/lesson.md) |
| 作者本地阅读页 | [reading-preview.html](reading-preview.html) |
| 13 份完整程序及复现说明 | [lab/README.md](../../../course-content/internal/deepseek-harness/h23/lab/README.md) |
| 质量分层、负担与剩余条件 | [quality-review.md](quality-review.md) |
| 蓝图门禁、输入与保护范围 | [preparation.md](preparation.md) |
| 54 项固定源码断言 | [source-checklist.md](source-checklist.md) |
| 25 项逐例分级、真实组件/替身/限制 | [coverage-matrix.md](coverage-matrix.md) |
| H04/H08/H09/H17/H18/H21–H23 衔接 | [knowledge-bridge.md](knowledge-bridge.md) |
| 12 Renderer 回归及三宽度检查 | [renderer-regression.md](renderer-regression.md) |
| 失败原记录与修复 | [discrepancies.md](discrepancies.md) |
| H24 前置与范围，只有交接 | [h24-handoff.md](h24-handoff.md) |

四张图保留 `figures/source/*.svg`、`figures/h23-*.png` 和 `scripts/draw_figures.py`。`scripts/preview-and-qa.tsx` 从 SVG 生成 PNG，并用实际 LessonMarkdown/平台 CSS 挂载三宽度。私有正文的 `/course-media/` 只在作者预览中映射到本目录，没有复制到 public 或接入课程目录。

25 个有效执行项=C7/D18，12 项现有 Renderer 回归；综合 X 复用 B1/C1，不增加计数。SDK 实际运行正式 Client/Server/Protocol、AppBoot/Loader、AgentLoop 和真实 JSONL，使用隔离作者 Profile 与 Mock LLM。Web 组件真实，但 fetch/stream/认证 Peer 是受控协作者，未运行 Harness 产品 Web UI 或真实 WebSocket。浏览器教材 QA 不等于产品鉴权测试。

```powershell
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs X
node docs/deepseek-harness-v2/h23/scripts/run-checks.mjs
python -X utf8 docs/deepseek-harness-v2/h23/scripts/evidence-index.py
```

完整检查会保留新的临时根、原始 run 与截图。最终 `evidence/lab-results.json` 指向通过的原始 TAP；`test-grades.json` 是逐项解释；`source-check.json` 只证明源身份/链接范围；`validation.json` 只证明范围与交付一致性。终检脚本要求只暂存两个 H23 目录，普通只读检查无须先暂存。依赖缓存位置及精确版本见 lab 说明与 runner。

真实 Provider、发行版完整 Profile、E 级应用、ACP/Python 实跑、学员试读、实测时长与独立外审均未验证。H23 完成后停止：不开发 H24，不开展第六模块集中审查，不发布。
