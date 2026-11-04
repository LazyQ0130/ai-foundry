# H20 差异与研发修订

固定版本f3803c96974ad4a94195fb97e5c637e9c2a3afe3。下列区分进入正式正文、答案和图；没有回写H01–H19掩盖旧表述，没有改官方实现或删失败证据求PASS。

## 文档概括与实现边界

1. llm-retry README将恢复概括成“重跑失败步骤”，以及“先持久、后等待”。实际agent.ts:435–609在同Step的attempt循环内继续，不重pre-step/assemble/用户准入；retry插件backoff在Session.append后直接等timer，没有flush调用。因此本课分别写“同Step新Attempt”“先逻辑登记计划，通用磁盘耐久须另有检查点”，C/X真实flush只证明本轮条件。计划也不会由Resume自动变回计时器。
2. agent-loop README用“被取消的流追加interrupted锚点”概括。实际catch先看当前signal，只有非空安全text/reasoning才记interrupted message，否则Attempt；Adapter单独ABORTED终态在本地signal仍活着时可最终Turn error。A/B分别验证，不能把所有aborted字样当用户取消。
3. “插件/工具错误关闭Turn”需要分实施边界。单工具pre/body异常可规范为错误结果，B:tool-business/tool-policy随后仍能让模型解释并completed；模型middleware抛错则不进request-error。内部调度失败排空后向上拒绝是另一条静态核对分支。
4. tool/call是登记开始边界，主体仍可能在dispatch前取消；未派发项会有合成call/result对。X的早期副本缺call却补NOT_STARTED，不把它与原任务后来的BEFORE_DISPATCH记录混用。幂等键只在教学假外部Map演示，未声明为Harness通用能力。
5. H18实际材料支持Windows独立进程/Zstd等指定路径；H19只做同进程新实例的Compaction恢复。H20没有把前两课能力转记成本轮动态通过。历史报告各保留原证据和限制。

## 夹具问题及保留证据

- 初版A误按assistant/message包装读取user/message，修为真实data.source；预算默认有.1抖动，样本统一.5后才得到500起步，U1仅用于jitter分支。
- 只有一个巨大尾节点没有可压缩前缀；专门恢复实验改为注入较早上下文加新的用户输入，保留真实选择器的null语义，未放宽Compaction断言。
- JSONL有自己的write-behind timer，不能用“任意pending timer”代替Retry已计划。C/X按真实llm/retry事件同步；不在嵌套Context中安装两套全局时钟，防止跨实例clear误归属。恢复全局定时器在断言前进行，失败仍保留报错。
- Resume发布前的修复批次不作为新增session/event补发；X改用真实持久句柄读取完整恢复前缀，逐事件核对UNKNOWN/NOT_STARTED与end-seed。未用Mock补造成功事件。
- 源码索引严格查找实际private resumeWith和LlmRuntime.prepareCall位置，不把LlmAdapter同名准备函数误作Runtime实现；所有56条保存hash与固定行范围。

并发取消点最终放在第一条真实Session tool/result提交后的session/event通知，避免把tools/result最终观察和持久日志提交当成同一时刻。原始失败run/traces与临时目录均保留；正式教材只采用修正后实际轨迹。以上已闭合作者侧缺陷，无已确认未解决P0/P1。真实Provider、第三方不合作取消与完整应用仍是验证缺口，不能以本课测试数量消除。
