import collections

b=['# DeepSeek Harness 源码研究报告',f'固定版本 `{COMMIT}`；研究日期 2026-10-28。所有源码链接均绑定该版本。',
'''## 取证范围与方法

先阅读中英 README、architecture、cordis-primer、development、testing、tool-execution-pipeline，再以子系统文档为索引，逐包核对契约、入口、核心分支、异常和相邻测试。研究围绕教学问题选路径，不声称逐行读完近两万文件，也不把阅读测试等同运行测试。

Git partial checkout 因网络中断失败后，改用官方 codeload 的固定 Commit ZIP；使用 Git tree 的 blob 标识逐一校验归档字节。19874 个 blob 原样匹配，另 3 个 .cmd 按仓库 .gitattributes 声明的 CRLF 工作树/LF 规范形式匹配；无内容不符。SHA-256、方法与明细见 source-integrity.json。解压缓存不进入 AI Foundry 仓库，课程只保存固定链接、索引和少量阅读锚点。

首轮可执行验证采用实际锁定源码的 Cordis、detached Session、原生内存工具流水线探针；另有六模块教学原型的 24 项断言。官方完整 Vitest/快照/API e2e/原生沙箱/真实浏览器桌面/跨进程恢复均未运行。部分官方测试清理夹具含递归删除，因此本轮仅静态审阅这些测试，不在用户禁止批量删除的环境中执行它们。

## 仓库结构与模块关系

`packages/<领域>/<包>` 是实际两层布局；不能把 packages/core 当单包。apps/cli 为统一 profile 启动入口；apps/web、desktop/desktop-host 是载体；vendor 是本仓库固定的 Cordis 等依赖源；native/system 承载平台原生能力；scripts 和 .github/workflows 组织构建/类型/文档/测试门禁。benchmarks 按跨包用户路径组织，包旁 .perf.ts 是诊断层。

| 领域 | 关键契约 / 实现 | 与主线的关系 | 相关课程 |
| --- | --- | --- | --- |''']
module_rows=[
 ('boot / bundle',PROFILE,'export function loadProfile','Profile 决定有序组合层，Loader 挂载依赖树；base-backed profiles 与 sdk-minimal 区分。','H04/H08'),
 ('core/agent',AG,'export class AgentRegistry','活跃注册、factory 委托和 initiator scope；不是默认驱动实现。','H09'),
 ('core/agent-loop',LOOP,'export class ReactLoopAgent','默认驱动器，负责 inbox、turn/step、请求与工具阶段；loop 自身也是插件。','H03/H10–H12/H20'),
 ('core/system-prompt',PROMPT,'export class SystemPrompt','汇总片段、上下文和工具描述；模型选择在 step 准备时快照。','H11'),
 ('llm',LLM,'export class LlmRuntime','消息/流词汇、适配器注册、一次性 prepared call、能力和错误转换。','H12/H26'),
 ('core/tools',PIPE,'export class ToolExecutionPipeline','注册/可见性与原生/PTC 执行器分离；共享调用流水线结算权威结果。','H13–H16'),
 ('core/session',SESSION,'export class Session','事件日志为事实来源；surface 和消息投影派生模型历史。','H17'),
 ('session/persistence','packages/session/session-persistence/src/handle.ts','export interface SessionHandle extends','create/open 返回单写者句柄；JSONL provider、lease、格式 migration 各有职责。','H18'),
 ('session/projection',SP,'export class SessionProjectionRegistry','插件注册 fold，领域服务持有 handle，客户端读取选定 snapshot。','H17/H23'),
 ('compaction','packages/compaction/compaction-basic/src/region.ts','compactSurfaceRegion','可选能力；记账事件与 surface replacement 分开；保留原始事实。','H19'),
 ('sandbox','packages/sandbox/sandbox/src/index.ts','abstract confine(','定义 argv 文件效果包装；local/SSH 为提供方，shell 为消费者。','H15'),
 ('mcp','packages/mcp/mcp-client/src/connection.ts','export function startConnection','每服务器一个插件连接；不发布共享 ctx.mcp；资源有独立共享 seam。','H16/H27'),
 ('subagent','packages/subagent/subagent/src/index.ts','async startActivation(','统一 activation 与能力准入、结果投递、子级所有权。','H21'),
 ('workflow','packages/workflow/workflow-ptc/src/index.ts','start(request:','可选模型脚本编排，PTC 引擎消费 subagent seam；不是 DAG 声明式引擎。','H22'),
 ('jobs / goal / schedule','packages/goal/goal/src/index.ts','create(agent:','后台资源、同会话目标续跑、定时 delivery 是不同生命周期。','H22'),
 ('API / SDK','packages/api/session-controller/src/assistant-stream.ts','','Web follow 消费 live stream；SDK JSON-RPC 转发其协议控制/事件。','H23'),
 ('browser / computer use','packages/experimental/browser-use-runtime/src/index.ts','export class SessionResources','浏览器按精确 Agent 管资源；共享桌面不自动为 Session 预留。','H28'),
 ('telemetry','packages/session/session-telemetry/src/coordinator.ts','private redact(','记录导出走部署 redaction waterfall；默认无规则，须另行配置。','H29')]
