import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..'),script=resolve(root,'scripts'),evidence=resolve(root,'evidence');
const steps=[
 ['source','python',['-X','utf8',resolve(script,'check-sources.py')]],
 ['assertions','python',['-X','utf8',resolve(script,'write-source-checklist.py')]],
 ['references','python',['-X','utf8',resolve(script,'refresh-references.py')]],
 ['sync','python',['-X','utf8',resolve(script,'sync-lab.py')]],
 ['labs',process.execPath,[resolve(script,'run-labs.mjs')]],
 ['figures','python',['-X','utf8',resolve(script,'draw_figures.py')]],
 ['preview',process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),resolve(script,'make-reading-preview.tsx')]],
 ['content',process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),resolve(script,'check-content.ts')]],
 ['renderer',process.execPath,['--import','tsx','--test','--test-reporter=tap','tests/lesson-renderer.test.ts']],
 ['visual',process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),resolve(script,'preview-and-qa.tsx')]],
];
const selected=process.argv[2],checks=[];
for(const [name,command,args] of steps){
 if(selected&&selected!==name)continue;
 const r=spawnSync(command,args,{cwd:repo,encoding:'utf8',timeout:name==='visual'?120000:60000,maxBuffer:16*1024*1024});
 const record={name,command,args,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null};
 const raw=`check-${Date.now()}-${name}.json`;await writeFile(resolve(evidence,raw),JSON.stringify(record,null,2)+'\n');
 if(name==='renderer')await writeFile(resolve(evidence,'renderer-regression.txt'),(r.stdout+r.stderr).replaceAll('\r\n','\n').trimEnd()+'\n');
 checks.push({...record,raw});assert.equal(r.status,0,`${name} failed; raw evidence retained`);console.log(`PASS ${name}`);
}
await writeFile(resolve(evidence,selected?`check-${selected}-latest.json`:'checks.json'),JSON.stringify({status:'PASS',checks:checks.map(({stdout,stderr,...r})=>r)},null,2)+'\n');
