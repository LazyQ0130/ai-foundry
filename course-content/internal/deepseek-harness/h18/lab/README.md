# H18 可复现实验

固定官方Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。A/B/C/D是实践名称；C/D证据等级是另一维。A不是内存后端模拟：它用真实JSONL none。模型与计算工具受控，JSONL/Handle/Repair/Fork/Loop是官方实现。

在AI Foundry仓库根、Node24与已核隔离依赖下执行：

```powershell
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs A
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs B
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs B_zstd
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs C
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs D
node docs/deepseek-harness-v2/h18/scripts/run-labs.mjs X
```

附加选择为tail、resume、lease、empty、buffer、format。默认运行24项TAP、全部demo和故意错误答案；负例“Fork会重跑工具”必须以exit1失败，不能改成正确答案让它通过。单项不覆盖总体lab-results。原始记录带时间戳，含参数、scratch、程序hash、stdout/stderr/exit；新失败也保存。

文件映射：handle.ts=A；disk.ts=B；recovery.ts=C与物理尾部；fork.ts=D；agent.ts=X与真实resume；ownership.ts=空物化与真实进程争用；buffer.ts=路由故障/重试/close；format.ts=新文件版本Fixture。process/worker承载独立Node进程，不把Worker Thread或新Context说成新进程。完整程序与详细推导见[正式教材](../lesson.md)。

源码、Git与四个依赖锚点设置见[作者README](../../../../../docs/deepseek-harness-v2/h18/README.md)。runner把程序复制到全新OS临时目录，环境不继承个人DSH_HOME/凭据；仅对子进程设置自己的fixture-home，不读取或修改宿主真实Home配置。worker只访问父测试明确传入的新root。不要直接把root改成已有存储。

bootstrap禁止递归rm；包括上游异常分支若尝试递归清理也会拒绝，不能绕过。removeOne只对明确关闭、位于本次root内的单文件unlink；不枚举清理、不删目录。空目录、scratch代码副本、X/resume/buffer等复核产物及失败夹具保留并由证据给出路径。用户AGENTS禁止批量删除，因此没有递归“清干净”命令，保留项不算自动清理通过。

Windows24.16.0实测：原始与默认zstd、独立实例/进程重读、同登录会话内核锁、受控持锁进程退出、两类撕裂尾、真实Loop恢复与持久分支。没有真实断电、POSIX/NFS、跨登录会话、写迁移Worker、完整Harness E或学员验证。故障注入只替换本次实例persistBatch边界，不冒称物理fsync故障。

24执行项互斥分级C22/D2；共享实践/参数化不代表24种唯一场景。新增lab不用eventAt/snapshotEvents/ownEvents；constructor seed不发session/event，所以源历史从真实Handle.read获得，构造seed由官方buildForkSeed提供。不要手写向append提交保留的session/end-seed。
