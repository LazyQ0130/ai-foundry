import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {capstoneLessons} from '../src/data/capstoneLessons.js'
import {capstoneShowcase} from '../src/data/capstoneShowcase.js'
import {allLessons,curriculumFormalLessonCount} from '../src/data/courses.js'
import {parseLessonContent} from '../server/services/lesson-parser.js'
import {createCapstoneStarterZip,capstoneStarterFiles} from './capstone-starter-package.js'
import {unzipSync} from 'fflate'
assert.equal(curriculumFormalLessonCount(),29);assert.equal(allLessons.length,29);assert.equal(capstoneLessons.length,9)
assert.deepEqual((await readdir('course-content/capstone')).sort(),capstoneLessons.map(l=>l.id+'.md').sort())
const keys=new Set<string>();for(const lesson of capstoneLessons){
 assert.equal(lesson.contentPath,'course-content/capstone/'+lesson.id+'.md');assert.equal(lesson.order,Number(lesson.id.substring(1)))
 const actual=await readFile(lesson.contentPath),reviewed=await readFile('course-content/internal/capstone/'+lesson.id+'/lesson-draft.md')
 assert.ok(actual.equals(reviewed),'Student content must match reviewed draft '+lesson.id)
 const parsed=parseLessonContent(actual.toString());assert.deepEqual(parsed.meta.checkKeys,lesson.checkKeys)
 for(const key of lesson.checkKeys){assert.ok(!keys.has(key));keys.add(key)}
}
assert.equal(keys.size,61)
const zip=unzipSync(await createCapstoneStarterZip());assert.equal(Object.keys(zip).length,capstoneStarterFiles.length)
assert.ok(!Object.keys(zip).some(p=>/overlay|reference|validation|audit|runtime|eval|docs\/(product-brief|user-flow|architecture-decision)\.md/.test(p)))
assert.ok(['暂未解锁','已开放'].includes(capstoneShowcase.status))
assert.ok(!capstoneShowcase.deliverables.includes('Production Product' as never)||String(capstoneShowcase.status)==='暂未解锁')
console.log('PASS: Publishing catalogue 9; Stage 29; 61 stable keys; reviewed content parity; exact Starter whitelist; status '+capstoneShowcase.status)
