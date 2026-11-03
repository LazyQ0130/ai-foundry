# H18 实际测试与证据分级

2026-11-03；官方固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。原始TAP见[evidence/lab-tests.txt](evidence/lab-tests.txt)，demo完整事件/请求见[evidence/practice-output.json](evidence/practice-output.json)，结果与程序hash见[evidence/lab-results.json](evidence/lab-results.json)。时间戳run文件保留成功与失败，官方整套Vitest未执行。

| TAP顺序 | 等级 | 实际受测输入与断言 |
|---|---|---|
| 1 | C | A真实JSONL Handle：模式、create/open/read/append/flush/close、stat/list、冲突/Closed/Seq拒绝 |
| 2 | C | B原始JSONL：新实例与独立PID读回相同Header/事件/模型历史 |
| 3 | C | B默认Zstd：不传compression写入、魔数、两个层次重读 |
| 4 | C | 空create本地pending、他实例未见、空close消失、flush物化 |
| 5 | C | 真实进程/实例写争用、只读并存、正常释放与持锁子进程终止后再开 |
| 6–9 | C×4 | closed/open/not-started/unknown：真实磁盘读前缀、真实repair、源引用/原因/连续追加、再算无closer |
| 10 | C | 原始半行：读取/写打开均不修改，首次新append修尾，已提交字节前缀不变 |
| 11 | C | Zstd撕裂checksum末字节：完整事件恢复、写前重写、既有字节前缀不变 |
| 12 | C | 真实路由：实例方法边界受控失败保留、flush重试、close排空、无writer的true不代表保存 |
| 13 | C | D真实SessionStore：多Turn/Step/工具，默认/显式/闭合/空切点、Header、独立未来、错误边界与重复ID |
| 14 | C | buildForkSeed：marker先于子closer，闭合Step不追溯修复缺结果 |
| 15 | C | SessionPreparation：确切未发布对象、只读边界、同步幂等release |
| 16–20 | C×5 | 未来格式、坏Seq、当前ignorable、未知必需、只读V3→V4；源字节与目录不变 |
| 21 | C | append接受前快照、调用者随后变更不改变存储；BigInt拒绝不增长 |
| 22 | C | create/append/flush开始前取消不确认写入或物化 |
| 23 | D | 真实Loop+JSONL恢复6条含system的开放尾，UNKNOWN/Step/Turn/marker先存，再继续Turn2，无工具重放 |
| 24 | D | X完整局部保存/关闭/新实例Resume/官方Fork seed/新Agent writer/两条独立未来 |

互斥合计C22/D2，依赖Cordis不另计B，脚本模型与纯计算主体不另计A。C13/D24都涉及Fork，C6–9/D23涉及相同repair；demo与错误负例不增加测试数。按12主题理解：句柄、连续/不可变、可见/空物化、进程锁、路由/屏障、物理尾、语义尾、恢复发布、分支切点、独立未来、格式拒绝/读取迁移、取消。执行项、主题均不是唯一故障场景或覆盖率认证。

X原任务16条、恢复17条；含Seq9继承10条，marker10、UNKNOWN11、step/end12、turn/end forked13，分支14条。父/子新任务后26/23条。初次工具1次，恢复与Fork不执行旧工具；新模型请求各1次。对比原前缀、消息、请求头与独立新用户内容，不以最终文本或计数单独替代跨边界证据。

错误答案negative-answer断言“Fork会重跑工具”期望1次，实际0次，exit1且文本匹配，证明误答会被拦住。不是修改官方源码的mutation，也不修改正确答案求绿。受控persistBatch故障不是物理fsync失败；撕裂Fixture不是实际写入进程断电；关闭持锁子进程只作用于本次已记录PID。

未运行：内存Backend完整契约套件、完整官方测试、POSIX/NFS/跨登录会话、写迁移Worker与全历史迁移、真实断电/磁盘损坏、所有close/rollback聚合异常组合、真实Provider与完整Harness E。真实学员/时长/独立外审也不计PASS。逐平台范围见[JSONL说明](jsonl-platform-coverage.md)。
