// Exact existing parser/components, no database or production catalogue imports.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseLessonContent } from '../../../server/services/lesson-parser';
import { LessonMarkdown } from '../../../src/components/LessonMarkdown';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import tailwindConfig from '../../../tailwind.config';

const evidence = resolve('docs/ai-browser-copilot/p2/artifacts/content');
const preview = resolve('.runtime/p2-author-preview');
await mkdir(evidence, { recursive: true }); await mkdir(preview, { recursive: true });
const source = await readFile('course-content/internal/ai-browser-copilot/p2/lesson.md', 'utf8');
const lesson = parseLessonContent(source);
const html = renderToStaticMarkup(createElement(LessonMarkdown, { body: lesson.body }));
assert.equal(lesson.meta.checkKeys.length, 10);
assert.equal((html.match(/lesson-code-prompt/g) ?? []).length, 5);
assert.ok(!html.includes('<h1>') && !html.includes(':::'));
assert.ok(!source.includes('resource:') && !source.includes('dangerouslySetInnerHTML='));
async function visit(dir: string): Promise<string[]> {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(e => e.isDirectory() ? visit(resolve(dir, e.name)) : [resolve(dir, e.name)]))).flat();
}
const canonical = (await Promise.all(['stage-1','stage-2','stage-3','stage-4','capstone'].map(name => visit(resolve('course-content', name))))).flat().filter(name => name.endsWith('.md'));
canonical.push(resolve('course-content/internal/ai-browser-copilot/p1/lesson.md'));
for (const file of canonical) {
  const text = await readFile(file, 'utf8');
  for (const key of lesson.meta.checkKeys) assert.ok(!text.includes(key), `Existing task collision ${file}`);
}
await writeFile(resolve(preview, 'lesson.json'), JSON.stringify(lesson));
await build({ entryPoints: [resolve('docs/ai-browser-copilot/p2/preview-entry.tsx')], outfile: resolve(preview,'app.js'), bundle: true, platform:'browser', format:'esm', jsx:'automatic', define:{'process.env.NODE_ENV':'"production"'}, logLevel:'warning' });
const css = await postcss([tailwind({ ...tailwindConfig, content: ['src/components/LessonMarkdown.tsx','src/components/LessonTaskPanel.tsx','src/components/ui.tsx','docs/ai-browser-copilot/p2/preview-entry.tsx'].map(f => resolve(f)) })]).process(await readFile('src/index.css','utf8'), { from: resolve('src/index.css') });
await writeFile(resolve(preview,'style.css'), css.css);
await writeFile(resolve(preview,'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P2 作者预览 · 未发布</title><link rel="stylesheet" href="/style.css"><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');
await writeFile(resolve(evidence,'lesson-ssr.html'), html);
const report = { status:'PASS', time:new Date().toISOString(), tasks:10, prompts:5, existingFilesChecked:canonical.length, actualParser:true, actualRenderer:true, platformPersistence:'not exercised; private preview only' };
await writeFile(resolve(evidence,'parser-renderer.json'), JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