for title,p,needle,desc,lessons in module_rows:b.append(f'| {title} | {cite(p,needle)} | {desc} | {lessons} |')
b.append('''
## 三条关键运行链

**初始化与所有权：** registry 将调用者上下文传给 factory；先 prepare/acquire 存储与 scope，在 Session enter/announce 后执行 setup，再 commit、enter/announce Agent；创建事件等待结束后才释放排队工作。失败路径取消未发布工作并 unwind；handle 的 dispose 等待 drain。源码对应 H09 的 initializeAgent/createAgent 与 H07 的 lifecycle tests。

**请求与工具：** turn 在 claim 前打开，preStep 做模型选择快照、toolSet 与 prompt assembly；拒绝/首条空输入可零步结束。进入 step 后 prepareCall 绑定 adapter 能力，提交 system/user/runtime-context，再记录 header/context 并冻结派生历史。流结算成 message 或 attempt 后，工具批次进入 registry/executor/pipeline，结果与附加上下文决定是否还欠下一请求。重试发生在同一步内部，不重复 assembly/preStep 或首次用户消息。

**事实与恢复：** Session 的 append 验证并快照事实；surface 管模型可见节点，deriveMessages 派生消息。SessionHandle 负责持久读写/flush/close，JSONL provider 负责物理 framing、generation 与 lease；读 open 可在内存迁移，写 open 发布最终版本后继。恢复修复未闭合尾，Fork 复制精确前缀并使用新身份，不继承外部执行资源。

以上是默认主线，不把所有可替换 provider/自定义中间件强行画成同一链。

## 可追溯关键断言

下表将容易讲错的实际实现单独固定。`官方实现` 指观察到的代码行为；动机若只有我们的推断，在下一节单列。

| 官方实现事实 | 直接依据 | 教学影响 |
| --- | --- | --- |''')
facts=[
 ('Turn 可零 Step，且先开 turn/start 再 preStep。',LOOP,'private async turn():','H10 画首条输入拒绝/空输入分支。',80),
 ('Waterfall 是 next 环绕；serial 遇到非 null/false/undefined 返回值会停止。',EV,'async serial(...args','H06 把 0 与 false 作对照，并画返回方向。',63),
 ('Fiber 卸载会汇合多个异步 disposer；不能假设全局严格逆序。',FIB,'private async _unload()','H07 同一 effect 内显式安排存在依赖的释放。',22),
 ('patch 直接赋覆盖字段；config 整替换，未匹配目标 warn/skip。','vendor/include/src/index.ts','export function applyEntryPatches','H08 不按深合并推断丢失字段。',95),
 ('创建发布在 setup.commit 后，agent announcement 完成前不释放工作。',FACT,'const setupCommit = await','H09 以 publication transaction 解释回滚。',20),
 ('prepared call 只能 dispatch 一次且配置必须一致。',LLM,'let dispatched = false','H11/H26 不复用准备调用来掩盖路由变更。',40),
 ('重试不重跑 preStep/assembly，firstAttempt 只提交一次原用户消息。',LOOP,'let firstAttempt = true','H20 区分 Step 和 Attempt。',48),
 ('工具必须声明 output.schema/render；run_code 是保留名。',TOOLS,'register(definition:','H13/H25 不使用过时简化签名冒充真实 API。',42),
 ('审批 allowed-once 后仍检查 guards；缺渠道或无 agent 的 ask 拒绝。',PIPE,'async prepare(','H15 审批不越过拥有者守卫。',54),
 ('工具 body 已开始时取消仍等待它 settle；不能强杀同进程代码。',PIPE,'private async dispatchToolBody(','H20 用真实副作用边界解释取消。',43),
 ('最终 observer 接收冻结结果；其 throw/reject 只产生诊断。',PIPE,'private notifyResult(','H14 不给 tools/result 设计否决回传。',29),
 ('模型消息从 surface 派生，outer array 分离而消息共享深冻结。',SESSION,'deriveMessages():','H17 不把 log 当 messages 数组。',30),
 ('摘要记账不是 surface；实际 summary replacement 走 user/message。','docs/subsystems/compaction.zh.md','压缩通过声明合并','H19 同时展示原日志和可见投影。',23),
 ('SandboxMode 定义文件效果，网络与进程可见性不在范围。','packages/sandbox/sandbox/src/index.ts','type SandboxMode','H15 必讲 full/partial 与未审计状态。',35),
 ('spawn provider 不继承父对话。','packages/subagent/subagent-spawn-in-process/src/index.ts','readonly inheritsParentContext','H21 区分 spawn 与 fork。',9),
 ('Workflow phases 是进度元数据，不隐含执行结构。','docs/subsystems/workflow.zh.md','`phases` 仅用于进度展示','H22 不能把它画成保证的 DAG。',10),
 ('遥测 redaction 默认透传，本 seam 不自带规则。','packages/session/session-telemetry/src/coordinator.ts','private redact(','H29 不宣传自动脱敏。',7),
 ('浏览器 profile/登录状态不从日志恢复，桌面 provider 不预留 Session 独占。','docs/subsystems/browser-use.zh.md','浏览器 profile','H28 区分日志、浏览器状态和桌面输入。',12),
]
for fact,p,needle,impact,span in facts:b.append(f'| {fact} | {cite(p,needle,span)} | {impact} |')
b.append('''
## 设计动机与技术取舍的证据级别

**官方文档明确表述：** 一切皆插件实现可替换组合；模型可见输入必须可从日志重建；能力 seam 区分定义、提供方与消费者；Host/Client aggregate 分开避免同 program 的 Context 声明冲突。依据见 architecture/development 与对应源码。可在教材中写“官方说明”。

**我们的设计分析：** 契约和持久事实便于测试与替换，同时带来组合合法性、资源 drain、解释器版本与生成图维护的成本；模型输出和业务执行分开便于独立守边界。这是对代码的分析，不代替官方作者对动机的表态。

**待确认：** 没有证据证明为什么每个超时阈值、默认重试次数、压缩 ratio 被选为当前值；不能推测为“经过最优性能测试”。不同 provider/平台的隔离效果、长时资源压力、真实语义质量和生产部署可用性没有在本轮测量。源码中存在相关测试，只能证明相应测试设计存在，不能替我们运行得出结论。

## 测试与异常阅读索引

每讲 A 的字段 17 给出具体测试。evidence/test-index.json 保存真实测试名称、行号与固定链接，供后续作者定位断言，不是复制整套测试。关注异常回归：tools 的未知/隐藏/输出非法/策略抛错；loop 的取消、请求重试、冻结、首输入拒绝、scope teardown；Session 的 seq、surface、fork、repair、lease；subagent 的 activation/外部 lifecycle；MCP 的 negotiation/reconnect；workflow 的 meta/realm/caps；telemetry 的 redaction listener。

## 限制与安全边界

README/SAFETY 明确为实验性开发者预览，未接受安全审计，不应视为安全或可用于生产环境的软件。本课程研究其工程设计，不作已审计生产安全背书。策略/审批/沙箱不能防止对已授权资源的所有损害。第三方插件、模型命令、外部 MCP 内容仍在威胁模型内。

Session append/turn end 与磁盘 durability 不等价；flush/checkpoint 有自己的所有者。未知工具写结果不能自动补成成功；进程硬退出可能缺少 attempt settlement 或 Job settled。Fork 不转移 Job/浏览器/桌面所有权。取消已交付输入或已写副作用不能撤销。

本轮没有运行实际 sandbox confinement、真实 MCP 服务器、真实模型 API、浏览器连接或桌面控制；没有调用产品启动器读取用户 Harness home。所有实验只用虚构数据、内存与可审查本地文件。

## 锁定版本与更新策略

以本次 source-lock/source-index 为可复核基线。更新时在独立缓存检出新 Commit，比较旧→新涉及的 API、路径、默认值、事件词汇、测试与安全说明；先标记受影响 Hxx、图号、概念卡和练习，再重生成行号与哈希。修改 A–G 和图源后做同层复验，最后建立独立课程版本。不得静默把链接切到 main、把某次最新 npm 的例子混进 V2.0，或把官方 PR/草案建议当已实现。旧版本留档用于在读学员复现。
''')
b.append('## 官方材料入口\n\n'+'\n\n'.join(cite(p,'',12) for p in ['README.md','README.zh.md','SAFETY.zh.md','docs/architecture.zh.md','docs/cordis-primer.zh.md','docs/development.zh.md','docs/testing.zh.md','docs/tool-execution-pipeline.zh.md']))
write('B-source-research.md','\n\n'.join(b))

