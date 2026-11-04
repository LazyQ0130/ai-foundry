"""只整理现有证据与候选审查议题；不执行H17–H19测试或正式模块审查。"""
from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parents[1];P=R.parents[2];D=R/'module-five-review-prep';D.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
courses=[]
for h in ['h17','h18','h19','h20']:
 q=R.parent/h;lab=json.loads((q/'evidence/lab-results.json').read_text(encoding='utf-8'));content=json.loads((q/'evidence/content-check.json').read_text(encoding='utf-8'))
 courses.append({'lesson':h.upper(),'tests':lab['tests'],'levels':lab['levels'],'metrics':content['metrics'],'evidence':f'../../{h}/evidence/lab-tests.txt','hash':sha(q/'evidence/lab-tests.txt'),'provenance':'H20 current execution' if h=='h20' else 'historical delivery read and preserved; not rerun in H20'})
(R/'evidence/module-five-inputs.json').write_text(json.dumps({'status':'PREPARATION_ONLY','formalReview':'NOT_STARTED','courses':courses},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
texts={
'README.md':'''# 第五模块集中审查准备包

状态：**PREPARATION ONLY / 正式审查NOT_STARTED**。这是H20任务授权的材料整理，不给模块GO结论，不复验旧课冒充正式审查，不新增模块测验或开发H21。固定官方Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。

1. [统一可靠性架构](01-reliability-architecture.md)
2. [四课知识依赖矩阵](02-dependency-matrix.md)
3. [事件→持久→上下文→恢复模型](03-unified-model.md)
4. [C/D原始证据索引](04-evidence-index.md)
5. [JSONL范围](05-jsonl-scope.md)
6. [LLM Retry范围](06-retry-scope.md)
7. [Tool Failure与Cancel范围](07-tool-cancel-scope.md)
8. [16张核心图索引](08-figure-index.md)
9. [重复与潜在矛盾议题](09-repetition-and-questions.md)
10. [P0/P1/P2与候选门禁](10-open-issues.md)
11. [学习负担与估时](11-workload.md)
12. [H21前置](12-h21-prerequisites.md)
13. [未验证清单](13-unverified.md)

本包引用原始交付与hash，区分历史报告和H20本轮实测；静态阅读、历史PASS、当前执行不能合并。后续正式审查需单独获得任务，再确定范围、复验、去重和审稿人。H18/H19保留文件与空目录继续保留。
''',
'01-reliability-architecture.md':'''# 统一可靠性架构（供正式审查）

用户输入经Inbox接纳，活跃Agent持有控制信号和Scope。Loop在Turn/Step边界准备工具与Prompt，Model Request每次Attempt产生实时流，最后结算message或attempt。成功工具提议进入流水线，call/结果按实际阶段记录。所有Session事实只追加，Surface与Projection提供不同读法；真实Backend通过Handle的所有权和检查点保存指定范围。

失败请求在特定恢复点交策略链：通用Retry管理Provider/policy预算与退避，Compaction管理输入缩减与独立进展预算。取消中止当前活动、停止补位并等待已启动工作；Handle释放再承担作用域、writer和登记退出。进程中断后Resume持权读有效前缀、补缺结果和生命周期边界，新对象继续使用历史，不重放旧动作。

候选硬不变式：模型可见消息有合法提交来源；失败Attempt不当普通聊天；Seq与Surface位置分开；工具调用/结果配对；未知结果不当未执行；取消不是回滚；Session提交/后端可见/flush耐久分开；历史谱系不等于运行时父子所有权。这是审查输入，不是全系统已证实的形式化保证。
''',
'02-dependency-matrix.md':'''# 四课知识依赖矩阵

| 课 | 核心对象与增量 | 向后交付 | 依赖前课 |
|---|---|---|---|
| H17 | Event Log / Surface / Projection，派生模型历史 | 事件身份、位置替换、实时与持久区别 | H10/H11/H12/H14 |
| H18 | Persistence / Handle / Resume / Fork / Repair | 单写者、检查点、有效前缀、谱系与未知工具 | H09/H17 |
| H19 | TokenMeter / Compaction / Pruner / ImageOffload | 预算取舍、仅日志标记与Surface改写、输入恢复 | H11/H12/H17/H18 |
| H20 | 请求Retry / Cancel / Quiescence / 故障决策 | 所有权、协作退出、副作用核查与恢复证据 | H10/H12/H14/H15/H17–H19 |

核心依赖应在默认正文自足复习；完整程序和答案折叠。H20只提供H21委派所需边界，不把Subagent树提前混入本模块实现。
''',
'03-unified-model.md':'''# Event Sourcing → Persistence → Context Management → Recovery

| 层 | 解决的问题 | 不能自动提供 |
|---|---|---|
| Event Sourcing | 已提交事实怎样派生历史/状态 | 磁盘耐久、外部操作恰好一次 |
| Persistence | 指定逻辑历史如何由Handle保存与持权访问 | 活跃Agent对象复活、任意硬件断电保证 |
| Context Management | 当前请求哪些材料被摘要、修剪或省略 | 无限窗口、无损记忆、自动省钱 |
| Recovery | 特定失败边界如何等待、缩减、停止或补齐 | 通用自动回滚、盲重非幂等工具 |

这是职责层，不是每次调用必经的四个串行服务。没有Backend也可以做内存Session/Compaction；有日志但没有活跃Agent也可只读；一次Retry不等于一次Resume。Fork是历史分支，运行时委派又是H21的独立协议。
''',
'05-jsonl-scope.md':'''# 真实JSONL范围（历史与本轮分开）

| 课 | 实际交付范围 | 不得转记的缺口 |
|---|---|---|
| H17 | 无真实持久化，C/D是事件组件/局部Loop | 不能按Event Sourcing宣称磁盘恢复 |
| H18 | Windows原始/默认Zstd、新实例/独立PID重读、同登录写权、指定尾修复、Resume/Fork | 非断电、POSIX/NFS/跨登录、写迁移Worker、E |
| H19 | Windows原始JSONL，闭合压缩后同进程新Context/后端真实Resume | 该Compaction组合无独立进程/Zstd/崩溃注入 |
| H20 | C/X原始JSONL保存Retry事实、取消计划；精确开放前缀新副本、真实语义Resume | 同进程新实例；没有杀进程、截断文件或真实断电 |

依据原H18的[平台报告](../../h18/jsonl-platform-coverage.md)、H19的[覆盖](../../h19/coverage-matrix.md)与H20的[当前矩阵](../coverage-matrix.md)。H18基线由文件核实，不只信任务摘要。当前各组合的实际证据不同，不并成“全模块跨进程全通过”。
''',
'06-retry-scope.md':'''# LLM Retry审查输入

H20实际：默认normal预算/五类瞬态码；AUTH/QUOTA/Adapter ABORTED拒绝；500与指数序列、U1抖动、Retry-After范围内/超上限；always脚本有界、下游优先/下游错误回退；同Step多Attempt、用户输入一次、失败部分流不污染模型；无插件与直接Runtime不自动获得恢复；两种Compaction组合不消费通用计划；取消/释放清理。

源码静态或未全测：多Provider/完整policyKey变更矩阵、投影重复fold、就绪失败/陈旧回调、零抖动下界所有组合、真实HTTP Retry-After日期/网络归一化、全部重叠策略顺序。详细逐例真实组件/替身见[H20矩阵](../coverage-matrix.md)。不能把源码正确、历史官方测试存在或任意A–E数字当成这些项目当前执行通过。
''',
'07-tool-cancel-scope.md':'''# Tool Failure 与 Cancel审查输入

H20真实B：模型前取消、流安全前缀/空Attempt、退避取消、工具pre取消/主体开始后排空、两个已启动加一个未启动的批次、业务与策略错误、keepInbox差异、Handle/Retry插件释放、下游不及时退出。X在假写已经发生后保存前缀，原任务正常取消排空，副本Resume不重执行旧工具；D用真实Repair区分两种code、已记结果与旧Step。

取消后的结果类别不证明副作用0。业务键Map只是教学外部世界；没有真实邮件/支付/资源操作。完整内部调度故障矩阵、所有wrapper替换信号、真实Shell/Jobs退出、完整父子树、第三方永不退出Promise、原生平台沙箱不是H20的当前动态证据。H14/H15历史事实保留，正式审查时应按对象和输入去重。
''',
'09-repetition-and-questions.md':'''# 重复与潜在矛盾：正式审查候选议题

| 重合处 | 应保留的增量 | 候选核查 |
|---|---|---|
| H17重建 / H18恢复 | 读法与持权/物理前缀不同 | 是否有“重建=重执行”残留表述 |
| H18 Repair / H20 Repair | H18讲机制，H20按副作用决定下一步 | 是否重复整段定义而缺决策增量 |
| H19 Overflow / H20 Retry | 输入修复与通用策略所有权不同 | 是否把独立预算直接相加成全局限额 |
| H12中断 / H20取消 | 结算条件与控制传播不同 | 非空安全块/空Attempt、Provider ABORTED是否混淆 |
| H14批次 / H20排空 | 模型顺序与取消时的未启动/已启动不同 | tools/result观察与Session提交是否混时序 |
| 各课“持久” | Session提交、Backend接受、flush屏障分开 | Retry文档概括是否被当fsync保证 |

H20已在自己的正文/图/答案中处理上述引用边界。这里不替正式审查断言四课不存在遗漏，不修改旧课以统一措辞。建议正式审查优先复核具体事件和可观察输出，再做精简与学习负担评估。
''',
'10-open-issues.md':'''# P0/P1/P2与候选门禁

状态：准备材料，**没有正式模块审查结果**。根据四课现有作者报告，未登记尚未关闭的确认P0/P1；这不是独立审稿后的“全模块零缺陷”。H20已修夹具时钟、真实UserMessage形状、Resume前发布事件读取等问题，失败证据保留。

| 编号 | 级别/类型 | 状态与所需动作 |
|---|---|---|
| PREP-P2-01 | 学习负担 | 开放：四课估时显著高于蓝图；试读后校准分段、范围和评分 |
| PREP-P2-02 | 概括措辞 | 开放候选：正式审查核“重跑步骤”“先持久”“取消锚点”等原文与实现条件；H20已明确限定 |
| PREP-V01 | 验证缺口 | 真实Provider/费用/缓存/E/学员/外审待独立任务，不虚改为已通过 |
| PREP-V02 | 故障/平台缺口 | H19/H20组合跨进程、平台、真实崩溃/断电待专项 |

若正式审查确认未知工具被盲重、无限请求无法取消、预算错误、失败Attempt入模型、取消后未受控新副作用或事件顺序错误，应升P0/P1并阻断；不得用总分或增加测试数量盖过。当前本包不执行该正式判定流程。
''',
'12-h21-prerequisites.md':'''# H21前置输入

参见[H20交接](../h21-handoff.md)。必须带入五维区别：Session历史谱系、当前Agent身份、结构Fiber所有权、Handle释放能力、运行时父Agent。还需会解释协作取消/排空、下游恢复可能阻塞、未知外部结果不能盲重。

H21研究activation/provider/delivery、spawn与fork的上下文准备、后代清理与结果回传；本包没有开发这些实现或为其预先给GO。H22继续不同调度抽象，H23继续载体，H24再做完整系统证据。不要把历史Session分支当运行时子Agent。
''',
'13-unverified.md':'''# 未验证项目

- 真实Provider错误归一化与网络故障、实际Token/账单、延迟/吞吐与缓存收益。
- 完整Harness Profile/应用、真实外部能力与E级集成。
- H19/H20特定跨组件链的独立进程、默认Zstd、真实崩溃/断电、POSIX/网络盘/跨登录场景。
- 全部策略注册顺序、Provider/policyKey动态变更、投影初始化与完整故障注入矩阵。
- 真实业务幂等键与非幂等外部核对、不可合作工具、完整父子Agent取消/Jobs清理。
- 学员试读、无提示迁移、实际耗时、Rubric评分一致性、独立技术和教学外审。
- 第五模块正式集中审查本身（NOT_STARTED）。

这些缺口按课与范围保留，不能用H18某个Windows测试或H20局部JSONL通过覆盖。素材、权益、线上集成和课程发布均未执行。
'''
}
table='| 课程 | TAP | C/D | 证据性质 | 原始记录 |\n|---|---|---|---|---|\n'
for c in courses:table+=f"|{c['lesson']}|{c['tests']}|C{c['levels']['C']}/D{c['levels']['D']}|{c['provenance']}|[TAP]({c['evidence']})，SHA256 {c['hash'][:16]}…|\n"
texts['04-evidence-index.md']='# C/D原始证据汇总（未复验旧课）\n\n'+table+'\n合计123个历史/当前执行项，C64/D59；这是原TAP相加，不是123个互不重复场景，更不是本轮集中复验。共享Session、Loop、工具结果与修复主题需要正式审查按语义去重。逐项对象与Mock边界仍以各课覆盖报告和时间戳run为准。输入身份见../evidence/module-five-inputs.json。\n'
figs='# 16张核心教学图索引\n\n历史图只建立文件索引与hash，本轮没有重新做H17–H19视觉审查；H20四图有当前三宽度/人工样本。\n\n|课程/图|图与源|已有图注|PNG SHA256|\n|---|---|---|---|\n'
for h in ['h17','h18','h19','h20']:
 q=R.parent/h
 for f in json.loads((q/'evidence/figures.json').read_text(encoding='utf-8')):
  assert (q/f['image']).is_file() and (q/f['source']).is_file()
  prefix='../' if h=='h20' else f'../../{h}/'
  figs+=f"|{f['id']}|[PNG]({prefix+f['image']}) / [SVG]({prefix+f['source']})|{f['caption']}|{sha(q/f['image'])}|\n"
texts['08-figure-index.md']=figs
work='# 学习负担与估时（未经试读）\n\n|课|默认/全部CJK|代码行/图/实践/思考|作者估时|\n|---|---|---|---|\n'
for c in courses:
 m=c['metrics'];work+=f"|{c['lesson']}|{m['defaultBodyCjk']}/{m['allBodyCjk']}|{m['codeLines']}/4/4+综合/{m['thoughts']}|{m['estimatedMinutes'][0]}～{m['estimatedMinutes'][1]}分钟|\n"
work+='\n合计默认32672、全部43464个CJK字符，1381行代码、16图、16实践+4综合、56思考；估1010～1360分钟。原蓝图430～590分钟，增加580～770。字符/行数不是学习效果，折叠不等于负担消失。H20分三段，每段交付推导再进下一段；正式审查应优先安排真实试读和无提示迁移，暂不承诺时间准确或评分已校准。\n'
# Derived totals keep later edits from silently making the preparation numbers stale.
total_default=sum(c['metrics']['defaultBodyCjk'] for c in courses);total_all=sum(c['metrics']['allBodyCjk'] for c in courses);lines=sum(c['metrics']['codeLines'] for c in courses)
work=work.replace('32672',str(total_default)).replace('43464',str(total_all)).replace('1381行',str(lines)+'行')
texts['11-workload.md']=work
for name,text in texts.items():(D/name).write_text(text,encoding='utf-8')
print('preparation only:',len(texts),'documents; no historical tests or formal module review executed')
