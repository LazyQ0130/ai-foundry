# 四课知识依赖矩阵

| 课 | 核心对象与增量 | 向后交付 | 依赖前课 |
|---|---|---|---|
| H17 | Event Log / Surface / Projection，派生模型历史 | 事件身份、位置替换、实时与持久区别 | H10/H11/H12/H14 |
| H18 | Persistence / Handle / Resume / Fork / Repair | 单写者、检查点、有效前缀、谱系与未知工具 | H09/H17 |
| H19 | TokenMeter / Compaction / Pruner / ImageOffload | 预算取舍、仅日志标记与Surface改写、输入恢复 | H11/H12/H17/H18 |
| H20 | 请求Retry / Cancel / Quiescence / 故障决策 | 所有权、协作退出、副作用核查与恢复证据 | H10/H12/H14/H15/H17–H19 |

核心依赖应在默认正文自足复习；完整程序和答案折叠。H20只提供H21委派所需边界，不把Subagent树提前混入本模块实现。
