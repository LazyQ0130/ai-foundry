from pathlib import Path
import json
R=Path('docs/deepseek-harness-v2/h22').resolve();lock=json.loads((R/'evidence/source-lock.json').read_text());S=Path(lock['sourceCache']);C=lock['commit'];W='packages/workflow/'
# Ranges are the containing branches reviewed in the fixed tree. Anchors aid
# reproducibility; they are not a substitute for control-flow review.
rows=[]
def add(file,start,end,symbol,claim,test,line,local='STATIC_REVIEW'):
 rows.append((file,start,end,symbol,claim,test,line,local))
t=W+'workflow-ptc/tests/workflow-ptc.spec.ts';tt=W+'tool-workflow/tests/tool-workflow.spec.ts';h=W+'workflow-ptc/tests/host.spec.ts'
add(W+'workflow/src/index.ts',157,192,'WorkflowEngine / emitWorkflowEvent','单一 ctx.workflowEngine 服务，不是具名后端表；观察者同步与异步异常分别包含。',W+'workflow/tests/workflow.spec.ts',1,'C C4')
add(W+'workflow/src/runtime-types.ts',19,50,'WorkflowStartRequest / WorkflowRun','script、meta、args、parent、signal、subagentProvider、maxTotalAgents；start返回持有者拥有的run，result约定不拒绝，dispose异步。',t,746,'C A1; C C1')
add(W+'workflow/src/types.ts',28,87,'WorkflowMeta / WorkflowResult','meta是数据；stopReason为completed/cancelled/error；value只在completed有意义；agentsStarted正常来自guest接受数量，终止可能降为host观察数。',t,201,'C A1; C A3; C C1')
add(W+'workflow/src/types.ts',90,137,'WorkflowResultInfo / WorkflowAgentInfo','实时end只含终态信息，不含最终value；agent事件含seq/label/childId与可选phase。',t,861,'D D1; C C1')
add(W+'workflow/src/index.ts',108,149,'WorkflowError / isFatalWorkflowError','十二类code，fatal默认true；普通异常与本实现创建的致命契约错误分开。',t,350,'C B4')
add(W+'workflow-ptc/src/index.ts',33,65,'Config / assertBodyParses','脚本是JavaScript异步函数体，支持顶层await，拒绝TS标注和export meta；四项引擎限制。',t,582,'C A2')
add(W+'workflow-ptc/src/index.ts',68,96,'provider and total admission','整次run选择一个Subagent Provider；未知Provider为AGENT_START；每次总量正整数且不得越过引擎上限。',t,279,'C A2; C B5')
add(W+'workflow-ptc/src/index.ts',100,133,'PtcWorkflowEngine constructor','默认spawn；并发0由CPU推导最多16；总量1000、组合器4096、同步切片5000ms；要求runtime语言typescript，不代表脚本接受TS。',h,263)
add(W+'workflow-ptc/src/index.ts',134,190,'PtcWorkflowEngine.start','先meta/parse/Provider/cap，structuredClone args，然后建立run并发布start；结果后发end，meta与args分别捕获。',t,186,'C A1; C A2; C A4')
add(W+'workflow-ptc/src/meta.ts',1,None,'validateMeta','校验必填及允许字段并复制meta；name只校非空，未强制kebab正则；phases声明不建立调度控制。',W+'workflow-ptc/tests/meta.spec.ts',1,'C A2; C C4')
add(W+'workflow-ptc/src/runtime.ts',56,142,'WorkflowExecution.drive','创建VM context注入六类钩子和args；syncTimeout只包初始runInContext；返回值物化、undefined归null，异常成为error结果。',W+'workflow-ptc/tests/guest.spec.ts',1,'C A3; C C3')
add(W+'workflow-ptc/src/runtime.ts',144,237,'acquireSlot / agent','guest接受计数先于FIFO槽；启动失败AGENT_START，结果拒绝AGENT_RESULT；已结算子级非completed返回null；finally dispose并还槽。',t,471,'C B1; C B4; C B5; C B6')
add(W+'workflow-ptc/src/runtime.ts',163,237,'agent schema result','schema为受支持object子集；completed但缺structured也返回null；无schema拼接文本输出。',W+'workflow-ptc/tests/integration.spec.ts',73,'C B7')
add(W+'workflow-ptc/src/runtime.ts',239,282,'readAgentOptions','只支持label、phase、schema、provider、model；effort/isolation/agentType延后未支持；provider/model是模型路线，非Subagent backend。',t,232,'C B4; D D1')
add(W+'workflow-ptc/src/runtime.ts',285,308,'parallel','先整体校验数组/条目，再Promise.all；结果按输入顺序，普通thunk抛错为null，fatal继续传播。',W+'workflow-ptc/tests/guest.spec.ts',1,'C B1; C B3; C B4')
add(W+'workflow-ptc/src/runtime.ts',311,340,'pipeline','pipeline(items,...stages)，回调(previous,item,index)；每项内部顺序，无跨条目阶段屏障；普通throw使该项null并跳过余阶段。',W+'workflow-ptc/tests/guest.spec.ts',1,'C B2; C B3; D D1')
add(W+'workflow-ptc/src/runtime.ts',339,None,'assertItemCap / phase / log','组合器条目上限在调用前拒绝；phase只非空字符串并更新注解，log只字符串；不要求匹配meta声明、不产生屏障。',t,201,'C B5; C C4')
add(W+'workflow-ptc/src/realm.ts',44,None,'materializeFromRealm','只接受无损plain JSON：拒绝exotic prototype、循环、嵌套undefined、非有限数、BigInt、稀疏数组、函数；不能用JSON.stringify替代。',W+'workflow-ptc/tests/realm.spec.ts',1,'C A3; C A4')
add(W+'workflow-ptc/src/host.ts',113,187,'PtcWorkflowRun ownership','捕获服务/父级/策略，cancel只请求停止；dispose共享result之后的Promise；pending集合用于结算等待。',t,746,'C C1')
add(W+'workflow-ptc/src/host.ts',200,229,'startChild','所有子级使用同一parent与cwd，delivery caller；不传显式maxDepth；晚到已取消句柄先dispose再拒绝发布。',h,267,'C C2; D D1')
add(W+'workflow-ptc/src/host.ts',231,256,'childResult / disposeChild','子级结果严格JSON过界；dispose memoize，异常被catch并warn；不能宣称任意清理失败都由result拒绝。',t,531,'C B4; C C1')
add(W+'workflow-ptc/src/host.ts',258,280,'onProgress / cancelled','host只接受当前活跃子级，cancel后不再叙述；未收正常guest结果的取消计数用host已观察启动数。',t,695,'C C1; C C4')
add(W+'workflow-ptc/src/host.ts',282,None,'drive finally','策略受限而runtime不宣称confinement则fail closed；调用timeoutMs:null；finally abort、dispose、排空pending并补live agent终边。',t,888,'C C1; C C2; C C3; C boundary missing confinement')
add(W+'workflow-ptc/src/guest.ts',16,None,'runWorkflowGuest','进度分批有序发Host，已发布子级dispose前排空进度；最后再排空进度后返回。',W+'workflow-ptc/tests/guest.spec.ts',1,'C C1; D D1')
add('packages/ptc-runtime/ptc-runtime-node/src/index.ts',1,None,'NodePtcRuntime','真实隔离进程经sandbox与subprocess执行，sandboxMode反映默认策略；不以VM充当安全边界。',W+'workflow-ptc/tests/built-runtime.e2e.ts',1,'C C5')
add('packages/ptc-runtime/ptc-runtime-node/src/config.ts',1,None,'resolveConfig','PTC maxPendingCalls默认128为binding在途请求预算，独立于Workflow子级并发；内存、消息和进程grace也独立。',W+'workflow-ptc/tests/built-runtime.e2e.ts',1)
add('packages/sandbox/sandbox-local/src/index.ts',1,None,'local Windows backend','Windows ACL默认partial，read-only不授写权；文件策略不等于网络隔离，不能静默以unrestricted补受限能力。',W+'workflow-ptc/tests/built-runtime.e2e.ts',1,'C C5; C boundary missing confinement')
add('packages/sandbox/sandbox-windows-acl/src/runner.ts',1,None,'Windows ACL runner','正式runner创建受限令牌，失败报告非零，不启动无约束替代；实验只打包固定源码。',W+'workflow-ptc/tests/built-runtime.e2e.ts',1,'C C5')
add(W+'tool-workflow/src/index.ts',318,400,'apply / tool schema','工具消费抽象Engine；meta/script分开；enableRunInBackground可隐藏Schema参数；用工具prompt限定显式workflow或大规模编排。',tt,619,'D D2')
add(W+'tool-workflow/src/index.ts',401,None,'foreground execute','前台传工具signal，等待结果，异常由Tools形成isError；finally等待dispose，根调用才finish/abandon记录。',tt,298,'D D1; D D2')
add(W+'tool-workflow/src/index.ts',239,249,'renderResult','maxResultChars截展示JSON字符串，不截Engine值，也不是计算或安全预算。',tt,382,'D D2')
add(W+'tool-workflow/src/index.ts',93,169,'createWorkflowRecorder','仅根调用记录run-start/agent-start/agent-end/run-end四类log-only事实；append失败warn并停记，不反转工作流。',tt,154,'D D1')
add(W+'tool-workflow/src/types.ts',1,None,'tool-workflow Session event types','持久payload不包含phase/log或全部子历史；不能将runtime事件自动等同持久Session输入。',tt,228,'D D1; C C4')
add(W+'tool-workflow/src/index.ts',263,316,'startBackgroundRun','Jobs先准入再同步建立run，无tool-step signal；返回jobId/runId；job取消拥有run；done等待dispose后映射终态。',tt,479,'D D3; D D4')
add(W+'tool-workflow/src/index.ts',219,237,'jobOutcomeOf','completed→completed携渲染结果；cancelled→killed；error→failed。后台不是Engine自身恢复机制。',tt,541,'D D3; D D4')
add(W+'tool-workflow/src/record.ts',37,None,'createWorkflowRecordMirror','phase更新progress并向log通道追加，log和成员观察也进log；不是模型增量流。',tt,479,'D D3')
add('packages/jobs/jobs/src/index.ts',85,None,'JobRegistry','抽象服务不可直接装载；producer提供cancel/done；owner授权、controller准入、read模型游标、readAt观察游标各自独立。','packages/jobs/jobs-local/tests/service.spec.ts',1,'D D3; D D4')
add('packages/jobs/jobs-local/src/index.ts',1,None,'LocalJobRegistry','任务表和环在进程内；五状态running/stopping/completed/killed/failed；读后终态结果只交一次，非持久脚本检查点。','packages/jobs/jobs-local/tests/service.spec.ts',1,'D D3; D D4')
add('packages/jobs/tool-jobs/src/index.ts',355,430,'deliverSettlement','未收集且非teardown的完成通知：默认idle followup，busy inject；quiet只inject；显式wait已收集则不再通知。','packages/jobs/tool-jobs/tests/tool-jobs.spec.ts',1,'D D3')
add('packages/jobs/tool-jobs/src/render.ts',1,None,'renderModelDelta','模型只见stdout、未标通道与stderr增量和终态结果，observer log被过滤；job_output取回并撤销未送达通知。','packages/jobs/tool-jobs/tests/tool-jobs.spec.ts',1,'D D3')
add('packages/goal/goal/src/types.ts',19,112,'GoalRef / GoalView','Goal目标与revision/CAS、轮次上限、持久phase和进程activation分层；armed不是已恢复旧执行栈。','packages/goal/goal/tests/projection.spec.ts',94,'C boundary Goal')
add('packages/goal/goal/src/index.ts',280,405,'Goal create/pause/resume/disarm','create armed，pause持久变更，resume需当前ref与剩余预算；disarm不改phase/revision；单装service不等于驱动自动目标轮。','packages/goal/goal/tests/projection.spec.ts',94,'C boundary Goal')
add('packages/schedule/schedule/src/index.ts',243,335,'Schedule create/list/catalog','Host durable domain，恰选一种时间selector且有title；只读列表不激活Agent，子Session拒绝；历史Schedule Session事件不驱动Host任务。','packages/schedule/schedule/tests/recovery.spec.ts',57,'C boundary Schedule')
add('packages/schedule/schedule/src/runtime.ts',1,None,'ScheduleRuntime','Schedule持久化待触发记录并经Session resolver投递，记录回执与重复计划；恢复的是调度状态，非Workflow guest程序计数器。','packages/schedule/schedule/tests/recovery.spec.ts',57)
add('packages/subagent/subagent/src/activation.ts',24,37,'ActivationPool.reserve','Subagent容量层满直接拒绝，与Workflow FIFO槽不同；Workflow不自动提高树容量或深度。','packages/subagent/subagent/tests/continuation.spec.ts',1,'C B6')
add('docs/subsystems/goal.zh.md',118,139,'GoalMessageSource / roundsStarted','获准目标续跑user/message携goalId、revision和连续round；只有获准输入推进计数，非模型Attempt或Workflow子级。','packages/goal/goal/tests/projection.spec.ts',94)
# Correct any fixture-specific reference names against real fixed files.
for f in ['packages/jobs/jobs-local/tests/service.spec.ts']:
 if not (S/f).exists():
  found=sorted((S/'packages/jobs/jobs-local/tests').glob('*.spec.ts'));assert found
  rows=[tuple(str(found[0].relative_to(S)).replace('\\','/') if j==5 and v==f else v for j,v in enumerate(r)) for r in rows]
