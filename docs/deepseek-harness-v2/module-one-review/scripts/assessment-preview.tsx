/** 综合测验仍用真实 Renderer；只生成私有作者页，不注册课程或成绩。 */
import React from 'react'
import assert from 'node:assert/strict'
import {renderToStaticMarkup} from 'react-dom/server'
import {readFile,writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {createRequire} from 'node:module'
import {createHash} from 'node:crypto'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import config from '../../../../tailwind.config.js'
import {LessonMarkdown} from '../../../../src/components/LessonMarkdown.js'
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..')
const body=await readFile(resolve(root,'assessment.md'),'utf8')
const questions=[...body.matchAll(/^### Q(\d+) .*?（(\d+) 分/gm)].map(m=>({id:Number(m[1]),score:Number(m[2])}))
assert.deepEqual(questions.map(q=>q.id),Array.from({length:12},(_,i)=>i+1))
assert.equal(questions.reduce((a,q)=>a+q.score,0),100)
let rendered=renderToStaticMarkup(React.createElement(LessonMarkdown,{body})).replace(/<button[^>]*class="lesson-copy"[\s\S]*?<\/button>/g,'')
assert.equal((rendered.match(/<details /g)??[]).length,12)
assert.ok(!/<details[^>]* open/.test(rendered))
const css=await postcss([tailwindcss({...config,content:[resolve(repo,'src/**/*.{ts,tsx}')]})]).process(await readFile(resolve(repo,'src/index.css'),'utf8'),{from:resolve(repo,'src/index.css')})
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>第一模块综合理解测验 · 私有作者预览</title><style>${css.css}\nbody{margin:0;background:white;font-family:"Microsoft YaHei",Arial,sans-serif}main{max-width:808px;box-sizing:border-box;padding:24px;margin:auto}.audit-note{font-size:13px;color:#64748b}@media(max-width:639px){main{padding:16px}}</style></head><body><main><p class="audit-note">内部审查用 · 未发布 · 自由答案须人工评分</p><h1 class="lesson-title">第一模块综合理解测验</h1>${rendered}</main></body></html>`
await writeFile(resolve(root,'assessment-preview.html'),html)
const runtime=process.env.AIFOUNDRY_QA_NODE_MODULES??'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const {chromium}=createRequire(import.meta.url)(resolve(runtime,'playwright'))
const browser=await chromium.launch({headless:true,executablePath:process.env.AIFOUNDRY_QA_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe'})
const viewports=[]
try{
 for(const width of [1440,390,320]){
  const page=await browser.newPage({viewport:{width,height:950}})
  await page.setContent(html);await page.evaluate(()=>document.fonts.ready)
  assert.equal(await page.locator('details').count(),12)
  for(let i=0;i<12;i++){
   const detail=page.locator('details').nth(i),summary=detail.locator('summary')
   assert.equal(await detail.evaluate(d=>(d as HTMLDetailsElement).open),false)
   await summary.focus();await page.keyboard.press('Enter')
   assert.equal(await detail.evaluate(d=>(d as HTMLDetailsElement).open),true)
   assert.ok((await detail.innerText()).includes('评分'))
   assert.ok((await detail.innerText()).length>140)
   await page.keyboard.press('Enter');assert.equal(await detail.evaluate(d=>(d as HTMLDetailsElement).open),false)
  }
  const documentWidth=await page.evaluate(()=>document.documentElement.scrollWidth)
  assert.ok(documentWidth<=width)
  await page.evaluate(()=>scrollTo(0,0))
  await page.screenshot({path:resolve(root,`evidence/visual/assessment-${width}.png`),fullPage:true})
  viewports.push({width,documentWidth,answers:12,keyboardOpenClose:'PASS',status:'PASS'})
  await page.close()
 }
}finally{await browser.close()}
await writeFile(resolve(root,'evidence/assessment-check.json'),JSON.stringify({status:'PASS',questions,totalScore:100,sourceSha256:createHash('sha256').update(body).digest('hex'),previewSha256:createHash('sha256').update(html).digest('hex'),viewports,automaticGrading:'NOT_IMPLEMENTED: open answers and rubrics require human review; thresholds not calibrated'},null,2)+'\n')
console.log('PASS: 12 questions / 100 points; 12 folded answers keyboard-tested at three widths; no learner-effectiveness claim')
