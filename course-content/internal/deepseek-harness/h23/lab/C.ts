import {DeepSeekHarness,HarnessClient,assert,bounded,until,sdkHome,sdkOptions,observe,runtimeTrace,record,readFile,resolve} from './support.ts';
import {writeFile} from 'node:fs/promises';
export async function entered(home:string){
 const end=Date.now()+10000;while(Date.now()<end){try{await readFile(resolve(home,'held.json'));return;}catch(e:any){if(e.code!=='ENOENT')throw e;}await new Promise<void>(r=>setImmediate(r));}throw Error('Mock model gate not entered');
}
export async function sdkReview(){const home=await sdkHome(),h=new DeepSeekHarness(sdkOptions(home)),wire=observe(h.client);try{
 const result=await h.run('Inspect fictional facts',{sessionId:'sdk-review'});assert.match(result.finalResponse,/modules=3/);assert.ok(result.events.some(e=>e.type==='assistant/message'));assert.ok(result.notifications.some(n=>n.method==='session.status'&&n.params.status==='idle'));await h.close();assert.equal(wire.child.exitCode,0);const evidence={result,wire:wire.trace(),runtime:await runtimeTrace(home),home};await record('C1',evidence);return evidence;
 }catch(error){await record('C1-failure',{home,wire:wire.trace(),error:String(error)});throw error;}finally{await h.close();}}
export const cases:[string,()=>Promise<void>][]=[
 ['D C1 real SDK client-server stdio, run notifications, shutdown and process reap',async()=>{await sdkReview();}],
 ['D C2 low-level prompt receipt precedes wait and final result',async()=>{
  const home=await sdkHome(),client=new HarnessClient(sdkOptions(home)),wire=observe(client);try{await client.initialize({cwd:process.env.H23_RUN_ROOT!,provider:'fixture',model:'parent'});const sub=client.subscribeSessionTree('queued');const receipt=await client.prompt('queued',[{type:'text',text:'HOLD'}]);assert.ok(receipt);await entered(home);let done=false;const wait=client.request('session/wait',{sessionId:'queued'}).then(v=>{done=true;return v;});await new Promise<void>(r=>setImmediate(r));assert.equal(done,false);await writeFile(resolve(home,'release'),'release');await bounded(wait);const notifications=[];while(true){const next=sub.tryNext();if(next===undefined)break;notifications.push(next);}sub.close();assert.ok(JSON.stringify(notifications).includes('HOLD_RELEASED'));await client.close();assert.equal(wire.child.exitCode,0);await record('C2',{receipt,doneBeforeRelease:false,notifications,wire:wire.trace(),runtime:await runtimeTrace(home)});
  }finally{await client.close();}
 }],
 ['D C3 high-level run owns an activity interval rather than prompt causality',async()=>{
  const home=await sdkHome(),h=new DeepSeekHarness(sdkOptions(home)),wire=observe(h.client);try{const pending=h.run('HOLD',{sessionId:'interval'});await entered(home);await h.client.prompt('interval',[{type:'text',text:'SECOND_QUEUED'}]);await writeFile(resolve(home,'release'),'release');const result=await bounded(pending);assert.match(result.finalResponse,/SECOND_QUEUED/);assert.equal(result.events.filter(e=>e.type==='assistant/message').length,2);await h.close();await record('C3',{result,wire:wire.trace(),runtime:await runtimeTrace(home)});}finally{await h.close();}
 }],
];
