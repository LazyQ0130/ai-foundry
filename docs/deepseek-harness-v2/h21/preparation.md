# H21 研发准备与蓝图核对

2026-11-04；首项课程定位依据为本地[A蓝图](../A-blueprint-v2.md)，不是任务暂定标题，也不是外部最新分支。研发基线 `0aeaa54`。输入文件的完整字节身份在[evidence/preparation-inputs.json](evidence/preparation-inputs.json)；hash仅用于复核输入，不能代替语义审读。

| 正式顺序 | 蓝图标题与唯一核心目标 | 本轮处理 |
| --- | --- | --- |
| H21 | Subagent、任务委派与多智能体协作；用activation的所有权和delivery区分新建、Fork与外部执行 | 使用正式标题；按本轮要求深化真实C/D实验 |
| H22 | Workflow、Jobs、Goal 与任务调度；按生命周期选择四种任务抽象并画清组合 | 只制作前置交接 |
| H23 | CLI、Web UI、SDK 与远程通信；追控制动作与状态订阅过载体边界 | 不开发远程载体 |
| H24 | 大型 Agent 系统测试与综合架构分析；建立跨模块事实/测试/限制矩阵 | 只保留本课证据分级，不提前制作结课课 |

H21蓝图原预计110–150分钟，正式稿作者估180–250；差异保留，未回写蓝图。Agent Teams按蓝图仅列为显式启用的实验扩展，主线为Subagent seam。蓝图M6模拟器不是本轮C/D实验的替代；本轮使用真实官方运行组件。

前置材料包含第一至第五模块正式审查报告及有效标准链：E规范、第一模块v1及第二至第五增补；没有以README摘要代替前课正文/代码机制核对。指定正文研读关注下列实际章节，并与本课对应官方源码和测试选读交叉核对：

| 输入 | H21带入的机制与增量 |
| --- | --- |
| H05 正文、服务例子 | Plugin、Service、Context、inject与注册；本课按Runtime/Provider/模型Consumer区分 |
| H07 正文及生命周期实践 | Fiber、Effect、重复释放与等待；本课Manager结构owner和精确Activation清理 |
| H09 正文及ownership/failures | Factory、Registry、Handle及五维所有权；本课新增委派后代协议 |
| H10 正文及Inbox轨迹 | queue/steer、领取与模型事实、Turn/Step；本课消息回执不等回复 |
| H13 正文及Scope/准入实践 | 全局/局部工具、动态准入和登记生命周期；本课真实父子不同集合 |
| H14 正文及结果链 | 模型提议、执行、结果及后续请求；本课委派ToolResult不是子任务最终结果 |
| H15 正文审批/沙箱主线 | Scope不等于沙箱、审批与执行策略分层；本课列实际delegation policy，不泛称全继承 |
| H17 正文、事件/读模型实验 | 事件、Surface、Seq/Offset及flush边界；本课目录/descriptor与模型消息分开 |
| H18 正文、恢复/Fork与综合 | 合法含切点前缀、开放尾、writer与新实例；本课Provider改用已完成Turn切点 |
| H20 正文、取消/停稳/未知效果 | 合作信号、idle/dispose差异及保守恢复；本课按阶段核Manager取消责任 |
| H20→H21与第五模块交接 | 不把普通Fork当运行时父子、不给旧子目录授活权限；本课实际运行验证新机制 |

第五模块当前复核为128执行项C65/D63、H18提交a8fe4fb；本课没有复跑或重新分级这128项，不挪作本课测试数量。学习负担P2、真实成本/性能、E、试读、实测时长及外审仍开放。

固定官方源码研究入口包括subagent包组/服务README、subsystems文档、index/types/manager/activation/child-agent/descriptor/catalog/list-children/continuation-messages、Spawn/Fork、两个工具包，以及Agent/Loop/Session/Persistence的调用/结果/创建分支。外部四Provider读取其start能力、单次执行及资源协议，仅静态；不作为本课真实运行依赖。

官方测试读取相关setup、action和assertions，作者实验沿用其隔离/门闩模式并去掉递归清理方式；没有执行原Vitest套件或更改上游源码。详细每断言位置及实际执行等级见[source-checklist.md](source-checklist.md)。
