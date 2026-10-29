# H04 课程交付

2026-10-29。**《Profile、运行入口与环境配置：Harness 如何启动不同的 Agent 应用？》**完成作者侧研发，未发布。官方基线继续为 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。

## 阅读与审查入口

- [完整 HTML 阅读预览](reading-preview.html) · [正式正文](../../../course-content/internal/deepseek-harness/h04/lesson.md)
- [源码核对清单](source-checklist.md) · [60 引用与 40 断言](evidence/source-check.json) · [五项 AST 结构证据](evidence/control-flow.json)
- [两练习校验程序](../../../course-content/internal/deepseek-harness/h04/lab/launch-lab.mjs) · [完整答案](../../../course-content/internal/deepseek-harness/h04/lab/reference-answer.json) · [十二项行为测试](../../../course-content/internal/deepseek-harness/h04/lab/launch-lab.test.mjs)
- [知识衔接与重复检查](knowledge-bridge.md) · [教学质量审查](quality-review.md) · [最终验收](evidence/validation.json)
- [第一模块集中审查准备包](module-one-review-prep.md)：纵向路线、跨课检查表、试读任务与候选量表。集中审查未进行，制作标准仍待审，不自动冻结。

正文以四类用户使用同一项目助手为主线，区分六个启动概念、五种 Profile、两次参数解析和不同配置规则。SDK/ACP 使用各自 stdio 协议；sdk-minimal 不叠 base，也不等于低权限。环境快照、受管凭据、配置层、dump 与 HMR 各有边界。八个折叠区保留回顾、实验和详细答案，不要求安装完整 Harness 或调用模型。

## 三张教学图

| 图 | 目的 | 源文件 | PNG |
| --- | --- | --- | --- |
| H04-01 多入口组合 | 四种 base-backed 与 minimal 独立树、交互和生命周期 | [SVG](figures/source/h04-01.svg) | [成图](figures/rendered/h04-01.png) |
| H04-02 启动主线 | 参数→环境→代理→Profile/组合→宿主准备→挂载审查→应用就绪；dump 旁支 | [SVG](figures/source/h04-02.svg) | [成图](figures/rendered/h04-02.png) |
| H04-03 来源与作用 | 普通环境与组合层分别排序，凭据、快照、dump 另有规则 | [SVG](figures/source/h04-03.svg) | [成图](figures/rendered/h04-03.png) |

图为原创代码绘制，无官方截图、外部图片或字体文件；[用途与路径](evidence/figures.json)、[许可归属](NOTICE.md)另存。640 宽 SVG、二倍 PNG，沿用前课配色与字体，320/390/1440 检查、完整 alt/caption 与原图入口齐备。本轮由蓝图一张扩为任务要求的三张，没有改其他课图规划。

正文图片为 `/course-media/harness-v2/h04/h04-0N.png`，作者服务器只映射三个精确文件，静态预览用相邻 PNG；**没有部署这些线上路径或复制到 public**。教材、答案和阅读截图均内部保存。静态预览移除没有 React 挂载时失效的复制按钮，支持原生折叠与选择复制；真实组件的按钮另有挂载检查。

## 复现顺序

在 AI Foundry 根目录使用已有依赖，逐条成功再继续；不安装 Harness 到本项目、不运行官方 Profile、不删除文件。

```powershell
python -X utf8 docs/deepseek-harness-v2/h04/scripts/sync-lab.py
node --test course-content/internal/deepseek-harness/h04/lab/launch-lab.test.mjs
node --import tsx docs/deepseek-harness-v2/h04/scripts/inspect-boot.ts
```

真实辅助探针需同一源码缓存和**仓库外**的锁定依赖研究目录。参数 `<commander-entry>` 是该目录 Commander 15 的 `node_modules/commander/index.js`，不是旧版 esm.mjs；同级隔离 node_modules 还需 app-boot 的指定外部依赖。脚本核其 package-lock 版本/integrity；记录见 [probe-dependencies.json](evidence/probe-dependencies.json)，其他平台 optional 锁条目不表示已运行。重建时先在仓库外新建空目录，将 [probe-package.json](evidence/probe-package.json) 与 [probe-package-lock.json](evidence/probe-package-lock.json) 分别另存为 package.json、package-lock.json，在这个新目录运行 `npm install --ignore-scripts --no-audit --no-fund`，再传入其中 Commander 的 index.js。不要使用已有依赖目录，不升级为 latest，不在当前项目安装。锁文件全部外部 integrity 均核同一上游 pnpm-lock；不执行 npm ci 或清理操作。

```text
node node_modules/tsx/dist/cli.mjs --tsconfig <source-dir>/tsconfig.base.json docs/deepseek-harness-v2/h04/scripts/actual-probes.ts <source-dir> <commander-entry>
```

```powershell
python -X utf8 docs/deepseek-harness-v2/h04/scripts/check-sources.py
node --import tsx docs/deepseek-harness-v2/h04/scripts/check-content.ts
python -X utf8 docs/deepseek-harness-v2/h04/scripts/draw_figures.py
node --import tsx docs/deepseek-harness-v2/h04/scripts/make-reading-preview.tsx
node --import tsx docs/deepseek-harness-v2/h04/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h04/scripts/final-audit.py
```

`HARNESS_SOURCE_CACHE`、`HARNESS_GIT_CACHE` 可指定同 Commit 源码/Git 缓存；浏览器用 `AIFOUNDRY_QA_NODE_MODULES`、`AIFOUNDRY_QA_CHROME` 指定 Playwright/Chrome。临时作者与环境夹具保留，不批量清理。改正文、图或脚本后须重跑对应门禁、重新看图并更新人工指纹，不能自动沿用旧审阅。

## 已通过与保留项

实验 12 项、实际源码 helper 探针 10 项、既有 Renderer 9 项；三图与三宽度的复制、折叠、长代码横滚、原图、静态整课预览；60 固定引用、40 断言、五项 AST 结构检查。helper 探针不等于完整应用运行，完整官方测试仅选读未执行。

待验证：学员试读、真实时长、学习效果、独立外审、构建后启动/协议/真实网络和 HMR、沙箱与恢复、线上权限/进度。原有 1794 跟踪文件和 915 output 文件保持原样，只提交 H04 内容。不发布、不改价格权限数据库，不开发 H05。
