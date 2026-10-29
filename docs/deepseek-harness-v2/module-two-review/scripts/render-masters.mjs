// 对 13 个实际 SVG 独立导出，只有有依据修订的 h07-01 覆盖正式 PNG。
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)), docs=resolve(root,'..');
const runtime=process.env.AIFOUNDRY_QA_NODE_MODULES??'C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=createRequire(import.meta.url)(resolve(runtime,'playwright'));
const browser=await chromium.launch({headless:true,executablePath:process.env.AIFOUNDRY_QA_CHROME??'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const records=[],hash=b=>createHash('sha256').update(b).digest('hex');
try {
 const ctx=await browser.newContext({viewport:{width:700,height:1400},deviceScaleFactor:2}),page=await ctx.newPage();
 for(const h of ['h05','h06','h07','h08'])for(const f of JSON.parse(await readFile(resolve(docs,h,'evidence/figures.json'),'utf8'))){
  const source=resolve(docs,h,f.source),official=resolve(docs,h,f.image),out=resolve(root,'evidence/masters',f.id+'.png');
  await mkdir(dirname(out),{recursive:true});
  await page.setContent('<html lang="zh-CN"><style>body{margin:0}svg{display:block}</style><body>'+await readFile(source,'utf8')+'</body></html>');
  await page.evaluate(()=>document.fonts.ready);await page.locator('svg').screenshot({path:out});
  const before=hash(await readFile(official)),after=hash(await readFile(out));
  if(f.id==='h07-01')await copyFile(out,official);else assert.equal(after,before,f.id+' should be byte-identical');
  records.push({id:f.id,sourceHash:hash(await readFile(source)),before,after,changed:before!==after,output:out});
 }
 await ctx.close();
}finally{await browser.close();}
await writeFile(resolve(root,'evidence/figure-export.json'),JSON.stringify({records,onlyChanged:'h07-01'},null,2)+'\n');
console.log('PASS: 13 exported; 12 unchanged; h07-01 regenerated');
