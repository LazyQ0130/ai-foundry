import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..'),script=resolve(root,'scripts'),evidence=resolve(root,'evidence');
const steps=[
 ['source-before','python',['-X','utf8',resolve(script,'check-sources.py')]],
 ['assertions', 'python', ['-X','utf8',resolve(root,'scripts/write-source-checklist.py')]],
 ['sync','python',['-X','utf8',resolve(script,'sync-lab.py')]],
 ['labs',process.execPath,[resolve(script,'run-labs.mjs')]],
  ['figures','python',['-X','utf8',resolve(script,'draw_figures.py')]],
 ['preview',process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),resolve(script,'make-reading-preview.tsx')]],
 ['content',process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),resolve(script,'check-content.ts')]],
 ['renderer',process.execPath,['--import','tsx','--test','--test-reporter=tap','tests/lesson-renderer.test.ts']],
 ['visual',process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),resolve(script,'preview-and-qa.tsx')]],
 ['source-final','python',['-X','utf8',resolve(script,'check-sources.py')]],
];
const checks=[];
const resume=process.argv.find(x=>x.startsWith('--from='))?.slice(7);
const from=resume?steps.findIndex(s=>s[0]===resume):0;assert.ok(from>=0,'unknown resume step');
for(const [index,[name,command,args]] of steps.entries()){
 if(index<from){
  const files=(await readdir(evidence)).filter(f=>f.startsWith('check-')&&f.endsWith('-'+name+'.json')).sort().reverse();
  let found;for(const f of files){const r=JSON.parse(await readFile(resolve(evidence,f),'utf8'));if(r.exit===0){found={...r,reusedRaw:f};break;}}
  assert.ok(found,'no previously passed step: '+name);checks.push(found);continue;
 }

 const r=spawnSync(command,args,{cwd:repo,encoding:'utf8',timeout:name==='visual'?120000:60000,maxBuffer:16*1024*1024});
 const record={name,command,args,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null};checks.push(record);
 await writeFile(resolve(evidence,`check-${Date.now()}-${name}.json`),JSON.stringify(record,null,2)+'\n');
 if(name==='renderer')await writeFile(resolve(evidence,'renderer-regression.txt'),(r.stdout+r.stderr).replaceAll('\r\n','\n').replace(/[ \t]+$/gm,'').trimEnd()+'\n');
 assert.equal(r.status,0,`${name} failed; raw record preserved`);console.log(`PASS ${name}`);
}
await writeFile(resolve(evidence,'checks.json'),JSON.stringify({status:'PASS',checks:checks.map(({stdout,stderr,...r})=>r),manual:'Separate actual viewing and final-audit required'},null,2)+'\n');
