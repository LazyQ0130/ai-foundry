# H01 样板课研发交付

2026-10-28。课程正文已完成，状态为**作者审阅完成、未发布**。只制作 H01；H02 仅保留衔接说明。

## 从这里审阅

- [完整正式教材](../../../course-content/internal/deepseek-harness/h01/lesson.md)：Renderer V2 的五字段元数据与 Markdown；正文内含完整实验、练习和折叠答案。
- [本地完整阅读预览](reading-preview.html)：无需启动平台，原生折叠可用；静态页移除无水合的复制按钮，避免假装可点击。正式组件的真实复制交互另有自动化验收。
- [源码引用与核对清单](source-checklist.md)：固定版本、关键断言、阅读顺序和验证边界。
- [教学质量审查](quality-review.md)：概念、复习、难度、图示、实验及待试读事项。
- [实验源码](../../../course-content/internal/deepseek-harness/h01/lab/compare.mjs) · [自动化测试](../../../course-content/internal/deepseek-harness/h01/lab/compare.test.mjs)。

本目录的三层 `../` 回到仓库根目录。正文、实验、图、答案与预览均未放入 `public`。不注册路由、下载白名单或课程元数据；不增加 29 节 Stage 或 Capstone 的统计与权益。

## 三张图

| 图 | 教学节点与用途 | 源图 | 成图 |
| --- | --- | --- | --- |
| H01-01 职责关系 | 四个概念解释后；识别提议、执行和组合边界 | [SVG](figures/source/h01-01.svg) | [PNG](figures/rendered/h01-01.png) |
| H01-02 工程问题对照 | 任务变长后；从循环主线推导工程需求 | [SVG](figures/source/h01-02.svg) | [PNG](figures/rendered/h01-02.png) |
| H01-03 核心模块协作 | 文档模块表后、源码精读前；建立导航地图 | [SVG](figures/source/h01-03.svg) | [PNG](figures/rendered/h01-03.png) |

三张均为原创教学重绘，事实绑定固定源码；没有引用第三方图片或生成软件截图。颜色延续 V2.0 的蓝绿、琥珀警示与浅底；SVG 宽 640，正文最小 28 单位，PNG 2 倍栅格化。320 视口正文区域 288 像素时，图内最小字号约 12.6 像素，并提供原图查看。图 1 是职责示意，图 2 是问题清单，图 3 是默认协作概览，不能当作完整依赖或时序图。

完整 alt 和图注在教材；路径映射与事实编号见 [figures.json](evidence/figures.json)。本课在最新单讲需求下由蓝图原先的一张扩展为三张，沿用原图编号并新增 H01-02/03；没有修改 V2.0 全课图表或批量制作其他课。

教材采用 `/course-media/harness-v2/h01/h01-0N.png`。作者 localhost 夹具将这三个**精确路径**映射到本目录实际 PNG，已验证加载和原图查看。它们尚未部署到公开目录，直接访问现有线上路径不会获得新课图片；这是一份未接入平台的完整内容包，不是已经上线的课程。未来是否公开这三张教学图及如何提供受保护资源，需在单独集成任务决定；正文和答案不进入公开静态目录。

## 复现验收

在 AI Foundry 根目录执行；不安装 Harness 依赖，不需要模型 Key。先使用项目已有 Node 依赖与 Python。图示 QA 使用本机 Chrome 和 Playwright；可通过 `AIFOUNDRY_QA_CHROME`、`AIFOUNDRY_QA_NODE_MODULES` 指定位置。

```powershell
node course-content/internal/deepseek-harness/h01/lab/compare.mjs
node --test course-content/internal/deepseek-harness/h01/lab/compare.test.mjs
python -X utf8 docs/deepseek-harness-v2/h01/scripts/verify_sources.py
node --import tsx docs/deepseek-harness-v2/h01/scripts/check-content.ts
node --import tsx --test tests/lesson-renderer.test.ts
python -X utf8 docs/deepseek-harness-v2/h01/scripts/draw_figures.py
node --import tsx docs/deepseek-harness-v2/h01/scripts/preview-and-qa.tsx
node --import tsx docs/deepseek-harness-v2/h01/scripts/make-reading-preview.tsx
python -X utf8 docs/deepseek-harness-v2/h01/scripts/final-audit.py
```

每条成功后再执行下一条。源码校验默认读取 V2.0 的固定缓存；另一台机器需将**同一 Commit**的源码目录填入 `HARNESS_SOURCE_CACHE`，固定 Git 对象库填入 `HARNESS_GIT_CACHE`。新增引用未覆盖于 V2 索引时，用该 Commit 的 Git tree blob 复核，不接受仅有目录同名的文件。

修改实验后，先执行 `python -X utf8 docs/deepseek-harness-v2/h01/scripts/sync-lab.py`，同步正文折叠区；校验器再检查完整程序和短摘录与受测文件一致。两份代码不独立维护。运行浏览器验收会生成私有截图和报告，并启动、关闭自己的 localhost 服务；临时构建只写系统临时目录，没有执行批量删除。

## H01 到 H02 的交接

学生带走六行职责地图：`agents`、`agentLoop`、`systemPrompt`、`llm`、`tools`、`sessions`，并为其中一项附上文件与符号。H02 才开始解释根目录、两级包组织、文档与测试导航，并练习“问题→文档→接口→实现→断言”的搜索路径。H01 不展开 Cordis 生命周期、Turn/Step 状态机、工具流水线扩展和 Session 回放算法，分别留给后续既定课时。

相比蓝图 H01 的 55～75 分钟，本样板增加三图、五组实验和三道完整推理题，暂定 80～110 分钟。该时长是作者估计，尚待真实学员校准；不以技术检查通过代替教学效果验证。
