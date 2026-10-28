/** Local-only image rendering and actual Renderer V2 SSR visual QA. */
import {createRequire} from 'node:module'
import {readFile,writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {createServer} from 'node:http'
const root=fileURLToPath(new URL('../',import.meta.url))
const runtime=process.env.AIFOUNDRY_QA_NODE_MODULES??'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const {chromium}=createRequire(import.meta.url)(resolve(runtime,'playwright'))
const browser=await chromium.launch({executablePath:process.env.AIFOUNDRY_QA_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
const ids=['h01-01','h03-01','h06-01','h10-01'],report={kind:'actual LessonMarkdown SSR + Chrome image QA',screens:[],svg:[],manualReview:'PENDING',limitations:['SSR fixture does not hydrate React handlers; Prompt clipboard/progress handlers not tested here','No product route, entitlement, real model or full upstream suite exercised']}
let server
try {
 const context=await browser.newContext({viewport:{width:800,height:900},deviceScaleFactor:2})
 const page=await context.newPage()
 for(const id of ids){
  const svg=await readFile(resolve(root,'figures/source',id+'.svg'),'utf8')
  await page.setContent('<html lang="zh-CN"><style>body{margin:0}svg{display:block}</style><body>'+svg+'</body></html>')
  await page.evaluate(()=>document.fonts.ready)
  const geometry=await page.evaluate(()=>{
   const svg=document.querySelector('svg'),bounds=svg.viewBox.baseVal
   return {font:document.fonts.check('28px "Microsoft YaHei"','智能体'),outOfBounds:[...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>bounds.width||b.y+b.height>bounds.height}).map(t=>t.textContent)}
  })
  if(geometry.outOfBounds.length||!geometry.font)throw Error(id+': '+JSON.stringify(geometry))
  await page.locator('svg').screenshot({path:resolve(root,'figures/rendered',id+'.png')})
  report.svg.push({id,status:'PASS',...geometry})
 }
 await context.close()
 server=createServer(async(req,res)=>{
  try{
   const path=new URL(req.url,'http://127.0.0.1').pathname
   let data,type
   if(path==='/styles.css'){data=await readFile(resolve(root,'../../src/index.css'));type='text/css'}
   else if(/^\/course-media\/harness-v2\/(h01-01|h03-01|h06-01|h10-01)\.png$/.test(path)){data=await readFile(resolve(root,'figures/rendered',path.split('/').at(-1)));type='image/png'}
   else if(/^\/(h01-01|h03-01|h06-01|h10-01)$/.test(path)){data=await readFile(resolve(root,'figures/qa',path.slice(1)+'.html'));type='text/html; charset=utf-8'}
   else{res.writeHead(404);res.end();return}
   res.writeHead(200,{'Content-Type':type});res.end(data)
  }catch(e){res.writeHead(500);res.end(String(e))}
 })
 await new Promise(r=>server.listen(0,'127.0.0.1',r))
 const port=server.address().port
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage()
  for(const id of ids){
   const errors=[];page.on('pageerror',e=>errors.push(e.message))
   await page.goto(`http://127.0.0.1:${port}/${id}`)
   await page.locator('img').evaluate(i=>i.decode())
   const metrics=await page.evaluate(()=>{
    const i=document.querySelector('img'),b=i.getBoundingClientRect()
    return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,imageWidth:b.width,imageHeight:b.height,naturalWidth:i.naturalWidth,alt:i.alt,caption:document.querySelector('.lesson-caption').textContent,expand:document.querySelector('.lesson-image-expand').getAttribute('href')}
   })
   if(metrics.documentWidth>width||metrics.naturalWidth===0||!metrics.caption||!metrics.alt||errors.length)throw Error(JSON.stringify({id,width,metrics,errors}))
   await page.locator('summary').click()
   if(!await page.locator('details').evaluate(d=>d.open))throw Error('native details did not open')
   await page.locator('summary').click()
   await page.screenshot({path:resolve(root,'figures/qa',`${id}-${width}.png`),fullPage:true})
   report.screens.push({id,width,status:'PASS',metrics,details:'PASS',errors})
  }
  await context.close()
 }
}finally{if(server)await new Promise(r=>server.close(r));await browser.close()}
await writeFile(resolve(root,'evidence/visual-qa.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({images:report.svg.length,viewports:report.screens.length,geometry:'PASS',manualReview:report.manualReview}))
