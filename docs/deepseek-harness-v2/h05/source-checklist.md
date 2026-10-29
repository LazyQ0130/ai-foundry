# H05 固定 Commit 源码核对清单

基线 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；运行包 `@deepseek-ai/cordis@4.0.6-alpha.1`。所有关键断言按输入、处理、输出及失败条件审读；链接/字节检查只防漂移，不自动证明语义。

|断言|固定依据|条件与验证范围|
|---|---|---|
|S01 · 插件三形态；插件不必继承 Service|[vendor/cordis/src/registry.ts:91–133](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/registry.ts#L91-L133)|B 两种模块挂载顺序；官方教程01函数示例选读|
|S02 · 原生执行器 apply 是模块函数，类 implements ToolExecutor|[packages/core/tool-executor-native/src/index.ts:8–35](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tool-executor-native/src/index.ts#L8-L35)|官方 tools setup 选读，未运行|
|S03 · Service 构造器通过 reflect.provide 登记实例|[vendor/cordis/src/service.ts:42–58](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/service.ts#L42-L58)|B 正常/缺失依赖实际执行|
|S04 · provide 有作用域与归属，同域重复名字失败|[vendor/cordis/src/reflect.ts:277–305](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/reflect.ts#L277-L305)|B 重复注册实际失败|
|S05 · Context 根构造代理与内建服务，不自动挂所有业务能力|[vendor/cordis/src/context.ts:70–84](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/context.ts#L70-L84)|B 缺失服务实际为 undefined|
|S06 · 插件取得扩展的子 Context|[vendor/cordis/src/fiber.ts:234–245](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L234-L245)|源码分支审读；非完整作用域测试|
|S07 · 普通属性读取分根与插件；插件检查依赖与作用域|[vendor/cordis/src/reflect.ts:144–166](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/reflect.ts#L144-L166)|B 遗漏 inject 实际失败，根探测另测|
|S08 · registry 归一化模块 inject 后创建挂载记录|[vendor/cordis/src/registry.ts:316–335](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/registry.ts#L316-L335)|B 模块对象正常；删除元数据变异非零|
|S09 · 查当前可用实现及 check，所有必需服务满足才激活|[vendor/cordis/src/fiber.ts:597–638](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L597-L638)|B 异步提供方尚未 ACTIVE 时调用0|
|S10 · 默认 get 要求提供方 ACTIVE|[vendor/cordis/src/reflect.ts:233–243](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/reflect.ts#L233-L243)|B 异步门闩前 get undefined|
|S11 · 缺失服务 PENDING，孤立进程可退出0且无业务输出|[docs/cordis-tutorial/03-services.zh.md:59–72](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/cordis-tutorial/03-services.zh.md#L59-L72)|demo --missing 子进程实际执行|
|S12 · await 等待当前转换稳定，不保证状态 ACTIVE|[vendor/cordis/src/fiber.ts:725–737](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L725-L737)|B await消费者后仍 PENDING 实测|
|S13 · 函数与类入口分支按 ctx/config 执行|[vendor/cordis/src/fiber.ts:247–260](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L247-L260)|B 模块与 Service 类均实际挂载|
|S14 · 声明合并只提供编译期信息|[docs/cordis-tutorial/index.zh.md:54–58](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/cordis-tutorial/index.zh.md#L54-L58)|TS2345 反例、发射代码擦除、无提供方运行三重核对|
|S15 · ToolsService 需要 systemPrompt 并提供 tools|[packages/core/tools/src/index.ts:99–118](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L99-L118)|tools.spec.ts:33–39 setup 静态选读|
|S16 · 工具服务类型声明与运行时登记分离|[packages/core/tools/src/index.ts:32–36](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L32-L36)|与 S15 交叉审读|
|S17 · 模型服务实际类 LlmRuntime，提供 llm|[packages/llm/llm/src/index.ts:354–364](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L354-L364)|成员归属静态核对；未启动模型|
|S18 · SessionStore 是内存存储，持久化不在本类实现|[packages/core/session/src/index.ts:1057–1064](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L1057-L1064)|静态核对，不声称落盘|
|S19 · AgentLoop 同时消费多服务并提供 agentLoop|[packages/core/agent-loop/src/index.ts:290–318](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L290-L318)|tool-executors.spec.ts:66–83 setup 静态选读|
|S20 · H03循环消费 tools，服务再选执行器|[packages/core/agent-loop/src/agent.ts:586–597](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L586-L597)|消费与委托交叉；不是新跑完整 Agent|
|S21 · 工具分派通过所选执行器 execute|[packages/core/tools/src/index.ts:369–377](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L369-L377)|tool-executors.spec.ts:103–128 断言静态选读|
|S22 · 按键服务解析有作用域，非全局对象等价|[vendor/cordis/src/context.ts:109–125](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/context.ts#L109-L125)|静态审读；作用域算法留 H08|
|S23 · 完整 Harness 的启动审查与裸 Cordis 不同|[packages/boot/app-boot/src/index.ts:1156–1200](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/index.ts#L1156-L1200)|沿用 H04 已审事实，未在 H05 跑完整 boot|
|S24 · 未审计实验性预览，插件化不证明安全|[SAFETY.zh.md:5–15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15)|保留官方限制；无安全认证测试|

核心精读为正文列出的五个文件；reflect、教程、Harness 各服务与测试是辅助依据。全部正文引用 28 个范围、核对文件 37 个，不能说成必读文件数。每文件 Git blob/SHA256 与全部范围见 [source-check.json](evidence/source-check.json)。

文档精度差异：

- primer wording plugin implements Service is looser than Plugin union/tutorial function; do not teach all plugins as Service subclasses
- Service immediate registration is not equivalent to consumer-visible ACTIVE readiness
- await resolves stable PENDING too; doc shorthand awaiting loading is not a guarantee ACTIVE
- tutorial any plugin access requires inject/scope qualification from reflect implementation

测试层级：9项为作者编写、执行真实 vendor Cordis 的库级实验；官方 tools/agent-loop 测试只读 setup/action/assertion。未跑完整 Vitest、Loader、Profile、模型网络或整个 Agent。声明发射与类型负例独立保留，不能拿类型通过替代行为。
