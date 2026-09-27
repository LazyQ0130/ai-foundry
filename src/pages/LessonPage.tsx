import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Lock,
  Sparkles,
  Target,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Breadcrumb, Progress, Tick, lessonDot } from '../components/ui'
import {
  nextLessonOf,
  prevLessonOf,
  stageCompletedCount,
  stageLessonCount,
  stagePercent,
  type Lesson,
  type Stage,
} from '../data/courses'
import type { LessonContent } from '../data/lessonContent'
import { lessonPrompts } from '../data/lessonContent'
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
        className="inline-flex items-center gap-1.5 px-4 pt-4 text-[12.5px] text-slate-500 transition hover:text-brand-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        返回学习路径
      </Link>

      <div className="px-4 pt-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <h2 className="text-[14px] font-bold text-slate-900">{currentStage?.title ?? '课程目录'}</h2>
          <p className="mt-1.5 text-[11.5px] leading-5 text-slate-500">{currentStage?.desc ?? ''}</p>
          <div className="mt-3 flex items-center gap-2">
            <Progress value={coursePercent} className="flex-1" />
            <span className="text-[11.5px] font-semibold text-brand-600">{coursePercent}%</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
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
                <span className="text-[12px] font-semibold text-slate-700">
                  {s.tag}　{s.title}
                </span>
                <span className="text-[11px] tabular-nums text-slate-400">
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
                    </>
                  )
                  return (
                    <li key={l.id}>
                      {locked ? (
                        <span className="flex items-center gap-2 rounded-lg px-2 py-[7px] text-[12px] text-slate-400">
                          {inner}
                        </span>
                      ) : (
                        <Link
                          to={`/lesson/${s.slug}/${l.id}`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-lg px-2 py-[7px] text-[12px] transition ${
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

function ContentCard({
  id,
  icon,
  title,
  tint = 'brand',
  children,
}: {
  id?: string
  icon: React.ReactNode
  title: string
  tint?: 'brand' | 'emerald' | 'amber' | 'slate' | 'violet'
  children: React.ReactNode
}) {
  const tints: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-500',
    violet: 'bg-violet-50 text-violet-600',
  }
  return (
    <section id={id} className="card scroll-mt-20 p-5">
      <div className="flex items-center gap-2.5">
        <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tints[tint]}`}>
          {icon}
        </span>
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="mt-3.5 pl-[38px]">{children}</div>
    </section>
  )
}

function LessonArticle({ stage, lesson, content }: { stage: Stage; lesson: Lesson; content: LessonContent }) {
  const [copied, setCopied] = useState<number | null>(null)
  const [deepOpen, setDeepOpen] = useState(false)
  const prompts = lessonPrompts(content)

  const copyPrompt = async (index: number, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(index)
      window.setTimeout(() => setCopied(null), 1800)
    } catch {
      setCopied(null)
    }
  }

  return (
    <article className="min-w-0 space-y-4">
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

      <header>
        <span className="chip bg-brand-50 text-brand-600">
          {stage.tag} · 第 {lesson.order} 课
        </span>
        <h1 className="mt-3 text-[26px] font-bold leading-snug tracking-tight text-slate-900 sm:text-[30px]">
          {lesson.code} {lesson.title}
        </h1>
        <p className="mt-3 text-[13.5px] leading-6 text-slate-600">{lesson.desc}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
            预计学习时间 {content.estimatedTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
            难度 {content.difficulty}
          </span>
        </div>
      </header>

      {/* 本课任务 */}
      <ContentCard icon={<ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />} title="本课任务">
        <p className="text-[13px] leading-6 text-slate-600">{content.task.intro}</p>
        <p className="mt-3.5 text-[12.5px] font-medium text-slate-700">完成后你将得到：</p>
        <ul className="mt-2 space-y-2">
          {content.task.outcome.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
              <span className="text-[12.5px] leading-5 text-slate-600">{t}</span>
            </li>
          ))}
        </ul>
      </ContentCard>

      {/* 为什么 */}
      <ContentCard icon={<Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />} title="为什么要做这个？">
        <p className="text-[13px] leading-6 text-slate-600">{content.why}</p>
      </ContentCard>

      {/* 核心概念 */}
      <ContentCard icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2} />} title="核心概念" tint="violet">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {content.concepts.map((c) => (
            <div key={c.title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-[12.5px] font-semibold text-slate-900">{c.title}</p>
              <p className="mt-1.5 text-[11.5px] leading-5 text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </ContentCard>

      {/* 参考提示词 */}
      {prompts.map((prompt, index) => (
        <ContentCard
          key={index}
          id={index === 0 ? 'lesson-prompt' : `lesson-prompt-${index + 1}`}
          icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2} />}
          title={prompts.length > 1 ? `参考提示词 ${index + 1}（可直接复制使用）` : '参考提示词（可直接复制使用）'}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="max-w-[440px] text-[12.5px] leading-5 text-slate-500">{prompt.intro}</p>
            <button
              type="button"
              onClick={() => void copyPrompt(index, prompt.code)}
              className={`btn btn-sm shrink-0 ${copied === index ? 'btn-soft' : 'btn-primary'}`}
            >
              {copied === index ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === index ? '已复制' : '复制提示词'}
            </button>
          </div>
          <pre className="mt-3.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[12.5px] leading-6 text-slate-700">
            <code className="whitespace-pre-wrap break-words font-mono">{prompt.code}</code>
          </pre>
          {prompt.note ? (
            <p className="mt-2.5 text-[11.5px] text-slate-400">提示：{prompt.note}</p>
          ) : null}
        </ContentCard>
      ))}

      {/* 开始任务 */}
      {content.todo?.length ? (
        <ContentCard icon={<ListChecks className="h-3.5 w-3.5" strokeWidth={2} />} title="开始任务">
          <ol className="space-y-2.5">
            {content.todo.map((t, i) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-[2px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md bg-slate-100 text-[10.5px] font-semibold text-slate-500">
                  {i + 1}
                </span>
                <span className="text-[12.5px] leading-5 text-slate-600">{t}</span>
              </li>
            ))}
          </ol>
        </ContentCard>
      ) : null}

      {/* 动手检查 */}
      <ContentCard icon={<Check className="h-4 w-4" strokeWidth={2.6} />} title="验收参考" tint="emerald">
        <p className="text-[12.5px] text-slate-500">对照以下标准检查结果，再到学习工作台勾选任务：</p>
        <ul className="mt-3 space-y-2.5">
          {content.check.map((c) => (
            <li key={c} className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="text-[12.5px] leading-5 text-slate-600">{c}</span>
            </li>
          ))}
        </ul>
      </ContentCard>

      {/* 卡住了 */}
      <ContentCard id="lesson-help" icon={<HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />} title="卡住了？" tint="amber">
        <p className="text-[12.5px] leading-6 text-slate-600">{content.stuck}</p>
      </ContentCard>

      {/* 深入了解 */}
      {content.deepDive ? (
        <section className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setDeepOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <span className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${deepOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
              </span>
              <span className="text-[15px] font-semibold text-slate-900">深入了解：{content.deepDive.title}</span>
            </span>
            <span className="shrink-0 text-[11.5px] text-slate-400">{deepOpen ? '收起' : '展开'}</span>
          </button>
          {deepOpen ? (
            <p className="border-t border-slate-100 px-5 py-4 text-[12.5px] leading-6 text-slate-600">
              {content.deepDive.body}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* 安全提醒 */}
      {content.warning ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <TriangleAlert className="mt-[2px] h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} />
          <div>
            <p className="text-[13px] font-semibold text-amber-800">注意</p>
            <p className="mt-1 text-[12.5px] leading-5 text-amber-700">{content.warning}</p>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function NavArrow({ dir, stage, lesson }: { dir: 'prev' | 'next'; stage: Stage; lesson: Lesson }) {
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
  const checked = getChecks(lesson.id, content.checkKeys)

  const percent = stagePercent(stage)
  const checkedCount = checked.filter(Boolean).length

  const next = nextLessonOf(stage, lesson)

  return (
    <div className="space-y-4">
      {/* 学习进度 */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
            学习进度
          </h2>
          <Link to={`/stage/${stage.slug}`} className="link-more !text-[11.5px]">
            查看阶段总览
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <p className="mt-3 text-[12.5px] font-medium text-slate-700">
          {stage.tag}：{stage.title}
        </p>
        <Progress value={percent} className="mt-2.5" />
        <div className="mt-2 flex items-center justify-between text-[11.5px] text-slate-400">
          <span className="tabular-nums">
            {stageCompletedCount(stage)} / {stage.lessons.length}
          </span>
          <span>{percent}%</span>
        </div>
      </div>

      {mutationError && <p role="alert" className="text-sm text-red-600">{mutationError}</p>}
      {!user && <Link to="/login" className="block text-sm text-brand-600">登录后同步学习进度</Link>}
      {saving && <p role="status" className="text-xs text-slate-500">正在保存…</p>}
      {/* 本课目标 */}
      <div className="card p-4">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <Target className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
          本课目标
        </h2>
        <p className="mt-2.5 text-[12px] leading-5 text-slate-600">{content.objective}</p>
      </div>

      {/* 学习任务清单 */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
            <ClipboardList className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
            学习任务清单
          </h2>
          <span className="text-[11.5px] tabular-nums text-slate-400">
            {checkedCount}/{checked.length}
          </span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {content.checklist.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                disabled={!user || saving}
                onClick={() => setCheck(lesson.id, content.checkKeys[i], !checked[i])}
                aria-pressed={checked[i]}
                className="flex w-full items-start gap-2.5 text-left"
              >
                <Tick checked={checked[i]} className="mt-[1px]" />
                <span
                  className={`text-[12px] leading-5 transition ${
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
        <p className="text-center text-[11.5px] text-slate-500">完成本地操作并勾选全部任务后，即可标记本课完成。</p>
      ) : null}

      {done && next ? (
        <Link to={`/lesson/${stage.slug}/${next.id}`} className="btn btn-md btn-outline w-full">
          进入下一课：{next.code} {next.title.length > 10 ? `${next.title.slice(0, 10)}…` : next.title}
        </Link>
      ) : null}

      {/* 卡住了 */}
      <div className="card p-4">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <HelpCircle className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.2} />
          卡住了？获取帮助
        </h2>
        <p className="mt-2 text-[11.5px] text-slate-400">遇到问题时，可以通过以下方式解决：</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">课程为自主阅读与实践，不提供人工答疑。购买、退款或账号问题请前往<Link to="/faq" className="text-brand-600">帮助中心</Link>。</p>
        <ul className="mt-3 space-y-2">
          {[
            { icon: ClipboardList, title: '查看排查建议', desc: '从常见问题和报错信息开始检查', href: '#lesson-help' },
            { icon: Sparkles, title: '使用参考提示词', desc: '复制提示词，附上完整报错向 AI 提问', href: '#lesson-prompt' },
          ].map((it) => (
            <li key={it.title}>
              <a
                href={it.href}
                className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-left transition hover:border-slate-300 hover:bg-white"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-200">
                  <it.icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-slate-800">{it.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{it.desc}</span>
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
    <div className="mx-auto w-full max-w-[1480px] px-5 pb-24 pt-6 sm:px-6 xl:pb-6">
      {/* 移动端目录入口 */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button type="button" onClick={() => setDrawer(true)} className="btn btn-sm btn-outline">
          <ListChecks className="h-3.5 w-3.5" />
          课程目录
        </button>
        <span className="text-[12px] text-slate-400">
          {lesson.code} {lesson.title}
        </span>
      </div>

      <div className="flex gap-6">
        {/* 左栏 */}
        <aside className="hidden w-[248px] shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            {sidebar}
          </div>
        </aside>

        {/* 中栏 */}
        <div className="min-w-0 flex-1">
          <LessonArticle stage={stage} lesson={lesson} content={content} />
        </div>

        {/* 右栏 */}
        <aside className="hidden w-[300px] shrink-0 xl:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-2">
            <Workbench stage={stage} lesson={lesson} content={content} />
          </div>
        </aside>
      </div>

      {/* 平板/移动端的工作台 */}
      <div id="lesson-workbench" className="mt-6 scroll-mt-20 xl:hidden">
        <Workbench stage={stage} lesson={lesson} content={content} />
      </div>

      <a href="#lesson-workbench" className="btn btn-primary fixed bottom-4 left-1/2 z-30 -translate-x-1/2 px-6 py-3 shadow-lift xl:hidden">
        <ListChecks className="h-4 w-4" />查看任务与进度
      </a>

      {/* 抽屉 */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
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
