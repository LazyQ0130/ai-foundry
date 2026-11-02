/** 顺序执行 H13 作者门禁，逐次保存原始输出。没有产品写入或清理动作。 */
import { spawnSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..');
const node=process.execPath, py=process.env.H13_PYTHON??'python';
const checks=[
 ['sync',py,['docs/deepseek-harness-v2/h13/scripts/sync-lab.py']],
 ['figures',py,['docs/deepseek-harness-v2/h13/scripts/draw_figures.py']],
 ['sources',py,['docs/deepseek-harness-v2/h13/scripts/check-sources.py']],
 ['assertions',py,['docs/deepseek-harness-v2/h13/scripts/write-source-checklist.py']],
 ['source-links',py,['docs/deepseek-harness-v2/h13/scripts/check-sources.py']],
 ['labs',node,['docs/deepseek-harness-v2/h13/scripts/run-labs.mjs']],
 ['preview',node,['--import','tsx','docs/deepseek-harness-v2/h13/scripts/make-reading-preview.tsx']],
 ['content',node,['--import','tsx','docs/deepseek-harness-v2/h13/scripts/check-content.ts']],
 ['renderer',node,['--import','tsx','--test','--test-reporter=tap','tests/lesson-renderer.test.ts']],
 ['visual',node,['--import','tsx','docs/deepseek-harness-v2/h13/scripts/preview-and-qa.tsx']],
];
const summary=[];
for(const [name,command,args] of checks){
 const inputs={};
 for(const p of ['course-content/internal/deepseek-harness/h13/lesson.md','src/components/LessonMarkdown.tsx','src/index.css',...await readdir(resolve(root,'scripts')).then(xs=>xs.map(x=>'docs/deepseek-harness-v2/h13/scripts/'+x))])
  inputs[p]=createHash('sha256').update(await readFile(resolve(repo,p))).digest('hex');
 const started=new Date().toISOString(),r=spawnSync(command,args,{cwd:repo,env:{...process.env,PYTHONUTF8:'1'},encoding:'utf8',timeout:name==='visual'?120000:60000});
 const data={name,command,args,started,ended:new Date().toISOString(),exit:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr,inputs};
 await writeFile(resolve(root,`evidence/check-${Date.now()}-${name}.json`),JSON.stringify(data,null,2)+'\n');
 if(name==='renderer')await writeFile(resolve(root,'evidence/renderer-regression.txt'),r.stdout+r.stderr);
 summary.push({name,exit:r.status});console.log(name+': '+r.status);
 if(r.status!==0)throw new Error(name+' failed; see timestamp evidence');
}
await writeFile(resolve(root,'evidence/checks.json'),JSON.stringify({status:'PASS',summary},null,2)+'\n');