tests={}
for l in LESSONS:
    for p in l['tests']:
        if p in tests:continue
        text=(SOURCE/p).read_text('utf-8');lines=text.splitlines()
        cases=[{'line':i+1,'declaration':s.strip(),'url':BASE+p+f'#L{i+1}'} for i,s in enumerate(lines) if re.search(r'\b(?:it|test|describe)(?:\.[\w.]+)?\(',s) and len(s)<420]
        tests[p]={'status':'STATIC_READ_NOT_EXECUTED','cases':cases,'sha256':hashlib.sha256((SOURCE/p).read_bytes()).hexdigest()}
write('evidence/test-index.json',json.dumps(tests,ensure_ascii=False,indent=2))

PRACTICE_ANSWERS=[
'propose=model；execute/record=runtime；approve=可信策略或用户通道。无工具可直答；工具提议必须经执行器。',
'从 package.json workspace→tsconfig paths→NativeToolExecutor.execute→tools pipeline→相邻 tests；不要按目录位置猜调用。',
'turn/start→step/start→assistant/message(tool-call)→tool/call→tool/result→step/end→下一 step→turn/end；live chunk 不是独立持久消息。',
'层顺序为有序 bundles→profile→home→overlay；sdk-minimal 不应用 base；练习仅用虚构配置。',
'消费方只用传入日志契约；更换日志对象不改插件。Context/inject 的官方版本还管理服务可用性，缩影不实现全部容器。',
'A+ B+ body B- A-；不 next 时 body=0。serial 的 0 停止，false 继续；官方探针有实际轨迹。',
'挂载后 hit=1；释放后再 emit 仍 hit=1；同一 disposer 重复调用不增加动作。真实复杂资源的 drain 另查 lifecycle test。',
'{provider:p,model:x} 被 config:{model:y} 覆盖后只剩 model:y；未知目标记录 missing 警告；原输入未变化。',
'setup 或 announce 任一步失败都不得返回可工作的半发布 handle；记录 acquired→released 一一配对，先 drain 再释放依赖。',
'拒绝/空输入均 model=0、无 step；tool→done 为 model=2/tool=1；inject 等待唤醒；教学 maxSteps=3 非官方配置承诺。',
'入场清单为不可变 snapshot；attempt 重试保持选择与 assembly，runtime facts 可刷新；取消异步准备前无用户/system 提交。',
'文本按块拼装；半截工具参数不执行；failed attempt 计入日志但不派生为模型消息；最终 role/内容由公共流契约决定。',
'全局 read/write、自有 write、全局 deny write 时自有 write 仍可见；继承多层需用官方 view 算。unknown/hidden body=0。',
'pre deny:body=0；body throw:body=1/isError；post block:body=1/isError。post 不能当副作用回滚，结果冻结。',
'无审批渠道、拒绝、批准后 guard deny、批准可执行的 body 次数依次 0/0/0/1；partial 不得标 full。',
'四条 seam 用同一 pipeline，MCP 仅桥接协议；测试只在本地 registered=[read] 时请求 write，body=0。发现本身不是授权。',
'三条教学事件仍 factCount=3，可见 messages=[summary]；破坏 seq 拒绝；deriveMessages 与 projection snapshot 是读视图。',
'子前缀深复制，改子不改父；unknown-write 禁止盲重试；只读/业务已证明幂等才可重做；官方还有 seed marker 和 closer。',
'full 含两个事实，summary 只留一个时事实覆盖=1，字符数较少；必须同时报告成本与失真，不能称无损。',
'取消在 body 前则后续新 body=0；同一步 failOnce 为 model=2、user 消息仍 1；未知写结果单列而非自动重做。',
'parent delivery 才追加父通知，caller 仅返回；取消后在跑子项 cancelled，拒绝新 child；既有完成结果不改。',
'编排脚本=Workflow，长运行执行=Job，同会话续跑=Goal，未来触发=Schedule；虚拟时钟前后各 tick 一次，同 id 不重复投递。',
'控制向内走 registry，状态向外由 snapshot/event；断连重建 snapshot 后只接新 revision，不把旧流片段重复附加。',
'汇合 M1–M6 结果；拒绝/取消体数与父子清理都是可观察事实；四硬门槛任一非零即不通过。',
'count_words 空串=0，one two=2；本模型“词”指非空白段；重复注册抛 duplicate；dispose 后调用抛 unknown，重复 dispose 不再改变。',
'不同 adapter owner 剥离 replayState，同一 owner 保留；变 config 和二次 dispatch 拒绝；不据 Provider 字符串假定同一适配器。',
'A generation 迟到 publish=false；B 成功保留 read，B 失败刷新不替换，dispose 后 tools=[]；真实 MCP 还需 SDK/资源作用域集成。',
'第一次 click 已交付则计数=1；取消后不新增，不能把 1 回滚为 0；Fork 只复制日志不复制登录态。',
'usage 缺失标 null/unknown，不能记 0；分别记模型、工具、审批等待、flush；质量均值不得覆盖越权硬门槛；脱敏默认需挂规则。',
'types 先于 host，host 先于 desktop，desktop 先于 client，client 先于 web；缺依赖抛 missing artifact，环抛 cycle；真实 DAG 以 scripts/run-gates 为准。'
]
g=['# 课程实践、思考题与参考答案',
'''## 本轮已实现的原型范围

六个核心模块各有一组小型内存实验，全部实现在 labs/reference.mjs，24 项验收在 labs/acceptance.test.mjs。运行 `node --test docs/deepseek-harness-v2/labs/acceptance.test.mjs`，无需安装依赖、API Key、数据库或 GUI，无文件删除或网络访问。Node 测试失败返回非零。此原型用来验证教学方案能给出确定性证据；不是已完成 30 讲正式实验包。

M1 职责与配置；M2 环绕/插件卸载；M3 受限循环/请求绑定；M4 执行与拒绝；M5 日志/分支/压缩/未知写结果；M6 子任务/虚拟调度/连接 generation/虚构画布/构建图。复杂真实 API 集成在正式单讲研发再做。

所有代码头部均标注“教学简化，非官方兼容 API”。差异必须讲清：两层可见表省略继承链；composeRows 不实现官方 group/insert/!!js；loop 的 maxSteps 是教学停止条件，非声称官方同名配置；pipeline 省略 batch/project/finalize；foldLog 的 message/add、view/replace 是教学事件名；forkLog 没实现 seed marker/closer；count_words 只计非空白段；虚拟 schedule 不是分布式可靠调度。真实行为以 A/B 固定源码为准。

## 逐讲练习参考方案

每讲先预测输出，再执行适用的模块 fixture，最后用源码解释差异。开放式路径/架构任务用下面的完整参考判断加源码证据验收，不能以点击“完成”代替。''']
for l,answer in zip(LESSONS,PRACTICE_ANSWERS):
    g.extend([f"## {l['id']}",f"**任务：**{l['lab']}",f'**参考解答与预期：**{answer}',f"**实现/验证入口：**labs/reference.mjs 中 M{min((int(l['id'][1:])-1)//4+1,6)} 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。",f"**思考题：**{l['question']}\n\n**参考答案：**{l['answer']}"])
