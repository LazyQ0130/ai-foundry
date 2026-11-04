# H22 逐项证据与覆盖矩阵

23有效TAP执行=C19/D4，A/B/E无单列项。所有项同一组公共fixture，非23个互不相关系统场景；X=D1，历史重跑不加总。C含真实组件，D确有父Loop执行/后续模型边界。必要Cordis依赖不重复计B。

原命令：`node docs/deepseek-harness-v2/h22/scripts/run-labs.mjs`；最终原始记录 `run-1793787817242-tests.json`。逐项真实对象、协作者和断言见下表，完整身份见[evidence/test-grades.json](evidence/test-grades.json)。

| TAP身份/等级 | 真实对象 | 协作者 | 实际跨边界断言 |
| --- | --- | --- | --- |
| C A1 real engine: meta, args, top-level await and JSON result | WorkflowEngine/PTC/Windows runner/SubagentRuntime | controlled Provider, directory/config cells | pre-publication / JSON input-output / resource settlement |
| C A2 pre-publication validation: meta, parse, provider, cap | WorkflowEngine/PTC/Windows runner/SubagentRuntime | controlled Provider, directory/config cells | pre-publication / JSON input-output / resource settlement |
| C A3 result resolves on script/JSON errors; undefined becomes null | WorkflowEngine/PTC/Windows runner/SubagentRuntime | controlled Provider, directory/config cells | pre-publication / JSON input-output / resource settlement |
| C A4 args clone is not lossless JSON validation | WorkflowEngine/PTC/Windows runner/SubagentRuntime | controlled Provider, directory/config cells | pre-publication / JSON input-output / resource settlement |
| C B6 Subagent capacity can reject below Workflow concurrency | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C B7 structured output present versus absent on completed child | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C B1 parallel starts together and collects input order | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C B2 pipeline is per-item order without a cross-stage barrier | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C B3 ordinary child failure and ordinary thunk throw become null | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C B4 fatal options/schema and broken provider survive combinators | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C B5 concurrency slots, queued total count and item cap differ | Workflow helpers + PTC + Subagent admission | controlled Provider and Promise gates | concurrency, per-item order, null/fatal, caps and structured result |
| C C1 cancellation drains a published child and dispose is shared | Run/Host/PTC/subprocess/sandbox/Workflow events | controlled Provider gates; C5 actual fixture file | cancel, late start, shared dispose, listener containment or native write denial |
| C C2 pending startup after cancel is disposed before settlement | Run/Host/PTC/subprocess/sandbox/Workflow events | controlled Provider gates; C5 actual fixture file | cancel, late start, shared dispose, listener containment or native write denial |
| C C3 cancel post-await infinite guest work without killing test process | Run/Host/PTC/subprocess/sandbox/Workflow events | controlled Provider gates; C5 actual fixture file | cancel, late start, shared dispose, listener containment or native write denial |
| C C4 phase/log are observations; listener failures are isolated | Run/Host/PTC/subprocess/sandbox/Workflow events | controlled Provider gates; C5 actual fixture file | cancel, late start, shared dispose, listener containment or native write denial |
| C C5 native read-only runner rejects writes through a VM escape | Run/Host/PTC/subprocess/sandbox/Workflow events | controlled Provider gates; C5 actual fixture file | cancel, late start, shared dispose, listener containment or native write denial |
| D D1 foreground parent tool, three real children, Session and next model request | parent + three child AgentLoops/Tools/Spawn/Workflow/PTC/Session/JSONL | local role-keyed Mock LLM; fixture directory/config/query | schema→model call→children→aggregate→parent ToolResult→next model request + durable log |
| D D2 tool schema, error mapping and rendered cap | parent AgentLoop/Tools/Workflow/PTC | Mock LLM, deliberate fatal script and long result | schema capability, isError, rendered result cap |
| D D3 background receipt, observer log, job_output and notification | parent/child Loops + Workflow/PTC/LocalJobs/ToolJobs | Mock LLM gate, quiet notices, inlineOutputBytes0 | early receipt→observer ring vs model delta→notice→terminal read once |
| D D4 background job_kill cancels and drains its workflow | parent/child Loops + Workflow/PTC/LocalJobs/ToolJobs | Mock LLM gate | job_kill→stopping→cancel/cleanup→killed |
| C boundary missing confinement fails closed without spawning | Workflow Host with real engine and Node PTC service | fault injection: sandboxMode unavailable | fail-closed before spawn, no unrestricted fallback |
| C boundary Goal revision, pause and disarm differ from durable phase | GoalService/Session/Projection/AgentRegistry | fixture live parent, no round driver | CAS/revision/pause/resume/disarm, zero model calls |
| C boundary Schedule persists a future trigger independently of WorkflowRun | ScheduleService/Storage/DomainFacility/JSON backend/new Context | future2099 fixture, no due resolver | selector refusal, saved record readback, zero model/Workflow calls |

## 不把依赖存在算覆盖

| 维度 | 实际状态 | 未验证范围 |
| --- | --- | --- |
| Workflow语法/JSON/helper/caps | A/B/C真实PTC执行，PASS | 全部JS输入、全部schema子集、默认CPU推导专项未逐项动态测 |
| 启动/结果基础设施错误 | A2未知Provider、B4结果拒绝、B6容量拒绝 | 所有同步throw/不可渲染异常/append失败和异常dispose分支只静态参考 |
| 取消清理 | C1/C2先等受管进程done，result仍等门闩；C3 busy guest取消；D4后台kill | 任意不合作外部Agent、全取消竞态、跨平台和硬崩溃未测 |
| Windows受限执行 | 正式Node PTC+ACL read-only；C5真实文件拒写；缺confinement注入fail closed | partial；读取/硬链接/网络/其他OS不认证 |
| Session/模型 | D1四类根记录8条，真实JSONL flush/readback；后续parent请求含聚合 | 嵌套调用不记录、append/flush失败只静态；不等断电持久性 |
| Jobs | D3接纳、观察/模型游标、quiet notice、终态结果一次；D4 stopping→killed | 默认wakeup、新Turn成本、failed异常cleanup、ring截断、owner teardown矩阵未动态覆盖 |
| Goal | C服务CAS/phase/activation，0模型 | Goal轮次driver、预算耗尽、持久恢复与自动继续未动态覆盖 |
| Schedule | C未来任务真实JSON保存/新Context读回，selector拒绝，0模型 | due delivery、虚拟时钟触发、recurrence、持久回执、跨进程/分布式可靠调度未测 |
| 规模限制 | 并发、总量、item、Subagent容量互动实测 | PTC maxPendingCalls只静态，深度消费方策略未在本课动态验证 |
| 协议/外部服务 | 子进程真实；Provider输出受控；全部本地Mock | 没有外部Agent/真实LLM/服务器/用户业务效果 |
| 完整应用/教学 | C/D局部通过，作者材料审查 | E级完整Harness、学员试读、实测耗时和独立外审均未验证 |

H21的委派/容量/清理与本课有主题重合，新增的是guest/Host/Workflow Tool/Job整链；不据此估“去重后独立故障数”。官方Vitest只有选读，没有含递归删除的官方套件PASS。源与依赖字节身份也不等于上述每一语义均受动态覆盖。
