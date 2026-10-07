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
import PolicyPage from '../src/pages/PolicyPage.js'

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
test('mockups reflect each project and mobile comparison shows entitlements without duplicate plan cards',()=>{
  for(const stage of stages) {
    assert.ok(render(createElement(HeroAppMockup,{stage})).includes(stage.project.title))
    assert.ok(render(createElement(StageArchMockup,{stage})).includes(stage.project.title))
  }
  const all={...planTemplates.find(p=>p.id==='all-access')!,price:400}
  const project={...planTemplates.find(p=>p.id==='all-access-projects')!,price:500}
  const html=render(createElement(MobilePlanComparison,{allAccessPlan:all,projectPlan:project}))
  assert.match(html,/400/);assert.match(html,/500/);assert.match(html,/100/)
  assert.match(html,/Project Lab/);assert.match(html,/Capstone/);assert.match(html,/暂未开放/)
  assert.doesNotMatch(html,/选择课程版|选择项目版|单阶段购买/)
  assert.match(render(createElement(FaqPermalink,{id:'test'})),/复制问题链接/)
})
test('pricing and policy copy preserves catalogue pricing, purchase boundaries, and distinct policy versions',async()=>{
  const all=planTemplates.find(plan=>plan.id==='all-access')!
  assert.match(all.desc,/四阶段完整课程/)
  assert.doesNotMatch(JSON.stringify(all),/Capstone|Project Lab|后续综合项目/)
  const project=planTemplates.find(plan=>plan.id==='all-access-projects')!
  assert.match(JSON.stringify(project),/Capstone|Project Lab|后续新增综合项目/)
  const pricing=await readFile('src/pages/Pricing.tsx','utf8')
  assert.match(pricing,/usePlans\(\)/)
  assert.match(pricing,/projectPlan\.price - allPlan\.price/)
  const terms=render(createElement(PolicyPage,{kind:'terms'}))
  const privacy=render(createElement(PolicyPage,{kind:'privacy'}))
  assert.match(terms,/2026-10-04\.1/);assert.match(terms,/首次开通后 72 小时内，可通过管理员微信提出退款申请/)
  assert.match(privacy,/2026-09-26\.2/);assert.doesNotMatch(privacy,/2026-10-04\.1/)
  assert.match(await readFile('server/services/auth.ts','utf8'),/TERMS_VERSION = '2026-10-04\.1'/)
  for(const file of ['src/pages/Pricing.tsx','src/components/PurchaseModal.tsx','src/pages/PolicyPage.tsx','src/data/help.ts']) {
    assert.doesNotMatch(await readFile(file,'utf8'),/无理由退款|无理由全额退款|三天无理由/)
  }
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
