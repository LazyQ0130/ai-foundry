# P1 研发报告与待收尾事项

日期：2026-10-14。范围：基础设计冻结、V1.2与P1全部教材/工程交付。**当前P1闸门：BLOCKED，16项PASS、4项真实原生验收待人工；不能宣布P1全部验收通过。** Phase0仍为GO，原始源码和证据未改。课程未发布，未进入P2–P8实现。

## 交付清单

| 交付 | 文件 |
|---|---|
| 研发蓝图V1.2 | [blueprint-v1.2.md](blueprint-v1.2.md) |
| Student Starter | [独立源码ZIP](../../course-content/internal/ai-browser-copilot/p1/deliverables/ai-web-reader-p1-starter.zip)，源在starter/ai-browser-copilot/p1 |
| P1 Reference | [独立源码ZIP](../../course-content/internal/ai-browser-copilot/p1/deliverables/ai-web-reader-p1-reference.zip)，源在course-content/internal/ai-browser-copilot/p1/reference |
| P1完整正文 | [lesson.md](../../course-content/internal/ai-browser-copilot/p1/lesson.md) |
| 验收矩阵与证据 | [p1-acceptance-matrix.md](p1-acceptance-matrix.md)、[原始证据](artifacts/p1-20261014) |
| Starter/Reference差异 | [starter-reference-diff.md](../../course-content/internal/ai-browser-copilot/p1/starter-reference-diff.md) |
| P2接口与衔接规格 | [handoff-p2.md](../../course-content/internal/ai-browser-copilot/p1/handoff-p2.md)，未实现 |
| 冻结决策/人工收尾 | [p1-decisions.md](p1-decisions.md)、[p1-manual-chrome.md](p1-manual-chrome.md) |

另提供[Reference生产扩展ZIP](../../course-content/internal/ai-browser-copilot/p1/deliverables/ai-web-reader-p1-reference-chrome.zip)，解压后才可加载。Starter的生产构建ZIP仅是起点产物，不含已完成练习，不作为完整插件使用。源码ZIP有package.json；生产扩展ZIP有manifest.json，二者用途不同。

## 最终架构与课程取舍

P1采用独立Node项目，WXT0.21.4 + React/DOM18.3.1 + TS5.9.3 + React模块1.2.2，单一package/lock。WXT root为项目目录、srcDir为extension，输出在.output，使用普通CSS。两个锁文件相同，170个非根条目的version/integrity都来自Phase0锁文件；未升级技术路线。

Background保留普通chrome.action.onClicked，在原生用户点击回调直接sidePanel.open(windowId)，没有先await；初始化、安装、启动恢复openPanelOnActionClick=false。生产权限只有sidePanel、无popup、host权限或常驻Content Script。React页面只显示欢迎语、能力边界与一次确认反馈。Starter有骨架但不含工具栏连线、可用的确认交互；Reference是这两项练习完成态，三处源码差异经机器核对。

开发服务仅绑定127.0.0.1:3080，显式设置生成origin相同，strictPort=true，关闭自动webExt启动。WXT为开发加入tabs/scripting和回环host权限，教材与证据明确单列。生产CSP为self脚本、self对象、connect-src none，符合本节没有API的边界。P1没有借用Phase0 Mock或模型代码。

V1.2保留activeTab临时授权、MV3空闲终止、storage.session/页面UUID代次、请求前后上下文检查、选区时效、权限/CORS/CSP分工等后续架构约束。它们是后续章节规格，未提前写进学生工程。Chrome155已有Phase0原生证据及本轮headless证据；Chrome116仍是未实测的声明下限。Mock往返、真实Provider、最终产品T01–T36各有独立验收边界。

正文遵循真实Lesson Renderer V2：五字段元数据、8项稳定任务key、4组可复制Prompt、合法教学块、故障表和实际操作步骤。学员先解释工程，再要求AI连接入口和完成React页面；检查事件顺序、亲自点按钮和新目录复验，避免把“复制完整Spike”作为本课。预计90–120分钟，实际学员学习耗时尚待试讲验证。

## 已实际执行的验证

1. 最终两个源码ZIP分别解压到新的.runtime目录，独立npm ci（含WXT prepare）、typecheck、生产build全部exit0。**又在仓库外系统TEMP的两个全新目录重复npm ci、typecheck和WXT build+zip**，排除复用主仓库node_modules/PostCSS；五个生产文件逐字节等于交付扩展ZIP。日志为*-final-package-*.txt与*-external-*.txt。
2. 两个真实WXT开发服务逐个启动，HTTP服务返回；第二个占用3080时实际失败，停止旧服务后恢复。真实Chrome155 headless加载Reference开发扩展文档，修改欢迎语后观察更新、恢复原文后再次更新。
3. 真实安装的Chrome155 headless使用测试CDP加载两份MV3产物，实际worker检查action监听器、getPanelBehavior、权限；Reference扩展文档点击确认后React状态成功，Starter禁用按钮符合练习起点；390/520宽度无溢出、无未处理页面异常。生产CSP实际拒绝外连尝试。**这些文档作为tab加载，不等同原生SidePanel验收。**
4. 人为加入number/string错误，真实tsc出现TS2322、exit2；仅移除该明确测试文件后exit0。离线缺tarball、端口占用等失败日志保留，恢复路径已写教材。
5. 使用仓库实际parseLessonContent、LessonMarkdown与LessonTaskCard进行私有预览，校验39份现有正式正文无新增key冲突；实际Chrome桌面1440/手机390宽度、Prompt剪贴板、折叠区、8项清单和完成按钮通过。现有无数据库Renderer单测9/9通过。桌面/手机截图已查看，文本未截断、Prompt正常换行。
6. 学员包白名单仅13文件，字节与源文件一致；不带Key、.env、日志、测试、Profile、node_modules、.wxt/.output或开发机绝对路径。固定ZIP时间元数据便于重建；作者验证脚本/日志不进入学员包。

