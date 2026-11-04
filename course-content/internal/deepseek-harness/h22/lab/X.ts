import {fixture,assert,gate,until,bounded,text,call,user,hasText,meta,record} from './support.ts';
export const script=`phase('Inspect');
log('review fictional facts');
const [architecture,tests] = await parallel([
 () => agent('architecture: modules=3', {model:'architecture', label:'Architecture'}),
 () => agent('tests: covered=2/3', {model:'tests', label:'Tests'})
]);
phase('Synthesize');
const [report] = await pipeline([{architecture,tests}],
 (previous,item,index) => agent('risk and synthesis: '+JSON.stringify(previous), {model:'synthesis',label:'Synthesis'})
);
return {architecture,tests,report};`;
export async function integrated(){
 const f=await fixture({tool:true}),hold=gate();let entered=0;
 try{
  f.adapter.scripts.set('architecture',[async function*(){entered++;await hold.promise;yield*text('modules=3');}]);
  f.adapter.scripts.set('tests',[async function*(){entered++;await hold.promise;yield*text('covered=2/3');}]);
  f.adapter.scripts.set('synthesis',[text('risk=one uncovered module; recommend focused test')]);
  f.adapter.scripts.set('parent',[call('workflow',{meta,script},'review-workflow'),text('PARENT_REVIEW_COMPLETE')]);
  f.parent.followup(user('Use a workflow to review the fictional project and synthesize risks.'));
  await until(()=>entered===2,'two real child AgentLoops');
  assert.equal(f.events(f.parent).filter((e:any)=>e.type==='tool/result').length,0,'foreground tool result still pending');assert.equal(f.adapter.requests.filter(r=>r.model==='parent').length,1);
  hold.release();await bounded(f.parent.whenIdle(),'parent workflow turn');
  const parent=f.events(f.parent),results=parent.filter((e:any)=>e.type==='tool/result');assert.equal(results.length,1);assert.equal(results[0].data.message.isError,false);
  const rendered=results[0].data.message.content[0].text;const aggregate=JSON.parse(rendered.split('Return value:\n')[1]);assert.deepEqual(aggregate,{architecture:'modules=3',tests:'covered=2/3',report:'risk=one uncovered module; recommend focused test'});
  const requests=f.adapter.requests.filter(r=>r.model==='parent');assert.equal(requests.length,2);assert.ok(hasText(requests[1].messages,'risk=one uncovered module'));
  assert.equal(f.lifecycle.filter(e=>e.edge==='start').length,3);assert.equal(f.lifecycle.filter(e=>e.edge==='end').length,3);assert.equal(parent.filter((e:any)=>e.type==='user/message'&&e.data.source.kind==='subagent-settled').length,0);
  const durable=parent.filter((e:any)=>e.type.startsWith('tool-workflow/'));assert.equal(durable.length,8);assert.equal(durable.filter((e:any)=>e.type==='tool-workflow/agent-start').length,3);
  assert.equal(parent.filter((e:any)=>e.type==='workflow/log'||e.type==='workflow/phase').length,0);assert.equal(f.processEvents.every(p=>p.done),true);
  await f.ctx.parallel('session/flush',f.parent.session);const stored=await f.stored(f.parent.id);assert.deepEqual(stored.events.filter((e:any)=>e.type.startsWith('tool-workflow/')),durable);
  const ended=f.workflowEvents.find(e=>e.name==='workflow/end');assert.ok(ended);assert.equal(hasText([ended],'risk=one uncovered module'),false);
  const startC=f.workflowEvents.findIndex(e=>e.name==='workflow/agent-start'&&e.args[1].label==='Synthesis');
  for(const label of ['Architecture','Tests']){const end=f.workflowEvents.findIndex(e=>e.name==='workflow/agent-end'&&e.args[1].label===label);assert.ok(end>=0&&end<startC);}
  assert.ok(requests[0].tools.some((t:any)=>t.name==='workflow'),'actual parent model sees workflow schema');
  const evidence={script,parent,requests:f.adapter.requests,lifecycle:f.lifecycle,workflowEvents:f.workflowEvents,stored:stored.events,processes:f.processEvents,jsonlRoot:f.root,scope:'real parent + 3 child AgentLoops + Spawn + Workflow/PTC + JSONL; controlled local Mock LLM, no E integration'};
  await record('X',evidence);return evidence;
 }finally{hold.release();await f.close();}
}
