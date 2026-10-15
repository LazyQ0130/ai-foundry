# P2 验收矩阵

2026-10-14。**21 PASS / 0 FAIL / 3 BLOCKED；P2完整验收闸门仍为BLOCKED，不是GO。** Starter与Reference、正文及全部作者自动化已交付。P2-22～24等待一次人工原生验收；不自动进入P3，不发布。

证据分层：S=源码/包/构建，D=Node确定性适配器，C=实际Chrome155 headless，N=产品真实原生工具栏与activeTab操作。D不能代替C/N；C中的本机host夹具不能代替N。下表PASS都限定到标明的范围。

证据代号：

- **A**：[最终包与仓库外重装](artifacts/delivery-1791973166736/report.json)，两份各19文件，ci/typecheck/build日志和Manifest同目录。
- **B**：[确定性/Renderer/dev/故障恢复](artifacts/checks-1791973212864/report.json)，28项P2、9项原Renderer，原始txt同目录。
- **C**：[最终真实Chrome运行](artifacts/chrome-1791973208067/report.json)，原始消息、实际DOM结果、产品/夹具Manifest、夹具差异和截图同目录。
- **R**：[实际Parser/Renderer静态检查](artifacts/content/parser-renderer.json)，40份已有正文无新key冲突，10任务/5Prompt。
- **W**：[原始工作区基线](artifacts/protected-baseline.json)、[最终隔离审计](artifacts/scope-audit.json)。
- **N**：[人工目标及哈希](artifacts/manual-target.json)、[一次人工步骤](manual-chrome.md)，尚无实际操作结果。

| ID | 验收内容 | 状态 | 层级与证据 |
|---|---|---|---|
| P2-01 | P1工程连续性、固定工具链、lockfile来源 | PASS | S/A；保留P1全部170锁条目，只增加Phase0已有Zod；[增量说明](../../../course-content/internal/ai-browser-copilot/p2/increment-from-p1.md) |
| P2-02 | Starter继承P1而不含P2完整答案 | PASS | S/C；7处完成态差异，Starter实际Chrome确认成功、读取禁用；A/C |
| P2-03 | Starter源码ZIP在仓库外新目录安装/类型检查/构建 | PASS | S/A；*-fresh-ci/typecheck/build.txt，exit0 |
| P2-04 | Reference源码ZIP在仓库外新目录安装/类型检查/构建 | PASS | S/A；相同三类日志exit0；最终浏览器测试使用此目录产物 |
| P2-05 | 两工程WXT开发服务器实际启动、HTTP响应 | PASS | S/B；分别访问127.0.0.1:3080/@vite/client，开发权限另记 |
| P2-06 | MV3、4项最小生产权限、固定注入边界、生产CSP | PASS | S/C；无tabs/host/content_scripts/popup；实际未授权注入被Chrome拒绝、生产fetch被CSP拒绝；A/C |
| P2-07 | 实际顶层HTML标题/URL/块/正文结果 | PASS | C；真实隔离注入与DOM结果一致，heading/paragraph/list/code编号可核对；C |
| P2-08 | 隐藏/透明/脚本/导航/表单/可编辑/iframe/Shadow排除 | PASS | C；privacy含VISIBLE_OK，无SECRET_；指令字符串保持普通数据；C/dom-extraction.json |
| P2-09 | 总量/单块/块数/扫描限长、Unicode与行内空白 | PASS | D/C；long<=6000/1500、代理对完整、scan停止、inline词间空白及代码换行；C |
| P2-10 | 空内容与非HTML、受限URL支持范围 | PASS | D/C；NO_CONTENT/UNSUPPORTED_PAGE，URL策略单测拒绝内置/file/WebStore；C实际非HTML与普通扩展页拒绝。产品内置页人工见P2-24 |
| P2-11 | 严格消息与sender，非法请求不分配代次/不注入 | PASS | D；额外字段/版本/UUID/操作/来源及带sender.tab均拒绝；B |
| P2-12 | 真实Side Panel→runtime→worker→frame0→响应与React | PASS | C；单独host夹具、真实Side Panel文档；非普通扩展tab、非伪造sender；C及controlled-delta.json |
| P2-13 | 当前窗口/标签页来源隔离、切换清旧正文 | PASS | D/C；非活动tab/窗口拒绝；实际A/B切换清空并显示对应来源；C |
| P2-14 | 同URL刷新使旧快照失效，重读代次/documentId不同 | PASS | D/C；实际刷新清UI/拒旧CHECK，doc/token变化；D补事件间隙文档更换；B/C |
| P2-15 | 延迟的旧成功/旧错误不覆盖新结果 | PASS | D；真实生产coordinator/read-client配确定性延迟适配器，未声称原生网络延迟；B |
| P2-16 | 消息错误、上下文查询/注入超时、存储错误与恢复 | PASS | D；后台4秒/侧栏6秒机制，测试缩短时限；新尝试成功，无旧body；真实tsc失败exit2→恢复exit0为补充；B |
| P2-17 | MV3实际终止与重启后恢复当前token并拒绝已换页 | PASS | C；stopWorker实际停止、全局实例标记丢失、session保留；同页CHECK成功，停止期间刷新后旧CHECK拒绝；C |
| P2-18 | storage.session只存匿名代次、串行失效及关闭清理 | PASS | D/C；真实session只UUID键值；D验证写入顺序/release删除/存储失败后重试；B/C |
| P2-19 | P1 React确认、action监听与模式未回归 | PASS | S/C；Starter/Reference实际确认；真实worker有onClicked监听、模式false；N入口复验并入P2-22 |
| P2-20 | Lesson Renderer V2、Prompt复制/折叠/10任务/完成与布局 | PASS | S/C；实际组件私有预览，1440/390无溢出，5Prompt/40正文key检查，原Renderer9测试；B/C/R。未测试线上权限或进度持久化 |
| P2-21 | 交付白名单、安全扫描、证据与既有工作隔离 | PASS | S/A/W；19源码/5产物文件、字节哈希无敏感密钥/Profile/开发绝对路径；Phase0 273文件与P1/V1.2未改。最近审计另23个既有文件有外部变化，完整保留，未打包/提交 |
| P2-22 | 最终生产包新Profile原生加载、工具栏打开、确认与正常HTTPS读取 | BLOCKED | N；已有S/C不能证明该产品原生授权；目录与哈希已准备，待manual-chrome第一组 |
| P2-23 | 产品未授权新tab、同tab跨源撤权、真实工具栏重授权 | BLOCKED | N；D/C各有部分证据，但原生grant完整链路未实际操作；待第二组 |
| P2-24 | 产品原生刷新、内置页拒绝与回普通页恢复、无旧正文 | BLOCKED | N；刷新有C证据，完整产品原生操作与错误面板仍待第三组 |

