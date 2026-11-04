# H23 准备与蓝图门禁

研发基线 H22 `21ab93acc360b3d44e105e3b81feb9b86d226ad8`。第一项先核正式蓝图：连续会话内 H22 已完整通读 30 讲；本轮在实施前验证蓝图 SHA256 与该完整阅读输入完全一致，并再次读 H23/H24、前置与模块交接。完整 30 讲标题/唯一目标及全部输入身份保存在 [preparation-inputs.json](evidence/preparation-inputs.json)。未修改蓝图或重排课程。

| 门禁 | 固定规划与实施 |
| --- | --- |
| 正式标题 | 《CLI、Web UI、SDK 与远程通信》，替代任务暂题《多客户端与对外接口：CLI、Web UI、SDK 与 RPC》 |
| 唯一目标 | 追踪一个控制动作与一条状态订阅穿过载体边界 |
| 范围 | CLI/Profile、Web Client/Host/Connection/Remote、SDK stdio 与生命周期；ACP/Python 只介绍边界 |
| 前置 | H04、H17、H21–H22，HTTP 与流；补 H08、H09–H10、H12、H18 的精确状态/恢复含义 |
| H22 → H23 | 从工作所有权、状态来源、非持久 Job/Run，增加客户端控制/订阅/断连；不重教调度引擎 |
| H23 → H24 | H24《大型 Agent 系统测试与综合架构分析》，为跨模块链建立事实、测试与限制矩阵 |
| 第六模块审查 | H21–H24 全部完成后的集中审查；本轮不进行 |

必读输入覆盖 E 制作规范、第一模块 v1、第二至第五增补与集中报告、第五模块 H21–H24 交接；H21/H22 正文、实验/答案、质量报告、H22 正式交接。前课全篇阅读沿用当前连续研发会话，并复核关键段落、实际程序和报告；不是仅从 README 推定语义。H03/H04/H08/H09/H10/H12/H17/H18 的衔接按本课所依赖段落重新抽查，不宣称本轮把全部旧课重新逐行审校。输入 hash 清单用于身份，不能代替这些具体阅读判断。

固定源调查覆盖 CLI/启动/Profile、Client web/modules/connection/UI 消费面、Host webserver/frontend-static、Gateway/RemoteAccess/SessionController/Typert、SDK client/server/protocol、AgentLoop/Session/JSONL 及 ACP/Python 文档。54 个断言分别定位实现分支与相关上游测试；官方测试只定位/选读，不执行其递归清理。9792 个源/config/doc 文件核 Git blob+SHA256，运行前再次核字节；不引用主分支新增功能。

SDK 实验采用真实隔离作者 Profile/AppBoot/Loader，空配置 settled 后装正式 SDK，prepare 内装 Mock 核心。该入口经过正式 CLI parser，但不启动发行版 sdk-minimal 完整组合。Web 以真实 Client/Gateway/Controller 与受控载体验证，明确没有产品浏览器握手；不将 SDK 真实管道推广成 WebSocket 或 E。

## 学习负担与安全准备

先一个虚构审查任务，再 A 的参数/Profile，接 B 的 Web 控制与订阅，最后 C/D 的 SDK 管道、等待、Resume、问答和关闭。精读五个主文件；Typert 编解码、错误细节、复杂连接与 13 份长程序折叠。决定权限、完成与持久性的条件保留在默认主线。

三个停点 60–80/70–95/100–135 分钟，共 230–310；比蓝图 100–140 增加 130–170，比 H22 的 210–290 增加 20–20。均为作者估计，环境另计，保留 W01 P2，未测减负效果。

新临时根、新 DSH_HOME、新 JSONL、白名单环境、固定 Mock；不读取用户 Session、凭据或真实 Profile，不用付费 Provider。六棵隔离依赖树所有直接/传递版本与 integrity 对固定 pnpm 核验。禁止递归删除的保护钩子不弱化；所有临时材料保留。

开始快照保护 5124 个非 H23 文件（包括 H01–H22、五模块审查、output、用户已有改动）。只写两个 H23 目录，不改课程价格、权益、数据库、路由或发布状态。完成 H23 后停止。
