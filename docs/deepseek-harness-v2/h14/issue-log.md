# H14 研发问题与修订

## QA01｜夹具在 await 之前读计数，且覆盖了阶段轨迹（已定位）

首轮43项中31通过、12失败；原始TAP、参数、退出值、stdout/stderr、哈希与scratch在run记录。C返回对象把bodies/signalAborted写在`...await observed`之前，先读到了未完成状态；B/D返回对象又用capture.trace覆盖了自定义字符串trace。修复为先await结果，再组装计数；运行时轨迹改名runtimeTrace，保留阶段trace。官方组件未改。

## QA02｜concludesTurn 与已排队上下文（已定位）

首轮D-conclude原先预计1次模型请求，实际2次：主体同时deferContext，Loop在已标记turnEnds时仍会处理非空nextStep队列。不能改成“concludesTurn无条件马上停止”。拆为无附加上下文的conclude，以及conclude-context有上下文的对照；两者都不跳过同批次后续调用。新增的是独立语义边界，不重复计demo。

## 源码事实与范围

参数JSON解析在batch；Schema验证由defineTool.execute包装负责，在pre/guard之后，不能将prepare统称为“全部参数校验已完成”。预先取消的批次直接skip，和调用pipeline.prepare后的取消具有不同观测路径。

执行身份字段在类型中readonly。固定实现prepare阶段深冻结arguments，但exec对象直到最终tools/result前才Object.freeze；实际descriptor仍writable。不能把类型只读扩大成整个生命周期都有运行时防篡改。正文按当前事实区分契约、参数冻结与最终身份冻结。

查找的tool-executor-native/tests与agent-loop/src/tool-call-recovery.ts不存在。真实Native调度官方测试在agent-loop/tests/tool-calls.spec.ts；ToolCallRecovery在core/session/src/repair.ts，已读取。未将查找失败写成正式接口。
