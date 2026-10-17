import {useCallback,useEffect,useRef,useState} from 'react'
import {useOptionalAuth} from '../auth/AuthProvider.js'
import {api,errorMessage,jsonBody} from '../lib/api.js'
export type CapstoneProgress={completed:number;total:number;completedLessons:string[];inProgressLessons:string[];checks:Record<string,Record<string,boolean>>;continueLessonId:string|null}
export type CapstoneOutlineLesson={id:string;title:string;order:number;estimatedTime:string;phase?:string;desc?:string}
export type CapstoneSummary={access:boolean;lessons:CapstoneOutlineLesson[];progress:CapstoneProgress|null}
export function useCapstone() {
 const auth=useOptionalAuth()
 const owner=auth?.user?`${auth.user.id}:${auth.user.productEntitlements.includes('project-lab')}`:'guest',generation=useRef(0)
 const [state,setState]=useState<{owner:string;data:CapstoneSummary|null}>({owner:'',data:null}),[loading,setLoading]=useState(true),[error,setError]=useState(''),[saving,setSaving]=useState(false)
 const refresh=useCallback(async()=>{const v=++generation.current;if(auth?.loading)return;setLoading(true);setError('');try{const data=await api<CapstoneSummary>('/capstone');if(v===generation.current)setState({owner,data})}catch(e){if(v===generation.current){setState({owner,data:null});setError(errorMessage(e))}}finally{if(v===generation.current)setLoading(false)}},[owner,auth?.loading])
 useEffect(()=>{void refresh();const focus=()=>void refresh();window.addEventListener('focus',focus);return()=>{generation.current++;window.removeEventListener('focus',focus)}},[refresh])
 const mutate=useCallback(async(path:string,method:string,body:unknown)=>{setSaving(true);setError('');const v=++generation.current;try{const data=await api<CapstoneProgress>(path,{method,body:jsonBody(body)});if(v===generation.current)setState(s=>({owner,data:s.data?{...s.data,access:true,progress:data}:null}))}catch(e){if(v===generation.current){setState({owner,data:null});setError(errorMessage(e))}}finally{setSaving(false)}},[owner])
 return {data:!auth?.loading&&state.owner===owner?state.data:null,loading:!!auth?.loading||loading||state.owner!==owner,error,saving,refresh,setCheck:(id:string,key:string,completed:boolean)=>mutate('/capstone/progress/lessons/'+id+'/checks/'+encodeURIComponent(key),'PUT',{completed}),completeLesson:(id:string)=>mutate('/capstone/progress/lessons/'+id+'/complete','POST',{})}
}
