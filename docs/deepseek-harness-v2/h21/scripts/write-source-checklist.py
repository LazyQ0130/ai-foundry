from pathlib import Path
import json
R=Path(__file__).resolve().parents[1];lock=json.loads((R/'evidence/source-lock.json').read_text(encoding='utf-8'));S=Path(lock['sourceCache']);COMMIT=lock['commit']
P='packages/subagent/'
# Explicit ranges were reviewed with their containing function. Test links are
# selected official reference evidence, not a claim that Vitest was executed.
rows=[
('subagent/src/index.ts',194,237,'SubagentRuntime','服务注册具名Provider，agents注入后建立Manager；服务本身不加载模型工具。','service.spec.ts','C A registry'),
('subagent/src/index.ts',244,250,'resolveMaxDepth','显式工具值优先；provider-managed省略cap；否则每次读取Host配置cell。直接Runtime请求不自动补默认深度。','continuation.spec.ts','C boundary tool-registration'),
('subagent/src/index.ts',271,287,'startActivation','先选名、校能力、取Manager并核精确在线parent，再分本地/外部分支。','service.spec.ts','C A capabilities'),
('subagent/src/index.ts',633,658,'assertCapabilities','agentPreset要求支持且不继承上下文；其余按字段存在性检查能力标记。','service.spec.ts','C A capabilities'),
('subagent/src/index.ts',549,570,'registerProvider','effect持有注册；重复/无执行方法拒绝，撤注册不撤销已持有执行。','service.spec.ts','C boundary tool-registration'),
('tool-subagent/src/index.ts',201,267,'mount / defineTool','provider存在才登记；描述由inheritsParentContext和prepareContinuable派生；output只含activation/id。','service.spec.ts','D X model delegation, relay, settlement, cold continuation and fork comparison'),
('tool-subagent/src/index.ts',268,332,'execute startActivation','工具用parent delivery启动，得到回执后返回kind/subagentId，未await result。','parent-result.spec.ts','D X model delegation, relay, settlement, cold continuation and fork comparison'),
('subagent/src/manager.ts',379,425,'startLocal','parent delivery需要持久化；caller可临时；捕获模型/策略，准备seed后再物化。','continuation.spec.ts','D A no-persistence'),
('subagent/src/manager.ts',425,474,'startLocal acceptance','创建后接受初始消息、追加父目录再announce；返回childId和messageId。','continuation.spec.ts','D A caller'),
('subagent/src/manager.ts',739,767,'materialize','每次物化先预留共享pool名额，失败释放；本地连续父链接共享容量。','continuation.spec.ts','D D limits-tree'),
('subagent/src/activation.ts',24,37,'ActivationPool.reserve','容量满立即ACTIVATION_LIMIT_REACHED；无无限排队，释放幂等。','continuation.spec.ts','D D limits-tree'),
('subagent/src/manager.ts',851,960,'materializeTracked','本地经ownerCtx.agents.create/resume取得Handle；external start回句柄；startup信号连接只保留到接受窗口。','external-lifecycle.spec.ts','C boundary startup-abort'),
('subagent-spawn-in-process/src/index.ts',35,59,'SpawnInProcessProvider','prepareContinuable返回空创建数据，无父对话seed；支持独立preset。','continuation.spec.ts','D B spawn'),
('subagent-fork-in-process/src/index.ts',46,80,'completedTurnPrefix / prepareContinuable','取最后turn/end含自身的连续前缀；没有已完Turn则空；一次性seed，非持续同步。','continuation-inheritance.spec.ts','D C fork completed-prefix'),
('subagent/src/child-agent.ts',49,59,'resolveChildDepth','父级depth+1并检查安全整数和可选绝对cap；不是任务总量。','child-agent.spec.ts','D D limits-tree'),
('subagent/src/child-agent.ts',68,124,'parentAgentOptionsForDelegation / resolveChildAgentOptions','创建选项合并当前父请求路线与请求覆盖；不能只看Agent.options就声称实际请求路线已改。','child-agent.spec.ts','D B spawn'),
('subagent/src/child-agent.ts',135,153,'childSessionMeta','记录parentSession、origin、depth、isSeeded；这些历史字段不代替Registry owner。','child-agent.spec.ts','D B spawn'),
('subagent/src/child-agent.ts',186,217,'applyChildComposition','有选择挂独立preset；省略composeFrom父当前代际；子上下文登记自身覆盖。','activation-presets.spec.ts','STATIC_REVIEW: preset registry not composed in H21 labs'),
('subagent/src/child-agent.ts',248,280,'delegated policy capture / append','只捕获实际组合提供的策略；sandbox显式override，approval存在时pin never；不复制所有权限或一次性grant。','activation-policy.spec.ts','STATIC_REVIEW: permission services not composed in H21 labs'),
('subagent/src/manager.ts',1100,1110,'settlementState','自然结算须无ownedChildren且无正常待领Inbox；idle可仍驻留并占容量。','parked-wait.spec.ts','D D interrupt'),
('subagent/src/manager.ts',1113,1203,'finishDisposal','停止本地并等待后代/在创子级、idle、flush；捕获结果后释放Handle、归还slot、通知、end、resolve；清理错另由dispose拒绝。','run-settlement.spec.ts','C boundary teardown-failure'),
('subagent/src/manager.ts',1206,1224,'notifySettlement','caller不通知；精确父实例不可用则跳过；活动父steer，idle父queue；draining父inject，异常记警告。','parent-result.spec.ts','C boundary parent-replaced'),
('subagent/src/manager.ts',1228,1237,'flushFinalState','最终Session flush是best effort，失败记警告；不保证可恢复最新前缀。','continuation.spec.ts','STATIC_REVIEW: final-flush failure not injected'),
('subagent/src/activation.ts',156,170,'captureLocalResult','取本activation后缀的最后非空Assistant输出、epoch原因与可选结构化捕获；结果失败不等于缺少Session。','assistant-output.spec.ts','D B child-failure'),
('subagent/src/manager.ts',537,563,'sendMessage','精确live sender，仅驻留子→直接父，或父→直接子；其它谱系声明不给授权。','continuation-messages.spec.ts','D D messages'),
('subagent/src/manager.ts',1438,1460,'submitAdmitted','返回的是消息id；signal只到接受边界；deliver选择steer/queue，不等模型回复。','continuation-messages.spec.ts','D D messages'),
('subagent/src/manager.ts',1349,1415,'coldResume','query观察历史并核lineage和自身descriptor；重建不调用Provider；默认parent delivery；旧activation.dispose不触及新epoch。','continuation.spec.ts','D D cold-resume'),
('subagent/src/manager.ts',183,232,'interrupt','ancestor核确切实例及记录lineage；本地cancel keepInbox，不等待、不清全部后代；外部中止并dispose一次执行。','control.spec.ts','D D limits-tree'),
('tool-subagent-control/src/index.ts',29,113,'control tools','send_message返回MessageId；interrupt_agent返回accepted；工具不额外授予控制权。','continuation-messages.spec.ts','D D interrupt'),
('subagent/src/catalog.ts',115,164,'catalog projection / establishCatalogChild','父所有目录只读自身前缀后的成员事实；本地不论delivery都入册；外部仅parent入册。','catalog.spec.ts','D A caller'),
('subagent/src/descriptor.ts',220,269,'snapshot / foldSubagentDescriptor','首条自身descriptor为准，版本3；未知版本不授continuation；不进入Surface；maxTokens/outputSchema不持久。','catalog.spec.ts','D D cold-resume'),
('subagent/src/list-children.ts',29,142,'listChildren / listDescendants','点读父投影，递归可达目录且释放观察，不resume Agent；未知/不可读分支诊断；external叶。','list-children.spec.ts','D persisted discovery in new Context starts no Agent or model request'),
('tool-subagent-control/src/list-agents.ts',50,74,'statusOf / project','模型列表仅continuable；Registry status===running才running，idle与缺席都inactive；不暴露常驻性。','list-children.spec.ts','D D cold-resume'),
('subagent/src/continuation-messages.ts',140,173,'createSettlementMessage','通知是runtime source=subagent-settled，与子自发agent-message分开；closing文本可省略，结构化/诊断另外附。','parent-result.spec.ts','D X model delegation, relay, settlement, cold continuation and fork comparison'),
('subagent/src/lifecycle.ts',96,118,'createActivationObserver','新runId配对start/end，同一child冷恢复是新run；事件观察与结果Promise、持久事实不同。','external-lifecycle.spec.ts','D D cold-resume'),
]
extra=[
 ('packages/core/session/src/index.ts',1403,1419,'SessionStore.fork','普通fork选合法切点，buildForkSeed可闭合开放尾；不调用SubagentManager或追加父catalog。','packages/core/session/tests/fork.spec.ts','D C fork completed-prefix'),
 ('packages/core/agent/src/index.ts',603,623,'Registry ownership','isOwnedBy比较精确Agent对象；历史parentSession不决定roots。','packages/core/agent-loop/tests/scope-lifecycle.spec.ts','D B spawn'),
 ('packages/core/agent-loop/src/index.ts',465,550,'Factory teardown','Factory清理精确实例；不把父Agent.cancel等同Manager整个子树drain。','packages/core/agent-loop/tests/scope-lifecycle.spec.ts','D D limits-tree'),
]
out=[]
for i,row in enumerate(rows+extra,1):
 f,a,b,symbol,branch,test,local=row
 if i<=len(rows):f=P+f;test=P+'subagent/tests/'+test
 lines=(S/f).read_text(encoding='utf-8').splitlines();b=min(b,len(lines));assert 1<=a<=b,(f,a,b,len(lines))
 tp=S/test
 assert tp.exists(),test
 testlines=tp.read_text(encoding='utf-8').splitlines();tests=[j+1 for j,l in enumerate(testlines) if 'it(' in l or 'it.each(' in l or 'test(' in l]
 out.append({'claim':f'S{i:02}','commit':COMMIT,'file':f,'start':a,'end':b,'symbol':symbol,'controlBranch':branch,'conclusion':branch,'officialTest':{'file':test,'start':tests[0] if tests else 1,'status':'SELECTED_READ_NOT_EXECUTED'},'localTest':local,'grade':local[0] if local.startswith(('C ','D ')) else 'STATIC','status':'DYNAMIC_COVERAGE_LIMITED_TO_LOCAL_TEST' if not local.startswith('STATIC') else 'STATIC_REVIEW'})