## 保留的失败尝试与修复

| 原始证据 | 发生什么 | 最终处理 |
|---|---|---|
| [chrome-1791970954681](artifacts/chrome-1791970954681/report.json) | 测试把侧栏当扩展tab，真实sender.tab触发BAD_MESSAGE | 保留来源校验；改真实Side Panel文档调用，C最终通过 |
| [chrome-1791970976126](artifacts/chrome-1791970976126/report.json)及panel-targets | Playwright页面枚举没有侧栏，但Chrome Target确有该文档 | 仅在自建隔离headless测试Profile，连接该真实目标；不改产品，不触发工具栏grant |
| [chrome-1791971117581](artifacts/chrome-1791971117581/report.json) | 测试误认为worker重启后CDP targetId必然改变 | Chrome可复用targetId；改用实际stop/消失与全局实例标记丢失证明重启，session检查仍真实 |
| B/intentional-type-failure.txt | 新验证副本故意number赋string产生TS2322 | 仅修正测试文件，B/type-failure-recovered.txt exit0；交付源未受影响 |
| [timeout-regression-1791972430571](artifacts/timeout-regression-1791972430571/report.json)的before.txt/after.txt | 旧版在超时/失效后的晚到context之后仍启动CAPTURE，后台超时后也继续下一次注入/探测；新增4测试在旧版真实失败 | 补Panel generation存活检查和后台操作期限标记，避免启动后续读取；28项全部通过。修复前源码/生产ZIP留在旧delivery目录，最终包及C已按修复版重新执行 |

早期成功的较小范围运行也保留，不将后续新结论倒填到旧报告。Chrome116仍未实测，真实模型与最终产品验收均不属于P2，不占本轮PASS名额。
