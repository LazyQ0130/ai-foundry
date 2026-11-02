from pathlib import Path
import json,hashlib,re,datetime
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda n:json.loads((E/n).read_text(encoding='utf-8'))
def put(n,s):(R/n).write_text(s.strip()+'\n',encoding='utf-8')
labs=load('lab-results.json');content=load('content-check.json');visual=load('visual-qa.json');lock=load('source-lock.json');m=content['metrics'];out=load('practice-output.json');d=out['D_files'];before=load('workspace-before.json')
assert labs['tests']==31 and len(load('source-assertions.json'))==52
# 已实际查看：四图×三宽度，三份展开答案，320首屏与代码展开。
samples=[f'figures/qa/h15-0{i}-{w}.png' for w in [1440,390,320] for i in range(1,5)]+[f'figures/qa/answer-{w}.png' for w in [1440,390,320]]+['figures/qa/static-intro-320.png','figures/qa/lab-open-320.png']
manual={'status':'PASS_AUTHOR_VISUAL_REVIEW','reviewer':'author agent; not independent review','method':'Viewed each final PNG through view_image; checked labels, borders, arrows, captions, 320 wrapping, code overflow containment; no learner trial','samples':[{'path':p,'sha256':sha(R/p)} for p in samples],'minimumFigureTextAt320':next(v for v in visual['viewports'] if v['width']==320)['minimumFigureTextPx'],'notes':['17 final screenshots inspected','No clipping or label overlap observed','320 figure labels smaller than prose; originals available and popup tested','Live copy status visible; static preview removes inert copy buttons']}
(E/'manual-review.json').write_text(json.dumps(manual,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
inputs=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md','docs/deepseek-harness-v2/module-one-review/production-standard-v1.md','docs/deepseek-harness-v2/module-two-review/production-standard-module-two-addendum.md','docs/deepseek-harness-v2/module-three-review/production-standard-module-three-addendum.md']
inputs += ['docs/deepseek-harness-v2/module-one-review/README.md','docs/deepseek-harness-v2/module-one-review/source-review.md','docs/deepseek-harness-v2/module-two-review/README.md','docs/deepseek-harness-v2/module-two-review/technical-review.md','docs/deepseek-harness-v2/module-three-review/review-report.md']
inputs += [f'course-content/internal/deepseek-harness/h{x:02}/lesson.md' for x in [5,6,7,8,10,13,14]]
inputs += ['docs/deepseek-harness-v2/h14/quality-review.md','docs/deepseek-harness-v2/h14/h15-handoff.md']
(E/'preparation-inputs.json').write_text(json.dumps({'scope':'30-lesson blueprint, all current standards and module reports read in this chat; H05–H08 relevant plugin/service/event/lifecycle sections; H10/H13/H14; H15/H16/H20 blueprint and H14 handoff revisited. Hashes identify versions, not proof of reading.','files':[{'path':p,'sha256':sha(P/p)} for p in inputs]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name,src in [('SOURCE-LICENSE.txt',P/'docs/deepseek-harness-v2/h14/SOURCE-LICENSE.txt'),('CORDIS-LICENSE.txt',P/'docs/deepseek-harness-v2/h14/CORDIS-LICENSE.txt'),('ZOD-LICENSE.txt',P/'docs/deepseek-harness-v2/h14/ZOD-LICENSE.txt'),('CHOKIDAR-LICENSE.txt',Path('C:/Users/QYF/.codex/research/h15-probe-deps/node_modules/chokidar/LICENSE')),('KOFFI-LICENSE.txt',Path('C:/Users/QYF/.codex/research/h15-probe-deps/node_modules/koffi/LICENSE.txt')),('YAML-LICENSE.txt',Path('C:/Users/QYF/.codex/research/h15-probe-deps/node_modules/yaml/LICENSE'))]:
 (R/name).write_bytes(src.read_bytes())
put('README.md','''# H15 内部研发交付

《Agent 安全执行：审批、权限、沙箱与文件系统守卫》。固定源码Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。结论：**CONDITIONAL GO**，仅作者研发交付；未发布，未开始H16。

- [正式教材](../../../course-content/internal/deepseek-harness/h15/lesson.md)与[完整lab](../../../course-content/internal/deepseek-harness/h15/lab/)
- [HTML阅读预览](reading-preview.html)：实际LessonMarkdown静态SSR，原生折叠可用；静态页移除未水合复制按钮，复制由真实React夹具另测
- [质量审查](quality-review.md)、[13项验收](acceptance.md)、[修订记录](review-log.md)
- [源码核对52条](source-checklist.md)、[测试及分级](test-evidence.md)、[原生平台覆盖](native-platform-coverage.md)
- [Renderer与三宽度](renderer-regression.md)、[H13–H15衔接](knowledge-bridge.md)、[H16前置交接](h16-handoff.md)
- [原始实验结果](evidence/practice-output.json)、[最终门禁](evidence/validation.json)、[文件hash清单](evidence/artifact-inventory.json)

## 复现

在仓库根目录使用Node 24与Python。先准备固定上游源码缓存及tsconfig，缓存环境变量为HARNESS_SOURCE_CACHE / HARNESS_GIT_CACHE；runner核对Git blob与SHA256。运行 `node docs/deepseek-harness-v2/h15/scripts/run-checks.mjs`，可分别调用同目录各脚本诊断。`prepare.py`仅保留初次脚手架记录，已有lab时会拒绝覆盖，不是日常门禁步骤。

依赖解析入口：H15_DEPS_ANCHOR指向H04隔离依赖中的commander/index.js；H15_ZOD_ANCHOR指向Zod4.4.3的index.js；H15_FS_DEPS_ANCHOR指向本课隔离依赖chokidar/index.js。依赖版本/integrity分别从H04证据、上游pnpm-lock及本课fs-dependencies.json核验。新增chokidar5.0.0、koffi3.1.1、yaml2.9.0安装在研究目录，不写业务package.json或锁文件。完整依赖清单可在新隔离目录按固定版本安装，再修改anchor。

Playwright使用AIFOUNDRY_QA_NODE_MODULES与AIFOUNDRY_QA_CHROME可配置入口；私有localhost服务测试后关闭，不新增产品路由、课程目录或public资源。四图由draw_figures.py生成SVG，再由Chrome生成PNG；无需外部图片服务。

只接触新建夹具。用户禁止批量删除，因此每次仅清理一个核验过的明确文件；原子写暂存清理钩子保留空目录，输出给出目录位置。没有执行上游包含递归清理的测试套件，也没有启动原生进程沙箱runner、真实模型或完整应用E。''')
put('NOTICE.md','''# H15 来源与许可

受测官方实现来自DeepSeek Harness固定Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。以锁定缓存导入，不打包node_modules。保留[上游MIT](SOURCE-LICENSE.txt)、[Cordis](CORDIS-LICENSE.txt)、[Zod](ZOD-LICENSE.txt)、[Chokidar](CHOKIDAR-LICENSE.txt)、[Koffi](KOFFI-LICENSE.txt)、[YAML](YAML-LICENSE.txt)许可。

四图、讲解、题目与无副作用计算业务为本轮制作。结构性Agent+真实Session的组件夹具参考上游approval.spec.ts；测试钩子属于上游实际提供的边界。effectivePolicy为TS private，显式any读取仅作诊断。文件实验只替换默认递归清理钩子，未替换stat、版本检查、DACL、ReplaceFileW、link或rename等受测原语；消费者为明确教学适配器，不冒充完整tool-fs。''')
put('knowledge-bridge.md','''# H13–H15 知识衔接与重复审查

| 课 | 应保留的判断 | H15怎样使用 | 不重复/不外推 |
|---|---|---|---|
| H05 | 插件与服务提供者不同 | Approval、Policy、fs是服务；观察策略只发监听贡献 | 不重建完整Cordis入门 |
| H06 | Waterfall短路与next | 审批应答槽、普通pre及fs意图分别讲契约 | 不将所有Waterfall合成最严格交集 |
| H07 | Effect按所有权退出 | 观察卸载清状态、监听随所属Fiber退出 | 不将卸载一层视为所有后端围栏消失 |
| H08 | Profile/Bundle/Patch/运行状态分开 | 查实际挂载组合，不从minimal名字推权限 | 不重讲配置树算法 |
| H10 | 取消是通知、已有效果不回滚 | 审批立即结算与迟到答案单独验证 | 不推广为所有主体立即停止 |
| H13 | 可见性、Scope、准入不同 | 提出调用只是起点，Schema不替代授权 | Scope不是OS隔离 |
| H14 | 最终pre、ask解析、guard、主体、结果 | B只复用入口与拒绝轨迹；A补真实Approval | 不重讲所有投影/调度；C/D不宣称完整Loop |
| H15 | 授权与强制、文件新鲜度与审计分开 | 四实验分别落在实际组件边界 | 不是所有能力共享一条安全总链 |

重复保留仅用于解释新因果：普通deny被外层allow改写与guard对照，是H15说明所有者约束为何单调的必要前提；H14无审批服务的拒绝不是本课真实问答证据。正文没有复制H14整条输出与批次实现。新课实际读取与版本检查局限得到补充，但没有预写文件工具、Shell/Web/MCP的完整应用课。

综合链核对：文件消费者先解析策略与意图；fs-sandbox再检查路径与模式，local再检查版本；Shell另用provider包装子进程。每个箭头均有条件前提。实际验证范围为局部C/D，原生runner与完整模型请求流未验证。''')
put('h16-handoff.md','''# H16 前置知识与边界交接

只交接，不开发H16课程、代码或发布。

进入H16前，建议能解释B_approved-guard主体0、A_late已取消后不重新授权、C_policy一次覆盖后B仍read-only、D_files旧version拒绝与重新观察恢复。应能画出通用Pipeline与具体消费者的分界，说明fs-intent在消费者中、版本检查在后端中，进程sandbox是另一条能力路径。

后续研发必须检查真实文件、Shell、Web、MCP消费者具体依赖与运行位置，不能从本课夹具适配器推导所有工具都自动发fs/observed，也不能把resolve视为审批服务。approval effectivePolicy的private/文档差异须保留；读取当前策略以真实请求行为与实际接口为准。

需要继续保留的未验证项：三平台原生进程runner；Windows ACL partial与真实授权/撤销生命周期；真实网络、命令、凭据、MCP跨进程；完整应用E；实际学习时长与学员理解。H16也不得拿教学Mock凑原生PASS。H20再研究完整取消/重试/未知结果与副作用恢复。本课没有安排自动进入下一讲。''')
coverage={'host':out['C_policy']['host'],'commit':lock['commit'],'nativeProcessRunners':{'linux-bwrap':'NOT_RUN','linux-landlock':'NOT_RUN','macos-seatbelt':'NOT_RUN','windows-acl':'NOT_RUN'},'simulatedProbesRealProvider':[{'kind':r['kind'],'code':r.get('code'),'enforcement':r.get('enforcement'),'spawn':False} for r in out['C_policy']['reports']],'actualFilesystem':{'platform':d['host'],'backend':'SandboxedFileSystem extends LocalFileSystem','publication':d['nativeFilePublication'],'nativeOverrides':False,'cleanupHookOnly':True,'fileRemoved':d['fileRemoved']},'E':'NOT_RUN','notTested':['hostile symlink/alias race','external writer during validation/publication','native process full/partial enforcement','network/process visibility','runner failure stderr classification execution','ACL grant/revoke lifecycle','actual model tool-fs/Shell consumers']}
(E/'platform-coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
put('native-platform-coverage.md',f'''# 原生平台覆盖范围

实际宿主：{coverage['host']['platform']} / {coverage['host']['arch']}。Node {labs['node']}。这里把真实策略、模拟探测和原生进程执行严格分开；完整应用E未运行。

| 能力 | 实际运行 | 受测边界 | 不能据此推出 |
|---|---|---|---|
| Approval/Policy/Session | 是，真实组件 | Turn、问答、事件、逐调用解析与回放 | 原生OS限制已执行 |
| LocalSandboxProvider选择与argv | 是，真实算法，probe为模拟 | unavailable/full/partial及Windows只读包装 | 已运行bwrap、Landlock、Seatbelt、ACL |
| Linux bwrap | NOT_RUN | 静态核对链、profile、测试 | Linux真实强制有效 |
| Linux Landlock | NOT_RUN | 静态核对ABI完整度，模拟partial报告 | 旧/新内核实际效果 |
| macOS Seatbelt | NOT_RUN | 静态契约与profile | macOS原生验证 |
| Windows ACL进程runner | NOT_RUN | 静态partial限制；模拟只读argv | 受限令牌、硬链接/ACL漏洞或授权撤销已验证 |
| Windows本地文件后端 | 是，真实磁盘IO | {d['nativeFilePublication']}；仅清理钩子替换 | Windows进程沙箱或所有并发竞态已验证 |

full表示文件效果词汇中的完整度；partial必须显式保留。C程序的strictConsumer仅为教学判断，并未运行真实Shell消费者处理partial。无可用选择链时真实provider抛SANDBOX_UNAVAILABLE，未spawn；真实runner执行前失败的stderr/exit归因本轮仅静态核对。

Windows已知边界包括NTFS硬链接对象别名、读取不受完整约束及AppContainer ACL/低完整度读取问题；不支持额外可写根。工作区standing ACE与每活跃会话/工作区的随机临时授权生命周期不同。全部来自固定源码说明，本轮未真实授予/撤销这些进程ACL。

fs实验验证明确安排在变更检查之前的外部写入导致FS_STALE_VERSION，不验证检查与发布之间的任意外部竞争、祖先链接交换或Windows路径别名攻击。临时目录有自动写授权，故本轮不把临时兄弟目录当围栏越界测试。机器可读范围见[platform-coverage.json](evidence/platform-coverage.json)。''')
tap=(E/'lab-tests.txt').read_text(encoding='utf-8');cases=re.findall(r'^# Subtest: (.+)$',tap,re.M)
put('test-evidence.md','''# H15 实验与证据分级

31项实际TAP通过：18 C + 13 D。A/B是实践名称时不代表验证等级；受控应答者与probe替身不记原生能力。没有独立A/B计数或E运行。

| 实践 | 真实受测对象与跨边界断言 | 替身/未触发能力 | 分级 |
|---|---|---|---|
| A | ApprovalService→真实Session提交；策略投影、应答Waterfall、取消与迟到、无Turn、提交前故障；重复callId无缓存grant | 结构性Agent；受控应答者；无UI/真实存储故障 | 18 C |
| B | Tools/Native/Pipeline→Approval/Session；批准后guard拒绝，普通pre改写对照，取消主体0，最终ToolResult | 常量计算；结构性Agent；无Loop、工具日志sink、Shell、文件 | 11 D |
| C | SandboxPolicy/Session回放→共享roots；Approval升权→单次覆盖；真实provider选择及argv | probe/launcher替身；无spawn；strictConsumer为教学判断 | 1 D，内含模拟边界 |
| D | fs-sandbox/local真实IO→观察意图→真实版本拒绝、重读恢复、缺失创建、同ID新Session与卸载/重载；只读围栏仍生效 | 夹具consumer显式发事件，非tool-fs；清理钩子替换；无攻击竞态 | 1 D |

[practice-output.json](evidence/practice-output.json)保存A/B每场景、C完整策略/事件/argv与D逐项label；[lab-tests.txt](evidence/lab-tests.txt)为最新TAP；[lab-results.json](evidence/lab-results.json)保存版本/程序hash/分级；每次run-时间戳-*.json保留实际args、exit、stdout、stderr、程序hash与scratch，包括失败历史。输出不把教学trace伪装成Session事件。

[lab-mutation.txt](evidence/lab-mutation.txt)是故意错误预测“批准后guard不能阻止”的预期非零失败，不是产品缺陷或待修测试。官方实现未改动；没有运行上游含递归清理的完整测试。

## 实际展开的TAP条目

'''+ '\n'.join('- '+c for c in cases))
put('renderer-regression.md',f'''# Renderer 与阅读验证

使用仓库当前真实parseLessonContent、LessonMarkdown及PostCSS/Tailwind编译的平台CSS，未改Renderer。Renderer既有12项回归通过，原始TAP见[renderer-regression.txt](evidence/renderer-regression.txt)。新增本课内容/AST检查见[content-check.json](evidence/content-check.json)：精确四项metadata/checkKey唯一性、4图、21折叠默认关闭、7份完整代码同步、四种闭合词汇、真实类/方法存在、effectivePolicy私有修饰、当前SSR与静态预览相等。

1440/390/320三宽度均通过：无页面横向溢出、图片/中文字体/图注正常、7个完整程序复制到剪贴板逐字匹配、21个折叠Enter开关、10题答案、4原图popup、移动代码局部横向滚动、静态页无失效复制按钮。静态页是私有审阅，不是有鉴权课程页面；真实课程路由、进度API、登录与移动设备实机未测。

四图SVG最小文字28px，Chrome生成PNG并检查text bbox无越界/相互覆盖。320页内最小折算约{manual['minimumFigureTextAt320']:.1f}px，提供已验证的原图入口；这不是可访问性完整认证。作者查看17份最终截图，见[manual-review.json](evidence/manual-review.json)，不是用几何检查替代视觉检查，也不是学员理解验证。

读取量：默认正文约{m['defaultBodyCjk']}个中日韩文字，总正文约{m['allBodyCjk']}个（均排除代码/URL/注释），完整代码{m['codeLines']}行，其中默认展开{m['defaultCodeLines']}行。统计不换算成已测时长；200～270分钟为作者三段估计。''')
put('review-log.md','''# 作者审查与修订记录

未确认遗留技术P0/P1；作者自审不是独立审查。

| 发现 | 处理与证据 | 当前状态 |
|---|---|---|
| 首次导入缺yaml | 从上游锁核定yaml2.9.0并接隔离依赖，未改官方源码/业务依赖；最初run JSON保留 | 已解决 |
| 测试把never的完整audit误当仅问答对 | 原始日志保留approval/policy，断言按asked/decided过滤 | 已解决，失败记录保留 |
| 测试误要求上下文含裸never单词 | 实际完整语句为disabled；改查语义对应的上下文及真实请求 | 已解决 |
| 测试无依据要求contexts数组冻结 | 此非已承诺契约，改检查实际sandbox:policy贡献 | 已解决，无上游改动 |
| 文档推荐effectivePolicy，实现却private | 正文、源码清单与诊断程序明确区别；AST核private，不宣传公开稳定API | 已记录版本差异 |
| roots的workspace与extra校验不可混说 | workspace只canonicalPath并保留失败写法；strict物理校验只针对additionalRoot | 正文与52条源码清单已细化 |
| 上游默认原子写入/官方测试含递归清理 | 不运行上游套件；只替换清理钩子，每次明确一个文件，空目录保留 | 用户指令例外公开说明 |

最终错误答案非零是预期门禁，用于拒绝“批准可绕过守卫”的错误预测。三平台原生进程runner、完整E、真实学员与实测时长保持未验证，不改成PASS。''')
put('acceptance.md','''# H15 13项交付验收

| 项 | 产物与状态 |
|---|---|
| 1 正式完整正文 | lesson.md，风险案例→机制→反例→实践→推导 |
| 2 HTML | reading-preview.html，实际SSR私有预览 |
| 3 四图 | figures/h15-01～04.svg/png、draw_figures.py、三宽度 |
| 4 四项实践 | A真实审批；B真实Pipeline；C真实Policy+模拟选择；D真实fs/观察，均完整代码和折叠详细答案 |
| 5 思考 | 10题折叠详细答案，前5题为配置/事件/轨迹推导 |
| 6 源码 | 52条事实与函数、实际路径/范围/官方测试参考/本轮等级；2218文件Git blob+SHA256锁定 |
| 7 C/D | 18 C + 13 D；原始timestamp运行、TAP、JSON与预期失败 |
| 8 原生覆盖 | 各平台进程runner NOT_RUN；Windows真实fs另列，不混计 |
| 9 Renderer | 既有12项 + 本课内容/AST通过 |
| 10 三宽度交互 | 1440/390/320及复制、折叠、键盘、原图、滚动通过；17图作者视觉检查 |
| 11 跨课衔接 | knowledge-bridge.md，保留复习与新增边界 |
| 12 H16交接 | h16-handoff.md，仅前置与未验证项，未开发 |
| 13 质量结论 | CONDITIONAL GO；作者内容与局部证据合格，未验证项独立保留 |

最终Git仅允许两条H15路径。保护文件逐字节核验与范围证据由final-audit写入validation.json；不修改价格、权限、数据库、发布状态或线上业务。''')
put('quality-review.md',f'''# H15 教学质量审查

**CONDITIONAL GO**：允许作为作者完成的内部课程研发交付。无已知未决确认P0/P1；这不是正式安全审计、平台隔离认证或发布批准。

## 作者侧内容质量

正式正文围绕“检查并修复配置”展开，先区分六层责任，再用七个术语的例子/定义/局限连接审批、守卫、沙箱和文件观察。4原创图、4完整实践及折叠详细答案、10思考题（5项配置/事件推导）齐全。H13/H14只保留必要复习，H16/H20只交接边界。默认正文约{m['defaultBodyCjk']}个CJK文字、默认代码{m['defaultCodeLines']}行，全部代码{m['codeLines']}行；200～270分钟为作者估计，实际负担未经试读校准。

## 已验证的局部安全策略行为

18项C验证真实Approval/Session：ask/never、四结果、缺失/异常/非法应答、晚到批准、有效Turn、审计提交前失败、同callId新请求、覆盖与上下文。13项D包括11个真实Tools/Native/Pipeline/Approval/Session轨迹，1个Policy/Approval/Session及模拟probe的真实provider选择，1个真实fs-sandbox/local/观察/Session生命周期实验。31项TAP通过，错误答案预期失败；不是31个原生平台集成。

52条源码事实核对，{len(lock['files'])}文件字节锁定；内容AST同时记录effectivePolicy为private这一文档差异。Renderer既有12项与内容/AST通过；真实React挂载和静态SSR三宽度通过，17份截图作者查看。原始证据与失败历史可复核，结果数量不作为全面安全保证。

## 未测试的原生平台能力

Linux bwrap/Landlock、macOS Seatbelt、Windows ACL进程runner均NOT_RUN。真实provider选择使用替身probe且不spawn，full/partial仅验证报告与argv。Windows真实本地fs使用Koffi/DACL/ReplaceFileW，仅替换清理钩子；这不升级为原生进程沙箱验证。未测恶意链接竞态、任意外部写入者与发布同时竞争、原生ACL授权撤销、runner实际执行失败归因、网络隔离或完整E应用。

## 仅适用于特定组合的结论

问答需要ApprovalService、有效Turn及负责的应答者；pre ask才进入通用审批分支。guard是可信插件契约下单调拒绝，不是同进程恶意代码隔离。Policy解析不替调用方审批；受限进程要有实际消费者/provider/runner，文件围栏要实际挂载fs-sandbox；模式不控制网络/全部进程能力。观察保护需要消费者正确发fs事件、插件占据单槽及后端遵守expected；D的消费者是明确夹具，不是完整tool-fs。

## 哪些条件下约束不生效或改变

裸fs-local省略expected不提供自动新鲜度保护；直接readText不发观察事件；观察插件卸载、抢槽或绕过消费者会失去自动guard；新/恢复Session对象没有旧观察。danger模式绕过文件约束，但本课只静态分析。缺审批应答者或runner应失败关闭，不应扩大能力。workspace-write含显式extra及后端临时区域，不能等同仅workspace。extra严格验证与workspace canonical处理不同，Windows进程不支持额外根。版本检查、进程内锁与原子发布不消除全部TOCTOU。

## 待真实学员验证及剩余条件

尚无独立外部审查、学员首次执行/理解数据或实测时长。应后续检查能否独立区分模式与完整度、持久策略与内存观察，以及为何批准后仍拒绝；再校准时间与讲解负担。当前已按用户要求保留这些条件，没有为追求GO启动危险实验或关闭约束。

## 范围与保留

基线{before['base']}；保护{len(before['files'])}份已有文件（包含当前wechat-contact.jpg等用户修改）、既有H01–H14/审查/output及其他脏文件，最终门禁逐字节核验。新增范围仅docs/deepseek-harness-v2/h15与course-content/internal/deepseek-harness/h15。未修改业务权限/价格/数据库/线上或发布状态；完成后停止。''')
print('H15 reports, licenses, platform coverage and 17-sample visual record written')
