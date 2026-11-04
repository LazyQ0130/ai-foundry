# 持久化、Fork与崩溃恢复专项

H18正式交付是 `a8fe4fb5a97b9d1237fe61a090f0188db5db24a2`（git log与原README、quality-review、TAP、lab-results及run记录交叉）；CONDITIONAL GO；24项=C22/D2。不是从99项差额猜出24。见[补全验收](h18-acceptance.md)。

## 承诺逐层核对

|操作/状态|能说的保证|本轮证据与条件|
|---|---|---|
|Session.append|内存快照、冻结、连续事实、提交后通知|H17 A/observer/publication；不等于物理同步|
|SessionStore|活跃Session登记/归属/通知|不充当全部磁盘目录；普通create/fork不自动持writer|
|通用Handle.append|接受、有序、同后端随后开始的读至少见此前缀|handle.ts明确允许后端延后物理写；不能泛称所有后端fsync|
|JSONL append|固定实现每批写并sync；首次同步临时产物后无覆盖发布|实际磁盘往返通过；物理sync失败/回滚全矩阵与断电未验|
|Session/服务flush|在确有writer时先排空路由，后履行后端屏障|H18 buffer失败保留→显式重试；无writer仍true但磁盘2/内存3|
|直接Handle.flush|已接受批次的耐久屏障，必要时物化空Header|本身不drainLive；不能用它遗漏Session的路由缓冲|
|close|幂等、异步、不可取消；JSONL排空并释放写权，错误须观察|H18 A/empty/buffer；不是删除历史或回滚工具|
|write所有权|同实例单写者；JSONL再用内核资源协调|Windows同登录会话真实PID已验；POSIX/NFS/跨登录未验|
|read所有权|观察、不占写权；外层slice独立，eventState区分共享冻结/独占|共享冻结不是允许改消息；并发读只承诺合法前缀|

Header在事件之外，物理一行Header不占Seq。逻辑format4和物理generation必须分问；V3只读返回V4逻辑值不等于发布写迁移。读迁移源hash/目录不变已有动态证据，写迁移Worker仍未验证。

## 物理修复与语义修复

物理半行/撕裂帧由JSONL返回有效记录前缀。H18 raw半行读取及write-open都不改文件，首次新append处理尾；Zstd缺最后checksum字节时还能恢复一条完整记录，不能说整帧总全丢。完整已提交记录的坏Seq/结构必须拒绝，不能教“坏了删最后一行”。本轮仅访问mkdtemp root。

语义修复对完整事件中的开放尾进行追加：Assistant提议未见call→NOT_STARTED；有call缺匹配append结果→UNKNOWN并引用call；已有结果不覆盖；开放Step结束，再Turn interrupted。闭合Step清待答，不追补旧缺口。Resume先取得writer，再读、补普通批次、prepare、补构造marker、发布新Agent。修复后setup失败不倒回已存事实。

没有result不能推断没有执行。NOT_STARTED说明指定前缀没记录开始；call登记又早于dispatch，UNKNOWN也不证明主体已执行。对不受控执行器和外部系统均不能作全知判断；错误result不撤销外部效果。

## 普通Fork的确切规则与官方差异

|依据|实际表达/行为|教学处理|
|---|---|---|
|session.zh.md:690与692|相邻概括一处支持开放尾合成闭合，一处声称拒绝开放Turn切点|保留差异，不挑方便一句充当规则|
|SessionStore.fork/_forkBoundary|源须live确切对象或ID，切点是已有Seq且包含；默认末条，空源省略继承0|Offset不是包含Seq；先核身份/重复ID|
|buildForkSeed|先复制0..boundary，再tagged end-seed，后forked closers|marker/closer是子自有事实，不计inheritedEventCount|
|官方fork.spec.ts|开放空Turn、闭Step、提议前后、未知结果、替换前后均有测试|本轮静态读取测试，不称运行了Vitest；H18 D/X另实跑|
|SessionHeader/当前普通API|只继承cwd、seed/cut、isSeeded，不自动parentSession/origin|历史谱系字段不是runtime parentAgent；普通Fork无子Agent/后台资源|

X的包含切点9继承10条；子10 marker、11 UNKNOWN引用9、12 step/end、13 turn/end forked，共14条。源已在切点后完成工具，子仍只知道其前缀；Fork的两种错误文本均提醒父可能在切点后执行，不可据NOT_STARTED重做非幂等动作。持久分支必须另由官方seed+Agent工厂取得writer。

源码：[Fork](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/fork.ts#L10-L29)、[Repair](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/repair.ts#L29-L211)、[文档矛盾](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/session.zh.md#L690-L692)。

## 真实证据十层表

|层|H17|H18|H19|H20|本轮增量|
|---|---|---|---|---|---|
|内存Session|已验|已验|已验|已验|请求前缀再建|
|接口调用|仅flush反例|实际Handle|X实际|C/X实际|whole/prefix实际|
|真实JSONL文件|未验|none+默认zstd|none|none|none|
|flush/close|无后端|实际|实际|实际|实际|
|同实例重开|未验|实际|读取所需路径|读取所需路径|显式read比对|
|全新后端实例|未验|实际|实际|实际|whole实际|
|AgentLoop Resume|未验|开放尾+闭合|闭合压缩历史|闭合Retry+开放副本|压缩+Retry闭合|
|恢复后新请求|未验|实际|实际|实际|whole实际|
|保守开放尾修复|未验|真实Resume|压缩故障组合未验|真实副本Resume|复用H18/H20，本轮不凑数|
|真实跨进程/物理故障|未验|PID读/锁/持锁PID退出；半行/Zstd fixture|该组合未验|该组合未验|跨进程崩溃仍未验|

H18独立PID正常读取、锁释放不等于完整Agent在独立进程崩溃后恢复；逻辑前缀副本也不是物理故障。没有访问、删除、迁移个人Session，没有生产数据操作。新旧临时产物均保留，单文件删除仅在原H18已审程序自己的明确新文件内执行。
