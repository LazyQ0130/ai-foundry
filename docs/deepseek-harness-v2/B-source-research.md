# DeepSeek Harness 源码研究报告

固定版本 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；研究日期 2026-10-28。所有源码链接均绑定该版本。

## 取证范围与方法

先阅读中英 README、architecture、cordis-primer、development、testing、tool-execution-pipeline，再以子系统文档为索引，逐包核对契约、入口、核心分支、异常和相邻测试。研究围绕教学问题选路径，不声称逐行读完近两万文件，也不把阅读测试等同运行测试。

Git partial checkout 因网络中断失败后，改用官方 codeload 的固定 Commit ZIP；使用 Git tree 的 blob 标识逐一校验归档字节。19874 个 blob 原样匹配，另 3 个 .cmd 按仓库 .gitattributes 声明的 CRLF 工作树/LF 规范形式匹配；无内容不符。SHA-256、方法与明细见 source-integrity.json。解压缓存不进入 AI Foundry 仓库，课程只保存固定链接、索引和少量阅读锚点。

首轮可执行验证采用实际锁定源码的 Cordis、detached Session、原生内存工具流水线探针；另有六模块教学原型的 24 项断言。官方完整 Vitest/快照/API e2e/原生沙箱/真实浏览器桌面/跨进程恢复均未运行。部分官方测试清理夹具含递归删除，因此本轮仅静态审阅这些测试，不在用户禁止批量删除的环境中执行它们。

## 仓库结构与模块关系

`packages/<领域>/<包>` 是实际两层布局；不能把 packages/core 当单包。apps/cli 为统一 profile 启动入口；apps/web、desktop/desktop-host 是载体；vendor 是本仓库固定的 Cordis 等依赖源；native/system 承载平台原生能力；scripts 和 .github/workflows 组织构建/类型/文档/测试门禁。benchmarks 按跨包用户路径组织，包旁 .perf.ts 是诊断层。

| 领域 | 关键契约 / 实现 | 与主线的关系 | 相关课程 |
| --- | --- | --- | --- |

