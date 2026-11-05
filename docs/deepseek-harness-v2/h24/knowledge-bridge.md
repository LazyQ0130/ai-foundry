# H01–H24 跨课技术一致性

作者按前课正文/实验/质量核对，不改H01–H23。历史测试不累计到23项新测试；此表不是第六模块正式集中审查。

| 依赖 | 沿用准确边界 | H24具体证据/限制 | 判断 |
| --- | --- | --- | --- |
| H03请求链 | 输入→Inbox→Turn/Step→模型/工具→下一请求 | B1/X实际下一模型输入含工具结果，关闭后新Session前缀相等 | 一致 |
| H04/H08 Profile/Loader | Bundle/Patch选择组合，服务可用驱动激活，config整体替换 | A核心YAML+真实loadProfileDirectory/boot；ACTIVE核验，非发行完整Profile | 一致；H24比H23 prepare挂核心更强但仍D |
| H09/H10 Agent生命周期 | Registry/Factory/Handle所有权；idle非任务成功 | D3实际Turn error但driver exit0，D5关闭等结算 | 一致 |
| H13工具 | 声明/可见/执行与结果分开 | 真实Tools/Native、CallId关联；P1无效/拒绝body0 | 一致，40样本不等穷尽 |
| H14/H15权限/沙箱 | 模型提议非授权，Scope不是OS隔离 | D4 guard与窄常量工具；未装完整产品审批/沙箱 | 一致，不宣称安全认证 |
| H16组合 | 同功能按实际Profile启用，不凭包名推完整能力 | 作者核心Profile与base/sdk-minimal/Web独列 | 一致 |
| H17事件 | Session事实与Surface/Projection分开；实时通知不代日志 | B真实规范化，X deriveMessages比较，Trajectory仅静态诊断视图 | 一致 |
| H18持久化 | flush/close/新实例/新PID/崩溃分层 | C2新PID正常Resume；X关writer后新Session，非崩溃/断电 | 一致 |
| H19压缩和成本 | 原始事实与短模型视图分开，模拟token非真实节费 | 本课没有缓存收益/收费测试，仍未验证 | 一致 |
| H20重试取消 | Provider策略所有者，取消信号≠停稳 | D7超上限委派，D1 429恢复，D5门闩关闭/aborted/无工具 | 一致；未重测全部未知外部副作用 |
| H21委派 | activation/childId/runId/parent/caller、冷恢复边界分别核 | 以历史H21证据交接，不在X堆无关子级；C2不是子级跨进程冷续跑 | 一致，未验证保持 |
| H22任务抽象 | WorkflowRun/Job内存活动、Goal/Schedule记录与业务效果不同 | 模块准备图分别画，H24不声称四者全量集成通过 | 一致 |
| H23载体 | 接纳/完成、Web/SDK、Generation/Seq/revision、持有者关闭分开 | C真实stdio，P2 TestRemote而非产品Web；新增默认SDK+HTTP退出P1 | 新场景风险向审查包交接，不篡改H23历史结论 |

新增P1只在当前作者源组合+Windows/Node24.16.0 SDK/HTTP场景复现，不能凭它断言所有发行版或H23已测场景都失败；也不能因H23此前条件通过而忽略新场景。默认退出分支须独立诊断并在相应真实入口补验。
