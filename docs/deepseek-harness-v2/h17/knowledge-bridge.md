# H03/H09/H10/H11/H12/H14 → H17 衔接审查

本轮先读30讲蓝图及四次集中报告、有效E/v1与三次增补、第四模块交接，再选读指定前课中与Session相关的正式解释、实验输出和答案。输入路径/hash见[evidence/preparation-inputs.json](evidence/preparation-inputs.json)；阅读摘录保留在[evidence/prerequisite-reading.txt](evidence/prerequisite-reading.txt)。枚举hash不代表整课逐段审稿，本轮不重新开展旧模块集中审查。

| 前课已有知识 | H17新增产出 | 因果关系核对 |
|---|---|---|
| H03请求完整路径 | 用当时事件前缀证明Loop输入有来源 | 请求不是最终聊天数组；先切前缀再派生 |
| H09 Agent与Session归属 | 区分Header、活跃Store与历史存在 | 无Agent不推出无磁盘历史；纯内存退出也不保证落盘 |
| H10 Turn/Step推进 | 原轨迹16条中标出边界、事件位置与读边界 | D中请求二只读至seq12，最终回答13不在自己的输入里 |
| H11系统文本与请求封装 | Surface消息、完整header、context三路分别重建 | system不是header.system；当前准入不依赖旧context |
| H12实时chunk与结算 | message/attempt/abandoned与模型历史逐个对照 | D_failure有attempt无Assistant；D_rejected只有实时帧无Assistant事实；安全中断前缀沿用H12历史证据 |
| H14工具提议与两类result | ToolCallBlock.id→callId→toolCallId+sourceSeq | tools/result运行时观察先于tool/result提交；value不假定全量存档 |
| H16/第四模块能力边界 | 历史声明与当前Registry解耦；资源不会因日志重现 | 同名工具重载不能改旧Schema；日志不能重生stdio连接或进程 |

关键跨课验证是D：真实Loop/Prompt/Runtime/Native/Session，两次Loop请求均从另一真实Session重建messages/config/tools/toolHistory，并保存Adapter请求。C测试历史工具加入→移除后仍按旧header解释。X再把Surface/消息/工具关联/任务状态放到同一16条前缀中手算。

没有重讲H12全部Assembler或H14全部Pipeline；保留必要复习与失败边界。未发现需修改前课的确认技术矛盾。蓝图append后立即surface apply的概括在本课按源码细化为先validateNext、提交、通知与按需增量折叠，历史蓝图原件保留。

进入H17前建议无提示回答：tool-call块与tool/call差别、tools/result与tool/result差别、committed端点与实际seq如何关联。理解仍不代表真实学员已通过测验，本轮只有作者跨课审读与组件验证。
