import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.js'
import { stages, stageLessonCount, curriculumFormalLessonCount, type Stage } from '../src/data/courses.js'
import { stageCompletedCount, stageLearningStatus } from '../src/data/learningProgress.js'
import { FreeExperience, PrepFeedback } from '../src/components/FreeExperience.js'
import { HeroAppMockup, StageArchMockup } from '../src/components/mockups.js'
import { FaqPermalink } from '../src/components/FaqPermalink.js'
import { MobilePlanComparison } from '../src/components/MobilePlanComparison.js'
import { planTemplates } from '../src/data/site.js'

const render = (child: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(StaticRouter,{location:"/"},child))
test('formal totals exclude prep and all six Stage 1 lessons complete the stage', async () => {
  assert.deepEqual(stages.map(stageLessonCount),[6,8,7,8])
  assert.equal(curriculumFormalLessonCount(),29)
  const stage: Stage = {...stages[0],lessons:stages[0].lessons.map(l=>({...l,status:l.isPrep?'completed':'not_started'}))}
  assert.equal(stageCompletedCount(stage),0)
  assert.equal(stageLessonCount({...stage,lessons:stage.lessons.slice(0,2)}),6)
  stage.lessons[1].status='completed'
  assert.equal(stageCompletedCount(stage),1)
  assert.equal(stageLearningStatus(stage,true),'in_progress')
  stage.lessons.forEach(l => { l.status = 'completed' })
  assert.equal(stageCompletedCount(stage),6)
  assert.equal(stageLearningStatus(stage,true),'completed')
  for(const page of ['ProjectsPage','ProjectPage']) {
    const source=await readFile(`src/pages/${page}.tsx`,'utf8')
    assert.match(source,/stageCompletedCount\(/)
    assert.match(source,/stageLessonCount\(/)
    assert.doesNotMatch(source,/\.lessons\.length|lessons\.filter/)
  }
})
test('free experience state cards and prep completion provide explicit actions',()=>{
  for(const [prepDone,firstDone,label,path] of [[false,false,'开始免费体验','/lesson/stage-1/s1-l0'],[true,false,'继续免费体验','/lesson/stage-1/s1-l1'],[true,true,'免费体验已完成','/stage/stage-1']] as const) {
    const html=render(createElement(FreeExperience,{prepDone,firstDone}))
    assert.ok(html.includes(label));assert.ok(html.includes(`href="${path}"`))
  }
  const prep=render(createElement(PrepFeedback,{done:true}))
  assert.match(prep,/开始前准备已完成/);assert.match(prep,/100%/);assert.match(prep,/不计入 29/)
})
test('mockups reflect each project and mobile comparison renders current prices and all stages first',()=>{
  for(const stage of stages) {
    assert.ok(render(createElement(HeroAppMockup,{stage})).includes(stage.project.title))
    assert.ok(render(createElement(StageArchMockup,{stage})).includes(stage.project.title))
  }
  const plans=planTemplates.filter(p=>p.id!=='all-access').map(p=>({...p,price:123}))
  const all={...planTemplates.find(p=>p.id==='all-access')!,price:400}
  const html=render(createElement(MobilePlanComparison,{allPlan:all,stagePlans:plans,onBuy:()=>{}}))
  assert.match(html,/400/);assert.match(html,/492/);assert.match(html,/92/)
  assert.ok(html.indexOf('全套课程') < html.indexOf('分别购买'))
  for(const i of [1,2,3,4]) assert.ok(html.includes(`包含 Stage ${i}`))
  assert.match(render(createElement(FaqPermalink,{id:'test'})),/复制问题链接/)
})
test('frontend contains no retired demo wording or placeholder permalink',async()=>{
  async function scan(dir:string):Promise<void> {
    for(const file of await readdir(dir,{withFileTypes:true})) {
      const path=`${dir}/${file.name}`
      if(file.isDirectory()) await scan(path)
      else if(/\.(tsx?|css)$/.test(file.name)) assert.doesNotMatch(await readFile(path,'utf8'),/AI 全栈开发实战|AI 记事助手|6 \/ 10 任务|PostgreSQL \/ MongoDB|此问题的链接/,path)
    }
  }
  await scan('src')
})
