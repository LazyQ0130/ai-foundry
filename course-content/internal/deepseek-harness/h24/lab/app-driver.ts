import {boot,loadProfileDirectory} from '@deepseek-ai/dsh-app-boot';
import {runFixtureTurn} from '@deepseek-ai/dsh-loader-smoke';
import {resolve} from 'node:path';
import {writeFile} from 'node:fs/promises';
if(process.env.H24_EXIT_BEFORE_BOOT==='1'){process.stderr.write('H24 deliberate abnormal fixture exit\n');process.exit(7);}
const profileDir=process.env.H24_PROFILE!,root=process.env.H24_WORLD!,sdk=process.argv.includes('--profile');
let ctx:any;
try{
 const profile=loadProfileDirectory('h24',profileDir,resolve(profileDir,'package.json'));
 ctx=await boot('h24',resolve(profileDir,'cordis.yml'),profile.patches);
 for(const entry of ctx.loader.entries()){if(entry.options.id!=='include'&&entry.fiber?.state!==2)throw Error('required H24 fixture entry did not activate: '+entry.options.id);}
 await writeFile(resolve(root,'ready.json'),JSON.stringify({pid:process.pid,sdk,entries:[...ctx.loader.entries()].map((e:any)=>({id:e.options.id,name:e.options.name,state:e.fiber?.state})),profile:profileDir}));
 if(sdk){process.stdin.on('end',()=>{void ctx.fiber.dispose();});}
 else{const result=await runFixtureTurn(ctx,{task:'Set fixture config to safe mode.'});process.stdout.write(JSON.stringify(result)+'\n');await ctx.fiber.dispose();ctx=undefined;}
}catch(e:any){process.stderr.write(String(e.stack??e)+'\n');process.exitCode=1;}
finally{if(!sdk||process.exitCode)await ctx?.fiber.dispose();}
