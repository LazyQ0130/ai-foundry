import React from 'react';
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {parseLessonContent} from '../../../../server/services/lesson-parser.js';
import {LessonMarkdown} from '../../../../src/components/LessonMarkdown.js';
const root="C:\\Users\\QYF\\Desktop\\AIFoundry\\docs\\deepseek-harness-v2\\h20",repo=resolve(root,'../../..'),path=resolve(repo,'course-content/internal/deepseek-harness/h20/lesson.md');
const bytes=await readFile(path),source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source);
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort());
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4);assert.ok(!/^# /m.test(lesson.body));
assert.ok(!/@@\d|<script|<details/.test(lesson.body.replace(/```[\s\S]*?```/g,'')));
const programs=['support.ts','bootstrap.mjs','A.ts','B.ts','C.ts','D.ts','X.ts','clock.ts','demo.ts'];
for(const file of programs)assert.ok(lesson.body.includes((await readFile(resolve(path,'../lab',file),'utf8')).replaceAll('\r\n','\n').trimEnd()),file);
const keys=new Set<string>();
for(const f of await readdir(resolve(repo,'course-content'),{recursive:true}))if(f.endsWith('.md')&&resolve(repo,'course-content',f)!==path){
 for(const key of (await readFile(resolve(repo,'course-content',f),'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(key);
}
for(const key of lesson.meta.checkKeys){assert.match(key,/^check-[a-f0-9]{16}$/);assert.ok(!keys.has(key));}
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body})),figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'));
assert.equal((html.match(/<img /g)??[]).length,4);assert.ok(!/<details[^>]* open/.test(html));
for(let n=1;n<=15;n++)assert.ok(html.includes(`思考 ${n} 参考答案`));
for(const x of ['A','B','C','D'])assert.ok(html.includes(`实践 ${x} 详细参考答案`));assert.ok(html.includes('综合详细参考答案与评分'));
// H20新增内容回归：日志／Surface、三入口、信息损失、精确数字和可复现程序。
for(const term of ['llm/retry','llm/retry-started','policyKey','RetryId','TOOL_OUTCOME_UNKNOWN','TOOL_NOT_STARTED','ABORTED_BEFORE_DISPATCH','keepInbox','whenIdle','9000','1100','SAFE_PREFIX'])assert.ok(html.includes(term),term);
assert.ok(!/\{\{S\d+/.test(lesson.body));
const checklist=JSON.parse(await readFile(resolve(root,'evidence/source-assertions.json'),'utf8'));
assert.equal(checklist.length,56);assert.equal(new Set(checklist.map((x:any)=>x.claim)).size,56);
assert.ok(checklist.every((x:any)=>x.commit==='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'&&x.test&&x.symbol&&x.start>0&&x.end>=x.start));
let article=html;for(const f of figures){assert.ok(html.includes(`src="${f.rendererPath}"`));article=article.replaceAll(f.rendererPath,f.image);}
article=article.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>');
assert.ok((await readFile(resolve(root,'reading-preview.html'),'utf8')).includes(article));
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8')),cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache,members:any[]=[];
for(const [file,className,expected] of [
 ['packages/llm/llm/src/index.ts','LlmRuntime',['prepareCall','stream','adapterStream']],
 ['packages/core/agent-loop/src/agent.ts','ReactLoopAgent',['cancel','whenIdle','preStep','step','buildRequest']],
 ['packages/core/tools/src/pipeline.ts','ToolExecutionPipeline',['prepare','dispatch','complete','dispatchToolBody']],
 ['packages/core/session/src/repair.ts','ToolCallRecovery',['observe','results']],
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration;assert.ok(cls,className);
 for(const name of expected){const m=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===name);assert.ok(m,name);members.push({file,className,name,line:sf.getLineAndCharacterOfPosition(m.getStart(sf)).line+1});}
}
// 新程序中禁止新增弃用的同步事件读/registry按键读调用；保留上游原件不改。
for(const f of await readdir(resolve(path,'../lab')))if(f.endsWith('.ts')){
 const code=await readFile(resolve(path,'../lab',f),'utf8');assert.ok(!/\.(eventAt|snapshotEvents|ownEvents)\s*\(/.test(code),f);
 assert.ok(!/sessionProjections\.stateOf\s*\(/.test(code),f);assert.ok(!/\.on\(['"]agent\/request['"]/.test(code),f);
}
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,''),prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'');
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length;
const metrics={defaultBodyCjk:cjk(prose(defaultBody)),allBodyCjk:cjk(prose(lesson.body)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:[...lesson.body.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0),details:(html.match(/<details /g)??[]).length,practices:4,combined:1,thoughts:15,sequenceOrCodeThoughts:[...lesson.body.matchAll(/^\d+\. 推导[：:]/gm)].length,figures:4,coreReadFiles:5,estimatedMinutes:[280,380],measuredTime:false};
assert.ok(metrics.sequenceOrCodeThoughts>=4);
await writeFile(resolve("C:\\Users\\QYF\\Desktop\\AIFoundry\\docs\\deepseek-harness-v2\\module-five-review\\evidence\\h20",'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),programs,uniqueCheckKeys:true,previewExactSsr:true,noNewDeprecatedReads:true,astMembers:members,metrics},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',bytes:bytes.length,metrics}));
