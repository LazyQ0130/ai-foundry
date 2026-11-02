import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'evidence/assessment-visual');await mkdir(out,{recursive:true});
const runtime=process.env.AIFOUNDRY_QA_NODE_MODULES??'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=createRequire(import.meta.url)(resolve(runtime,'playwright'));
const server=createServer(async(req,res)=>{if(req.url!=='/'){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'assessment-preview.html')));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.AIFOUNDRY_QA_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe'}),records=[];
try{
 for(const width of [1440,390,320]){
  const page=await browser.newPage({viewport:{width,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(await page.locator('article').count(),16);assert.equal(await page.locator('details[open]').count(),0);assert.equal(await page.locator('textarea').count(),16);
  const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent?.slice(0,80),right:e.getBoundingClientRect().right}))}));
  if(geometry.scrollWidth>width){await page.screenshot({path:resolve(out,`failure-${Date.now()}-${width}.png`),fullPage:true});await writeFile(resolve(out,`failure-${Date.now()}.json`),JSON.stringify(geometry,null,2));throw Error(JSON.stringify(geometry));}
  await page.screenshot({path:resolve(out,`intro-${width}.png`)});
  await page.locator('#expand').click();assert.equal(await page.locator('details[open]').count(),16);
  for(const id of ['q13','q15','q16'])await page.locator('#'+id).screenshot({path:resolve(out,`${id}-${width}.png`)});
  await page.locator('#collapse').click();assert.equal(await page.locator('details[open]').count(),0);
  const summary=page.locator('#q13 summary');await summary.focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#q13 details').evaluate(d=>d.open));await page.keyboard.press('Enter');
  await page.locator('#filter').selectOption({label:'完整系统'});assert.equal(await page.locator('article:visible').count(),4);await page.locator('#filter').selectOption('all');
  const maxes=await page.locator('.score').evaluateAll(es=>es.map(e=>e.max));
  for(let i=0;i<maxes.length;i++)await page.locator('.score').nth(i).fill(maxes[i]);
  assert.match(await page.locator('#total').innerText(),/100 \/ 100/);
  await page.locator('.score').first().fill('999');assert.equal(await page.locator('.score').first().inputValue(),'5');
  await page.locator('.score').first().fill('-1');assert.equal(await page.locator('.score').first().inputValue(),'0');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  records.push({width,status:'PASS',questions:16,closedInitially:true,keyboard:true,filterFourComprehensive:true,selfScoreClampAndTotal:true,overflow:false,errors});await page.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
await writeFile(resolve(out,'results.json'),JSON.stringify({records,scope:'local assessment preview only; not learner validation'},null,2)+'\n');console.log(JSON.stringify(records));
