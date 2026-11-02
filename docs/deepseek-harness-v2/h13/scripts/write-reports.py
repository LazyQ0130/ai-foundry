"""把已发生的检查汇总为作者报告；不把待验证项写成通过。"""
from pathlib import Path
import json,re,hashlib,datetime
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence'
load=lambda n:json.loads((E/n).read_text(encoding='utf-8'))
write=lambda n,s:(R/n).write_text(s.strip()+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
lab=load('lab-results.json');c=load('content-check.json');v=load('visual-qa.json');source=load('source-check.json')
tap=(E/'lab-tests.txt').read_text(encoding='utf-8');tests=re.findall(r'^# Subtest: ((C|D)\d+[^\n]*)',tap,re.M)
assert len(tests)==37 and sum(level=='C' for _,level in tests)==31 and sum(level=='D' for _,level in tests)==6
table=['# H13 测试与证据边界','','37 项互斥计数：C31、D6。A、B、E 为 NOT_RUN 独立专项；Cordis 与教学模型夹具在 C/D 内实际参与，不重复计数。故意错误答案另记 EXPECTED_FAILURE，不算通过测试。','','| ID 与断言 | 级别 | 真实边界与替身 |','| --- | --- | --- |']
for name,level in tests:
 n=int(re.match(r'[CD](\d+)',name)[1])
 if level=='D':boundary='ToolsService + SystemPrompt + Scope + AgentLoop + LlmRuntime + 内存 Session + Native；固定 Adapter 发 ToolCall，真实执行与下一请求'
 elif n<=8 or n==31:boundary='真实 defineTool/ToolsService + 官方 testkit 的共享 ToolExecutionPipeline；数字主体与明确坏返回是夹具，无 Loop/Session'
 elif n<=12:boundary='真实 Cordis/Scope/ToolsService 登记与视图；最小 Agent-like 键与固定字符串主体，无 Loop'
 elif n<=19:boundary='真实 ToolsService.resolve/集合视图 + Scope；条件与 Promise 门闩是夹具，无 Loop'
 elif n<=21 or n>=28:boundary='真实 ToolsService/Scope 的登记、过滤、身份与生命周期；无 Loop'
 elif n<=26:boundary='真实 schema/json-schema 纯编译器与值验证器；本条不调用 ToolsService、Scope 或 Native'
 else:boundary='真实 defineTool 的 execute 包装；故意坏返回绕 TS，无 Registry 输出流水线（对照 C07）'
 table.append(f'| {name} | {level} | {boundary} |')
table+=['','C01–C19 共享对应实践的已运行结果，但每项检验不同因果结论；C20–C31 为实际组件的独立边界。C22/24/25 的循环输入仍计一个 Node test，不另拆计。D 六种场景各一个 test，demo 重跑不增加数量。','','原始证据：lab-tests.txt（TAP）、lab-results.json（stdout/stderr/退出值/程序哈希）、run-*.json（含首轮失败）、practice-output.json（P/A/B/C/D 六模式完整对象及请求前缀）。所有阶段的请求都在第二个真实 Session 重建 messages/config/tools/toolHistory，并保留 Adapter 投影后的实际输入。','','C27 故意绕 TS 后直接 execute 接受坏输出，C07 经共享流水线拒绝；两项组合证明边界，没有把直接调函数冒充 Registry 输出校验。C26 的错误初版已在 issue-log 说明并修正。','','PTC 描述、TS 推断、timeout policy、并发分类和更广安全机制为静态阅读，未单独执行。未运行官方 Vitest 全套、真实供应商、磁盘恢复、审批、沙箱、外部工具或 E 级完整应用。','', '复现目录与依赖：见 README。每次新建临时 fixture，最小环境，不清理旧目录。首轮诊断不被后续 PASS 覆盖。']
write('test-evidence.md','\n'.join(table))
reg=(E/'renderer-regression.txt').read_text(encoding='utf-8');assert '# tests 12' in reg and '# fail 0' in reg
write('renderer-regression.md',f'''# H13 Renderer 与内容检查

当前工作区既有 `tests/lesson-renderer.test.ts` 的 **12 项通过**，原测试与 Renderer 源文件没有被本课修改。使用用户当前未提交版本验证，不套用 H12 旧文档的9项计数。原始 TAP 在 evidence/renderer-regression.txt，带参数与哈希的记录为 check-*-renderer.json。

新增检查放在 H13 作者脚本：实际 parseLessonContent、LessonMarkdown SSR；四个唯一checkKey；七份程序与lab字节同步；4张图；21个默认关闭折叠区（7程序+4答案+10思考）；保存HTML等于当前实际SSR。AST核 ToolsService、执行器、SystemPrompt/Loop成员与5函数/5接口字段集合。AST证明存在及结构，语义仍由源码审阅和C/D行为负责。

三宽度1440/390/320的真实React挂载检查全部通过：七份程序逐份点击复制并与文件比对、全部折叠键盘开关、十题答案长度、四个原图popup、移动代码局部横向滚动、图片decode、全页无横溢出/无pageerror/无请求失败。静态页保留原生details，移除未水合复制按钮，图片映射相邻文件。没有访问课程数据库或产品路由。

负担信号：默认正文 {c['metrics']['defaultBodyCjk']} 个CJK字、{c['metrics']['defaultCodeLines']} 行代码；含折叠答案为 {c['metrics']['allBodyCjk']} 个CJK字、{c['metrics']['codeLines']} 行代码。统计去除代码/URL/注释，不能换算成实测学习时长。完整JSON见 content-check.json，视觉和交互见 visual-qa.json。
''')
before=load('workspace-before.json')
read_paths=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md','docs/deepseek-harness-v2/module-one-review/README.md','docs/deepseek-harness-v2/module-one-review/production-standard-v1.md','docs/deepseek-harness-v2/module-two-review/README.md','docs/deepseek-harness-v2/module-two-review/technical-review.md','docs/deepseek-harness-v2/module-two-review/production-standard-module-two-addendum.md','docs/deepseek-harness-v2/module-three-review/review-report.md','docs/deepseek-harness-v2/module-three-review/source-review.md','docs/deepseek-harness-v2/module-three-review/technical-consistency.md','docs/deepseek-harness-v2/module-three-review/production-standard-module-three-addendum.md','docs/deepseek-harness-v2/module-three-review/h13-h16-handoff.md','docs/deepseek-harness-v2/h12/h13-handoff.md']+[f'course-content/internal/deepseek-harness/h{i:02}/lesson.md' for i in [5,7,9,10,11,12]]
preparation={'scope':'Prior module audit in this same chat read full 30-lesson blueprint, module reports/current standards and H09–H12. H13 continued source review and read H05/H07 relevant/full bodies; ledger hashes identify materials, not proof of comprehension or measured reading time.','base':before['base'],'files':[{'path':p,'sha256':sha(P/p)} for p in read_paths],'officialSourceFiles':source['files'],'officialReading':'Tools README/index/contracts/schema/json-schema/executor; subsystem + cookbook; Scope README/index/store; SystemPrompt; AgentLoop.agent; LLM types/message/content; official tool-testkit; selected official tests in source-checklist. Paths verified before final references.','unverified':['learner trial','actual duration','independent review','E full app','live provider performance'],'limitations':'Official test files selected/read, not all executed; PTC/timeout/TS typing are static conclusions.'}
(E/'preparation.json').write_text(json.dumps(preparation,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('quality-review.md',f'''# H13 教学质量审查

结论：**CONDITIONAL GO**。作者正式稿与覆盖技术行为可交付；无已知未决确认 P0/P1。该判断不批准发布，也不把学员效果、独立外审或E级应用集成当已验证。

| 验收要求 | 本轮结果与入口 |
| --- | --- |
| 正式完整正文 | 已完成；README需求、知识复习、七步例子、定义/Schema/输出/所有权/Scope/准入/Executor/请求链 |
| 四项完整实践与答案 | A/B/C/D与七份折叠完整程序；预测→运行→解释，分项Rubric |
| 十道折叠思考 | 已完成，2/3/4/6/10要求按数据或配置推导，不靠术语命中 |
| 原创四图与源文件 | SVG+PNG+Python源；实测三宽度；图注标简化与真实箭头含义 |
| 源码溯源 | {len(load('source-assertions.json'))}条断言；{source['files']}文件 Git blob/SHA256；{len(source['references'])}处链接行号边界；另有AST |
| 真实技术证据 | C31+D6=37通过；完整两侧请求与prefix重建；故意旧set错误答案预期非零 |
| Renderer/交互 | 当前既有12项通过；新增内容/AST/SSR与1440/390/320真实React检查通过 |
| 知识衔接/重复 | knowledge-bridge；H11声明入口与H12调用出口由同一登记身份接通 |
| H14交接 | h14-handoff只交问题和前置，不开发后课 |
| 范围保护 | final-audit核{len(before['files'])}个已有文件；提交只纳入两处H13目录 |

关键准确性：根参数开放、required逐属性、嵌套object显式开放性、exact-one、default不补值；defineTool包装只校输入、共享流水线校输出；规范value与模型content/持久消息分开；restrictions过滤继承含祖先、自身登记豁免；when false/throw/cancel分开；同Step重试复用但登记/可见性仍实时核对；同对象重新登记也不继承旧set；PTC仅run_code原始入口+SDK；timeoutMs本身不是自动计时器。逐项可追到source-checklist和相应测试。

已解决问题见issue-log：QA01两侧请求投影差异、QA02无效测试语义、QA03AST错误依赖字段顺序、QA04图二子级观察前提，以及研究路径/链接末行校对。只修H13，没有改变上游或成熟课程来使断言通过。首轮33/36通过与3失败的原始记录保留；最终37项来自增加有独立教学目标的渐进例子检查，未将demo/变异重复计数。

学习负担：默认 {c['metrics']['defaultBodyCjk']} CJK字与{c['metrics']['defaultCodeLines']}代码行，含折叠 {c['metrics']['allBodyCjk']}字/{c['metrics']['codeLines']}代码行；7个核心概念、5个主源码文件（Tools index/contracts/schema/json-schema/executor），Scope/Loop/Prompt/LLM/PTC为按问题辅助入口。蓝图90–125分钟→作者估190–250分钟，明确增加100–125分钟，分三段。该估计尚不能证明学员可在此时间学会，需试读修订。

边界分别记录：A/B独立专项NOT_RUN，Cordis和Mock在C/D内部不双计；PTC描述、TS推断、timeout策略静态核对；E完整应用NOT_RUN；实际模型、外部工具、审批/沙箱、磁盘恢复NOT_RUN；学员试读、实测时长、独立外审、真实提供方性能均未验证。作者视觉复核只检查当前截图，不能称独立外审或学习效果。

只新增H13正式教材与作者证据；课程权益、价格、数据库、产品发布状态及output未改。提交结果以最终validation与Git记录为准。H13完成后停止。
''')
print('Evidence-derived reports written; no external review or learner claims')
