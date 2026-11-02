from pathlib import Path
import re,json,hashlib,collections
R=Path(__file__).resolve().parents[1];P=R.parents[2];E=R/'evidence'
families={
'schema-input':'Schema形状/DSL/包装位置：H13与H14/16存在语义重叠，家族参数不同不合并成同一安全场景',
'canonical-output':'规范值、模型内容、输出Schema：H13基础与H14处理，H16再消费',
'registry-scope':'注册、Scope、遮蔽、过滤与Effect退出：跨H13/H16复现同类约束',
'step-admission':'when/ResolvedSet/当前注册资格与Web ready，步骤决定和调用时核对分层',
'loop-feedback':'模型请求→提议→执行/拒绝→Session→下一请求；相同链不重复当多种完整集成',
'pipeline-result':'三阶段/Waterfall/结果变换/观察失败，各分支是参数化执行项',
'pipeline-failure':'普通异常、取消阶段、drain和内部失败；副作用不确定性与恢复分离',
'pipeline-policy':'普通pre可改写、审批与guard；H14/H15/新增A同一主题不同组合边界',
'identity-snapshot':'分离冻结参数/token、全exec最终冻结；类型约束不冒充运行时隔离',
'batch-scheduling':'滚动池、独占、上限、模式复核、模型顺序结算',
'approval-outcome':'四结果、ask/never、异常/取消；同一Approval fixture的参数化变体',
'approval-audit':'有效Turn、ID、每次审计、策略投影与重复callId不缓存',
'sandbox-policy':'模式/覆盖/根/选择full-partial，用模拟probe，未运行原生runner',
'fs-freshness':'本地真实文件/观察/围栏/生命周期；H15适配器与H16模型工具、新增B分层',
'http-url':'纯URL语法检查；无网络、DNS、地址拒绝或SSRF攻击实测',
'mcp-naming':'公开名称、归一化/长度与原名映射；有限输入不能证明无碰撞',
'file-consumer':'真实tool-fs窗口/编辑/条件注册与可选观察；单个综合fixture承载多断言',
'shell-consumer':'真实消费者/env/Jobs + FixtureShell；没有原生Shell或进程沙箱',
'web-provider':'真实Runtime/工具，内存提供方选择/ready/取消与清洗；8参数变体',
'mcp-stdio':'真实SDK本地stdio协商/发现/调用/刷新/断连/单次重连/释放；无HTTP',
}
def classify(h,n):
 if h=='cross':return {'A':'pipeline-policy','B':'fs-freshness','C':'web-provider'}[re.search(r'cross ([ABC])',n)[1]]
 if h=='h13':
  if n.startswith('D'):return 'loop-feedback'
  i=int(re.match(r'C(\d+)',n)[1]);return ('canonical-output' if i in [1,7,27] else 'registry-scope' if i in [8,9,10,11,12,20,21,30] else 'step-admission' if i in [13,14,15,16,17,18,19,28,29] else 'schema-input')
 if h=='h14':
  if n.startswith('D-scheduling')or n.startswith('C-batch'):return 'batch-scheduling'
  if n.startswith('D-loop'):return 'loop-feedback'
  if n.startswith('C-policy'):return 'pipeline-policy'
  if n.startswith('C-snapshot'):return 'identity-snapshot'
  if n.startswith('C-failure'):return 'pipeline-failure'
  return 'pipeline-result'
 if h=='h15':
  if n.startswith('D pipeline'):return 'pipeline-policy'
  if n.startswith('D Sandbox'):return 'sandbox-policy'
  if n.startswith('D real local'):return 'fs-freshness'
  if any(w in n for w in ['audit','idle','closed','policy','cached','precedence']):return 'approval-audit'
  return 'approval-outcome'
 if n.startswith('C File'):return 'schema-input'
 if n.startswith('C HTTP'):return 'http-url'
 if n.startswith('C MCP'):return 'mcp-naming'
 if n.startswith('D A'):return 'file-consumer'
 if n.startswith('D B'):return 'shell-consumer'
 if n.startswith('D C'):return 'web-provider'
 if n.startswith('D D'):return 'mcp-stdio'
 return 'loop-feedback'
