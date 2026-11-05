# H24 作者侧质量报告

2026-11-05。正式《大型 Agent 系统测试与综合架构分析》，固定源码f3803c96974ad4a94195fb97e5c637e9c2a3afe3，研发基线4d68013。**总体结论：NO-GO。** 内容和受控实践已形成可审阅交付；默认SDK+HTTP退出在当前Windows/Node24.16.0源组合仍有已确认P1兼容性阻断。测试钩子分支的通过不得把总体改为CONDITIONAL GO。当前是作者自审，不冒称独立外审。

| 必须分别评价的维度 | 结论 | 实际范围/限制 |
| --- | --- | --- |
| 教学内容质量 | GO（作者编辑范围） | 正式蓝图目标，四图/四实践+X，15思考含8推导，五文件精读/三段停点；教学实效未测 |
| 官方源码准确性 | GO（固定分支作者审阅） | 50项实现/配置结论与引用；官方测试仅定位/选读；11865文件Git blob/SHA256只证身份 |
| 官方组件测试 | GO（C9所列合同） | Loader/mode/export/manifest/Tools属性/TestRemote等；未执行所有上游组件测试 |
| 多组件局部集成 | GO（D14+复用X） | YAML核心、Loop/Tools/Session/JSONL、Replay/HTTP故障、SDK/恢复；Mock边界明确 |
| 真实Profile启动 | GO（作者源码核心）；发行/lib正向NOT_RUN | 核心全走YAML/Loader；不是完整base/sdk-minimal/Web；缺lib失败反例不作正向成功 |
| SDK与协议验证 | GO（测试exit钩子）；默认分支NO-GO | 真Client/Server/Protocol、子进程/通知/Resume/退出；默认SDK+HTTP两PID原生断言OPEN P1 |
| 产品Web UI验证 | NOT_RUN | 仅TestRemote子集C；完整jsdom/Client Runtime、RemoteMock、产品built/Host/浏览器链均未执行；教材Chrome另列 |
| 完整E无密钥应用 | NOT_RUN | 未经完整发行入口，最高D；不因源Profile名字或真实HTTP升级 |
| 真实外部Provider验证 | NOT_RUN | 无付费模型、互联网或真实认证链；回环dummy key并非真实Provider |
| 性能和成本验证 | NOT_RUN | 未运行官方built benchmark或真实Provider性能/账单；functional duration与模拟usage不当收益 |
| 真实学习效果/实测时长 | PENDING，W01 P2 | 240–330分钟为作者估计；没有无提示迁移、完成率、学员观察时间 |
| 独立技术/教学外审 | PENDING | 没有独立签署；模块六准备包不等正式集中审查 |

## 阻断项及结论条件

P1-EXIT：默认SDK关闭在真实HTTP Adapter的作者源组合中，shutdown响应之后出现`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`，actual exit3221226505。保留两个PID完整trace，连接close头/owned dispatcher关闭未消除。当前使用官方runtime-only exit钩子自然退出，23项和X通过；这是公开、显式的测试配置差异，既不是偷偷接受异常退出，也不能作为默认分支已修复的证据。归因未扩张到所有发行版/操作系统。

正式准入至少要独立最小复现与诊断，默认退出分支exit0回归，并为所申请的产品范围补完整交付入口。P0/P1未解决时不准CONDITIONAL GO。其余NOT_RUN逐列保留，补一个不自动覆盖另一个。四项硬门禁：越权、未批准写入、取消后新动作、虚报验证均须为0；当前受控窄场景观察未触发，非全产品安全保证。

## 行为、原始证据与修订

23个有效TAP=C9/D14，skipped0；[lab-results](evidence/lab-results.json)、[逐项身份](evidence/test-grades.json)、[覆盖矩阵](coverage-matrix.md)记录入口、真实/Mock、具体断言、平台、命令/程序hash。X复用D1，加真实日志关闭后新Session恢复及模型输入逐对象比较，不额外计数。D6重复两次/P1属性40样本不扩充场景；原M1–M6纯教学24A重跑另列。

使用官方Loader Smoke并传新cwd，外层失败留证；真实核心YAML由AppBoot/Loader装入，作者全部核心行ACTIVE守卫。B复用真实Replay及Snapshot pure子模块，未运行完整官方Profile-adapter Suite；主日志与prompt/schema sidecar及完整workspace分别比较。D包含429恢复/超上限拒绝/实际断流/认证失败/工具throw与guard拒绝/取消和资源重复释放，预期失败不等任务成功。X重开JSONL与新Session deriveMessages前缀等于实际最后请求。模型超时、SDK任务中途失联、缺ToolResult的完整故障注入未执行，未用主动取消、启动前exit7或正常恢复冒充；未知外部效果不得盲重做。

失败与修订见[discrepancies](discrepancies.md)：导出/注入、Schema、Windows路径和Fixture EOL、Retry-After单位、属性依赖等保留初始run及修订；不改官方源码、不自动Record/Refresh、不删断言求绿灯。Fixture EOL更正前原字节保留，非无复核重录。

依赖准备发生过新作者缓存内npm替换3个传递包的操作偏差，已如实登记；随后全新精确锁树一次新增，旧缓存保留。未执行任何批量删除shell命令，不能把这写成“绝无包替换”。[dependency-install](evidence/dependency-install.json)与8树完整锁副本可审阅。

## 学习负担和视觉

默认正文5857汉字/全部10154（不含代码/URL）；15代码块228行、37折叠、14完整程序、4图、4实践+1综合、15思考。长单行辅助程序有横滚，仍加重理解，W01 P2保留。240–330分钟比蓝图120–165增加120–165，比H23增加10–20；环境另计。停点只是教学设计，不能声称实测减负。

Renderer12通过；实际React/CSS与Chrome1440/390/320三宽交互通过，42次完整复制、键盘折叠、原图、长答案、横滚和静态页检查。作者视觉样本另存hash；此证据不证明Harness产品Web或真实学习体验。

## 保护、交接与停止

H21–H24跨课一致性见[knowledge-bridge](knowledge-bridge.md)。新增默认退出P1单列交接，不修改H23历史报告。H25只交插件导出/注入/注销/证据前置。第六模块准备包含12类材料及16图索引，不执行正式审查。

起点保护5294个非H24文件（含21个output文件、H01–H23、五模块审查和用户改动）；最终逐文件/状态核验见[validation](evidence/validation.json)及提交后核验。仅两个H24目录暂存/提交；不改发布、路由、数据库、价格、权益或线上业务，不访问真实Session/Profile/凭据。不自动H25、不正式审查、不发布。

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
