# H14 测试与证据边界

互斥计数C32+D13=45通过；A/B独立专项NOT_RUN，E完整应用NOT_RUN。实践字母B与证据等级B无关，scheduling实际跨Loop等边界，记D。demo重跑、故意错误答案与Cordis依赖不重复计数。

| 实际TAP测试 | 级别 | 真实受测边界与替身 |
| --- | --- | --- |
| C-flow-normal | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-deny | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-guard | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-ask | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-cancel | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-content | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-value | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-block | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-pre-throw | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-around-throw | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-project-throw | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-post-throw | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-final-throw | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-output-bad | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-flow-observer-throw | C | 真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log |
| C-failure-unknown | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-parse | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-args | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-deny | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-pre-abort | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-body-throw | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-output | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-post-throw | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-post-abort | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-pending-abort | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-pre-pending-abort | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-scheduler | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-signal-replace | C | 真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常 |
| C-failure-snapshot | C | 官方testkit直接驱动真实Pipeline；非JSON对象输入，不经过原始模型参数解析 |
| C-policy outer waterfall may override deny; guard still denies | C | 真实Cordis Waterfall、ToolsService.guard、Native/Pipeline；故意覆盖deny及失败后换值 |
| C-snapshot detaches nested caller values and mints distinct tokens | C | 真实Pipeline的prepare/dispatch/complete；调用方对象变更与token比较，不是自制快照算法 |
| C-batch rejects invalid parallel override before wrapping scheduler error | C | 真实Native/executeToolBatch上限校验；0/1.5在Pipeline前拒绝 |
| D-scheduling-parallel | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session；Mock模型发多调用，Promise门闩控制业务结束 |
| D-scheduling-limit-one | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session；Mock模型发多调用，Promise门闩控制业务结束 |
| D-scheduling-body-error | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session；Mock模型发多调用，Promise门闩控制业务结束 |
| D-scheduling-rolling | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session；Mock模型发多调用，Promise门闩控制业务结束 |
| D-scheduling-reclassify | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session；Mock模型发多调用，Promise门闩控制业务结束 |
| D-loop-success | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-deny | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-body-error | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-cancel | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-conclude | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-conclude-context | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-block-conclude | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |
| D-loop-internal | D | 真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入 |

原始证据：lab-tests.txt、lab-results.json、run-*.json（含首轮43项/12失败）、practice-output.json（全部A/B/C/D模式）。每次执行保留参数、退出值、stdout/stderr、scratch与程序哈希。故意错把完成顺序当提交顺序的negative-answer预期非零，不算通过测试。

D每次保存Loop请求、Adapter实际输入、真实Session事件前缀，第二真实Session重建messages/config/tools/toolHistory；runtimeTrace有实际递增position及channel，分别标Session、request、model、tool、policy、observer/error。B的commit来自Session通知，不是自造预期数组。

已实测：普通成功/拒绝/坏参数/主体/输出/后置失败、前置与主体/后置中的取消、signal融合、滚动补位、上限1/2、重分类屏障、内部prepare drain与Loop complete失败后的补齐、上下文与concludesTurn。

静态/未测单列：实际审批服务与allowed-once UI、guard自身异常、timeout计时器、全部恶意getter/render/meta组合、日志后端损坏、磁盘恢复、真实提供方、PTC/外部工具/沙箱及E。官方tests/tools.spec与agent-loop/tool-calls等为阅读参考，不称本轮执行全套。
