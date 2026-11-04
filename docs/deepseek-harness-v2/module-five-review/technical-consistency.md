# 技术事实、术语及四课一致性矩阵

各行依据四课原正文/实验、固定源码断言与当前实跑；S号指对应课的[source-assertion-index](evidence/source-assertion-index.json)。不是用字符串命中替代分支审读。配图逐项另列。

|关系/术语|统一教学表达与适用条件|依据/当前证据|判定|
|---|---|---|---|
|H17→H18 EventLog|逻辑有序事实；Session内存与持久产物分层|H17 S07/08/30；H18 S13–22；buffer|一致，无物理耐久夸大|
|Session/Store/Persistence|日志及派生对象/活跃登记/存储seam，不混成一个服务|H17 S01/02；H18 S01/38|一致|
|Header|独立元数据，非seq0普通事件|H17 A；H18 B|一致|
|Seq/Offset|已有事件位置/长度与边界，Fork包含Seq|H17 brands/X；H18 D/X|一致|
|快照/冻结|一次读取无损JSON后提交冻结；不能由调用方后来变更改历史|H17 getter/A；H18 snapshot|一致|
|Surface替换|追加新事实以改变当前节点；原日志保留，位置不按数字排序|H17 B；H19 C/X；新whole|一致|
|Projection|业务折叠与模型消息投影扩展点分开，版本/Schema/引用门控|H17 C/X；源码registry|一致；磁盘Projection缓存未验|
|append/flush|Session内存、seam接受可见、后端屏障三个承诺|H18 Handle契约与buffer|一致；JSONL强实现未泛化|
|Handle所有权|read观察，write可读/单写者；close等待释放|H18 A/lease/empty|一致；跨平台不外推|
|Resume|持权读前缀、补语义、prepare/marker、发布新Agent|H18 resume/X；H20 C/X；新whole|一致|
|Fork|包含切点、tagged marker先closer、子未来独立；普通API不自动持久|H18 D/X；官方fork测试|一致；doc692冲突已披露|
|Fork/Subagent|历史分支≠显式运行parentAgent/activation|H18 Header缺省/X；H20交接|一致；H21不开发|
|H17→H19 输入视图|Meter/Basic选当前合法Surface而非所有日志文本|H19 A/C；region.ts|一致|
|compaction/start|让出await前的开始/日志锁，数字Turn或手动null|H19 active/stale/manual|一致|
|compaction/summary|审计摘要/路由/来源/rawOutput，仅日志|H19 rich/X；新whole|一致|
|摘要user替换|单独承载frameSummary；改变模型当前消息|H19 C/X；新whole|一致|
|compaction/end|成功/失败结束尝试；end失败不伪造闭合|H19 end-failed/partial-commit|一致|
|工具配对/来源|保留平衡边界，shadowedSeqs精确节点而非数值范围|H19 unbalanced/B/X|一致|
|压缩≠删历史|日志增长，当前读法缩减；无损记忆/必省费用未承诺|H19 X；新whole|一致|
|H18→H20 Crash/Retry|新生命周期持权恢复/活Step内模型Attempt策略不同|H20 C/X、H18 resume|一致|
|物理/语义修复|Backend有效字节前缀/Agent追加开放尾闭合|H18 tail/repair；H20 X|一致|
|NOT_STARTED|指定前缀未登记call，非对外界无执行的全知证明|H18 C/D；H20 D/X|一致|
|UNKNOWN|已登记call缺已记结果，效果可能已发生；先核查|H18/20恢复文本与fixtures|一致|
|已知结果|不合成覆盖；闭Step不追补旧缺口|H18 seed；H20 result/closed-step|一致|
|失败Attempt/成功消息|失败诊断不进普通历史；本地取消安全前缀有条件可message|H17 D；H20 partial/B|一致|
|H19→H20 预算|普通provider/policyKey与Basic溢出预算独立|新order/independent；H20 A22/23|一致；无全局N|
|normal/always|normal筛资格/预算/延迟；always先下游，无成功保证|H20 A/B；llm-retry源码|一致|
|Waterfall|注册顺序、next/返回影响接手，不是各策略自动加次数|新增反例2顺序+预算耗尽委派|原课限定正确，新增证据|
|重新请求历史|每次prepare/currentSurface；不重assembly/pre-step或用户输入|H20计数；新prefix/whole|一致|
|LLM与工具重复尝试|请求Attempt恢复不重跑整个Turn；工具可能已生效|H12结算/H14批次；H20 partial/X|一致|
|取消/停稳|发信号与等待结算分开，不强杀任意外部进程|H20 B门闩；batch/pipeline|一致|
|keepInbox|保留未开始输入，不自动恢复当前活动或保证即刻唤醒|H20 inbox-keep|一致|
|whenIdle/dispose|活动收束/生命周期资源收尾，均非业务成功保证|H20 delegated/handle-dispose|一致|
|结果顺序|并发执行完成/运行观察/模型序提交不同|H17 D；H20 parallel；H14历史模型|一致|
|JSONL等级|真实磁盘及新实例仍属列明C/D；新PID、物理故障、E另列|H18平台；H19 X；H20 C/X|一致|
|成本/缓存|启发式/受控Usage与真实提供方账单分开|H19 A；H20 virtual clock|真实成本性能未验证|

## 原规划、官方文档与实现的精度差异

1. 蓝图H17“追加→surface apply→通知”的概括不应理解成全部缓存先立即计算；实现先验证计划，再push/通知，读时推进缓存，Registry另订阅驱动。正式H17已明确。
2. session.zh.md:692开放Fork拒绝说法与690、fork.ts和fork.spec不一致；采用合法前缀可切开放Turn、子合成forked闭合的条件表达。父切点后动作可能发生。
3. compaction.zh.md“失败步骤关闭后”与Loop实际attempt→恢复→重试→step/end不同；正式H19/H20采用同Step实现。
4. 上游“durable opening/scheduled before wait”等描述是逻辑日志语境；Retry回调没有flush，不能推出通用fsync；正式H20与H18一致。
5. 蓝图H19“三策略日志hash不变”在本轮应读成**已有前缀不改**；完整日志会因压缩标记/替换而增长。正式H19及本轮新whole均明确核原前缀；保留规划原件，不伪造历史修订。

6. llm-streaming.zh.md:302–303概括为失败Step关闭后恢复进入新编号Turn；Loop实际在当前Step内处理request-error、重新prepare并尝试，结束点随后到达。正式H20以实现与受控事件记录为准，不把该概括直接当时间线。

以上差异不是待执行的上游修复，也不表示运行了官方完整测试；它们在当前四课已有明确限定，本轮继续作为来源差异证据保留。
