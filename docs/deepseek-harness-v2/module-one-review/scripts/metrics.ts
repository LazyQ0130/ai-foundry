/** 可重算的阅读量统计。文本数量与源码行数不转换成已验证的学习时长。 */
import {readFile,writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import {parseLessonContent} from '../../../../server/services/lesson-parser.js'
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..')
const config=JSON.parse(await readFile(resolve(root,'workload-input.json'),'utf8'))
const source=JSON.parse(await readFile(resolve(root,'evidence/source-check.json'),'utf8'))
const rows=[]
const units=(text:string)=>({han:(text.match(/\p{Script=Han}/gu)??[]).length,latinNumericWords:(text.match(/[A-Za-z0-9]+(?:[._/-][A-Za-z0-9]+)*/g)??[]).length})
for(const h of ['h01','h02','h03','h04']){
 const lesson=parseLessonContent(await readFile(resolve(repo,`course-content/internal/deepseek-harness/${h}/lesson.md`),'utf8'))
 const tree=unified().use(remarkParse).use(remarkGfm).use(remarkDirective).parse(lesson.body)
 const text:string[]=[],visible:string[]=[],code:any[]=[],folds:any[]=[],images:any[]=[]
 function visit(n:any,folded=false){
  const hidden=folded||(n.type==='containerDirective'&&n.name==='deepdive')
  if(n.type==='containerDirective'&&n.name==='deepdive')folds.push(n.attributes?.title)
  if(['text','inlineCode'].includes(n.type)){text.push(n.value);if(!hidden)visible.push(n.value)}
  if(n.type==='code')code.push({lang:n.lang,lines:n.value.split('\n').length,folded:hidden})
  if(n.type==='image')images.push(n.url)
  for(const c of n.children??[])visit(c,hidden)
 }
 visit(tree)
 const ranges=new Map<string,Set<number>>()
 for(const ref of source.references.filter((r:any)=>r.lesson===h)){
  if(!ranges.has(ref.path))ranges.set(ref.path,new Set())
  for(let n=ref.start;n<=ref.end;n++)ranges.get(ref.path)!.add(n)
 }
 const perFile=[...ranges].map(([path,lines])=>({path,lines:lines.size,kind:path.startsWith('docs/')||path.endsWith('.md')?'documentation':path.includes('/tests/')?'test':path.endsWith('.json')||path.endsWith('.yaml')||path.endsWith('.yml')?'configuration':'source'}))
 const c=config[h]
 const coreLines=c.coreRoute.reduce((a:number,r:any)=>a+r.ranges.reduce((b:number,[start,end]:number[])=>b+end-start+1,0),0)
 rows.push({lesson:h,estimatedTime:lesson.meta.estimatedTime,allProse:units(text.join(' ')),defaultVisibleProse:units(visible.join(' ')),codeBlocks:code.length,codeLines:code.reduce((a,c)=>a+c.lines,0),foldedCodeLines:code.filter(c=>c.folded).reduce((a,c)=>a+c.lines,0),folds:folds.length,figures:images.length,concepts:c.concepts,coreConceptCount:c.concepts.length,practiceTasks:c.practiceTasks,thoughtQuestions:c.thoughtQuestions,coreRoute:c.coreRoute,coreRouteLines:coreLines,citedFiles:perFile.length,citedLines:perFile.reduce((a,f)=>a+f.lines,0),citedByKind:perFile,blueprintMinutes:c.blueprintMinutes})
}
await writeFile(resolve(root,'evidence/workload.json'),JSON.stringify({method:'Actual lesson parser; remark text/inlineCode excluding fenced code, Markdown syntax and URL destinations; default prose excludes deepdive descendants. Han characters and Latin/numeric word units reported separately; no claim of Chinese word segmentation. Citation lines unioned per file; core route manually curated separately. Durations are unvalidated author estimates.',rows},null,2)+'\n')
console.log(JSON.stringify(rows.map(({lesson,allProse,defaultVisibleProse,coreRouteLines,citedFiles,citedLines,codeLines})=>({lesson,allProse,defaultVisibleProse,coreRouteLines,citedFiles,citedLines,codeLines}))))