related={
 'S02':[('packages/boot/config-editor/src/index.ts',46,80,'profile用户覆盖与继承层的来源'),('packages/settings/settings/src/index.ts',301,330,'显示实际值、base与user'),('packages/client/ui-settings-subagent/src/client/subagent-limits-card-controller.ts',43,55,'Host subagent section的两项限制')],
 'S15':[('packages/subagent/subagent/src/depth.ts',26,35,'持久header深度与runtime深度取最大值')],
 'S16':[('packages/core/agent/src/model-selection.ts',69,120,'已记录的pending/lastUsed优先于创建选项fallback')],
 'S31':[('packages/subagent/subagent/src/descriptor.ts',30,48,'日志事实及版本3定义')],
 'S06':[('packages/subagent/tool-subagent/src/index.ts',355,382,'Provider注册/撤销与模型工具的装卸')],
}
for r in out:
 r['relatedEvidence']=[{'file':f,'start':a,'end':b,'meaning':m} for f,a,b,m in related.get(r['claim'],[])]
 for e in r['relatedEvidence']:assert 1<=e['start']<=e['end']<=len((S/e['file']).read_text(encoding='utf-8').splitlines())
(R/'evidence/source-assertions.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
url=lock['repository']+'/blob/'+COMMIT+'/'
md='# H21 固定源码断言清单\n\nCommit `'+COMMIT+'`。位置核验只证明身份和范围；实际分支语义按下表审读。官方测试仅选读，未执行其递归清理钩子。C/D为作者用例的限定证据，不把必要依赖重复算B。\n\n'
for r in out:
 md+=f"## {r['claim']} · {r['symbol']}\n\n- 源码：[{r['file']}:{r['start']}–{r['end']}]({url}{r['file']}#L{r['start']}-L{r['end']})。\n- 条件、分支与教学结论：{r['controlBranch']}\n- 官方参考：[{r['officialTest']['file']}:{r['officialTest']['start']}]({url}{r['officialTest']['file']}#L{r['officialTest']['start']}-L{min(r['officialTest']['start']+20,len((S/r['officialTest']['file']).read_text(encoding='utf-8').splitlines()))})，仅静态选读。\n- 本轮行为：`{r['localTest']}`；等级 `{r['grade']}`。映射表示该用例覆盖相关子分支，不能推为覆盖本段每一分支。\n\n"
 for e in r['relatedEvidence']:md+=f"- 补充：[{e['file']}:{e['start']}–{e['end']}]({url}{e['file']}#L{e['start']}-L{e['end']})；{e['meaning']}，静态阅读。\n"
(R/'source-checklist.md').write_text(md.rstrip()+'\n',encoding='utf-8');print(len(out),'source assertions')
