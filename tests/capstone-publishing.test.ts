import {test} from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import {readFile} from 'node:fs/promises'
import {unzipSync} from 'fflate'
import {app} from '../server/app.js'
import {db} from '../server/db.js'
import {env} from '../server/config/env.js'
import {capstoneLessons} from '../src/data/capstoneLessons.js'
import {curriculumFormalLessonCount} from '../src/data/courses.js'
import {createCapstoneStarterZip,capstoneStarterFiles} from '../scripts/capstone-starter-package.js'
const asset='/api/course-assets/capstone-starter'
const endpoints=['/api/capstone/lessons/c1','/api/capstone/progress',asset,asset+'/info']
const input={source:'TEST',note:'Capstone publishing acceptance'}
const register=async(agent:ReturnType<typeof request.agent>,prefix:string)=> (await agent.post('/api/auth/register').set('Origin',env.APP_ORIGIN).send({phone:prefix+Date.now().toString().slice(-8),password:'Capstone-test-123',acceptedTerms:true}).expect(201)).body.data.user.id as string
const loginAdmin=async()=>{const a=request.agent(app);await a.post('/api/auth/login').set('Origin',env.APP_ORIGIN).send({phone:process.env.ADMIN_PHONE,password:process.env.ADMIN_INITIAL_PASSWORD}).expect(200);return a}

test('Capstone access matrix: anonymous, ordinary, Stage-only, Project Lab, revoked, disabled, explicit admin policy',async()=>{
 const admin=await loginAdmin(),student=request.agent(app),id=await register(student,'132')
 for(const endpoint of endpoints){await request(app).get(endpoint).expect(401);await student.get(endpoint).expect(403);await admin.get(endpoint).expect(403)}
 await request(app).head(asset).expect(401)
 const publicMeta=(await request(app).get('/api/capstone').expect(200)).body.data
 assert.equal(publicMeta.access,false);assert.equal(publicMeta.progress,null);assert.equal(publicMeta.lessons.length,9)
 assert.ok(!JSON.stringify(publicMeta).includes('checkKeys'));assert.ok(!JSON.stringify(publicMeta).includes('contentPath'))
 await admin.post('/api/admin/users/'+id+'/entitlements/all').set('Origin',env.APP_ORIGIN).send(input).expect(200)
 for(const endpoint of endpoints)await student.get(endpoint).expect(403)
 await admin.post('/api/admin/users/'+id+'/products/project-lab').set('Origin',env.APP_ORIGIN).send(input).expect(200)
 for(const endpoint of endpoints){const response=await student.get(endpoint).expect(200);assert.equal(response.headers['cache-control'],'private, no-store')}
 for(const lesson of capstoneLessons){const response=await student.get('/api/capstone/lessons/'+lesson.id).expect(200);assert.deepEqual(response.body.data.content.meta.checkKeys,lesson.checkKeys)}
 for(const invalid of ['c10','unknown','__proto__','%2e%2e%2f.env','%2e%2e%5c.env','c1%2f..%2fc9'])await student.get('/api/capstone/lessons/'+invalid).expect(404)
 const first=capstoneLessons[0];first.published=false;try{await student.get('/api/capstone/lessons/c1').expect(404)}finally{first.published=true}
 const zip=await student.get(asset+'?path=../../.env').buffer(true).parse((res,cb)=>{const chunks:Buffer[]=[];res.on('data',c=>chunks.push(Buffer.from(c)));res.on('end',()=>cb(null,Buffer.concat(chunks)))}).expect(200)
 assert.deepEqual(zip.body,Buffer.from(await createCapstoneStarterZip()))
 assert.deepEqual(Object.keys(unzipSync(zip.body)).sort(),capstoneStarterFiles.map(f=>'aifoundry-capstone-starter/'+f).sort())
 await student.get('/api/lessons/c1').expect(404)
 await admin.delete('/api/admin/users/'+id+'/products/project-lab').set('Origin',env.APP_ORIGIN).send({note:'immediate revoke'}).expect(200)
 for(const endpoint of endpoints)await student.get(endpoint).expect(403)
 await student.put('/api/capstone/progress/lessons/c1/checks/'+first.checkKeys[0]).set('Origin',env.APP_ORIGIN).send({completed:true}).expect(403)
 await admin.post('/api/admin/users/'+id+'/products/project-lab').set('Origin',env.APP_ORIGIN).send(input).expect(200)
 await db.user.update({where:{id},data:{status:'DISABLED'}})
 for(const endpoint of endpoints)await student.get(endpoint).expect(401)
 // Admin receives no role bypass, but explicit Project Lab entitlement works.
 const adminId=(await admin.get('/api/me').expect(200)).body.data.id
 await admin.post('/api/admin/users/'+adminId+'/products/project-lab').set('Origin',env.APP_ORIGIN).send(input).expect(200)
 try{for(const endpoint of endpoints)await admin.get(endpoint).expect(200)}finally{await admin.delete('/api/admin/users/'+adminId+'/products/project-lab').set('Origin',env.APP_ORIGIN).send({note:'restore admin policy'}).expect(200)}
})

