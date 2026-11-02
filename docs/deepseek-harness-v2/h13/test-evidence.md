# H13 测试与证据边界

37 项互斥计数：C31、D6。A、B、E 为 NOT_RUN 独立专项；Cordis 与教学模型夹具在 C/D 内实际参与，不重复计数。故意错误答案另记 EXPECTED_FAILURE，不算通过测试。

| ID 与断言 | 级别 | 真实边界与替身 |
| --- | --- | --- |
| C01 valid canonical JSON and model rendering are distinct | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C02 missing required input never reaches body | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C03 wrong nested array element rejected with runtime error | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C04 nested closed object rejects unknown properties | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C05 parameter root remains open | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C06 business constraint is not supplied by array schema | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C07 actual shared pipeline rejects invalid canonical output | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C08 schemas whitelist model fields and disposer unregisters | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C09 isolated scopes share globals and keep own tools | C | 真实 Cordis/Scope/ToolsService 登记与视图；最小 Agent-like 键与固定字符串主体，无 Loop |
| C10 intersected restrictions exempt own shadow definitions | C | 真实 Cordis/Scope/ToolsService 登记与视图；最小 Agent-like 键与固定字符串主体，无 Loop |
| C11 descendant can filter inherited ancestor registration | C | 真实 Cordis/Scope/ToolsService 登记与视图；最小 Agent-like 键与固定字符串主体，无 Loop |
| C12 plugin and scope disposal unwind real registry effects | C | 真实 Cordis/Scope/ToolsService 登记与视图；最小 Agent-like 键与固定字符串主体，无 Loop |
| C13 registered conditional inspection differs from executable without set | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C14 resolve captures condition once and next set evaluates again | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C15 live restriction can mask and restore an admitted registration | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C16 unregister and same-object replacement invalidate old admission | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C17 disposed set stays empty and does not unregister definition | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C18 false and throwing activation are distinct | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C19 abort does not race an uncooperative when promise | C | 真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop |
| C20 duplicate name, reserved name, and invalid timeout fail registration | C | 真实 ToolsService/Scope 的登记、过滤、身份与生命周期；无 Loop |
| C21 restrict requires scope and known inherited names | C | 真实 ToolsService/Scope 的登记、过滤、身份与生命周期；无 Loop |
| C22 scalar DSL enforces integer enum const boolean null | C | 真实 schema/json-schema 纯编译器与值验证器；本条不调用 ToolsService、Scope 或 Native |
| C23 oneOf demands exactly one matching branch | C | 真实 schema/json-schema 纯编译器与值验证器；本条不调用 ToolsService、Scope 或 Native |
| C24 json accepts lossless JSON but not undefined, nonfinite or exotic | C | 真实 schema/json-schema 纯编译器与值验证器；本条不调用 ToolsService、Scope 或 Native |
| C25 DSL rejects unsupported keywords, missing object openness and required false | C | 真实 schema/json-schema 纯编译器与值验证器；本条不调用 ToolsService、Scope 或 Native |
| C26 annotations default do not fill missing required input | C | 真实 schema/json-schema 纯编译器与值验证器；本条不调用 ToolsService、Scope 或 Native |
| C31 progressive two-number definition produces each advertised stage | C | 真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session |
| C27 raw defineTool.execute validates input, not its own output | C | 真实 defineTool 的 execute 包装；故意坏返回绕 TS，无 Registry 输出流水线（对照 C07） |
| C28 admission is tied to exact agent object and release keeps registrations | C | 真实 ToolsService/Scope 的登记、过滤、身份与生命周期；无 Loop |
| C29 unregister during pending when cannot resurrect tool | C | 真实 ToolsService/Scope 的登记、过滤、身份与生命周期；无 Loop |
| C30 scoped shadow is exact definition, root schema projection detached | C | 真实 ToolsService/Scope 的登记、过滤、身份与生命周期；无 Loop |
| D01 real loop success: request schemas, calls, results and live eligibility | D | ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求 |
| D02 real loop false: request schemas, calls, results and live eligibility | D | ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求 |
| D03 real loop retry: request schemas, calls, results and live eligibility | D | ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求 |
| D04 real loop remove: request schemas, calls, results and live eligibility | D | ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求 |
| D05 real loop replace: request schemas, calls, results and live eligibility | D | ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求 |
| D06 real loop restrict: request schemas, calls, results and live eligibility | D | ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求 |

C01–C19 共享对应实践的已运行结果，但每项检验不同因果结论；C20–C31 为实际组件的独立边界。C22/24/25 的循环输入仍计一个 Node test，不另拆计。D 六种场景各一个 test，demo 重跑不增加数量。

原始证据：lab-tests.txt（TAP）、lab-results.json（stdout/stderr/退出值/程序哈希）、run-*.json（含首轮失败）、practice-output.json（P/A/B/C/D 六模式完整对象及请求前缀）。所有阶段的请求都在第二个真实 Session 重建 messages/config/tools/toolHistory，并保留 Adapter 投影后的实际输入。

C27 故意绕 TS 后直接 execute 接受坏输出，C07 经共享流水线拒绝；两项组合证明边界，没有把直接调函数冒充 Registry 输出校验。C26 的错误初版已在 issue-log 说明并修正。

PTC 描述、TS 推断、timeout policy、并发分类和更广安全机制为静态阅读，未单独执行。未运行官方 Vitest 全套、真实供应商、磁盘恢复、审批、沙箱、外部工具或 E 级完整应用。

复现目录与依赖：见 README。每次新建临时 fixture，最小环境，不清理旧目录。首轮诊断不被后续 PASS 覆盖。
