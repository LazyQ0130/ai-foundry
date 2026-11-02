# 固定源码语义审查与证据边界

官方基线：[DeepSeek Harness f3803c9](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3)，根版本0.2.2-alpha.2、Cordis4.0.6-alpha.1。没有读取当前main替代。`audit-inputs.py`重新核9552个缓存源/测试/文档/配置文件的Git blob与SHA256；四课218项断言的固定片段、hash、行界和90个正式正文链接范围全部通过。完整性不等于读懂9552个文件，更不等于9552项行为测试。

准备依据包括30讲完整蓝图、前三模块报告与有效标准、四课全部正式正文/完整程序/测试/答案/40思考题、16源图/PNG与图注、原断言/原始运行与四份质量报告、H16准备包13文件及其引用、H17–20规划。409项输入身份见input-inventory；清单是定位与哈希，语义结论另见统一模型/一致性/安全/图审查，不把枚举说成看图。前三报告均为CONDITIONAL GO，保留作者/组件/学员三层判断和历史失败；本轮继续并细分协议/平台/E。

| 语义阅读主线 | 必须连着看的分支 | 当前行为对照 |
|---|---|---|
| tools index/contracts/schema/json-schema/executor，Scope layers | 隐式根与嵌套开放性；defineTool输入包装；output校验；继承过滤后叠自身；when await前后取消/登记变化 | H13 C31/D6；H14坏参数与快照；新增C |
| Native入口、batch、pipeline | parse坏JSON保留；start在prepare前；pre/ask/guard；dispatch当前资格；post/final标签；finish/notifyResult；fillPool/commitReady及finally drain | H14 C32/D13；新增A，139逐项矩阵 |
| AgentLoop agent.ts、SystemPrompt、LLM Runtime、Session repair | 新Step resolve与retry复用；两侧投影；log条件；工具结果进入下一请求；conclude/nextStep；unknown vs not-started | H13六D/H14调度与Loop/H16两综合；新增每请求第二Session重建 |
| user-approval index/types | Turn前提、新审批ID、问答审计提交、预取消/never/应答Waterfall、迟到结果与private诊断 | H15审批18C和11Pipeline D；新增A |
| sandbox policy/roots/escalation/provider、Shell消费者 | 优先级/单次模式不持久；extra严格根和workspace canonical不同；full/partial、单候选未探测、不可用拒绝、danger旁路 | H15局部policy+模拟probe D；原生NOT_RUN |
| fs observation/local/sandbox与tool-fs | 事件消费者、单槽、WeakMap对象、未见防护创建、版本先于字面匹配、围栏重新resolve、原子发布与残余竞态 | H15真实FS D、H16真实File D、新B |
| web runtime/tool-web/http provider/policy/官方web文档 | 显式/唯一Provider、available/ready、选择失败true、404正常结果、转换/上限/信任、undici目标策略实际缺口 | H16八D/4URL C、新C；联网NOT_RUN |
| mcp client tools/transport/connection/resources | public/raw名；两阶段同步；禁重连留目录/耗尽撤销；旧代关闭与dispose；按scope读server；资源与instructions | 实际SDK2.2.0本地stdio D、有限helper C；HTTP/完整竞态NOT_RUN |

官方相关tests的setup/action/assertions按四课断言索引选读，范围包括Tools schema/scoped/activation、Loop tool-order/tool-executors/tool-calls、Approval、SandboxPolicy、File tools/观察、Web选择/渲染、MCP tool-definition/protocol/reconnect/negotiation。**没有运行完整上游Vitest、构建、产品GUI、真实Provider或原生安全套件。** 重跑的是课程随附且实际导入固定官方实现的C/D。上游默认递归清理不符合本工作区用户要求，因此本轮不直接执行那些清理路径；FS夹具只替换清理钩子。

| 文档/注释容易过读的位置 | 本轮判断 |
|---|---|
| Tools restrict注释用global简写 | 实现view包含所有祖先继承，不能漏祖先；正文和图已明确 |
| effectivePolicy文档推荐消费 | 实现TS private；H15显式any为诊断，不推广公开API |
| execution字段readonly | prepare只深冻结arguments，完整exec最终才freeze；正文已按实测分层 |
| HTTP policy注释public-address/pinning | provider实际不提供该地址拒绝，官方web文档明确目标未受限制；纯URL接受loopback不发网 |
| MCP“发现失败保留旧工具” | 仅phase1；phase2已撤旧，冲突回滚自身新项；正文和图均区分 |
| H16蓝图只Mock | 是早期设计范围；正式任务增加真实File/stdio；保留两份历史定位，不改蓝图 |
| “锁定所有运行依赖” | 原FS缓存漏传递readdirp核验，R01确认；已加完整integrity守卫并用新锁树复验，不追写历史报告 |

机器110项AST辅助重查实际类成员/接口字段/函数存在与原定位，避免类名/所属关系漂移；不拿AST替代await/return/分支语义。规范值/模型消息/审计/连接/文件观察各自生命周期，是H17交接的关键，而非为统一用词消掉的差异。
