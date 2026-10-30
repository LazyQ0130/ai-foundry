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
const path=resolve(repo,'course-content/internal/deepseek-harness/h10/lesson.md'),bytes=await readFile(path)
const source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source)
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort())
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4)
assert.ok(!/^# /m.test(lesson.body));assert.ok(bytes.length<200000);assert.ok(!/PIN\//.test(lesson.body));assert.ok(!/<script|<details|__H10|@PIN/.test(lesson.body))
const programs=['support.ts','trace-answer.ts','routing.ts','execution.ts','branches.ts','demo.ts']
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
const members:any[]=[],interfaceMembers:any[]=[]
for(const [className,file,names] of [
 ['ReactLoopAgent','packages/core/agent-loop/src/agent.ts',['followup','steer','inject','cancel','runMaintenance','wakeDriver','whenIdle','preStep','turn','step','prepareRequest','buildRequest']],
 ['ReactLoopInbox','packages/core/agent-loop/src/inbox.ts',['claim','clear','mutate']],
 ['AssistantStreamAttempt','packages/core/agent-loop/src/assistant-stream.ts',['start','push','settle']]
] as const){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
 const cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration|undefined;assert.ok(cls,className)
 for(const name of names){const m=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===name);assert.ok(m,name);members.push({file,className,member:name,line:sf.getLineAndCharacterOfPosition(m.getStart(sf)).line+1})}
 if(className==='ReactLoopAgent'){
  const phase=sf.statements.find(n=>ts.isTypeAliasDeclaration(n)&&n.name.text==='Phase') as ts.TypeAliasDeclaration
  assert.ok(phase&&ts.isUnionTypeNode(phase.type));assert.equal(phase.type.types.length,3)
  for(const kind of ['idle','maintenance','running'])assert.ok(phase.getText(sf).includes("kind: '"+kind+"'"))
 }
}
const file='packages/core/agent/src/runtime-types.ts',sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
for(const [name,expected] of [['Agent',['followup','steer','inject','cancel','whenIdle']],['Inbox',['nextTurn','nextStep']],['Model',['current','select']]] as const){
 const found:string[]=[]
 function visit(n:ts.Node){if(ts.isInterfaceDeclaration(n)&&n.name.text===name)for(const m of n.members)if(m.name&&ts.isIdentifier(m.name))found.push(m.name.text);ts.forEachChild(n,visit)}
 visit(sf);for(const m of expected)assert.ok(found.includes(m),name+'.'+m);interfaceMembers.push({file,name,members:found})
}
const upstreamMock=await readFile(resolve(cache,'packages/core/agent-loop/tests/mock-adapter.ts'))
assert.deepEqual(await readFile(resolve(path,'../lab/official-mock.ts')),upstreamMock,'official fixture must be byte-identical')
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,'')
const prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'')
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length
const lines=(s:string)=>[...s.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0)
const metrics={allBodyCjk:cjk(prose(lesson.body)),defaultBodyCjk:cjk(prose(defaultBody)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:lines(lesson.body),defaultCodeLines:lines(defaultBody),details:(html.match(/<details /g)??[]).length,coreConcepts:6,coreConceptNames:['Turn','Step','Attempt','Tool Call','Phase','Inbox'],coreSourceFiles:5,exercises:4,thoughts:8,figures:4,scope:'CJK excludes code/URLs/comments; default excludes deepdive; counts are not measured learning time'}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',uniqueCheckKeys:true,programs,officialMockByteIdentical:true,previewExactSsr:true,members,interfaceMembers,metrics},null,2)+'\n')
console.log(JSON.stringify({status:'PASS',metrics,members}))
