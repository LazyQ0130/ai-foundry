# H09 前置知识与衔接建议（只交接，不开发）

已核完整V2.0蓝图，特别是H09“Agent实例创建、注册和所有权”的20项设计字段，以及H08既有handoff。本轮止于H05–H08审查，没有新建H09正文、图、实验或产品任务。

| H09需要带来的能力 | 来自哪里 | 进入下一课前可观察的自检 |
|---|---|---|
| 包/模块/对象与调用路线不同 | H02、H05 | 能指出Registry服务、Factory实现与调用者并非同一对象 |
| 宿主贡献/服务需求/运行实例不同 | H05–H07 | 综合A解释注册、ACTIVE前服务不可用、依赖失去不等于显式永久释放 |
| await只等其被连接的任务 | H06、H07 | 能解释回调在途、清理任务和业务drain的范围 |
| 父子所有权与服务依赖不同 | H07 | 能沿真实持有的释放入口找owner，不按调用或import位置猜 |
| 配置身份与运行身份不同 | H08 | 综合C区分Entry/Fiber和加载结果；配置树存在不证明Agent已创建 |
| 清理不是通用回滚 | H07、H08 | 能分别讨论已登记资源、未发布对象、已写外部效果与恢复失败 |
| 事件通知不是持久事实完成 | H03、H06 | 能区分announce/观察通知、事实接纳、flush，不能按事件前缀推持久化 |

建议下一课开头仅回忆“谁创建、谁拥有退出义务、何时可对外见到”，用一次setup中途失败的问题驱动。增量应集中于 AgentRegistry/AgentFactory/AgentHandle 和初始化发布边界，而不是再讲整套Cordis。蓝图已指定caller所有权与factory注册Context不同；ownerId业务授权、Stage4 Run状态也不是生命周期owner。

下次获授权后精读蓝图路线：`packages/core/agent/src/index.ts` 的AgentHandle与create委托；`packages/core/agent-loop/src/index.ts` 的initializeAgent/createAgent。审查重点应是准备→Session announce→setup.commit→Agent登记/announce→返回handle，以及相邻失败路径的退出台账；不能把这个设计路线写成已执行H09实验。源码定位见蓝图H09，不在本轮另造实现。

建议入门自检用Q06/Q07及综合A/B/C。若不能区分同Fiber重跑和新挂载，回看H07图三/H08实践B；若漏return后盲目重试，回看H06四路径；若把DISPOSED当任意工作已停止，回看H07在途回调。无须先读Node缓存全部内部细节才能进入H09。

H09计划时长90–120分钟仍是蓝图估算；第二模块已明显长于蓝图，下一轮应先按唯一增量预算源码/实验负担，保留失败解释而分段。真实学员前置达标率与试读时间尚未测量，不宣称第二模块已证明每位学员具备H09能力。
