// 仅由父测试启动，访问父测试传来的本次新建 root；不读个人 Home。
import {backend,SessionId} from './support.ts';
const [mode,root,id,encoding]=process.argv.slice(2);
const f=await backend(root,encoding as 'none'|'zstd');
try{
 try{
  const handle=await f.store.open(SessionId(id),mode==='read'?'read':'write');
  const result=await handle.read();
  console.log(JSON.stringify({pid:process.pid,mode,ok:true,header:handle.header,events:result.events}));
  if(mode==='hold')await new Promise<void>(resolve=>process.stdin.once('data',()=>resolve()));
  await handle.close();
 }catch(error){console.log(JSON.stringify({pid:process.pid,mode,ok:false,error:(error as Error).name}));}
}finally{await f.close();}
