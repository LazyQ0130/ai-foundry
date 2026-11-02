# 源码断言复核

固定[官方Commit](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3)。联网入口未能抓取；实际核验使用本地Git对象库的该Commit树和原始源码缓存，逐文件计算Git blob与SHA256，不跟随main。共1594份锁定文件、443处四课正文/清单固定范围、172条原断言（37/40/48/47）。四课当前AST/结构与内容检查通过。机器结果见[source-check.json](evidence/source-check.json)，逐条原断言及条件见[复核索引](source-assertion-index.md)。

范围/身份通过只是引用结果。语义复核按实参、异步等待、提前return、catch/finally及相应测试的setup/action/assertions进行，以下记录关键判断依据；没有用符号出现次数证明行为。

| 断言组 | 实际分支审阅结论 | 官方测试与本轮执行的关系 |
|---|---|---|
| H09-01–14 | Agent由类型扩展形成运行面；Registry enter检查id/session与占用；查询给原对象、新名单数组；create显式传caller并委托Factory；Handle另携dispose | agent.spec的契约/冲突/委托选读；H09 C01–03/D01–02当前运行 |
| H09-15–26 | initializeAgent先安装退出联系，Session先enter/announce，setup await→commit→Agent enter/serial announce→ready；maintenance finally才放行唤醒；失败按已可观察阶段配对 | scope-lifecycle选读准备/门闩/失败；H09 D03–07/D12当前运行；M3 A额外跨到真正模型请求 |
| H09-27–37 | parentAgent仅entry.owner，对象相等；历史与caller独立；teardown记忆化、先等工作再Scope/close/Agent/Session，收集失败；成功后的创建signal不驱动销毁 | H09 D08–14当前运行；发起方/坏disposed观察者等原STATIC_ONLY仍仅静态。官方“成功时detached”注释不等价物理removeEventListener已发生 |
| H10-01–13 | Phase占用与status分开；send在splice前捕获abort重路由；claim先清next-step再取一个next-turn；whenIdle比较activityDone身份追随新活动 | Inbox组件C01–03与Loop D04–08当前运行；abort后发送精确竞态仍非实测 |
| H10-14–24 | turn先开边界再preStep；claim→current→resolve→assemble→pre-step；reject与初始空分支早退；step/start在step之前；准备成功后才提交/derive/freeze | loop/request-error/request-reconstruction/request-freeze/system-prompt-admission选读；当前H10 D01/06/09/10/12，M3每次原始Loop请求前缀重建 |
| H10-25–40 | 流start在取句柄和signal检查后；本地取消catch与失败finish恢复分开；正常message先结算再Tools；step finally与Turn finally各写边界；max-tokens sticky；工具主体错误可变成错误结果继续 | H10 C04/D01–03/06/09–11当前运行；ToolCallRecovery只静态推演call存在/不存在与unknown outcome，不称完整恢复通过 |
| H11-01–14 | presentation不含tools；Section先同名合并再排序，Variable全局先求值；render后插值；complete恢复求值副本但不跳过其他Provider/Waterfall | system-prompt/scoped/tool-order相关setup与断言选读；H11 C01–08/15–16/23–24当前运行 |
| H11-15–35 | Context同order稳定收集；refresh只重新求已接纳名字并补required；不重做Variable/Section/Tools；匿名Tool Provider叠加；Schema复制；rest/known-hidden边界；Loop只注册provider/model | H11 C09–23/D03–05/09当前运行；生产WorkingDirectory注册本身为SOURCE_READ，没有挂它读真实目录 |
| H11-36–48 | Context候选render在pre-step默认分支；系统render先于prepare；准备后Context刷新；首次系统空节点可无派生system；in-history/新series/清空按条件协调；不改旧log | H11 D01–11当前运行；M3 A旧变量新Context、B两次请求、C重试只接纳一次 |
| H12-01–19 | Runtime route注册与精确能力、目录建议分开；configure在默认物化之前；prepared先检查匹配再占用，惰性边界再检查，捕获注册项而非所有自定义内部字段；ToolResultMessage与块分开 | service.spec注册/准备/代次/回放相关用例选读；H12 C08/12–22/26/29当前运行；真实HTTP未运行 |
| H12-20–31 | Assembler Map按块索引关联、order按首次出现；首个block-end权威；max-tokens全去tool；取消仅非空text/reasoning；Accumulator分离快照，expand严格结构/时间无损但非终止协议验证 | assembler/assistant-stream官方断言选读；H12 C01–11当前运行；原生用量真实精度/性能不在证据内 |
| H12-32–47 | Attempt同时累积与发实时帧；settle回调先append才commit；error finish走attempt+恢复，local cancel安全前缀message或attempt；Runtime只容纳指定Adapter边界throw，正常yield不校序；DeepSeek/PiAi具体翻译与绑定另读 | H12 D15场景与C21–29当前运行；DeepSeek.translate C27/28直接执行。DeepSeek完整Adapter网络与PiAi库链仅源码审读，不称联调 |

关键固定入口（每个链接以真实函数起点为锚点，继续读到表列范围末尾）：

- [Registry.create / resume 416–440](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L416-L440)、[默认初始化465–660](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L465-L660)。
- [候选preStep 283–317](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L283-L317)、[Turn 327–433](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L327-L433)、[Step及请求435–744](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L435-L744)。
- [SystemPrompt render 295–381](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L295-L381)、[refresh/assemble 587–693](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L587-L693)。
- [prepareCall 960–1017](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L960-L1017)、[Adapter最终边界1063–1172](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L1063-L1172)。
- [BlockAssembler 49–198](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L49-L198)、[Assistant settlement 49–108](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/assistant-stream.ts#L49-L108)。

保留的源码/文档张力：H09已指出职责概述的销毁列举不等于teardown顺序；官方factory-live-s用例部分查询factory-live不能单独证明移除；创建signal成功后行为与物理监听撤销不同；H12已指出终止协议合约不等于Runtime通用校正。正式课均按实现限定，没有靠统一措辞遮盖这些差异。历史蓝图H07的简略退出箭头不作为当前事实，H09正式正文与本统一模型优先；不改H01–H08及历史蓝图。

所有官方Vitest仍是选读，未运行其文件清理钩子或套件。172项既有断言的作者证据映射与本轮复验互相对照；STATIC_ONLY/源码阅读项保持原级别。确认技术错误0，引用越界0，符号归属错误0；这不声称任意Profile/全部异常/真实模型均已覆盖。
