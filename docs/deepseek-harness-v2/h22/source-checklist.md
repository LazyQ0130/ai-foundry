# H22 固定源码断言

固定 Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。准确范围与分支审读并用；官方 Vitest 仅静态选读，含递归清理的原钩子不执行。本地 C/D 映射只覆盖列明子分支，不等于整文件覆盖。

## S01 · WorkflowEngine / emitWorkflowEvent

单一 ctx.workflowEngine 服务，不是具名后端表；观察者同步与异步异常分别包含。

源码：[packages/workflow/workflow/src/index.ts:157–192](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow/src/index.ts#L157-L192)。官方参考：[packages/workflow/workflow/tests/workflow.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow/tests/workflow.spec.ts#L1)，选读未执行。本轮 `C C4`，等级 `C`。

## S02 · WorkflowStartRequest / WorkflowRun

script、meta、args、parent、signal、subagentProvider、maxTotalAgents；start返回持有者拥有的run，result约定不拒绝，dispose异步。

源码：[packages/workflow/workflow/src/runtime-types.ts:19–49](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow/src/runtime-types.ts#L19-L49)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:746](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L746)，选读未执行。本轮 `C A1; C C1`，等级 `C`。

## S03 · WorkflowMeta / WorkflowResult

meta是数据；stopReason为completed/cancelled/error；value只在completed有意义；agentsStarted正常来自guest接受数量，终止可能降为host观察数。

源码：[packages/workflow/workflow/src/types.ts:28–87](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow/src/types.ts#L28-L87)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:201](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L201)，选读未执行。本轮 `C A1; C A3; C C1`，等级 `C`。

## S04 · WorkflowResultInfo / WorkflowAgentInfo

实时end只含终态信息，不含最终value；agent事件含seq/label/childId与可选phase。

源码：[packages/workflow/workflow/src/types.ts:90–131](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow/src/types.ts#L90-L131)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:861](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L861)，选读未执行。本轮 `D D1; C C1`，等级 `D`。

## S05 · WorkflowError / isFatalWorkflowError

十二类code，fatal默认true；普通异常与本实现创建的致命契约错误分开。

源码：[packages/workflow/workflow/src/index.ts:108–149](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow/src/index.ts#L108-L149)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:350](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L350)，选读未执行。本轮 `C B4`，等级 `C`。

## S06 · Config / assertBodyParses

脚本是JavaScript异步函数体，支持顶层await，拒绝TS标注和export meta；四项引擎限制。

源码：[packages/workflow/workflow-ptc/src/index.ts:33–65](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/index.ts#L33-L65)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:582](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L582)，选读未执行。本轮 `C A2`，等级 `C`。

## S07 · provider and total admission

整次run选择一个Subagent Provider；未知Provider为AGENT_START；每次总量正整数且不得越过引擎上限。

源码：[packages/workflow/workflow-ptc/src/index.ts:68–96](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/index.ts#L68-L96)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:279](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L279)，选读未执行。本轮 `C A2; C B5`，等级 `C`。

## S08 · PtcWorkflowEngine constructor

默认spawn；并发0由CPU推导最多16；总量1000、组合器4096、同步切片5000ms；要求runtime语言typescript，不代表脚本接受TS。

源码：[packages/workflow/workflow-ptc/src/index.ts:100–133](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/index.ts#L100-L133)。官方参考：[packages/workflow/workflow-ptc/tests/host.spec.ts:263](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/host.spec.ts#L263)，选读未执行。本轮 `STATIC_REVIEW`，等级 `STATIC`。

## S09 · PtcWorkflowEngine.start

先meta/parse/Provider/cap，structuredClone args，然后建立run并发布start；结果后发end，meta与args分别捕获。

源码：[packages/workflow/workflow-ptc/src/index.ts:134–190](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/index.ts#L134-L190)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:186](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L186)，选读未执行。本轮 `C A1; C A2; C A4`，等级 `C`。

## S10 · validateMeta

校验必填及允许字段并复制meta；name只校非空，未强制kebab正则；phases声明不建立调度控制。

源码：[packages/workflow/workflow-ptc/src/meta.ts:1–82](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/meta.ts#L1-L82)。官方参考：[packages/workflow/workflow-ptc/tests/meta.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/meta.spec.ts#L1)，选读未执行。本轮 `C A2; C C4`，等级 `C`。

## S11 · WorkflowExecution.drive

创建VM context注入六类钩子和args；syncTimeout只包初始runInContext；返回值物化、undefined归null，异常成为error结果。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:56–142](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L56-L142)。官方参考：[packages/workflow/workflow-ptc/tests/guest.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/guest.spec.ts#L1)，选读未执行。本轮 `C A3; C C3`，等级 `C`。

## S12 · acquireSlot / agent

guest接受计数先于FIFO槽；启动失败AGENT_START，结果拒绝AGENT_RESULT；已结算子级非completed返回null；finally dispose并还槽。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:144–237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L144-L237)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:471](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L471)，选读未执行。本轮 `C B1; C B4; C B5; C B6`，等级 `C`。

## S13 · agent schema result

schema为受支持object子集；completed但缺structured也返回null；无schema拼接文本输出。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:163–237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L163-L237)。官方参考：[packages/workflow/workflow-ptc/tests/integration.spec.ts:73](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/integration.spec.ts#L73)，选读未执行。本轮 `C B7`，等级 `C`。

## S14 · readAgentOptions

只支持label、phase、schema、provider、model；effort/isolation/agentType延后未支持；provider/model是模型路线，非Subagent backend。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:239–282](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L239-L282)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:232](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L232)，选读未执行。本轮 `C B4; D D1`，等级 `C`。

## S15 · parallel

先整体校验数组/条目，再Promise.all；结果按输入顺序，普通thunk抛错为null，fatal继续传播。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:285–308](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L285-L308)。官方参考：[packages/workflow/workflow-ptc/tests/guest.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/guest.spec.ts#L1)，选读未执行。本轮 `C B1; C B3; C B4`，等级 `C`。

## S16 · pipeline

pipeline(items,...stages)，回调(previous,item,index)；每项内部顺序，无跨条目阶段屏障；普通throw使该项null并跳过余阶段。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:311–340](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L311-L340)。官方参考：[packages/workflow/workflow-ptc/tests/guest.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/guest.spec.ts#L1)，选读未执行。本轮 `C B2; C B3; D D1`，等级 `C`。

## S17 · assertItemCap / phase / log

组合器条目上限在调用前拒绝；phase只非空字符串并更新注解，log只字符串；不要求匹配meta声明、不产生屏障。

源码：[packages/workflow/workflow-ptc/src/runtime.ts:339–367](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/runtime.ts#L339-L367)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:201](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L201)，选读未执行。本轮 `C B5; C C4`，等级 `C`。

## S18 · materializeFromRealm

只接受无损plain JSON：拒绝exotic prototype、循环、嵌套undefined、非有限数、BigInt、稀疏数组、函数；不能用JSON.stringify替代。

源码：[packages/workflow/workflow-ptc/src/realm.ts:44–147](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/realm.ts#L44-L147)。官方参考：[packages/workflow/workflow-ptc/tests/realm.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/realm.spec.ts#L1)，选读未执行。本轮 `C A3; C A4`，等级 `C`。

## S19 · PtcWorkflowRun ownership

捕获服务/父级/策略，cancel只请求停止；dispose共享result之后的Promise；pending集合用于结算等待。

源码：[packages/workflow/workflow-ptc/src/host.ts:113–187](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/host.ts#L113-L187)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:746](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L746)，选读未执行。本轮 `C C1`，等级 `C`。

## S20 · startChild

所有子级使用同一parent与cwd，delivery caller；不传显式maxDepth；晚到已取消句柄先dispose再拒绝发布。

源码：[packages/workflow/workflow-ptc/src/host.ts:200–229](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/host.ts#L200-L229)。官方参考：[packages/workflow/workflow-ptc/tests/host.spec.ts:267](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/host.spec.ts#L267)，选读未执行。本轮 `C C2; D D1`，等级 `C`。

## S21 · childResult / disposeChild

子级结果严格JSON过界；dispose memoize，异常被catch并warn；不能宣称任意清理失败都由result拒绝。

源码：[packages/workflow/workflow-ptc/src/host.ts:231–256](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/host.ts#L231-L256)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:531](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L531)，选读未执行。本轮 `C B4; C C1`，等级 `C`。

## S22 · onProgress / cancelled

host只接受当前活跃子级，cancel后不再叙述；未收正常guest结果的取消计数用host已观察启动数。

源码：[packages/workflow/workflow-ptc/src/host.ts:258–280](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/host.ts#L258-L280)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:695](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L695)，选读未执行。本轮 `C C1; C C4`，等级 `C`。

## S23 · drive finally

策略受限而runtime不宣称confinement则fail closed；调用timeoutMs:null；finally abort、dispose、排空pending并补live agent终边。

源码：[packages/workflow/workflow-ptc/src/host.ts:282–324](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/host.ts#L282-L324)。官方参考：[packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts:888](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/workflow-ptc.spec.ts#L888)，选读未执行。本轮 `C C1; C C2; C C3; C boundary missing confinement`，等级 `C`。

## S24 · runWorkflowGuest

进度分批有序发Host，已发布子级dispose前排空进度；最后再排空进度后返回。

源码：[packages/workflow/workflow-ptc/src/guest.ts:16–75](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/guest.ts#L16-L75)。官方参考：[packages/workflow/workflow-ptc/tests/guest.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/guest.spec.ts#L1)，选读未执行。本轮 `C C1; D D1`，等级 `C`。

## S25 · NodePtcRuntime

真实隔离进程经sandbox与subprocess执行，sandboxMode反映默认策略；不以VM充当安全边界。

源码：[packages/ptc-runtime/ptc-runtime-node/src/index.ts:1–104](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/ptc-runtime/ptc-runtime-node/src/index.ts#L1-L104)。官方参考：[packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts#L1)，选读未执行。本轮 `C C5`，等级 `C`。

## S26 · resolveConfig

PTC maxPendingCalls默认128为binding在途请求预算，独立于Workflow子级并发；内存、消息和进程grace也独立。

源码：[packages/ptc-runtime/ptc-runtime-node/src/config.ts:1–65](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/ptc-runtime/ptc-runtime-node/src/config.ts#L1-L65)。官方参考：[packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts#L1)，选读未执行。本轮 `STATIC_REVIEW`，等级 `STATIC`。

## S27 · local Windows backend

Windows ACL默认partial，read-only不授写权；文件策略不等于网络隔离，不能静默以unrestricted补受限能力。

源码：[packages/sandbox/sandbox-local/src/index.ts:1–586](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sandbox/sandbox-local/src/index.ts#L1-L586)。官方参考：[packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts#L1)，选读未执行。本轮 `C C5; C boundary missing confinement`，等级 `C`。

## S28 · Windows ACL runner

正式runner创建受限令牌，失败报告非零，不启动无约束替代；实验只打包固定源码。

源码：[packages/sandbox/sandbox-windows-acl/src/runner.ts:1–229](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sandbox/sandbox-windows-acl/src/runner.ts#L1-L229)。官方参考：[packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/tests/built-runtime.e2e.ts#L1)，选读未执行。本轮 `C C5`，等级 `C`。

## S29 · apply / tool schema

工具消费抽象Engine；meta/script分开；enableRunInBackground可隐藏Schema参数；用工具prompt限定显式workflow或大规模编排。

源码：[packages/workflow/tool-workflow/src/index.ts:318–400](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/index.ts#L318-L400)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:619](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L619)，选读未执行。本轮 `D D2`，等级 `D`。

## S30 · foreground execute

前台传工具signal，等待结果，异常由Tools形成isError；finally等待dispose，根调用才finish/abandon记录。

源码：[packages/workflow/tool-workflow/src/index.ts:401–487](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/index.ts#L401-L487)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:298](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L298)，选读未执行。本轮 `D D1; D D2`，等级 `D`。

## S31 · renderResult

maxResultChars截展示JSON字符串，不截Engine值，也不是计算或安全预算。

源码：[packages/workflow/tool-workflow/src/index.ts:239–249](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/index.ts#L239-L249)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:382](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L382)，选读未执行。本轮 `D D2`，等级 `D`。

## S32 · createWorkflowRecorder

仅根调用记录run-start/agent-start/agent-end/run-end四类log-only事实；append失败warn并停记，不反转工作流。

源码：[packages/workflow/tool-workflow/src/index.ts:93–169](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/index.ts#L93-L169)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:154](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L154)，选读未执行。本轮 `D D1`，等级 `D`。

## S33 · tool-workflow Session event types

持久payload不包含phase/log或全部子历史；不能将runtime事件自动等同持久Session输入。

源码：[packages/workflow/tool-workflow/src/types.ts:1–64](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/types.ts#L1-L64)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:228](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L228)，选读未执行。本轮 `D D1; C C4`，等级 `D`。

## S34 · startBackgroundRun

Jobs先准入再同步建立run，无tool-step signal；返回jobId/runId；job取消拥有run；done等待dispose后映射终态。

源码：[packages/workflow/tool-workflow/src/index.ts:263–316](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/index.ts#L263-L316)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:479](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L479)，选读未执行。本轮 `D D3; D D4`，等级 `D`。

## S35 · jobOutcomeOf

completed→completed携渲染结果；cancelled→killed；error→failed。后台不是Engine自身恢复机制。

源码：[packages/workflow/tool-workflow/src/index.ts:219–237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/index.ts#L219-L237)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:541](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L541)，选读未执行。本轮 `D D3; D D4`，等级 `D`。

## S36 · createWorkflowRecordMirror

phase更新progress并向log通道追加，log和成员观察也进log；不是模型增量流。

源码：[packages/workflow/tool-workflow/src/record.ts:37–64](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/src/record.ts#L37-L64)。官方参考：[packages/workflow/tool-workflow/tests/tool-workflow.spec.ts:479](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/tool-workflow/tests/tool-workflow.spec.ts#L479)，选读未执行。本轮 `D D3`，等级 `D`。

## S37 · JobRegistry

抽象服务不可直接装载；producer提供cancel/done；owner授权、controller准入、read模型游标、readAt观察游标各自独立。

源码：[packages/jobs/jobs/src/index.ts:85–198](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/jobs/src/index.ts#L85-L198)。官方参考：[packages/jobs/jobs-local/tests/events.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/jobs-local/tests/events.spec.ts#L1)，选读未执行。本轮 `D D3; D D4`，等级 `D`。

## S38 · LocalJobRegistry

任务表和环在进程内；五状态running/stopping/completed/killed/failed；读后终态结果只交一次，非持久脚本检查点。

源码：[packages/jobs/jobs-local/src/index.ts:1–717](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/jobs-local/src/index.ts#L1-L717)。官方参考：[packages/jobs/jobs-local/tests/events.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/jobs-local/tests/events.spec.ts#L1)，选读未执行。本轮 `D D3; D D4`，等级 `D`。

## S39 · deliverSettlement

未收集且非teardown的完成通知：默认idle followup，busy inject；quiet只inject；显式wait已收集则不再通知。

源码：[packages/jobs/tool-jobs/src/index.ts:355–430](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/tool-jobs/src/index.ts#L355-L430)。官方参考：[packages/jobs/tool-jobs/tests/tool-jobs.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/tool-jobs/tests/tool-jobs.spec.ts#L1)，选读未执行。本轮 `D D3`，等级 `D`。

## S40 · renderModelDelta

模型只见stdout、未标通道与stderr增量和终态结果，observer log被过滤；job_output取回并撤销未送达通知。

源码：[packages/jobs/tool-jobs/src/render.ts:1–84](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/tool-jobs/src/render.ts#L1-L84)。官方参考：[packages/jobs/tool-jobs/tests/tool-jobs.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/tool-jobs/tests/tool-jobs.spec.ts#L1)，选读未执行。本轮 `D D3`，等级 `D`。

## S41 · GoalRef / GoalView

Goal目标与revision/CAS、轮次上限、持久phase和进程activation分层；armed不是已恢复旧执行栈。

源码：[packages/goal/goal/src/types.ts:19–112](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/goal/goal/src/types.ts#L19-L112)。官方参考：[packages/goal/goal/tests/projection.spec.ts:94](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/goal/goal/tests/projection.spec.ts#L94)，选读未执行。本轮 `C boundary Goal`，等级 `C`。

## S42 · Goal create/pause/resume/disarm

create armed，pause持久变更，resume需当前ref与剩余预算；disarm不改phase/revision；单装service不等于驱动自动目标轮。

源码：[packages/goal/goal/src/index.ts:280–405](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/goal/goal/src/index.ts#L280-L405)。官方参考：[packages/goal/goal/tests/projection.spec.ts:94](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/goal/goal/tests/projection.spec.ts#L94)，选读未执行。本轮 `C boundary Goal`，等级 `C`。

## S43 · Schedule create/list/catalog

Host durable domain，恰选一种时间selector且有title；只读列表不激活Agent，子Session拒绝；历史Schedule Session事件不驱动Host任务。

源码：[packages/schedule/schedule/src/index.ts:243–335](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/schedule/schedule/src/index.ts#L243-L335)。官方参考：[packages/schedule/schedule/tests/recovery.spec.ts:57](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/schedule/schedule/tests/recovery.spec.ts#L57)，选读未执行。本轮 `C boundary Schedule`，等级 `C`。

## S44 · ScheduleRuntime

Schedule持久化待触发记录并经Session resolver投递，记录回执与重复计划；恢复的是调度状态，非Workflow guest程序计数器。

源码：[packages/schedule/schedule/src/runtime.ts:1–169](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/schedule/schedule/src/runtime.ts#L1-L169)。官方参考：[packages/schedule/schedule/tests/recovery.spec.ts:57](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/schedule/schedule/tests/recovery.spec.ts#L57)，选读未执行。本轮 `STATIC_REVIEW`，等级 `STATIC`。

## S45 · ActivationPool.reserve

Subagent容量层满直接拒绝，与Workflow FIFO槽不同；Workflow不自动提高树容量或深度。

源码：[packages/subagent/subagent/src/activation.ts:24–37](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/activation.ts#L24-L37)。官方参考：[packages/subagent/subagent/tests/continuation.spec.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/tests/continuation.spec.ts#L1)，选读未执行。本轮 `C B6`，等级 `C`。

## S46 · GoalMessageSource / roundsStarted

获准目标续跑user/message携goalId、revision和连续round；只有获准输入推进计数，非模型Attempt或Workflow子级。

源码：[docs/subsystems/goal.zh.md:118–139](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/goal.zh.md#L118-L139)。官方参考：[packages/goal/goal/tests/projection.spec.ts:94](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/goal/goal/tests/projection.spec.ts#L94)，选读未执行。本轮 `STATIC_REVIEW`，等级 `STATIC`。
