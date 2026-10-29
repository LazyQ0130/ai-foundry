// 新建 OS 临时目录，逐文件复制课程夹具；只加载锁定 Cordis/Cosmokit 源码，不清理目录。
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root=fileURLToPath(new URL('../',import.meta.url)), repo=resolve(root,'../../..');
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8'));
const source=process.env.HARNESS_SOURCE_CACHE ?? lock.sourceCache;
for(const f of lock.vendorFiles){
 assert.equal(createHash('sha256').update(await readFile(resolve(source,f.path))).digest('hex'),f.sha256,'fixed vendor changed: '+f.path);
}
const cordisMeta=JSON.parse(await readFile(resolve(source,'vendor/cordis/package.json'),'utf8'));
assert.equal(cordisMeta.version,'4.0.6-alpha.1');
const lab=resolve(repo,'course-content/internal/deepseek-harness/h07/lab');
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h07-lab-'));
const files=['support.ts','states.ts','resources.ts','dependencies.ts','demo.ts','lifecycle.test.ts'];
for(const f of files) await copyFile(resolve(lab,f),resolve(scratch,f));
await writeFile(resolve(scratch,'package.json'),JSON.stringify({private:true,type:'module'}));
const slash=p=>p.replaceAll('\\','/');
const config={compilerOptions:{target:'ES2024',module:'ESNext',moduleResolution:'Bundler',strict:true,skipLibCheck:true,noEmit:true,allowImportingTsExtensions:true,types:['node'],typeRoots:[slash(resolve(repo,'node_modules/@types'))],paths:{
 '@deepseek-ai/cordis':[slash(resolve(source,'vendor/cordis/src/index.ts'))],
 '@deepseek-ai/cosmokit':[slash(resolve(source,'vendor/cosmokit/src/index.ts'))],
 '@standard-schema/spec':[slash(resolve(repo,'node_modules/@standard-schema/spec/dist/index.d.ts'))],
}},include:['*.ts']};
const configPath=resolve(scratch,'tsconfig.json');
await writeFile(configPath,JSON.stringify(config,null,2));
const cli=resolve(repo,'node_modules/tsx/dist/cli.mjs');
// 只继承 Node/OS 启动需要的非秘密项；不传 .env、模型 Key、用户 Home 或 DSH 配置。
const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
const run=(args)=>spawnSync(process.execPath,[cli,'--tsconfig',configPath,...args],{cwd:scratch,env,encoding:'utf8',timeout:30000});
// 仅清除日志行尾空白/多余尾空行，保留诊断、退出值与实际断言输出。
const cleanEvidence=s=>s.replaceAll('\r\n','\n').replace(/[ \t]+$/gm,'').trimEnd()+'\n';
const outputs={};
for(const [name,args] of [['tests',['--test','--test-reporter=tap','lifecycle.test.ts']],['demo',['demo.ts']]]) {
 const r=run(args);outputs[name]={code:r.status,stdout:r.stdout,stderr:r.stderr};
 await writeFile(resolve(root,`evidence/lab-${name}.txt`),r.stdout+r.stderr);
 assert.equal(r.status,0,`${name}\n${r.stdout}\n${r.stderr}`);
}
const testCount=Number(/# tests (\d+)/.exec(outputs.tests.stdout)?.[1]);
assert.equal(testCount,24);assert.match(outputs.tests.stdout,/# fail 0/);
const original=await readFile(resolve(scratch,'resources.ts'),'utf8');
await writeFile(resolve(scratch,'resources.ts'),original.replace('clock.clearInterval(timer);','/* omitted timer cleanup */'));
const wrong=run(['--test','--test-reporter=tap','lifecycle.test.ts']);
await writeFile(resolve(root,'evidence/lab-mutation.txt'),cleanEvidence(wrong.stdout+wrong.stderr));
assert.notEqual(wrong.status,0,'遗漏计时器清理必须被测试发现');assert.match(wrong.stdout,/# fail [1-9]/);
await writeFile(resolve(scratch,'resources.ts'),original);
const format=ds=>ts.formatDiagnosticsWithColorAndContext(ds,{getCurrentDirectory:()=>scratch,getCanonicalFileName:s=>s,getNewLine:()=> '\n'});
// 包边界：Cordis 自己显式关闭 noImplicitAny/noImplicitThis/strictFunctionTypes。
// 先按其选项从原源码生成声明，再对课程消费方使用 strict；不改上游来通过检查。
const vendorOptions={...ts.parseJsonConfigFileContent(config,ts.sys,scratch).options,noEmit:false,declaration:true,emitDeclarationOnly:true,noImplicitAny:false,noImplicitThis:false,strictFunctionTypes:false,rootDir:resolve(source,'vendor'),outDir:resolve(scratch,'types')};
const vendorProgram=ts.createProgram([resolve(source,'vendor/cordis/src/index.ts')],vendorOptions);
const vendorDiagnostics=ts.getPreEmitDiagnostics(vendorProgram);
assert.equal(vendorDiagnostics.length,0,format(vendorDiagnostics));
assert.equal(vendorProgram.emit().emitSkipped,false);
const typeConfig=structuredClone(config);
typeConfig.compilerOptions.paths['@deepseek-ai/cordis']=[slash(resolve(scratch,'types/cordis/src/index.d.ts'))];
typeConfig.compilerOptions.paths['@deepseek-ai/cosmokit']=[slash(resolve(scratch,'types/cosmokit/src/index.d.ts'))];
await writeFile(resolve(scratch,'tsconfig.typecheck.json'),JSON.stringify(typeConfig,null,2));
const parsed=ts.parseJsonConfigFileContent(typeConfig,ts.sys,scratch);
// 只检查课程源码，生成的声明按正常包声明消费；其来源就是上一步实际 vendor 源。
parsed.fileNames=files.map(f=>resolve(scratch,f));
const diagnostics=ts.getPreEmitDiagnostics(ts.createProgram(parsed.fileNames,parsed.options));
await writeFile(resolve(root,'evidence/typecheck.txt'),format(diagnostics)||'PASS: vendor declarations generated with Cordis package compiler flags; strict course consumers\n');
assert.equal(diagnostics.length,0,format(diagnostics));
const bad=resolve(scratch,'wrong-type.ts');
await writeFile(bad,"import type { Context } from '@deepseek-ai/cordis';\nexport function wrong(ctx: Context) { return ctx.plugin(3); }\n");
const badDiagnostics=ts.getPreEmitDiagnostics(ts.createProgram([...parsed.fileNames,bad],parsed.options));
await writeFile(resolve(root,'evidence/type-error.txt'),cleanEvidence(format(badDiagnostics)));
assert.ok(badDiagnostics.some(d=>d.file&&resolve(d.file.fileName)===resolve(bad)&&d.code===2345),'声明合并须阻止错误参数');
const emitted=ts.transpileModule(await readFile(resolve(lab,'support.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2024}}).outputText;
assert.doesNotMatch(emitted,/declare module|interface Context/);
assert.match(emitted,/new Context/);
await writeFile(resolve(root,'evidence/support-emitted.js'),emitted);
const report={status:'PASS',commit:lock.commit,cordisVersion:cordisMeta.version,sourceByteCheck:'20 vendor file SHA256 checks before execution',node:process.version,typescript:ts.version,scratch,tests:testCount,mutation:{exit:wrong.status,status:'EXPECTED_FAILURE'},runtime:'actual pinned vendor Cordis/Cosmokit, not Mock; no Loader/Profile/Harness integration',environment:'allowlisted OS startup variables, new fixtures only; no private data/credentials/real model or network',typecheck:'strict course consumers; vendor-generated declarations; TS2345 negative; Events augmentation erased',outputs,lessonPrograms:await Promise.all(files.map(async name=>({name,sha256:createHash('sha256').update(await readFile(resolve(lab,name))).digest('hex')})))};
await writeFile(resolve(root,'evidence/lab-results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',tests:testCount,mutation:'EXPECTED_FAILURE',typecheck:'PASS',scratch}));
