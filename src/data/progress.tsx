import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LessonStatus, Stage } from './courses'
import { formalLessons } from './courses'
import { useAuth } from '../auth/AuthProvider'
import { useCatalogue } from './catalog'
import { api, errorMessage, jsonBody } from '../lib/api'

type SavedProgress = {
  completedLessons: string[]; inProgressLessons: string[]
  checks: Record<string, Record<string, boolean>>
  lastLesson: { lessonId: string; stageSlug: string } | null
}
const empty: SavedProgress = { completedLessons: [], inProgressLessons: [], checks: {}, lastLesson: null }
type ProgressContextValue = {
  stages: Stage[]; completedLessons: number; overallPercent: number; lastLessonPath: string
  loading: boolean; error: string; mutationError: string; saving: boolean; refresh: () => Promise<void>
  getChecks: (lessonId: string, keys: string[]) => boolean[]
  setCheck: (lessonId: string, key: string, completed: boolean) => void
  completeLesson: (lessonId: string) => void; visitLesson: (lessonId: string) => void
}
const ProgressContext = createContext<ProgressContextValue | null>(null)
export function ProgressProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const catalogue = useCatalogue()
  const userId = auth.user?.id ?? ''
  const [saved, setSaved] = useState<{ owner: string; data: SavedProgress }>({ owner: '', data: empty })
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mutationError, setMutationError] = useState('')
  const [saving, setSaving] = useState(false)
  const generation = useRef(0)
  const writing = useRef(false)
  const refresh = useCallback(async () => {
    const version = ++generation.current
    setError(''); setMutationError('')
    if(!userId) { setSaved({owner:'',data:empty}); setLoadedFor(''); setLoading(false); return }
    setLoading(true)
    try { const result = await api<SavedProgress>('/progress'); if(generation.current === version) setSaved({ owner:userId, data:result }) }
    catch(e) { if(generation.current === version) setError(errorMessage(e)) }
    finally { if(generation.current === version) { setLoading(false); setLoadedFor(userId) } }
  }, [userId])
  useEffect(() => { void refresh(); return () => { generation.current++ } }, [refresh])
  const mutate = useCallback(async (path: string, method='POST', body?: unknown) => {
    if(!userId || writing.current) return
    writing.current=true; setSaving(true); setMutationError('')
    const version=++generation.current
    try { const result=await api<SavedProgress>(path,{method,...(body ? {body:jsonBody(body)} : {})}); if(generation.current===version) setSaved({owner:userId,data:result}) }
    catch(e) { if(generation.current===version) setMutationError(errorMessage(e)) }
    finally { writing.current=false; setSaving(false) }
  },[userId])
  const visitLesson = useCallback((id: string) => { void mutate('/progress/lessons/'+id+'/visit') },[mutate])
  const completeLesson = useCallback((id: string) => { void mutate('/progress/lessons/'+id+'/complete') },[mutate])
  const setCheck = useCallback((id: string,key: string,completed: boolean) => { void mutate('/progress/lessons/'+id+'/checks/'+encodeURIComponent(key),'PUT',{completed}) },[mutate])
  const progress = saved.owner === userId ? saved.data : empty
  const stages = useMemo(() => catalogue.stages.map((stage): Stage => {
    const access = auth.user?.entitlements.includes(stage.slug) ?? false
    const lessons=stage.lessons.map((lesson) => {
      const status: LessonStatus = !access && !lesson.isPreview ? 'locked' : progress.completedLessons.includes(lesson.id) ? 'completed' : progress.inProgressLessons.includes(lesson.id) ? 'in_progress' : 'not_started'
      return {...lesson,status}
    })
    const formal = formalLessons(lessons)
    const status: Stage['status'] = !access ? 'locked' : formal.length && formal.every((l)=>l.status==='completed') ? 'completed' : formal.some((l)=>['completed','in_progress'].includes(l.status)) ? 'in_progress' : 'not_started'
    return {...stage,lessons,status}
  }),[catalogue.stages,auth.user,progress])
  const total = stages.flatMap((s)=>formalLessons(s.lessons)).length
  const completedLessons = stages.flatMap((s)=>formalLessons(s.lessons)).filter((l)=>progress.completedLessons.includes(l.id)).length
  const last = progress.lastLesson
  const value: ProgressContextValue = {
    stages, completedLessons, overallPercent: total ? Math.round(completedLessons/total*100) : 0,
    lastLessonPath: last ? '/lesson/'+last.stageSlug+'/'+last.lessonId : '/path',
    loading: auth.loading || catalogue.loading || loading || loadedFor !== userId,
    error: auth.error || catalogue.error || error, mutationError, saving,
    refresh: async () => { await Promise.all([auth.refreshUser(), catalogue.refresh(), refresh()]) },
    getChecks: (id,keys) => keys.map((key)=>progress.checks[id]?.[key] ?? false),
    setCheck, completeLesson, visitLesson,
  }
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
export function useProgress() { const value=useContext(ProgressContext); if(!value) throw new Error('ProgressProvider missing'); return value }
export function LearningBoundary({ children }: { children: ReactNode }) {
  const {loading,error,refresh,stages}=useProgress()
  if(loading) return <p className="shell py-20" role="status">正在加载课程与学习记录…</p>
  if(error) return <div className="shell py-20" role="alert">{error}<button onClick={()=>void refresh()} className="btn btn-md btn-outline ml-3">重试</button></div>
  if(!stages.length) return <p className="shell py-20">暂无已发布课程。</p>
  return <>{children}</>
}
