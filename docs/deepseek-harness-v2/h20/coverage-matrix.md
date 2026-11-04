# H20 行为与验证范围

固定官方Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。45个TAP执行项互斥分级C6/D39；参数化与共享夹具不称45种独立可靠性风险。实际 [TAP](evidence/lab-tests.txt)、[总体结果](evidence/lab-results.json)、[逐例完整事件](evidence/behavior-traces.json)、时间戳run/traces均保留。

| 用例 | 实际触发与主要断言 | 等级 / 真实对象 / 替身 |
|---|---|---|
| policy | 默认5/.1/500/10000与合格码；坏预算/重复码拒绝；always忽略旧normal字段 | C，真实resolveRetryPolicy |
| A:success / no-plugin | 首次成功1次；不挂Retry的Loop限流1次后结束 | D，真实Loop/Runtime |
| A:rate-limit/server/timeout/empty | 首失败、计划、500虚拟ms、started、后成功；同Turn/Step/user | D，真实Retry与受控Adapter规范码 |
| A:auth/quota/adapter-aborted | 无计划，不重试；Adapter ABORTED而Agent signal未abort时Turn为error | D；不等于真实HTTP或用户取消 |
| A:budget | 默认5次重试、6次调用，500/1000/2000/4000/8000，最后error | D，真实Projection/策略/时钟调用 |
| A:jitter | U1、.1，550/1100/2200/4400/8800/10000；预算耗尽 | D；U0/.1与j1下界0仅公式/官方测试静态 |
| A:retry-after/over-cap/always-over-cap | 9000接受；20000 normal委派，always本地500 | D；直接提供providerRetryAfterMs，无真实HTTP头 |
| A:always / downstream / downstream-error | AUTH/QUOTA可重试到脚本成功；下游retry优先且不写本插件计划；下游抛错回退 | D，调用次数有界，未启动无限网络循环 |
| A:raw-stream | 安装插件也不让直接ctx.llm.stream自动重试 | D，真实Runtime；一次Adapter调用 |
| A:middleware | 插件抛错不进入request-error，Adapter0次 | D，真实外部middleware边界 |
| A:partial | 已有文本/完整工具提议后TRANSPORT失败；Attempt保存，下一请求无失败分片，工具0 | D，实际Loop结算/请求输入 |
| A:compaction-normal / compaction-always | 同一注册顺序，Basic摘要1、普通请求2、通用Retry计划0 | D，真实Basic/Meter；不是全部顺序/策略组合 |
| B:before-request | pre-step取消，模型0；Turn aborted、零Step | D，真实控制路径 |
| B:stream-prefix / stream-empty | 安全文本interrupted消息，半调用不执行；无内容只Attempt | D，真实Assembler/实时帧；reasoning分支本轮静态 |
| B:backoff | 已计划无started；cancel清timer、无第二调用 | D，虚拟定时器，真实取消监听器 |
| B:tool-business / tool-policy | 主体失败1次/策略前置失败主体0；错误tool/result进入后续模型，request-error0，Turn可completed | D，真实ToolsService/Pipeline |
| B:tool-before / tool-after | 主体0 BEFORE_DISPATCH；主体已增假计数1后取消，idle等门控，再ABORTED | D；外部世界为内存效果 |
| B:parallel | 停止补位；first成功保留，second排空ABORTED，third主体0；模型序结果 | D，真实Batch，最大并发2 |
| B:inbox-clear / inbox-keep | 默认清待办；keep留队列但不自动重跑；新followup后FIFO | D，真实持久Inbox投影 |
| B:handle-dispose / plugin-dispose | Handle取消活动并退出；插件取消自身恢复，timer0、无后续请求 | D，真实生命周期；全资源故障矩阵未验 |
| B:delegated | 下游门控不退出时idle/dispose均pending；释放后取消胜出 | D，协作不及时场景，门控最终明确释放 |
| C:recovered / cancelled | 真实JSONL保存Attempt/计划/started或取消缺started；显式flush/close，新实例逐对象重读/Resume；旧请求与timer0 | D，Windows原始JSONL、同进程新后端 |
| D:not-started/unknown/result/closed-step | 官方Repair不同代码/来源/顺序、原前缀不变、重复修复空、旧Step不重修 | C，真实Session/Repair；人工closed-step仅组件夹具 |
| D:idempotency | Repair不执行工具，假效果仍1；业务键返回旧结果，盲重变2 | C限Repair；业务键与外部效果为A级教学模拟 |
| X | 真Loop限流→Retry→工具效果→保存开放前缀→原任务取消排空→新JSONL副本真实Resume→UNKNOWN/NOT_STARTED→外部核查后新请求 | D，跨组件有连接证据；逻辑中断副本不是进程崩溃 |

所有Loop重试用例另核pre-step、工具resolve、assemble各1；计数包装真实服务方法，没有新增已弃用agent/request监听器。普通输入仅首次提交，当前Surface与运行时Context仍可能刷新。

## 正交范围

| 维度 | H20本轮状态 |
|---|---|
| 真实组件 / 受控Provider | 已执行，Adapter与工具主体不联网、不付费 |
| 退避时间 / 随机源 | 虚拟定时器与官方random钩子；事件Date.now仍宿主时间，断言不靠真实sleep |
| 实际外部副作用 | 无；仅内存计数/Map，所有磁盘为新测试根 |
| 完全停稳 | B实际验证gate未放行时pending，放行后完成；不保证第三方任意Promise可强杀 |
| 真实磁盘 / 原始JSONL | C/X已执行，compression:none，flush/close、新实例重读与真实Resume |
| 同进程 / 新后端实例 | 已执行，关闭旧Context再建新Context |
| 独立进程 / Zstd / 真实崩溃或断电 / 跨平台 | 本轮未验证；H18历史结果单列，不继承为H20通过 |
| Retry与工具事实一致性 | 已执行列明输入；原前缀、模型历史、配对结果与关闭边界分别核对 |
| 失败结算拒绝、注册就绪失败、完整调度器故障、全部Provider路由切换 | 本轮仅源码/官方测试选读或历史证据，不是完整动态矩阵 |
| 真实Provider费用、性能、缓存收益、E级应用 | 未验证 |
| 真实学员、实测用时、独立外审 | 未验证 |

Session.append计划在等待前完成，不构成所有后端的flush屏障；真实保存证据仅来自C/X明确检查点。Retry记录也不是可恢复定时任务队列，重读不会重放旧计时器或工具。
