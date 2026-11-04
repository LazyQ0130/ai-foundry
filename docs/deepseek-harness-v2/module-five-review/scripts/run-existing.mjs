// Reuses reviewed author runners; redirects every evidence write into this review.
// Original successful and failed evidence is never overwritten. No cleanup.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const here=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(here,'../../..');
const h=process.argv[2];if(!['h17','h18','h19','h20','cross'].includes(h))throw Error('choose h17-h20/cross');
const original=resolve(repo,'docs/deepseek-harness-v2',h==='cross'?'h20':h),out=resolve(here,'evidence',h);
await mkdir(resolve(out,'evidence'),{recursive:true});
let code=await readFile(resolve(original,'scripts/run-labs.mjs'),'utf8');
code=code.replace("fileURLToPath(new URL('../',import.meta.url))",JSON.stringify(original));
code=code.replaceAll('writeFile(resolve(root,','writeFile(resolve('+JSON.stringify(out)+',');
if(h==='cross'){
 code=code.replace("const selected=process.argv[2];",`await copyFile(${JSON.stringify(resolve(here,'probes/cross-course.test.ts'))},resolve(scratch,'cross-course.test.ts'));\nconst selected=process.argv[2];`);
 code=code.replaceAll("'reliability.test.ts'","'cross-course.test.ts'");
}
// -e inserts one argv slot; preserve the original runner's argument indexing.
code="process.argv.splice(1,0,'review-runner');\n"+code;
const args=['--input-type=module','-e',code,...process.argv.slice(3)];
const r=spawnSync(process.execPath,args,{cwd:repo,encoding:'utf8',timeout:240000,maxBuffer:20*1024*1024});
await writeFile(resolve(out,`runner-${Date.now()}.json`),JSON.stringify({command:`node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs ${h} ${process.argv.slice(3).join(' ')}`,originalRunner:resolve(original,'scripts/run-labs.mjs'),writeRedirect:out,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null},null,2)+'\n');
process.stdout.write(r.stdout??'');process.stderr.write(r.stderr??'');process.exitCode=r.status??1;
