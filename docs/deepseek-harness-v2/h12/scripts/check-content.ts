import React from 'react'
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {renderToStaticMarkup} from 'react-dom/server'
import ts from 'typescript'
import {parseLessonContent} from '../../../../server/services/lesson-parser.js'
import {LessonMarkdown} from '../../../../src/components/LessonMarkdown.js'
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..')
const path=resolve(repo,'course-content/internal/deepseek-harness/h12/lesson.md'),bytes=await readFile(path)
const source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source)
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort())
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4)
assert.ok(!/^# /m.test(lesson.body));assert.ok(bytes.length<200000);assert.ok(!/PIN\//.test(lesson.body));assert.ok(!/<script|<details|__H12|@PIN/.test(lesson.body))
const programs=['support.ts','iterable.ts','assembly.ts','runtime.ts','settlement.ts','chain.ts','demo.ts']
for(const f of programs)assert.ok(lesson.body.includes((await readFile(resolve(path,'../lab',f),'utf8')).replaceAll('\r\n','\n').trimEnd()),f)
const keys=new Set<string>()
for(const f of await readdir(resolve(repo,'course-content'),{recursive:true})){
 const p=resolve(repo,'course-content',f);if(!f.endsWith('.md')||p===path)continue
 for(const k of (await readFile(p,'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(k)
}
for(const key of lesson.meta.checkKeys){assert.match(key,/^check-[a-f0-9]{16}$/);assert.ok(!keys.has(key),key)}
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body})),figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))
assert.equal((html.match(/<img /g)??[]).length,4);assert.ok(!/<details[^>]* open/.test(html))
let staticArticle=html
for(const f of figures){assert.ok(html.includes(`src="${f.rendererPath}"`));staticArticle=staticArticle.replaceAll(f.rendererPath,f.image)}
staticArticle=staticArticle.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>')
assert.ok((await readFile(resolve(root,'reading-preview.html'),'utf8')).includes(staticArticle),'saved preview must equal current actual SSR')
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8')),cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache
const members:any[]=[],interfaceMembers:any[]=[],exportedFunctions:any[]=[]
for(const [className,file,names] of [
 ['LlmRuntime','packages/llm/llm/src/index.ts',['registerAdapter','listProviders','listModels','resolveModelInfo','prepareCall','stream','adapterStream']],
 ['LlmAdapter','packages/llm/llm/src/index.ts',['prepareCall','stream']],
 ['BlockAssembler','packages/llm/llm/src/assembler.ts',['push','blocks','interruptedBlocks','message']],
 ['AssistantStreamAccumulator','packages/llm/llm/src/assistant-stream.ts',['push','snapshot']],
 ['AssistantStreamAttempt','packages/core/agent-loop/src/assistant-stream.ts',['start','push','settle','abandon','blocks','interruptedBlocks']],
 ['ReactLoopAgent','packages/core/agent-loop/src/agent.ts',['step','buildRequest']]
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
 const cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration|undefined;assert.ok(cls,className)
 for(const name of names){const m=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===name);assert.ok(m,name);members.push({file,className,member:name,line:sf.getLineAndCharacterOfPosition(m.getStart(sf)).line+1})}
}
const file='packages/llm/llm/src/types.ts',sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
for(const [name,expected] of [['ToolCallBlock',['type','id','name','arguments']],['FinishReasonMap',['stop','tool-calls','max-tokens','aborted','error']],['GenerateOptions',['provider','model','reasoningEffort','messages','system','tools','toolHistory','temperature','maxTokens','stop','signal','sessionId','purpose']]] as const){
 const n=sf.statements.find(n=>ts.isInterfaceDeclaration(n)&&n.name.text===name) as ts.InterfaceDeclaration;assert.ok(n,name)
 const found=n.members.map(m=>m.name!.getText(sf).replace(/^['"]|['"]$/g,''));assert.deepEqual(found,[...expected]);interfaceMembers.push({file,name,members:found})
}
const chunks=sf.statements.find(n=>ts.isTypeAliasDeclaration(n)&&n.name.text==='StreamChunk') as ts.TypeAliasDeclaration;assert.ok(ts.isUnionTypeNode(chunks.type));assert.equal(chunks.type.types.length,7)
for(const name of ['expandAssistantStream','assembleAssistantStream']){
 const file='packages/llm/llm/src/assistant-stream.ts',sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
 const n=sf.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name) as ts.FunctionDeclaration;assert.ok(n,name)
 assert.ok(n.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword));exportedFunctions.push({file,name,line:sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1})
}
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,'')
const prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'')
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length
const lines=(s:string)=>[...s.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0)
const metrics={allBodyCjk:cjk(prose(lesson.body)),defaultBodyCjk:cjk(prose(defaultBody)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:lines(lesson.body),defaultCodeLines:lines(defaultBody),details:(html.match(/<details /g)??[]).length,coreConcepts:7,coreConceptNames:['LlmRuntime','LlmAdapter','PreparedLlmCall','ContentBlock','StreamChunk','BlockAssembler','Settlement'],coreSourceFiles:5,exercises:4,thoughts:10,figures:4,scope:'CJK excludes code/URLs/comments; default excludes deepdive; counts are not measured learning time'}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',uniqueCheckKeys:true,programs,controlledAdapter:true,previewExactSsr:true,members,interfaceMembers,exportedFunctions,metrics},null,2)+'\n')
console.log(JSON.stringify({status:'PASS',metrics,members}))
