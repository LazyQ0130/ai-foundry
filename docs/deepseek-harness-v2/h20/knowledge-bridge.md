# H20 跨课一致性核查

这是H20引用与前置的一致性核查，不是第五模块正式集中审查。固定Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3；研发前HEAD为6f454c0。完整蓝图、历次集中审查/有效标准与前课教材/交接在本会话已研究，当前身份和H18/H19实际交付重新核对；输入hash另存，不以枚举hash冒充理解或独立外审。

| 前课 | 本课使用的事实 | 核查与边界 |
|---|---|---|
| H09 | Agent/Session/Registry/Factory/Handle、调用方与工厂退出责任 | B:handle-dispose真实cancel→idle；历史谱系不还原运行时parentAgent；H21后代委派不提前开发 |
| H10 | Turn/Step/Attempt与零Step、pre-step/assemble/准入 | A核同Step多Attempt、用户只接纳一次；B准备期取消可零Step；不将retry说成新任务 |
| H12 | 原始chunk、Assembler、安全前缀、紧凑流、message/attempt与实时帧 | A失败流不污染模型历史；B真取消与Adapter ABORTED分开；committed不等于磁盘flush |
| H14 | 工具提议、call、结果、主体、批次模型顺序 | B业务失败可进入下一请求；parallel停补位/排空/顺序；call存在不证明主体已经运行 |
| H15 | pre/审批/guard、失败关闭、工具与平台边界 | B策略前错误主体0但结算为错误结果；并发分类异常实际为exclusive；无真实审批/沙箱认证外推 |
| H17 | Event Log、Surface、Projection、deriveMessages | retry仅日志，Attempt紧凑流留诊断但模型不见；流取消安全消息可进入Surface；X原前缀不改 |
| H18 | writer所有权、有效持久前缀、Resume、两类工具恢复 | C/X显式flush关闭再新实例Resume，不重模型/工具；逻辑副本不是Fork或真实进程崩溃 |
| H19 | Context Overflow、Surface替换、独立压缩预算 | A两种Retry模式均委派Basic并验证实际摘要；只测Retry先于Basic的顺序，不加预算造全局上限 |

H18基线核实依据：quality-review、jsonl-platform-coverage、lab-results、TAP与历史run；24项C22/D2，Windows原始/默认Zstd、新实例/新PID重读、写权冲突与持锁测试PID退出、物理尾部和局部Resume/Fork。未验真实断电、POSIX/NFS/跨登录会话、写迁移Worker、E与学习效果。H19为34项C19/D15，正常闭合Compaction后同进程新Context/后端Resume；未做该组合独立进程。两者不互相覆盖未测项。

源码差异与H20采用规则见discrepancies；不为了术语一致改动历史正文。重要连接在主线可见，完整程序/详细推导折叠，不假设旧Stage课程购买权限。H17–H20统一架构与候选矛盾仅整理进审查准备包，正式审查尚未开始。
