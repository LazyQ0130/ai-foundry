import React from 'react';
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { parseLessonContent } from '../../../../server/services/lesson-parser.js';
import { LessonMarkdown } from '../../../../src/components/LessonMarkdown.js';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..');
const path=resolve(repo,'course-content/internal/deepseek-harness/h13/lesson.md'),bytes=await readFile(path);
const source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source);
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort());
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4);
assert.ok(!/^# /m.test(lesson.body));assert.ok(bytes.length<200000);assert.ok(!/<script|<details|__H13|@PIN/.test(lesson.body));
const programs=['support.ts','progressive.ts','definitions.ts','scopes.ts','admission.ts','requests.ts','demo.ts'];
for(const f of programs)assert.ok(lesson.body.includes((await readFile(resolve(path,'../lab',f),'utf8')).replaceAll('\r\n','\n').trimEnd()),f);
const keys=new Set<string>();
for(const f of await readdir(resolve(repo,'course-content'),{recursive:true})){
 const p=resolve(repo,'course-content',f);if(!f.endsWith('.md')||p===path)continue;
 for(const k of (await readFile(p,'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(k);
}
for(const key of lesson.meta.checkKeys){assert.match(key,/^check-[a-f0-9]{16}$/);assert.ok(!keys.has(key),key);}
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body}));
const figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'));
assert.equal((html.match(/<img /g)??[]).length,4);assert.ok(!/<details[^>]* open/.test(html));
for(let i=1;i<=10;i++)assert.ok(html.includes(`思考 ${i} 参考答案`));
for(const x of ['A','B','C','D'])assert.ok(html.includes(`实践 ${x} 详细参考答案`));
let article=html;
for(const f of figures){assert.ok(html.includes(`src="${f.rendererPath}"`));article=article.replaceAll(f.rendererPath,f.image);}
article=article.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>');
assert.ok((await readFile(resolve(root,'reading-preview.html'),'utf8')).includes(article),'saved preview must equal actual current SSR');
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8')),cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache;
const members:any[]=[];
for(const [className,file,expected] of [
 ['ToolsService','packages/core/tools/src/index.ts',['register','restrict','get','executable','resolve','definitions','schemas','setExecutor','execute']],
 ['NativeToolExecutor','packages/core/tool-executor-native/src/index.ts',['describe','execute']],
 ['PtcExecutor','packages/core/tool-executor-ptc/src/index.ts',['describe','renderSdk','execute']],
 ['SystemPrompt','packages/core/system-prompt/src/index.ts',['tools','assemble']],
 ['ReactLoopAgent','packages/core/agent-loop/src/agent.ts',['step','buildRequest']],
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true);
 const cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration|undefined;assert.ok(cls,className);
 for(const name of expected){const m=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===name);assert.ok(m,name);members.push({file,className,name,line:sf.getLineAndCharacterOfPosition(m.getStart(sf)).line+1});}
}
const exportedFunctions:any[]=[];
for(const name of ['defineTool','validateArgs','parameterSchemaSpecToJsonSchema','valueSchemaSpecToJsonSchema','projectToolSchema']){
 const file='packages/core/tools/src/schema.ts',sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true);
 const n=sf.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name) as ts.FunctionDeclaration;assert.ok(n,name);assert.ok(n.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword));exportedFunctions.push({file,name,line:sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1});
}
const interfaces:any[]=[];
for(const [file,name,required] of [
 ['packages/core/tools/src/contracts.ts','ToolDefinition',['output','execute','projectContent','finalizeContent','timeoutMs','isConcurrencySafe','presentCall','presentResult']],
 ['packages/core/tools/src/contracts.ts','ToolActivationContext',['agent','modelSelection','signal']],
 ['packages/core/tools/src/contracts.ts','ResolvedToolSet',['dispose','view']],
 ['packages/llm/llm/src/types.ts','ToolSchema',['name','description','parameters','deferLoading']],
 ['packages/llm/llm/src/types.ts','ToolCallBlock',['type','id','name','arguments']],
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true);const n=sf.statements.find(n=>ts.isInterfaceDeclaration(n)&&n.name.text===name) as ts.InterfaceDeclaration;assert.ok(n,name);
 const actual=n.members.map(m=>m.name!.getText(sf).replace(/^['"]|['"]$/g,''));assert.deepEqual([...actual].sort(),[...required].sort());interfaces.push({file,name,actual});
}
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,'');
const prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'');
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length;
const lines=(s:string)=>[...s.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0);
const metrics={allBodyCjk:cjk(prose(lesson.body)),defaultBodyCjk:cjk(prose(defaultBody)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:lines(lesson.body),defaultCodeLines:lines(defaultBody),details:(html.match(/<details /g)??[]).length,coreConcepts:7,coreConceptNames:['ToolDefinition','Schema DSL','canonical value/render','registration lifetime','Scope view/restriction','Step admission','executor description'],coreSourceFiles:5,exercises:4,thoughts:10,figures:4,scope:'CJK excludes code/URLs/comments; default excludes deepdive; counts are not measured learning time'};
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',uniqueCheckKeys:true,programs,previewExactSsr:true,members,interfaces,exportedFunctions,metrics},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',metrics}));
