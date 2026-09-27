import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FolderKanban, Play } from 'lucide-react'
import { Progress, Ring, StageChip } from '../components/ui'
import { accentClass, formalLessons, stageStatusLabel } from '../data/courses'
import { useProgress } from '../data/progress'
import { useAuth } from '../auth/AuthProvider'

export default function Dashboard() {
  const { stages, completedLessons, overallPercent, lastLessonPath } = useProgress()
  const { user } = useAuth()
  const hasContinue = lastLessonPath.startsWith('/lesson/')
  const totalLessons = stages.reduce((sum, stage) => sum + formalLessons(stage.lessons).length, 0)
  const currentStage = stages.find((stage) => lastLessonPath.includes('/'+stage.slug+'/')) ?? stages[0]
  const currentLesson = currentStage?.lessons.find((lesson) => lastLessonPath.endsWith('/'+lesson.id))

  return (
    <>
      <section className="bg-gradient-to-b from-[#E9F2FE] via-[#F5F9FF] to-white">
        <div className="shell py-12 sm:py-16">
          <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">我的学习 · 云端学习进度</span>
          <h1 className="mt-4 text-[32px] font-bold tracking-tight text-slate-900 sm:text-[40px]">接着上次的进度，继续构建。</h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-600">完成一节课后，学习路径和阶段页会同步更新；再次登录仍可继续学习。</p>
        </div>
      </section>

      <div className="shell grid gap-5 pb-12 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-brand-600">CONTINUE LEARNING</p>
                <h2 className="mt-2 text-[22px] font-bold text-slate-900">{currentLesson ? currentLesson.code+' '+currentLesson.title : user?.entitlements.length ? '查看已开通课程' : '尚未开通课程'}</h2>
                <p className="mt-2 text-[13px] text-slate-500">{currentStage.tag} · {currentStage.title}</p>
              </div>
              <span className={`chip ${accentClass[currentStage.accent].softBg} ${accentClass[currentStage.accent].text}`}>{stageStatusLabel[currentStage.status]}</span>
            </div>
            <p className="mt-5 max-w-2xl text-[13.5px] leading-6 text-slate-600">{currentLesson?.desc ?? '通过微信联系管理员购买，确认开通后即可开始学习。'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={lastLessonPath} className="btn btn-lg btn-primary"><Play className="h-4 w-4" />{hasContinue ? '继续学习' : '查看学习路径'}</Link>
              <Link to={`/stage/${currentStage.slug}`} className="btn btn-lg btn-outline">查看本阶段<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="h-sec">四阶段学习路径</h2>
              <Link to="/path" className="link-more">查看完整路径<ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stages.map((stage) => {
                const formal = formalLessons(stage.lessons)
                const done = formal.filter((lesson) => lesson.status === 'completed').length
                return (
                  <Link key={stage.id} to={`/stage/${stage.slug}`} className="card p-5 transition hover:border-brand-200 hover:shadow-lift">
                    <div className="flex items-center justify-between gap-2"><span className="text-[12px] text-slate-500">{stage.tag}</span><StageChip status={stage.status} label={stageStatusLabel[stage.status]} /></div>
                    <h3 className="mt-3 text-[16px] font-semibold text-slate-900">{stage.title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{stage.subtitle}</p>
                    <Progress value={Math.round(done / Math.max(1, formal.length) * 100)} className="mt-4" barClassName={accentClass[stage.accent].bg} />
                    <p className="mt-2 text-right text-[11.5px] text-slate-500">{done} / {formal.length} 节课</p>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <p className="text-xs text-slate-500">{user?.phoneMasked} · <Link to="/account" className="text-brand-600">账号设置</Link></p>
          <section className="card p-5">
            <h2 className="text-[15px] font-semibold text-slate-900">总体学习进度</h2>
            <div className="mt-5 flex items-center gap-5">
              <Ring percent={overallPercent} size={96} stroke={9}><strong className="text-xl text-slate-900">{overallPercent}%</strong></Ring>
              <p className="text-[13px] leading-6 text-slate-600">已完成 <strong>{completedLessons}</strong> / {totalLessons} 节课<br />下一步：{currentLesson?.title ?? '查看学习路径'}</p>
            </div>
          </section>
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900"><FolderKanban className="h-4 w-4 text-brand-600" />阶段作品</h2>
            <div className="mt-4 space-y-3">
              {stages.map((stage) => <Link key={stage.id} to={`/project/${stage.project.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2.5 text-[12.5px] hover:border-brand-200"><span>{stage.project.title}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-600" /></Link>)}
            </div>
          </section>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-[12.5px] leading-6 text-slate-600"><CheckCircle2 className="mb-2 h-5 w-5 text-brand-600" /><strong className="text-slate-900">先完成任务，再标记课程。</strong><br />每节课的清单帮助你确认项目真的跑通。</div>
        </aside>
      </div>
    </>
  )
}
