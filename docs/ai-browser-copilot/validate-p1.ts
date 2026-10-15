// Author-only checks; intentionally imports no database, seed, auth route or app server.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseLessonContent } from '../../server/services/lesson-parser.js';
import { LessonMarkdown } from '../../src/components/LessonMarkdown.js';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import tailwindConfig from '../../tailwind.config.js';

const root=process.cwd();
const evidence=resolve('docs/ai-browser-copilot/artifacts/p1-20261014');
const preview=resolve('.runtime/p1-author-preview');
await mkdir(preview,{recursive:true});
const lessonFile=resolve('course-content/internal/ai-browser-copilot/p1/lesson.md');
const source=await readFile(lessonFile,'utf8');
const lesson=parseLessonContent(source);
const html=renderToStaticMarkup(createElement(LessonMarkdown,{body:lesson.body}));
assert.equal(lesson.meta.checkKeys.length,8);
assert.equal((html.match(/lesson-code-prompt/g)||[]).length,4);
assert.ok(!html.includes('<h1>'));
assert.ok(!html.includes(':::'));
async function visit(dir:string):Promise<string[]> {
  const entries=await readdir(dir,{withFileTypes:true});
  return (await Promise.all(entries.map(e=> e.isDirectory()?visit(resolve(dir,e.name)):[resolve(dir,e.name)]))).flat();
}
const canonical=(await Promise.all(['stage-1','stage-2','stage-3','stage-4','capstone'].map(d=>visit(resolve('course-content',d))))).flat().filter(f=>f.endsWith('.md'));
for(const file of canonical){const text=await readFile(file,'utf8');for(const key of lesson.meta.checkKeys)assert.ok(!text.includes(key),`Key collision ${file}`);}
const manifests=[];
for(const role of ['starter','reference']){
  const path=resolve('.runtime/p1-clean-online-20261014',role,'.output/chrome-mv3/manifest.json');
  const manifest=JSON.parse(await readFile(path,'utf8'));
  assert.equal(manifest.manifest_version,3);
  assert.deepEqual(manifest.permissions,['sidePanel']);
  assert.ok(!manifest.host_permissions&&!manifest.content_scripts&&!manifest.action.default_popup);
  assert.equal(manifest.side_panel.default_path,'sidepanel.html');
  assert.ok(manifest.background.service_worker);
  assert.match(manifest.content_security_policy.extension_pages,/connect-src 'none'/);
  await writeFile(resolve(evidence,`${role}-production-manifest.json`),JSON.stringify(manifest,null,2));
  manifests.push({role,status:'PASS',manifest});
}
await writeFile(resolve(preview,'lesson.json'),JSON.stringify(lesson));
await build({entryPoints:[resolve('docs/ai-browser-copilot/preview-entry.tsx')],outfile:resolve(preview,'app.js'),bundle:true,platform:'browser',format:'esm',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
const css=await postcss([tailwind({...tailwindConfig,content:[resolve('src/components/LessonMarkdown.tsx'),resolve('src/components/LessonTaskPanel.tsx'),resolve('src/components/ui.tsx'),resolve('docs/ai-browser-copilot/preview-entry.tsx')]})]).process(await readFile(resolve('src/index.css'),'utf8'),{from:resolve('src/index.css')});
await writeFile(resolve(preview,'style.css'),css.css);
await writeFile(resolve(preview,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P1 作者预览 · 未发布</title><link rel="stylesheet" href="/style.css"><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');
await writeFile(resolve(evidence,'lesson-ssr.html'),html);
const report={status:'PASS',time:new Date().toISOString(),lesson:{file:relative(root,lessonFile),tasks:8,prompts:4,canonicalFilesChecked:canonical.length,actualParser:true,actualRenderer:true},manifests,preview:'127.0.0.1 local author-only preview; not a registered production lesson'};
await writeFile(resolve(evidence,'content-and-manifest-check.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({status:'PASS',tasks:8,prompts:4,canonicalFilesChecked:canonical.length,productionPermissions:['sidePanel']}));
