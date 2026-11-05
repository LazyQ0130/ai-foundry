from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';Q=R/'module-six-review-prep';Q.mkdir(exist_ok=True)
def write(name,s):
 p=R/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s.strip()+'\n',encoding='utf-8')
if (R/'p1-windows-sdk-http-exit/evidence/gate-decision.json').exists():raise SystemExit('Historical H24 generator: preserve appended P1 revalidation; use the专项 scripts instead of overwriting current reports.')
metrics=json.loads((E/'content-check.json').read_text())['metrics'];b=json.loads((E/'workspace-before.json').read_text());source=json.loads((E/'source-check.json').read_text());v=json.loads((E/'visual-qa.json').read_text())
write('README.md','''# H24｜大型 Agent 系统测试与综合架构分析

正式蓝图：为一条跨模块链建立事实、测试与限制的证据矩阵。固定源码 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，研发基线 H23 `4d68013`。本轮仅H24及第六模块审查准备，未发布。

**作者侧总体 NO-GO：默认 SDK+HTTP 子进程退出在本机仍有P1原生断言。** 当前23项C9/D14与X均通过，使用公开的运行时测试退出钩子，不能覆盖默认exit分支。完整发行Profile/E、产品Web、真实Provider、性能成本、学员与外审分别未验证。学习负担P2继续保留。

- [教材源码](../../../course-content/internal/deepseek-harness/h24/lesson.md)（仓库内实际路径见下方；该相对展示不用于发布）
- [私有阅读预览](reading-preview.html)：实际LessonMarkdown SSR；折叠可展开，静态页用选择复制，React复制另测。
- [质量报告](quality-review.md)、[证据矩阵](coverage-matrix.md)、[50条固定源码断言](source-checklist.md)。
- [准备与蓝图门禁](preparation.md)、[跨课一致性](knowledge-bridge.md)、[差异/失败与修订](discrepancies.md)、[H25前置交接](h25-handoff.md)。
- [四张SVG源图](figures/source/)、[PNG](figures/)、[Renderer报告](renderer-regression.md)。
- [第六模块审查准备包](module-six-review-prep/README.md)：只有准备材料，非正式审查结论。

教材实际位置：`course-content/internal/deepseek-harness/h24/lesson.md`；可运行实践位于其相邻`lab/`，四项A–D、P补充与X，14份完整程序在正文逐字同步。15道折叠思考含答案、推导、误区、Rubric、知识点，8题明确配置/事件/证据推导。

```powershell
node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h24/scripts/run-labs.mjs X
node docs/deepseek-harness-v2/h24/scripts/run-checks.mjs content
node docs/deepseek-harness-v2/h24/scripts/run-checks.mjs renderer
node docs/deepseek-harness-v2/h24/scripts/run-checks.mjs visual
```

先读preparation的固定源和依赖锚点。命令从AI Foundry根执行；不在这里运行官方仓库build。原始run/stdout/stderr/trace/程序hash保留，失败不自动Record/Refresh。目录保留，端口/进程必须释放。范围保护以[evidence/validation.json](evidence/validation.json)及提交后检查为准；只提交两个H24目录。
''')
write('preparation.md','''# H24 正式蓝图门禁与准备

第一步在本轮完整读本地30讲蓝图3280行，按顺序分段显示，仅省略重复GitHub URL文字；不是用暂题或上一课交接代替。全部30讲标题/唯一目标和输入SHA256在[preparation-inputs](evidence/preparation-inputs.json)。研发基线4d6801324b5c19f1e8800a2be60dd80360b21314。

| 门禁 | 结论 |
| --- | --- |
| 正式H24 | 《大型 Agent 系统测试与综合架构分析》 |
| 唯一核心目标 | 为一条跨模块链建立事实、测试与限制的证据矩阵 |
| 范围 | 合同回归、属性不变量、snapshot/replay、benchmark的证据边界；真实加载、外部事实、故障和验收矩阵 |
| 第六模块H21–H24 | 蓝图依赖图称“协作与综合证据”；从Activation所有权、任务抽象到控制/订阅，再收束证据矩阵 |
| 硬门禁 | 越权0、未批准写入0、取消后新动作0、虚报验证0；P0/P1不能条件通过 |
| H25边界 | 《自己编写一个 Cordis 插件》：重复挂载/卸载纯插件；仅交前置，不实现下一课 |
| H29/H30边界 | 可观测性归因和工程CI深挖留后续；本课只保留验收所需诊断/资源条件 |
| 集中审查前置 | 四课完整交付、技术依赖/术语、16图、逐项真实/Mock证据、最高等级、P2/开放问题、建议场景与输入身份 |

已读第一至第五模块集中报告和E/v1及逐模块有效增补，H21–H23正文/答案、质量、实验与H23→H24交接；实验在当前连续研发上下文阅读并核关键实现。本轮补读H03/H04/H08/H09–10/H13–20的依赖段落。输入哈希不能代替语义阅读，也不是独立第二审稿人的签署。当前较短默认主线不要求学员读遍全部源码。

固定源码先核全部请求路径，结果均存在，见[requested-paths](evidence/requested-paths.json)。官方testing.zh.md、test-support README及Loader Smoke/Testkit/Replay/Mock Server/Snapshot/Client Runtime/Remote Mock，真实CLI/AppBoot与Bundle、SDK/Gateway/Controller/Connection/UI/Trajectory、OTel/Feedback及官方场景均按相关分支研究。上游测试定位/选读，没有执行其递归清理套件。本轮采用当前真实运行工具和固定源码，未改上游源码。

## 运行环境与八棵依赖树

作者Windows10.0.26300，Node24.16.0。runner核固定源Git blob及运行前SHA256；再核每棵npm锁里所有直接/传递包name/version/integrity对固定pnpm-lock。不是只核顶层版本。源码默认`C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，可由HARNESS_SOURCE_CACHE覆盖；Git校验缓存可由HARNESS_GIT_CACHE覆盖。

| 环境变量 | 作者锚点（均在C:/Users/QYF/.codex/research/） | 主要包 |
| --- | --- | --- |
| H24_DEPS_ANCHOR | h04-probe-deps/node_modules/commander/index.js | commander15.0.0、ajv8.20.0、js-yaml4.3.2、resolve.exports2.0.3等 |
| H24_ZOD_ANCHOR | h09-probe-deps/node_modules/zod/index.js | zod4.4.3 |
| H24_NATIVE_ANCHOR | module-four-probe-deps/node_modules/koffi/index.js | koffi3.1.1、chokidar5.0.0、yaml2.9.0等 |
| H24_LIMIT_ANCHOR | h18-persistence-deps/node_modules/p-limit/index.js | p-limit7.3.3、Temporal polyfill0.5.1等 |
| H24_PTC_ANCHOR | h22-ptc-deps/node_modules/acorn/dist/acorn.js | acorn8.18.0、acorn-walk8.3.5、birpc4.2.0 |
| H24_WIRE_ANCHOR | h23-wire-deps/node_modules/ws/index.js | ws8.21.3、eventsource-parser3.1.0等 |
| H24_TEST_ANCHOR | h24-fixed-test-deps/node_modules/execa/index.js | execa10.0.1、tsx4.23.13、fast-check4.9.0；锁定pretty-ms/pure-rand/yoctocolors |
| H24_HTTP_ANCHOR | h24-http-deps/node_modules/undici/index.js | undici7.29.1 |

完整8棵package.json/package-lock副本见[evidence/dependency-manifests](evidence/dependency-manifests/)，核验见[dependencies](evidence/dependencies.json)。他机需在**各自全新的空目录**按锁清单准备，再设置锚点；若目录已有node_modules则停止，不能用npm ci或其他操作批量清理。缺依赖要修准备环境，不能跳过预检。native包还需对应平台产物；不承诺跨平台即装即用。

依赖准备曾在另一个新作者缓存h24-test-deps中原地更正三个漂移传递包，npm控制台报告3 added/3 removed。该替换操作不符合本任务对批量删除的保守约束；没有执行删除shell命令，没有触及受保护文件。原控制台存在但未伪造历史raw日志，操作在[dependency-install](evidence/dependency-install.json)如实登记。之后改为全新h24-fixed-test-deps精确锁定，仅一次新增23包；旧缓存保留，新增HTTP树独立。不能写“绝无任何包替换”。

隔离Home/Profile/workspace/JSONL、白名单环境、恒定虚构任务、dummy key、本地HTTP动态端口。Loader Smoke传cwd，所有目录/原始记录保留；关闭客户端、dispatcher和Mock Server后等真实退出与端口复用。不碰真实用户Session/Profile/凭据、output和线上业务；不上传遥测。

三个停点60–80/70–100/110–150分钟，共240–330。蓝图120–165，差额120–165；H23估230–310，本课再增10–20。W01 P2持续，环境时间另计；学员实际时间/效果未测。
''')
write('knowledge-bridge.md','''# H01–H24 跨课技术一致性

作者按前课正文/实验/质量核对，不改H01–H23。历史测试不累计到23项新测试；此表不是第六模块正式集中审查。

| 依赖 | 沿用准确边界 | H24具体证据/限制 | 判断 |
| --- | --- | --- | --- |
| H03请求链 | 输入→Inbox→Turn/Step→模型/工具→下一请求 | B1/X实际下一模型输入含工具结果，关闭后新Session前缀相等 | 一致 |
| H04/H08 Profile/Loader | Bundle/Patch选择组合，服务可用驱动激活，config整体替换 | A核心YAML+真实loadProfileDirectory/boot；ACTIVE核验，非发行完整Profile | 一致；H24比H23 prepare挂核心更强但仍D |
| H09/H10 Agent生命周期 | Registry/Factory/Handle所有权；idle非任务成功 | D3实际Turn error但driver exit0，D5关闭等结算 | 一致 |
| H13工具 | 声明/可见/执行与结果分开 | 真实Tools/Native、CallId关联；P1无效/拒绝body0 | 一致，40样本不等穷尽 |
| H14/H15权限/沙箱 | 模型提议非授权，Scope不是OS隔离 | D4 guard与窄常量工具；未装完整产品审批/沙箱 | 一致，不宣称安全认证 |
| H16组合 | 同功能按实际Profile启用，不凭包名推完整能力 | 作者核心Profile与base/sdk-minimal/Web独列 | 一致 |
| H17事件 | Session事实与Surface/Projection分开；实时通知不代日志 | B真实规范化，X deriveMessages比较，Trajectory仅静态诊断视图 | 一致 |
| H18持久化 | flush/close/新实例/新PID/崩溃分层 | C2新PID正常Resume；X关writer后新Session，非崩溃/断电 | 一致 |
| H19压缩和成本 | 原始事实与短模型视图分开，模拟token非真实节费 | 本课没有缓存收益/收费测试，仍未验证 | 一致 |
| H20重试取消 | Provider策略所有者，取消信号≠停稳 | D7超上限委派，D1 429恢复，D5门闩关闭/aborted/无工具 | 一致；未重测全部未知外部副作用 |
| H21委派 | activation/childId/runId/parent/caller、冷恢复边界分别核 | 以历史H21证据交接，不在X堆无关子级；C2不是子级跨进程冷续跑 | 一致，未验证保持 |
| H22任务抽象 | WorkflowRun/Job内存活动、Goal/Schedule记录与业务效果不同 | 模块准备图分别画，H24不声称四者全量集成通过 | 一致 |
| H23载体 | 接纳/完成、Web/SDK、Generation/Seq/revision、持有者关闭分开 | C真实stdio，P2 TestRemote而非产品Web；新增默认SDK+HTTP退出P1 | 新场景风险向审查包交接，不篡改H23历史结论 |

新增P1只在当前作者源组合+Windows/Node24.16.0 SDK/HTTP场景复现，不能凭它断言所有发行版或H23已测场景都失败；也不能因H23此前条件通过而忽略新场景。默认退出分支须独立诊断并在相应真实入口补验。
''')
write('discrepancies.md','''# 失败、差异与修订记录

所有run/traces保留；当前绿色结果不删除初始失败、不缩小等级定义、不修改官方固定源码。

| 发现 | 处理/证据 | 当前状态 |
| --- | --- | --- |
| Loader Smoke README对inspect描述较宽 | 实现只在exit码符合预期后inspect；外层保存原始stdout/stderr/exit | 已按实现教学，非全失败回调保证 |
| AppBoot settled不等全部核心ACTIVE | 官方必需ID审查有限；作者夹具显式要求自己的所有核心行ACTIVE | A2三个反例通过 |
| 首次lib路径Windows分隔符比较不当 | 比较时规范化分隔符；保留plain Node实际缺产物错误 | 反例PASS，lib正向NOT_RUN |
| 初版作者Schema误用普通JSON Schema思路 | 按真实author DSL逐属性required与对象additionalProperties | 正向工具和P1合同通过 |
| Windows嵌套JSON cwd/旧UUID规范化 | 官方typed redaction后preserve，显式escaped cwd alias | B1/B2通过 |
| 新作者Fixture CRLF与官方LF不同 | 保留初审与原始字节base64，明确EOL修订，.gitattributes仅限本课fixture | 未Record/Refresh；后续字节不可变 |
| 属性测试只挂Tools导致缺SystemPrompt依赖 | 使用官方mountAgentLoopTestDependencies，仍不挂Loop | P1 40样本通过，不升D |
| Retry-After配置1ms在线上变成1秒 | 先保留超1ms上限负例；正向明确接受1000ms | D7/D1均通过，非无限重试 |
| 默认SDK+HTTP关闭后原生断言 | 两个PID相同失败；close header和owned dispatcher均未解决；不将异常退出改为期望0 | OPEN P1，整体NO-GO |
| 支持的runtime exit测试钩子自然退出 | 显式作者sdk-plugin采用exitCode/stdin.pause，完整23项与X过 | 仅该测试配置通过，不关闭默认分支问题 |
| 初始npm传递包漂移及原地替换 | 3 added/3 removed如实登记；后续使用全新精确锁树，旧缓存保留 | 操作偏差披露；受保护项目无变化 |

## 尚未闭合的默认退出

[default-exit-failure.json](evidence/default-exit-failure.json)列原始trace、两个PID、实际退出码3221226505（0xC0000409）及`UV_HANDLE_CLOSING`断言。JSON-RPC shutdown响应已出现，实际退出仍非0，故不能以响应或文本验收。归因尚限于作者源码组合/平台，未证实上游发行应用普遍缺陷。

当前core实践使用官方允许的运行时钩子且正常释放；它使教材练习可复现，但不是默认生产分支的修复。闭合要求独立最小复现、Node/HTTP/退出所有权诊断、默认exit0及对应产品入口回归；本轮不修改固定上游代码，不为课程扩大研究到发布或重做H23。

Snapshot复核在baseline-review、baseline-review-initial与baseline-eol-correction中，初始候选和全部失败原始run保留。未因红灯自动重录全部基线。
''')
write('h25-handoff.md','''# H24 → H25 前置交接

正式H25《自己编写一个 Cordis 插件》，唯一目标：验证一个可重复挂载/卸载的纯插件。这里仅交前置，不创建H25正文、程序、发布记录或审查。

学员应交：具名name/inject/Config/apply与正确导出；Loader.unwrapExports正反守卫；服务声明和调用拓扑；effect/disposer配对与HMR注销；小组件合同和局部组合的等级；独立外部事实及失败证据；四项硬门禁和有范围的验收矩阵。H24只提供这些准入知识，不要求下一课接真实Provider、产品Web或计费。

不得继承为既成保证：完整发行Profile/E、默认SDK+HTTP退出兼容性、所有历史格式、全部审批/沙箱路径、真实Provider质量和费用、真实浏览器产品行为。默认退出P1、学习负担P2和学员/外审缺口须带入后续课程治理，不由H25纯插件测试冲销。

第六模块集中审查准备包已生成，但没有正式审查结论。继续H25前由课程负责人决定审查与P1补验安排；本轮到H24停止。
''')
write('renderer-regression.md',f'''# H24 Renderer 与阅读交互

原有Renderer测试12/12，fail0，原始TAP见[evidence/renderer-regression.txt](evidence/renderer-regression.txt)。未修改Renderer或用户组件；验证使用工作区现有组件与平台CSS。

真实LessonMarkdown React挂载在临时localhost，Chrome headless检查1440/390/320三宽：页面无横向溢出、单h1、四图lazy实际加载、图注/alt/原图可打开、默认折叠及所有折叠键盘开关、代码容器横滚、14份完整程序复制42次逐字LF规范化匹配、15思考展开、A及综合长答案完整截图、静态HTML无伪复制按钮。静态阅读页实际SSR与正文一致。

四图保留SVG/PNG/生成脚本，几何和字体检查通过；图上真实/Mock/未验证分色，最小辅助字约{min(x['minimumFigureTextPx'] for x in v['viewports']):.2f}px，可打开原图。最终视觉样本与hash在[manual-review](evidence/manual-review.json)，作者实际看图；几何不替代语义，更多设备/低视力舒适性待试读。

这是真实浏览器的**教材Renderer**测试。未打开或验证Harness产品Web、登录态、真实Host/Connection/WebSocket/远程权限，因此不得计为产品Web或E。
''')
write('quality-review.md',f'''# H24 作者侧质量报告

2026-11-05。正式《大型 Agent 系统测试与综合架构分析》，固定源码f3803c96974ad4a94195fb97e5c637e9c2a3afe3，研发基线4d68013。**总体结论：NO-GO。** 内容和受控实践已形成可审阅交付；默认SDK+HTTP退出在当前Windows/Node24.16.0源组合仍有已确认P1兼容性阻断。测试钩子分支的通过不得把总体改为CONDITIONAL GO。当前是作者自审，不冒称独立外审。

| 必须分别评价的维度 | 结论 | 实际范围/限制 |
| --- | --- | --- |
| 教学内容质量 | GO（作者编辑范围） | 正式蓝图目标，四图/四实践+X，15思考含8推导，五文件精读/三段停点；教学实效未测 |
| 官方源码准确性 | GO（固定分支作者审阅） | 50项实现/配置结论与引用；官方测试仅定位/选读；{source['files']}文件Git blob/SHA256只证身份 |
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

默认正文{metrics['defaultBodyCjk']}汉字/全部{metrics['allBodyCjk']}（不含代码/URL）；{metrics['codeBlocks']}代码块{metrics['codeLines']}行、37折叠、14完整程序、4图、4实践+1综合、15思考。长单行辅助程序有横滚，仍加重理解，W01 P2保留。240–330分钟比蓝图120–165增加120–165，比H23增加10–20；环境另计。停点只是教学设计，不能声称实测减负。

Renderer12通过；实际React/CSS与Chrome1440/390/320三宽交互通过，42次完整复制、键盘折叠、原图、长答案、横滚和静态页检查。作者视觉样本另存hash；此证据不证明Harness产品Web或真实学习体验。

## 保护、交接与停止

H21–H24跨课一致性见[knowledge-bridge](knowledge-bridge.md)。新增默认退出P1单列交接，不修改H23历史报告。H25只交插件导出/注入/注销/证据前置。第六模块准备包含12类材料及16图索引，不执行正式审查。

起点保护{len(b['files'])}个非H24文件（含21个output文件、H01–H23、五模块审查和用户改动）；最终逐文件/状态核验见[validation](evidence/validation.json)及提交后核验。仅两个H24目录暂存/提交；不改发布、路由、数据库、价格、权益或线上业务，不访问真实Session/Profile/凭据。不自动H25、不正式审查、不发布。
''')
write('module-six-review-prep/README.md','''# 第六模块集中审查准备包

**只准备，未开展正式集中审查。** 四课标题/顺序照30讲蓝图；历史作者结论不等独立模块审查结论。当前H24总体NO-GO，开放P1优先处置，不能被H21–H23条件通过抵消。

1. [知识依赖矩阵](knowledge-dependencies.md)
2. [Subagent / Workflow / Jobs / Goal / Schedule架构](architecture.md)
3. [CLI / Web / SDK及完整链衔接](client-chain.md)
4. [四课测试证据索引](evidence-index.md)
5. [真实/Mock/未验证矩阵](capability-matrix.md)
6. [最高集成等级](integration-level.md)
7. [16张核心图索引](figure-index.md)
8. [术语一致性及待审问题](terminology.md)
9. [学习负担P2](workload.md)
10. [开放问题与风险](risks.md)
11. [H25前置知识](h25-prerequisites.md)
12. [建议议程与场景](review-plan.md)

输入身份在上级evidence/preparation-inputs.json；四课历史报告/测试引用原始路径，不改或重新汇总成“独立N场景”。准备图/议程是作者整理，不是审查执行记录或签署。
''')
write('module-six-review-prep/knowledge-dependencies.md','''# H21–H24知识依赖

| 正式课 | 唯一核心目标 | 上游输入 → 本课输出 | 下一课使用 |
| --- | --- | --- | --- |
| H21 Subagent、任务委派与多智能体协作 | 用activation的所有权和delivery区分新建、Fork与外部执行 | H09/H18/H20生命周期/持久/取消 → childId/runId、Parent/Caller、Scope/历史 | H22按工作所有者组合 |
| H22 Workflow、Jobs、Goal 与任务调度 | 根据生命周期选择四种任务抽象，并画清它们的组合 | H21 Activation → WorkflowRun、Job、Goal、Schedule的状态/预算/取消 | H23控制者不混淆运行状态 |
| H23 CLI、Web UI、SDK 与远程通信 | 追踪一个控制动作与一条状态订阅穿过载体边界 | H04/H17/H21–22 → 载体、请求/通知、代际/历史、关闭 | H24按各入口取证 |
| H24 大型 Agent 系统测试与综合架构分析 | 为一条跨模块链建立事实、测试与限制的证据矩阵 | H01–23 + Mock/故障注入 → 合同/属性/回放/外部事实/等级/剩余风险 | H25纯插件测试与后续专项 |

全模块收束是“协作与综合证据”，不是把五种工作抽象串成一条必经链。H24新增作者核心YAML与HTTP故障组合，但没有重新运行全部H21/H22机制；历史证据身份必须保留。
''')
write('module-six-review-prep/architecture.md','''# 架构与所有权图（供审查）

下图是条件组合关系，非一条每次都走的调用链；来源为固定源码及H21/H22正文。未因画图而新增全模块动态证据。

```mermaid
flowchart TD
  A[父 Agent / Session / Scope] -->|显式委派| S[Subagent Runtime / Manager]
  S -->|按名选择| P[Spawn / Fork / 外部 Provider]
  P --> V[Activation：childId / runId / result / dispose]
  W[Workflow Engine：脚本与依赖图] -->|持有一次执行| R[WorkflowRun：进程内活动]
  R -->|可使用| S
  R -->|可拥有| J[Job / 受管进程或后台活动]
  G[Goal：目标状态与预算] -->|按策略决定继续工作| A
  T[Schedule：持久计划和触发] -->|触发不等业务完成| A
  V -->|已定义事实/交付| H[各自 Session 与父交付]
  R -->|执行/结果/日志按通道| H
  J -->|通知/记录不复活旧进程| H
  H --> D[JSONL / Projection / 查询]
```

Activation区分Parent/Caller，childId可跨执行期而runId更新；Fork继承已完成前缀而非未来。Workflow依赖边不是父子树；前台聚合等待不等异步Parent回执。Job/WorkflowRun不因读日志跨重启复活，Goal/Schedule的持久状态也不等所有外部效果已发生。取消责任沿显式持有关系传播，不能由关闭Client推出任意后台进程树已结束。

审查时分别画Registry owner、调用者和Session lineage；检查父取消、晚发布Activation和进程done/result/释放几个终点。只读图不能替代实际门闩/文件/进程证据。
''')
write('module-six-review-prep/client-chain.md','''# 载体与完整运行链衔接

```mermaid
flowchart LR
  C[CLI 启动器] --> P[Profile / Bundle / Patch]
  P --> L[Loader / AppBoot]
  L --> D[领域能力：Loop / Tools / Session]
  W[Web Client] -->|Connection / Host / Gateway| S[SessionController]
  S --> D
  K[SDK Client] -->|独立进程 stdio JSON-RPC| B[SDK Server]
  B --> D
  A[ACP 客户端] -->|独立 ACP 协议| O[ACP Server]
  O --> D
  D --> H[持久事实 / JSONL]
  D --> R[实时 Agent / Assistant 更新]
  H --> Q[历史查询 / 投影]
```

H23沿控制去程和状态回程取局部证据；H24加强真实作者YAML、HTTP故障及关闭后重建。CLI启动器不是TUI；SDK与Web协议、权限、身份机制独立，图中箭头不保证启用了同一套工具。

完整验收仍需实际已交付Profile与lib入口，Web真实浏览器和Host权限，ACP真实请求/语义事件等分别补验。H24只跑作者SDK/核心链，不把图上的全部节点标为已执行。默认SDK+HTTP退出P1在跨载体审查中必须先处理。
''')
write('module-six-review-prep/evidence-index.md','''# 四课测试证据索引

| 课/历史独立提交 | 固定行为项 | 原始身份/报告 | 本轮使用方式 |
| --- | --- | --- | --- |
| H21 / 8ad7786 | 21=C8/D13 | [quality](../../h21/quality-review.md)、[lab-results](../../h21/evidence/lab-results.json)、[test-grades](../../h21/evidence/test-index.json) | 引用原始证据，未在H24重跑全部 |
| H22 / 21ab93a | 23=C19/D4 | [quality](../../h22/quality-review.md)、[lab-results](../../h22/evidence/lab-results.json)、[test-grades](../../h22/evidence/test-grades.json) | 同上，PTC/Job/Goal/Schedule范围分问 |
| H23 / 4d68013 | 25=C7/D18 | [quality](../../h23/quality-review.md)、[lab-results](../../h23/evidence/lab-results.json)、[test-grades](../../h23/evidence/test-grades.json) | 作者prepare核心/Profile局部，不变成发行E |
| H24 / 本次提交 | 23=C9/D14 | [quality](../quality-review.md)、[lab-results](../evidence/lab-results.json)、[test-grades](../evidence/test-grades.json)、[X](../evidence/trace-X.json) | 真实核心YAML/Replay/HTTP/SDK故障；退出测试钩子限定 |

92个TAP身份的算术和不能称92个独立行为场景：跨课重叠、参数化、X复用、重复执行和属性样本逐项保留。每课12项Renderer同样是已有套件重跑，不能合并成48种新Renderer能力。H24另重跑M1–M6原教学24A，不加C/D。

当前H24默认退出原始失败见[default-exit-failure](../evidence/default-exit-failure.json)。绿色最终记录与红色历史必须同时交审，不能只挑最终TAP。所有四课固定官方Commit相同，输入/图hash在上级evidence中。
''')
write('module-six-review-prep/capability-matrix.md','''# 真实组件、Mock与未验证能力

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
''')
write('module-six-review-prep/integration-level.md','''# 实际最高集成等级

四课实际最高均D。H24综合链是：真实SDK Client进程→作者源入口→loadProfileDirectory/AppBoot/Loader加载核心YAML→真实LLMRuntime/DeepSeek Messages Adapter→官方回环Mock Server→Retry/Loop/Tools→安全工具真实文件→Session/JSONL→关闭→新Session推导消息。使用官方测试exit钩子。

完整发行Profile、正式lib/package exports/普通Node入口正向均未通过实际运行；产品Web、ACP和真实Provider分别未验证。因此**没有E证据**，不把完整“作者核心”改名为完整“应用”来升级。

若以后运行完整交付Profile和真实入口，无密钥E可以成立，但仍需标Keyless Mock Provider；真实Provider/互联网E2E、产品Web浏览器、真实计费各自独立。当前默认SDK+HTTP exit P1阻断，不因D数量多而准入。
''')
figures=json.loads((E/'module-six-figures.json').read_text());s='# 16张核心教学图索引\n\n4课各4张，保持历史文件原样；本轮新增H24四图。下面文件身份的完整SHA256见[证据JSON](../evidence/module-six-figures.json)。作者H24三宽实看不代替对全部历史图重新集中审查。\n\n| 图 | 源 / PNG | 教学作用 |\n| --- | --- | --- |\n'
for f in figures:
 src='../../'+f['source'].split('docs/deepseek-harness-v2/')[1];img='../../'+f['image'].split('docs/deepseek-harness-v2/')[1]
 s+=f"| {f['lesson']} / {f['id']} | [SVG]({src}) / [PNG]({img}) | {f['caption']} |\n"
