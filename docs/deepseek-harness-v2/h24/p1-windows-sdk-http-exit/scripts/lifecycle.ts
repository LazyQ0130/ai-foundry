import {DeepSeekHarness} from '@deepseek-ai/dsh-sdk-client';
import {startMockLlmServer} from '@deepseek-ai/dsh-llm-mock-server';
import {subscribe,unsubscribe} from 'node:diagnostics_channel';
import {createServer as netServer} from 'node:net';
import {writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {world,readFile,rawLog,resolve,record,bounded,until,assert} from './support.ts';
import {options,observe} from './C.ts';
const style=process.argv[2]??'protocol',active=process.argv[3]==='active';
const sockets=new Set<any>(),seen=new Set<any>();
const listener=(message:any)=>{const socket=message.request?.socket;if(!socket||seen.has(socket))return;seen.add(socket);sockets.add(socket);socket.once('close',()=>sockets.delete(socket));};
subscribe('http.server.request.start',listener);
const server=await startMockLlmServer({port:0,apiKey:'h24-local-only',randomSeed:24,sequence:active?['stall']:['rate_limit','tool_call_success','success'],retryAfterMs:1,toolName:'write_fixture',toolArguments:JSON.stringify({text:'mode=safe\n'}),successText:'Lifecycle fixture completed.'});
const w=await world({endpoint:server.baseURL,sdk:true}),h=new DeepSeekHarness(options(w)),wire=observe(h.client);let pending:any,result:any,shutdownResponse=false,exit:any;
try{
 await h.start();pending=h.run('Set fixture config to safe mode.',{sessionId:'lifecycle'}).then(value=>({value}),error=>({error:String(error)}));
 if(active)await until(()=>server.requests.length===1,'actual HTTP request');else{result=await pending;assert.ok(!result.error,result.error);assert.equal(await readFile(resolve(w.workspace,'config.txt'),'utf8'),'mode=safe\n');}
 const closed=new Promise<any>(ok=>wire.child.once('close',(code:any,signal:any)=>ok({code,signal})));
 if(style==='protocol'){await h.client.request('shutdown');shutdownResponse=true;}
 else if(style==='eof')wire.child.stdin.end();
 else if(style==='dispose')await writeFile(resolve(w.root,'dispose.request'),'dispose');
 else if(style==='sigterm')wire.child.kill('SIGTERM');
 else throw Error('unknown close style '+style);
 exit=await bounded(closed,'outer real child close');result??=await pending;
}catch(error){result={error:String(error),stack:(error as Error).stack};}
finally{
 await h.close();await server.close();unsubscribe('http.server.request.start',listener);
 await until(()=>sockets.size===0,'owned HTTP socket close');
 const verify=netServer();await new Promise<void>((ok,bad)=>{verify.once('error',bad);verify.listen(server.port,'127.0.0.1',ok)});await new Promise<void>(ok=>verify.close(()=>ok()));
 const log=await rawLog(w.root).catch(()=>null),runtime=await readFile(resolve(w.root,'runtime-trace.json'),'utf8').then(JSON.parse).catch(()=>null);
 await record('lifecycle',{style,active,node:process.version,world:w,wire:wire.trace(),shutdownResponse,exit,result,rootDisposePromiseSettled:existsSync(resolve(w.root,'p1-root-dispose-done')),rootDisposeError:await readFile(resolve(w.root,'p1-root-dispose-error'),'utf8').catch(()=>null),server:{port:server.port,requests:server.requests,socketsObserved:seen.size,socketsRemaining:sockets.size,listenerClosed:true,portRebound:true},log,runtime,normalExit:exit?.code===0&&exit?.signal===null,meaning:style==='sigterm'?'Windows SIGTERM uses TerminateProcess: forced observation, not graceful PASS':'outer process close observed; native assertions or nonzero exits remain failures'});
}
console.log(JSON.stringify({style,active,exit,shutdownResponse}));
