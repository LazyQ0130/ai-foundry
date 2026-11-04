# H21 固定源码断言清单

Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。位置核验只证明身份和范围；实际分支语义按下表审读。官方测试仅选读，未执行其递归清理钩子。C/D为作者用例的限定证据，不把必要依赖重复算B。

## S01 · SubagentRuntime

- 源码：[packages/subagent/subagent/src/index.ts:194–237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/index.ts#L194-L237)。
- 条件、分支与教学结论：服务注册具名Provider，agents注入后建立Manager；服务本身不加载模型工具。
- 官方参考：[packages/subagent/subagent/tests/service.spec.ts:106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/service.spec.ts#L106-L126)，仅静态选读。
- 本轮行为：`C A registry`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S02 · resolveMaxDepth

- 源码：[packages/subagent/subagent/src/index.ts:244–250](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/index.ts#L244-L250)。
- 条件、分支与教学结论：显式工具值优先；provider-managed省略cap；否则每次读取Host配置cell。直接Runtime请求不自动补默认深度。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`C boundary tool-registration`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

- 补充：[packages/boot/config-editor/src/index.ts:46–80](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/config-editor/src/index.ts#L46-L80)；profile用户覆盖与继承层的来源，静态阅读。
- 补充：[packages/settings/settings/src/index.ts:301–330](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/settings/settings/src/index.ts#L301-L330)；显示实际值、base与user，静态阅读。
- 补充：[packages/client/ui-settings-subagent/src/client/subagent-limits-card-controller.ts:43–55](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/client/ui-settings-subagent/src/client/subagent-limits-card-controller.ts#L43-L55)；Host subagent section的两项限制，静态阅读。
## S03 · startActivation

- 源码：[packages/subagent/subagent/src/index.ts:271–287](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/index.ts#L271-L287)。
- 条件、分支与教学结论：先选名、校能力、取Manager并核精确在线parent，再分本地/外部分支。
- 官方参考：[packages/subagent/subagent/tests/service.spec.ts:106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/service.spec.ts#L106-L126)，仅静态选读。
- 本轮行为：`C A capabilities`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S04 · assertCapabilities

- 源码：[packages/subagent/subagent/src/index.ts:633–657](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/index.ts#L633-L657)。
- 条件、分支与教学结论：agentPreset要求支持且不继承上下文；其余按字段存在性检查能力标记。
- 官方参考：[packages/subagent/subagent/tests/service.spec.ts:106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/service.spec.ts#L106-L126)，仅静态选读。
- 本轮行为：`C A capabilities`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S05 · registerProvider

- 源码：[packages/subagent/subagent/src/index.ts:549–570](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/index.ts#L549-L570)。
- 条件、分支与教学结论：effect持有注册；重复/无执行方法拒绝，撤注册不撤销已持有执行。
- 官方参考：[packages/subagent/subagent/tests/service.spec.ts:106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/service.spec.ts#L106-L126)，仅静态选读。
- 本轮行为：`C boundary tool-registration`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S06 · mount / defineTool

- 源码：[packages/subagent/tool-subagent/src/index.ts:201–267](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/tool-subagent/src/index.ts#L201-L267)。
- 条件、分支与教学结论：provider存在才登记；描述由inheritsParentContext和prepareContinuable派生；output只含activation/id。
- 官方参考：[packages/subagent/subagent/tests/service.spec.ts:106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/service.spec.ts#L106-L126)，仅静态选读。
- 本轮行为：`D X model delegation, relay, settlement, cold continuation and fork comparison`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

- 补充：[packages/subagent/tool-subagent/src/index.ts:355–382](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/tool-subagent/src/index.ts#L355-L382)；Provider注册/撤销与模型工具的装卸，静态阅读。
## S07 · execute startActivation

- 源码：[packages/subagent/tool-subagent/src/index.ts:268–332](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/tool-subagent/src/index.ts#L268-L332)。
- 条件、分支与教学结论：工具用parent delivery启动，得到回执后返回kind/subagentId，未await result。
- 官方参考：[packages/subagent/subagent/tests/parent-result.spec.ts:15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/parent-result.spec.ts#L15-L35)，仅静态选读。
- 本轮行为：`D X model delegation, relay, settlement, cold continuation and fork comparison`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S08 · startLocal

- 源码：[packages/subagent/subagent/src/manager.ts:379–425](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L379-L425)。
- 条件、分支与教学结论：parent delivery需要持久化；caller可临时；捕获模型/策略，准备seed后再物化。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`D A no-persistence`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S09 · startLocal acceptance

- 源码：[packages/subagent/subagent/src/manager.ts:425–474](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L425-L474)。
- 条件、分支与教学结论：创建后接受初始消息、追加父目录再announce；返回childId和messageId。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`D A caller`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S10 · materialize

- 源码：[packages/subagent/subagent/src/manager.ts:739–767](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L739-L767)。
- 条件、分支与教学结论：每次物化先预留共享pool名额，失败释放；本地连续父链接共享容量。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`D D limits-tree`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S11 · ActivationPool.reserve

- 源码：[packages/subagent/subagent/src/activation.ts:24–37](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/activation.ts#L24-L37)。
- 条件、分支与教学结论：容量满立即ACTIVATION_LIMIT_REACHED；无无限排队，释放幂等。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`D D limits-tree`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S12 · materializeTracked

- 源码：[packages/subagent/subagent/src/manager.ts:851–960](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L851-L960)。
- 条件、分支与教学结论：本地经ownerCtx.agents.create/resume取得Handle；external start回句柄；startup信号连接只保留到接受窗口。
- 官方参考：[packages/subagent/subagent/tests/external-lifecycle.spec.ts:40](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/external-lifecycle.spec.ts#L40-L60)，仅静态选读。
- 本轮行为：`C boundary startup-abort`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S13 · SpawnInProcessProvider

- 源码：[packages/subagent/subagent-spawn-in-process/src/index.ts:35–59](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent-spawn-in-process/src/index.ts#L35-L59)。
- 条件、分支与教学结论：prepareContinuable返回空创建数据，无父对话seed；支持独立preset。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`D B spawn`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S14 · completedTurnPrefix / prepareContinuable

- 源码：[packages/subagent/subagent-fork-in-process/src/index.ts:46–80](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent-fork-in-process/src/index.ts#L46-L80)。
- 条件、分支与教学结论：取最后turn/end含自身的连续前缀；没有已完Turn则空；一次性seed，非持续同步。
- 官方参考：[packages/subagent/subagent/tests/continuation-inheritance.spec.ts:91](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation-inheritance.spec.ts#L91-L111)，仅静态选读。
- 本轮行为：`D C fork completed-prefix`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S15 · resolveChildDepth

- 源码：[packages/subagent/subagent/src/child-agent.ts:49–59](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/child-agent.ts#L49-L59)。
- 条件、分支与教学结论：父级depth+1并检查安全整数和可选绝对cap；不是任务总量。
- 官方参考：[packages/subagent/subagent/tests/child-agent.spec.ts:22](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/child-agent.spec.ts#L22-L42)，仅静态选读。
- 本轮行为：`D D limits-tree`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

- 补充：[packages/subagent/subagent/src/depth.ts:26–35](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/depth.ts#L26-L35)；持久header深度与runtime深度取最大值，静态阅读。
## S16 · parentAgentOptionsForDelegation / resolveChildAgentOptions

- 源码：[packages/subagent/subagent/src/child-agent.ts:68–124](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/child-agent.ts#L68-L124)。
- 条件、分支与教学结论：创建选项合并当前父请求路线与请求覆盖；不能只看Agent.options就声称实际请求路线已改。
- 官方参考：[packages/subagent/subagent/tests/child-agent.spec.ts:22](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/child-agent.spec.ts#L22-L42)，仅静态选读。
- 本轮行为：`D B spawn`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

- 补充：[packages/core/agent/src/model-selection.ts:69–120](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/model-selection.ts#L69-L120)；已记录的pending/lastUsed优先于创建选项fallback，静态阅读。
## S17 · childSessionMeta

- 源码：[packages/subagent/subagent/src/child-agent.ts:135–153](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/child-agent.ts#L135-L153)。
- 条件、分支与教学结论：记录parentSession、origin、depth、isSeeded；这些历史字段不代替Registry owner。
- 官方参考：[packages/subagent/subagent/tests/child-agent.spec.ts:22](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/child-agent.spec.ts#L22-L42)，仅静态选读。
- 本轮行为：`D B spawn`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S18 · applyChildComposition

- 源码：[packages/subagent/subagent/src/child-agent.ts:186–217](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/child-agent.ts#L186-L217)。
- 条件、分支与教学结论：有选择挂独立preset；省略composeFrom父当前代际；子上下文登记自身覆盖。
- 官方参考：[packages/subagent/subagent/tests/activation-presets.spec.ts:72](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/activation-presets.spec.ts#L72-L92)，仅静态选读。
- 本轮行为：`STATIC_REVIEW: preset registry not composed in H21 labs`；等级 `STATIC`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S19 · delegated policy capture / append

- 源码：[packages/subagent/subagent/src/child-agent.ts:248–280](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/child-agent.ts#L248-L280)。
- 条件、分支与教学结论：只捕获实际组合提供的策略；sandbox显式override，approval存在时pin never；不复制所有权限或一次性grant。
- 官方参考：[packages/subagent/subagent/tests/activation-policy.spec.ts:80](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/activation-policy.spec.ts#L80-L100)，仅静态选读。
- 本轮行为：`STATIC_REVIEW: permission services not composed in H21 labs`；等级 `STATIC`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S20 · settlementState

- 源码：[packages/subagent/subagent/src/manager.ts:1100–1110](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L1100-L1110)。
- 条件、分支与教学结论：自然结算须无ownedChildren且无正常待领Inbox；idle可仍驻留并占容量。
- 官方参考：[packages/subagent/subagent/tests/parked-wait.spec.ts:98](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/parked-wait.spec.ts#L98-L118)，仅静态选读。
- 本轮行为：`D D interrupt`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S21 · finishDisposal

- 源码：[packages/subagent/subagent/src/manager.ts:1113–1203](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L1113-L1203)。
- 条件、分支与教学结论：停止本地并等待后代/在创子级、idle、flush；捕获结果后释放Handle、归还slot、通知、end、resolve；清理错另由dispose拒绝。
- 官方参考：[packages/subagent/subagent/tests/run-settlement.spec.ts:9](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/run-settlement.spec.ts#L9-L29)，仅静态选读。
- 本轮行为：`C boundary teardown-failure`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S22 · notifySettlement

- 源码：[packages/subagent/subagent/src/manager.ts:1206–1224](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L1206-L1224)。
- 条件、分支与教学结论：caller不通知；精确父实例不可用则跳过；活动父steer，idle父queue；draining父inject，异常记警告。
- 官方参考：[packages/subagent/subagent/tests/parent-result.spec.ts:15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/parent-result.spec.ts#L15-L35)，仅静态选读。
- 本轮行为：`C boundary parent-replaced`；等级 `C`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S23 · flushFinalState

- 源码：[packages/subagent/subagent/src/manager.ts:1228–1237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L1228-L1237)。
- 条件、分支与教学结论：最终Session flush是best effort，失败记警告；不保证可恢复最新前缀。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`STATIC_REVIEW: final-flush failure not injected`；等级 `STATIC`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S24 · captureLocalResult

- 源码：[packages/subagent/subagent/src/activation.ts:156–170](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/activation.ts#L156-L170)。
- 条件、分支与教学结论：取本activation后缀的最后非空Assistant输出、epoch原因与可选结构化捕获；结果失败不等于缺少Session。
- 官方参考：[packages/subagent/subagent/tests/assistant-output.spec.ts:39](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/assistant-output.spec.ts#L39-L59)，仅静态选读。
- 本轮行为：`D B child-failure`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S25 · sendMessage

- 源码：[packages/subagent/subagent/src/manager.ts:537–563](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L537-L563)。
- 条件、分支与教学结论：精确live sender，仅驻留子→直接父，或父→直接子；其它谱系声明不给授权。
- 官方参考：[packages/subagent/subagent/tests/continuation-messages.spec.ts:12](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation-messages.spec.ts#L12-L32)，仅静态选读。
- 本轮行为：`D D messages`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S26 · submitAdmitted

- 源码：[packages/subagent/subagent/src/manager.ts:1438–1460](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L1438-L1460)。
- 条件、分支与教学结论：返回的是消息id；signal只到接受边界；deliver选择steer/queue，不等模型回复。
- 官方参考：[packages/subagent/subagent/tests/continuation-messages.spec.ts:12](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation-messages.spec.ts#L12-L32)，仅静态选读。
- 本轮行为：`D D messages`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S27 · coldResume

- 源码：[packages/subagent/subagent/src/manager.ts:1349–1415](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L1349-L1415)。
- 条件、分支与教学结论：query观察历史并核lineage和自身descriptor；重建不调用Provider；默认parent delivery；旧activation.dispose不触及新epoch。
- 官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L263-L283)，仅静态选读。
- 本轮行为：`D D cold-resume`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S28 · interrupt

- 源码：[packages/subagent/subagent/src/manager.ts:183–232](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/manager.ts#L183-L232)。
- 条件、分支与教学结论：ancestor核确切实例及记录lineage；本地cancel keepInbox，不等待、不清全部后代；外部中止并dispose一次执行。
- 官方参考：[packages/subagent/subagent/tests/control.spec.ts:88](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/control.spec.ts#L88-L108)，仅静态选读。
- 本轮行为：`D D limits-tree`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S29 · control tools

- 源码：[packages/subagent/tool-subagent-control/src/index.ts:29–113](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/tool-subagent-control/src/index.ts#L29-L113)。
- 条件、分支与教学结论：send_message返回MessageId；interrupt_agent返回accepted；工具不额外授予控制权。
- 官方参考：[packages/subagent/subagent/tests/continuation-messages.spec.ts:12](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation-messages.spec.ts#L12-L32)，仅静态选读。
- 本轮行为：`D D interrupt`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S30 · catalog projection / establishCatalogChild

- 源码：[packages/subagent/subagent/src/catalog.ts:115–164](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/catalog.ts#L115-L164)。
- 条件、分支与教学结论：父所有目录只读自身前缀后的成员事实；本地不论delivery都入册；外部仅parent入册。
- 官方参考：[packages/subagent/subagent/tests/catalog.spec.ts:28](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/catalog.spec.ts#L28-L48)，仅静态选读。
- 本轮行为：`D A caller`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S31 · snapshot / foldSubagentDescriptor

- 源码：[packages/subagent/subagent/src/descriptor.ts:220–269](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/descriptor.ts#L220-L269)。
- 条件、分支与教学结论：首条自身descriptor为准，版本3；未知版本不授continuation；不进入Surface；maxTokens/outputSchema不持久。
- 官方参考：[packages/subagent/subagent/tests/catalog.spec.ts:28](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/catalog.spec.ts#L28-L48)，仅静态选读。
- 本轮行为：`D D cold-resume`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

- 补充：[packages/subagent/subagent/src/descriptor.ts:30–48](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/descriptor.ts#L30-L48)；日志事实及版本3定义，静态阅读。
## S32 · listChildren / listDescendants

- 源码：[packages/subagent/subagent/src/list-children.ts:29–133](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/list-children.ts#L29-L133)。
- 条件、分支与教学结论：点读父投影，递归可达目录且释放观察，不resume Agent；未知/不可读分支诊断；external叶。
- 官方参考：[packages/subagent/subagent/tests/list-children.spec.ts:89](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/list-children.spec.ts#L89-L109)，仅静态选读。
- 本轮行为：`D persisted discovery in new Context starts no Agent or model request`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S33 · statusOf / project

- 源码：[packages/subagent/tool-subagent-control/src/list-agents.ts:50–74](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/tool-subagent-control/src/list-agents.ts#L50-L74)。
- 条件、分支与教学结论：模型列表仅continuable；Registry status===running才running，idle与缺席都inactive；不暴露常驻性。
- 官方参考：[packages/subagent/subagent/tests/list-children.spec.ts:89](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/list-children.spec.ts#L89-L109)，仅静态选读。
- 本轮行为：`D D cold-resume`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S34 · createSettlementMessage

- 源码：[packages/subagent/subagent/src/continuation-messages.ts:140–173](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/continuation-messages.ts#L140-L173)。
- 条件、分支与教学结论：通知是runtime source=subagent-settled，与子自发agent-message分开；closing文本可省略，结构化/诊断另外附。
- 官方参考：[packages/subagent/subagent/tests/parent-result.spec.ts:15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/parent-result.spec.ts#L15-L35)，仅静态选读。
- 本轮行为：`D X model delegation, relay, settlement, cold continuation and fork comparison`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S35 · createActivationObserver

- 源码：[packages/subagent/subagent/src/lifecycle.ts:96–118](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/lifecycle.ts#L96-L118)。
- 条件、分支与教学结论：新runId配对start/end，同一child冷恢复是新run；事件观察与结果Promise、持久事实不同。
- 官方参考：[packages/subagent/subagent/tests/external-lifecycle.spec.ts:40](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/external-lifecycle.spec.ts#L40-L60)，仅静态选读。
- 本轮行为：`D D cold-resume`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S36 · SessionStore.fork

- 源码：[packages/core/session/src/index.ts:1403–1419](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L1403-L1419)。
- 条件、分支与教学结论：普通fork选合法切点，buildForkSeed可闭合开放尾；不调用SubagentManager或追加父catalog。
- 官方参考：[packages/core/session/tests/fork.spec.ts:62](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/tests/fork.spec.ts#L62-L82)，仅静态选读。
- 本轮行为：`D C fork completed-prefix`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S37 · Registry ownership

- 源码：[packages/core/agent/src/index.ts:603–623](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L603-L623)。
- 条件、分支与教学结论：isOwnedBy比较精确Agent对象；历史parentSession不决定roots。
- 官方参考：[packages/core/agent-loop/tests/scope-lifecycle.spec.ts:67](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/scope-lifecycle.spec.ts#L67-L87)，仅静态选读。
- 本轮行为：`D B spawn`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。

## S38 · Factory teardown

- 源码：[packages/core/agent-loop/src/index.ts:465–550](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L465-L550)。
- 条件、分支与教学结论：Factory清理精确实例；不把父Agent.cancel等同Manager整个子树drain。
- 官方参考：[packages/core/agent-loop/tests/scope-lifecycle.spec.ts:67](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/scope-lifecycle.spec.ts#L67-L87)，仅静态选读。
- 本轮行为：`D D limits-tree`；等级 `D`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。
