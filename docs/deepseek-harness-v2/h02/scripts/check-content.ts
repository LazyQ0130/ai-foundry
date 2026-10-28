/** H02 作者检查：平台真实 parser/SSR，完整实验与答案同步，元数据及折叠结构。 */
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
const path=resolve(repo,'course-content/internal/deepseek-harness/h02/lesson.md')
const bytes=await readFile(path),source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source)
assert.ok(!/^# /m.test(lesson.body));assert.ok(!/__H02|LOCKED\/|image-placeholder|<script|<details/.test(lesson.body))
assert.equal(lesson.meta.checkKeys.length,4)
const code=[...lesson.body.matchAll(/```javascript\n([\s\S]*?)\n```/g)].map(m=>m[1])
assert.ok(code.includes((await readFile(resolve(path,'../lab/navigate.mjs'),'utf8')).replaceAll('\r\n','\n').trim()))
const json=[...lesson.body.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m=>JSON.parse(m[1]))
const answer=JSON.parse(await readFile(resolve(path,'../lab/reference-answer.json'),'utf8'))
assert.deepEqual(json.at(-1),answer)
assert.equal(json[0].edges.length,6);assert.equal(json[0].locate.packageName,'')
const keys=new Set<string>()
for(const name of await readdir(resolve(repo,'course-content'),{recursive:true})){
 const p=resolve(repo,'course-content',name);if(!name.endsWith('.md')||p===path)continue
 for(const k of (await readFile(p,'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(k)
}
for(const key of lesson.meta.checkKeys)assert.ok(!keys.has(key))
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body}))
assert.equal((html.match(/<img /g)??[]).length,3)
assert.ok((html.match(/<details /g)??[]).length>=7);assert.ok(!/<details[^>]* open/.test(html))
for(const f of JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))){assert.ok(html.includes(`src="${f.rendererPath}"`));assert.ok(html.includes(`href="${f.rendererPath}"`))}
for(const term of ['Monorepo','Workspace','Package','Dependency','Module Boundary','Entry Point','Runtime','Host','Client','Build Artifact','Dependency Graph','练习 A','练习 B','H03'])assert.ok(lesson.body.includes(term),term)
// 确认可选补课中 type import / interface 会被移除，使用到的函数 import 保留。
const snippets=[...lesson.body.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map(m=>m[1])
assert.equal(snippets.length,2)
const emitted=snippets.map(s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText)
assert.ok(!emitted.join('\n').includes('interface Receipt'))
assert.ok(!emitted[1].includes('import type'))
assert.ok(emitted[1].includes('import { renderReceipt }'))
await writeFile(resolve(root,'evidence/type-reading-probe.json'),JSON.stringify({status:'PASS',scope:'teaching snippets transpile only; not full semantic or upstream typecheck',emitted},null,2)+'\n')
const report={status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',metadataFields:Object.keys(lesson.meta),checklist:4,globallyUniqueKeys:true,fullLabExactMatch:true,referenceAnswerExactMatch:true,details:(html.match(/<details /g)??[]).length,figures:3,typeImportProbe:'PASS (transpile only)',integration:'NOT_PERFORMED'}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))
