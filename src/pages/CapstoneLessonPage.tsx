import {lazy,Suspense,useEffect,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {ArrowRight} from 'lucide-react'
import {useAuth} from '../auth/AuthProvider.js'
import {api,errorMessage} from '../lib/api.js'
import {useCapstone} from '../data/capstoneProgress.js'
import {capstoneLessons} from '../data/capstoneLessons.js'
import type {LessonContent} from '../data/lessonContent.js'
import {LessonLayout} from '../components/LessonLayout.js'
import {CapstoneSidebar,CapstoneLessonHeader,CapstoneLessonNavigation} from '../components/CapstoneLearning.js'
import {LessonProgressStrip,LessonTaskCard} from '../components/LessonTaskPanel.js'
const LessonMarkdown=lazy(()=>import('../components/LessonMarkdown.js').then(m=>({default:m.LessonMarkdown})))
export default function CapstoneLessonPage(){
 const {lessonId=''}=useParams(),{user}=useAuth(),lab=useCapstone()
 const [loaded,setLoaded]=useState<{id:string;owner:string;content:LessonContent}|null>(null),[error,setError]=useState('')
 useEffect(()=>{let active=true;const controller=new AbortController();const load=()=>{setLoaded(null);setError('');void api<{content:LessonContent}>('/capstone/lessons/'+encodeURIComponent(lessonId),{signal:controller.signal}).then(data=>{if(active)setLoaded({id:lessonId,owner:user?.id??'',content:data.content})}).catch(e=>{if(active)setError(errorMessage(e))})};load();window.addEventListener('focus',load);return()=>{active=false;controller.abort();window.removeEventListener('focus',load)}},[lessonId,user?.id])
 const meta=capstoneLessons.find(l=>l.id===lessonId),content=loaded?.id===lessonId&&loaded.owner===(user?.id??'')?loaded.content:null
 if(error||lab.error)return <div className="shell py-16" role="alert"><p>{error||lab.error}</p><Link className="btn btn-outline mt-5" to="/capstone">返回项目工坊</Link><Link className="btn btn-primary ml-3" to="/pricing">查看项目版</Link></div>
 if(!content||lab.loading)return <p className="shell py-16" role="status">正在加载项目工坊…</p>
 if(!lab.data?.access)return <div className="shell py-16">需要项目工坊权益。<Link to="/pricing">查看项目版</Link></div>
 if(!meta)return <div className="shell py-16">没有找到这节课。<Link to="/capstone">返回项目工坊</Link></div>
 const progress=lab.data.progress
 const checked=content.meta.checkKeys.map(key=>progress?.checks[lessonId]?.[key]??false),done=progress?.completedLessons.includes(lessonId)??false
 const next=capstoneLessons[capstoneLessons.findIndex(l=>l.id===lessonId)+1]
 const workbench=<div className="space-y-4">
   <LessonProgressStrip to="/capstone" label="项目工坊 · 毕业项目进度" completed={progress?.completed??0} total={progress?.total??9}/>
   {lab.saving&&<p role="status" className="text-xs text-slate-500">正在保存…</p>}
   <LessonTaskCard items={content.meta.checklist} checked={checked} disabled={false} saving={lab.saving} done={done} onToggle={i=>void lab.setCheck(lessonId,content.meta.checkKeys[i],!checked[i])} onComplete={()=>void lab.completeLesson(lessonId)}/>
   {done&&next&&<Link to={'/capstone/lessons/'+next.id} className="btn btn-md btn-outline w-full">进入下一课：{next.id.toUpperCase()}<ArrowRight className="h-4 w-4"/></Link>}
 </div>
 return <LessonLayout remainingTasks={content.meta.checkKeys.filter(key=>!progress?.checks[lessonId]?.[key]).length} sidebar={close=><CapstoneSidebar currentLessonId={lessonId} progress={progress} onNavigate={close}/>} workbench={workbench}>
   <article className="lesson-article mx-auto w-full min-w-0 max-w-[740px]">
     <CapstoneLessonHeader lesson={meta} objective={content.meta.objective}/>
     <Suspense fallback={<p role="status">正在排版课程…</p>}><LessonMarkdown body={content.body}/></Suspense>
     <CapstoneLessonNavigation lessonId={lessonId}/>
   </article>
 </LessonLayout>
}
