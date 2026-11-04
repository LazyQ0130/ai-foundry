import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=fileURLToPath(new URL('../',import.meta.url));
const sharp=createRequire(import.meta.url)('sharp');
const {chromium}=createRequire(import.meta.url)('C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
await mkdir(resolve(here,'figures/qa'),{recursive:true});
const report={assessmentSha256:createHash('sha256').update(await readFile(resolve(here,'assessment-preview.html'))).digest('hex'),diagrams:[],viewports:[],manual:'Separate author visual inspection in evidence/manual-review.json; verify its hashes after any regeneration'};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const server=createServer(async(req,res)=>{if(req.url!=='/'){res.writeHead(404);res.end();return;}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile(resolve(here,'assessment-preview.html')));});
try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const ctx=await browser.newContext({viewport:{width:640,height:1800},deviceScaleFactor:2});
 for(const name of ['event-log','persistence','compaction-retry','cancel-recovery']){
  const source=await readFile(resolve(here,`figures/source/${name}.svg`),'utf8');
  const height=Number(source.match(/<svg[^>]* height="(\d+)"/)[1]);
  const p=await ctx.newPage();await p.setViewportSize({width:640,height});
  await p.setContent('<html><style>body{margin:0}svg{display:block}</style>'+source+'</html>');await p.evaluate(()=>document.fonts.ready);
  const geometry=await p.evaluate(()=>{const svg=document.querySelector('svg'),v=svg.viewBox.baseVal,ts=[...svg.querySelectorAll('text')];return {width:v.width,height:v.height,out:ts.filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height}).map(t=>t.textContent),font:document.fonts.check('28px "Microsoft YaHei"','历史')};});
  assert.deepEqual(geometry.out,[]);assert.equal(geometry.font,true);
  // Render the complete vector canvas directly. Browser long-page captures
  // showed incomplete raster tiles despite correct SVG geometry.
  await sharp(Buffer.from(source),{density:144}).png().toFile(resolve(here,`figures/${name}.png`));
  report.diagrams.push({name,...geometry,rasterizer:'sharp/librsvg density144'});await p.close();
 }
 await ctx.close();
 for(const width of [1440,390,320]){
  const c=await browser.newContext({viewport:{width,height:950}}),page=await c.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);assert.equal(await page.locator('article').count(),18);assert.equal(await page.locator('.answer[open]').count(),0);assert.equal(await page.locator('.lesson-copy').count(),0);
  for(const a of await page.locator('.answer').all()){await a.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await a.evaluate(e=>e.open),true);await page.keyboard.press('Enter');assert.equal(await a.evaluate(e=>e.open),false);}
  await page.locator('textarea').first().fill('独立推导：事件前缀、Surface与屏障分别取证。');await page.locator('.score').first().fill('123');await page.locator('.score').first().dispatchEvent('change');assert.equal(await page.locator('.score').first().inputValue(),'4');
  await page.locator('.done').first().check();await page.selectOption('#filter','pending');assert.equal(await page.locator('article:visible').count(),17);
  await page.selectOption('#filter','cross');assert.equal(await page.locator('article:visible').count(),5);await page.click('#open');assert.equal(await page.locator('.answer[open]').count(),5);
  const openWidth=await page.evaluate(()=>document.documentElement.scrollWidth);assert.ok(openWidth<=width,'open answer overflow '+width);
  for(const n of [14,18]){
   const a=page.locator(`article[data-q="${n}"]`);const box=await a.boundingBox();await page.setViewportSize({width,height:Math.ceil(box.height)+120});await a.evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-8));await a.screenshot({path:resolve(here,`figures/qa/q${n}-${width}.png`)});await page.setViewportSize({width,height:950});
  }
  await page.click('#close');await page.selectOption('#filter','all');await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(here,`figures/qa/assessment-${width}.png`),fullPage:false});
  assert.deepEqual(errors,[]);report.viewports.push({width,status:'PASS',questions:18,answers:18,crossQuestions:5,keyboard:true,notes:true,scoreClamp:true,filters:true,openDocumentWidth:openWidth,errors});await c.close();
 }
}finally{await new Promise(r=>server.close(r));await browser.close();}
await writeFile(resolve(here,'evidence/assessment-qa.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.viewports));
