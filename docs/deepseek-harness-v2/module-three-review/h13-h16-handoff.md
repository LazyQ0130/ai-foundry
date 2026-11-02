# H13–H16前置知识衔接

只给衔接说明，未制作H13或改后续蓝图。完整阅读V2.0四课的前置、唯一目标、源码路线、实践与边界后，建议以“**模型声明能做什么，宿主为什么/如何才实际做**”接下一模块。

| 下一课 | 已具备的第三模块能力 | 仍需新增的知识 | 开场回忆产物，不提前实现本课 |
|---|---|---|---|
| H13：Tool Registry/Schema/可见性 | H11候选tools.resolve固定toolSet、Schema进请求；H12 ToolCallBlock有id/name/原始arguments字符串 | ToolsService真实定义、Scope覆盖/限制、when接纳、output契约；本版本不是叫ToolRegistry的单一类包办所有行为 | 用M3 B的c1/read_fixture/参数/结果表，问“本次Schema来自哪项定义，执行又用哪项定义？” |
| H14：执行流水线 | H10 Step等待工具批次、结果进入下一Step；H12正常message先结算再执行 | prepare/pre/ask/guard、dispatch/around/body、post/project/finalize与权威结果；错误与观察通知 | 比较模型tool-call、tool/call、工具主体、tool/result四个时刻；指出改回执不能撤回已发生副作用 |
| H15：审批/权限/守卫/沙箱 | Scope不是安全隔离；Handle所有权不是业务授权；cancel不回滚；Schema可见不是批准 | 用户确认、单调守卫、OS文件效果强制及full/partial；平台限制 | 给“审批允许但guard拒绝”的预测：body必须0；不据“可见/完整参数”宣称可执行 |
| H16：文件/Shell/Web/MCP接入 | 统一调用/结果与下一请求、资源归属和取消等待 | 四类Definition/Provider/Consumer、远端发现/Transport、信任和生命周期差异 | 用四列表定位能力定义、具体提供方、模型工具消费者及外部信任；统一流水线不抹掉底层边界 |

H12的ToolCallBlock连接H13有**输入与执行两个方向**：请求前H11已经从Tools定义解析toolSet、描述Schema给模型；模型返回后H12组装出提议，再按名称/参数交给同一Step接纳的工具能力。H13不是第一次才出现Tools，也不是Assembler凭块创建一个工具。模型知道某工具表示请求里声明过它；真正可执行还要有当次定义/执行器/接纳集合与后续策略，模型也可能生成声明外名字，因此不能只信模型。

H14仍不可省：接口/Schema说明形状，无法回答body是否运行、错误怎样规范、附加Context怎样反馈、最终结果谁能改。H15必须单列，因为执行流程正常不等于用户批准/业务授权或OS强制；允许一次也不能放宽guard，结果isError也不能证明写入没发生。H16再把统一入口下的不同能力接起来，MCP发现只是远端描述，不自动增加本地权限，Shell/文件/Web也各自有提供方边界。

建议前置自检：能独立完成综合13–16；能指出工具结果的`message.toolCallId`与`tool/call.data.callId`关联；能区分step toolSet和一次请求的tools字段；能用源码说明max-tokens/取消时工具0及committed/abandoned。未通过时回看相应段与同一轨迹，不让学员先通读H14/H15补救本模块缺口。此门槛是作者建议，未校准为真实学员准入考试。

保持原蓝图范围：H13以集合/定义为增量；H14以流水线权威结果；H15以独立安全责任；H16以能力地图与接线；完整MCP重连、故障恢复和Provider工程仍留H27/H20/H26。第三模块完成不自动触发这些课程研发或发布。
