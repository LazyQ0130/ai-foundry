import assert from 'node:assert/strict'
import { readFile,readdir,access } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseLessonContent } from '../server/services/lesson-parser.js'
import { LessonMarkdown } from '../src/components/LessonMarkdown.js'
import { allLessons } from '../src/data/courses.js'
import { capstoneShowcase } from '../src/data/capstoneShowcase.js'
const base='course-content/internal/capstone',overlay=base+'/c9/overlay'
const read=(file:string)=>readFile(overlay+'/'+file,'utf8')
const lesson=parseLessonContent(await readFile(base+'/c9/lesson-draft.md','utf8'))
assert.equal(lesson.meta.checkKeys.length,7);assert.equal(lesson.meta.checklist.length,7)
assert.match(lesson.meta.estimatedTime,/180.*240/)
const html=renderToStaticMarkup(createElement(LessonMarkdown,{body:lesson.body}))
assert.equal((html.match(/复制提示词/g)??[]).length,7)
assert.ok(html.includes('把毕业项目真正交付出去'))
const used=new Set<string>()
for(const stage of [1,2,3,4])for(const file of await readdir('course-content/stage-'+stage))if(file.endsWith('.md'))
 for(const key of parseLessonContent(await readFile(`course-content/stage-${stage}/${file}`,'utf8')).meta.checkKeys)used.add(key)
for(const prior of ['c1','c2','c3','c4','c5','c6','c7','c8'])for(const key of parseLessonContent(await readFile(`${base}/${prior}/lesson-draft.md`,'utf8')).meta.checkKeys)used.add(key)
for(const key of lesson.meta.checkKeys){assert.ok(!used.has(key));used.add(key)}
for(const word of ['Production Ready','NOT VERIFIED','Secret','PROCESS_INTERRUPTED','Hard Gate','8/9','lexical_fidelity_flags=1','Internal Authoring'])assert.ok(lesson.body.includes(word),word)
for(const file of ['Dockerfile','.dockerignore','next.config.ts','eslint.config.mjs','package.json','package-lock.json','.env.production.example',
 'app/api/health/route.ts','lib/server-log.ts','lib/research-service.ts','scripts/check-production-env.mjs','scripts/reconcile-stale-runs.mjs',
 'scripts/release-check.mjs','scripts/production-smoke.mjs','scripts/staging-smoke.mjs','scripts/delivery-smoke.mjs',
 'test/production-env.test.ts','test/recovery.integration.mjs','README.md','docs/deployment-decision.md','docs/deployment.md',
 'docs/release-evidence.md','docs/dependency-remediation.md','docs/architecture.md','docs/architecture.mmd','docs/trust-boundary.mmd',
 'docs/demo-script.md','docs/resume-project.md','docs/interview-guide.md','docs/retrospective.md'])await access(overlay+'/'+file)
const docker=await read('Dockerfile');for(const word of ['AS build','AS runtime','AS release','npm ci','npm run build','USER node','PORT','standalone'])assert.ok(docker.includes(word))
assert.ok(!/RUN.*(?:migrate|db push|reset)/.test(docker))
for(const word of ['.env*','.runtime','node_modules','.git','logs'])assert.ok((await read('.dockerignore')).includes(word))
const env=await read('scripts/check-production-env.mjs');for(const word of ['TEST_DATABASE_URL','MCP_ALLOW_LOCAL_HTTP','NEXT_PUBLIC_','1024','32','MUST_BE_INDEPENDENT'])assert.ok(env.includes(word))
const recovery=await read('scripts/reconcile-stale-runs.mjs');for(const word of ['dryRun=true','--apply','600_000','FOR UPDATE','PROCESS_INTERRUPTED','completedAt:{gte:cutoff}'])assert.ok(recovery.includes(word))
assert.ok(!/tx\.(knowledgeNote|researchAction)\.(create|update|delete)/.test(recovery))
const release=await read('scripts/release-check.mjs');for(const word of ['assertEvalDatabase','eval:capstone','--compare-baseline','audit','v.high','v.critical'])assert.ok(release.includes(word))
const smoke=await read('scripts/delivery-smoke.mjs');for(const word of ['publicHttps','480_000','60','sourcePolicy','SIGNED_GET_PASS_ANONYMOUS_DENIED','approvalToken'])assert.ok(smoke.includes(word))
const readme=await read('README.md');for(const word of ['AI 研究工作台','NOT VERIFIED','25/25','8/9','lexical_fidelity_flags','Known Limitations'])assert.ok(readme.includes(word))
const pkg=JSON.parse(await read('package.json')),lock=JSON.parse(await read('package-lock.json'))
assert.equal(pkg.name,lock.name);assert.equal(pkg.name,lock.packages[''].name)
assert.equal(pkg.dependencies.next,'15.5.27');assert.equal(pkg.overrides['deepmerge-ts'],'8.0.2');assert.equal(pkg.overrides.postcss,'8.5.23')
assert.equal(pkg.scripts['eval:capstone'],'tsx eval/runner.mjs')
// Delivery only: all existing domain schema/migrations and product workflows stay inherited.
for(const forbidden of ['prisma','worker','queue','app/api/admin','lib/note-indexer.ts'])await assert.rejects(access(overlay+'/'+forbidden))
assert.equal(allLessons.length,29);assert.equal(capstoneShowcase.status,'暂未解锁')
console.log('PASS: C9 Renderer V2, seven stable unique keys/prompts, delivery artifacts, recovery/env/smoke/release gates and locked 29-lesson boundary')
