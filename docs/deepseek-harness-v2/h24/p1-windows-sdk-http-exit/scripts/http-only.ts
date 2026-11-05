import {startMockLlmServer} from '@deepseek-ai/dsh-llm-mock-server';
import {request} from 'node:http';
import {createServer} from 'node:net';
import {assert,record} from './support.ts';
const server=await startMockLlmServer({port:0,sequence:['success'],apiKey:'h24-local-only',randomSeed:24});let response:any;
try{response=await new Promise<any>((ok,bad)=>{const req=request(server.baseURL+'/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':'h24-local-only'}},r=>{let body='';r.on('data',b=>body+=b);r.on('end',()=>ok({status:r.statusCode,body,complete:r.complete}));});req.on('error',bad);req.end(JSON.stringify({model:'fixture',messages:[{role:'user',content:'test'}],max_tokens:20,stream:true}));});assert.equal(response.status,200);assert.equal(response.complete,true);assert.equal(server.requests.length,1);}finally{await server.close();}
const verify=createServer();await new Promise<void>((ok,bad)=>{verify.once('error',bad);verify.listen(server.port,'127.0.0.1',ok)});await new Promise<void>(ok=>verify.close(()=>ok()));await record('http-only',{node:process.version,pid:process.pid,port:server.port,response,requests:server.requests,listenerClosed:true,portRebound:true,scope:'official Mock LLM HTTP server only, no SDK runtime created'});console.log('HTTP-only real listener/response/close/rebind complete');
