import test from 'node:test'
import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'
import { reconcileStaleRuns } from '../scripts/reconcile-stale-runs.mjs'
test('stale recovery: dry run, fresh activity, completed/proposal preservation, concurrency and idempotency',async()=>{
 const u=new URL(process.env.TEST_DATABASE_URL??'http://invalid')
 assert.equal(process.env.DATABASE_URL,process.env.TEST_DATABASE_URL)
 assert.equal(u.hostname,'127.0.0.1');assert.equal(u.port,'55441');assert.equal(u.pathname,'/capstone_c9_test')
 assert.notEqual(process.env.NODE_ENV,'production')
 const db=new PrismaClient(), now=new Date(),old=new Date(now.getTime()-900_000),fresh=new Date(now.getTime()-10_000)
 try{
 const user=await db.user.create({data:{username:'c9_recovery_'+Date.now().toString(36),passwordHash:'synthetic-not-login',workspace:{create:{name:'Recovery synthetic'}}},include:{workspace:true}})
 const task=await db.researchTask.create({data:{workspaceId:user.workspace.id,title:'[SMOKE] recovery',query:'Synthetic'}})
 const run=async(status,startedAt)=>db.researchRun.create({data:{taskId:task.id,status,startedAt}})
 const stale=await run('RUNNING',old),freshRun=await run('RUNNING',fresh),completed=await run('COMPLETED',old),recent=await run('RUNNING',old)
 await db.researchStep.create({data:{runId:stale.id,position:1,kind:'MODEL',startedAt:old}})
 await db.researchStep.create({data:{runId:recent.id,position:1,kind:'TOOL',startedAt:old,completedAt:fresh,status:'COMPLETED'}})
 const action=await db.researchAction.create({data:{runId:stale.id,canonicalArgs:'synthetic',idempotencyKey:'recovery-'+stale.id}})
 const notesBefore=await db.knowledgeNote.count()
 const preview=await reconcileStaleRuns(db,{now});assert.ok(preview.eligible>=1);assert.equal(preview.applied,0)
 assert.equal((await db.researchRun.findUnique({where:{id:stale.id}})).status,'RUNNING')
 await Promise.all([reconcileStaleRuns(db,{now,dryRun:false}),reconcileStaleRuns(db,{now,dryRun:false})])
 const interrupted=await db.researchRun.findUnique({where:{id:stale.id}});assert.equal(interrupted.status,'FAILED');assert.equal(interrupted.errorCode,'PROCESS_INTERRUPTED')
 assert.equal((await db.researchStep.findFirst({where:{runId:stale.id}})).errorCode,'PROCESS_INTERRUPTED')
 for(const id of [freshRun.id,recent.id])assert.equal((await db.researchRun.findUnique({where:{id}})).status,'RUNNING')
 assert.equal((await db.researchRun.findUnique({where:{id:completed.id}})).status,'COMPLETED')
 assert.equal((await db.researchAction.findUnique({where:{id:action.id}})).status,'PROPOSED')
 assert.equal(await db.knowledgeNote.count(),notesBefore)
 assert.equal((await reconcileStaleRuns(db,{now,dryRun:false})).applied,0)
 console.log('PASS: recovery database invariants; synthetic fixtures retained for inspection')
 }finally{await db.$disconnect()}
})
