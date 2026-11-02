from pathlib import Path
import json,hashlib,re,os
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence';PREP=R/'module-four-review-prep';PREP.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();load=lambda p:json.loads(p.read_text(encoding='utf-8'))
def put(name,text):(R/name).write_text(text.strip()+'\n',encoding='utf-8')
def prep(name,text):(PREP/name).write_text(text.strip()+'\n',encoding='utf-8')
rel=lambda p:os.path.relpath(p,PREP).replace('\\','/')
lab=load(E/'lab-results.json');content=load(E/'content-check.json');visual=load(E/'visual-qa.json');source=load(E/'source-lock.json');before=load(E/'workspace-before.json');out=load(E/'practice-output.json');m=content['metrics']
assert lab['tests']==23 and len(load(E/'source-assertions.json'))==60
samples=[f'figures/qa/h16-0{i}-{w}.png' for w in [1440,390,320] for i in range(1,5)]+[f'figures/qa/answer-{w}.png' for w in [1440,390,320]]+['figures/qa/static-intro-320.png','figures/qa/lab-open-320.png']
(E/'manual-review.json').write_text(json.dumps({'status':'PASS_AUTHOR_VISUAL_REVIEW','reviewer':'author agent, not independent review','samples':[{'path':p,'sha256':sha(R/p)} for p in samples],'notes':['17 final PNGs viewed through view_image: labels/captions/boxes/arrows/wrapping','Long mobile answer capture uses taller temporary viewport; browser answer DOM verified','No observed clipping/label overlap in final figures','Mobile figures have original-image link; not an accessibility certification','No learner trial or native device testing']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
inputs=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md','docs/deepseek-harness-v2/module-one-review/production-standard-v1.md','docs/deepseek-harness-v2/module-two-review/production-standard-module-two-addendum.md','docs/deepseek-harness-v2/module-three-review/production-standard-module-three-addendum.md','docs/deepseek-harness-v2/module-one-review/README.md','docs/deepseek-harness-v2/module-one-review/source-review.md','docs/deepseek-harness-v2/module-two-review/README.md','docs/deepseek-harness-v2/module-two-review/technical-review.md','docs/deepseek-harness-v2/module-three-review/review-report.md','docs/deepseek-harness-v2/h15/h16-handoff.md']
for n in [13,14,15]:inputs += [f'course-content/internal/deepseek-harness/h{n}/lesson.md',f'docs/deepseek-harness-v2/h{n}/quality-review.md',f'docs/deepseek-harness-v2/h{n}/evidence/lab-results.json',f'docs/deepseek-harness-v2/h{n}/evidence/figures.json']
(E/'preparation-inputs.json').write_text(json.dumps({'scope':'30-lesson blueprint, three prior module review outcomes, current standards, H13–H15 final materials and H15 handoff read during this chat; H16/H17/H20/H25–H30 boundaries revisited. Hash inventory identifies versions, not proof of reading.','files':[{'path':p,'sha256':sha(P/p)} for p in inputs]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name in ['SOURCE','CORDIS','ZOD','CHOKIDAR','KOFFI','YAML']:(R/(name+'-LICENSE.txt')).write_bytes((P/f'docs/deepseek-harness-v2/h15/{name}-LICENSE.txt').read_bytes())
deps=Path('C:/Users/QYF/.codex/research/h16-probe-deps/node_modules')
for name,path in [('MCP-CLIENT','@modelcontextprotocol/client'),('MCP-SERVER','@modelcontextprotocol/server'),('MCP-CORE','@modelcontextprotocol/core'),('TURNDOWN','turndown'),('GFM','@joplin/turndown-plugin-gfm'),('DIFF','diff')]:
 choices=[p for p in (deps/path).iterdir() if p.is_file() and p.name.lower().startswith('license')];assert len(choices)==1,(name,choices);(R/(name+'-LICENSE.txt')).write_bytes(choices[0].read_bytes())
put('README.md','''# H16 内部研发交付

《Agent工具生态：File、Shell、Web与MCP的组合实践》。固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。作者结论 **CONDITIONAL GO**。仅H16与第四模块审查准备，未发布，未开始H17或正式集中审查。

- [正式教材](../../../course-content/internal/deepseek-harness/h16/lesson.md)、[完整lab](../../../course-content/internal/deepseek-harness/h16/lab/)、[HTML阅读预览](reading-preview.html)
- [质量报告](quality-review.md)、[14项验收](acceptance.md)、[源码60条](source-checklist.md)、[实验分级及原始证据](test-evidence.md)
- [平台/后端覆盖](backend-coverage.md)、[Renderer与三宽度](renderer-regression.md)、[修订与范围差异](review-log.md)
- [跨课衔接](knowledge-bridge.md)、[H17前置](h17-handoff.md)、[第四模块集中审查准备包](module-four-review-prep/README.md)
- [最终门禁](evidence/validation.json)、[文件清单](evidence/artifact-inventory.json)

## 复现入口

仓库根使用Node24、Python及当前仓库开发依赖。运行 `node docs/deepseek-harness-v2/h16/scripts/run-checks.mjs`；各子脚本可单独复查。prepare.py只保留首次脚手架记录，有lab时拒绝覆盖，不在日常门禁中运行。固定源码缓存由HARNESS_SOURCE_CACHE / HARNESS_GIT_CACHE选择，脚本核Git blob与SHA256，不跟随main。

H16_DEPS_ANCHOR指向H04隔离依赖中的commander/index.js，H16_FS_DEPS_ANCHOR指向H15隔离chokidar/index.js，H16_ECO_DEPS_ANCHOR指向本课隔离依赖目录的package.json。H16_ZOD_ANCHOR保留H09锁定Zod核验入口；实际解析用本课同版本4.4.3。新增SDKclient/server/core2.2.0、turndown7.2.4、GFM1.0.67、diff9.0.0等完整依赖树见ecosystem-dependencies.json，全部integrity与固定上游pnpm-lock一致。为避免宽范围依赖漂移，eventsource-parser3.1.0、jose6.2.3、zod4.4.3显式固定。安装仅在研究目录，不修改业务依赖。

Playwright入口由AIFOUNDRY_QA_NODE_MODULES / AIFOUNDRY_QA_CHROME配置。静态HTML来自实际LessonMarkdown SSR；原生折叠可用，静态页不保留未水合复制按钮，复制用真实React挂载另测。私有localhost服务测试后关闭，无公开路由。

MCP实际启动随附Node Server经stdio通信，源文件可审阅，无npx、网络抓取或未知Server安装。Shell为显式Mock执行器；Web为内存提供方。文件只触碰新夹具，逐个明确文件清理，空目录按用户禁止批量删除规则保留。''')
put('NOTICE.md','''# H16 来源与许可

官方实现从固定DeepSeek Harness源码缓存导入，未修改、未打包node_modules或上游完整测试套件。[上游](SOURCE-LICENSE.txt)、[Cordis](CORDIS-LICENSE.txt)、[Zod](ZOD-LICENSE.txt)、[Chokidar](CHOKIDAR-LICENSE.txt)、[Koffi](KOFFI-LICENSE.txt)、[YAML](YAML-LICENSE.txt)、[SDK Client](MCP-CLIENT-LICENSE.txt)、[SDK Server](MCP-SERVER-LICENSE.txt)、[SDK Core](MCP-CORE-LICENSE.txt)、[Turndown](TURNDOWN-LICENSE.txt)、[GFM](GFM-LICENSE.txt)、[diff](DIFF-LICENSE.txt)许可随交付保留。

讲解、四图和题目本轮制作。FixtureShell参考官方tool-pwsh/tests/tools.spec.ts的可控句柄边界，明确为替身；MCP Server使用实际SDK并返回虚构数据。File只替换暂存清理钩子，保留真实文件原语；Node解析hook不替换官方实现。结构性Agent只用于组件夹具，综合程序用真实AgentLoop。''')
put('knowledge-bridge.md','''# H13–H16 衔接与重复检查

| 课 | 核心责任 | 本课如何承接 | 保留的界限 |
|---|---|---|---|
| H13 | 定义、注册、Schema、Scope、Step准入 | 对照四家族实际注册，综合允许集合限制远端write | 不重写完整Schema教程；不是所有工具同一种校验接线 |
| H14 | Executor/Pipeline/结果/取消/调度 | 用真实Native/Pipeline和Loop获得结果及请求前缀 | 本例并行上限1不是固定调度算法；error.info与Session投影分开 |
| H15 | 审批、逐调用策略、OS文件约束与观察 | File仅复习意图/版本，Shell明确替身无沙箱保证 | Scope≠OS；文件sandbox≠网络限制；不重写后端探测 |
| H16 | File/Shell/Web/MCP能力组合 | 工具地图、五项允许能力、两类失效状态、清理责任 | 不提前讲H17持久化、H20完整恢复或H27全竞态矩阵 |

新事实须注意：workingDirectory的当前目录与原始sandbox工作区不同；read_image附件条件注册和execute模型路线检查不同；Web选择失败时ready为true；MCP发现失败保留旧代但注册冲突不保留半套新代。正文据真实源码和局部实验说明，没有改动前课。

第四模块准备只列历史证据与候选问题，不进行正式一致性裁决，不自动修订H13–H15。''')
put('h17-handoff.md','''# H17 前置与知识边界

仅交接，不开发H17。学员进入前应能从X_combined区分ToolCallBlock、运行时ToolExecutionResult、Session的tool/call与tool/result，以及下一请求里的工具历史。限制案例有七个调用/结果，write被拒绝，服务器计数0；这不是副作用回滚。

H17再展开SessionEvent、seq、Surface、deriveMessages与投影；本课只用第二真实Session重建各请求当时的前缀，不教完整事件溯源或持久化恢复。内存append接受不等于磁盘flush，stdio连接也不属于从Session历史自动重放的外部资源。

保留未验证项：真实LLM、完整E、原生Shell与三平台沙箱、Streamable HTTP、外部API/认证、完整MCP重连竞态、学员试读和实测时长。H20/H27/H28等分别扩展恢复、连接可靠性与交互环境，不把本课受控测试变成这些能力的全面证明。''')
coverage={'host':os.name,'node':lab['node'],'actualOS':'Windows win32 x64 in this run','File':'Actual tool-fs + fs-sandbox/local + working-directory/observation; native Windows file IO; cleanup hook only replaced','Shell':'Actual tool-pwsh/shell-env/Jobs/Tools; explicit FixtureShell, no Bash/PowerShell process','Web':'Actual WebRuntime/tool-web/activation; memory providers only; HTTP URL hygiene pure function; no DNS/network','MCP':'Actual mcp-client plugin + SDK client/server/core2.2.0 + stdio Node child processes; local fixture Server logic','MCPReconnect':'One actual stdio disconnect/reconnect observed with new PID; disabled reconnect retained tools and failing calls','MCPResourceScope':'Actual resource runtime/layers; scope-only provider explicitly memory fake','AgentLoop':'Actual multi-family scoped Loop/Native/Session; scripted adapter, per-request replay prefixes checked','NOT_RUN':['complete application E','real LLM/API credentials','actual web search/fetch/network targets','native Bash/PowerShell and process sandbox Linux/macOS/Windows','MCP Streamable HTTP/external server authentication','full reconnect/backoff/exhaustion/late-generation/closure-failure matrix','real image decode/attachment storage','hostile filesystem races','independent external review','learner trial and measured time']}
(E/'backend-coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
put('backend-coverage.md','''# 平台、后端与传输覆盖

实际宿主为Windows win32 x64；跨平台原生结论不外推。机器范围见[backend-coverage.json](evidence/backend-coverage.json)。

| 家族 | 真实受测组件/实际边界 | 替身 | 未运行 |
|---|---|---|---|
| File | tool-fs/fs-sandbox/local/workingDirectory/观察，真实Windows文件IO与原子发布；逐个明确文件清理 | 图片注册测试的Mock附件，未解码 | 真实图片/持久附件、恶意链接竞态、其他平台原语 |
| Shell | tool-pwsh/shell-env/Jobs/Native/Pipeline，前台/后台/取消接线 | FixtureShell固定只读命令输入与输出句柄 | 原生pwsh/bash、真实环境清理、超时强杀/spill、各平台进程沙箱 |
| Web | Runtime选择/ready、工具格式化/上限、错误与取消；纯URL校验 | 离线Search/Fetch，所有URL只作数据 | 真实HTTP/DNS/SSRF目标测试、厂商API/凭据、网络隔离 |
| MCP | 实际插件+SDK2.2.0+stdio管道+可信Node Server，发现/调用/资源/刷新/断线/一次重连 | Server业务是假数据；scope-only资源提供方是内存替身 | Streamable HTTP、外部Server/认证、完整重连竞态、phase2注册冲突执行 |
| 综合 | 实际AgentLoop/Scope/Registry/Native/Session，Loop与Adapter输入及每次前缀重建 | 脚本模型、Shell/Web替身 | 完整Host E、真实模型语义质量 |

没有Mock MCP Transport：这里真正经过SDK协商和stdio消息。也没有把本地Node进程通信写成原生Shell或OS沙箱验证。模型受控回复用于可重复行为，不能证明学员或真实LLM理解了资料。

网络限制依据固定HTTP provider的requestOnce与官方说明：URL/重定向卫生不构成完整私有目的地址限制，policy中的公开地址注释不能替代实现。原生runner、完整E与真实学员继续NOT_RUN。''')
cases=re.findall(r'^# Subtest: (.+)$',(E/'lab-tests.txt').read_text(encoding='utf-8'),re.M)
put('test-evidence.md','''# H16 C/D 实验证据

23项TAP通过：9 C + 14 D。实践A/B/C/D/X不是证据级别；B级Cordis依赖不重复计数，E完整应用未运行。

| 场景 | 实际断言边界 | 数量 |
|---|---|---|
| 参数/URL/命名 | 官方read参数3、无网络URL卫生4、公开MCP命名2 | 9 C |
| File A | 真实工具读/写/编辑、流窗口与源行截断提示、歧义/未观察/取消、观察缺失、附件条件与卸载 | 1 D |
| Shell B | 真实消费者/env/workingDirectory/Jobs，缺执行器、退出码7、无Jobs拒绝、取消、job_output；进程为替身 | 1 D |
| Web C | 八组真实Runtime/工具/准入组合，唯一/显式/零/歧义/配置缺失/不可用/ready=false/取消；404与格式上限 | 8 D |
| MCP D | 实际SDKstdio两本地Server，同名路由、资源、刷新失败保留、断线保留或一次重连、Scope、卸载 | 2 D |
| 综合X | 实际Loop四家族结果历史、两侧请求/每次事件前缀重建；允许集合阻止远端write，服务器计数0 | 2 D |

[practice-output.json](evidence/practice-output.json)保存全部逐场景输出，X含每次Loop边界与Adapter输入及事件前缀；D包含公开/原始名、PID、变更轨迹与失败。保留规范value/content/meta/isError及真实Session事件，教学trace不伪装成审计事实。

[lab-tests.txt](evidence/lab-tests.txt)、[lab-results.json](evidence/lab-results.json)为最新结果与hash。所有run-时间戳-*.json保留args、exit、stdout、stderr、程序hash、scratch，包括导入/夹具失败。negative-answer的非零为预期失败，拒绝“无provider必注销工具”的错误答案。上游完整测试套件未运行，不把静态参考计PASS。

## 实际TAP条目

'''+ '\n'.join('- '+c for c in cases))
put('renderer-regression.md',f'''# Renderer与阅读检查

既有Renderer12项通过；内容/AST检查使用真实parser和LessonMarkdown SSR，检查metadata/checkKey全局唯一、9完整程序、4图、24折叠默认关闭、10思考题与综合答案、实际组件/接口、图片注册调用无when等。源码AST只证明结构，运行行为看C/D。静态HTML与当前SSR逐字核对，未改Renderer或业务路由。

1440/390/320均验证：无页面横向溢出；图片加载/字体/图注；9程序剪贴板逐字匹配；24折叠Enter开闭；10答案；4原图popup；移动代码局部横滚；静态页无无效复制按钮。长答案截图暂增viewport高度以完整截取，DOM同时记录末段；不把截图截取问题算产品缺陷。17份最终PNG经作者view_image检查，非独立视觉审计。原始结果见[visual-qa.json](evidence/visual-qa.json)与[manual-review.json](evidence/manual-review.json)。

默认正文约{m['defaultBodyCjk']}个CJK字，总约{m['allBodyCjk']}字，代码{m['codeLines']}行、默认展开{m['defaultCodeLines']}行；排除代码/URL/注释的计数不代表实测时长。SVG最小文字28px，320折算约{next(v for v in visual['viewports'] if v['width']==320)['minimumFigureTextPx']:.1f}px，原图可打开。真实登录课程页、进度API与设备实机未测。''')
put('review-log.md','''# 作者审查记录与范围差异

作者自审，不是独立外审；未确认遗留P0/P1。

| 项 | 核对及处理 |
|---|---|
| 蓝图与任务 | 保留能力三角色主线；题名与四图/四实践/综合按新任务扩展。stdio连可信假Server，协议真实；不教完整H27竞态、不启动正式集中审查 |
| read_image位置 | 实际模型路线检查在execute内，附件影响注册；不误写成when |
| HTTP网络说明 | policy注释提及地址固定，但requestOnce只委托undici，官方文档说明不限制目标；按实际控制流表述，无真实抓取 |
| 初次依赖/解析失败 | 缺diff、源码诊断子路径及Node hook递归问题均修复；直接与传递依赖回到固定上游integrity，未改官方实现 |
| 首轮测试断言 | 机器码为error.info.code；行上限另加截断提示；修正夹具预期，不改实际行为 |
| Scope资源夹具 | 插件显式inject mcpResources后再取服务，保留依赖纪律 |
| 阅读验证 | 内容检查只在代码块外禁止原始HTML，代码中的恶意script字符串是安全转义的测试资料；移动长答案完整截取另作检查 |
| 清理 | 只替换fs暂存清理钩子，每次单个明确文件，空目录保留；SDK真实关闭stdio子进程 |

有真实成功、失败、拒绝与取消轨迹，错误答案非零是预期门禁。未经验证的后端/协议/学习效果保持NOT_RUN；历史H13–H15没有修改，准备包不是审查结论。''')
put('acceptance.md','''# H16 十四项交付验收

| 项 | 已交付与证据 |
|---|---|
| 1 正式正文 | 能力地图、四家族、比较、排错、边界 |
| 2 HTML | 实际LessonMarkdown私有静态预览 |
| 3 四图 | SVG/PNG/脚本/三宽度 |
| 4 四实践 | 真实组件、完整程序、输入/预期/折叠答案 |
| 5 综合实践 | 五项能力与受限远端write，真实Loop及请求前缀 |
| 6 思考题 | 10折叠详细答案，前5项推导 |
| 7 源码 | 固定Commit60条，路径/函数/参考测试/证据级别；9552文件锁定 |
| 8 C/D | 9 C + 14 D，原始运行与失败历史 |
| 9 Renderer | 既有12项及新增内容/AST |
| 10 三宽度 | 1440/390/320复制、折叠、键盘、原图、局部滚动 |
| 11 跨课 | knowledge-bridge，保留原课范围 |
| 12 H17 | h17-handoff，仅前置不开发 |
| 13 质量 | CONDITIONAL GO，作者质量与未验证项分列 |
| 14 准备包 | 十类材料与16图索引，仅准备不正式审查 |

Git只允许两个H16路径；保护已有课程、前三次审查、历史证据、output与用户改动。未改价格/权限/数据库/线上状态或发布。''')
put('quality-review.md',f'''# H16 教学质量审查

**CONDITIONAL GO**：作者研发交付合格，未确认遗留重大技术错误或P0/P1；不构成安全审计、正式第四模块审查或发布批准。

## 作者内容质量

以隔离项目说明贯穿Definition/Provider/Consumer、四层观察、File/Shell/Web/MCP比较与排错；不重写H13–H15。4原创图、4实践及综合X、9份折叠完整程序、10折叠思考题/详细答案齐备。默认正文约{m['defaultBodyCjk']}字、代码默认展开{m['defaultCodeLines']}行。蓝图100～135分钟，任务扩展后估240～320分钟，按三段安排，非实测且负担明显增加，后续试读须校准。

## 实际技术与阅读证据

9 C + 14 D共23项通过。File使用真实工具/存储/观察；Shell为真实消费者/env/Jobs加显式执行器替身；Web为真实Runtime/工具/准入加内存提供方；MCP为真实SDK2.2.0和stdio子进程，Server业务为假数据，Scope资源额外提供方为替身。综合用真实Loop/Registry/Native/Session，脚本模型、Shell/Web替身，每次请求两侧和第二Session前缀重建。允许集合拒绝远端write，Server计数0。没有用静态配置解析冒充协议通信。

60条源码核对，{len(source['files'])}固定源/文档/配置文件Git blob+SHA256核验。12项Renderer及内容/AST通过；三宽度交互通过，17份截图作者查看。错误答案预期失败，所有实验失败历史保留。关键差异：read_image执行期路线门禁、Web选择失败ready=true、HTTP不具有完整私有目标限制、MCP两阶段失败不等价。

## 条件性结论与未验证范围

File自动观察须有消费者/插件/后端条件，Scope不是OS隔离。Shell测试不含真实pwsh/bash、原生进程环境清理、超时强杀或三平台sandbox。Web不发HTTP/DNS/真实检索请求，未验证外部API认证或网络目标防护。MCP实际验证本地stdio、两Server、变更、一次重连和禁重连保留，不覆盖Streamable HTTP、外部Server认证、完整退避/耗尽/旧代迟到/关闭失败矩阵，也未执行phase2注册冲突。图片仅测注册及前置拒绝，没有真实解码和持久附件。

外部数据标注不等于防提示注入；合法MCP结果与服务器instructions都不授予本地权限。统一工具结果不等于统一执行环境，Shell非零状态与isError也不同。完整E应用、真实模型语义质量、独立外审、真实学员与实际时长继续未验证；未为获得PASS关闭约束或扩大权限。

## 模块准备与范围

module-four-review-prep只汇总历史与本课材料、候选问题、16图及待测边界。没有重跑前三课行为矩阵、没有形成模块GO结论、没有修订H13–H15、没有开发H17或发布。基线{before['base']}，保护{len(before['files'])}份已有文件，包括用户当前wechat-contact.jpg及全部output；最终门禁核hash和暂存范围。

## 后续条件

试读应检查能否分清注册/准入/执行、服务与工具Definition、Web信任和MCP原名路由；记录首次运行环境时间和正文负担，校准240～320分钟。正式集中审查和原生/E验证须另行启动，不能由本准备包自动进入。''')
# 模块准备：历史结果索引，不重跑旧课或作正式审查结论。
modules=[];figureItems=[]
for n in range(13,17):
 d=P/f'docs/deepseek-harness-v2/h{n}';ev=d/'evidence';labs=load(ev/'lab-results.json');tap=(ev/'lab-tests.txt').read_text(encoding='utf-8');metrics=load(ev/'content-check.json')['metrics'];assertions=load(ev/'source-assertions.json');lesson=P/f'course-content/internal/deepseek-harness/h{n}/lesson.md'
 counts={k:len(re.findall(r'^# Subtest: '+k,tap,re.M)) for k in ['C','D']};assert sum(counts.values())==labs['tests']
 estimated=re.search(r'^estimatedTime:\s*"([^"]+)"',lesson.read_text(encoding='utf-8'),re.M).group(1)
 modules.append({'lesson':f'H{n}','tests':labs['tests'],'counts':counts,'assertions':len(assertions),'metrics':metrics,'estimatedTime':estimated,'lessonSha256':sha(lesson),'labResultSha256':sha(ev/'lab-results.json'),'qualitySha256':sha(d/'quality-review.md'),'basis':'Prior report preserved; H16 current actual tests. No module-wide re-run or formal verdict.'})
 for fig in load(ev/'figures.json'):
  figureItems.append({'lesson':f'H{n}','id':fig['id'],'source':(d/fig['source']).relative_to(P).as_posix(),'image':(d/fig['image']).relative_to(P).as_posix(),'sourceSha256':sha(d/fig['source']),'imageSha256':sha(d/fig['image']),'caption':fig['caption'],'reviewStatus':'INDEX_ONLY; prior author QA for H13–H15, current author QA H16; not formal module review'})
(PREP/'evidence-matrix.json').write_text(json.dumps({'status':'PREPARATION_ONLY','modules':modules,'sumCaseReports':sum(x['tests'] for x in modules),'C':sum(x['counts']['C'] for x in modules),'D':sum(x['counts']['D'] for x in modules),'assertionEntries':sum(x['assertions'] for x in modules),'uniqueSourceCount':'not summed; overlapping fixed source locks','E':'NOT_RUN'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(PREP/'figures-index.json').write_text(json.dumps({'status':'INDEX_ONLY','count':len(figureItems),'figures':figureItems},ensure_ascii=False,indent=2)+'\n',encoding='utf-8');assert len(figureItems)==16
prep('README.md','''# 第四模块集中审查准备包

**PREPARATION ONLY。** 不执行正式集中审查，不给出模块GO，不自动修改H13–H15或开展H17。以四课现有产物建立可复核入口，历史PASS不冒充本轮重跑。

1. [知识依赖矩阵](dependency-matrix.md)
2. [统一工具能力模型](unified-tool-model.md)
3. [四家族组件地图](architecture-map.md)
4. [源码与行为结果汇总](source-and-test-summary.md)
5. [证据等级矩阵](evidence-levels.md)及机器数据
6. [16图审查索引](figures-index.md)
7. [候选重复/跳跃/术语问题](potential-issues.md)
8. [安全边界与未验证](safety-boundaries.md)
9. [学习负担/试读待测](workload.md)
10. [H17交接](h17-prerequisites.md)

以后正式审查应从具体问题登记、限定变更与必要复测开始；此处候选问题不是已确认缺陷。''')
prep('dependency-matrix.md','''# H13–H16 知识依赖矩阵

| 后课/前课 | H13 | H14 | H15 | H16新增 |
|---|---|---|---|---|
| H14 | 精确定义、Schema、Scope、ResolvedSet | 执行三阶段与结果 | — | — |
| H15 | 可见不授权；Scope非OS | pre/ask/guard与取消/结果 | 审批、逐调用策略、文件效果/新鲜度 | — |
| H16 | 家族注册/当前允许集 | 统一执行与Session结果 | 每家族约束条件 | File/Shell/Web/MCP实际接线、Web ready、MCP同步/资源 |

建议前置检验：H13能区分inspection与admitted；H14能区分主体完成与提交；H15能说明批准后guard仍拒绝；H16能解释注册保留而调用失败。以上是作者待校准门槛，不是通过真实学员统计确定的考试线。''')
prep('unified-tool-model.md','''# 统一工具能力模型

模型请求声明 → ToolCallBlock/ID → Registry与ResolvedToolSet → Native/Pipeline → 具体Consumer/后端 → 规范结果与ContentBlock → tool/result/下一请求。每条箭头须注明实际条件，不能把它画成所有工具必走的一条安全链。

六个独立问题：看得见吗、此Step准入吗、允许执行吗、后端就绪吗、效果怎样约束、事实怎样记录。审批不是所有工具默认必问；guard不替代OS；fs意图不是进程检查；Web ready不是网络健康；MCP发现不授权Scope；内存提交不是flush。

H16综合保存每次请求当时的事件前缀与两侧输入，可作为后续审查的候选跨课样例；目前只索引，没有作正式四课一致性裁决。''')
prep('architecture-map.md','''# 四类工具的组件地图

| 家族 | Consumer | 服务/提供方 | 额外条件与所有权 |
|---|---|---|---|
| File | tool-fs | FileSystem → local/sandbox等 | workingDirectory；观察插件；图片附件/模型路线；可信路径围栏 |
| Shell | tool-bash/tool-pwsh | ShellExecutor → local/sandbox → subprocess | shell-env；可选Jobs/控制器；任务与进程清理分层 |
| Web | tool-web | WebRuntime → 独立Search/Fetch注册提供方 | 逐调用选择；Step ready；输出限制；网络目标另管 |
| MCP | 每服务器client适配定义 | SDKClient/Transport ↔ Server | 名称/Scope、发现/切换、重连；资源独立runtime；无ctx.mcp |

统一入口不意味着家族同构。MCP资源、服务器instructions与Prompt模板不能混为一个机制。后续审查可对照H16比较表逐格检查实际配置；这里未运行外部系统。''')
table='| 课 | C | D | 合计 | 源码条目 | 依据 |\n|---|---|---|---|---|---|\n'
for x in modules:table+=f'| {x["lesson"]} | {x["counts"]["C"]} | {x["counts"]["D"]} | {x["tests"]} | {x["assertions"]} | 历史报告（H16为本轮） |\n'
prep('source-and-test-summary.md','# 源码与行为测试汇总\n\n'+table+'\n136为四份报告的测试项合计，218为源码核对条目合计，不是独立安全保证数。全部固定同一上游Commit，但源码锁重叠不相加为唯一文件数。H13–H15未在本轮重新执行；原始结果hash保存在evidence-matrix.json。\n\n'+ '\n'.join(f'- [{x["lesson"]}源码](../../h{int(x["lesson"][1:])}/source-checklist.md) / [{x["lesson"]}质量](../../h{int(x["lesson"][1:])}/quality-review.md)' for x in modules))
prep('evidence-levels.md','''# A/B/C/D/E 证据等级矩阵

| 等级 | 四课材料当前定位 | 审查时不能怎样合并 |
|---|---|---|
| A | 教学业务、受控模型/应答、Mock Executor/Provider等替身 | 不能把这些当原生后端PASS |
| B | 真实Cordis是多数C/D的依赖 | 不重复累加为独立用例 |
| C | 报告合计90个单组件检查 | 每个结论按具体断言范围，不概括全部能力 |
| D | 报告合计46个局部组合检查 | H16实际stdio仍不等于完整Host E |
| E | 完整应用/外部提供方集成均未验证 | 不因模型请求或SDK成功就升级 |

H13以Schema/Registry为主，H14为Pipeline/Loop，H15为Approval与策略/文件，H16为能力家族与实际本地通信；替身和宿主不同必须保留。机器矩阵记各报告hash，不代表本轮模块重跑。''')
ft='# 16张核心教学图审查索引\n\n仅索引已有图和hash；不是新一轮模块视觉审查。H16三宽度与作者检查为本轮证据，旧课保留各自QA记录。\n\n| 图 | SVG | PNG | 图注与后续核对重点 |\n|---|---|---|---|\n'
for f in figureItems:ft+='| '+f['id']+' | [源图]('+rel(P/f['source'])+') | [渲染]('+rel(P/f['image'])+') | '+f['caption'].replace('|','/')+' |\n'
prep('figures-index.md',ft)
prep('potential-issues.md','''# 待正式审查的问题候选

下列是议程，不是已确认缺陷，不自动修订旧课。

| 候选问题 | 正式审查应对照的证据 |
|---|---|
| Schema、ToolDefinition、能力Definition是否混说 | H13包装校验位置与H16三角色/SDK桥接 |
| 可见/准入/执行成功是否用“可用”混说 | H13ResolvedSet，H16Web none/not-ready、MCP断线保留 |
| 守卫/Scope/沙箱/观察是否被画成总链 | H14/H15分支与H16两种能力消费者 |
| 取消是否暗示回滚或原生进程已停 | H14drain，H15审批race，H16Mock Shell与stdio所有权 |
| 相邻课程的复习量是否过重 | 四课defaultBodyCjk、折叠程序及真实试读记录 |
| H16与H27资源/重连是否越界 | H16只一次stdio重连及最小资源读取，深竞态另课 |
| 术语error.info与Session error投影是否一致 | H14结果材料与H16明确形状区别 |
| HTTP注释与实现差异是否传递准确 | requestOnce、官方Web网络说明及纯URL探针 |
''')
prep('safety-boundaries.md','''# 工具安全边界与未验证事项

全模块统一保留：Schema不替代授权，Scope不等于OS权限，审批不替代沙箱，full不等于应用全面安全，partial不可隐藏，文件sandbox不控制网络，先读观察为可选组合，外部结果不是本地授权，Session记录不重放连接/进程副作用。

H15的三平台原生进程runner仍未运行；H16增加的是Windows本地stdio SDK通信和真实文件工具，不补齐这些runner。完整E、真实模型/搜索API/凭据、Streamable HTTP、真实图片附件、恶意竞态、完整MCP重连矩阵仍未验证。

固定官方安全说明为实验软件且未经安全审计；C/D数量不能代替正式安全审计。夹具遵守单个明确文件清理，保留空目录。正式审查不应为追求PASS关闭约束或扩大权限。''')
work='# 学习负担与真实学员试读待测\n\n| 课 | 默认CJK文字 | 全部代码行 | 默认代码行 | 作者估时 |\n|---|---|---|---|---|\n'
for x in modules:work+=f'| {x["lesson"]} | {x["metrics"]["defaultBodyCjk"]} | {x["metrics"]["codeLines"]} | {x["metrics"]["defaultCodeLines"]} | {x["estimatedTime"]} |\n'
work+='\n计数排除代码/URL/注释，默认值排除deepdive；只是负担信号。H16相对蓝图100～135增加到240～320分钟，源于四家族实际实验、SDKstdio与综合请求对照；没有实测数据支持此估时。\n\n待测：首次环境准备时间、每段阅读/运行/预测耗时、注册vs准入区分、外部信任误解、跳过折叠答案后的独立完成率、综合拒绝轨迹解释。先采真实试读再调整，不以正文长度线性推时长，也不据测试通过推理解通过。'
prep('workload.md',work)
prep('h17-prerequisites.md','''# H17 前置交接

只交接，H17未开发。建议从H16综合的五或七个call/result事实、下一请求工具消息及前缀重建开始，引出日志与读视图的差异；再转入H17自己的Session/Surface/Projection主线。

不将tool/result、运行时tools/result、Adapter输入、磁盘flush合并为一个事件。不把恢复Session等同恢复文件观察、外部MCP连接或Shell进程。完整持久化重启、fork与快照属于后续课程边界；真实学员前置掌握情况尚未验证。''')
print('H16 reports, coverage, licenses and 10-part module review preparation written; no formal module review')
