import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { FreeExperience, PrepFeedback } from '../components/FreeExperience'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  HelpCircle,
  ListChecks,
  Lock,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { Breadcrumb, Progress, Tick, lessonDot } from '../components/ui'
import { stageLessonCount, type Lesson, type Stage } from '../data/courses'
import { nextLessonOf, prevLessonOf, stageCompletedCount, stagePercent } from '../data/learningProgress'
import type { LessonContent } from '../data/lessonContent'
const LessonMarkdown = lazy(() => import('../components/LessonMarkdown').then(module => ({ default: module.LessonMarkdown })))
import { api, ApiError, errorMessage } from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { useProgress } from '../data/progress'



/* ------------------------------------------------------------------ */
/* 左侧：课程目录                                                       */
/* ------------------------------------------------------------------ */

function LessonSidebar({
  currentLessonId,
  onNavigate,
}: {
  currentLessonId: string
  onNavigate?: () => void
}) {
  const { stages } = useProgress()
  const currentStage = stages.find(stage => stage.lessons.some(lesson => lesson.id === currentLessonId))
  const coursePercent = currentStage ? stagePercent(currentStage) : 0

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/path"
        onClick={onNavigate}
        className="inline-flex items-center gap-1.5 px-4 pt-4 text-[13px] text-slate-500 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回学习路径
      </Link>

      <div className="px-4 pt-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-[14px] font-bold text-slate-900">{currentStage?.title ?? '课程目录'}</h2>
          <p className="mt-1.5 text-[13px] leading-5 text-slate-500">{currentStage?.desc ?? ''}</p>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={coursePercent} className="flex-1" />
            <span className="text-[13px] font-semibold text-brand-600">{coursePercent}%</span>
          </div>
          <p className="mt-2 text-[13px] text-slate-400">
            本阶段已完成 {currentStage ? stageCompletedCount(currentStage) : 0} / {currentStage ? stageLessonCount(currentStage) : 0} 课
          </p>
        </div>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-4 pb-6">
        {stages.map((s) => {
          const sDone = stageCompletedCount(s)
          const sTotal = stageLessonCount(s)
          return (
            <div key={s.id} className="mb-4 last:mb-0">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[13px] font-semibold text-slate-700">
                  {s.tag}　{s.title}
                </span>
                <span className="text-[13px] tabular-nums text-slate-400">
                  {s.status === 'locked' ? <Lock className="h-3 w-3" /> : `${sDone}/${sTotal}`}
                </span>
              </div>

              <ul className="space-y-0.5">
                {s.lessons.map((l) => {
                  const isCurrent = l.id === currentLessonId
                  const locked = l.status === 'locked'
                  const inner = (
                    <>
                      {lessonDot[l.status]()}
                      <span className="min-w-0 flex-1 truncate">
                        {l.code} {l.title}
                      </span>
                      {l.isPublished === false && <span className="shrink-0 text-[10px] text-slate-400">即将上线</span>}
                    </>
                  )
                  return (
                    <li key={l.id}>
                      {locked ? (
                        <span className="flex items-center gap-2 rounded-lg px-2 py-[7px] text-[13px] text-slate-400">
                          {inner}
                        </span>
                      ) : (
                        <Link
                          to={`/lesson/${s.slug}/${l.id}`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-lg px-2 py-[7px] text-[13px] transition ${
                            isCurrent
                              ? 'bg-brand-50 font-semibold text-brand-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {inner}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 中间：正文                                                           */
/* ------------------------------------------------------------------ */

function LessonArticle({ stage, lesson, content }: { stage: Stage; lesson: Lesson; content: LessonContent }) {
  return (
    <article className="lesson-article mx-auto min-w-0 w-full max-w-[740px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Breadcrumb
          className="pt-1"
          items={[
            { label: '课程目录', to: '/courses' },
            { label: `${stage.tag}: ${stage.title}`, to: `/stage/${stage.slug}` },
            { label: `${lesson.code} ${lesson.title}` },
          ]}
        />
        <div className="flex shrink-0 gap-2">
          <NavArrow dir="prev" stage={stage} lesson={lesson} />
          <NavArrow dir="next" stage={stage} lesson={lesson} />
        </div>
      </div>

      <header className="lesson-header">
        <span className="chip bg-brand-50 text-brand-600">
          {stage.tag} · 第 {lesson.order} 课
        </span>
        <h1 className="lesson-title">
          {lesson.code} {lesson.title}
        </h1>
        <p className="mt-4 text-[16px] leading-7 text-slate-600">{lesson.desc}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
            预计学习时间 {content.meta.estimatedTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
            难度 {content.meta.difficulty}
          </span>
        </div>
      </header>

      <Suspense fallback={<p role="status" className="text-base text-slate-600">正在排版课程…</p>}><LessonMarkdown body={content.body}/></Suspense>
    </article>
  )
}

function NavArrow({ dir, stage, lesson }: { dir: 'prev' | 'next'; stage: Stage; lesson: Lesson }) {
  const { user } = useAuth()
  if (dir === 'next' && lesson.id === 's1-l1' && !user?.entitlements.includes(stage.slug)) return <Link to={`/stage/${stage.slug}`} className="btn btn-sm btn-outline">继续 Stage 1 · 查看完整课程</Link>
  const target = dir === 'prev' ? prevLessonOf(stage, lesson) : nextLessonOf(stage, lesson)
  const label = dir === 'prev' ? '上一课' : '下一课'
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight

  if (!target) {
    return (
      <span className="btn btn-sm cursor-not-allowed border border-slate-200 bg-white text-slate-300">
        {dir === 'prev' ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
        {dir === 'next' ? <Icon className="h-3.5 w-3.5" /> : null}
      </span>
    )
  }

  return (
    <Link to={`/lesson/${stage.slug}/${target.id}`} className="btn btn-sm btn-outline">
      {dir === 'prev' ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
      {dir === 'next' ? <Icon className="h-3.5 w-3.5" /> : null}
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* 右侧：学习工作台                                                     */
/* ------------------------------------------------------------------ */

function Workbench({ stage, lesson, content }: { stage: Stage; lesson: Lesson; content: LessonContent }) {
  const { getChecks, setCheck, completeLesson, saving, mutationError } = useProgress()
  const { user } = useAuth()
  const done = lesson.status === 'completed'
  const checked = getChecks(lesson.id, content.meta.checkKeys)

  const percent = stagePercent(stage)
  const checkedCount = checked.filter(Boolean).length

  const next = nextLessonOf(stage, lesson)

  return (
    <div className="space-y-4">
      {lesson.isPrep ? <PrepFeedback done={done}/> : <>
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
            学习进度
          </h2>
          <Link to={`/stage/${stage.slug}`} className="link-more !text-[13px]">
            查看阶段总览
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-3 text-[13px] font-medium text-slate-700">
          {stage.tag}：{stage.title}
        </p>
        <Progress value={percent} className="mt-2.5" />
        <div className="mt-2 flex items-center justify-between text-[13px] text-slate-400">
          <span className="tabular-nums">
            {stageCompletedCount(stage)} / {stageLessonCount(stage)}
          </span>
          <span>{percent}%</span>
        </div>
      </div> </>}

      {mutationError && <p role="alert" className="text-sm text-red-600">{mutationError}</p>}
      {!user && <Link to="/login" className="block text-sm text-brand-600">登录后同步学习进度</Link>}
      {saving && <p role="status" className="text-xs text-slate-500">正在保存…</p>}
      {/* 本课目标 */}
      <div className="card p-4">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <Target className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
          本课目标
        </h2>
        <p className="mt-2.5 text-[13px] leading-5 text-slate-600">{content.meta.objective}</p>
      </div>

      {/* 学习任务清单 */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
            <ClipboardList className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
            学习任务清单
          </h2>
          <span className="text-[13px] tabular-nums text-slate-400">
            {checkedCount}/{checked.length}
          </span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {content.meta.checklist.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                disabled={!user || saving}
                onClick={() => setCheck(lesson.id, content.meta.checkKeys[i], !checked[i])}
                aria-pressed={checked[i]}
                className="flex w-full items-start gap-2.5 text-left"
              >
                <Tick checked={checked[i]} className="mt-[1px]" />
                <span
                  className={`text-[13px] leading-5 transition ${
                    checked[i] ? 'text-slate-400 line-through' : 'text-slate-600'
                  }`}
                >
                  {i + 1}. {c}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => completeLesson(lesson.id)}
        disabled={!user || saving || done || checkedCount !== checked.length}
        title={checkedCount !== checked.length ? '请先完成并勾选全部学习任务' : undefined}
        className={`btn btn-md w-full ${done ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'btn-primary'}`}
      >
        <Check className="h-4 w-4" strokeWidth={2.6} />
        {done ? '已完成本课' : '标记为完成'}
      </button>
      {!done && checkedCount !== checked.length ? (
        <p className="text-center text-[13px] text-slate-500">完成本地操作并勾选全部任务后，即可标记本课完成。</p>
      ) : null}

      {done && next && !lesson.isPrep ? (
        <Link to={`/lesson/${stage.slug}/${next.id}`} className="btn btn-md btn-outline w-full">
          进入下一课：{next.code} {next.title.length > 10 ? `${next.title.slice(0, 10)}…` : next.title}
        </Link>
      ) : null}

      {done && lesson.id === 's1-l1' && !user?.entitlements.includes(stage.slug) && <FreeExperience prepDone={stage.lessons.some(l => l.isPrep && l.status === 'completed')} firstDone={done}/>}
      {/* 卡住了 */}
      <div className="card p-4">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <HelpCircle className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.2} />
          卡住了？获取帮助
        </h2>
        <p className="mt-2 text-[13px] text-slate-400">遇到问题时，可以通过以下方式解决：</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">课程为自主阅读与实践，不提供人工答疑。购买、退款或账号问题请前往<Link to="/faq" className="text-brand-600">帮助中心</Link>。</p>
        <ul className="mt-3 space-y-2">
          {[
            { icon: ClipboardList, title: '查看排查建议', desc: '从常见问题和报错信息开始检查', href: '#lesson-help' },
            ...(content.body.includes(':::prompt') ? [{ icon: Sparkles, title: '使用参考提示词', desc: '复制提示词，附上完整报错向 AI 提问', href: '#lesson-prompt' }] : []),
          ].map((it) => (
            <li key={it.title}>
              <a
                href={it.href}
                className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-left transition hover:border-slate-300 hover:bg-white"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-200">
                  <it.icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="mx-auto min-w-0 max-w-[740px] flex-1">
                  <span className="block text-[13px] font-medium text-slate-800">{it.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-4 text-slate-400">{it.desc}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 页面                                                                */
/* ------------------------------------------------------------------ */

function NotFound({ stageSlug, lessonId }: { stageSlug?: string; lessonId?: string }) {
  return (
    <div className="shell py-24 text-center">
      <h1 className="text-[24px] font-bold text-slate-900">没有找到这节课</h1>
      <p className="mt-2 text-sm text-slate-500">
        {stageSlug} / {lessonId}
      </p>
      <Link to="/path" className="btn btn-md btn-primary mt-6">
        返回学习路径
      </Link>
    </div>
  )
}

function LessonView({ stage, lesson, content }: { stage: Stage; lesson: Lesson; content: LessonContent }) {
  const [drawer, setDrawer] = useState(false)
  const { visitLesson } = useProgress()
  const { user } = useAuth()
  useEffect(() => { if(user) visitLesson(lesson.id) }, [lesson.id, visitLesson, user?.id])
  const sidebar = useMemo(
    () => <LessonSidebar currentLessonId={lesson.id} onNavigate={() => setDrawer(false)} />,
    [lesson.id],
  )

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-6 sm:px-6 min-[1360px]:pb-6">
      {/* 移动端目录入口 */}
      <div className="mb-4 flex items-center justify-between min-[1360px]:hidden">
        <button type="button" onClick={() => setDrawer(true)} className="btn btn-sm btn-outline">
          <ListChecks className="h-3.5 w-3.5" />
          课程目录
        </button>
        <a href="#lesson-workbench" className="btn btn-sm btn-outline">学习任务与进度</a>
      </div>

      <div className="flex gap-6">
        {/* 左栏 */}
        <aside className="hidden w-[236px] shrink-0 min-[1360px]:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            {sidebar}
          </div>
        </aside>

        {/* 中栏 */}
        <div className="mx-auto min-w-0 max-w-[740px] flex-1">
          <LessonArticle stage={stage} lesson={lesson} content={content} />
        </div>

        {/* 右栏 */}
        <aside className="hidden w-[260px] shrink-0 min-[1360px]:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-2">
            <Workbench stage={stage} lesson={lesson} content={content} />
          </div>
        </aside>
      </div>

      {/* 平板/移动端的工作台 */}
      <div id="lesson-workbench" className="mx-auto mt-10 max-w-[740px] scroll-mt-20 min-[1360px]:hidden">
        <Workbench stage={stage} lesson={lesson} content={content} />
      </div>

      {/* 抽屉 */}
      {drawer ? (
        <div className="fixed inset-0 z-50 min-[1360px]:hidden">
          <button
            type="button"
            aria-label="关闭目录"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="关闭"
              className="absolute right-2 top-3 grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ProtectedLesson({ stage, lesson }: { stage: Stage; lesson: Lesson }) {
  const [content, setContent] = useState<LessonContent | null>(null)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setContent(null); setError(''); setCode('')
    api<{ content: LessonContent }>('/lessons/' + lesson.id, { signal: controller.signal }).then((result)=>setContent(result.content)).catch((e)=>{if(!controller.signal.aborted){setError(errorMessage(e));setCode(e instanceof ApiError ? e.code : 'NETWORK_ERROR')}})
    return ()=>controller.abort()
  }, [lesson.id, revision])
  if(error) return <div className="shell py-20"><h1 className="text-2xl font-bold">{lesson.code} {lesson.title}</h1><p className="mt-3 text-sm text-slate-500">{stage.tag} · {stage.title} · {lesson.duration}</p><p role="alert" className="mt-6">{error}</p><div className="mt-6 flex gap-3">{code === 'UNAUTHORIZED' ? <Link className="btn btn-md btn-primary" to={'/login?next='+encodeURIComponent('/lesson/'+stage.slug+'/'+lesson.id)}>登录学习</Link> : code === 'STAGE_ACCESS_REQUIRED' ? <Link className="btn btn-md btn-primary" to="/pricing">查看购买 / 开通方式</Link> : <button onClick={()=>setRevision((v)=>v+1)} className="btn btn-md btn-outline">重试</button>}<Link className="btn btn-md btn-outline" to={'/stage/'+stage.slug}>返回阶段</Link></div></div>
  if(!content) return <p role="status" className="shell py-20">正在加载课程…</p>
  return <LessonView stage={stage} lesson={lesson} content={content}/>
}

export default function LessonPage() {
  const { stageSlug, lessonId } = useParams<{ stageSlug: string; lessonId: string }>()
  const { stages } = useProgress()
  const stage = stages.find((item) => item.slug === stageSlug)
  const lesson = stage?.lessons.find((item) => item.id === lessonId)
  const { user } = useAuth()
  const found = stage && lesson ? { stage, lesson } : undefined
  if (!found) return <NotFound stageSlug={stageSlug} lessonId={lessonId} />
  return <ProtectedLesson key={`${lessonId}:${user?.id ?? "guest"}`} stage={found.stage} lesson={found.lesson} />
}
