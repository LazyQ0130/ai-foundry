# H09 → H10前置知识与衔接说明

本文件只交接未来研发输入，没有开发H10正文、图或实验。

进入H10前应能无提示完成：区分活跃实例与历史Session；按Registry查询名单与roots；解释create/resume为何返回Handle；分开caller、持有者、parentAgent、历史谱系和发起方；画Session通知→setup/commit→Agent登记/通知→退出维护放行的顺序；说明销毁先等活动、再Scope/close/两表退出。

H10的新增问题是：已经准备好的Agent怎样处理next-turn/next-step，send/followup/steer/inject怎样影响唤醒，Turn如何包含零个或多个Step，何时继续与停止。应重新核固定Commit的agent.ts/inbox.ts及相关测试，不能把H09的维护门闩实验直接升级为完整循环验证。

H09只用runMaintenance解释工作静止和创建期间的发布屏障；D12仅证明创建监听完成后才有Turn起点，pre-step主动拒绝且模型stream零次，没有教授完整Step算法。H10可以短复习这项起点，不再复制Registry/Handle整课。

继续保留H11提示词组装、H12消息与流、H17–H18日志/磁盘恢复、H21委派协议边界。parentAgent字段不自动实现后代取消；同id恢复产生新运行对象。H09的内存存储fixture未提供租约/崩溃/磁盘可靠性结论。

前置未达标时回看：思考2/3核能力与结构所有者；思考4核roots；思考5/6核失败与陈旧释放；综合7核H07–H09因果链。尚无真实学员达标率、实际耗时或独立外审。后续研发需另获授权；本轮在H09完成后停止，不发布。