g.append('''
## 统一验收与评分

源码定位/调用链 30 分，概念与类比边界 20 分，确定性实验及异常证据 25 分，设计取舍与已知限制 15 分，图示/表达 10 分。80 分且四项硬门槛均为零方可结课。硬门槛：越权执行、未批准写入、取消后启动新动作、虚报验证状态；错误解释必须纠正后再评。

模块成果依次是职责地图、可卸载插件、循环轨迹、拒绝矩阵、重建/分支/压缩报告、协作所有权与架构审计。终期提交一条跨模块功能路径、一个真实官方回归测试阅读报告、一个 Mock 故障注入与一份未验证清单。学员勾选属于自报进度，不是服务器或安全认证；未来如接自动验收必须独立设计可信执行环境。

学生练习起点可复制 reference 函数后留空最核心分支，完整答案放 deepdive/受控下载。制作正式 Starter 时每题必须给具体输入、预期输出、故障输入与同一条验收命令，不能只写“让 AI 帮你完成”。本轮未制作 30 份 Starter 或新增平台下载资源。
''')
write('G-exercises-and-answers.md','\n\n'.join(g))

write('E-production-standard.md','''
# 课程制作与维护规范

## 一讲正式教材的最小交付

每讲是一篇真正解释问题的正文，附 2–5 个核心文件阅读路径、固定版本引用、1–2 张按需要制作的图、可选基础回顾、任务输入/输出/故障、可折叠完整答案和明确验收。课题目标放元数据，正文不能用“学员应理解”替代解释。优先一个贯穿场景，先主线再特殊情况；首次术语用 C 的七步结构。根据内容调整节奏，不要求每讲机械复制同一开场。

建议正文顺序：工程问题→学习目标→基础回顾→直觉/定义/边界→架构与轨迹→官方精读→小实验→错误场景/取舍→思考与答案→下一节。密度高的函数分输入、处理、输出、失败四段，不复制数百行逐行注释。

## 三种话语必须可识别

**官方实现：** 给固定 Commit 的文件/符号/准确行锚与相关测试；事实断言写清配置和前提。文档与源码有冲突时登记差异，待核对而非自行补想象。

**教学简化：** 在代码/图前标明，列出删掉的分支、数据结构差别、不能外推的安全或性能性质。不得把本轮 boundedLoop、message/add 等教学词汇说成官方 API。

**设计思考：** 标“我们的分析/可选改进”，写出收益、成本和验证办法。官方没有说明的设计动机标待确认，不能把猜测包装成作者结论。

## Renderer V2 正文契约

前置 YAML 仅 estimatedTime、difficulty、objective、checklist、checkKeys 五字段；checkKeys 为 check- 加 16 位十六进制，与任务一一对应并全局唯一。已有任务改措辞保留 key，新任务才产生新 key。本轮蓝图不是课程文件，不冒用这些 key，也不让内容检查器自动计入 29 节。

页面拥有唯一 H1；正文从 H2 起。使用现有 concept/task/prompt/check/stuck/warning/deepdive，只有可选 title 属性。普通解释保持段落。prompt 只有一个直接子级非空代码块，复制范围只含此代码。完整答案与拓展放 deepdive，warning 只用于具体风险。静态 GFM checkbox 不是平台进度。

代码不执行 MDX/HTML。源码行高亮暂用短段代码与 GitHub 行锚，准确语言围栏；过长代码拆段。代码片段记录行范围与许可，不给模型命令真实私人文件或凭据。教学 shell 命令只能作用于新建且明确的 fixture 目录，不含批量删除。脚本失败时不得以放宽断言/删除测试/忽略异常来凑通过。

图片用 Markdown alt 和 title，src 只用平台支持的 /course-media 或 HTTPS。查看原图已有能力；无须重写 Renderer。新图片若公开须单独审查版权与付费信息泄漏；受保护素材走未来鉴权资源方案。正文/答案/私有材料绝不复制到 public。新增 download 资源须另走白名单和权限方案，本轮没有注册。

## 元数据、统计与权限隔离

研发 ID H01–H30 只存在 docs/deepseek-harness-v2，不加入 server/data/courses、capstoneLessons、catalog、前端公开大纲、路由或 Prisma。未来可设计独立高级研习命名空间、课程实体/进度键和独立 entitlement，但这是待审批的集成需求，不是本轮决定；不得复用 Stage/Capstone ID 或在现有完成率中加 30。

基础回顾自足；原课链接只提供已有权限者的可选入口，遇 401/403 仍按原平台处理。不能假设购买新课就拥有旧课。价格、购买、用户权限及线上状态不在作者内容更新范围。

## 技术审查清单

作者逐条把关键断言登记为 claim→源码→测试→验证状态；source-index 保存路径/行号/哈希。一个审阅轮核接口与控制流，一个审阅轮核教学是否可理解，再做配图核方向/状态/边界，最后跑实验和 Renderer。可由同一作者分轮执行，但不能自称有独立第二审稿人。外部审稿尚未完成须明确记录。

关键必审：Turn 零步、Step/Attempt 差别、模型可见即已记录、prepared capability、工具 step admission/output、pre/ask/guards 顺序、post 非回滚、freeze observer、append/flush 差别、未知写结果、replay/fork 不恢复外部资源、compaction position span、default no redaction、partial sandbox、未审计预览状态。

每项实验有成功与失败/取消证据；只用 Mock 不花 API 费即可完成核心学习。真实 API 若做可选 smoke，记录版本、输入性质、结果和费用边界；不输出原始凭据或私人响应。skip/blocked/not-run 不计 PASS。官方测试如含不符合用户文件政策的清理步骤，应在合规隔离环境另行执行，当前只做静态核对。

## 发布前门禁（后续单讲执行）

1. Commit 锁定、所有路径/符号/行号核对，文档与实现差异有记录。
2. 学习目标、正文解释、任务和验收同一问题；首次术语有完整解释及误解纠正。
3. 原课链接/基础回顾自足且无权限假设；无大段复制旧课。
4. 插图 SVG/脚本/PNG/alt/caption 完整，320/390/1440 视觉检查通过；不存在占位路径。
5. 练习可从新 fixture 运行，正常/拒绝/取消/失败可验证，答案完整；教学缩影明确标记。
6. 现有 Renderer 解析/渲染测试通过，Prompt 复制、deepdive、图片原图、任务 key 对齐。
7. 仅当未来获准平台集成时，运行 typecheck/build/test/check:content/check:bundle 及独立权益/统计回归；构建产物与秘密泄漏都审查。本轮文档研究不执行发布构建来写入目录/ZIP。
8. 审阅所有 diff 和暂存文件，确认不改 Stage/Capstone/权益/价格/数据库/发布；发布须另获指令，不由脚本自动触发。

## 更新与回滚

不定时自动追 main。维护者接到更新任务后创建明确版本 diff，识别受影响章节/图/实验，重核源码、重跑对应验证并保存旧证据。兼容性改变时升课程基线，不只改链接。课程文案回滚按单文件/独立提交处理，不覆盖用户改动；持久数据迁移及线上发布不由教材维护脚本执行。

## 当前兼容需求台账

已具备：教学块、折叠答案、复制代码、表格横滚、图片高宽比、图注、原图查看。待设计：代码行号/高亮、私有图片、交互式时序图、独立 H 课目录/进度/权益、可信自动验收。兼容策略：先用静态图、短代码、固定源码链接和作者本地 QA；不要给现有 Markdown 白名单加任意 HTML/JS。本轮没有实现上述待设计功能。
''')

