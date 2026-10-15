# P2 研发交付报告

2026-10-14。**P2教学工程、正文和自动化研发已完成；完整验收结论为BLOCKED：21项PASS、0项FAIL、3项原生交互待补证，尚不能宣布GO。** 三项已合并为一次约5分钟人工操作。没有进入P3，没有发布或修改平台状态。

## 八项交付

| 交付 | 位置 |
|---|---|
| Student Starter | [源码ZIP](../../../course-content/internal/ai-browser-copilot/p2/deliverables/ai-web-reader-p2-starter.zip)；源在starter/ai-browser-copilot/p2 |
| Reference | [源码ZIP](../../../course-content/internal/ai-browser-copilot/p2/deliverables/ai-web-reader-p2-reference.zip)、[可加载生产扩展ZIP](../../../course-content/internal/ai-browser-copilot/p2/deliverables/ai-web-reader-p2-reference-chrome.zip) |
| 正式完整正文 | [lesson.md](../../../course-content/internal/ai-browser-copilot/p2/lesson.md)，未注册到线上课程 |
| 验收矩阵/原始证据 | [acceptance-matrix.md](acceptance-matrix.md)、[artifacts](artifacts) |
| P1→P2增量 | [increment-from-p1.md](../../../course-content/internal/ai-browser-copilot/p2/increment-from-p1.md) |
| Starter/Reference差异 | [starter-reference-diff.md](../../../course-content/internal/ai-browser-copilot/p2/starter-reference-diff.md) |
| P3衔接规格 | [handoff-p3.md](../../../course-content/internal/ai-browser-copilot/p2/handoff-p3.md)，仅设计，不含P3实现 |
| 最终研发报告/待收尾 | 本文件、[最小原生步骤](manual-chrome.md) |

所有源码包各19文件，生产包各5文件；源码ZIP含package.json，生产ZIP含manifest.json，需解压才能加载。Starter生产包只是练习起点产物，不能当P2完成态。作者测试脚本和Profile不进学生包。

## 最终架构及教学取舍

以P1 Reference直接增量，WXT0.21.4、React/DOM18.3.1、TS5.9.3、React模块1.2.2不变；全部170个P1锁条目version/integrity保留，只加Phase0已有Zod4.6.5。engines从>=22明确为>=22.12.0，纠正下游实际要求；独立Node24.16.0/npm11.13.0实测。不重建脚手架，不升级已验证技术线。

普通action回调立即sidePanel.open(windowId)，模式false，无popup。产品只申请sidePanel、activeTab、scripting、storage；不申请tabs、host权限或常驻Content Script。开发时WXT添加tabs/回环host；最终生产Manifest无这些开发增量。CSP仍connect-src none，本课没有网络API。

Panel→严格v1消息→Background→固定顶层frame0/ISOLATED只读提取→核对→Panel。CAPTURE和CHECK_CONTEXT为唯一操作，精确sender ID/URL并拒绝普通扩展tab/网页来源。TS配Zod运行时校验、关联UUID，正文只能作为普通字符串；UI用React文本，不执行网页指令。

PageContext含windowId/tabId/url；Phase0的storage.session匿名UUID租约与串行写入复用，新增关闭清理和存储错误可重试。loading/url/激活/移出/替换触发同步失效；worker启动同步注册监听，不强行保活。Chrome documentId补充同URL换文档检查，后台注入/探测前后核对；侧栏本地generation、响应ID、最终CHECK_CONTEXT及再次context核对阻止旧成功/旧错误提交。后台4秒、侧栏6秒整体时限；超时不假称取消已开始的注入。

正文分heading/paragraph/list/code块，编号连续。排除脚本、导航、隐藏/透明子树、表单/可编辑区域、iframe/Shadow；总量含换行6000 UTF-16码元、单块1500、最多100块、扫描20000节点，限长提示可见，保留行内空白和代码换行，emoji不截断代理对。第一版是可检查的有限提取器，不声称所有网站主文完美识别；普通顶层HTML之外不支持，SPA同URL局部变动需主动重读。

Starter保留P1的完整入口和确认，提供严格契约及匿名session基础工具；核心提取/协调/客户端/事件连线/结果UI留作练习。Reference只完成P2。正文含真实场景、环境职责、5组分步Prompt、10任务、来源/异步审查、操作验收表和故障恢复；预计180–240分钟，学习时长尚待学员试讲，不等于已验证教学效果。

## 已实际执行的验证

