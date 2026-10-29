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
const path=resolve(repo,'course-content/internal/deepseek-harness/h06/lesson.md')
const bytes=await readFile(path),source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source)
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort())
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4)
assert.ok(!/^# /m.test(lesson.body));assert.ok(!/<script|<details|LOCKED\/|__H06/.test(lesson.body))
const code=[...lesson.body.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1])
const programs=['support.ts','modes.ts','request.ts','demo.ts']
for(const f of programs)assert.ok(code.includes((await readFile(resolve(path,'../lab',f),'utf8')).replaceAll('\r\n','\n').trimEnd()),f)
const modes=(await readFile(resolve(path,'../lab/modes.ts'),'utf8')).replaceAll('\r\n','\n')
for(const name of ['emit','parallel','serial','bail','waterfall'])assert.ok(code.includes(modes.split(`// snippet:${name}:start\n`)[1].split(`// snippet:${name}:end`)[0].trimEnd()),name)
const keys=new Set<string>()
for(const f of await readdir(resolve(repo,'course-content'),{recursive:true})){
 const p=resolve(repo,'course-content',f);if(!f.endsWith('.md')||p===path)continue
 for(const k of (await readFile(p,'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(k)
}
for(const key of lesson.meta.checkKeys)assert.ok(!keys.has(key),key)
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body})),figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))
assert.equal((html.match(/<img /g)??[]).length,3);assert.equal((html.match(/<details /g)??[]).length,18);assert.ok(!/<details[^>]* open/.test(html))
let staticArticle=html
for(const f of figures){assert.ok(html.includes(`src="${f.rendererPath}"`));staticArticle=staticArticle.replaceAll(f.rendererPath,f.image)}
staticArticle=staticArticle.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>')
assert.ok((await readFile(resolve(root,'reading-preview.html'),'utf8')).includes(staticArticle),'saved preview differs from actual current SSR')
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8')),cache=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache
const members:any[]=[]
const lookups=[...['emit','parallel','serial','bail','waterfall','on'].map(member=>['vendor/cordis/src/events.ts','EventsService',member]),['packages/core/tools/src/pipeline.ts','ToolExecutionPipeline','prepare'],['packages/llm/llm/src/index.ts','LlmRuntime','streamWithRegistration']]
for(const [file,className,member] of lookups){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
 const cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration|undefined
 assert.ok(cls,className)
 const method=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===member)
 assert.ok(method,`${className}.${member}`);members.push({file,className,member,line:sf.getLineAndCharacterOfPosition(method.getStart(sf)).line+1})
}
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,'')
const prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'')
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length
const lines=(s:string)=>[...s.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0)
const metrics={allBodyCjk:cjk(prose(lesson.body)),defaultBodyCjk:cjk(prose(defaultBody)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:lines(lesson.body),defaultCodeLines:lines(defaultBody),details:18,coreModes:5,supportingConcepts:7,coreSourceFiles:4,exercises:3,thoughts:4,figures:3,scope:'CJK excludes code/URLs/comments; default excludes deepdive; concepts counted by declared teaching focus; not reading-time measurement'}
const report={status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',checklist:4,globallyUniqueKeys:true,fullProgramMatches:programs,exactModeSnippets:5,staticPreviewExactSsrMatch:true,members,metrics}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))