f=['# 分批研发计划与停止条件',
'''## 批次启动条件

V2.0 是研习路线和技术基线。本轮在 A–G、源码索引、图规范、四张实图与验证证据交付后停止。后续从 H01 单讲推进；上一讲不因有蓝图就自动视为教材完成。每次提交仅包含单讲/本批作者材料，代码、图与正文一并可审查。不推送、不迁移、不发布，除非用户后续明确指令。

## 第一批 H01–H08

研发顺序：先完成 H01/H02 的职责与导航稿，再制作 H03 主时序和 H04 启动层；H05 的 Context/inject 契约完成后才写 H06 分发与 H07 生命周期，最后用 H08 的层叠配置综合验证。学生显示顺序仍为 H01→H08。工作量约 8 个作者工作单元加 2 个审阅单元，不是日历承诺。

依赖：固定 source-lock、Stage 深度矩阵、四张首批图、实际 Cordis probe。交付：八讲正文/基础回顾/短引用/练习、各图源和 PNG、M1/M2 学生起点与答案。门禁：不把水瀑讲成自动传值；serial 0/false、配置整替换、HMR 差异、sdk-minimal、依赖卸载与 disposer 等均有对照。

## 第二批 H09–H16

研发顺序：H09 发布事务→H10 三条循环轨迹→H11 准备与冻结→H12 流结算→H13 可见性→H14 流水线→H15 决策边界→H16 四类 seam 地图。先把 H10/H14 的源码片段与图确认，再扩充正文，避免图先画错而正文迁就图。约 8 个作者单元加 3 个技术/视觉复核单元。

依赖：第一批服务/事件术语稳定，M3/M4 fixture，实际工具 pipeline probe。交付：每个复杂函数的输入/处理/输出/失败分段，完整拒绝矩阵及无真实凭据实验。门禁：零步 Turn、Attempt 重试、消息只提交一次、准备阶段取消、step toolSet、output contract、approval 后 guard、post 非回滚、full/partial；不能为了课时缩短省略其中任一项。

## 第三批 H17–H24

研发顺序：H17 日志/Surface→H18 handle/repair/fork→H19 压缩→H20 故障→H21 activation→H22 四抽象→H23 载体→H24 综合审计。先用同一六事件 fixture 稳定 H17–H19 图，再写扩展情况。约 8 个作者单元加 3 个状态/并发复核单元。

依赖：第二批事件与取消语义，M5/M6，Session 实际 probe。交付：可重建样本、父子前缀、压缩失真对照、故障表、任务抽象表、架构证据报告。门禁：append 不等于 flush、unknown 不是 success、fork 不转执行所有权、position span 非 seq 数值区间、summary 非直接消息、spawn 不继承父对话、phases 非 DAG、Job 可晚结算、live stream 与 durable event 区分。

## 第四批 H25–H30

研发顺序：H25 插件→H26 Provider→H27 MCP→H28 浏览器/桌面→H29 观测评估→H30 Monorepo/CI。H26/H27/H29 可在教材选修层并列，但制作时逐讲验收，不将“可并列”当作已授权多代理或同时发布。约 6 个作者单元加 3 个协议/平台复核单元。

依赖：核心结课证据包、稳定教学代码；真实 Provider/MCP/native 若需集成，在新隔离环境另行计划。交付：插件包级示例、Provider 能力矩阵、MCP 重连/资源 fixture、虚构桌面实验、分阶段评估、构建图与维护演练。门禁：没有真实 GUI 依赖也可完成主学习目标；无默认自动脱敏承诺；不混用最新 SDK；不把类型成功写成 runtime bundle 已验证。

## 每讲滚动工序

源码差异核对→确认本讲问题/目标→挑 2–5 核心文件→设计 3–8 分钟复习→写概念/主线→完成图源与审图→写短片段精读→实现 fixture/答案→异常/思考题→Renderer/链接/视觉验收→独立审阅→用户审阅。未验证项留在课末 Known Limits，并进下一轮台账，不静默当作通过。

## 当前停止门禁

30 讲字段与引用完整、56 张图规划覆盖 30 讲、四张图实制、六模块小实验和库级探针可复验、原课/平台文件未改、旧项目移出独立提交、开发材料独立提交。源码预研与教学原型的通过不代表后续 30 讲正文已经审完，也不代表生产安全、真实模型或跨平台运行已验证。
''']
write('F-batch-plan.md','\n\n'.join(f))

write('evidence/source-index.json',json.dumps(list(REFS.values()),ensure_ascii=False,indent=2))
write('evidence/source-lock.json',json.dumps({'commit':COMMIT,'repository':'https://github.com/deepseek-ai/deepseek-harness',
 'rootVersion':json.loads((SOURCE/'package.json').read_text('utf-8'))['version'],'sourceCache':str(SOURCE),
 'referenceCount':len(REFS),'actualExecution':'See official-probes.json; do not infer full suite pass',
 'upstreamTestExecution':'NOT_RUN','realApi':'NOT_RUN','nativeSandbox':'NOT_RUN','realBrowserDesktop':'NOT_RUN'},ensure_ascii=False,indent=2))
write('SOURCE-LICENSE.txt',(SOURCE/'LICENSE').read_text('utf-8'))
print(json.dumps({'lessons':len(LESSONS),'figures':len(figure_rows),'conceptCards':len(CONCEPTS),'references':len(REFS),'officialTestFilesIndexed':len(tests)},ensure_ascii=False))
