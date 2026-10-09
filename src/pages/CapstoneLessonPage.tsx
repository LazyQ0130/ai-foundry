import {lazy,Suspense,useEffect,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthProvider.js'
import {api,errorMessage} from '../lib/api.js'
import {useCapstone} from '../data/capstoneProgress.js'
import {capstoneLessons} from '../data/capstoneLessons.js'
import type {LessonContent} from '../data/lessonContent.js'
import {LessonLayout} from '../components/LessonLayout.js'
import {CapstoneSidebar,CapstoneLessonHeader,CapstoneLessonNavigation} from '../components/CapstoneLearning.js'
import {CourseResource} from '../components/CourseResource.js'
const LessonMarkdown=lazy(()=>import('../components/LessonMarkdown.js').then(m=>({default:m.LessonMarkdown})))
export default function CapstoneLessonPage(){
 const {lessonId=''}=useParams(),{user}=useAuth(),lab=useCapstone()
 const [loaded,setLoaded]=useState<{id:string;owner:string;content:LessonContent}|null>(null),[error,setError]=useState('')
 useEffect(()=>{let active=true;const controller=new AbortController();const load=()=>{setLoaded(null);setError('');void api<{content:LessonContent}>('/capstone/lessons/'+encodeURIComponent(lessonId),{signal:controller.signal}).then(data=>{if(active)setLoaded({id:lessonId,owner:user?.id??'',content:data.content})}).catch(e=>{if(active)setError(errorMessage(e))})};load();window.addEventListener('focus',load);return()=>{active=false;controller.abort();window.removeEventListener('focus',load)}},[lessonId,user?.id])
 const meta=capstoneLessons.find(l=>l.id===lessonId),content=loaded?.id===lessonId&&loaded.owner===(user?.id??'')?loaded.content:null
 if(error||lab.error)return <div className="shell py-16" role="alert"><p>{error||lab.error}</p><Link className="btn btn-outline mt-5" to="/capstone">返回 Project Lab</Link><Link className="btn btn-primary ml-3" to="/pricing">查看项目版</Link></div>
 if(!content||lab.loading)return <p className="shell py-16" role="status">正在加载 Project Lab…</p>
 if(!lab.data?.access)return <div className="shell py-16">需要 Project Lab 权益。<Link to="/pricing">查看项目版</Link></div>
 if(!meta)return <div className="shell py-16">没有找到这节课。<Link to="/capstone">返回 Project Lab</Link></div>
 const progress=lab.data.progress
 const workbench=<div className="card p-4"><h2 className="text-[13px] font-semibold text-slate-900">学习任务清单</h2><p className="mt-2 text-[13px] leading-5 text-slate-500">完成所有任务后自动保存完成状态。</p><div className="mt-4 space-y-4">{content.meta.checkKeys.map((key,i)=><label key={key} className="flex gap-3 text-[13px] leading-6 text-slate-600"><input className="mt-1 accent-brand-600" type="checkbox" checked={progress?.checks[lessonId]?.[key]??false} disabled={lab.saving} onChange={e=>void lab.setCheck(lessonId,key,e.target.checked)}/><span>{content.meta.checklist[i]}</span></label>)}</div><p role="status" className="mt-4 text-sm text-slate-500">{lab.saving?'正在保存…':progress?.completedLessons.includes(lessonId)?'本课已完成':'进度会自动保存'}</p><CourseResource asset="capstone-starter"/></div>
 return <LessonLayout remainingTasks={content.meta.checkKeys.filter(key=>!progress?.checks[lessonId]?.[key]).length} sidebar={close=><CapstoneSidebar currentLessonId={lessonId} progress={progress} onNavigate={close}/>} workbench={workbench}>
   <article className="lesson-article mx-auto w-full min-w-0 max-w-[740px]">
     <CapstoneLessonHeader lesson={meta} objective={content.meta.objective}/>
     <Suspense fallback={<p role="status">正在排版课程…</p>}><LessonMarkdown body={content.body}/></Suspense>
     <CapstoneLessonNavigation lessonId={lessonId}/>
   </article>
 </LessonLayout>
}
