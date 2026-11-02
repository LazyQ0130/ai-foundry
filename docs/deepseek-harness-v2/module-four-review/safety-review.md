# 安全边界专项审查

审查结论：本轮未发现正式正文/源图中需要修订的确定错误安全保证。固定版为未经安全审计的实验软件，局部C/D不能给生产隔离签字。R01修的是复现依赖完整性，不是证明安全控制已全面有效。下表的PASS只限明确动作；源码索引包含分支位置及对应官方测试阅读入口，未运行上游完整套件。

| 边界 | 四课准确表述与成立条件 | 本轮证据 | 仍不能保证 |
|---|---|---|---|
| Schema | 数据形状；业务规则、授权另判；defineTool包装不等于任意raw定义自动验证 | H13 DSL/无损/根开放；H14坏JSON与坏输出；源schema/json-schema/pipeline | 路径合法、用户有权、操作安全、真实模型遵循声明 |
| Agent Scope | 受信任贡献的继承、遮蔽、过滤、路由与登记生命周期 | H13真实Scope；MCP allowlist禁止远端write，server计数0 | OS隔离、任意宿主/Server代码无法访问资源 |
| ask/never | ask委托应答链；never服务内拒绝；预取消先cancelled；缺/错答unavailable | H15 18C；新A actualLoop | 自动弹窗覆盖所有能力、无人默认允许、UI或生产存储可靠性 |
| allowed-once/rejected/cancelled/unavailable | 只有allowed-once授权本次；新审批ID配对，不按callId缓存；迟到批准无效 | H15重复callId/迟到/审计提交前故障；新A审批和guard同轨迹 | 服务自动证明主体恰好执行一次、审批等同长期权限或exactly-once |
| 单调guard | 最终pre与ask解析之后，只有allow才查；只deny/abstain | H14 C-policy，H15 approved-guard，新A主体0 | 普通Waterfall所有deny天然不可逆；防恶意同进程绕过 |
| 三模式 | read-only/workspace-write/danger只描述文件效果；workspace含extra和后端临时区 | Policy/根/选择实际局部测试，消费者源码 | 无网络、只能读工作区、整机/所有进程隔离；danger不是本轮运行默认 |
| full/partial与平台 | Linux bwrap/Landlock、macOS Seatbelt、Windows ACL partial；旧ABI可partial；无runner SANDBOX_UNAVAILABLE | 静态源码+模拟probe/argv | 三平台原生runner全部NOT_RUN；真实ACL授权/回收、网络与逃逸攻击未测 |
| 文件新鲜度 | 正确消费者发observed/intents、Observation占槽、后端遵expected；未见/absent可防护创建但不能盲覆 | H15真实local/fence，H16真实tool-fs，新B未见/陈旧/重读 | 裸local自动guard、所有Shell写入都经过fs事件、只读窗口证明理解全文 |
| 身份/生命周期 | targetKey不透明；displayPath/processPath分工；Session对象WeakMap，恢复同ID新对象需重读；卸载清空 | H13登记身份、H15 restored-same-id、源码 | 持久日志自动恢复内存观察、进程/连接或旧文件句柄 |
| 路径/版本/发布 | fs-sandbox重新规范路径与范围，local进程内锁+版本检查+原子发布 | Windows真实新fixture文本变更与版本拒绝 | 任意外部写者的内核CAS；祖先链接换位/所有TOCTOU/硬链接攻击已消除 |
| Web外部资料 | Search/Fetch返回不可信数据；清洗script/style是格式处理；提示可能被极小上限截掉 | 内存404HTML输出/截断/不可信提示 | 内容可信、完整Prompt注入防御、Fetch为登录/JS交互浏览器 |
| HTTP目标 | http/https、无凭据、长度/同源重定向/大小/时间预算；requestOnce用全局undici dispatcher | 纯URL拒绝4项并接受127.0.0.1；官方web文档与provider静态核对 | 包内建完整私网/loopback/metadata拒绝、DNS pinning；实际网络请求为0 |
| MCP外部Server | 配置命令、环境和Server程序本身须可信或另隔离；发现/协议合法不授本地权 | 审阅随课Server；真实SDK stdio2.2.0；scope拒绝与错误/释放 | stdio天然沙箱、所有SDK功能都已桥接；互联网Server/HTTP认证未测 |
| 连接与资源 | 已建连接丢失可留目录；phase1失败留旧、phase2冲突撤自身新项；资源按需读，instructions另条有归属Prompt | stdio刷新、禁重连断连、一次新PID重连、最后provider卸载共享工具归零 | 完整代际/退避耗尽/关闭失败矩阵；phase2冲突仅静态；资源自动进入system |
| 结果/取消/恢复 | 观察、Session接受、后续模型输入、磁盘flush不同；post不回滚；取消视实际等待 | H14门闩/drain/unknown修复；新A/B/C逐前缀重建 | 工具error必终止Turn、timeout无副作用、恢复可安全重发所有写入 |

对于“有Shell沙箱就不需要FS守卫”的判断：两者覆盖不同执行渠道与不同性质。前者约束特定子进程的文件效果范围；后者针对可信文件消费者传入的路径/版本。即使同一文件都在允许范围，仍可能陈旧覆盖；即使File守卫正确，也不能约束一个绕开它的子进程。

对于“用户批准后是否仍可能拒绝”：是。通用guard在审批后；具体能力的沙箱/文件策略及版本条件位于主体内部。实际D-A证明批准后guard拒绝；D-B证明版本拒绝和重读恢复。不能因为本轮没有把每一种后端拒绝都与人工UI实连，就声称所有组合已动态验证。

实验安全范围：新临时fixture、环境白名单/新DSH_HOME、可信本地Node stdio Server、Shell白名单替身、Web离线Provider。只删除单个经containment与名称检查的文件，空目录保留；不运行带递归清理的上游套件。没有真实账号、凭据、费用、线上业务或发布动作。
