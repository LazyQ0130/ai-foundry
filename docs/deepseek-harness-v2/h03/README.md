# H03 课程交付

2026-10-29。**《一个 Agent 请求到底经过了什么？》**完成作者侧制作；未发布，学员试读与独立外审待完成。官方源码保持 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。

## 阅读入口

- [完整阅读预览](reading-preview.html) · [正式正文](../../../course-content/internal/deepseek-harness/h03/lesson.md)
- [源码核对清单](source-checklist.md) · [28 项原始断言和行范围](evidence/source-check.json) · [六项 AST 顺序证据](evidence/control-flow.json)
- [独立 Mock 程序](../../../course-content/internal/deepseek-harness/h03/lab/trace.mjs) · [十项行为测试](../../../course-content/internal/deepseek-harness/h03/lab/trace.test.mjs) · [九场景参考计数](../../../course-content/internal/deepseek-harness/h03/lab/reference-answer.json)
- [知识衔接与 H04 交接](knowledge-bridge.md) · [教学质量审查](quality-review.md) · [最终验收](evidence/validation.json)

正文从“只给文件名不能证明读过内容”进入，借 Stage 4 实际教材复习闭环，再分开解释输入队列、轮次/步骤、请求材料、流结算、工具反馈与事件日志。拒绝输入为零 Step；Tool Call 不等于执行成功；completed/idle 不代表读取目标达成；实时通知、Session 事实、磁盘 flush 分层。完整答案均可折叠，实验不需安装 Harness 或模型 API。

## 配图与平台路径

| 阅读顺序 / 资产 | 教学目的 | 源文件 | 成图 |
| --- | --- | --- | --- |
| 图 1 · H03-02 包含关系 | 零/单/多 Step；Step 包含模型和相关工具 | [SVG](figures/source/h03-02.svg) | [PNG](figures/rendered/h03-02.png) |
| 图 2 · H03-01 完整路径 | 接纳、准备、提交、工具反馈与停止检查；两类记录 | [SVG](figures/source/h03-01.svg) | [PNG](figures/rendered/h03-01.png) |
| 图 3 · H03-03 时序对比 | 助手提交先于工具；结果进入下一请求 | [SVG](figures/source/h03-03.svg) | [PNG](figures/rendered/h03-03.png) |

三图 640 宽 SVG，PNG 二倍导出，沿用 H01/H02 色彩与字体。正文包含完整 alt、图注和等价文字；来源 Commit 与用途见 [figures.json](evidence/figures.json)。无官方图片、虚构截图、外部字体文件或装饰图。[上游摘录许可](NOTICE.md)另存完整 MIT 归属。

正文使用 `/course-media/harness-v2/h03/h03-0N.png`，作者服务器只映射三个精确文件；静态预览映射相邻 PNG。**没有将文件写入 public 或部署这些线上路径**。正文、答案和阅读截图保留内部目录；资源下载、课程目录与平台权益均未注册。静态预览支持原生折叠和选择复制；正式组件的复制按钮另经真实 React 挂载检查。

## 可复现检查

在 AI Foundry 根目录使用已有依赖，逐条成功后继续。不在根目录安装 Harness 依赖，不执行删除命令。

```powershell
python -X utf8 docs/deepseek-harness-v2/h03/scripts/sync-lab.py
node --test course-content/internal/deepseek-harness/h03/lab/trace.test.mjs
node --import tsx docs/deepseek-harness-v2/h03/scripts/inspect-flow.ts
```

另在固定源码缓存可用时执行实际库探针；`<source-dir>` 替换为同一 Commit 的绝对目录，默认缓存信息见上层 source-lock.json：

```text
node node_modules/tsx/dist/cli.mjs --tsconfig <source-dir>/tsconfig.base.json docs/deepseek-harness-v2/h03/scripts/actual-probes.ts <source-dir>
```

```powershell
python -X utf8 docs/deepseek-harness-v2/h03/scripts/check-sources.py
node --import tsx docs/deepseek-harness-v2/h03/scripts/check-content.ts
python -X utf8 docs/deepseek-harness-v2/h03/scripts/draw_figures.py
node --import tsx docs/deepseek-harness-v2/h03/scripts/make-reading-preview.tsx
node --import tsx docs/deepseek-harness-v2/h03/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h03/scripts/final-audit.py
```

源码门禁以 `HARNESS_SOURCE_CACHE`、`HARNESS_GIT_CACHE` 覆盖缓存路径，逐引用比对 Git tree blob。浏览器脚本可用 `AIFOUNDRY_QA_NODE_MODULES`、`AIFOUNDRY_QA_CHROME` 指定 Playwright 与 Chrome。临时夹具写系统临时目录并保留；脚本不批量清理。其他机器复现要保留相同源码字节与现有平台依赖。

改正文或图后必须重跑对应门禁，再实际看图、更新人工记录指纹，不能沿用旧的人工绿灯。`final-audit.py` 会拒绝正文、图、组件或已审资料哈希不一致的证据。它不自动给教学效果评级。

## 验收边界

已通过：实验 10 项；实际锁定源码内存库探针 4 项；Renderer 既有回归 9 项；三图 × 三宽度与代码/答案复制、键盘折叠、四道思考答案、原图、静态阅读页；48 固定链接、28 断言、六项 AST 顺序定位。完整官方 AgentLoop/Vitest 未运行，仅选读实际测试断言；超时是 Mock 注入，不是 Provider 实测。

实际时长、学员理解、独立外审、真实模型、原生沙箱与跨进程恢复未验证。保持 H01/H02、1736 个已有跟踪文件与 915 个 output 文件原样；不接入线上、不修改价格权限、不开发 H04。H04 仅接过“运行前的服务和实例怎样由 Profile 与入口准备好”这个问题。
