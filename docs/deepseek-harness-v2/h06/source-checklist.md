# H06 固定 Commit 源码核对清单

基线 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；Cordis `4.0.6-alpha.1`。关键语义由作者按输入、调用、等待、返回及失败分支审读。字节、行号与AST只防漂移，不能独自证明结论。

|断言|固定依据|条件与证据范围|
|---|---|---|
|E01 · isBailed只让null、false、undefined继续；0/空字符串/NaN停止|[vendor/cordis/src/events.ts:7–15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L7-L15)|真实serial/bail十种值及返回/调用数|
|E02 · 事件声明给类型信息，不注册回调、不强制运行模式|[vendor/cordis/src/events.ts:34–106](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L34-L106)|TS2769反例、发射擦除、故意emit一个bail契约事件|
|E03 · on登记并绑定当前上下文；回收细节不在本课展开|[vendor/cordis/src/events.ts:288–301](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L288-L301)|练习B真实插件挂载；生命周期资源回收未专项验证|
|E04 · dispatch先按适用条件筛选并绑定this，生成回调列表|[vendor/cordis/src/events.ts:165–175](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L165-L175)|静态分支审读；未专项运行Harness的Scoped筛选|
|E05 · prepend会改变入列位置，默认顺序不能无条件推广|[vendor/cordis/src/events.ts:250–259](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L250-L259)|真实prepend顺序测试|
|E06 · emit同步调用，忽略返回值与Promise，不自动等待|[vendor/cordis/src/events.ts:189–196](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L189-L196)|门闩前后轨迹；同步throw中断；异步拒绝子进程退出1|
|E07 · parallel并发等待全部settled，失败合成AggregateError|[vendor/cordis/src/events.ts:177–187](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L177-L187)|双门闩B先结束、混合同步/异步错误仍等其余完成|
|E08 · 本版parallel给internal/dispatch的诊断标签为emit|[vendor/cordis/src/events.ts:183–186](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L183-L186)|真实诊断监听器核对；不更改上游，不影响allSettled结论|
|E09 · serial逐一await后按isBailed返回；错误停止后续|[vendor/cordis/src/events.ts:198–209](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L198-L209)|false继续0停止；门闩证明顺序；同步/异步错误|
|E10 · bail当场判断；Promise对象本身会停止|[vendor/cordis/src/events.ts:211–222](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L211-L222)|Promise身份/兑现false但后续零次；同步throw及拒绝子进程|
|E11 · waterfall取末尾默认回调，返回最外层结果，不自动await|[vendor/cordis/src/events.ts:224–243](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L224-L243)|两层21/三层51；异步Promise与AsyncIterable实际消费|
|E12 · next共享剩余回调队列，不是把上层返回值作为新参数|[vendor/cordis/src/events.ts:234–242](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L234-L242)|每层input仍2；回程2→5→50→51及完整轨迹|
|E13 · 无next即不进入下游，false/undefined也不自动继续|[vendor/cordis/src/events.ts:237–242](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L237-L242)|返回false短路；B拒绝回到A；漏next主体零次|
|E14 · 重复next没有一次性保护，队列耗尽会重复默认主体|[vendor/cordis/src/events.ts:237–242](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L237-L242)|同步主体两次、B短路后A再进C、异步共享游标|
|E15 · 异常遵循实际调用/Promise返回，外层await才能catch异步拒绝|[vendor/cordis/src/events.ts:234–243](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L234-L243)|同步catch、return await next恢复、return next拒绝向外|
|E16 · 官方短路示例仍经过已进入外层的结果包装|[docs/cordis-tutorial/04-events.zh.md:109–138](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/cordis-tutorial/04-events.zh.md#L109-L138)|文档静态对照；课程B真实执行拒绝后外层包装|
|E17 · tools/pre-execute声明Promise决策，next默认allow|[packages/core/tools/src/events.ts:8–18](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/events.ts#L8-L18)|声明静态审读，与pipeline/官方拒绝测试交叉|
|E18 · prepare分发pre-execute，ask/deny等分支影响是否继续|[packages/core/tools/src/pipeline.ts:190–232](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L190-L232)|静态读调用/默认值/分支/catch；未运行完整工具管线|
|E19 · tools/execute围绕主体，返回执行结果而非allow决策|[packages/core/tools/src/pipeline.ts:295–324](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L295-L324)|静态与事件声明19–29交叉，未运行完整工具管线|
|E20 · tools/post-execute默认accept，处理结果不自动回滚副作用|[packages/core/tools/src/pipeline.ts:486–499](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L486-L499)|静态边界审读，不作事务或回滚保证|
|E21 · tools/result的错误隔离是该业务观察契约，不是所有emit保证|[packages/core/tools/src/events.ts:42–49](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/events.ts#L42-L49)|只说明声明契约，未实测完整工具观察隔离|
|E22 · agent/pre-step声明候选输入与Promise决策|[packages/core/agent/src/runtime-types.ts:338–350](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/runtime-types.ts#L338-L350)|静态声明；不是已开始模型请求|
|E23 · 默认preStep以enter消息作内层，reject在模型请求前处理|[packages/core/agent-loop/src/agent.ts:283–317](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L283-L317)|静态分支及官方拒绝断言253–274交叉|
|E24 · llm/stream返回AsyncIterable，Loop请求有深冻结边界|[packages/llm/llm/src/index.ts:64–75](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L64-L75)|声明/实现静态；课程流惰性消费真实实验不代表模型网络|
|E25 · LlmRuntime.streamWithRegistration用waterfall围住适配器流|[packages/llm/llm/src/index.ts:1174–1183](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L1174-L1183)|AST归属+静态默认回调；未执行真实适配器|
|E26 · tool-jobs前置记录输出上限并return next|[packages/jobs/tool-jobs/src/index.ts:285–290](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/jobs/tool-jobs/src/index.ts#L285-L290)|静态读消费者；与练习C定位参照交叉|
|E27 · 检查点插件可在前置边界等待/包装，流在迭代时检查点|[packages/session/session-checkpoint-policy/src/index.ts:29–82](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-checkpoint-policy/src/index.ts#L29-L82)|静态读辅助函数和三个监听器；未运行持久化|
|E28 · 官方工具拒绝例断言错误原因；不是作者已跑官方套件|[packages/core/tools/tests/tools.spec.ts:788–817](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/tests/tools.spec.ts#L788-L817)|只选读setup/action/assertions，setup另见33–39|
|E29 · 官方pre-step拒绝例模型零次且Turn以blocked结束|[packages/core/agent-loop/tests/interception.spec.ts:253–274](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/interception.spec.ts#L253-L274)|只选读mock模型/setup/action/assertions；未执行官方Vitest|
|E30 · Session.commit先更新内存日志后通知，不单独证明磁盘flush|[packages/core/session/src/index.ts:892–911](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L892-L911)|沿用H03边界，静态审读，不运行磁盘恢复|
|E31 · agent/inbox/spliced是会话事实，不能只按agent前缀分类|[packages/core/agent-loop/src/inbox.ts:215–230](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/inbox.ts#L215-L230)|静态append与相邻emit区分|
|E32 · 项目为尚未接受安全审计的实验性开发者预览|[SAFETY.zh.md:5–15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15)|保留官方限制；27项事件实验不是安全认证|

正文共28个固定引用范围、32条断言、38个逐字节核对文件。核心精读4文件：Cordis事件实现、tools事件声明、工具管线精选片段、tool-jobs消费者；文档、其他生产点和官方测试是辅助依据，不要求全部逐行精读。每文件Git blob/SHA256见 [机器清单](evidence/source-check.json)。

## 文档/实现精度记录

- parallel实现为allSettled；不是遇到首个拒绝就立即结束的Promise.all表述。
- parallel在internal/dispatch报告emit标签，此为固定版本实测事实；不能从该标签推导等待行为。
- primer的替换结果措辞必须结合真实next调用解释：本版参数不自动接收前一层返回值。
- 事件类型和@mode约定不在运行时强制分发模式；调用方仍须遵守具体事件契约。
- waterfall没有next一次性保护；不得套用其他中间件框架的重复调用报错规则。
- serial/bail不是任意返回或truthy判定；waterfall也不采用isBailed继续规则。

## 执行边界

真实执行的是固定 vendor Cordis/Cosmokit 与课程事件/插件夹具。Harness表中五事件的声明、发布和消费者按固定代码审读；没有运行完整工具管线、Agent Loop、Scope策略、检查点持久化或模型适配器。官方测试只选读setup/action/assertions，未跑其Vitest套件；serial-listener-review也只读，未执行其文件清理。

练习C参照只自动核固定位置和语句；其他正确路线及设计解释需人工判断。运行时扩展事件不自动写SessionEvent；Session.commit与flush边界另列，不以通知冒充落盘。
