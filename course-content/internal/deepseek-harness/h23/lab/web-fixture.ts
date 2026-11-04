import {agentFixture,assert,blocks,resolve} from './support.ts';
import {Service,Context} from '@deepseek-ai/cordis';
import FileSystem from '@deepseek-ai/dsh-fs-local';
import TypertRegistry from '@deepseek-ai/dsh-typert-registry';
import RemoteAccess from '@deepseek-ai/dsh-api-remote-access';
import Gateway from '@deepseek-ai/dsh-api-gateway';
import SessionController from '@deepseek-ai/dsh-api-session-controller';
import {installConnection} from '@deepseek-ai/dsh-client-connection/client';
import {createWebConnectionRpc} from '@deepseek-ai/dsh-client-connection/src/client/rpc.ts';
export async function webFixture(options:{root?:string}={}){
 const f=await agentFixture(options);await f.ctx.plugin(FileSystem);await f.ctx.plugin(TypertRegistry);await f.ctx.plugin(RemoteAccess);await f.ctx.plugin(Gateway);
 f.ctx.provide('agentDefaultModel',{currentSelection:()=>({provider:'fixture',model:'parent'}),saveSelection:async()=>{}} as any);
 f.ctx.provide('workspaceRegistry',{archivedSessionIds:[],list:()=>[],get:()=>undefined} as any);
 f.ctx.provide('attachments',{admitPromptContent:async(parts:any[])=>{assert.ok(parts.every(p=>p.type==='text'));return parts;},imageLimits:{maxImageBytes:5242880,maxImagesPerMessage:20,maxMessageImageBytes:104857600,maxImagePixels:40000000,maxImageDimension:2000,mediaTypes:['image/png']}} as any);
 f.ctx.provide('fileUploads',{registerAgentResolver:()=>()=>{},resolve:()=>undefined,bindPrompt:()=>({commit(){},[Symbol.dispose](){}}),retirePrompt(){}} as any);
 class Controller extends SessionController{initialize(){return this[Service.init]();}}
 const controller=new Controller(f.ctx,{nativeOpen:false});await controller.initialize();
 const client=new Context(),wire:any[]=[],peers:any[]=[];
 const peer=(signal=new AbortController().signal,principal:any={kind:'owner'})=>({id:'h23-peer',ctx:f.ctx,principal,interactions:'none',signal,dispose:async()=>{}});
 let handler:any;
 f.ctx.provide('connection',{rpc:{intercept(_channel:any,_matches:any,h:any){handler=h;return ()=>{};}}} as any);
 await f.ctx.fiber.await();assert.ok(handler,'Gateway attached carrier-neutral RPC interceptor');
 const rpc=createWebConnectionRpc(async(input,init)=>{
  const request=JSON.parse(init.body as string);wire.push({route:String(input),request});
  const result=await handler(request.method,request.payload,init.signal??new AbortController().signal,peer(init.signal as any));
  return new Response(JSON.stringify({type:'server-response',rpcId:request.rpcId,result}),{headers:{'content-type':'application/json'}});
 },(endpoint,payload,signal)=>({async *[Symbol.asyncIterator](){const [namespace,method]=endpoint.split('/');yield*await f.ctx.typertGateway.stream({peer:peer(signal),namespace,method,args:(payload as any).args});}}));
 installConnection(client,{transport:{rpc},location:{hostname:'localhost'}});
 const call=(method:string,request:any,signal?:AbortSignal)=>client.connection.rpc.call('/api','session/'+method,{args:{request}},signal);
 return {...f,client,controller,wire,peer,call,async close(){await client.fiber.dispose();await f.close();}};
}
