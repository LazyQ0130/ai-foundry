# H22 → H23 前置知识交接

下一课正式标题《CLI、Web UI、SDK 与远程通信》，唯一目标为追踪一个控制动作与一条状态订阅穿过载体边界。本页只交前置，没有H23正文、实验、图或代码；也没有提前开展H24或第六模块审查。

进入H23应能交出：

1. 身份表：父SessionId、子SessionId、WorkflowRunId、jobId、GoalRef(id/revision)、ScheduleId各标识什么。
2. 控制链：用户取消→工具/Job所有者→Run.cancel→子进程/Host调用/子级清理→结果与dispose；回执不是停稳。
3. 状态来源表：workflow实时观察、tool-workflow父Session四类log-only记录、模型ToolResult、Jobs环/游标/通知、Goal持久phase与本地activation、Schedule的Host任务域。
4. 恢复边界：读取历史和Projection不恢复旧guest栈、Promise或进程；本地Job非持久队列；Schedule恢复触发记录不能当工作流检查点。

可引用D1父级后续请求/JSONL读回与D3后台输出/通知对照。真实Windows restricted PTC已经在列明read-only fixture中验证；这不自动验证远程通信、鉴权、其他平台、网络封锁或完整产品载体。真实Provider、外部Agent、E级应用、学员试读与独立外审仍无本课证据。

H23再研究CLI/Web/SDK控制与订阅及断连，不重新实现Workflow调度；H24再审跨模块证据。不因本页交接而自动开始后续研发。
