import { CapstonePathCard } from '../components/CapstoneShowcase'
import { curriculumFormalLessonCount, stageLessonCount } from '../data/courses'
import { stageCompletedCount } from '../data/learningProgress'
import { FreeExperience } from '../components/FreeExperience'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FolderKanban, Play } from 'lucide-react'
import { Progress, Ring, StageChip } from '../components/ui'
import { accentClass, stageStatusLabel } from '../data/courses'
import { useProgress } from '../data/progress'
import { useAuth } from '../auth/AuthProvider'
import { dashboardState } from '../data/dashboardState'

export default function Dashboard() {
  const { stages, completedLessons, overallPercent, lastLessonPath } = useProgress()
  const { user } = useAuth()
  const learning = dashboardState(stages, user?.entitlements ?? [], lastLessonPath)
  const totalLessons = curriculumFormalLessonCount()
  const currentStage = learning.kind === 'free' ? stages[0] : learning.stage
  const currentLesson = learning.kind === 'continue' ? learning.lesson : undefined

  return (
    <>
      <section className="bg-gradient-to-b from-[#E9F2FE] via-[#F5F9FF] to-white">
        <div className="shell py-12 sm:py-16">
          <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">我的学习 · 云端学习进度</span>
          <h1 className="mt-4 text-[32px] font-bold tracking-tight text-slate-900 sm:text-[40px]">{user?.entitlements.length ? '接着上次的进度，继续构建。' : '免费体验 AIFoundry'}</h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-600">完成一节课后，学习路径和阶段页会同步更新；再次登录仍可继续学习。</p>
        </div>
      </section>

      <div className="shell grid gap-5 pb-12 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-6">
          {!user?.entitlements.length ? <FreeExperience prepDone={stages.some(s => s.lessons.some(l => l.id === 's1-l0' && l.status === 'completed'))} firstDone={stages.some(s => s.lessons.some(l => l.id === 's1-l1' && l.status === 'completed'))}/> : <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-brand-600">CONTINUE LEARNING</p>
                <h2 className="mt-2 text-[22px] font-bold text-slate-900">{learning.kind === 'continue' ? `${learning.lesson.code} ${learning.lesson.title}` : learning.kind === 'completed' ? `${learning.stage.tag} 已完成` : '查看已开通课程'}</h2>
                <p className="mt-2 text-[13px] text-slate-500">{currentStage.tag} · {currentStage.title}</p>
              </div>
              <span className={`chip ${accentClass[currentStage.accent].softBg} ${accentClass[currentStage.accent].text}`}>{stageStatusLabel[currentStage.status]}</span>
            </div>
            <p className="mt-5 max-w-2xl text-[13.5px] leading-6 text-slate-600">{learning.kind === 'continue' ? learning.lesson.desc : learning.kind === 'completed' ? '可以回顾已学课程、查看阶段自检，或了解下一阶段。' : '当前没有可继续的已发布课程，可以回顾已开通内容或查看学习路径。'}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={learning.kind === 'continue' ? learning.path : `/stage/${currentStage.slug}`} className="btn btn-lg btn-primary"><Play className="h-4 w-4" />{learning.kind === 'continue' ? '继续学习' : '回顾本阶段'}</Link>
              <Link to={learning.kind === 'completed' ? `/stage/${currentStage.slug}#cp-1` : '/path'} className="btn btn-lg btn-outline">{learning.kind === 'completed' ? '查看阶段自检' : '查看学习路径'}<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </section>}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="h-sec">四阶段学习路径</h2>
              <Link to="/path" className="link-more">查看完整路径<ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stages.map((stage) => {
                const total = stageLessonCount(stage)
                const done = stageCompletedCount(stage)
                return (
                  <Link key={stage.id} to={`/stage/${stage.slug}`} className="card p-5 transition hover:border-brand-200 hover:shadow-lift">
                    <div className="flex items-center justify-between gap-2"><span className="text-[12px] text-slate-500">{stage.tag}</span><StageChip status={stage.status} label={stageStatusLabel[stage.status]} /></div>
                    <h3 className="mt-3 text-[16px] font-semibold text-slate-900">{stage.title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{stage.subtitle}</p>
                    <Progress value={Math.round(done / Math.max(1, total) * 100)} className="mt-4" barClassName={accentClass[stage.accent].bg} />
                    <p className="mt-2 text-right text-[11.5px] text-slate-500">{done} / {total} 节课</p>
                  </Link>
                )
              })}
            </div>
          </section>
          <CapstonePathCard />
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
