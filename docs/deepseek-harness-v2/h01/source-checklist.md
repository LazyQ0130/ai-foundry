# H01 源码引用与核对清单

固定仓库：DeepSeek AI / deepseek-harness。Commit：`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，沿用 V2.0 基线，不追随 main。

核对分两层：脚本核文件哈希、行范围与关键字符串；作者分轮读控制流并核对正文措辞。前者不能自动证明语义正确。17 个不同引用范围、10 个文件、15 条关键断言，均为静态核对；官方测试只阅读，没有运行全套。

## 关键断言

| 编号 | 断言与边界 | 固定源码 | 状态 |
| --- | --- | --- | --- |
| S01 | 开源 Harness、一切皆插件、开发者预览 | [README.zh.md:5](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/README.zh.md#L5-L15) | 静态核对 |
| S02 | 未经审计；审批与沙箱不能保证隔离或安全 | [SAFETY.zh.md:5](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15) | 静态核对 |
| S03 | 服务分工；默认循环也是可替换插件 | [docs/architecture.zh.md:7](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/architecture.zh.md#L7-L65) | 静态核对 |
| S04 | 创建消费者与默认循环实现分离 | [packages/core/agent/src/index.ts:169](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L169-L175) | 静态核对 |
| S04a | AgentRegistry.create 委托登记的工厂 | [packages/core/agent/src/index.ts:407](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L407-L425) | 静态核对 |
| S05 | 模型调用提议回循环，再分派工具服务 | [packages/core/agent-loop/src/agent.ts:586](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L586-L597) | 静态核对 |
| S06 | 工具执行前策略、ask、guard、取消检查 | [packages/core/tools/src/pipeline.ts:190](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L190-L229) | 静态核对 |
| S06a | 审批服务或通道不可用时拒绝 | [packages/core/tools/src/pipeline.ts:432](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L432-L469) | 静态核对 |
| S06t | 对应官方拒绝测试（只静态核对） | [packages/core/tools/tests/tools.spec.ts:788](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/tests/tools.spec.ts#L788-L840) | 静态核对 |
| S07 | 按 provider/model 取得适配器并准备调用 | [packages/llm/llm/src/index.ts:960](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L960-L975) | 静态核对 |
| S08 | 追加会话事实与派生模型消息是不同接口 | [packages/core/session/src/index.ts:806](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L806-L833) | 静态核对 |
| S08a | 由保留的有序 surface 节点派生模型历史 | [packages/core/session/src/index.ts:999](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L999-L1019) | 静态核对 |
| S08t | 会话事件与派生消息测试（只静态核对） | [packages/core/session/tests/session.spec.ts:32](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/tests/session.spec.ts#L32-L74) | 静态核对 |
| S09 | 记录是模型上下文来源，持久化另有提供方 | [docs/architecture.zh.md:126](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/architecture.zh.md#L126-L170) | 静态核对 |
| S10 | 不同入口由组合包构成，配置不等于所有能力都启用 | [docs/architecture.zh.md:15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/architecture.zh.md#L15-L25) | 静态核对 |

## 推荐阅读顺序

1. README 的定位与开发者预览 → SAFETY 的审计状态 → architecture 核心包表。先确定项目承诺和服务边界，避免把图当安全保证。
2. `core/agent/src/index.ts`：AgentFactory 注释，再看 AgentRegistry.create。由接口进入委托，暂不追所有权和初始化回滚。
3. `core/agent-loop/src/agent.ts`：step 的入口，再跳工具分支。先找提取调用、无调用结束、有调用转交工具服务，暂不逐行读状态循环。
4. `core/tools/src/pipeline.ts`：prepare，再看 serviceAsk 的缺失/拒绝分支。确认执行前检查与最终分派分开，不把所有工具说成必须人工批准。
5. 两个辅助文件：`llm/llm/src/index.ts` 的 LlmRuntime.prepareCall；`core/session/src/index.ts` 的 append 与 deriveMessages。只辨认模型适配、追加事实和模型历史，不展开绑定能力与投影内部实现。
6. 选读 tools.spec 的拒绝/缺审批服务断言与 session.spec 的事件/派生消息断言。读取用例不等于已经运行用例。

三个核心源文件加两个辅助源文件；其余为文档和测试。精确行锚都在上表和正文，完整引用范围、文件 SHA-256 与受核片段见 [source-check.json](evidence/source-check.json)。

## 三类内容与审查边界

**官方实现**：仅表中可追踪的行为与模块声明。特别核对 `prepareCall` 是 960 行的 LlmRuntime 方法，不混用同文件早先的适配器接口声明；Session 从保留的有序 surface 节点派生历史，不把全部事件直接当 messages；内存 append 不冒称磁盘 flush；ask 不可用走拒绝。

**教学简化**：本课的四词定义是阅读约定，职责关系图不是部署图；A/B Mock 不是官方 API。独立实验只有内存资料、简单白名单、宿主审批回调与有限循环，未实现 Cordis、持久化、Resume、业务幂等、真实取消或生产权限。

**我们的分析**：长任务推导出的工程问题、接口分离减少连带修改的收益、插件组合增加的维护成本。没有把未经官方说明的动机包装为作者结论；不能从可组合性推导已安全或已生产验证。

## 完整性与许可

引用文件优先与 V2.0 已固定索引的 SHA-256 一致。新增引用的 Session 测试不在旧索引时，直接核对固定 Commit 的 Git tree blob：`ccd152b777a3c337fdba381ccad8914ca6ea07ae`。校验脚本会拒绝不一致，不重新写 V2.0 索引。

正文没有复制官方长代码或官方图片，只提供固定链接与原创解释；图和 Mock 均为本课原创。官方源码采用 MIT，许可与第三方说明沿用 V2.0 的 [来源许可记录](../SOURCE-LICENSE.txt)。证据 JSON 中保留的短片段仅用于研发核对，不放进公开素材目录。

真实 API、官方全套测试、原生沙箱、浏览器控制与跨进程恢复未执行。不能从 H01 的七项 Mock 测试推出这些性质。
