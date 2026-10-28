# AI Foundry · DeepSeek Harness 深度源码研习 V2.0

课程名称：**《深入 DeepSeek Harness：从 Agent 原理到复杂智能体架构》**。本轮交付是内部研发蓝图与证据包，不是已制作的 30 讲正式正文。

源码基线：[f3803c96974ad4a94195fb97e5c637e9c2a3afe3](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3)，仓库版本 `0.2.2-alpha.2`。研究/视觉/验证日期：2026-10-28。

## 交付入口

| 材料 | 内容 |
| --- | --- |
| [A · 课程研发蓝图](A-blueprint-v2.md) | 24 核心 + 6 拓展；30 讲各 20 字段；先修图谱；真实源码、函数、顺序、调用链、异常、测试和时长 |
| [B · 源码研究报告](B-source-research.md) | 模块关系、运行链、18 项关键事实、取舍/待确认、安全与版本维护 |
| [C · 知识衔接与概念手册](C-knowledge-and-concepts.md) | 29 正式旧课 + 准备课深度审计；逐讲 3–8 分钟复习；34 张七步概念卡 |
| [D · 配图规划](D-visual-plan.md) | 56 张图、目的/结构/课时/alt/图注、统一视觉规范、4 张真实示例与 SVG 源 |
| [E · 课程制作规范](E-production-standard.md) | Renderer V2、源码引用、正文/实验/配图/审查/更新和发布前门禁 |
| [F · 四批研发计划](F-batch-plan.md) | H01–H08、H09–H16、H17–H24、H25–H30 的顺序、依赖、产物和质量门禁 |
| [G · 实践与答案](G-exercises-and-answers.md) | 30 讲实践/思考题答案；六模块小原型、完整参考实现、24 项确定性验收 |
| [最终自检证据](evidence/validation.json) | 字段/链接/锁定源码/图片/原课保护/执行验证/未运行项 |

## 四张首批示例

- [LLM、Agent 与 Harness：关系对比](figures/rendered/h01-01.png) · [SVG](figures/source/h01-01.svg)
- [DeepSeek Harness 整体执行架构](figures/rendered/h03-01.png) · [SVG](figures/source/h03-01.svg)
- [Cordis Waterfall：事件分发时序](figures/rendered/h06-01.png) · [SVG](figures/source/h06-01.svg)
- [Agent Loop：Turn / Step 流程](figures/rendered/h10-01.png) · [SVG](figures/source/h10-01.svg)

[桌面/手机检查记录](evidence/visual-qa.json)；12 张页面截图在 figures/qa。图片与课程正文均未写入公开静态目录，作者 QA 只用临时本机服务器映射虚拟 course-media 路径。

## 验证结果与边界

实际锁定源码的 6 项库级探针通过，范围为 Cordis 分发/释放、detached Session 派生、原生内存工具流水线。六模块教学原型 24 项检查通过；现有 Renderer 测试 9 项通过；4 图 × 3 视口的图像加载/溢出/图注/原图/折叠检查通过。静态引用共 239 个，60 个官方测试文件只作定位和选读，未宣称整套运行。

**未验证：** 完整官方 Vitest/快照/e2e、真实 Provider/语义质量、原生沙箱/OS 隔离、真实浏览器/桌面、跨进程恢复/租约运行、独立外部审稿。这里的绿色结果不能用作生产安全背书。官方明确为未安全审计的实验性开发者预览，教材保留该边界。

## 本地复验

```powershell
node --test docs/deepseek-harness-v2/labs/acceptance.test.mjs
node --import tsx --test tests/lesson-renderer.test.ts
python -X utf8 docs/deepseek-harness-v2/scripts/validate_packet.py
```

固定源码缓存路径和机器依赖位置见 source-lock.json；换机后需在新独立缓存检出同一 Commit，用 `author.py <source-dir>` 重建索引，并设置浏览器/运行库路径。不在 AI Foundry 根目录安装 Harness 的 pnpm 依赖。实际源码探针复验方式（`<source-dir>` 为锁定源码绝对目录）：

```text
node node_modules/tsx/dist/cli.mjs --tsconfig <source-dir>/tsconfig.base.json docs/deepseek-harness-v2/scripts/official-probes.ts <source-dir>
```

图重建顺序：`draw_figures.py` → `renderer-preview.tsx`（tsx 执行）→ `render_figures.mjs`。后者需要 Playwright 与 Chrome，可通过 `AIFOUNDRY_QA_NODE_MODULES`、`AIFOUNDRY_QA_CHROME` 指定。重新渲染后 manualReview 重置为 PENDING，必须重新看图并写明检查范围；不得用旧人工审图结果冒充新图。

研发文档由 scripts/author.py、specs.py、specs_advanced.py、concepts.py、figure_specs.py、generate_packet.py、reports.py 生成。应先改这些可审查源文件，再生成文档；图修改其 SVG 生成脚本。source-index.json 保存路径/行号/哈希，source-integrity.json 保存完整归档校验。

## 工作区与旧项目

旧浏览器课程已独立移出四个专属目录，供用户手动删除，见[移出记录](../legacy-retirement-20261028/README.md)。待删除位置：`C:\Users\QYF\Desktop\delete\AIFoundry-legacy-browser-20261028`。恢复标签 `codex/pre-harness-v2-20261028`；清理提交 `3935102`。未执行批量删除。

原有 Stage 1–4、Capstone、用户权限、价格、数据库、发布与统计文件均保持原样；原有 output/ 与秘密文件仅比较哈希，没有读取到交付正文。研发材料使用独立提交，不推送，不发布。后续从 H01 单讲研发，本轮在此停止。