| boot / bundle | [S224 · packages/boot/app-boot/src/profile.ts:678](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/boot/app-boot/src/profile.ts#L678-L705) | Profile 决定有序组合层，Loader 挂载依赖树；base-backed profiles 与 sdk-minimal 区分。 | H04/H08 |

| core/agent | [S225 · packages/core/agent/src/index.ts:252](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L252-L279) | 活跃注册、factory 委托和 initiator scope；不是默认驱动实现。 | H09 |

| core/agent-loop | [S226 · packages/core/agent-loop/src/agent.ts:112](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L112-L139) | 默认驱动器，负责 inbox、turn/step、请求与工具阶段；loop 自身也是插件。 | H03/H10–H12/H20 |

| core/system-prompt | [S227 · packages/core/system-prompt/src/index.ts:434](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L434-L461) | 汇总片段、上下文和工具描述；模型选择在 step 准备时快照。 | H11 |

| llm | [S228 · packages/llm/llm/src/index.ts:354](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L354-L381) | 消息/流词汇、适配器注册、一次性 prepared call、能力和错误转换。 | H12/H26 |

| core/tools | [S229 · packages/core/tools/src/pipeline.ts:62](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L62-L89) | 注册/可见性与原生/PTC 执行器分离；共享调用流水线结算权威结果。 | H13–H16 |

| core/session | [S230 · packages/core/session/src/index.ts:525](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L525-L552) | 事件日志为事实来源；surface 和消息投影派生模型历史。 | H17 |

| session/persistence | [S064 · packages/session/session-persistence/src/handle.ts:59](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-persistence/src/handle.ts#L59-L86) | create/open 返回单写者句柄；JSONL provider、lease、格式 migration 各有职责。 | H18 |

| session/projection | [S063 · packages/session/session-projection/src/index.ts:259](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-projection/src/index.ts#L259-L286) | 插件注册 fold，领域服务持有 handle，客户端读取选定 snapshot。 | H17/H23 |

| compaction | [S071 · packages/compaction/compaction-basic/src/region.ts:173](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/compaction/compaction-basic/src/region.ts#L173-L200) | 可选能力；记账事件与 surface replacement 分开；保留原始事实。 | H19 |

| sandbox | [S054 · packages/sandbox/sandbox/src/index.ts:192](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sandbox/sandbox/src/index.ts#L192-L197) | 定义 argv 文件效果包装；local/SSH 为提供方，shell 为消费者。 | H15 |

| mcp | [S099 · packages/mcp/mcp-client/src/connection.ts:127](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/connection.ts#L127-L154) | 每服务器一个插件连接；不发布共享 ctx.mcp；资源有独立共享 seam。 | H16/H27 |

| subagent | [S078 · packages/subagent/subagent/src/index.ts:271](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent/src/index.ts#L271-L298) | 统一 activation 与能力准入、结果投递、子级所有权。 | H21 |

| workflow | [S083 · packages/workflow/workflow-ptc/src/index.ts:134](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/workflow/workflow-ptc/src/index.ts#L134-L161) | 可选模型脚本编排，PTC 引擎消费 subagent seam；不是 DAG 声明式引擎。 | H22 |

| jobs / goal / schedule | [S085 · packages/goal/goal/src/index.ts:305](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/goal/goal/src/index.ts#L305-L332) | 后台资源、同会话目标续跑、定时 delivery 是不同生命周期。 | H22 |

| API / SDK | [S088 · packages/api/session-controller/src/assistant-stream.ts:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/api/session-controller/src/assistant-stream.ts#L1-L28) | Web follow 消费 live stream；SDK JSON-RPC 转发其协议控制/事件。 | H23 |

| browser / computer use | [S101 · packages/experimental/browser-use-runtime/src/index.ts:60](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/experimental/browser-use-runtime/src/index.ts#L60-L87) | 浏览器按精确 Agent 管资源；共享桌面不自动为 Session 预留。 | H28 |

| telemetry | [S107 · packages/session/session-telemetry/src/coordinator.ts:205](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-telemetry/src/coordinator.ts#L205-L232) | 记录导出走部署 redaction waterfall；默认无规则，须另行配置。 | H29 |


## 三条关键运行链

**初始化与所有权：** registry 将调用者上下文传给 factory；先 prepare/acquire 存储与 scope，在 Session enter/announce 后执行 setup，再 commit、enter/announce Agent；创建事件等待结束后才释放排队工作。失败路径取消未发布工作并 unwind；handle 的 dispose 等待 drain。源码对应 H09 的 initializeAgent/createAgent 与 H07 的 lifecycle tests。

**请求与工具：** turn 在 claim 前打开，preStep 做模型选择快照、toolSet 与 prompt assembly；拒绝/首条空输入可零步结束。进入 step 后 prepareCall 绑定 adapter 能力，提交 system/user/runtime-context，再记录 header/context 并冻结派生历史。流结算成 message 或 attempt 后，工具批次进入 registry/executor/pipeline，结果与附加上下文决定是否还欠下一请求。重试发生在同一步内部，不重复 assembly/preStep 或首次用户消息。

**事实与恢复：** Session 的 append 验证并快照事实；surface 管模型可见节点，deriveMessages 派生消息。SessionHandle 负责持久读写/flush/close，JSONL provider 负责物理 framing、generation 与 lease；读 open 可在内存迁移，写 open 发布最终版本后继。恢复修复未闭合尾，Fork 复制精确前缀并使用新身份，不继承外部执行资源。

以上是默认主线，不把所有可替换 provider/自定义中间件强行画成同一链。

## 可追溯关键断言

下表将容易讲错的实际实现单独固定。`官方实现` 指观察到的代码行为；动机若只有我们的推断，在下一节单列。

| 官方实现事实 | 直接依据 | 教学影响 |
| --- | --- | --- |

| Turn 可零 Step，且先开 turn/start 再 preStep。 | [S008 · packages/core/agent-loop/src/agent.ts:327](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L327-L354) | H10 画首条输入拒绝/空输入分支。 |

| Waterfall 是 next 环绕；serial 遇到非 null/false/undefined 返回值会停止。 | [S018 · vendor/cordis/src/events.ts:204](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L204-L231) | H06 把 0 与 false 作对照，并画返回方向。 |

| Fiber 卸载会汇合多个异步 disposer；不能假设全局严格逆序。 | [S231 · vendor/cordis/src/fiber.ts:702](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L702-L723) | H07 同一 effect 内显式安排存在依赖的释放。 |

| patch 直接赋覆盖字段；config 整替换，未匹配目标 warn/skip。 | [S026 · vendor/include/src/index.ts:57](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/include/src/index.ts#L57-L84) | H08 不按深合并推断丢失字段。 |

| 创建发布在 setup.commit 后，agent announcement 完成前不释放工作。 | [S232 · packages/core/agent-loop/src/index.ts:630](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L630-L649) | H09 以 publication transaction 解释回滚。 |

| prepared call 只能 dispatch 一次且配置必须一致。 | [S233 · packages/llm/llm/src/index.ts:988](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L988-L1027) | H11/H26 不复用准备调用来掩盖路由变更。 |

| 重试不重跑 preStep/assembly，firstAttempt 只提交一次原用户消息。 | [S234 · packages/core/agent-loop/src/agent.ts:443](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L443-L490) | H20 区分 Step 和 Attempt。 |

| 工具必须声明 output.schema/render；run_code 是保留名。 | [S041 · packages/core/tools/src/index.ts:128](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L128-L155) | H13/H25 不使用过时简化签名冒充真实 API。 |

| 审批 allowed-once 后仍检查 guards；缺渠道或无 agent 的 ask 拒绝。 | [S003 · packages/core/tools/src/pipeline.ts:190](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L190-L217) | H15 审批不越过拥有者守卫。 |

| 工具 body 已开始时取消仍等待它 settle；不能强杀同进程代码。 | [S077 · packages/core/tools/src/pipeline.ts:258](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L258-L285) | H20 用真实副作用边界解释取消。 |

| 最终 observer 接收冻结结果；其 throw/reject 只产生诊断。 | [S235 · packages/core/tools/src/pipeline.ts:400](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L400-L428) | H14 不给 tools/result 设计否决回传。 |

| 模型消息从 surface 派生，outer array 分离而消息共享深冻结。 | [S009 · packages/core/session/src/index.ts:999](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L999-L1026) | H17 不把 log 当 messages 数组。 |

| 摘要记账不是 surface；实际 summary replacement 走 user/message。 | [S236 · docs/subsystems/compaction.zh.md:11](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/compaction.zh.md#L11-L33) | H19 同时展示原日志和可见投影。 |

| SandboxMode 定义文件效果，网络与进程可见性不在范围。 | [S220 · packages/sandbox/sandbox/src/index.ts:30](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/sandbox/sandbox/src/index.ts#L30-L57) | H15 必讲 full/partial 与未审计状态。 |

| spawn provider 不继承父对话。 | [S080 · packages/subagent/subagent-spawn-in-process/src/index.ts:46](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/subagent/subagent-spawn-in-process/src/index.ts#L46-L59) | H21 区分 spawn 与 fork。 |

| Workflow phases 是进度元数据，不隐含执行结构。 | [S237 · docs/subsystems/workflow.zh.md:41](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/workflow.zh.md#L41-L50) | H22 不能把它画成保证的 DAG。 |

| 遥测 redaction 默认透传，本 seam 不自带规则。 | [S107 · packages/session/session-telemetry/src/coordinator.ts:205](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/session/session-telemetry/src/coordinator.ts#L205-L232) | H29 不宣传自动脱敏。 |

| 浏览器 profile/登录状态不从日志恢复，桌面 provider 不预留 Session 独占。 | [S238 · docs/subsystems/browser-use.zh.md:21](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/browser-use.zh.md#L21-L32) | H28 区分日志、浏览器状态和桌面输入。 |


## 设计动机与技术取舍的证据级别

**官方文档明确表述：** 一切皆插件实现可替换组合；模型可见输入必须可从日志重建；能力 seam 区分定义、提供方与消费者；Host/Client aggregate 分开避免同 program 的 Context 声明冲突。依据见 architecture/development 与对应源码。可在教材中写“官方说明”。

**我们的设计分析：** 契约和持久事实便于测试与替换，同时带来组合合法性、资源 drain、解释器版本与生成图维护的成本；模型输出和业务执行分开便于独立守边界。这是对代码的分析，不代替官方作者对动机的表态。

**待确认：** 没有证据证明为什么每个超时阈值、默认重试次数、压缩 ratio 被选为当前值；不能推测为“经过最优性能测试”。不同 provider/平台的隔离效果、长时资源压力、真实语义质量和生产部署可用性没有在本轮测量。源码中存在相关测试，只能证明相应测试设计存在，不能替我们运行得出结论。

## 测试与异常阅读索引

每讲 A 的字段 17 给出具体测试。evidence/test-index.json 保存真实测试名称、行号与固定链接，供后续作者定位断言，不是复制整套测试。关注异常回归：tools 的未知/隐藏/输出非法/策略抛错；loop 的取消、请求重试、冻结、首输入拒绝、scope teardown；Session 的 seq、surface、fork、repair、lease；subagent 的 activation/外部 lifecycle；MCP 的 negotiation/reconnect；workflow 的 meta/realm/caps；telemetry 的 redaction listener。

## 限制与安全边界

README/SAFETY 明确为实验性开发者预览，未接受安全审计，不应视为安全或可用于生产环境的软件。本课程研究其工程设计，不作已审计生产安全背书。策略/审批/沙箱不能防止对已授权资源的所有损害。第三方插件、模型命令、外部 MCP 内容仍在威胁模型内。

Session append/turn end 与磁盘 durability 不等价；flush/checkpoint 有自己的所有者。未知工具写结果不能自动补成成功；进程硬退出可能缺少 attempt settlement 或 Job settled。Fork 不转移 Job/浏览器/桌面所有权。取消已交付输入或已写副作用不能撤销。

本轮没有运行实际 sandbox confinement、真实 MCP 服务器、真实模型 API、浏览器连接或桌面控制；没有调用产品启动器读取用户 Harness home。所有实验只用虚构数据、内存与可审查本地文件。

## 锁定版本与更新策略

以本次 source-lock/source-index 为可复核基线。更新时在独立缓存检出新 Commit，比较旧→新涉及的 API、路径、默认值、事件词汇、测试与安全说明；先标记受影响 Hxx、图号、概念卡和练习，再重生成行号与哈希。修改 A–G 和图源后做同层复验，最后建立独立课程版本。不得静默把链接切到 main、把某次最新 npm 的例子混进 V2.0，或把官方 PR/草案建议当已实现。旧版本留档用于在读学员复现。


## 官方材料入口

[S239 · README.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/README.md#L1-L12)

[S113 · README.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/README.zh.md#L1-L10)

[S114 · SAFETY.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L1-L10)

[S115 · docs/architecture.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/architecture.zh.md#L1-L10)

[S126 · docs/cordis-primer.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/cordis-primer.zh.md#L1-L10)

[S117 · docs/development.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/development.zh.md#L1-L10)

[S201 · docs/testing.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/testing.zh.md#L1-L10)

[S155 · docs/tool-execution-pipeline.zh.md:1](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/tool-execution-pipeline.zh.md#L1-L10)
