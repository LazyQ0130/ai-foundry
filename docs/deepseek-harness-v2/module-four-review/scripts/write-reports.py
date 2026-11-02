from pathlib import Path
import json,hashlib,subprocess
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence'
write=lambda n,s:(R/n).write_text(s.strip()+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
notes={
'h13-01':'显式模型字段投影；执行/输出/Host展示留进程内；箭头不是全部执行顺序。',
'h13-02':'Scope继承/自身遮蔽/继承过滤交集；子级题设先撤A限制再看祖先贡献。图的deny还含style，与正文单deny shared不同但结论一致，自身style豁免；各自输入明确。',
'h13-03':'when逐项等待、失败不交部分；Step复用与当前登记/Scope/dispose复查并存；signal不强杀Promise。',
'h13-04':'登记→Scope→resolve→executor描述→Prompt/请求→模型提议；PTC SDK区别；后续结果仅作交接，caption显式省略Runtime投影。',
'h14-01':'成功路径三阶段；输入Schema在defineTool包装，参数快照不代替校验；deny仍post，wrapper throw跳post，skip不进Pipeline。',
'h14-02':'三种Waterfall各有返回契约；审批后guard且只否决；委托纪律是插件契约，不假称核心自动防重复next。',
'h14-03':'A/B可重叠，B先结束而complete/commit等A，C为独占屏障；标题/箭头/caption都区分主体结束与提交。',
'h14-04':'规范value、content/meta、additionalContexts分开；tools/result观察早于有log的tool/result；内存接受非flush。',
'h15-01':'上部通用允许路径，下部Shell/file两条能力，审批/沙箱/观察非所有工具必经；没有画成统一安全总链。',
'h15-02':'有效Turn、asked/decided审批ID配对、预取消先于never、仅allowed-once授权；无Turn/提交失败单独出口。',
'h15-03':'模式与完整度两个维度；workspace含extra/temp；Windows partial；平台事实为静态，原生runner未启动，网络不承诺。',
'h15-04':'消费者observed→可选观察意图→后端版本；write与edit不同；新Session/卸载清空；原子不消除全部TOCTOU。',
'h16-01':'共同入口后分到各家族；注册/准入/执行不合一，统一结果不统一权限。',
'h16-02':'角色图不画调用时序；WebRuntime选择、MCP每Server桥接与独立资源runtime；无ctx.mcp。',
'h16-03':'Web选择失败ready=true与明确false不同；MCP两阶段失败、断连保留、耗尽撤销和资源工具生命周期分列。',
'h16-04':'上限1的受控顺序示例，File/stdio真实、Shell/Web/模型替身；5call结果下一请求，额外write被本地Scope拒绝。'}
figs=json.loads((E/'figures-index.json').read_text(encoding='utf-8'));v=json.loads((E/'visual-qa.json').read_text(encoding='utf-8'))
lines=['# 16张正式教学图审查','','源图与PNG均在原分课私有目录，以下逐图对照正文alt/caption、SVG文字/节点/箭头和固定源码。实际LessonMarkdown+当前平台CSS在1440/390/320共12个课页挂载，48张图截图、16次源重导逐字节等同原PNG；没有需要重画的确定错误。','', '| 图 | 源文件 / 成图 | 技术与箭头审查 | 1440/390/320 | 处置 |','|---|---|---|---|---|']
for f in figs:lines.append(f"| {f['id']} | [SVG](../{f['lesson']}/{f['source']}) / [PNG](../{f['lesson']}/{f['image']}) | {notes[f['id']]} | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/{f['id']}-review-pair.png) |")
lines.extend(['','自动记录见[visual-qa.json](evidence/visual-qa.json)：字体就绪、SVG文本边界/重叠、原图弹窗、caption、图片自然尺寸、页面无横向溢出；长代码块局部横滚。几何通过不能替代方向、职责和安全含义的审读。','', '作者实际查看16份源/320图对照，另查看H13-02/H15-04的390与H14-03/H16-03的1440。最低手机辅助字约12.6px是本尺寸下的几何值，不能据此保证低视力或所有设备阅读舒适；重要边界在正文复述且能打开原图。未做真实学员可读性研究。','', '新增测验预览另做3宽度：18折叠答案、键盘、4道适合选择预测题的控制与自评输入；自评不自动判开放题。作者查看最终q13-320、q17-390/1440与320顶部预览，长答案完整在截图内。QA04原始加粗标记暴露说明：交互/几何通过仍需人工看图；修正文案空格后新增DOM断言并重验，未改产品组件。'])
write('figures-review.md','\n'.join(lines))
manual=[f'figures/qa/h{h}-{n:02d}-review-pair.png' for h in range(13,17)for n in range(1,5)]+['figures/qa/h13-02-390.png','figures/qa/h14-03-1440.png','figures/qa/h15-04-390.png','figures/qa/h16-03-1440.png','figures/qa/assessment-reading-320.png','figures/qa/assessment-q13-320.png','figures/qa/assessment-q17-390.png','figures/qa/assessment-q17-1440.png']
(E/'manual-review.json').write_text(json.dumps({'reviewer':'same author agent, not independent reviewer','status':'PASS author inspection only','finalSamples':[{'path':p,'sha256':sha(R/p)}for p in manual],'findings':['16 core diagrams consistent with source/caption; no source changes','QA04 literal Markdown label corrected; final long answers visible','mobile figure size is not learner comprehension proof'],'learnerReview':'PENDING','independentReview':'PENDING'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('revisions.md','''
# 修订处置与前后依据

先登记见[issues-initial.md](issues-initial.md)。原有文件仅改H15/H16各README及run-labs.mjs四件；正式正文、lab、16源图/PNG和历史报告/预览保持字节。本轮未确认正文/图有技术P0/P1，不能为了审查显得有改动而重写。

| ID | 原位置→问题证据 | 修改与依据 | 回归结果/状态 |
|---|---|---|---|
| R01 P1 | 两运行器只核直接FS依赖；旧缓存readdirp5.1.1与固定上游5.0.0不符 | 加整棵FS依赖integrity guard；默认指向新隔离module-four树；README说明固定readdirp/override和安装范围；旧缓存不改 | 严格拒绝旧树，新树所有integrity匹配；H15 31/H16 23及136总项通过，两个demo通过；CLOSED |
| R02 P1 模块缺口 | 原准备包声明PREPARATION ONLY，缺正式模型/矩阵/综合题 | 本目录统一23站、五对跨课裁决、安全与家族矩阵、逐项测试映射、新A/B/C、复用D、18题与H17–20交接 | 3新增D通过、110AST/218源码断言、15宽度挂载、完整材料门禁；CLOSED |
| R03 P2 | 正式稿860–1150分钟显著高于蓝图，缺模块节奏 | 新增负担统计、分段产出/检查点、Q17阶梯迁移；不压掉关键边界 | Fresh metrics与原值一致；未施测，效果仍PENDING；作者材料CLOSED |
| QA01 P1 新夹具 | 空checklist/checkKeys被实际parser拒绝，退出1 | 测验补明确目标与独立key，保持五字段，不改parser | parser、SSR、三宽度18答案通过；CLOSED |
| QA02 P2 新QA | Windows剪贴板CRLF与DOM LF直接比较失败 | 只规范化行尾，完整代码仍逐字比较 | 29份完整程序×3宽度共87次复制通过；CLOSED |
| QA03 P2 新辅助runner | 多删一项args丢bootstrap URL；demo失败，前两负例为装载失败 | 正确移除3项test参数；负例要求退出1且AssertionError，不再把任意非零当反证 | 4受控负例有效，H15/H16 demo通过；原aux日志保留；CLOSED |
| QA04 P2 新测验排版 | 实际看图见标签原样**，原几何/交互已绿 | 标签后加空格，DOM确认18答案无未渲染星号 | 最新三宽度与人工长答案截图通过；CLOSED |
| QA05 P2 新检查范围 | 扫全仓把既有Capstone正式/内部草稿相同key当本轮失败 | 保留既有多引用，仅核四课/测验key无跨文件冲突 | 当前16课程key各唯一，测验1新key不冲突；无关文件不改；CLOSED |
| QA06 P2 新验收顺序 | 链接检查早于自身patch/validation/acceptance生成，首次final退出1；普通diff空上下文行触发patch文件自身空白检查 | 三个明确自生成件写后核链接；补零上下文精确patch，避免语法空白警告 | 本地链接及cached whitespace最终通过；CLOSED |
| C01 复核候选 | 准备包列的可见/准入、安全总链、Web/MCP/错误路径等 | 实际正文/源图已区分，记录一致性裁决，不修改正确材料 | 没有确认缺陷；RESOLVED NO CHANGE |

确认P0=0；P1三项（一个既有复现缺口、一个模块交付缺口、一个新增测验夹具），全部关闭。P2六项（负担材料及五个新增QA/runner问题）全部按表处理。H13图2输入与正文例子不同但各自成立，已在图审查补解释，非错误图。

R01原件在evidence/before，零上下文精确patch/前后hash由最终验收生成（若应用需git apply --unidiff-zero；本轮不执行回放）。审查目录局部.gitattributes关闭行尾转换以保留原始证据hash，不影响目录外文件。新增夹具失败在时间戳check/aux原记录；QA04原样标签的修改前表达式为`**标准答案：**`直接连接中文，实际看图发现后已改为空格分隔。当前截图保存最终版本，历史失败日志不改写。四课50份历史run记录及原全部证据保持；本轮不追认它们使用过新传递依赖。
''')
write('review-report.md','''
# 第四模块集中教学质量审查报告

2026-11-02；研发基线H13 `6cd6ac4`、H14 `42e489c`、H15 `b6a3096`、H16 `2ba063f`；官方固定 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。本轮为同一作者环境的集中技术/编辑审查，不冒称独立外审。**最终CONDITIONAL GO**：限定范围作者材料合格，原生平台、完整应用和真实学员仍未验证；没有发布课程或开发H17。

| 判断层 | 结论 | 依据和限制 |
|---|---|---|
| 作者侧研发质量 | GO（本轮范围） | 模型/一致性/安全/家族矩阵、16图、全部实验/答案/思考复核及18题齐备；确认P0=0、P1=3全部关闭 |
| 技术事实准确性 | GO（固定版本/列明断言） | 9552文件Git blob+SHA256，218断言/90正文链接范围，110AST与实际分支/测试交叉；完整性不替代语义/安全审计 |
| 实际组件覆盖 | GO（列明局部路径） | 原136执行项复验+新3D通过，C90/D49；20语义主题，不是139个独立安全场景；结构Agent/Mock部分明确 |
| 外部协议覆盖 | CONDITIONAL GO（仅本地stdio） | 真实SDK2.2.0 Client/Server、发现/调用/资源/刷新/故障/一次新PID重连与释放；MCP HTTP、真实Web/外部认证NOT_RUN |
| 原生平台安全 | NOT_RUN | 实际宿主Windows且File本地原语真实；原生Shell、Linux/macOS/Windows进程sandbox runner未运行，不给平台隔离认证 |
| 完整Harness应用E | NOT_RUN | 无完整Profile/真实模型/生产持久后端/产品GUI与跨进程恢复；局部Loop/SDK不升级E |
| 真实学员教学效果 | PENDING | 未试读、未测独立迁移/耗时/评分一致性，无独立技术/教学外审 |

准备范围包括完整蓝图、前三报告及制作标准，四课正式正文、嵌入完整程序与实际lab/test、答案/40思考、16源图与PNG/图注、源码断言、50份历史raw run、质量报告，H16集中准备包全部13件和所引材料，H17–H20规划。409项输入身份可复核；没有仅按README作形式审查。旧蓝图“只Mock”与正式任务扩展已区分，未回写旧文掩盖变化。

本轮最重要的产出是23站统一模型。Registry持定义，Scope过滤继承并叠自身；新Step resolve，SystemPrompt通过Executor描述向模型声明；LLM提议后Loop交整批，Native解析/调度/有log先call，prepare快照与pre/ask/guard，dispatch再核资格，defineTool包装才验证输入。各家族在主体内部调用各自服务/后端；沙箱/文件意图不是Pipeline统一必经总链。规范值与内容/metadata经适用分支处理，再冻结观察、按模型顺序提交，有log才有Session工具事实。后续请求从当时历史派生，不能把内存接受当落盘。

跨课五组关系均核到具体章节与源码：H13/H14的定义/Schema/准入/参数位置，H14/H15的Waterfall/审批后guard与两类result，H15/H16的File/Shell/网络/外部信任，H13/H16的Provider ready与MCP目录生命周期，H14/H16的家族错误/取消/Jobs/结果关联。未发现必须修正式正文或图的确定技术错误；没有以统一表达改变语义。

安全结论明确：Schema不是授权，Scope不是OS沙箱；allowed-once不能盖过guard；mode不管网络，full/partial不等于全面安全；观察可选且按Session对象，直接readText不自动发事件；版本与原子发布不消除全部TOCTOU；HTML过滤与URL语法不证明可信/完整SSRF防护，HTTP后端不内建私网/loopback拒绝；stdio外部程序须可信或另隔离，发现不扩本地权，MCP resources不自动灌system。所有这些限制在原正文主线可见，模块测验再用反例检验。

实际发现的既有P1在复现依赖链：原H15/H16只核直接文件依赖，缓存readdirp5.1.1与上游5.0.0不同。先登记R01，再只改两README/两runner，新增完整传递integrity守卫与新隔离锁树；不覆盖旧缓存/原证据。固定依赖后136项和3新D通过，4错误答案有效预期失败，H15/H16 demo通过。新增测验/QA的P1/P2按台账修复，失败日志保留，未改官方实现或产品代码求绿。

证据计数经过语义处理：H13多个C断言消费一次A/B/C共享fixture；H14参数化分支重复同一执行器；H15/H16一项综合fixture内有多断言；各Loop重复准入/结果机制。本轮逐项保留139执行项，映射20主题，不声称任一数量为互不重复安全场景。新A证明可见且批准后guard拒绝、body0且错误进入下一请求；新B实际File在未观察/外改时拒绝、重读恢复、8对结果入历史；新C同一Agent跨Step ready真假与不可用，注册和错误不同。D复用本轮H16真实stdio与5/7调用组合，不新增同义计数。

教学链有具体工程主线与渐进难度：H13七步计算器后再Scope，H14先单调用再多结果，H15从配置风险到条件边界，H16围绕项目说明接四家族。没有大量应删定义重复；密度集中H14失败/有序提交及H15/H16跨能力条件。新增44条有限术语矩阵、六问诊断、18题100分（四跨课A/B/C/D）与四层Q17迁移，完整标准答案/推导/Rubric/误答/依赖可折叠；选择预测只作局部交互，不冒称自动判理解。

学习负担默认30557/全部40720 CJK字、54代码块1143行、16图、16实践+1综合、40思考；四课估860–1150分钟，蓝图410–560，增加450–590。额外模块测验估100–150分钟，环境另计。分段/折叠/停顿是作者安排，尚无试读证明实际负担平滑或时长准确，未用测试通过代替学习效果。

16图源重导与原PNG字节一致，1440/390/320实际Renderer/CSS挂载、48图截图及原图交互通过；四课29份完整程序三宽度复制87次、所有折叠键盘与代码横滚通过；共同Renderer12项通过，测验另3宽度18答案/预测控件通过。作者实际查看24份最终样本（含16源/320图对照和最终长答案），无独立外审或真实学员观察。QA04原样Markdown星号必须实际看图才发现，修后重验说明机器几何不能替代审读。

必要制作标准增补聚焦多家族责任、可见/允许/后端分层、协议/平台/E证据正交、语义去重和完整传递锁定；前三标准原件保留。H17–H20只交接tool事实/读视图、不可重复副作用与可靠恢复前置，没有提前写H17正文。

所有确认P0/P1已关闭；总体条件来自验证覆盖与教学效果仍有限，不能为了GO淡化。后续可安排独立技术/教学外审、真实试读，再决定何种对外使用；原生/网络/HTTP/E各需要独立专项。完成本轮正式集中审查即停止。
''')
write('README.md','''
# DeepSeek Harness第四模块集中教学审查

**最终CONDITIONAL GO。** 2026-11-02；基线`2ba063f`，官方固定`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。作者材料与已覆盖局部行为可交付；无未决确认P0/P1。原生Shell/三平台进程沙箱、真实Web、MCP HTTP、完整Harness E、真实学员与独立外审仍未验证。仅内部审查，未发布，未开发H17。

| 交付要求 | 正式入口 |
|---|---|
| 1–2 总审查与完整结论 | [review-report.md](review-report.md) |
| 3 统一真实工具能力模型 | [23站模型与失败分支](unified-tool-model.md) |
| 4 知识/术语与跨课一致性 | [dependency-matrix.md](dependency-matrix.md)、[五组逐项裁决](technical-consistency.md) |
| 5 安全边界专项 | [safety-review.md](safety-review.md) |
| 6 四类组件与行为 | [family-matrix.md](family-matrix.md) |
| 7 A–E矩阵与语义去重 | [test-evidence.md](test-evidence.md)、[139执行项索引](test-case-index.md)、[机器矩阵](evidence/test-matrix.json) |
| 8 新增局部集成/原始记录 | [cross.test.ts](lab/cross.test.ts)、[A](evidence/cross-A.json)/[B](evidence/cross-B.json)/[C](evidence/cross-C.json)；D复用本轮H16 raw |
| 9 全16图/三宽度 | [figures-review.md](figures-review.md)、[视觉记录](evidence/visual-qa.json) |
| 10 18题100分/完整评分 | [折叠题册](assessment.md)、[互动阅读预览](assessment-preview.html)、[结构化题目](assessment.json) |
| 11 负担/时长 | [workload.md](workload.md)、[可重算口径](evidence/workload.json) |
| 12 问题与修订 | [先行台账](issues-initial.md)、[处置/回归](revisions.md)、[4件原文patch](evidence/necessary-revisions.patch) |
| 13 回归与范围保护 | [acceptance.md](acceptance.md)、[最终验证](evidence/validation.json) |
| 14 制作标准补充 | [第四模块增补](production-standard-module-four-addendum.md) |
| 15 H17–H20前置 | [交接](h17-h20-handoff.md) |
| 16 七层最终GO/条件/未验证 | 总报告首表；不将总体条件当作平台安全或发布许可 |

源码复核：[218条逐项索引](source-assertion-index.md)、[语义范围与文档差异](source-review.md)、[409输入身份](evidence/input-inventory.json)、[50历史run身份](evidence/historical-runs-index.json)。9552文件完整性、90正文链接、110AST为定位/防漂移辅助，不能替代行为和学员证据。

主要结果：136原测试执行项+3新增D通过，C90/D49，归20语义主题；这些数量均不是互不重复安全场景数。MCP为真实SDK本地stdio，Shell/Web/模型有明确替身。16图重导字节相同，12项Renderer、四课+测验15个宽度挂载通过。

唯一原课配套修订是R01：H15/H16 README与run-labs补完整文件传递依赖核验，固定readdirp5.0.0的新隔离树，旧缓存/报告不改。四课正文、lab、原图和历史预览保留。新增模型/测验/证据与必要四件修改独立提交；H01–H12、前三审查、output、业务与用户改动受hash保护。

当前四课私有阅读预览：[H13](h13-reading-preview.html)、[H14](h14-reading-preview.html)、[H15](h15-reading-preview.html)、[H16](h16-reading-preview.html)。实际LessonMarkdown SSR与平台CSS，静态阅读预览移除无水合复制按钮，可选择文本；测验预测控件为本地独立JS，不接产品路由/进度/账号。

复验顺序（仓库根）：`python docs/deepseek-harness-v2/module-four-review/scripts/audit-inputs.py` → `node docs/deepseek-harness-v2/module-four-review/scripts/run-labs.mjs` → `node docs/deepseek-harness-v2/module-four-review/scripts/run-aux.mjs` → `node docs/deepseek-harness-v2/module-four-review/scripts/run-checks.mjs all`。run-labs复制新隔离目录，保留时间戳raw；不运行覆盖旧分课证据的总runner。换机先按分课README准备固定缓存/隔离依赖锚点，文件树用本目录prepare-dependencies.py。无Key/外网实验/原生Shell/批量删除。
''')
print('review, README, revisions, figures and 24 final manual samples written')
