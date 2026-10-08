import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {parseLessonContent} from '../server/services/lesson-parser.js'
import {LessonMarkdown} from '../src/components/LessonMarkdown.js'
import {allLessons} from '../src/data/courses.js'
import {capstoneShowcase} from '../src/data/capstoneShowcase.js'
const keys=new Set<string>();let prompts=0,checks=0,min=0,max=0
for(let stage=1;stage<=4;stage++)for(const file of await readdir(`course-content/stage-${stage}`))if(file.endsWith('.md'))for(const key of parseLessonContent(await readFile(`course-content/stage-${stage}/${file}`,'utf8')).meta.checkKeys){assert.ok(!keys.has(key));keys.add(key)}
for(let i=1;i<=9;i++){
 const lesson=parseLessonContent(await readFile(`course-content/internal/capstone/c${i}/lesson-draft.md`,'utf8'))
 const html=renderToStaticMarkup(createElement(LessonMarkdown,{body:lesson.body}))
 const count=(lesson.body.match(/:::prompt/g)??[]).length
 assert.equal((html.match(/复制提示词/g)??[]).length,count)
 assert.ok(count>=3);assert.ok(lesson.meta.objective&&lesson.meta.difficulty)
 assert.equal(lesson.meta.checkKeys.length,lesson.meta.checklist.length)
 for(const key of lesson.meta.checkKeys){assert.ok(!keys.has(key),key);keys.add(key)}
 const duration=lesson.meta.estimatedTime.match(/(\d+)～(\d+)/)!;min+=Number(duration[1]);max+=Number(duration[2]);prompts+=count;checks+=lesson.meta.checkKeys.length
 console.log(`C${i}: Renderer PASS; ${count} copyable prompts; ${lesson.meta.checkKeys.length} unique checks; ${duration[0]} minutes`)
}
assert.equal(allLessons.length,29);assert.equal(capstoneShowcase.status,'暂未解锁')
assert.equal(capstoneShowcase.lessons.length,9)
assert.ok((await readFile('src/pages/CapstoneOverview.tsx','utf8')).includes('九课毕业路线'))
assert.ok((await readFile('course-content/internal/capstone/c1/lesson-draft.md','utf8')).includes('已完成 Stage 1～4'))
assert.equal(min,1080);assert.equal(max,1365)
console.log(`PASS: ${prompts} prompts, ${checks} Capstone checkKeys; ${min}–${max} minutes; locked, Stage=29`)
