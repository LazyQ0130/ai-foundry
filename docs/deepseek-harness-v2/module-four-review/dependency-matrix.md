# 跨课程知识与术语矩阵

| 转接 | 已具备知识 | 本课新增产出 | 过关任务 |
|---|---|---|---|
| Stage4→H13 | 白名单/参数/写入确认；模型建议不直接执行 | 从局部函数到真实Registry/层/Step set | Q1–3，不能把旧Stage4的strict/HMAC实现照搬为Harness实现 |
| H06/H07/H09→H13 | next回程、Effect所有权、Agent/Scope | 登记身份、继承过滤与dispose | 解释同对象重登记为何不恢复旧set |
| H11/H12→H13 | 冻结请求、能力投影、完整ToolCallBlock | 请求声明与当前可执行定义绑定 | 对照两侧请求及id关联 |
| H13→H14 | 完整定义、输出契约、当前资格 | 三阶段/结果/批次调度和提交 | Q4–7、14；不重教全部DSL |
| H14→H15 | pre/ask/guard位置与错误路径 | 真实审批、逐调用mode、后端/版本条件 | Q8–10、13/15；批准仍可拒绝 |
| H13/H14/H15→H16 | 看得见/准入/允许/结果/安全条件 | 四家族角色、Provider/连接故障与组合 | Q11/12/16/17；发现不扩权 |
| H10/H12/H14/H16→H17 | Turn/Step、结算事实、call/result与后续输入 | 交接事件/读视图问题，不提前写新课 | Q18逐前缀重建与不可重放说明 |

| 主要术语（有限口径） | 首次/承接 | 本模块一致含义 |
|---|---|---|
| ToolDefinition | H13 | 完整宿主定义，包含函数与输出契约 |
| ToolSchema | H13 | 模型声明字段投影，不是完整定义 |
| ToolCallBlock | H12/H13 | 模型提议，arguments为字符串 |
| ToolResultMessage | H12/H13 | 工具角色消息，关联toolCallId |
| ToolsService | H13 | ctx.tools访问的服务；不是假想ToolRegistry类 |
| ToolExecutor | H13 | describe/execute的提供方契约 |
| NativeToolExecutor | H13/H14 | 原始工具描述与批次执行 |
| ToolExecutionPipeline | H14 | 单项prepare/dispatch/complete |
| ToolBatchInput | H14 | 原始调用批次与agent/signal/set/log |
| ToolExecutionInput | H14 | 单项执行身份及unknown参数 |
| ResolvedToolSet | H13 | 本Step准入身份与实时有效性 |
| when | H13 | 轻量条件；非动态业务授权 |
| Agent Scope | H09/H13 | 同进程贡献路由与继承 |
| Effect/Disposer | H07/H13 | 登记所属Fiber与撤销 |
| Waterfall/next | H06/H14 | 去程委托与回程；非投票交集 |
| PreToolDecision | H14 | allow/deny/ask/cancel |
| guard | H14/H15 | 最终allow后只拒绝或不表态 |
| ApprovalService | H15 | 实际请求/取消/审计与应答链 |
| ApprovalPolicy | H15 | ask或never，会话覆盖部署 |
| ApprovalOutcome | H15 | 四结果，只有allowed-once授权 |
| ApprovalRequestId | H15 | 每请求新审批身份 |
| ToolCallId | H12/H14 | 调用关联，不是授权缓存key |
| SandboxMode | H15 | 文件效果词汇，非网络保证 |
| SandboxPolicy | H15 | 逐调用解析模式/根，不自动审批 |
| SandboxProvider | H15 | confine返回包装argv等，消费者spawn |
| SandboxEnforcement | H15 | full/partial与mode正交 |
| FsTarget | H15 | targetKey/displayPath/processPath分工 |
| expected/version | H15 | 创建或替换的版本前提 |
| fs/observed | H15 | 消费者发同步观察，不是持久消息 |
| fs/*-intent | H15 | 可选单槽意图，不是guard交集 |
| TOCTOU | H15 | 检查与使用之间竞态 |
| WorkingDirectory | H16 | 当前cwd与Session原始根不同 |
| ShellExecutor | H16 | 执行器不同于bash/pwsh模型工具 |
| Jobs | H16 | 后台任务生命周期不等于工具批次 |
| WebRuntime | H16 | 独立Search/Fetch注册与逐调用选择 |
| available/ready | H16 | 本地选择条件与路线准入，非网络健康 |
| Search/Fetch Provider | H16 | 发现来源与取得指定资源分开 |
| MCP Transport | H16 | stdio/HTTP消息通道，不是沙箱 |
| publicToolName/rawName | H16 | 模型公开名与wire原名分开 |
| connection generation | H16 | 连接拥有者与代际，不是Session恢复 |
| MCP Resource | H16 | 按server/uri按需读资料 |
| Server instructions | H16 | 独立有归属Prompt贡献，非资源自动灌入 |
| canonical value/content/meta | H13/H14 | 规范值、模型内容、展示事实分层 |
| tools/result 与 tool/result | H14 | 运行时观察与条件性Session事实 |

同词异义：能力服务的Definition与单个ToolDefinition分开；Agent Scope与Cordis Fiber/isolation及OS沙箱分开；model Step与一次工具调用/Attempt分开；工具Executor与ShellExecutor分开；实践A/B/C/D与证据A/B/C/D/E分开。

统一六问：已登记？当前Agent可见？此Step准入？本次允许？后端/连接可用且约束兑现？结果与Session事实是什么？它们可以给出不同答案，不用单个“可用”布尔值代替。
