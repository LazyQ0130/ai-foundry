import React from 'react';
import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseLessonContent} from '../../../../server/services/lesson-parser.js';
import {LessonMarkdown} from '../../../../src/components/LessonMarkdown.js';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..'),path=resolve(repo,'course-content/internal/deepseek-harness/h21/lesson.md');
const bytes=await readFile(path),source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source);
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort());
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4);assert.ok(!/^# /m.test(lesson.body));
const programs=['support.ts','bootstrap.mjs','A.ts','B.ts','C.ts','D.ts','X.ts','boundaries.ts','demo.ts'];
for(const file of programs)assert.ok(lesson.body.includes((await readFile(resolve(path,'../lab',file),'utf8')).replaceAll('\r\n','\n').trimEnd()),file);
const keys=new Set<string>();
for(const f of await readdir(resolve(repo,'course-content'),{recursive:true}))if(f.endsWith('.md')&&resolve(repo,'course-content',f)!==path){
 for(const key of (await readFile(resolve(repo,'course-content',f),'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(key);
}
for(const key of lesson.meta.checkKeys){assert.match(key,/^check-[a-f0-9]{16}$/);assert.ok(!keys.has(key));}
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body})),figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'));
assert.equal((html.match(/<img /g)??[]).length,4);assert.ok(!/<details[^>]* open/.test(html));
for(let n=1;n<=12;n++)assert.ok(html.includes(`思考 ${n} 参考答案`));
for(const x of ['A','B','C','D'])assert.ok(html.includes(`实践 ${x} 详细参考答案`));assert.ok(html.includes('综合详细参考答案与评分'));
assert.equal((html.match(/class="lesson-callout lesson-task"/g)??[]).length,4);
for(const term of ['ACTIVATION_LIMIT_REACHED','SubagentRuntime','MessageId','subagent-settled','agent-message','provider-managed','parentSession','startActivation','coldResume','dispose','21项','C8/D13'])assert.ok(html.includes(term),term);
assert.ok(!/\{\{S\d+|<script|<details/.test(lesson.body.replace(/```[\s\S]*?```/g,'')));
let article=html;for(const f of figures){assert.ok(html.includes(`src="${f.rendererPath}"`));article=article.replaceAll(f.rendererPath,f.image);}
article=article.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>');
assert.ok((await readFile(resolve(root,'reading-preview.html'),'utf8')).includes(article));
const claims=JSON.parse(await readFile(resolve(root,'evidence/source-assertions.json'),'utf8'));assert.equal(claims.length,38);
assert.ok(claims.every((r:any)=>r.commit==='f3803c96974ad4a94195fb97e5c637e9c2a3afe3'&&r.controlBranch&&r.officialTest&&r.start>0&&r.end>=r.start));
for(const file of programs.filter(f=>f.endsWith('.ts'))){const s=await readFile(resolve(path,'../lab',file),'utf8');assert.ok(!/\.(snapshotEvents|eventAt|ownEvents)\s*\(/.test(s),file);}
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,''),prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'');
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length;
const metrics={defaultBodyCjk:cjk(prose(defaultBody)),allBodyCjk:cjk(prose(lesson.body)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:[...lesson.body.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0),details:(html.match(/<details /g)??[]).length,practices:4,combined:1,thoughts:12,derivationThoughts:6,figures:4,coreReadFiles:5,estimatedMinutes:[180,250],measuredTime:false};
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),programs,uniqueCheckKeys:true,previewExactSsr:true,noNewDeprecatedReads:true,sourceAssertions:claims.length,metrics},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',metrics}));
