# 取消、生命周期与外部副作用专项

## 从H12/H14到H20的恢复边界

Runtime消费一次请求流；Adapter规范LlmFailure，Loop在明确Attempt边界结算。规范error/aborted finish可先写assistant/attempt，再进request-error。normal或专门策略授权后重新prepare/derive请求，复用该Step assembly/toolSet，不重跑pre-step、接纳用户或整个Turn工具。

成功assistant/message中的工具提议才进入真实工具批次。失败Attempt即使已有完整参数，仍非执行授权，普通模型历史也不包含它。tool/call是调度接手记录，早于主体dispatch；tool/result才记录已知结算，但错误或取消result均不证明外部效果为零。模型请求重复尝试会有成本且可能在Provider处理过；本课程的安全边界是未将失败提议派发为工具，不能借此给任意外部请求“无效果”保证。

## 六条实际轨迹

下表使用各夹具自己的事件顺序，省略不改变判断的inbox/header；不把不同夹具Seq混成一个运行。详细记录在H20本轮behavior-traces。

|取消时点|可观察轨迹|谁负责等待/未保证|
|---|---|---|
|模型流前|turn/start→pre-step中cancel→turn/end aborted；该夹具模型0、可零Step|Loop观察signal；没有理由伪造Assistant消息|
|已交付文本|Step→SAFE_PREFIX+半截tool→signal abort→assistant/message interrupted→step/end→turn/end aborted|Assembler只保留非空text/reasoning，丢工具块；没有安全块则assistant/attempt|
|Retry计划在等待|attempt→llm/retry→取消→timer清除→无started→Step/Turn结束|cancellableDelay融合当前signal/lifetime；旧计划重开不复启timer|
|工具尚未派发|Assistant提议→call可已登记→prepare发现取消→ABORTED_BEFORE_DISPATCH result|不能仅以call存在声称主体执行；主体计数0|
|工具已开始|call→内存假效果1→cancel→whenIdle仍pending→门闩释放→ABORTED result→Step/Turn闭合|Pipeline/Batch等待主体；已完成首结果保留，停止补位，后项合成call/result按模型序提交|
|持久化排空中|Session事件入buffer→flush/close等待修改链/写入→sync结算→释放writer|运行cancel不会回滚字节；close不可取消且须排空。H18 buffer动态验排空/失败重试，精确“cancel与物理sync同时竞赛”未注入，属源码轨迹|

最后一行没有冒充实际物理取消竞态已测：源码显示close循环drainLive/await chain，退出须观察其Promise；H20虚拟timer测试不能替代磁盘故障测试。

## 三种退出责任

`agent.cancel`中止当前活动、默认清待办；keepInbox仅保留尚未开始输入，不保证立即唤醒。`whenIdle`追踪活动替换并等已启动工作到达结束边界，不是成功/耐久回执。`AgentHandle.dispose`由生命周期所有者发disposed取消并等idle，接着退出Scope、关闭writer、移出登记；不删已存历史。Retry插件dispose先注销监听、abort自身lifetime，再allSettled活动恢复；已进入下游若不合作，仍要等其结算。

`AgentCancelCause`的user/parent/hook/disposed是控制原因，不是HTTP错误码。Adapter报告ABORTED但Agent signal未abort时可最终为Turn error；真正用户取消才形成aborted及原因。没有保证取消必然终止任意OS进程，H21完整父子树与真实Shell/Jobs也未在本轮验证。

## 未知工具结果的安全决定

|证据|保守事实|允许的分析|
|---|---|---|
|提议但无call|NOT_STARTED；无call来源|只说明前缀未记录开始；Fork父可能在切点后执行|
|call但无result|UNKNOWN；来源引用call|结果未记录；效果可能已发生，先核外部状态/业务键/权限|
|已有匹配append结果|使用已记结果，不再合成该项|不因Resume重复执行|
|Step已闭合|核心repair不追补旧Step|不能声称自动补全一切历史错误|

H20 X的前缀0–12中假效果已1，原任务后来取消得到ABORTED/BEFORE_DISPATCH；新ID副本只继承前缀，Resume补UNKNOWN/NOT_STARTED/Step/Turn/marker，旧工具0次。二者未来不能互搬。D的Map业务键复用保持1，无键盲重变2；这是教学策略，Harness没有为所有外部工具提供通用恰好一次。

源码：[安全前缀结算](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L499-L540)、[工具排空与skip](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/batch.ts#L117-L283)、[句柄close](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-persistence-jsonl/src/storage.ts#L214-L264)。
