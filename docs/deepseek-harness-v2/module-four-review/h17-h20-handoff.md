# H17–H20前置与交接

本文件只定义入口、问题与不可外推的边界，**不开发H17正文，不发布课程**。30讲蓝图中H17=Session事件/Surface/Projection，H18=resume/replay/fork，H19=compaction与窗口，H20=取消/重试/故障恢复，前置为H10–H12及本模块相关机制。

| 后课 | 从第四模块带入的实际产物 | 后课必须回答的问题 | 不能误带的假设 |
|---|---|---|---|
| H17 | H14/H16和新A的ToolCallBlock、tools/result、tool/call、tool/result、请求前缀 | 谁记录不可变事实，谁派生模型消息/其他读视图，seq和surface怎样不同 | 运行时规范value全部持久保存；所有事件都是模型消息；append已flush |
| H18 | 新B的文件修改、H16 stdio连接、H15新Session对象丢观察 | 历史回放、继续执行、Fork有什么身份和资源差别；缺失结果怎样保守修复 | 复制日志恢复连接/进程/观察表；无结果意味着没做事；自动重发所有写调用 |
| H19 | 一次批次多个关联调用/结果与工具历史 | 窗口优化怎样保持tool pairing和可重建事实，规范值/模型content的保留不同在哪里 | 直接按字数删几条消息就等于正确压缩；摘要是原始证据 |
| H20 | H14已开始工作要drain、内部失败unknown/not-started，新A/C正常错误仍续步 | 按准备/请求/工具/提交阶段设计取消、重试、恢复；哪些副作用可重试 | timeout/cancel=回滚；模型请求retry=业务写幂等；Turn结束=Jobs全部结束 |

为什么记录call与result：模型提议、宿主接手、实际效果和最终可用结果不是同一时刻。持久事实用身份和来源seq关联，使后续请求、审计与修复有依据；单独一个“成功文本”不能解释被拒绝或结果未知。正常工具错误可以继续下一Step，调度/日志内部错误则可能以error结束并需保守repair。

为什么规范值与模型结果不同：value是执行时经过输出Schema验证的程序数据；content是渲染/策略/最后转换后的ContentBlock；meta是展示事实。Session ToolResultMessage并不全量保存规范value，error/meta另有投影。H17应从实际data形状进入，不从一个字段名推测全量存档。

为什么不能全重放：写文件、发送请求、启动进程、调用外部MCP工具可能不可重复；日志中的call没有result时可能已有作用。Replay重建历史/投影，不是新的授权或业务幂等协议。恢复先区分已提交、已启动结果未知、未记启动，必要时核外部状态或请求负责方决定；不要因想让日志完整就制造成功。

H17承接三条已学主线：H10提供Turn/Step的接受/结束位置；H12提供message/attempt结算与实时流区别；H14提供工具观察和有log才写的事实。以新A的1call/1result和第二请求作最小入口，再对照H14 internal修复；不一开始堆进完整持久后端、Fork与压缩。

进入前的无提示检查（作者建议，未校准）：用Q18画“原始提议→运行时结果→Session事实→模型历史”；解释一个不能从记录推出的副作用；指出同ID新Session为什么要重读文件；给“下一请求已重建”与“跨进程落盘恢复已验证”不同状态。若失败，先回H14两种result、新B陈旧编辑与H16断线，不删安全条件来降低题目要求。

可交接证据：[cross-A](evidence/cross-A.json)、[cross-B](evidence/cross-B.json)、[cross-C](evidence/cross-C.json)逐请求事件前缀与第二真实Session重建；H16本轮raw demo中的D/X。这些只是内存Session局部D；JSONL写租约、真实重启、Fork/快照/Compaction、外部工具幂等、完整E与真实学员均未在本轮验证。MCP完整代际可靠性仍留H27，Jobs深生命周期留H22，浏览器/桌面留H28。
