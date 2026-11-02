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
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..');
const path=resolve(repo,'course-content/internal/deepseek-harness/h16/lesson.md'),bytes=await readFile(path),source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source);
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort());
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4);assert.ok(!/^# /m.test(lesson.body));assert.ok(bytes.length<200000);
assert.ok(!/<script|<details|@@S\d|\u00ad/.test(lesson.body.replace(/```[\s\S]*?```/g,'')),'no active raw HTML or unresolved references outside code examples');
const programs=['bootstrap.mjs','support.ts','file.ts','shell.ts','web.ts','mcp-server.mjs','mcp.ts','combined.ts','demo.ts'];
for(const f of programs)assert.ok(lesson.body.includes((await readFile(resolve(path,'../lab',f),'utf8')).replaceAll('\r\n','\n').trimEnd()),f);
const keys=new Set<string>();
for(const f of await readdir(resolve(repo,'course-content'),{recursive:true})){
 const p=resolve(repo,'course-content',f);if(!f.endsWith('.md')||p===path)continue;
 for(const k of (await readFile(p,'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(k);
}
for(const key of lesson.meta.checkKeys){assert.match(key,/^check-[a-f0-9]{16}$/);assert.ok(!keys.has(key));}
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body})),figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'));
assert.equal((html.match(/<img /g)??[]).length,4);assert.ok(!/<details[^>]* open/.test(html));
for(let i=1;i<=10;i++)assert.ok(html.includes(`思考 ${i} 参考答案`));
for(const x of ['A','B','C','D'])assert.ok(html.includes(`实践 ${x} 详细参考答案`));assert.ok(html.includes('综合实践详细参考答案'));
let article=html;for(const f of figures){assert.ok(html.includes(`src="${f.rendererPath}"`));article=article.replaceAll(f.rendererPath,f.image);}
article=article.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>');
assert.ok((await readFile(resolve(root,'reading-preview.html'),'utf8')).includes(article),'preview must match actual current SSR');
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8')),cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache,members:any[]=[],interfaces:any[]=[],functions:any[]=[];
for(const [className,file,expected] of [
 ['WebRuntime','packages/web/web/src/index.ts',['registerSearchProvider','registerFetchProvider','search','fetch','searchReady','fetchReady']],
 ['ShellExecutor','packages/shell/shell/src/index.ts',['resolve','execute','sandboxMode']],
 ['WorkingDirectoryService','packages/session/working-directory/src/index.ts',['get','ensure','set']],
 ['McpResourceRuntime','packages/mcp/mcp-resources/src/index.ts',['register','registerTools','request']],
 ['ToolsService','packages/core/tools/src/index.ts',['register','resolve','restrict','execute']],
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true),cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration;assert.ok(cls,className);
 for(const name of expected){const m=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===name);assert.ok(m,name);members.push({file,className,name,line:sf.getLineAndCharacterOfPosition(m.getStart(sf)).line+1});}
}
for(const [file,name,expected] of [
 ['packages/web/web/src/types.ts','WebSearchRequest',['query','maxResults']],
 ['packages/web/web/src/types.ts','WebFetchRequest',['url']],
 ['packages/web/web/src/types.ts','WebFetchResult',['url','statusCode','body','truncated']],
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true),n=sf.statements.find(n=>ts.isInterfaceDeclaration(n)&&n.name.text===name) as ts.InterfaceDeclaration;assert.ok(n);
 const found=n.members.map(m=>m.name!.getText(sf));assert.deepEqual(found,[...expected]);interfaces.push({file,name,members:found});
}
for(const [file,names] of [
 ['packages/mcp/mcp-client/src/tools.ts',['publicToolName','syncTools','createMcpToolDefinition']],
 ['packages/mcp/mcp-client/src/connection.ts',['startConnection','resolveReconnectPolicy']],
 ['packages/web/web/src/index.ts',['resolveProvider','selectedProviderReady','capSources']],
 ['packages/fs/tool-fs/src/read-image.ts',['assertImageCapableRoute','applyReadImageTool']],
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true);
 for(const name of names){const n=sf.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(n,name);functions.push({file,name,line:sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1});}
}
const imageFile='packages/fs/tool-fs/src/read-image.ts',imageSf=ts.createSourceFile(imageFile,await readFile(resolve(cache,imageFile),'utf8'),ts.ScriptTarget.Latest,true),imageRegistrations:number[]=[];
function visit(n:ts.Node){if(ts.isCallExpression(n)&&n.expression.getText(imageSf)==='ctx.tools.register')imageRegistrations.push(n.arguments.length);ts.forEachChild(n,visit);}visit(imageSf);assert.deepEqual(imageRegistrations,[1],'image route check is execute gate, not registration when');
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,''),prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'');
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length,lines=(s:string)=>[...s.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0);
const metrics={allBodyCjk:cjk(prose(lesson.body)),defaultBodyCjk:cjk(prose(defaultBody)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:lines(lesson.body),defaultCodeLines:lines(defaultBody),details:(html.match(/<details /g)??[]).length,coreConceptNames:['definition/provider/consumer','registration/admission/execution','File windows and image gates','Shell/env/Jobs','Web search/fetch/selection/readiness','MCP names/sync/connection','resource vs tool','common results with distinct trust boundaries'],exercises:4,combined:1,thoughts:10,traceOrConfigThoughts:5,figures:4,scope:'CJK excludes code/URLs/comments; default excludes deepdive; no conversion to measured learning time'};
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',programs,uniqueCheckKeys:true,previewExactSsr:true,members,interfaces,functions,imageRegistrations,metrics},null,2)+'\n');console.log(JSON.stringify({status:'PASS',bytes:bytes.length,metrics}));
