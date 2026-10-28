/** Author-only SSR fixture. Does not mount any product route or mutate content metadata. */
import React from 'react'
import {readFile,writeFile} from 'node:fs/promises'
import {renderToStaticMarkup} from 'react-dom/server'
import {LessonMarkdown} from '../../../src/components/LessonMarkdown.js'
import {validateLessonMarkdown} from '../../../src/lib/lessonMarkdown.js'
const root=new URL('../',import.meta.url)
const plan=JSON.parse(await readFile(new URL('evidence/figure-plan.json',root),'utf8'))
for(const f of plan.filter((x:{status:string})=>x.status==='GENERATED_SAMPLE')) {
 const body=`## ${f.title}

这是作者侧 Renderer V2 图片兼容检查夹具，不是正式课文。

![${f.alt}](/course-media/harness-v2/${f.id.toLowerCase()}.png "${f.caption}")

:::concept{title="先分清事实与示意"}
图中的默认主线以固定 Commit 为准；省略分支须回到源码核对。
:::

:::deepdive{title="核对参考答案"}
原始日志与模型可见投影不同；工具提议仍需宿主执行。
:::
`
 validateLessonMarkdown(body)
 const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+f.title+'</title><link rel="stylesheet" href="/styles.css"><style>body{margin:0;background:#fff;font-family:Microsoft YaHei,Arial,sans-serif}main{max-width:760px;padding:24px;margin:auto}h1{font-size:24px;line-height:1.5}img{display:block}button{font:inherit}@media(max-width:400px){main{padding:16px}}</style></head><body><main><h1>'+f.lesson+' · 教学配图检查</h1>'+renderToStaticMarkup(<LessonMarkdown body={body}/>)+'</main></body></html>'
 await writeFile(new URL(`figures/qa/${f.id.toLowerCase()}.html`,root),html)
}
console.log('4 real LessonMarkdown SSR fixtures generated; no platform registration')
