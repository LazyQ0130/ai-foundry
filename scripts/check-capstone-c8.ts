import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { LessonMarkdown } from '../src/components/LessonMarkdown.js'
import { allLessons } from '../src/data/courses.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'
const base='course-content/internal/capstone',overlay=base+'/c8/overlay'
const read=(file:string)=>readFile(overlay+'/'+file,'utf8')
const lesson=parseLessonContent(await readFile(base+'/c8/lesson-draft.md','utf8'))
assert.equal(lesson.meta.checkKeys.length,7);assert.equal(lesson.meta.checklist.length,7)
assert.match(lesson.meta.estimatedTime,/150.*180/)
const html=renderToStaticMarkup(createElement(LessonMarkdown,{body:lesson.body}))
assert.equal((html.match(/复制提示词/g)??[]).length,7)
assert.ok(html.includes('证明整个 AI 产品真的可靠'))
const used=new Set<string>()
for(const stage of [1,2,3,4])for(const file of await readdir('course-content/stage-'+stage))if(file.endsWith('.md'))
 for(const key of parseLessonContent(await readFile(`course-content/stage-${stage}/${file}`,'utf8')).meta.checkKeys)used.add(key)
for(const prior of ['c1','c2','c3','c4','c5','c6','c7'])for(const key of parseLessonContent(await readFile(`${base}/${prior}/lesson-draft.md`,'utf8')).meta.checkKeys)used.add(key)
for(const key of lesson.meta.checkKeys){assert.ok(!used.has(key));used.add(key)}
for(const word of ['Functional','Quality','Safety','Reliability','Hit@3','INCOMPLETE','baseline','Test','Eval','C9'])assert.ok(lesson.body.includes(word),word)
const cases=await read('eval/cases.mjs'),metrics=await read('eval/metrics.mjs'),runner=await read('eval/runner.mjs'),report=await read('eval/report.mjs')
const count=(cases.match(/^add\('/gm)??[]).length;assert.ok(count>=20&&count<=30)
for(const category of ['functional','quality','safety','reliability'])assert.ok(cases.includes(`'${category}'`))
for(const word of ['cross_workspace_leaks','unapproved_writes','duplicate_knowledge_notes','invalid_citations','unsupported_deterministic_claims','hitAtK','supportGold','noteFidelity','compareBaseline'])assert.ok(metrics.includes(word),word)
for(const word of ['--case','--inject-failure','--compare-baseline','INCOMPLETE','process.exitCode','C8_REAL_EVAL','REAL_CALL_BUDGET_EXHAUSTED'])assert.ok(runner.includes(word),word)
for(const word of ['qualityThresholds','hardGates','fullSuitePassed','report.json','report.md','INCOMPLETE'])assert.ok(report.includes(word),word)
const gold=await read('eval/fixtures/gold.mjs');assert.ok(gold.includes('CAPSTONE_EVAL_DATASET_VERSION'))
const baseline=JSON.parse(await read('eval/baseline.json'));assert.equal(baseline.datasetVersion,'v1');assert.equal(Object.keys(baseline.caseStatuses).length,count)
const context=await read('eval/context.mjs');for(const word of ['55440','capstone_c8_eval','capstone_c8_real','EVAL_DATABASE_NOT_ALLOWLISTED','EVAL_PRODUCTION_ENV_FORBIDDEN'])assert.ok(context.includes(word))
// C8 may fix a demonstrated product bug, but this reference needs no product changes.
for(const forbidden of ['prisma','app','lib','Dockerfile','docker-compose.yml','worker','queue'])await assert.rejects(access(overlay+'/'+forbidden))
assert.equal(allLessons.length,29);assert.ok(['暂未解锁','已开放'].includes(capstoneShowcase.status))
console.log(`PASS: C8 Renderer V2, seven unique keys/prompts, ${count} fixed cases, four categories, metrics/gates/INCOMPLETE/baseline and C9 boundary`)
