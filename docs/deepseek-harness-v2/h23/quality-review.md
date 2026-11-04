# H23 作者侧质量审查

2026-11-04；正式标题《CLI、Web UI、SDK 与远程通信》。固定源 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。结论：**CONDITIONAL GO**。作者内容及列明的 C/D 行为可交付，无确认开放 P0/P1；学习负担 P2、完整应用与教学外部验证仍开放。本轮是同一作者的分轮技术/编辑审查，没有独立外审或发布许可。

| 判断维度 | 结论 | 证据和实际限制 |
| --- | --- | --- |
| 作者侧教学内容 | GO（本轮范围） | 四图、四实践完整答案、X 跨入口综合、12 思考各含推导与评分；其中 8 题为代码/配置/轨迹推导；前置/停点/五文件路线齐备 |
| CLI/Profile | GO（列明路径） | 真 parser、独立进程 exit、Profile load/compose、真实 runCli dump/启动错误；五发行 Profile 仅解析，不称都已启动 |
| Web 业务组件 | GO（受控载体） | 真 Client RPC/Gateway/RemoteAccess/SessionController/Loop/JSONL；回执、follow、cancel、被动历史与拒绝；fetch/stream/Peer 为协作者 |
| Web Connection/实时恢复 | GO（列明子路径） | 旧源结算后新代际、晚 ready 隔离；真 SessionEventStream revision 缺口重新 baseline |
| 真实产品 Web UI 与鉴权 | NOT_RUN | 未运行 Harness Web UI/真实浏览器 WebSocket、HTTP cookie/Origin、全生成 Schema 客户端或完整授权安全审计 |
| SDK stdio 闭环 | GO（局部 D） | 正式 Client/Server/Protocol、独立 Node 子进程、双向换行帧、run/通知/wait/result、shutdown 与 exit0；Mock LLM |
| Profile/AppBoot/Loader | GO（作者隔离组合） | 真实 loadProfileDirectory/boot，空配置 settled，prepare 装核心后装 SDK；没有运行发行版 sdk-minimal 完整服务组合，不升级 E |
| 持久历史与 Resume | GO（列明范围） | 真 JSONL；正常关闭后新 PID resume 无新 prompt，旧前缀保留/增长且新请求读到旧事实；缺失/open/writer-held/版本不兼容拒绝 |
| 取消/资源释放 | GO（合作模型） | Web cancel 后真 idle/aborted；SDK close 幂等并终结子进程，处理中关闭后新 reader 读到用户输入/aborted Turn；强杀/崩溃不在范围 |
| 协议失败与恢复 | GO（列明输入） | -32603/坏行忽略/params 归{} 后仍能实际跑新任务；坏 initialize 旧 PID 先退出，再以新配置新 PID 成功运行；非全部非法输入矩阵 |
| 审批与问答 | GO（列明输入） | 真实 server→client 请求，仅 allowed-once 效果1；missing/rejected/cancelled 效果0；问答 answer、close abort 与迟答忽略；非全部归属/网络竞态审计 |
| ACP/Python | STATIC / NOT_RUN动态 | 固定文档与接口边界已核，未运行第三方客户端/跨语言 SDK |
| 真实 Provider 与 E | NOT_RUN | 没有付费模型、性能成本数据或完整 Harness 应用端到端；C/D、真实文件/stdio 不自动升 E |
| 目标学员试读/实测时长 | PENDING | 没有无提示迁移/错误分布/完成率或真实学习时间 |
| 独立技术/教学外审 | PENDING | 当前只有作者审查，未有独立签署 |

## 技术事实与证据范围

25 个有效 TAP=C7/D18，既有 Renderer 12/12；X 复用 B1/C1，四个 D6 是同一桥接的四种回答，历史重跑不累计，必要 Cordis 不另列 B。完整原始命令、exit/stdout/stderr、每份程序 hash、临时根与 trace 保留。最终身份见 lab-results/test-grades；[coverage-matrix.md](coverage-matrix.md)分别列进程、服务、载体、Peer、浏览器、JSONL 与未测范围。

54 个源码断言记录真实文件/准确范围/符号/控制分支/结论/上游参考与本地等级。9792 个固定源/config/doc Git blob+SHA256 及六树全部直接/传递版本+integrity 核验只证明身份，不能代替语义或行为。官方测试定位/选读，没有执行含递归清理的上游套件。

关键边界在正文、图和答案一致：CLI 是启动器；Web 应用 RPC 与 SDK JSON-RPC 不共方法/身份机制；Host 授权不由按钮决定；回执不等完成；follow 先监听再 snapshot；Generation/Seq/revision 不混用；run 取活动区间而非逐 Prompt 因果；session(id) 惰性与真正 resume 分开；本版 SDK 无 session/cancel；close 不删除历史或撤销外部效果；审批/晚答不产生隐含授权。

原先 bundle 相对路径损坏、bootstrap 导入先后、ESM/Client 子路径、Remote args、Profile patch 和 Mock 输入识别等夹具问题均保留失败。补真实 AppBoot 时 cordis.yml 错写对象，Loader 在模型后报根配置错误；改为空数组并等 boot 完成后才暴露 SDK，防止把握手成功误判为应用成功。修复不改官方源码、不删核心断言或切真实 Provider。详见 [discrepancies.md](discrepancies.md)。

## 负担、视觉与教学条件

正文精确指标以 [content-check.json](evidence/content-check.json) 为准：默认 6133/全部 9005 汉字（不含代码与 URL），17 代码块408行，31 折叠，4 图、4 实践+1 综合、12 思考。13 份完整程序是可复制执行材料，较长单行代码通过容器横滚，不要求学员一次精读全部实现。

230–310 分钟为作者估计，三段60–80/70–95/100–135，蓝图100–140增加130–170，前课210–290增加20–20。前置回忆、先预测再运行、可交付停点和高级折叠控制同时引入的概念，但没有证据说明已实测减负。W01 P2 保留，环境准备另计。

实际 LessonMarkdown/平台 CSS 1440/390/320 通过，13 程序三宽度复制39次一致、默认折叠/键盘开合、任务、代码横滚、四图与原图链接、页面无溢出及静态 HTML 通过。四张 SVG/PNG/生成脚本保留，最小辅助图字约12.6px。作者实际看图的样本/哈希见 manual-review；没有把几何检查当语义审读、教材浏览器当产品 Web UI 或学员体验研究。更多设备/低视力舒适性仍待试读。

## 范围和停止点

H04/H08/H09/H17/H18/H21–H23 一致性见 knowledge-bridge，H24 只有前置交接。开始快照 5124 个非 H23 文件（含 output、旧课/模块证据和用户改动）逐文件保护。最终 validation 核当前程序/正文/预览/截图/源码身份与只暂存 H23，进程检查确认无遗留 H23 Node 子进程。

只独立提交两个 H23 目录；没有批量删除、真实用户 Session/密钥操作、线上课程/价格/权益/数据库/发布变更。本轮完成后停止，不开发 H24、不开展第六模块审查、不发布。若后续确认协议/权限/核心实验/资源泄漏 P0/P1，须阻断并复审，不以总体条件通过掩盖。
