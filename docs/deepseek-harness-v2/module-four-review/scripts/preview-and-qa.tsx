import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdtemp,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import tailwindConfig from '../../../../tailwind.config.js';
import {parseLessonContent} from '../../../../server/services/lesson-parser.js';
import {LessonMarkdown} from '../../../../src/components/LessonMarkdown.js';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..'),ev=resolve(root,'evidence'),qa=resolve(root,'figures/qa');await mkdir(qa,{recursive:true});
const sha=(d:any)=>createHash('sha256').update(d).digest('hex'),scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-m4-preview-'));
const {chromium}=createRequire(import.meta.url)('C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const css=(await postcss([tailwindcss({...tailwindConfig,content:[resolve(repo,'src/**/*.{ts,tsx}')]})]).process(await readFile(resolve(repo,'src/index.css'),'utf8'),{from:resolve(repo,'src/index.css')})).css;
const styles='body{margin:0;background:white;font-family:"Microsoft YaHei",Arial,sans-serif}main{max-width:808px;box-sizing:border-box;padding:24px;margin:auto}.audit-note{font-size:13px;color:#475569}.audit-controls{padding:12px;border:1px solid #cbd5e1;border-radius:10px;margin:12px 0}.audit-controls select{max-width:100%}button,input,select{font:inherit}.audit-controls label{display:block;margin:8px 0}.audit-feedback{min-height:1.5em}@media(max-width:639px){main{padding:16px}}';
const datasets:any[]=[];
const questions=JSON.parse(await readFile(resolve(root,'assessment.json'),'utf8'));
for(const id of ['h13','h14','h15','h16','assessment']){
 const path=id==='assessment'?resolve(root,'assessment.md'):resolve(repo,`course-content/internal/deepseek-harness/${id}/lesson.md`),raw=(await readFile(path,'utf8')).replaceAll('\r\n','\n'),lesson=parseLessonContent(raw);
 const figures=id==='assessment'?[]:JSON.parse(await readFile(resolve(repo,`docs/deepseek-harness-v2/${id}/evidence/figures.json`),'utf8')).map((f:any)=>({...f,dir:resolve(repo,`docs/deepseek-harness-v2/${id}`)}));
 const title=id==='assessment'?'第四模块综合理解测验':'第四模块集中审查 · '+id.toUpperCase();
 const controls=id==='assessment'?`<section class="audit-controls" aria-label="预测练习"><label>选择一道预测题 <select id="predict-question">${questions.filter((q:any)=>q.choice).map((q:any)=>`<option value="${q.id}">${q.id}｜${q.title}</option>`).join('')}</select></label><p id="predict-prompt"></p><label>你的预测 <select id="predict-answer"></select></label><button id="predict-check">核对选项并继续推导</button><p class="audit-feedback" id="predict-feedback" role="status"></p><label>自评分数（不自动判开放题） <input id="self-score" type="number" min="0" max="100" aria-label="自评分数"></label></section>`:'';
 const interactive=id==='assessment'?`const qs=${JSON.stringify(questions.filter((q:any)=>q.choice))};const select=document.getElementById('predict-question'),answer=document.getElementById('predict-answer');function refresh(){const q=qs.find(q=>q.id===Number(select.value));document.getElementById('predict-prompt').textContent=q.prompt;answer.innerHTML='';q.choice.options.forEach((o,i)=>{const e=document.createElement('option');e.value=i;e.textContent=o;answer.append(e)});document.getElementById('predict-feedback').textContent=''}select.addEventListener('change',refresh);document.getElementById('predict-check').addEventListener('click',()=>{const q=qs.find(q=>q.id===Number(select.value));document.getElementById('predict-feedback').textContent=Number(answer.value)===q.choice.correct?'选项相符。请再独立说明过程，再展开详细Rubric。':'此预测与固定实现不符。请对照本题完整前提和折叠推导。'});refresh();`:'';
 const shell=(body:string,js:string,cssLink:boolean)=>`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${cssLink?'<link rel="stylesheet" href="/style.css">':`<style>${css}</style>`}<style>${styles}</style></head><body><main><p class="audit-note">作者私有审查预览 · 实际LessonMarkdown与平台CSS · 未发布，未施测</p><h1>${title}</h1><p>${lesson.meta.estimatedTime}</p>${controls}${body}</main>${js}</body></html>`;
 const rendered=renderToStaticMarkup(<LessonMarkdown body={lesson.body}/>).replace(/<button\b[^>]*class="lesson-copy"[^>]*>.*?<\/button>/g,'');
 let staticHtml=shell(rendered,interactive?`<script>${interactive}</script>`:'',false);
 for(const f of figures)staticHtml=staticHtml.replaceAll(f.rendererPath,`../${id}/${f.image}`);
 await writeFile(resolve(root,`${id==='assessment'?'assessment':id+'-reading'}-preview.html`),staticHtml);
 const entry=`import React from 'react';import {createRoot}from'react-dom/client';import{LessonMarkdown}from${JSON.stringify(resolve(repo,'src/components/LessonMarkdown.tsx').replaceAll('\\','/'))};createRoot(document.getElementById('lesson')).render(<LessonMarkdown body={${JSON.stringify(lesson.body)}}/>);${interactive}`;
 await build({stdin:{contents:entry,resolveDir:repo,loader:'tsx'},bundle:true,platform:'browser',format:'esm',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},outfile:resolve(scratch,id+'.js')});
 datasets.push({id,raw,lesson,figures,path,html:shell('<div id="lesson"></div>',`<script type="module" src="/${id}.js"></script>`,true)});
}
const report:any={rendererSha256:sha(await readFile(resolve(repo,'src/components/LessonMarkdown.tsx'))),cssSha256:sha(await readFile(resolve(repo,'src/index.css'))),viewports:[],figures:[],content:[],manualReview:'Separate manual-review.json; geometry/interaction do not prove comprehension'};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});let server:any;
try{
 const ctx=await browser.newContext({viewport:{width:700,height:1600},deviceScaleFactor:2}),page=await ctx.newPage();
 for(const ds of datasets)for(const f of ds.figures){
  await page.setContent('<html lang="zh-CN"><style>body{margin:0}svg{display:block}</style><body>'+await readFile(resolve(f.dir,f.source),'utf8')+'</body></html>');await page.evaluate(()=>document.fonts.ready);
  const g=await page.evaluate(()=>{const svg=document.querySelector('svg')!,v=svg.viewBox.baseVal,ts=[...svg.querySelectorAll('text')];const out=ts.filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width||b.y+b.height>v.height}).map(t=>t.textContent);const overlaps:any[]=[];for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i].getBBox(),b=ts[j].getBBox();if(Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>1)overlaps.push([ts[i].textContent,ts[j].textContent]);}return {out,overlaps,font:document.fonts.check('28px "Microsoft YaHei"','工具'),minFont:Math.min(...ts.map(t=>parseFloat(getComputedStyle(t).fontSize)))}});
  if(g.out.length||g.overlaps.length||!g.font)throw Error(JSON.stringify({id:f.id,g}));const out=resolve(qa,f.id+'-regenerated.png');await page.locator('svg').screenshot({path:out});const equal=sha(await readFile(out))===sha(await readFile(resolve(f.dir,f.image)));if(!equal)throw Error(f.id+' differs after regeneration');report.figures.push({id:f.id,...g,byteIdentical:true});
 }
 await ctx.close();
 server=createServer(async(req,res)=>{try{const path=new URL(req.url!,'http://127.0.0.1').pathname,ds=datasets.find(d=>path==='/'+d.id);let data:any,type:string;
 if(ds){data=ds.html;type='text/html; charset=utf-8';}else if(path==='/style.css'){data=css;type='text/css';}else if(datasets.some(d=>path==='/'+d.id+'.js')){data=await readFile(resolve(scratch,path.slice(1)));type='text/javascript';}else{const f=datasets.flatMap(d=>d.figures).find(f=>f.rendererPath===path);if(!f){res.writeHead(404);res.end();return;}data=await readFile(resolve(f.dir,f.image));type='image/png';}res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);}catch(e){res.writeHead(500);res.end(String(e));}});
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
 for(const ds of datasets)for(const width of [1440,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:1000},permissions:['clipboard-read','clipboard-write']}),page=await ctx.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}/${ds.id}`);await page.locator('.lesson-prose').waitFor();await page.evaluate(()=>document.fonts.ready);
  for(const i of await page.locator('img').all()){await i.scrollIntoViewIfNeeded();await i.evaluate(i=>(i as HTMLImageElement).decode());}
  const m=await page.evaluate(()=>({documentWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,details:document.querySelectorAll('details').length,images:[...document.querySelectorAll('img')].map(i=>({naturalWidth:i.naturalWidth,alt:i.alt,caption:i.closest('.lesson-figure')?.querySelector('.lesson-caption')?.textContent,width:i.getBoundingClientRect().width}))}));
  if(m.documentWidth>width||m.h1!==1||m.images.some(i=>!i.naturalWidth||!i.alt||!i.caption))throw Error(JSON.stringify({id:ds.id,width,m}));
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:resolve(qa,`${ds.id}-reading-${width}.png`)});
  for(let i=0;i<ds.figures.length;i++){await page.locator('.lesson-figure').nth(i).screenshot({path:resolve(qa,`${ds.figures[i].id}-${width}.png`)});const pop=page.waitForEvent('popup');await page.locator('.lesson-image-expand').nth(i).click();const p=await pop;await p.waitForLoadState();if(!await p.locator('img').evaluate(i=>(i as HTMLImageElement).naturalWidth))throw Error('original image');await p.close();}
  let copies=0,horizontal=0;
  for(const detail of await page.locator('details').all()){
   await detail.locator('summary').focus();await page.keyboard.press('Enter');if(!await detail.evaluate(e=>(e as HTMLDetailsElement).open))throw Error('keyboard open');
   for(const code of await detail.locator('.lesson-code').all()){
    await code.locator('button').click();const actual=(await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),expected=(await code.locator('pre code').textContent())!.replaceAll('\r\n','\n');if(actual!==expected)throw Error('clipboard mismatch '+ds.id);copies++;
    const sc=await code.locator('pre').evaluate(e=>{e.scrollLeft=e.scrollWidth;const value=e.scrollLeft;e.scrollLeft=0;return value;});if(sc>0)horizontal++;
   }
   await detail.locator('summary').focus();await page.keyboard.press('Enter');if(await detail.evaluate(e=>(e as HTMLDetailsElement).open))throw Error('keyboard close');
  }
  if(ds.id==='assessment'){
   if(m.details!==18)throw Error('18 answers required');if(await page.locator('details').evaluateAll(ds=>ds.some(d=>d.textContent?.includes('**'))))throw Error('unrendered Markdown label');for(const q of questions.filter((q:any)=>q.choice)){await page.locator('#predict-question').selectOption(String(q.id));await page.locator('#predict-answer').selectOption(String(q.choice.correct));await page.locator('#predict-check').click();if(!await page.locator('#predict-feedback').innerText().then(s=>s.startsWith('选项相符')))throw Error('prediction control');}
   await page.locator('#self-score').fill('75');if(await page.locator('#self-score').inputValue()!=='75')throw Error('self-score');
   for(const n of ['13','17']){const d=page.locator('details').filter({has:page.locator('summary',{hasText:'第'+n+'题标准答案与评分'})});await d.locator('summary').click();const b=await d.boundingBox();await page.setViewportSize({width,height:Math.max(1000,Math.ceil(b!.height)+100)});await d.evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-8,behavior:'instant'}));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const g=await d.evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom,height:innerHeight}));if(g.top<0||g.bottom>g.height)throw Error('answer clipping');await d.screenshot({path:resolve(qa,`assessment-q${n}-${width}.png`)});await d.locator('summary').click();await page.setViewportSize({width,height:1000});}
  }
  if(errors.length||await page.evaluate(()=>document.documentElement.scrollWidth)>width)throw Error(JSON.stringify(errors));report.viewports.push({id:ds.id,width,status:'PASS',...m,copies,horizontal,originalImages:ds.figures.length});await ctx.close();
 }
 for(const ds of datasets){
  const markers=[...ds.raw.matchAll(/<!-- code:([^:]+):start -->\s*```[^\n]*\n([\s\S]*?)\n```\s*<!-- code:\1:end -->/g)];
  for(const m of markers){const source=(await readFile(resolve(repo,`course-content/internal/deepseek-harness/${ds.id}/lab`,m[1]),'utf8')).replaceAll('\r\n','\n').trimEnd();if(source!==m[2].trimEnd())throw Error('embedded program '+m[1]);}
  report.content.push({id:ds.id,sha256:sha(await readFile(ds.path)),embeddedPrograms:markers.map(m=>m[1]),status:'PASS'});
 }
 await writeFile(resolve(ev,'visual-qa.json'),JSON.stringify({status:'PASS',...report},null,2)+'\n');console.log('PASS 16 byte-identical figures; 15 mounted viewports; 18 answers and prediction controls');
}finally{if(server)await new Promise<void>(r=>server.close(r));await browser.close();}
