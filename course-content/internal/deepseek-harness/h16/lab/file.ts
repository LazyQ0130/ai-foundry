import * as ToolFs from '@deepseek-ai/dsh-tool-fs';
import * as Observation from '@deepseek-ai/dsh-fs-observation-policy';
import {base,files,carrier,invoke,exists} from './support.ts';
export async function filePractice(){
 const h=await base(),f=await files(h.ctx),agent=carrier(h.ctx,f.root,'file');const result:any={root:f.root,trace:[]};
 const call=async(label:string,name:string,args:any,signal?:AbortSignal)=>{const r=await invoke(h.ctx,name,args,agent,signal);result.trace.push({label,result:r});return r;};
 try{
  let plugin=await h.ctx.plugin(ToolFs,{readLimit:2,readMaxLineLength:8,readMaxBytes:50,readStreamMinSize:1});
  const observation=await h.ctx.plugin(Observation);result.schemas=h.ctx.tools.schemas();
  await call('create','write',{file_path:'fixture.txt',content:'title=old\nrepeat\nrepeat\nlast-line-is-long\n'});
  await call('window','read',{file_path:'fixture.txt',offset:2,limit:2});
  await call('ambiguous','edit',{file_path:'fixture.txt',old_string:'repeat',new_string:'once'});
  await call('edit','edit',{file_path:'fixture.txt',old_string:'title=old',new_string:'title=new'});
  await call('verify','read',{file_path:'fixture.txt',offset:1,limit:1});
  await call('length-cap','read',{file_path:'fixture.txt',offset:4,limit:1});
  const other=carrier(h.ctx,f.root,'unseen');result.unseen=await invoke(h.ctx,'edit',{file_path:'fixture.txt',old_string:'new',new_string:'bad'},other);
  await call('cancel','read',{file_path:'fixture.txt'},AbortSignal.abort());
  await observation.dispose();result.withoutObservation=await invoke(h.ctx,'edit',{file_path:'fixture.txt',old_string:'new',new_string:'bare'},other);
  result.readImageWithoutAttachments=h.ctx.tools.get('read_image')!==undefined;
  // 只测试可选服务导致的注册与执行前路由拒绝，不伪造图片解码/持久存储。
  const attachment=await h.ctx.plugin({apply(owner){owner.provide('attachments',{imageLimits:{mediaTypes:['image/png']}} as any);}});
  result.readImageWithMockAttachments=h.ctx.tools.get('read_image')!==undefined;
  result.imageRouteRefusal=await call('image-route','read_image',{file_path:'missing.png'});
  await attachment.dispose();result.readImageAfterDispose=h.ctx.tools.get('read_image')!==undefined;
  await plugin.dispose();plugin=await h.ctx.plugin(ToolFs,{write:false,edit:false,readImage:false});
  result.readOnlySchemas=h.ctx.tools.schemas();await plugin.dispose();result.afterToolDispose=h.ctx.tools.schemas();
  await f.cleanup();result.fileRemoved=!(await exists(f.file));result.retained=f.retained;
  return result;
 }finally{await h.close();await f.cleanup();}
}
