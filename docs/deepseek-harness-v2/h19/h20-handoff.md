# H19 → H20 前置与边界

H19完成于固定官方Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。这里是交接说明，未开发H20正式课、实践或模块集中审查。

学员可带入：区分Provider Usage与启发式；用W/O/B/P推T/R；区分普通压力、模型切换和规范Overflow；理解attempt内恢复与Step边界；知道取消优先、有效Surface进展与有限预算；能解释部分提交、日志锁、检查点失败与外部工具副作用。

H20需要继续解决的独立问题：取消在多层异步执行中的传播与资源释放；普通Provider重试/退避与预算；任务失败的公开结果；工具是否幂等及未知副作用；故障分类与可靠性策略。本课只证明Compaction相关的局部路径，不提前给出全应用可靠性结论。

优先复用原始证据：D:pre-step-failure、overflow、overflow-limit、no-progress、failure、cancel、manual-fifo；C:partial-commit/end-failed；manualPersistenceFailure。它们分别是不同故障注入点，不能合称“所有错误可恢复”。X仅正常保存与恢复，不是崩溃注入。

待独立验证：真实Provider超限归一化、实际Token/缓存/金额、完整请求错误图片恢复、跨进程未完成compaction恢复、其他平台、E级应用、真实试读和独立外审。不得把H19 C/D通过升级成这些项目通过。

继续维护时保留本课与H18所有临时复核文件及空目录。禁止递归或批量删除；复测只创建新的隔离目录，不指向已有Session。
