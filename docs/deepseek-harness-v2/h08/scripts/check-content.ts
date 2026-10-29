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
const path=resolve(repo,'course-content/internal/deepseek-harness/h08/lesson.md'),bytes=await readFile(path)
const source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source)
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort())
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4)
assert.ok(!/^# /m.test(lesson.body));assert.ok(!/<script|<details|__H08|@PIN/.test(lesson.body))
const programs=['compose.mjs','reconfigure.ts','harness.ts','demo.ts']
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
const members:any[]=[]
for(const [file,className,member] of [['vendor/include/src/index.ts','Include','refresh'],['vendor/loader/src/config/entry.ts','Entry','update'],['vendor/loader/src/config/group.ts','EntryGroup','update'],['vendor/loader/src/config/tree.ts','EntryTree','ensureId'],['packages/boot/hmr/src/index.ts','Hmr','reconcileProfile']]){
 const sf=ts.createSourceFile(file,await readFile(resolve(cache,file),'utf8'),ts.ScriptTarget.Latest,true)
 const cls=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===className) as ts.ClassDeclaration|undefined;assert.ok(cls,className)
 const method=cls.members.find(n=>n.name&&ts.isIdentifier(n.name)&&n.name.text===member);assert.ok(method,member)
 members.push({file,className,member,line:sf.getLineAndCharacterOfPosition(method.getStart(sf)).line+1})
}
const defaultBody=lesson.body.replace(/:::deepdive[^\n]*\n[\s\S]*?\n:::/g,'')
const prose=(s:string)=>s.replace(/```[\s\S]*?```/g,'').replace(/https:\/\/[^\s)]+/g,'').replace(/<!--[\s\S]*?-->/g,'')
const cjk=(s:string)=>(s.match(/[\u3400-\u9fff]/g)??[]).length
const lines=(s:string)=>[...s.matchAll(/```\w+\n([\s\S]*?)\n```/g)].reduce((n,m)=>n+m[1].split('\n').length,0)
const metrics={allBodyCjk:cjk(prose(lesson.body)),defaultBodyCjk:cjk(prose(defaultBody)),codeBlocks:(lesson.body.match(/^```\w+/gm)??[]).length,codeLines:lines(lesson.body),defaultCodeLines:lines(defaultBody),details:(html.match(/<details /g)??[]).length,coreConcepts:5,coreSourceFiles:5,exercises:3,thoughts:7,figures:4,scope:'CJK excludes code/URLs/comments; default excludes deepdive; counts are not measured learning time'}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify({status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',uniqueCheckKeys:true,programs,previewExactSsr:true,members,metrics},null,2)+'\n')
console.log(JSON.stringify({status:'PASS',metrics,members}))
