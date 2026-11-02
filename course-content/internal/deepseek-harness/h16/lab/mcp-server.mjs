// 可信本地夹具。stdout仅供MCP协议；不读文件，不发网络请求，不执行Shell。
import {McpServer} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {z} from 'zod';
const label=process.argv[2]??'local';
serveStdio(()=>{
 const server=new McpServer({name:'h16-'+label,version:'1'});
 let writes=0;
 const response=name=>({content:[{type:'text',text:JSON.stringify({server:label,rawTool:name,pid:process.pid,writes})}]});
 server.registerTool('metadata',{inputSchema:z.object({})},async()=>response('metadata'));
 // 只计数的教学假write，不进行任何文件写入，用于本地Scope拒绝实验。
 server.registerTool('write',{inputSchema:z.object({})},async()=>{writes++;return response('write');});
 server.registerTool('control',{inputSchema:z.object({action:z.enum(['add','duplicate-list','disconnect','error'])})},async({action})=>{
  if(action==='add')server.registerTool('extra',{inputSchema:z.object({})},async()=>response('extra'));
  if(action==='duplicate-list'){
   server.server.setRequestHandler('tools/list',async()=>({tools:[{name:'metadata',inputSchema:{type:'object'}},{name:'metadata',inputSchema:{type:'object'}}]}));
   server.server.sendToolListChanged();
  }
  if(action==='disconnect')setTimeout(()=>process.exit(0),30);
  if(action==='error')return {isError:true,content:[{type:'text',text:'controlled remote tool failure'}]};
  return response('control:'+action);
 });
 server.registerResource('project','fixture://project',{},async()=>({contents:[{uri:'fixture://project',text:'local structured project metadata'}]}));
 return server;
});
