# H02 课程交付

2026-10-29。H02《从零读懂 DeepSeek Harness 仓库结构》已完成作者侧制作，**未发布，学员试读与独立外审待完成**。源码继续固定于 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；前序 H01 为 `a6c147a`。

## 阅读与复核入口

- [完整正式正文](../../../course-content/internal/deepseek-harness/h02/lesson.md) · [可直接打开的完整阅读预览](reading-preview.html)
- [源码核对清单](source-checklist.md) · [原始范围、哈希和语义锚](evidence/source-check.json)
- [练习程序](../../../course-content/internal/deepseek-harness/h02/lab/navigate.mjs) · [参考答案](../../../course-content/internal/deepseek-harness/h02/lab/reference-answer.json) · [八项行为测试](../../../course-content/internal/deepseek-harness/h02/lab/navigate.test.mjs)
- [知识衔接矩阵](knowledge-bridge.md) · [教学质量审查](quality-review.md) · [最终验收](evidence/validation.json)

正式正文使用 Renderer V2 的五字段元数据，四个新任务键不复用其他课程。正文与答案均保存在内部内容目录；不接入目录、路由、下载白名单、数据库、权益、价格与正式课数。作者预览只使用 localhost 夹具或本地静态文件，不发布课程。

本课围绕原生工具执行，训练“场景→入口→组合→契约/实现→测试”的证据查找；图中明确区分查找路线、源码关系、构建引用和运行时调用。Host/Client 用自足解释和文本示意连接前后端基础，不提前展开远程协议或完整编译工程。

## 配图

| 图号 | 目的 | 源文件 | 成图 |
| --- | --- | --- | --- |
| H02-01 仓库职责地图 | 区分应用入口、主干、能力、组合、基础与文档；两级包归属 | [SVG](figures/source/h02-01.svg) | [PNG](figures/rendered/h02-01.png) |
| H02-02 功能反查路线 | 用原生工具执行定位入口、服务、契约、实现和跨包测试 | [SVG](figures/source/h02-02.svg) | [PNG](figures/rendered/h02-02.png) |
| H02-03 三种关系 | 显示导入/项目引用与运行时分派方向的区别 | [SVG](figures/source/h02-03.svg) | [PNG](figures/rendered/h02-03.png) |

沿用 H01 的浅青底、深蓝字、青绿主线和琥珀配置色。SVG 宽 640，主标签 32、辅助文字 28；PNG 以 2 倍像素生成。320 宽度的正文区域为 288，图内辅助字约 12.6px、主标签约 14.4px，支持原图查看。长图采用纵向阅读，不把全仓依赖挤进小横幅。完整 alt 与图注在正文；路径、事实编号与来源见 [figures.json](evidence/figures.json)。

所有图为原创教学重绘，没有使用官方图片、字体文件或虚构软件截图。蓝图原设 H02 一张导航图；根据本轮新增的反向定位与关系区分要求扩为三张，没有修改其他课图规划或制作 H03。第三张选择关系对照，Host/Client 以正文文本示意和真实配置链接讲解。

正文图片路径为 `/course-media/harness-v2/h02/h02-0N.png`；作者服务器将三个精确路径映射到本目录成图，已实际检查加载与原图 popup。文件未复制到 `public`，现有线上路径尚未部署。这是本轮未发布内容包的本地验证方式。静态阅读预览将图片映射为相邻文件，并明确移除无 React 挂载时不能工作的复制按钮；正式组件的复制交互另有真实挂载测试。

## 复现检查

以下在 AI Foundry 根目录，使用已有 Node、Python 和项目依赖；不在此安装 Harness 依赖。每条成功后再继续。

```powershell
python -X utf8 docs/deepseek-harness-v2/h02/scripts/sync-lab.py
python -X utf8 docs/deepseek-harness-v2/h02/scripts/check-sources.py
node --test course-content/internal/deepseek-harness/h02/lab/navigate.test.mjs
node --import tsx docs/deepseek-harness-v2/h02/scripts/check-content.ts
python -X utf8 docs/deepseek-harness-v2/h02/scripts/draw_figures.py
node --import tsx docs/deepseek-harness-v2/h02/scripts/make-reading-preview.tsx
node --import tsx docs/deepseek-harness-v2/h02/scripts/preview-and-qa.tsx
python -X utf8 docs/deepseek-harness-v2/h02/scripts/final-audit.py
```

源码脚本默认读取 V2.0 的固定源码和 Git 缓存，其他机器用 `HARNESS_SOURCE_CACHE` 与 `HARNESS_GIT_CACHE` 指向同一 Commit；逐文件核 Git tree blob，不凭目录名字信任版本。浏览器检查使用 Chrome、Playwright，可通过 `AIFOUNDRY_QA_CHROME` 和 `AIFOUNDRY_QA_NODE_MODULES` 指定路径。临时浏览器构建写系统临时目录，测试夹具保留；本轮不执行批量删除。

`sync-lab.py` 只更新本课完整程序、答案折叠区和参考 JSON。短证据行与固定源码单独核对，脚本 PASS 不能证明学员独立查找或官方功能已运行。修改正文或图后重跑对应门禁，再重新看图；作者人工记录不能自动套用到改后的内容。

## H01 → H02 → H03

H01 的六行职责在 H02 落成可追溯的文件地图；模型提议与工具执行的分工保持一致，H02 增补工具服务与具体执行器之间的契约、注册和分派。没有重复 H01 的模型与执行程序对照实验。

交给 H03 的学习结果是两份记录：功能定位路线、按源码/构建/运行期分层的六条边。H03 下一步需要回答一次输入的接收、模型请求、工具分派与会话记录的时间顺序；不能把本课的导航虚线当作调用时序。预备接口是 `ctx.agents`、默认循环、`ctx.llm`、`ctx.tools` 和 Session，具体输入队列与事件时序待 H03 单独核查，不在此生成正文。

蓝图预计 60～80 分钟，本轮增加十个重点术语、两项练习与三图，暂估 90～120 分钟；可选语法补课另计 10～15 分钟。实际时长和学习效果待试读，不以技术通过替代。完成本轮后停止，不自动制作 H03。
