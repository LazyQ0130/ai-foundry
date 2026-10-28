/** 实际平台 parser/SSR；H03 自足内容、完整实验、答案与任务键核对。 */
import React from 'react'
import assert from 'node:assert/strict'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {renderToStaticMarkup} from 'react-dom/server'
import {parseLessonContent} from '../../../../server/services/lesson-parser.js'
import {LessonMarkdown} from '../../../../src/components/LessonMarkdown.js'
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..')
const path=resolve(repo,'course-content/internal/deepseek-harness/h03/lesson.md')
const bytes=await readFile(path),source=bytes.toString('utf8').replaceAll('\r\n','\n'),lesson=parseLessonContent(source)
assert.deepEqual(Object.keys(lesson.meta).sort(),['estimatedTime','difficulty','objective','checklist','checkKeys'].sort())
assert.ok(!/^# /m.test(lesson.body));assert.ok(!/__H03|LOCKED\/|image-placeholder|<script|<details/.test(lesson.body))
assert.equal(lesson.meta.checkKeys.length,4);assert.equal(lesson.meta.checklist.length,4)
const code=[...lesson.body.matchAll(/```javascript\n([\s\S]*?)\n```/g)].map(m=>m[1])
assert.ok(code.includes((await readFile(resolve(path,'../lab/trace.mjs'),'utf8')).replaceAll('\r\n','\n').trim()))
const json=[...lesson.body.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m=>JSON.parse(m[1]))
const answer=JSON.parse(await readFile(resolve(path,'../lab/reference-answer.json'),'utf8'))
assert.equal(json.length,1);assert.deepEqual(json[0],answer);assert.equal(Object.keys(answer).length,9)
const keys=new Set<string>()
for(const name of await readdir(resolve(repo,'course-content'),{recursive:true})){
 const p=resolve(repo,'course-content',name);if(!name.endsWith('.md')||p===path)continue
 for(const k of (await readFile(p,'utf8')).match(/check-[a-f0-9]{16}/g)??[])keys.add(k)
}
for(const key of lesson.meta.checkKeys)assert.ok(!keys.has(key))
const html=renderToStaticMarkup(React.createElement(LessonMarkdown,{body:lesson.body}))
assert.equal((html.match(/<img /g)??[]).length,3)
assert.equal((html.match(/<details /g)??[]).length,8);assert.ok(!/<details[^>]* open/.test(html))
for(const f of JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))){assert.ok(html.includes(`src="${f.rendererPath}"`));assert.ok(html.includes(`href="${f.rendererPath}"`))}
for(const term of ['Turn','Step','Inbox','Session','Prompt Assembly','Model History','Stream','Tool Call','Tool Result','Event Log','Agent Lifecycle','案例 A','案例 B','H04','blocked','aborted','tool-failure','timeout','prepare-error','教学简化','我们的分析','原课权限'])assert.ok(lesson.body.includes(term),term)
for(let n=1;n<=4;n++)assert.ok(html.includes(`思考 ${n} 参考答案`))
const report={status:'PASS',lessonSha256:createHash('sha256').update(bytes).digest('hex'),parser:'actual parseLessonContent',renderer:'actual LessonMarkdown SSR',metadataFields:Object.keys(lesson.meta),checklist:4,globallyUniqueKeys:true,fullLabExactMatch:true,referenceAnswerExactMatch:true,details:8,thoughtAnswers:4,figures:3,conceptCoverage:'11 requested terms present; pedagogical meaning reviewed separately',integration:'NOT_PERFORMED'}
await writeFile(resolve(root,'evidence/content-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))
