# H18正式交付核实与补全验收

提交：`a8fe4fb5a97b9d1237fe61a090f0188db5db24a2`，短号`a8fe4fb`，Git标题`feat(course): develop H18 persistence recovery and fork lesson`；原README/quality-review结论CONDITIONAL GO，14项验收保留。固定上游f3803c96974ad4a94195fb97e5c637e9c2a3afe3。

原始[24项TAP](../h18/evidence/lab-tests.txt)、[test-evidence](../h18/test-evidence.md)、[程序](../../../course-content/internal/deepseek-harness/h18/lab/persistence.test.ts)、[原lab-results](../h18/evidence/lab-results.json)一致；本轮[新TAP](evidence/h18/evidence/lab-tests.txt)再次24/24，无skip。C22/D2，不依赖“99+未知”的算术推测。

|原TAP位置|级别|实际受测与核实|
|---|---|---|
|1|C|真实Handle模式/所有权/连续批次/Closed|
|2/3|C×2|raw与默认Zstd，新后端+独立PID精确读回|
|4/5|C×2|空pending/flush物化；Windows PID写争用/释放/持锁PID退出|
|6–9|C×4|closed/open/not-started/unknown磁盘前缀+保守closer|
|10/11|C×2|raw半行/Zstd缺checksum字节；read不修、append前修|
|12|C|实例persistBatch故障、缓冲保留、显式重试/close排空/无writer true反例|
|13/14|C×2|普通Fork默认/显式/空/非法；marker先closer，闭Step不追修|
|15|C|SessionPreparation确切对象、未发布不可写、同步幂等释放|
|16–20|C×5|future/corrupt/ignorable/required/historical；只读V3→V4源不变|
|21/22|C×2|接受前快照/BigInt拒绝；开始前取消不确认保存|
|23|D|真实Loop+JSONL开放尾Resume、Turn2继续、旧工具0|
|24|D|真实任务保存/关闭/新后端Resume/持久分支独立未来|

原始成功与失败run共见[历史运行索引](evidence/historical-runs.json)，其中Temporal缺依赖、resume缺system首节点、runner误选旧test名及故意错误答案均保留原exit。错误答案“Fork会重跑工具”期望1而实际0，非零是有效负例，不计正向测试数。

真实Windows none/default Zstd、同登录进程读/写锁已验；POSIX/NFS/跨登录、写迁移Worker全矩阵、真实断电/sync失败/rollback全组合、完整官方套件、Provider/E/学员/耗时/外审仍未验证。H18新PID读回不能自动转记为H19/H20跨组件崩溃恢复。
