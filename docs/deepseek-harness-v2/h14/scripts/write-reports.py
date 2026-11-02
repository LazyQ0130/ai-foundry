from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence'
load=lambda n:json.loads((E/n).read_text(encoding='utf-8'))
write=lambda n,s:(R/n).write_text(s.strip()+'\n',encoding='utf-8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
lab=load('lab-results.json');c=load('content-check.json');v=load('visual-qa.json');source=load('source-check.json');before=load('workspace-before.json')
tap=(E/'lab-tests.txt').read_text(encoding='utf-8');tests=re.findall(r'^# Subtest: (([CD])[^\n]*)',tap,re.M)
assert len(tests)==45 and sum(level=='C' for _,level in tests)==32 and sum(level=='D' for _,level in tests)==13
table=['# H14 测试与证据边界','','互斥计数C32+D13=45通过；A/B独立专项NOT_RUN，E完整应用NOT_RUN。实践字母B与证据等级B无关，scheduling实际跨Loop等边界，记D。demo重跑、故意错误答案与Cordis依赖不重复计数。','','| 实际TAP测试 | 级别 | 真实受测边界与替身 |','| --- | --- | --- |']
for name,level in tests:
 if name.startswith('C-flow'):boundary='真实ToolsService→Native批次→Pipeline三阶段；字符串业务、投影与明确故障是作者夹具，无Agent/log'
 elif name.startswith('C-failure-snapshot'):boundary='官方testkit直接驱动真实Pipeline；非JSON对象输入，不经过原始模型参数解析'
 elif name.startswith('C-failure'):boundary='真实Native批次/Pipeline；门闩与坏参数/策略/主体是受控输入；scheduler注入实例prepare异常'
 elif name.startswith('C-policy'):boundary='真实Cordis Waterfall、ToolsService.guard、Native/Pipeline；故意覆盖deny及失败后换值'
 elif name.startswith('C-batch'):boundary='真实Native/executeToolBatch上限校验；0/1.5在Pipeline前拒绝'
 elif name.startswith('C-snapshot'):boundary='真实Pipeline的prepare/dispatch/complete；调用方对象变更与token比较，不是自制快照算法'
 elif name.startswith('D-scheduling'):boundary='真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session；Mock模型发多调用，Promise门闩控制业务结束'
 else:boundary='真实Loop+Tools+SystemPrompt+LlmRuntime+Native+内存Session及修复器；模型/字符串业务受控，internal仅替换本实例complete作故障注入'
 table.append(f'| {name} | {level} | {boundary} |')
table+=['','原始证据：lab-tests.txt、lab-results.json、run-*.json（含首轮43项/12失败）、practice-output.json（全部A/B/C/D模式）。每次执行保留参数、退出值、stdout/stderr、scratch与程序哈希。故意错把完成顺序当提交顺序的negative-answer预期非零，不算通过测试。','','D每次保存Loop请求、Adapter实际输入、真实Session事件前缀，第二真实Session重建messages/config/tools/toolHistory；runtimeTrace有实际递增position及channel，分别标Session、request、model、tool、policy、observer/error。B的commit来自Session通知，不是自造预期数组。','','已实测：普通成功/拒绝/坏参数/主体/输出/后置失败、前置与主体/后置中的取消、signal融合、滚动补位、上限1/2、重分类屏障、内部prepare drain与Loop complete失败后的补齐、上下文与concludesTurn。','','静态/未测单列：实际审批服务与allowed-once UI、guard自身异常、timeout计时器、全部恶意getter/render/meta组合、日志后端损坏、磁盘恢复、真实提供方、PTC/外部工具/沙箱及E。官方tests/tools.spec与agent-loop/tool-calls等为阅读参考，不称本轮执行全套。']
write('test-evidence.md','\n'.join(table))
reg=(E/'renderer-regression.txt').read_text(encoding='utf-8');assert '# tests 12' in reg and '# fail 0' in reg
write('renderer-regression.md',f'''# H14 Renderer 与新增作者检查

既有Renderer测试12项通过，实际使用用户当前工作区版本，没有修改组件、CSS或原测试。原始TAP为evidence/renderer-regression.txt，check-*-renderer.json保留命令/输入哈希/退出值。

新增检查只在H14：实际parseLessonContent与LessonMarkdown SSR、四个唯一checkKey、六份完整程序与lab逐字同步、四图、21个默认关闭折叠（语法1+程序6+实践答案4+思考10），保存HTML与当前SSR一致。AST核Pipeline/BatchSettlement/ToolsService/Native/ToolCallRecovery成员，4个接口字段集合与3个函数位置。AST只证明结构存在，不替代行为验证。

1440/390/320真实React挂载均检查：图片decode与图注、全页无横溢出、六份程序逐一点击复制且与文件比较、全部折叠键盘开关、十题答案、四原图popup、移动长代码局部横滚、无pageerror/请求失败。静态页移除未水合复制按钮，保留details与相邻图片；不冒充产品登录页或完整无障碍审计。

负担信号：默认{c['metrics']['defaultBodyCjk']}个CJK字/{c['metrics']['defaultCodeLines']}行代码，含折叠{c['metrics']['allBodyCjk']}字/{c['metrics']['codeLines']}代码行。统计去代码/URL/注释，不换算成实测课时。图几何/字体与交互详见visual-qa，作者看图另记manual-review。
''')
paths=['docs/deepseek-harness-v2/A-blueprint-v2.md','docs/deepseek-harness-v2/E-production-standard.md','docs/deepseek-harness-v2/module-one-review/README.md','docs/deepseek-harness-v2/module-one-review/source-review.md','docs/deepseek-harness-v2/module-one-review/production-standard-v1.md','docs/deepseek-harness-v2/module-two-review/README.md','docs/deepseek-harness-v2/module-two-review/technical-review.md','docs/deepseek-harness-v2/module-two-review/production-standard-module-two-addendum.md','docs/deepseek-harness-v2/module-three-review/review-report.md','docs/deepseek-harness-v2/module-three-review/source-review.md','docs/deepseek-harness-v2/module-three-review/technical-consistency.md','docs/deepseek-harness-v2/module-three-review/production-standard-module-three-addendum.md','docs/deepseek-harness-v2/h13/h14-handoff.md','docs/deepseek-harness-v2/h13/quality-review.md']+[f'course-content/internal/deepseek-harness/h{i:02}/lesson.md' for i in [6,7,10,12,13]]
(E/'preparation.json').write_text(json.dumps({'base':before['base'],'scope':'Full 30-lesson blueprint/module reviews/current standards and H07/H10/H12/H13 were read across this ongoing chat; H14 read H06 event/Waterfall lesson, H14–H16 planning and H13 handoff, then all requested Pipeline/Batch/Events/contract documents and selected official tests. Hashes identify materials, not measured reading time.','files':[{'path':p,'sha256':sha(P/p)} for p in paths],'officialReading':['docs/tool-execution-pipeline.zh.md','docs/subsystems/tools.zh.md','core/tools README/index/pipeline/batch/contracts/executor/events','Native executor','AgentLoop.agent','adding-a-tool cookbook','core/session/repair.ts','official tool-testkit','selected tools.spec/execution-mode/scoped/activation/tool-calls tests'],'officialTests':'selected/read, not full Vitest execution','unverified':['learners','actual duration','independent review','E full app','real external provider']},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write('quality-review.md',f'''# H14 教学质量审查

结论：**CONDITIONAL GO**。正式稿与覆盖范围内的技术行为可交付，无已知未决确认P0/P1。该结论不是发布批准，也不将试读、独立外审或E级应用当作完成。

| 验收 | 本轮产物与证据 |
| --- | --- |
| 正式正文 | README/package双调用需求，四层职责、三阶段、策略/守卫、结果、调度、取消/内部失败和下一请求 |
| 四实践与详细答案 | 六份完整折叠程序；A/C真实组件，B/D真实局部Loop；四项各10分解释Rubric |
| 十道折叠思考 | 2/3/5/6/8/10含代码或轨迹推导；答案给因果、实测与源码入口 |
| 四图及源文件 | 原创SVG/PNG/Python，H13配色；主线与跳过分支分开，三宽度检查 |
| 源码核对 | {len(load('source-assertions.json'))}条，{source['files']}源码/配置/文档Git blob+SHA256，{len(source['references'])}处固定链接范围，另有AST |
| 技术行为 | C32+D13=45通过；故意错误答案预期失败；全部模式完整对象/请求/事件保留 |
| Renderer/阅读交互 | 既有12项通过；内容/SSR/AST与三宽度实际React交互通过 |
| 跨课/边界 | knowledge-bridge与h15-handoff；不重教完整DSL/流协议/Agent状态机，不提前做H15/H16 |
| 原文件保护 | 基线{len(before['files'])}文件，含H01–H13、三次审查、output及用户改动，最终审计核字节 |

重点准确性：JSON解析在batch，坏文本保留；参数Schema在defineTool包装，晚于pre；参数深冻结、类型readonly与最终exec冻结分层；普通Waterfall拒绝可被外层改，guard在最终allow后；post-result与final-result跳阶段不同；内容替换不自动改value/meta，换value重验重投影；block丢旧成功数据/上下文；最终观察失败被容纳；并发dispatch与模型顺序complete/提交分开；取消skip不进该项流水线；内部失败drain后拒绝，partial仅已提交；Loop以OUTCOME_UNKNOWN/NOT_STARTED保守补齐；conclude不跳过本批，排队上下文仍可带来下一Step。

研发修订QA01/QA02已解决并保留原始43项中12失败：夹具返回对象在await前读取了计数，以及capture.trace覆盖阶段trace；另有conclude与deferContext组合暴露错误的一请求预期。修复夹具/教学预期并增加有独立语义的context对照和快照/token检查，形成最终45项。没有改官方源码或旧课来使断言通过。源码类型readonly不能扩大成全时段运行时冻结，这项事实已在正文、图与清单中明确。

负担：8个核心概念，5个主文件（executor/contracts/pipeline/batch/index）；默认{c['metrics']['defaultBodyCjk']} CJK字/{c['metrics']['defaultCodeLines']}代码行，含折叠{c['metrics']['allBodyCjk']}字/{c['metrics']['codeLines']}代码行。蓝图110–150分钟→作者估230–310，端点增加120/160分钟，建议三段。字数、折叠与测试通过均不能证明学员理解或实际时长，须后续试读。

未验证分开列：A/B独立专项NOT_RUN，Cordis与Mock不双计；实际审批通道、timeout计时器、guard throw及全部恶意getter/render/meta/日志故障组合为静态或未测；完整Harness E、真实模型表现、外部工具、PTC/沙箱、磁盘恢复未运行；学员试读、实测学习时长、独立外审未进行。作者看图仅评价当前截图可读性，不是独立教学外审。

仅交付H14，课程权益/价格/数据库/线上业务和发布状态不变。H15仅交接，完成后停止。最终范围与交付哈希以validation/artifact-inventory及Git提交为准。
''')
print('H14 evidence-derived reports written')