components={
'h13 C':'Tools/Native shared pipeline/testkit + real Scope/SystemPrompt dependencies',
'h13 D':'AgentRegistry/Loop/SystemPrompt/LlmRuntime/Tools/Native/Session',
'h14 C':'Tools/Native/Pipeline + real Cordis; no Agent/log (except explicit helper context)',
'h14 D':'AgentLoop/Prompt/Tools/Native/Session and actual scheduler',
'h15 C':'ApprovalService + real Session/Projection; structural Agent, no Loop',
'h15 D':'Tools/Native/Pipeline/Approval/Session OR SandboxPolicy/provider selection OR fs-local/fs-sandbox/observation',
'h16 C':'Actual argument parser/URL validator/publicToolName pure helpers',
'h16 D':'Per family actual tools/runtime; File real disk; MCP real SDK/stdio; combined actual Loop/Session',
'cross D':'Actual Loop/Tools/Native/Session + Approval/guard OR tool-fs/observation/local OR WebRuntime/tool-web',
}
mock={
'h13':'Arithmetic bodies, condition gates, structural scope-key Agents for C, scripted LLM for D; no file/network/PTC',
'h14':'Constant business tools, deterministic gates, scripted LLM; deliberate instance scheduler fault; no real Approval/UI/OS',
'h15':'Controlled approval answerers, structural Agents, simulated sandbox probe/launcher; fs consumer is fixture adapter',
'h16':'Scripted LLM, FixtureShell, offline Web, trusted MCP fixture business; mock extra scoped resource and attachments registration',
'cross':'Scripted LLM and approval answerer, offline Web provider, explicit Node external write to one new file; no native Shell',
}
sourcefiles={'h13':'registry.test.ts','h14':'pipeline.test.ts','h15':'safety.test.ts','h16':'ecosystem.test.ts','cross':'cross.test.ts'}
rows=[];runindex=[]
for h,expected in [('h13',37),('h14',45),('h15',31),('h16',23),('cross',3)]:
 rawfile=sorted(E.glob('run-*-'+h+'.json'))[-1];raw=json.loads(rawfile.read_text(encoding='utf-8'));names=re.findall(r'^# Subtest: (.+)$',raw['stdout'],re.M);assert len(names)==expected and raw['exit']==0
 path=f'course-content/internal/deepseek-harness/{h}/lab/{sourcefiles[h]}' if h!='cross' else 'docs/deepseek-harness-v2/module-four-review/lab/cross.test.ts';source=(P/path).read_text(encoding='utf-8')
 runindex.append({'lesson':h,'raw':rawfile.relative_to(R).as_posix(),'command':[raw['executable'],*raw['args']],'cwd':raw['scratch'],'pass':expected,'fail':0,'platform':raw['platform'],'programs':raw['programs']})
 for n in names:
  level='D' if n.startswith('D')else'C';family=classify(h,n)
  stem=n if n in source else 'for';pos=source.find(stem);line=source[:max(pos,0)].count('\n')+1
  actual=components[h+' '+level]
  if h=='h15'and level=='D':actual={'pipeline-policy':'Tools/Native/Pipeline + ApprovalService + actual Session; structural Agent; no root tool log sink','sandbox-policy':'SandboxPolicy + Approval + Session + SandboxLocal provider selection (simulated platform probe, no spawn)','fs-freshness':'Actual fs-local/fs-sandbox + fs-observation-policy + Session; explicit fixture consumer, Windows local FS primitives'}[family]
  if h=='h16'and level=='D':actual={'file-consumer':'tool-fs + fs-sandbox/local + Observation + WorkingDirectory + Tools/Native/Pipeline','shell-consumer':'tool-pwsh + shell-env + WorkingDirectory + jobs-local/tool-jobs + Tools/Pipeline; FixtureShell backend','web-provider':'WebRuntime + tool-web + Tools/ResolvedToolSet/Pipeline; offline Providers','mcp-stdio':'mcp-client/mcp-resources + Tools/Scope/Pipeline + actual SDK Client/Server 2.2.0 stdio child processes','loop-feedback':'AgentRegistry/Loop + Session/SystemPrompt/LlmRuntime + Tools/Native/Scope + actual File + tool-pwsh/FixtureShell + offline Web + actual SDK stdio MCP'}[family]
  if h=='cross':actual={'pipeline-policy':'Actual AgentLoop/Registry/Prompt/Session + Tools/Native/Pipeline + ApprovalService/guard','fs-freshness':'Actual AgentLoop/Registry/Prompt/Session + tool-fs + fs-sandbox/local + Observation/WorkingDirectory + Tools/Native/Pipeline','web-provider':'Actual AgentLoop/Registry/Prompt/Session + WebRuntime/tool-web/ResolvedToolSet + Tools/Native/Pipeline; offline Provider'}[family]
  rows.append({'id':f'{h}-{len([r for r in rows if r["lesson"]==h])+1:02d}','name':n,'lesson':h,'level':level,'family':family,'components':actual,'mock':mock[h],'platform':raw['platform']+' / Node '+raw['node'],'run':rawfile.relative_to(R).as_posix(),'testFile':path,'definitionSearchLine':line,'lineMeaning':'exact literal name if present; otherwise loop definition/file entry, parameter expansion shown in TAP','pass':1,'fail':0,'assertion':families[family],'limits':mock[h]+'; full E/native sandbox/real Web/MCP HTTP/learner effects NOT_RUN'})
assert len(rows)==139
grouped={k:[r['id'] for r in rows if r['family']==k] for k in families};assert all(grouped.values())
(E/'test-matrix.json').write_text(json.dumps({'meaning':'139 execution items mapped into 20 semantic assertion families. Neither number is a count of independent safety scenarios; shared-fixture and cross-family assertions remain overlapping. No A/B/E count inflation.','families':families,'groups':grouped,'runs':runindex,'tests':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# 全部测试执行项与去重主题','','136项原测试+3项新增D。20项是语义主题，不是20个互不重叠的真实场景。相同TAP名/文件没有重复；H13的A/B/C先运行一次，再由多个test消费同一结果，不能把37视作37次独立运行。H16的一个File综合例也包含多个断言。多家族Loop项同时覆盖准入、结果与Scope，不与各组件项相加声称E。','', '| ID/等级 | 测试完整名称 | 语义主题 | 测试文件 | 原始结果 |','|---|---|---|---|---|']
for r in rows:lines.append(f"| {r['id']} / {r['level']} | {r['name']} | {r['family']} | `{r['testFile']}:{r['definitionSearchLine']}` | [{r['pass']}/0]({r['run']}) |")
(R/'test-case-index.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
summary=collections.Counter((r['lesson'],r['level'])for r in rows)
print(dict((str(k),v)for k,v in summary.items()))