- 两个最终源码ZIP分别解压到仓库外全新TEMP目录，独立npm ci/typecheck/build全部exit0；未复用主仓库node_modules，也未清空旧验证目录。最终Chrome测试加载的是该次重装Reference产物，5文件哈希逐字节等于交付生产ZIP。
- 两个WXT开发服务分别真实启动，HTTP /@vite/client返回，开发Manifest另存。故意TS2322失败与修复成功在验证副本执行，未改学生源。安装和故障完整日志见delivery/checks目录。
- 24项生产模块确定性测试PASS，覆盖非法协议/来源、窗口/标签页/URL/loading、无权限、空页、代次失效、同URLdocumentId变化、旧成功与旧错误、后台/侧栏超时、最终context变化、session恢复/删除/错误重试。适配器替身范围明确，未把它写成原生授权证据。
- 实际安装Chrome155.0.8059.41 headless加载两份MV3产物；Starter P1确认成功且P2按钮禁用；Reference真实action监听/模式正确，未授权直接注入被Chrome实际拒绝，生产CSP拒绝外连。
- 为独立检查P2读取链路，另建作者夹具扩展：仅改name/增加127.0.0.1测试host权限，加入两份打开测试侧栏的QA文件；其余产品JS/CSS/HTML按哈希保持不变。由该夹具HTML实际打开Chrome Side Panel，连接真实侧栏文档，实际runtime消息→worker→隔离顶层注入→React展示通过。**这不是产品工具栏activeTab验收，也没有伪造action点击。**
- 同一受控Chrome中实际A/B切换清正文、同URL刷新拒旧快照并重读、隐私/限长/扫描/空文档/非HTML/行内空白均通过；测试用生产提取器在真实DOM和真实消息链路分别核对，结果一致。390宽侧栏截图已查看，无横向溢出。
- 实际stopWorker终止后台，观察目标停止及全局实例标记丢失后重建；未换页CHECK保持成功，停止期间刷新后旧CHECK拒绝，真实storage.session只存UUID。Chrome会复用CDP targetId，因此没有把targetId变化当重启必要条件，也没有用重新加载整个扩展代替worker重启。
- 现有实际Parser/Renderer私有预览PASS，10任务/5Prompt/40份已有正文key无冲突；Chrome验证剪贴板、折叠区、任务完成、1440/390布局。已有无DB Renderer测试9/9。Prompt截图已目视检查。未触及线上授权、下载、进度持久化或发布。

未执行主站全量npm test（涉及DB迁移/种子）、主站发布构建、平台集成或模型调用。Chrome116只为声明下限未实测，Phase0/P1 GO与本轮受控Chrome结果不能自动授予P2产品原生GO。

## 修复与证据

初次类型检查发现Chrome类型包没有示例中的TabActiveInfo/TabChangeInfo别名、DOM未启用iterable；改为已声明结构类型与不依赖DOM iterable的写法，最终两个独立工程typecheck通过。提取器在测试前补了真正中断遍历的扫描限额，修复行内纯空白丢失和emoji边界，相关真实DOM夹具通过。

Chrome最初以普通扩展tab测试消息被BAD_MESSAGE拒绝，原因是sender不同；保留校验并改真实Side Panel测试。Playwright不枚举非tab侧栏，Chrome Target有真实文档；作者仅在自建隔离测试Profile连接该文档，没有绕过用户原生工具栏授权。worker测试最初错误假定targetId必变，实际Chrome可复用，改用实际停止/实例内存丢失证明。原失败JSON、目标列表均保留，索引见矩阵。

## 三项原生证据仍阻断

原生Windows电脑控制此前被工具中止，无法可靠判定Chrome当前URL；当前网页浏览器能力不能代替Chrome工具栏。我们已完成不依赖该原生控制的验证，但不会用受控host夹具或模拟action来补PASS。

最终生产包已解压到稳定路径`C:\Users\QYF\Desktop\AIFoundry\.runtime\p2-native-20261014\extension`，五文件哈希与最终交付一致；Profile由用户实际启动时创建。P2-22正常HTTPS工具栏授权/打开、P2-23未授权与跨源撤权/重授权、P2-24原生刷新/内置拒绝/恢复合并一次指南，用户可一次报告，无需逐项往返或重做自动化。

没有核心技术失败尚未修复；阻断来自必要原生证据缺失。补齐真实结果及验收对象后更新矩阵/本报告，才可判断P2 GO；若任一失败，先修复并定向复验。之后仍需用户明确授权才能进入P3。

## 工作区隔离

本轮新增交付只在docs/ai-browser-copilot/p2、course-content/internal/ai-browser-copilot/p2、starter/ai-browser-copilot/p2；验证在新.runtime/TEMP目录。无staging、commit或push，无批量删除、清理、回退或git add .。

开始1891份既有文件当前内容哈希已记录，结束1871份不变、20份出现其他工作区活动的变化、0缺失。20份路径在scope-audit.json完整保留，包括Stage3/4工具、正文、Environment和vite.config等；本任务没有写入这些文件、没有回退或打包它们，不声称整个共享工作区无变化。Phase0 **273/273不变**，P1源码/报告/证据与V1.2无变化；课程权限、DB、权益、进度、统计和发布均未修改。

ZIP白名单与逐字节检查独立排除混包；无密钥/.env/Profile/缓存/开发绝对路径。若未来提交，只可显式选择本轮三个P2新目录，不能提交整个共享工作区。

## 固定交付哈希

| 文件 | SHA-256 |
|---|---|
| ai-web-reader-p2-starter.zip | 4c5e27216af5d816576ba682e44233207d2bd22e7528b3e3a96e5362d890f3b1 |
| ai-web-reader-p2-reference.zip | c0da4160686bc6c994a7a9e86fa7c9145979605d6c21b90067893366280e8777 |
| ai-web-reader-p2-reference-chrome.zip | 8edaf81047449d9727baf79194e3ffa7a8836aa585c345dc3dcddf7245edd30f |

重验入口为本目录的package-and-verify.py、unit.test.ts、browser.mjs、dev-and-tests.mjs、validate-content.ts、audit-scope.py。作者工具会创建新的验证目录并保留失败证据；不会批量清理。无需为了人工补证重跑整套，未变化的自动化结论保留。