write('module-six-review-prep/figure-index.md',s)
write('module-six-review-prep/terminology.md','''# 术语一致性与待审问题

| 词/易混对象 | 四课统一读法 | 审查重点 |
| --- | --- | --- |
| childId / runId / Activation | 稳定子级身份、一次执行配对、句柄生命周期分别核 | 冷继续不能复活旧实例或旧dispose权限 |
| Parent / Caller delivery | 异步回执/通知与等待结果两种交付 | Workflow前台聚合不能冒用Parent工具时序 |
| 工作流依赖图 / 父子树 | A∥B→C数据依赖不是父子关系 | 预算/取消所有者独列 |
| WorkflowRun / Job / Goal / Schedule | 运行活动、后台工作、目标状态、计划触发不同 | “持久任务”笼统词需逐项拆解 |
| accepted / idle / task success | 输入接纳、运行边界、业务验收不同 | D3 exit0但Turn error，D4模型虚报 |
| live event / EventLog / raw Result / Trajectory | 实时观察、已记录事实、可选原始结果、派生视图 | 不由视图缺失推未执行 |
| Generation / revision / Seq / Attempt | 连接代际、实时帧、事件位置、模型尝试 | 不跨命名空间相等比较 |
| Profile / core fixture / shipped app | 配置组合、作者局部、完整交付入口 | H23 prepare与H24 YAML差异应保留；均未E |
| E keyless / real Provider E2E | 完整应用范围与外部模型环境两维 | 不用一个“端到端”抹平差异 |
| cancel / idle / dispose / close / exit | 控制、排空、所有权释放、通道关闭、进程退出 | SDK shutdown响应非最终进程证据 |

作者核对未发现需立即改动H21–H23正文的已证术语冲突；这不是“术语无问题”的独立审查结论。开放问题：所有“恢复”是否明示新Context/新Agent/新PID；所有“完整”是否误指作者核心；默认退出P1是否影响此前更宽措辞，需独立外审逐段核查。
''')
write('module-six-review-prep/workload.md',f'''# 学习负担W01 P2持续

| 课 | 作者预计分钟 | 状态 |
| --- | --- | --- |
| H21 | 180–250 | 5核心文件，长生命周期夹具，未学员实测 |
| H22 | 210–290 | 多任务抽象/PTC/预算与取消，未学员实测 |
| H23 | 230–310 | 双载体/协议与13完整程序，未学员实测 |
| H24 | 240–330 | 5核心文件、默认{metrics['defaultBodyCjk']}/全部{metrics['allBodyCjk']}汉字、14完整程序、15思考 |

估计算术总和860–1180分钟（14小时20分–19小时40分），不含环境准备；并非观察到的模块学习时间。H24蓝图120–165，差额120–165。四课默认/展开文字、代码和长单行横滚都需试读评估，不能宣称已减负。

H24先入口→最小Smoke→Snapshot→客户端/故障→矩阵，三段停点60–80/70–100/110–150。复杂协议、压缩格式、OTel和benchmark折叠；关键权限/退出/等级条件保留主线。建议正式审查安排目标学员无提示重现、记录各停点时间/错误/求助/迁移题；当前没有学员数据，不设置虚构完成率目标。
''')
write('module-six-review-prep/risks.md','''# 未解决问题与风险清单

| ID/优先级 | 当前事实 | 闭合证据/建议所有者 |
| --- | --- | --- |
| EXIT P1 | 默认SDK+真实HTTP Mock场景两PID原生断言，当前钩子通过未修默认路径 | Runtime/Windows维护者独立最小复现与默认exit0回归；必要时验证兼容Node/发行入口 |
| W01 P2 | 四课作者预计时长高于原蓝图，长单行/多抽象并存 | 教学负责人安排目标学员计时与迁移任务，改稿后再试 |
| E-gap | 四课最高D，无完整发行Profile/built正向 | 应用验收负责人准备独立固定仓库与合法清理，补各真实入口 |
| WEB-gap | H23受控载体、H24仅TestRemote；无产品浏览器 | Web负责人运行官方built/Host/Chromium场景与权限/重连/错误证据 |
| PROVIDER-gap | 全部模型受控，无真实API/计费 | Provider负责人经授权用隔离账户另验，不上传用户Session |
| PERFORMANCE-gap | 无built benchmark/真实分布/成本/缓存收益 | 性能负责人记录环境/预热/样本/原数据，不从功能duration推收益 |
| REVIEW-gap | 当前单作者，模块正式审查未开展 | 独立技术/教学审稿人签署有范围结论 |
| OPS deviation | 新作者缓存内npm曾替换3个漂移传递包 | 已披露，后续新目录精确锁；不重复原地操作，不触碰保护文件 |

P0/P1不得条件通过；其余缺口能否接受要按明确申请范围判断。本文只整理风险，没有擅自指定外部人员或发送消息，也没有开始正式审查。
''')
write('module-six-review-prep/h25-prerequisites.md','''# H25前置知识

H25正式《自己编写一个 Cordis 插件》，目标为纯插件可重复挂载/卸载。进入前应能：正确具名导出与inject/Config/apply；说明Service与Fiber归属；用effect清理注册/订阅；通过真实Loader检查导出；编写拒绝/释放合同；把组件测试与完整应用分开；保留不变Fixture、外部事实和剩余风险。

这里仅引用[上级H25交接](../h25-handoff.md)，没有实现插件课程。默认退出P1不因未来纯插件测试通过而闭合；H29观测深挖/H30交付CI仍留在原顺序。
''')
write('module-six-review-prep/review-plan.md','''# 集中审查建议（尚未执行）

建议先做输入身份与P1门禁，再做跨课技术/教学审读，最后施测迁移；当前没有发出审查结论或签署。

| 建议场景 | 应交独立证据 | 不可替代 |
| --- | --- | --- |
| H21晚发布/冷继续/旧dispose | exact Agent/Activation、runId、父子日志、释放顺序 | 目录记录不等活对象 |
| H22 A∥B→C、Job done但资源未释 | 依赖/父子两图、门闩/预算/实际进程 | “done”文字不等停稳 |
| H23 accepted/通知/Resume/迟到回答 | 协议帧、持久事实、新PID/权限拒绝 | SDK不替产品Web |
| H24错误导出/缺服务 | 真实YAML/Loader、非零退出、无写入 | 手动ctx.plugin不替实际加载 |
| H24 Snapshot错预期 | 原字节/sidecar/workspace diff，恢复正确预期 | 不能Record/Refresh冲绿 |
| H24默认退出P1 | 两个原失败+独立最小复现+默认exit0补验 | 测试钩子不替默认分支 |
| 跨课未知外部效果/取消 | 独立文件/业务状态、ToolCallId、排空/关闭 | 无Result不等未执行，不盲重做 |
| 产品门禁与实学 | 正式lib/Profile/Web/Provider各列；目标学员无提示计时/迁移；独立审稿签署 | 作者测试/教材截图不替E或教学效果 |

验收矩阵每行需功能要求、入口、真实组件、Mock、环境、步骤、预期、实际、原始证据、等级、剩余风险。四项硬门禁均0；确认P0/P1先NO-GO。若无阻断且范围内证据齐备再讨论GO；仅可接受限制才讨论CONDITIONAL GO。建议不等实际开展，本轮在准备包完成后停止。
''')
print('Core author reports and twelve-category module-six review preparation package generated')
