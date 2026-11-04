// Author-controlled composition, official SDK server/protocol/AgentLoop/JSONL.
// Real CLI parsing + isolated author Profile/AppBoot; not the shipped SDK Profile.
import './bootstrap.mjs';
import {fixture,blocks,text,call,record} from './agent-fixture.ts';
import * as SDK from '@deepseek-ai/dsh-sdk-jsonrpc-server';
import Approval from '@deepseek-ai/dsh-user-approval';
import UserQuestions from '@deepseek-ai/dsh-user-questions';
import {parseDshArgs} from './fixed-cli-args.ts';
import {writeFile,access,mkdir} from 'node:fs/promises';
import {watch} from 'node:fs';
import {resolve} from 'node:path';
import {boot,loadProfileDirectory} from '@deepseek-ai/dsh-app-boot';
const invocation=parseDshArgs(process.argv.slice(2),'0.2.2-alpha.2');
if(invocation.mode!=='profile'||invocation.profile!=='sdk-minimal')throw Error('fixture requires --profile sdk-minimal');
async function mountRuntime(ctx:any){
const f=await fixture({ctx,root:resolve(process.env.DSH_HOME!,'sessions')});
await f.ctx.plugin(Approval);await f.ctx.plugin(UserQuestions);let effects=0;
f.tool('fixture_question',async(_args:any,exec:any)=>JSON.stringify(await f.ctx.userQuestions.ask({agent:exec.agent,signal:exec.signal,questions:[{id:'format',question:'Which fixture format?',options:[{label:'JSON'},{label:'CSV'}]}]})));
f.tool('fixture_review',async(_args:any,exec:any)=>{
 const outcome=await f.ctx.approval.request({agent:exec.agent,toolName:'fixture_review',callId:exec.callId,reason:'controlled hypothetical write'});
 if(outcome==='allowed-once')effects++;return 'approval='+outcome+';effects='+effects;
});
f.adapter.stream=async function*(options:any){
 f.adapter.requests.push(structuredClone({...options,signal:undefined}));
 let lastUser=-1;for(let i=0;i<options.messages.length;i++)if(options.messages[i].role==='user'&&options.messages[i].source?.kind==='user')lastUser=i;
 const prompt=options.messages[lastUser]?.content?.filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')??'';
 const suffix=options.messages.slice(lastUser+1),tool=suffix.find((m:any)=>m.role==='tool');
 if(prompt.includes('HOLD')){
  await writeFile(resolve(process.env.DSH_HOME!,'held.json'),JSON.stringify({entered:true}));
  const release=resolve(process.env.DSH_HOME!,'release');let wake!:()=>void;
  const waiting=new Promise<void>(r=>wake=r),watcher=watch(process.env.DSH_HOME!,(_kind,name)=>{if(name==='release')wake();});
  const abort=()=>wake();options.signal.addEventListener('abort',abort,{once:true});
  try{if(options.signal.aborted)wake();try{await access(release);wake();}catch{}await waiting;options.signal.throwIfAborted();yield*text('HOLD_RELEASED');return;}
  finally{watcher.close();options.signal.removeEventListener('abort',abort);}
 }
 if(prompt.includes('APPROVAL')&&!tool){yield*call('fixture_review');return;}
 if(prompt.includes('QUESTION')&&!tool){yield*call('fixture_question');return;}
 yield*text(tool?'DECISION '+JSON.stringify(tool.content):'REVIEW modules=3; covered=2/3; prompt='+prompt);
};
f.ctx.effect(()=>async()=>{
 await writeFile(resolve(process.env.DSH_HOME!,'runtime-trace.json'),JSON.stringify({pid:process.pid,invocation,effects,events:Object.fromEntries(f.facts),requests:f.adapter.requests},null,2)+'\n');
});
// The production CLI owns EOF/signals. This fixture mirrors that ownership.
let stopping:Promise<void>|undefined;
const stop=()=>stopping??=(async()=>{await f.ctx.fiber.dispose();process.exitCode=0;})();
process.stdin.on('end',()=>{void stop();});
for(const name of ['SIGTERM','SIGINT'] as const)process.on(name,()=>{void stop();});

}
const profileDir=resolve(process.env.DSH_HOME!,'profiles','h23-sdk-fixture');
await mkdir(profileDir,{recursive:true});
await writeFile(resolve(profileDir,'package.json'),JSON.stringify({name:'h23-sdk-fixture',private:true,dsh:{profile:{bundles:[]}}}));
await writeFile(resolve(profileDir,'cordis.patch.yml'),'[]\n');
await writeFile(resolve(profileDir,'cordis.yml'),'[]\n');
const profile=loadProfileDirectory('h23-sdk',profileDir,resolve(profileDir,'package.json'));
const ctx=await boot('h23-sdk',resolve(profileDir,'cordis.yml'),profile.patches,mountRuntime);
await ctx.plugin(SDK,{});
await writeFile(resolve(process.env.DSH_HOME!,'runtime-ready.json'),JSON.stringify({pid:process.pid,profile:profileDir,loaderSettled:true,services:['app-boot','loader','session','agent-loop','tools','llm','jsonl','subagent','approval','sdk-jsonrpc-server'],invocation}));
