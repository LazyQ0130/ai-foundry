import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Clock, Flag, Lock, Play, Users } from 'lucide-react'
import { Icon } from '../components/Icon'
import { StageArchMockup } from '../components/mockups'
import { Breadcrumb, Progress, Ring } from '../components/ui'
import {
  accentClass,
  lessonStatusLabel,
  stageCompletedCount,
  stageLessonCount,
  stagePercent,
  type Lesson,
} from '../data/courses'
import { useProgress } from '../data/progress'
import StageAccess from '../components/StageAccess'

function NotFound({ slug }: { slug?: string }) {
  return (
    <div className="shell py-24 text-center">
      <h1 className="text-[24px] font-bold text-slate-900">没有找到这个阶段</h1>
      <p className="mt-2 text-sm text-slate-500">路径参数：{slug}</p>
      <Link to="/path" className="btn btn-md btn-primary mt-6">
        返回学习路径
      </Link>
    </div>
  )
}

function LessonBadge({ lesson }: { lesson: Lesson }) {
  if (lesson.status === 'completed') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    )
  }
  if (lesson.status === 'in_progress') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white ring-4 ring-brand-100">
        {lesson.order}
      </span>
    )
  }
  if (lesson.status === 'locked') {
    return (
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Lock className="h-3 w-3" strokeWidth={2.4} />
      </span>
    )
  }
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-400">
      {lesson.order}
    </span>
  )
}

