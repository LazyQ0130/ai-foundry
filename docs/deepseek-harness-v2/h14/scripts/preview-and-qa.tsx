/** 私有作者夹具。真实 React 组件 + 实际平台 CSS，localhost 临时服务；不挂产品路由。 */
import React from 'react'
import { createServer } from 'node:http'
import { readFile, writeFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { build } from 'esbuild'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import tailwindConfig from '../../../../tailwind.config.js'
import { parseLessonContent } from '../../../../server/services/lesson-parser.js'

const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..')
const runtime=process.env.AIFOUNDRY_QA_NODE_MODULES ?? 'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const {chromium}=createRequire(import.meta.url)(resolve(runtime,'playwright'))
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h14-'))
const lesson=parseLessonContent((await readFile(resolve(repo,'course-content/internal/deepseek-harness/h14/lesson.md'),'utf8')).replaceAll('\r\n','\n'))
const figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))
const digest=(data:Buffer|string)=>createHash('sha256').update(data).digest('hex')
const entry=`import React from 'react'; import {createRoot} from 'react-dom/client'; import {LessonMarkdown} from ${JSON.stringify(resolve(repo,'src/components/LessonMarkdown.tsx').replaceAll('\\','/'))}; const lesson=${JSON.stringify(lesson)}; createRoot(document.getElementById('root')).render(<main><p className="author-only">作者本地预览 · H14 内部教材 · 未接入课程目录</p><header className="lesson-header"><h1 className="lesson-title">工具执行流水线：从模型调用到结果返回</h1><p>{lesson.meta.estimatedTime}</p></header><LessonMarkdown body={lesson.body}/></main>);`
await build({stdin:{contents:entry,resolveDir:repo,loader:'tsx'},bundle:true,platform:'browser',format:'esm',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},outfile:resolve(scratch,'preview.js')})
const css=await postcss([tailwindcss({...tailwindConfig,content:[resolve(repo,'src/**/*.{ts,tsx}')]})]).process(await readFile(resolve(repo,'src/index.css'),'utf8'),{from:resolve(repo,'src/index.css')})
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>H14 作者预览</title><link rel="stylesheet" href="/style.css"><style>body{margin:0;background:white;font-family:"Microsoft YaHei",Arial,sans-serif}main{max-width:808px;box-sizing:border-box;padding:24px;margin:auto}.author-only{font-size:13px;color:#64748b}button{font:inherit}@media(max-width:639px){main{padding:16px}}</style></head><body><div id="root"></div><script type="module" src="/preview.js"></script></body></html>'
const browser=await chromium.launch({headless:true,executablePath:process.env.AIFOUNDRY_QA_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe'})
let server:ReturnType<typeof createServer>|undefined
const report:any={kind:'actual LessonMarkdown mounted with React createRoot + platform CSS compiled by PostCSS; author-only fixture',lessonSha256:digest(await readFile(resolve(repo,'course-content/internal/deepseek-harness/h14/lesson.md'))),rendererSha256:digest(await readFile(resolve(repo,'src/components/LessonMarkdown.tsx'))),figures:[],viewports:[],manualReview:'See manual-review.json; browser tests do not grade teaching effectiveness',unverified:['product authenticated page and progress API','learner comprehension and actual reading duration','upstream integration tests and real models']}
try{
 const ctx=await browser.newContext({viewport:{width:700,height:1400},deviceScaleFactor:2}), page=await ctx.newPage()
 for(const f of figures){
  await page.setContent('<html lang="zh-CN"><style>body{margin:0}svg{display:block}</style><body>'+await readFile(resolve(root,f.source),'utf8')+'</body></html>')
  await page.evaluate(()=>document.fonts.ready)
  const geometry=await page.evaluate(()=>{
   const svg=document.querySelector('svg')!,v=svg.viewBox.baseVal,ts=[...svg.querySelectorAll('text')]
   const out=ts.filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height}).map(t=>t.textContent)
   const overlap=[]
   for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
    const a=ts[i].getBBox(),b=ts[j].getBBox()
    if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1)overlap.push([ts[i].textContent,ts[j].textContent])
   }
   return {font:document.fonts.check('28px "Microsoft YaHei"','智能体'),out,overlap,minFont:Math.min(...ts.map(t=>parseFloat(getComputedStyle(t).fontSize))),width:v.width,height:v.height}
  })
  if(!geometry.font||geometry.out.length||geometry.overlap.length)throw Error(JSON.stringify({id:f.id,geometry}))
  await page.locator('svg').screenshot({path:resolve(root,f.image)})
  report.figures.push({id:f.id,status:'PASS',...geometry,sourceSha256:digest(await readFile(resolve(root,f.source))),imageSha256:digest(await readFile(resolve(root,f.image)))})
 }
 await ctx.close()
 server=createServer(async(req,res)=>{
  try{
   const path=new URL(req.url!,'http://127.0.0.1').pathname
   let data:Buffer|string,type:string
   if(path==='/'){data=html;type='text/html; charset=utf-8'}
   else if(path==='/static'){data=await readFile(resolve(root,'reading-preview.html'));type='text/html; charset=utf-8'}
   else if(path==='/preview.js'){data=await readFile(resolve(scratch,'preview.js'));type='text/javascript'}
   else if(path==='/style.css'){data=css.css;type='text/css'}
   else if(figures.some((f:any)=>f.rendererPath===path)){data=await readFile(resolve(root,figures.find((f:any)=>f.rendererPath===path).image));type='image/png'}
   else if(figures.some((f:any)=>'/'+f.image===path)){data=await readFile(resolve(root,path.slice(1)));type='image/png'}
   else{res.writeHead(404);res.end();return}
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data)
  }catch(e){res.writeHead(500);res.end(String(e))}
 })
 await new Promise<void>(r=>server!.listen(0,'127.0.0.1',r))
 const port=(server.address() as {port:number}).port
 for(const width of [1440,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:950},permissions:['clipboard-read','clipboard-write']}),page=await ctx.newPage(),errors:string[]=[],failed:string[]=[]
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()))
  await page.goto(`http://127.0.0.1:${port}/`)
  await page.locator('.lesson-prose').waitFor()
  // 平台图片是 lazy；逐张进入视口后再 decode，不能等待从未触发加载的离屏图。
  for(let i=0;i<figures.length;i++){
   await page.locator('img').nth(i).scrollIntoViewIfNeeded()
   await page.locator('img').nth(i).evaluate(i=>(i as HTMLImageElement).decode())
  }
  await page.evaluate(()=>document.fonts.ready)
  const metrics=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,images:[...document.querySelectorAll('img')].map(i=>({alt:i.alt,width:i.getBoundingClientRect().width,naturalWidth:i.naturalWidth,caption:i.closest('.lesson-figure')?.querySelector('.lesson-caption')?.textContent,src:i.getAttribute('src')})),details:[...document.querySelectorAll('details')].map(d=>d.open),h1:document.querySelectorAll('h1').length}))
  if(metrics.documentWidth>width||metrics.h1!==1||metrics.details.some(Boolean)||metrics.images.some(i=>!i.alt||!i.caption||!i.naturalWidth))throw Error(JSON.stringify({width,metrics}))
  await page.screenshot({path:resolve(root,`figures/qa/lesson-${width}.png`),fullPage:true})
  for(let i=0;i<figures.length;i++){const figure=page.locator('.lesson-figure').nth(i);const src=await figure.locator('img').getAttribute('src');const id=figures.find((f:any)=>f.rendererPath===src).id;await figure.screenshot({path:resolve(root,`figures/qa/${id}-${width}.png`)})}
  const copiedPrograms=[]
  for(const [title,file] of [['完整公共准备','support.ts'],['实践 A 完整程序','flow.ts'],['实践 B 完整程序','scheduling.ts'],['实践 C 完整程序','failures.ts'],['实践 D 完整程序','requests.ts'],['统一运行入口','demo.ts']]){
   const detail=page.locator('details').filter({has:page.locator('summary',{hasText:title})})
   await detail.locator('summary').click()
   await detail.locator('button.lesson-copy').first().click()
   const actual=(await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n').trimEnd()
   const expected=(await readFile(resolve(repo,'course-content/internal/deepseek-harness/h14/lab',file),'utf8')).replaceAll('\r\n','\n').trimEnd()
   if(actual!==expected)throw Error('full program clipboard differs: '+file)
   copiedPrograms.push(file)
   if(file==='scheduling.ts')await detail.screenshot({path:resolve(root,`figures/qa/lab-open-${width}.png`)})
   await detail.locator('summary').click()
  }
  const answer=page.locator('details').filter({has:page.locator('summary',{hasText:'实践 A 详细参考答案'})})
  await answer.locator('summary').click()
  if((await answer.innerText()).length<200)throw Error('A answer too short')
  await answer.screenshot({path:resolve(root,`figures/qa/answer-${width}.png`)});await answer.locator('summary').click()
  const codeScroll={tested:'full contexts program below'}
  const b=page.locator('details').filter({has:page.locator('summary',{hasText:'实践 B 完整程序'})})
  await b.locator('summary').click()
  const labScroll=await b.locator('pre').evaluate(pre=>{
   const e=pre as HTMLElement;e.scrollLeft=e.scrollWidth
   const result={clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,scrolled:e.scrollLeft};e.scrollLeft=0;return result
  })
  if(width<400&&labScroll.scrolled===0)throw Error('long program must scroll on mobile')
  await b.locator('summary').click()
  for(let n=1;n<=10;n++){
   const thought=page.locator('details').filter({has:page.locator('summary',{hasText:`思考 ${n} 参考答案`})})
   await thought.locator('summary').click()
   if((await thought.innerText()).length<100)throw Error('thought explanation incomplete')
   await thought.locator('summary').click()
  }
  for(const d of await page.locator('details').all()){
   await d.locator('summary').focus();await page.keyboard.press('Enter')
   if(!await d.evaluate(e=>(e as HTMLDetailsElement).open))throw Error('keyboard open failed')
   await page.keyboard.press('Enter')
   if(await d.evaluate(e=>(e as HTMLDetailsElement).open))throw Error('keyboard close failed')
  }
  for(let i=0;i<figures.length;i++){
   const promise=page.waitForEvent('popup');await page.locator('.lesson-image-expand').nth(i).click()
   const popup=await promise;await popup.waitForLoadState()
   if(!await popup.locator('img').evaluate(i=>(i as HTMLImageElement).naturalWidth))throw Error('original image failed')
   await popup.close()
  }
  if(await page.evaluate(()=>document.documentElement.scrollWidth)>width||errors.length||failed.length)throw Error(JSON.stringify({width,errors,failed}))
  await page.goto(`http://127.0.0.1:${port}/static`)
  for(let i=0;i<figures.length;i++){await page.locator('img').nth(i).scrollIntoViewIfNeeded();await page.locator('img').nth(i).evaluate(i=>(i as HTMLImageElement).decode())}
  const staticMetrics=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,images:document.querySelectorAll('img').length,copyButtons:document.querySelectorAll('button.lesson-copy').length,details:document.querySelectorAll('details').length}))
  if(staticMetrics.documentWidth>width||staticMetrics.copyButtons!==0||staticMetrics.images!==4)throw Error('static preview mismatch')
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(root,`figures/qa/static-intro-${width}.png`)})
  report.viewports.push({width,status:'PASS',metrics,copiedPrograms,clipboard:'six full programs exact LF-normalized match',
   keyboardDetails:'all opened/closed',thoughtAnswers:10,originalImages:4,labScroll,codeScroll,staticMetrics,errors,failed,
   minimumFigureTextPx:28*Math.min(...metrics.images.map(i=>i.width))/640})
  await ctx.close()
 }
}finally{if(server)await new Promise<void>(r=>server!.close(()=>r()));await browser.close()}
await writeFile(resolve(root,'evidence/visual-qa.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({figures:report.figures.length,viewports:report.viewports.length,status:'PASS',manualReview:'PENDING: inspect final images separately'}))
