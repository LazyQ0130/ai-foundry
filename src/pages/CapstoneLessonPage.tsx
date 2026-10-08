import {lazy,Suspense,useEffect,useState} from 'react'
import {Link,useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthProvider.js'
import {api,errorMessage} from '../lib/api.js'
import {useCapstone} from '../data/capstoneProgress.js'
import {capstoneLessons} from '../data/capstoneLessons.js'
import type {LessonContent} from '../data/lessonContent.js'
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
 const next=capstoneLessons.find(l=>l.published&&l.order===(meta?.order??0)+1),previous=capstoneLessons.find(l=>l.published&&l.order===(meta?.order??0)-1)
 return <div className="shell py-8"><nav aria-label="Project Lab 导航" className="mb-6 flex flex-wrap gap-3"><Link to="/capstone">← Project Lab · {lab.data.progress?.completed??0}/9</Link>{previous&&<Link to={'/capstone/lessons/'+previous.id}>上一课</Link>}{next&&<Link to={'/capstone/lessons/'+next.id}>下一课</Link>}</nav>
 <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]"><article className="lesson-article mx-auto w-full min-w-0 max-w-[740px]"><header className="lesson-header"><span className="chip bg-brand-50 text-brand-600">Capstone Project Lab · {lessonId.toUpperCase()}</span><h1 className="lesson-title">{meta?.title}</h1><p className="mt-4 text-slate-600">{content.meta.objective}</p><p className="mt-3 text-sm text-slate-500">{content.meta.estimatedTime} · {content.meta.difficulty}</p></header><Suspense fallback={<p role="status">正在排版课程…</p>}><LessonMarkdown body={content.body}/></Suspense></article>
 <aside className="rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24"><h2 className="font-semibold">本课验收</h2><p className="mt-2 text-sm text-slate-500">完成所有任务后自动保存完成状态。</p><div className="mt-4 space-y-4">{content.meta.checkKeys.map((key,i)=><label key={key} className="flex gap-3 text-sm leading-6"><input className="mt-1" type="checkbox" checked={lab.data?.progress?.checks[lessonId]?.[key]??false} disabled={lab.saving} onChange={e=>void lab.setCheck(lessonId,key,e.target.checked)}/><span>{content.meta.checklist[i]}</span></label>)}</div><p role="status" className="mt-4 text-sm">{lab.saving?'正在保存…':lab.data.progress?.completedLessons.includes(lessonId)?'本课已完成':'进度会自动保存'}</p><CourseResource asset="capstone-starter"/><nav className="mt-5 flex flex-col gap-2" aria-label="Capstone 九课目录">{capstoneLessons.filter(l=>l.published).map(l=><Link aria-current={l.id===lessonId?'page':undefined} key={l.id} to={'/capstone/lessons/'+l.id} className="text-sm text-brand-700">{l.id.toUpperCase()} {l.title}</Link>)}</nav></aside></div></div>
}