out=[]
for n,(f,a,b,symbol,claim,test,line,local) in enumerate(rows,1):
 lines=(S/f).read_text(encoding='utf-8').splitlines();b=len(lines) if b is None else min(b,len(lines));assert 0<a<=b
 ts=(S/test).read_text(encoding='utf-8').splitlines();assert line<=len(ts)
 out.append(dict(claim=f'S{n:02}',commit=C,file=f,start=a,end=b,symbol=symbol,controlBranch=claim,conclusion=claim,officialTest=dict(file=test,start=line,status='SELECTED_READ_NOT_EXECUTED'),localTest=local,grade=local[0] if local.startswith(('C ','D ')) else 'STATIC',status='STATIC_REVIEW' if local=='STATIC_REVIEW' else 'DYNAMIC_COVERAGE_LIMITED_TO_LOCAL_TEST'))
(R/'evidence/source-assertions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
u='https://github.com/deepseek-ai/deepseek-harness/blob/'+C+'/'
md='# H22 固定源码断言\n\n固定 Commit `'+C+'`。准确范围与分支审读并用；官方 Vitest 仅静态选读，含递归清理的原钩子不执行。本地 C/D 映射只覆盖列明子分支，不等于整文件覆盖。\n\n'
for r in out:
 md+=f"## {r['claim']} · {r['symbol']}\n\n{r['conclusion']}\n\n源码：[{r['file']}:{r['start']}–{r['end']}]({u}{r['file']}#L{r['start']}-L{r['end']})。官方参考：[{r['officialTest']['file']}:{r['officialTest']['start']}]({u}{r['officialTest']['file']}#L{r['officialTest']['start']})，选读未执行。本轮 `{r['localTest']}`，等级 `{r['grade']}`。\n\n"
(R/'source-checklist.md').write_text(md.rstrip()+'\n',encoding='utf-8');print(len(out),'source assertions')
