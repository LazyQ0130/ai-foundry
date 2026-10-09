import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db.js'
import { ApiError } from '../middleware/error.js'
import { capstoneLessons } from '../../src/data/capstoneLessons.js'
import { getCapstoneContent, requireCapstoneAccess, requireCapstoneLesson } from '../services/capstone-content.js'
import { getCapstoneProgress } from '../services/capstone-progress.js'
export const capstoneRoutes = Router()
capstoneRoutes.use((_req,res,next)=>{res.setHeader('Cache-Control','private, no-store');next()})
capstoneRoutes.get('/',async(req,res)=>{
  const userId=req.user?.id
  let access=false
  try {await requireCapstoneAccess(userId);access=true} catch(error) {if(!(error instanceof ApiError))throw error}
  res.json({data:{access,lessons:capstoneLessons.filter(l=>l.published).map(({id,title,order,estimatedTime})=>({id,title,order,estimatedTime})),progress:access?await getCapstoneProgress(userId!):null}})
})
capstoneRoutes.get('/lessons/:lessonId',async(req,res)=>res.json({data:await getCapstoneContent(req.params.lessonId,req.user?.id)}))
capstoneRoutes.get('/progress',async(req,res)=>{await requireCapstoneAccess(req.user?.id);res.json({data:await getCapstoneProgress(req.user!.id)})})
for(const action of ['visit','check','complete'] as const){
  const handler=async(req:import('express').Request,res:import('express').Response)=>{
    const lesson=requireCapstoneLesson(String(req.params.lessonId)),userId=req.user?.id
    await requireCapstoneAccess(userId)
    const check=action==='check'?{checkKey:String(req.params.checkKey),...z.object({completed:z.boolean()}).strict().parse(req.body)}:null
    if(check&&!lesson.checkKeys.includes(check.checkKey))throw new ApiError(400,'VALIDATION_ERROR','任务项不属于当前课程')
    if(action!=='check')z.object({}).strict().parse(req.body??{})
    await db.$transaction(async tx=>{
      // Same user-row lock used by entitlement revoke/disable.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId!} FOR UPDATE`
      await requireCapstoneAccess(userId,tx)
      if(check)await tx.capstoneCheck.upsert({where:{userId_lessonId_checkKey:{userId:userId!,lessonId:lesson.id,checkKey:check.checkKey}},create:{userId:userId!,lessonId:lesson.id,...check},update:{completed:check.completed}})
      // Ticking tasks never completes a lesson; like Stage lessons, the learner confirms completion explicitly.
      await tx.capstoneLessonProgress.upsert({where:{userId_lessonId:{userId:userId!,lessonId:lesson.id}},create:{userId:userId!,lessonId:lesson.id,status:'IN_PROGRESS'},update:{lastVisitedAt:new Date()}})
      if(action==='complete'){
        const checked=await tx.capstoneCheck.findMany({where:{userId:userId!,lessonId:lesson.id,completed:true}})
        if(!lesson.checkKeys.every(key=>checked.some(row=>row.checkKey===key)))throw new ApiError(400,'VALIDATION_ERROR','请先完成并勾选全部学习任务')
        await tx.capstoneLessonProgress.updateMany({where:{userId:userId!,lessonId:lesson.id,status:'IN_PROGRESS'},data:{status:'COMPLETED',completedAt:new Date()}})
      }
    },{maxWait:10000,timeout:20000})
    res.json({data:await getCapstoneProgress(userId!)})
  }
  if(action==='check')capstoneRoutes.put('/progress/lessons/:lessonId/checks/:checkKey',handler)
  else capstoneRoutes.post('/progress/lessons/:lessonId/'+action,handler)
}
