# 真实组件、Mock与未验证能力

| 能力 | 已有真实证据 | Mock/条件 | 未验证 |
| --- | --- | --- | --- |
| H21 Activation/Spawn/Fork/消息/取消 | Runtime/Manager/Loop/Session/JSONL，当前实例与新Context历史发现 | 模型/外部句柄协作者，合作门闩 | 外部真实Agent Provider、子级跨进程冷续跑、完整Preset/OS隔离 |
| H22 Workflow/Job/Goal/Schedule | 真实Engine/PTC/Node受管进程/计划状态/目标预算及D链 | 固定模型、虚拟时间与测试协作者按原矩阵 | 整体发行应用、真实长期调度/所有平台 |
| H23 CLI/Web/SDK | parser/Profile/AppBoot，真实Client RPC/Gateway/Controller，真SDK进程/JSONL | Web fetch/stream/owner Peer受控；核心prepare挂载 | 产品Web浏览器/真实Host准入/ACP跨语言E |
| H24 Profile/Snapshot/故障 | 真实核心YAML/Loader、Replay/Snapshot子模块、SDK/HTTP/JSONL/外部文件 | 固定模型/安全工具/测试exit钩子 | 默认SDK+HTTP exit失败，完整Profile-adapter Suite、发行lib/E |
| 网络与浏览器 | H24回环HTTP/SSE、真实SDK管道；教材Chrome三宽 | 本地Mock Server、作者Renderer临时服务 | 产品WebSocket/浏览器，真实互联网/Provider |
| 日志/诊断/遥测 | 真JSONL读回；Trajectory/OTel固定源码静态 | 未上传任何用户Session | 产品视图实测、外部遥测/隐私审核 |
| 性能/费用/教学效果 | 无对应实测 | 功能duration和Mock usage不替代 | benchmark、Provider账单、学习/试读/外审 |

每个“真实”只适用原测试所列输入和平台；真实文件不是E，正常新PID恢复不是崩溃耐久，Scope不是OS沙箱。未执行与执行失败分别写，不能都塞进“待完善”。

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](../p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](../p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](../p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](../p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
