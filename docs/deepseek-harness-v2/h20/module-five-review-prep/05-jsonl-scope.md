# 真实JSONL范围（历史与本轮分开）

| 课 | 实际交付范围 | 不得转记的缺口 |
|---|---|---|
| H17 | 无真实持久化，C/D是事件组件/局部Loop | 不能按Event Sourcing宣称磁盘恢复 |
| H18 | Windows原始/默认Zstd、新实例/独立PID重读、同登录写权、指定尾修复、Resume/Fork | 非断电、POSIX/NFS/跨登录、写迁移Worker、E |
| H19 | Windows原始JSONL，闭合压缩后同进程新Context/后端真实Resume | 该Compaction组合无独立进程/Zstd/崩溃注入 |
| H20 | C/X原始JSONL保存Retry事实、取消计划；精确开放前缀新副本、真实语义Resume | 同进程新实例；没有杀进程、截断文件或真实断电 |

依据原H18的[平台报告](../../h18/jsonl-platform-coverage.md)、H19的[覆盖](../../h19/coverage-matrix.md)与H20的[当前矩阵](../coverage-matrix.md)。H18基线由文件核实，不只信任务摘要。当前各组合的实际证据不同，不并成“全模块跨进程全通过”。
