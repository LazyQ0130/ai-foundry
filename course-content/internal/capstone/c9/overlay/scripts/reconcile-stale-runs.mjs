import { PrismaClient } from '@prisma/client'
import { pathToFileURL } from 'node:url'

export async function reconcileStaleRuns(db,{dryRun=true,thresholdMs=600_000,now=new Date()}={}) {
 if(!Number.isSafeInteger(thresholdMs)||thresholdMs<300_000)throw Error('INVALID_RECOVERY_THRESHOLD')
 const cutoff=new Date(now.getTime()-thresholdMs)
 const ids=await db.researchRun.findMany({where:{status:'RUNNING',startedAt:{lt:cutoff}},select:{id:true}})
 let eligible=0,applied=0,steps=0
 for(const {id} of ids)await db.$transaction(async tx=>{
  // Match the workflow's completion lock. Recheck eligibility after taking it.
  const rows=await tx.$queryRaw`SELECT "status", "startedAt" FROM "ResearchRun" WHERE "id"=${id} FOR UPDATE`
  if(rows[0]?.status!=='RUNNING'||rows[0].startedAt>=cutoff)return
  const latest=await tx.researchStep.findFirst({where:{runId:id},orderBy:{startedAt:'desc'},select:{startedAt:true,completedAt:true}})
  // Any recent activity protects a run, including a recent completion of an older step.
  const recent=await tx.researchStep.count({where:{runId:id,OR:[{startedAt:{gte:cutoff}},{completedAt:{gte:cutoff}}]}})
  if(recent||latest?.startedAt>=cutoff)return
  eligible++
  if(dryRun)return
  const changed=await tx.researchStep.updateMany({where:{runId:id,status:'RUNNING'},data:{status:'FAILED',errorCode:'PROCESS_INTERRUPTED',completedAt:now}})
  await tx.researchRun.update({where:{id},data:{status:'FAILED',errorCode:'PROCESS_INTERRUPTED',stopReason:'PROCESS_INTERRUPTED',completedAt:now}})
  applied++;steps+=changed.count
  // No Action or KnowledgeNote mutation. Never resume unknown provider execution.
 })
 return {dryRun,eligible,applied,steps}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const args=process.argv.slice(2)
 if(args.some(a=>!['--dry-run','--apply'].includes(a))||args.includes('--dry-run')&&args.includes('--apply'))throw Error('Use --dry-run or --apply')
 const db=new PrismaClient()
 try{console.log(JSON.stringify(await reconcileStaleRuns(db,{dryRun:!args.includes('--apply')})))}
 catch{console.error('RECOVERY_FAILED');process.exitCode=1}
 finally{await db.$disconnect()}
}