没有执行主站全量npm test（会涉及数据库迁移/种子）、主站发布构建或平台课程路由验收。这里的课文渲染PASS是实际组件的私有本地预览，不代表线上受控下载、权益和任务持久化已经集成。正文附件按文件名交付，未注册虚构的resource ID。

## 修复过程与保留的原始失败

| 问题 | 原因/修复 | 最终结果 |
|---|---|---|
| 离线npm ci失败 | 缺yargs-parser tarball缓存；保留失败目录，在新目录联网按锁安装 | PASS，两个工程及最终ZIP仓库外重装均成功 |
| dev origin仍是localhost | WXT监听host与生成origin独立；显式同时设置回环 | PASS，最终Manifest为127.0.0.1开发来源，更新实际成功 |
| WXT ZIP名含undefined | extension root下没有第二份package元数据；改项目root+extension srcDir，使用唯一package.json | PASS，npm run zip正常输出0.1.0名称 |
| 作者HTTP探针超时 | 错把生成sidepanel.html当成开发HTTP路径；改探测/@vite/client | PASS，无修改学生功能来迎合测试 |
| 作者任务勾选脚本超时 | 选择器包括没有aria-pressed的禁用按钮；限定8个任务按钮 | PASS，原错误JSON保留，未修改平台组件 |
| 一次zip命令在主仓库执行 | 当前目录错误，npm提示Missing script；正确切换独立Reference目录 | PASS；日志保留，未触发主站构建 |

离线失败的node_modules及测试Profile均留在验证/忽略目录，没有批量删除。学员ZIP完全不包含这些失败缓存。所有尝试见矩阵的历史证据索引。

## 真实原生验收阻断

Windows computer-use在获取Chrome窗口时停止，原文为：

> Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy.

已停止该工具的本轮界面操作，不换模拟action、代码断言或普通扩展tab截图来补PASS。P1-16～19仍BLOCKED：原生工具栏打开/确认、原生侧栏开发更新、停止dev后的生产入口、新独立Profile安装及关闭重开。

解决方案：[人工指南](p1-manual-chrome.md)已准备最终源码ZIP重装后的可用目录，合并A/B两组约10–15分钟。必须记录实际Chrome版本、加载路径、Profile及逐项结果；失败则保存原始日志、调查修复，再复验。未收到真实结果前不宣布P1通过，不继承Phase0的原生测试结论。

## 工作区隔离

本轮新交付只在以下三个根目录：docs/ai-browser-copilot、course-content/internal/ai-browser-copilot、starter/ai-browser-copilot。构建/测试用.runtime及系统TEMP。没有改数据库、权益、授权、发布、进度、统计或现有Stage/Capstone文件，没有staging/commit/push。

开始时记录1439份已跟踪工作文件（包括用户既有未提交内容）与273份Phase0文件哈希。最终Phase0 **273/273不变**。工作区监测为1435/1439不变，另四份在本轮期间由其他操作产生变化：

- course-content/stage-2/s2-l3.md
- course-content/stage-3/s3-l4.md
- course-content/stage-4/s4-l4.md
- src/pages/Environment.tsx

这些文件不是本任务编辑的，未回退、未纳入交付，不声称整工作区逐字节无变化。保留原基线、最终git状态和差异路径；P1 ZIP白名单独立证明未混入其他改动。若以后提交P1，应仅按上述三个新根选择文件，不能git add整个工作区。

## 交付哈希与重验入口

| 源码ZIP | 字节数 | SHA256 |
|---|---:|---|
| ai-web-reader-p1-starter.zip | 26663 | 393cabd7878113feaad16cf641e1c1b8658189fa8ceae413bf4a3c6355b809db |
| ai-web-reader-p1-reference.zip | 26786 | 1ef8601e40a5ba28a22a61747ca1722497493cb80a10d7b3db9254876abba7be |

作者检查入口（不会连接数据库）：`node --import tsx docs/ai-browser-copilot/validate-p1.ts`，`node docs/ai-browser-copilot/browser-p1.mjs`，`node docs/ai-browser-copilot/dev-and-recovery-p1.mjs`，`python docs/ai-browser-copilot/check-p1-scope.py`。新安装应解压到新目录，prepare-validation.py也会拒绝复用目录，避免清空已有文件。browser脚本调用的调试安装只在作者QA使用。

**停止线：** 本轮保留已完成的设计、工程、教材和自动证据，等待上述P1原生人工收尾。没有进入P2，没有更改线上发布状态。原生验收完成并记录后，才能形成P1最终GO；即便GO也不自动授权研发P2。

## 人工收尾进展（2026-10-14 16:36）

用户依指南A操作，先提供确认按钮成功截图，再提供欢迎语修改生效截图，原图与对话来源存于artifacts/p1-20261014/manual-20261014-163615。已观察真实人工更新结果；恢复原文、明确工具栏关闭重开、Console及B组尚待执行/确认。截图为内容局部，不能独立证明浏览器工具栏位置。当前矩阵总数仍16 PASS/4 BLOCKED，未提前宣布原生验收完成。