test('Capstone independent durable progress: 0/9 -> 1/9 -> 9/9; trusted checklist, isolation, undo and Stage regression',async()=>{
 const admin=await loginAdmin(),student=request.agent(app),other=request.agent(app),id=await register(student,'131'),otherId=await register(other,'130')
 for(const userId of [id,otherId])await admin.post('/api/admin/users/'+userId+'/entitlements/projects').set('Origin',env.APP_ORIGIN).send(input).expect(200)
 let progress=(await student.get('/api/capstone/progress').expect(200)).body.data
 assert.equal(progress.completed,0);assert.equal(progress.total,9);assert.equal(progress.continueLessonId,'c1');assert.equal(curriculumFormalLessonCount(),29)
 await student.post('/api/capstone/progress/lessons/c1/visit').set('Origin',env.APP_ORIGIN).send({}).expect(200)
 // Completion is explicit and requires every trusted checklist item first.
 await student.post('/api/capstone/progress/lessons/c1/complete').set('Origin',env.APP_ORIGIN).send({}).expect(400)
 for(const invalid of ['check-arbitrary',capstoneLessons[1].checkKeys[0]])await student.put('/api/capstone/progress/lessons/c1/checks/'+invalid).set('Origin',env.APP_ORIGIN).send({completed:true}).expect(400)
 await student.put('/api/capstone/progress/lessons/c1/checks/'+capstoneLessons[0].checkKeys[0]).set('Origin',env.APP_ORIGIN).send({completed:true,userId:otherId}).expect(400)
 for(const lesson of capstoneLessons){for(const key of lesson.checkKeys)await student.put('/api/capstone/progress/lessons/'+lesson.id+'/checks/'+key).set('Origin',env.APP_ORIGIN).send({completed:true}).expect(200)
  assert.equal((await student.get('/api/capstone/progress').expect(200)).body.data.completed,lesson.order-1)
  await student.post('/api/capstone/progress/lessons/'+lesson.id+'/complete').set('Origin',env.APP_ORIGIN).send({}).expect(200)
  progress=(await student.get('/api/capstone/progress').expect(200)).body.data;assert.equal(progress.completed,lesson.order);assert.equal(progress.continueLessonId,lesson.order===9?null:'c'+(lesson.order+1))}
 const stage=(await student.get('/api/progress').expect(200)).body.data
 assert.deepEqual(stage.formalProgress,{completed:0,total:29});assert.equal(stage.completedLessons.length,0)
 assert.equal((await other.get('/api/capstone/progress').expect(200)).body.data.completed,0)
 const newSession=request.agent(app),user=await db.user.findUniqueOrThrow({where:{id}})
 await newSession.post('/api/auth/login').set('Origin',env.APP_ORIGIN).send({phone:user.phone,password:'Capstone-test-123'}).expect(200)
 assert.equal((await newSession.get('/api/capstone/progress').expect(200)).body.data.completed,9)
 await student.put('/api/capstone/progress/lessons/c1/checks/'+capstoneLessons[0].checkKeys[0]).set('Origin',env.APP_ORIGIN).send({completed:false}).expect(200)
 // Same as Stage lessons: unticking a task after completion keeps the confirmed completion.
 progress=(await student.get('/api/capstone/progress').expect(200)).body.data;assert.equal(progress.completed,9);assert.equal(progress.continueLessonId,null);assert.equal(progress.checks.c1[capstoneLessons[0].checkKeys[0]],false)
 assert.equal((await db.capstoneLessonProgress.findUniqueOrThrow({where:{userId_lessonId:{userId:id,lessonId:'c1'}}})).status,'COMPLETED')
})

test('Capstone real HTTP login -> catalogue -> C1 -> progress -> Starter, revoke next request',async()=>{
 const admin=await loginAdmin(),student=request.agent(app),id=await register(student,'139')
 await admin.post('/api/admin/users/'+id+'/products/project-lab').set('Origin',env.APP_ORIGIN).send(input).expect(200)
 const user=await db.user.findUniqueOrThrow({where:{id}}),server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve))
 try{
  const address=server.address() as {port:number},base='http://127.0.0.1:'+address.port
  const signed=await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:env.APP_ORIGIN,'content-type':'application/json'},body:JSON.stringify({phone:user.phone,password:'Capstone-test-123'})});assert.equal(signed.status,200)
  const cookie=signed.headers.get('set-cookie')!.split(';')[0]
  for(const endpoint of ['/api/capstone',...endpoints]){const result=await fetch(base+endpoint,{headers:{cookie}});assert.equal(result.status,200);await result.arrayBuffer()}
  const noAccess=await fetch(base+'/api/capstone/lessons/c1');assert.equal(noAccess.status,401)
  await admin.delete('/api/admin/users/'+id+'/products/project-lab').set('Origin',env.APP_ORIGIN).send({note:'HTTP revoke'}).expect(200)
  for(const endpoint of endpoints){const result=await fetch(base+endpoint,{headers:{cookie}});assert.equal(result.status,403);await result.arrayBuffer()}
 }finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()))}
})

test('nine reviewed protected bodies and fixed bootstrap archive contain no completed author answers',async()=>{
 assert.equal(capstoneLessons.length,9);assert.equal(new Set(capstoneLessons.flatMap(l=>l.checkKeys)).size,61)
 for(const lesson of capstoneLessons)assert.ok((await readFile(lesson.contentPath)).equals(await readFile('course-content/internal/capstone/'+lesson.id+'/lesson-draft.md')))
 const files=Object.keys(unzipSync(await createCapstoneStarterZip()))
 assert.ok(files.every(name=>capstoneStarterFiles.some(file=>name==='aifoundry-capstone-starter/'+file)))
 assert.ok(!files.some(name=>/overlay|reference|validation|audit|runtime|gold|docs\/(product-brief|user-flow|architecture-decision)\.md/.test(name)))
})
