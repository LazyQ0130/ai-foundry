# Compaction、Surface与Retry交互专项

## 日志与摘要是两个职责

真实Basic读取Meter对应当前Surface的合法消息视图，保护首system头并按工具配对平衡选区。start在await摘要之前同步提交；summary存摘要事实、路由、用量与rawOutput；单独的user/message replace承载框定摘要；end闭合尝试。compaction/*没有SurfaceOp，不会自动成为模型消息。sourceEventSeqs列start、summary及精确shadowed节点；原事件保留。

H17的按位置替换与H19一致：端点必须在当前Surface中，包含两端，源覆盖全部被遮蔽节点。`[4,37,32]`按当前位置解释；shadowedRange并非日志数值区间。工具提议与结果不能被非法切成孤立片段。先前summary已提交而replace失败，summary仍在、旧Surface不变；replace已成功而end失败，新Surface可生效且日志留活动锁。不是整体原子回滚。

## 三种预算分别记账

|所有者|资格/计数|实际边界|
|---|---|---|
|TokenMeter|当前封装+Surface、可用Usage锚点、路由价格|不是策略，不自动压缩；UI提示词压力与账单不同|
|Basic常规压力|T=floor(min(W×ratio,W−O−B))；R=floor((W−O)×retainRatio)或显式R|先可选prune并重测，仍高再摘要；最多首次+compactionRetries收敛尝试|
|Basic溢出恢复|规范CONTEXT_WINDOW_EXCEEDED；独立maxOverflowRetries；replaceGeneration前进且未取消|retain0与常规R不同；没有进展不能凭这一路授权重发；idle或成功Assistant重置|
|普通Retry normal|provider+完整policyKey下的maxRetries、合格码与延迟范围|默认5额外次→同策略同Step至多6次初始含在内；不约束其他恢复插件|
|Retry always|下游优先；无normal码过滤/次数上限|可以持续失败/计费；必须可取消、排空，绝不承诺成功|

W10000、O1000、B2000、ratio.8得T7000，P7000触发；retainRatio.16得1440。会话O与辅助摘要maxTokens不是同一个字段。Usage1170含input1000/cache100+20/output50，reasoning10不重复加；UI1120是提示词侧参考。精确分词、真实计费与缓存收益未验证。

pre-step失败告警后可继续普通请求；模型切换先按目标容量压缩，失败拒绝目标且保留旧header，已落改写不回滚；Overflow是在同一Step失败attempt之后恢复，成功/失败的Step结束都在后面。官方文档“失败步骤关闭后”的概括不能当作实现时序。

## 新增顺序反例（真实插件）

本轮提供方normal自定义合格集合仅含Overflow，maxRetries1；长输入约低于常规阈值、可摘要，Basic.maxOverflowRetries1。Adapter和业务工具受控，恢复组件真实；无付费Provider。

|注册/脚本|普通请求|普通计划|辅助摘要|观察|
|---|---|---|---|---|
|Retry→Basic；Overflow→成功|2|1|0|normal先处理合格错误，不调用下游；可无输入变化重发|
|Basic→Retry；Overflow→成功|2|0|1|Basic先取得Surface进展并返回retry，Retry未消费预算|
|Retry→Basic；Overflow→Overflow→成功|3|1|1|normal耗尽后委派，Basic独立预算仍可恢复；同Step，pre-step/assemble各1|

原H20 normal/always默认组合均2次普通请求、1次摘要、0普通计划；本轮反例说明它们不能推广成任意顺序/合格集合都相同。没有所谓“全局最多重试5次”。上述3次也只是给定脚本的结果，不能把两个max的数简单相加当全应用定理。

普通Retry计划append后直接等待，没有这里的flush；started表示等待完成，不证明Provider已收到或成功。新prefix探针对每次llm/stream保存当时事件前缀，另建真实Session核messages/config/tools/toolHistory；失败片段仅在attempt，后续请求无DO_NOT_REPLAY，真实JSONL读回与已提交日志相等。

## 取消与失败一致性

摘要期间取消，组件须观察signal、尝试记录error end，已提交事实保留；压缩已有部分进展也不能覆盖取消继续请求。若摘要忽略signal，则调用者还需等待结算，不能强杀任意Promise。自动区域本身不flush；手动闭合后等待Session检查点，失败可报persistence而Surface已变。end-seed将旧未匹配start划入旧生命周期，不删除失败证据。

源码：[Basic恢复](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/compaction/compaction-basic/src/index.ts#L215-L265)、[顺序提交](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/compaction/compaction-basic/src/region.ts#L471-L523)、[Retry](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm-retry/src/index.ts#L149-L256)。

已验真实Compaction协议/选区/标记/Surface、普通Retry与指定顺序组合；摘要事实质量、提供方缓存/费用、所有策略和平台组合、完整应用E均未验证。
