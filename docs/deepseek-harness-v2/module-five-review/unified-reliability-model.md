# H17–H20 统一状态及恢复模型

固定官方版本 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。本模型描述可组合职责和真实分支，不规定所有运行总以18站线性发生。源码身份与198条断言见[evidence/source-assertion-index.json](evidence/source-assertion-index.json)，行为证据见[逐项矩阵](test-evidence-matrix.md)。

## 八种东西，八种保证

|对象|权威性与保存位置|恢复条件与限制|
|---|---|---|
|进程内运行状态|Agent phase、当前Promise、Scope、Adapter实例、退避timer|不是读回日志就能复活；Resume创建新对象，重新装配当前能力|
|已提交Session事实|连续Seq的冻结事件及独立Header|append只说明当前Session接受；尚无物理耐久保证|
|已确认持久事实|活跃writer接受并达到相应后端成功屏障的前缀|按后端契约、文件系统和部署条件解释；读到某字节不等于所有硬故障认证|
|模型可见消息|当前Surface及同前缀消息投影经deriveMessages派生，再经Runtime路由投影|不是所有事件；须切到请求时前缀，保留解释器及header/tools/toolHistory；Adapter可将工具声明消息映射成工具更新|
|仅日志事件|Turn/Step、header/context、attempt、retry、compaction标记、tool/call等|可用于审计和其他折叠，不能自动作为普通Message|
|派生Projection|init/apply+版本/Schema驱动的状态与wire view|解释规则是重建前提；缓存/snapshot不是第二份独立真源|
|外部工具效果|文件/服务/资源等外部系统，本轮仅用内存fixture|不与Session自动原子提交；无result不能推出无效果，恢复错误也不撤销效果|
|控制信号|AbortSignal、插件lifetime、当前取消原因|signal对象只在进程内；已结算turn/end等可记录原因，但不是恢复旧signal|

SessionHeader不占事件Seq。Seq是已有事实位置，Offset是长度/边界；`session.seq`为下一追加Offset。Surface的位置顺序可能是 `[4,18,13]`，不能按Seq数值重排。

## 长期Agent的十八个责任站

|站|输入→处理→可观察产物|成立前提/失败边界|
|---|---|---|
|1 创建并拥有Session|Registry委托Factory；准备Session、Scope、writer，再发布Agent|create/prepare/可见/ready不同；持久writer只有配置后端且工厂取得时存在|
|2 提交事实|归属检查→无损JSON快照→再检查→冻结/校验→Surface规划→push→观察通知|提交前失败不增长；观察失败不倒回事实；不是每类完整持久Schema校验|
|3 派生模型历史|Surface节点→消息投影→deriveMessages|空system/developer/assistant不产Message；空user规则不同；tool-call在Assistant块中|
|4 派生其他状态|ProjectionRegistry消费已提交事件→state/view/snapshot|保留无关事件状态引用；版本与Schema各有职责；dispose后保留reader可继续读|
|5 保存事件|session/event路由到活跃writer的write-behind|没有对应writer不保存；JSONL固定200ms窗口是实现细节|
|6 管理读写权|Persistence.create/open取得Handle；read观察，write可读且单写者|seam至少同实例；JSONL跨实例/PID内核约束另有平台范围|
|7 建立检查点|SessionStore或服务flush先drainLive再handle.flush|直接handle.flush不负责路由排空；true只说明有监听者，须验证writer/结果|
|8 推进Turn/Step|Inbox→Turn→pre-step/resolve/assembly→Step→请求尝试→工具→结束|零Step Turn合法；Attempt不等于Step；whenIdle不等于成功/落盘|
|9 历史增长|消息、工具及审计事实追加|存储规模与模型窗口不同；增长事件数不等于增加消息数|
|10 测量预算|Meter按当前Surface和请求封装计价|启发式/Usage锚点/路由价格/UI参考/账单分开；无精确通用分词保证|
|11 执行压缩|合法平衡选区→start→辅助摘要→重验→summary→user替换→end|标记仅日志；不是整体回滚事务；来源列精确节点而非数值区间|
|12 后续请求读压缩历史|重新prepare、协调当前system、derive/freeze|原文仍在日志，后续请求只读当前视图；摘要可能失真，不能称无损记忆|
|13 模型请求失败|Runtime规范Adapter失败，Loop结算assistant/attempt|middleware等边界外异常不一律进request-error；未结算硬中断可能无attempt|
|14 决定重试|request-error Waterfall按提供方策略或输入恢复授权|normal资格/预算/退避，always下游优先；Basic独立预算和进展；无全局固定N|
|15 请求取消|cancel设置当前signal，默认清Inbox；协作组件响应|keepInbox不自动唤醒；不能强杀任意Promise或外部进程|
|16 结算工具|提议→登记call→prepare/dispatch→等待→模型序result|call不保证主体已执行；已启动排空，未派发可合成BEFORE_DISPATCH；已提交结果保留|
|17 从持久前缀恢复|open(write)→read有效物理前缀→普通批次补语义closer→prepare/marker→发布|物理修尾归Backend，语义补尾归Agent；旧Step不追溯补造；原前缀不改|
|18 新Agent继续|当前能力重新装配，显式新输入发新任务|不重启旧timer/请求/工具；业务未知效果先核查，运行资源不能仅凭历史继承|

关键实现：[Session.append/commit](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L806-L927)、[Handle契约](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-persistence/src/handle.ts#L45-L116)、[Loop尝试循环](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L435-L612)、[恢复发布](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L763-L838)。

## 同一Agent的实际贯通轨迹

新增M5-whole使用真实Session、Loop、NativeTools、Basic、Meter、Retry及JSONL none；业务工具和Adapter受控。第一次任务16条：tool/call9、result10、回答13。手动压缩追加16 start、17 summary、18摘要user replace、19 end，遮蔽 `[5,8,10]`，原16条逐对象不变。第二Turn内26 attempt→27 retry→28 started→29成功消息→30/31结束。保存前缀共32条，Surface `[4,18,13,24,29]`。

关闭旧运行对象，在同一进程创建全新后端并Resume：追加marker32，无旧模型或工具重放。新任务33–42，Loop进入Runtime前的当前节点为 `[4,18,13,24,29,37,39]`；39是新的工具声明developer更新，40的回答不能提前放进产生它的请求。Runtime再按路由投影工具声明：该Adapter实际messages没有39的普通developer文本，toolHistory保留更新；重建完整请求须同时核header/tools/toolHistory。最终Surface `[4,18,13,24,29,37,39,40]`。原工具只执行一次；新请求含摘要而不含OLD_ORIGINAL。完整值在[cross原始轨迹](evidence/cross/evidence/behavior-traces.json)，prefixes记录全部5个llm/stream边界的精确前缀和封装比对。这不是独立进程崩溃或E级应用证明。

## 模块不变式

事实保留、模型可见、已经耐久、外部已生效必须各自取证。恢复从指定前缀重建，不制造过去的成功；重试只回到明确的模型Attempt边界，不重接用户输入或重跑整个Turn。工具未知结果与取消后的错误结果都不能当作外部效果为零。Fork复制包含切点的前缀，子标记及closer属于新会话，父未来不会自动补入子会话；普通Fork不创建运行时Subagent。