export default function StagePage() {
  const { slug } = useParams<{ slug: string }>()
  const { stages } = useProgress()
  const stage = slug ? stages.find((item) => item.slug === slug) : undefined
  if (!stage) return <NotFound slug={slug} />


  const a = accentClass[stage.accent]
  const done = stageCompletedCount(stage)
  const total = stageLessonCount(stage)
  const percent = stagePercent(stage)
  const active = stage.lessons.find((l) => l.status === 'in_progress')
  const upNext = active ?? stage.lessons.find((l) => l.status === 'not_started') ?? stage.lessons[0]
  const upNextIndex = stage.lessons.findIndex((l) => l.id === upNext.id)
  const locked = stage.status === 'locked'

  const metaItems = [
    { icon: 'target' as const, label: '预计总时长', value: stage.totalDuration },
    { icon: 'trending' as const, label: '难度等级', value: stage.difficulty },
    { icon: 'file' as const, label: '包含内容', value: `${total} 节任务课 + 阶段项目` },
    { icon: 'users' as const, label: '适合人群', value: stage.recommend },
  ]

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 82%)' }}
        />
        <div className="shell relative grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:py-14">
          <div>
            <Breadcrumb
              items={[
                { label: '首页', to: '/' },
                { label: '学习路径', to: '/path' },
                { label: `${stage.tag}：${stage.title}` },
              ]}
            />
            <span className={`chip mt-4 ${a.softBg} ${a.text}`}>{stage.tag}</span>
            <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[38px]">
              {stage.title}
            </h1>
            <p className="mt-3 text-[15px] font-medium text-slate-700">{stage.subtitle}</p>
            <p className="mt-3 max-w-xl text-[13.5px] leading-6 text-slate-500">{stage.desc}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="trending" className={`h-3.5 w-3.5 ${a.solid}`} />
                {stage.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
                预计总时长 {stage.totalDuration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
                {total} 节课
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-end gap-3">
              <StageAccess stage={stage} />
              <Link to={`/project/${stage.project.id}`} className="btn btn-lg btn-outline">
                查看阶段项目
              </Link>
            </div>
          </div>

          <StageArchMockup stage={stage} />
        </div>
      </section>

      {/* ------------------------------ 主体内容 ------------------------------ */}
      <section className="shell grid grid-cols-1 gap-6 pb-8 pt-14 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-12">
          {/* 能力 */}
          <div>
            <h2 className="h-sec">你将获得什么能力</h2>
            <p className="sub-sec">结合课程任务和阶段项目，练习以下能力。</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stage.abilities.map((ab) => (
                <div key={ab.title} className="card p-4">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.softBg} ${a.solid}`}>
                    <Icon name={ab.icon} className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-[13.5px] font-semibold text-slate-900">{ab.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-500">{ab.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 课程列表 */}
          <div>
            <h2 className="h-sec">课程列表（{total} 节正式课）</h2>
            <p className="sub-sec">
              {stage.lessons.some(lesson => lesson.isPrep) && '另含第 0 课：开始前准备，不计入正式课程进度。'}
              建议按顺序学习并动手实践。各阶段独立开通，完成当前阶段不会自动开通其他阶段。
            </p>

            <div className="mt-6 space-y-3">
              {stage.lessons.map((lesson) => {
                const isActive = lesson.status === 'in_progress'
                const isLocked = lesson.status === 'locked'
                const Row = (
                  <>
                    <LessonBadge lesson={lesson} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-[13.5px] font-semibold ${
                            isLocked ? 'text-slate-400' : isActive ? 'text-brand-700' : 'text-slate-900'
                          }`}
                        >
                          {lesson.title}
                        </h3>
                        {isActive ? (
                          <span className="chip bg-brand-600 text-white">继续学习</span>
                        ) : null}
                      </div>
                      <p className={`mt-1 text-[12px] leading-5 ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lesson.desc}
                      </p>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1.5 text-[12px] text-slate-400 sm:inline-flex">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.9} />
                      {lesson.duration}
                    </span>
                    <span
                      className={`chip shrink-0 ${
                        lesson.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : isActive
                            ? 'bg-brand-50 text-brand-600'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {lesson.isPublished === false ? '即将上线' : lesson.status === 'completed' ? '已完成' : lesson.isPreview ? '免费体验' : lessonStatusLabel[lesson.status]}
                    </span>
                  </>
                )

                return (
                  <div key={lesson.id}>
                    {isLocked ? (
                      <div className="flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:items-center">
                        {Row}
                      </div>
                    ) : (
                      <Link
                        to={`/lesson/${stage.slug}/${lesson.id}`}
                        className={`flex items-start gap-3.5 rounded-xl border p-4 transition sm:items-center ${
                          isActive
                            ? 'border-brand-300 bg-white ring-4 ring-brand-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-card'
                        }`}
                      >
                        {Row}
                      </Link>
                    )}

                    {stage.checkpoints
                      .filter((c) => c.afterLessonOrder === lesson.order)
                      .map((c) => {
                        const cDone = done >= c.afterLessonOrder
                        return (
                          <div
                            key={c.id}
                            className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3"
                          >
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200">
                              <Flag className="h-3.5 w-3.5" strokeWidth={2} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-slate-800">{c.title}</p>
                              <p className="mt-0.5 text-[12px] text-slate-500">{c.desc}</p>
                            </div>
                            <span className={`chip ${cDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              {Math.min(done, c.afterLessonOrder)}/{c.afterLessonOrder}
                            </span>
                            <span
                              className={`chip ${
                                cDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {cDone ? '已完成' : '未完成'}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card p-5"><h2 className="mb-2 text-lg font-semibold">把所学用在阶段项目中</h2><p className="mb-4 text-sm leading-6 text-slate-600">{stage.project.desc}</p><StageAccess stage={stage} /></div>
        </div>

        {/* ------------------------------ 右侧栏 ------------------------------ */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5"><h2 className="mb-3 text-sm font-semibold">{locked ? '开通与学习' : '已开通本阶段'}</h2><StageAccess stage={stage} />{locked && <p className="mt-3 text-xs leading-5 text-slate-500">微信联系管理员确认方案，付款核实后人工开通。</p>}</div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-slate-900">学习进度</h2>
              <Link to="/path" className="link-more">
                返回学习路径
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Ring percent={percent} size={78} stroke={8}>
                <span className="text-[16px] font-bold leading-none text-slate-900">
                  {done}/{total}
                </span>
              </Ring>
              <div className="min-w-0">
                <p className="text-[12px] text-slate-400">本阶段进度</p>
                <p className="mt-0.5 text-[12.5px] text-slate-600">
                  已完成 <span className="font-semibold text-slate-900">{done}</span> 节课，共 {total} 节课
                </p>
              </div>
            </div>

            <Progress value={percent} className="mt-4" />
            <p className="mt-2 text-right text-[11.5px] text-slate-400">{percent}%</p>

            <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              {metaItems.map((m) => (
                <div key={m.label} className="flex items-start gap-2.5 text-[12px]">
                  <Icon name={m.icon} className={`mt-[2px] h-3.5 w-3.5 shrink-0 ${a.solid}`} />
                  <dt className="w-[62px] shrink-0 text-slate-400">{m.label}</dt>
                  <dd className="min-w-0 flex-1 text-right font-medium text-slate-700">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {!locked && <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-slate-900">下一节</h2>
            <p className="mt-3 text-[11.5px] text-slate-400">第 {upNextIndex + 1} 课</p>
            <h3 className="mt-1 text-[13.5px] font-semibold text-slate-900">{upNext.title}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-slate-400">
              <Clock className="h-3 w-3" strokeWidth={2} />
              {upNext.duration}
            </p>
            <p className="mt-2.5 text-[12px] leading-5 text-slate-500">{upNext.desc}</p>

            <div className="mt-4"><StageAccess stage={stage} /></div>
            <Link to={`/courses`} className="btn btn-md btn-outline mt-2 w-full">
              查看课程详情
            </Link>
          </div>}

          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-slate-900">完成本阶段要求</h2>
            <ul className="mt-3.5 space-y-3">
              {[
                { text: `完成 ${total} 节课的学习`, done: done === total },
              ].map((it) => (
                <li key={it.text} className="flex items-start gap-2.5">
                  {it.done ? (
                    <span className="mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
                    </span>
                  ) : (
                    <span className="mt-[2px] h-4 w-4 shrink-0 rounded-full border-[1.5px] border-slate-300" />
                  )}
                  <span className={`text-[12.5px] leading-5 ${it.done ? 'text-slate-700' : 'text-slate-500'}`}>
                    {it.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-5">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white ${a.solid}`}>
              <Play className="h-4 w-4 fill-current" strokeWidth={0} />
            </span>
            <h3 className="mt-3 text-[13.5px] font-semibold text-slate-900">阶段成果</h3>
            <p className="mt-1.5 text-[12px] leading-5 text-slate-600">{stage.project.desc}</p>
            <Link to={`/project/${stage.project.id}`} className="btn btn-md btn-primary mt-4 w-full">
              打开项目
            </Link>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <Users className="h-4 w-4 text-slate-400" strokeWidth={1.9} />
              适合谁学
            </h2>
            <p className="mt-2.5 text-[12.5px] leading-5 text-slate-500">
              进入前：{stage.enterState}
            </p>
            <p className="mt-2 text-[12.5px] leading-5 text-slate-500">
              学完后：<span className="font-medium text-slate-700">{stage.exitState}</span>
            </p>
          </div>
        </aside>
      </section>
    </>
  )
}
