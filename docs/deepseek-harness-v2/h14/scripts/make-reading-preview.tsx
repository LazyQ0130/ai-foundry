/** 私有静态审阅页：实际 SSR；保留原生折叠，明确移除无水合的复制按钮。 */
import React from 'react'
import { readFile,writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import config from '../../../../tailwind.config.js'
import { parseLessonContent } from '../../../../server/services/lesson-parser.js'
import { LessonMarkdown } from '../../../../src/components/LessonMarkdown.js'
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..')
const lesson=parseLessonContent((await readFile(resolve(repo,'course-content/internal/deepseek-harness/h14/lesson.md'),'utf8')).replaceAll('\r\n','\n'))
let article=renderToStaticMarkup(<LessonMarkdown body={lesson.body}/>)
const figures=JSON.parse(await readFile(resolve(root,'evidence/figures.json'),'utf8'))
for(const f of figures)article=article.replaceAll(f.rendererPath,f.image)
article=article.replace(/<button[^>]*class="lesson-copy"[^>]*>[\s\S]*?<\/button>/g,'<span>静态预览：可选择代码复制</span>')
const css=await postcss([tailwindcss({...config,content:[resolve(repo,'src/**/*.{ts,tsx}')]})]).process(await readFile(resolve(repo,'src/index.css'),'utf8'),{from:resolve(repo,'src/index.css')})
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>H14｜工具执行流水线：从模型调用到结果返回</title><style>${css.css}\nbody{font-family:"Microsoft YaHei",sans-serif;background:white}main{max-width:808px;padding:24px;margin:auto}.preview-note{font-size:13px;color:#64748b;background:#f1f5f9;padding:12px}@media(max-width:639px){main{padding:16px}}</style></head><body><main><p class="preview-note">H14 作者审阅页 · 未发布。实际 LessonMarkdown 的静态渲染，折叠答案可展开；课程版本的复制交互已另经 React 挂载测试。图片在本页映射为相邻文件，不改变教材的 /course-media 路径。</p><header class="lesson-header"><h1 class="lesson-title">工具执行流水线：从模型调用到结果返回</h1><p>${lesson.meta.estimatedTime}</p></header>${article}</main></body></html>`
await writeFile(resolve(root,'reading-preview.html'),html)
console.log('Private static reading preview generated; no product routes or public files')
