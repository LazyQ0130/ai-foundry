import assert from 'node:assert/strict'
import {readFile,readdir} from 'node:fs/promises'
import {capstoneLessons} from '../server/data/capstoneLessons.js'
import {capstoneShowcase} from '../server/data/capstoneShowcase.js'
import {allLessons,curriculumFormalLessonCount} from '../server/data/courses.js'
import {parseLessonContent} from '../server/services/lesson-parser.js'
import {createCapstoneStarterZip,capstoneStarterFiles} from './capstone-starter-package.js'
import {unzipSync} from 'fflate'
import {parse as parseYaml} from 'yaml'
import {parseEnv} from 'node:util'
assert.equal(curriculumFormalLessonCount(),29);assert.equal(allLessons.length,29);assert.equal(capstoneLessons.length,9)
assert.deepEqual((await readdir('course-content/capstone')).sort(),capstoneLessons.map(l=>l.id+'.md').sort())
const keys=new Set<string>();for(const lesson of capstoneLessons){
 assert.equal(lesson.contentPath,'course-content/capstone/'+lesson.id+'.md');assert.equal(lesson.order,Number(lesson.id.substring(1)))
 const actual=await readFile(lesson.contentPath),reviewed=await readFile('course-content/internal/capstone/'+lesson.id+'/lesson-draft.md')
 assert.ok(actual.equals(reviewed),'Student content must match reviewed draft '+lesson.id)
 const parsed=parseLessonContent(actual.toString());assert.deepEqual(parsed.meta.checkKeys,lesson.checkKeys)
 assert.equal(parsed.meta.estimatedTime,lesson.estimatedTime,'Catalogue duration drift '+lesson.id)
 assert.doesNotMatch(parsed.body,/Internal Authoring|Capstone 暂未解锁|capstone-v1 tag|Final Capstone Release Readiness Audit|继续保持Internal/,'Author release workflow leaked into '+lesson.id)
 assert.doesNotMatch(parsed.body,/可靠性补充：/,'Detached author addendum in '+lesson.id)
 for(const key of lesson.checkKeys){assert.ok(!keys.has(key));keys.add(key)}
}
assert.equal(keys.size,61)
assert.deepEqual(capstoneShowcase.lessons.map(lesson=>({id:lesson.code.toLowerCase(),title:lesson.title})),capstoneLessons.map(({id,title})=>({id,title})),'Showcase lesson title/order drift')
const zip=unzipSync(await createCapstoneStarterZip());assert.equal(Object.keys(zip).length,capstoneStarterFiles.length)
assert.deepEqual(Object.keys(zip).sort(),capstoneStarterFiles.map(p=>'aifoundry-capstone-starter/'+p).sort())
// This reviewed SQL only creates the isolated optional real-eval database;
// finished eval datasets/runners and author answers must stay out of the starter.
assert.ok(!Object.keys(zip).filter(p=>p!=='aifoundry-capstone-starter/infra/eval-init.sql').some(p=>/overlay|reference|validation|audit|runtime|eval|docs\/(product-brief|user-flow|architecture-decision)\.md/.test(p)))
for(const file of ['compose.yaml','docs/local-environment.md','infra/garage.toml','infra/cors.json','scripts/init-local-env.mjs','scripts/check-local-storage.mjs'])assert.ok(zip['aifoundry-capstone-starter/'+file],'Missing local setup '+file)
const starterText=(file:string)=>Buffer.from(zip['aifoundry-capstone-starter/'+file]).toString('utf8')
const compose=parseYaml(starterText('compose.yaml')),example=parseEnv(starterText('.env.example'))
const requiredEnv=(name:string)=>{const value=example[name];assert.ok(value,'Missing example variable '+name);return value}
assert.equal(compose.services.db.image,compose.services['eval-db'].image)
assert.deepEqual(compose.services.db.ports,['127.0.0.1:55439:5432'])
assert.deepEqual(compose.services['eval-db'].ports,['127.0.0.1:55440:5432'])
assert.deepEqual(compose.services.garage.ports,['127.0.0.1:3900:3900'])
assert.deepEqual(compose.services.garage.command,['/garage','server','--single-node','--default-bucket'])
const devUrl=new URL(requiredEnv('DATABASE_URL')),testUrl=new URL(requiredEnv('TEST_DATABASE_URL'))
assert.equal(devUrl.port,'55439');assert.equal(devUrl.pathname,'/capstone')
assert.equal(testUrl.port,'55440');assert.equal(testUrl.pathname,'/capstone_c8_eval');assert.equal(testUrl.searchParams.get('schema'),'public')
assert.equal(example.S3_ENDPOINT,'http://127.0.0.1:3900');assert.equal(example.S3_BUCKET,compose.services.garage.environment.GARAGE_DEFAULT_BUCKET)
const cors=JSON.parse(starterText('infra/cors.json'))
assert.ok(cors.CORSRules.some((rule:{AllowedOrigins:string[]})=>rule.AllowedOrigins.includes(requiredEnv('C3_APP_ORIGIN'))))
assert.ok(starterText('docs/local-environment.md').includes('stop db eval-db garage'),'Stop guide must include profiled services')
const preview=await readFile('src/data/previews/c1.md','utf8'),c1=parseLessonContent(await readFile(capstoneLessons[0].contentPath,'utf8')).body
assert.ok(c1.replace(/\r\n/g,'\n').includes(preview.replace(/\r\n/g,'\n').trim()),'C1 preview must be an exact excerpt of the published lesson')
assert.ok(['暂未解锁','已开放'].includes(capstoneShowcase.status))
if(capstoneLessons.every(lesson=>lesson.published))assert.equal(capstoneShowcase.status,'已开放','Published lessons and showcase status disagree')
assert.ok(!capstoneShowcase.deliverables.includes('Production Product' as never)||String(capstoneShowcase.status)==='暂未解锁')
console.log('PASS: Publishing catalogue 9; Stage 29; 61 stable keys; reviewed content parity; exact Starter whitelist; status '+capstoneShowcase.status)
