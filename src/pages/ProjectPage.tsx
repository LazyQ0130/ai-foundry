import { stageCompletedCount, stageLessonCount } from '../data/courses'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Code2,
  Database,
  ListChecks,
  Play,
  Rocket,
  Search,
  Sparkles,
  Target,
} from 'lucide-react'
import { Icon } from '../components/Icon'
import { HeroAppMockup, KnowledgeBaseMockup, StageArchMockup } from '../components/mockups'
import { Breadcrumb, Progress, Ring, Tick } from '../components/ui'
import { getProject, type ProjectDetail } from '../data/site'
import { useProgress } from '../data/progress'

const goalIcon: Record<string, typeof Search> = {
  search: Search,
  database: Database,
  build: Sparkles,
  deploy: Rocket,
}

function SectionCard({
  icon,
  title,
  intro,
  children,
}: {
  icon: React.ReactNode
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <section className="card p-5">
      <div className="flex items-start gap-2.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          {icon}
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <p className="mt-1.5 text-[12.5px] leading-5 text-slate-500">{intro}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function NotFound({ id }: { id?: string }) {
  return (
    <div className="shell py-24 text-center">
      <h1 className="text-[24px] font-bold text-slate-900">没有找到这个项目</h1>
      <p className="mt-2 text-sm text-slate-500">项目 id：{id}</p>
      <Link to="/path" className="btn btn-md btn-primary mt-6">
        返回学习路径
      </Link>
    </div>
  )
}

function ProjectView({ project }: { project: ProjectDetail }) {
  const { stages } = useProgress()
  const stage = stages.find((item) => item.project.id === project.id)
  const accessible = stage?.lessons.find(l => l.isPublished !== false && l.status !== 'locked' && l.status !== 'completed')
  const lessonPath = accessible && stage ? `/lesson/${stage.slug}/${accessible.id}` : stage ? `/stage/${stage.slug}` : '/path'
  const doneCount = stage ? stageCompletedCount(stage) : 0
  const total = stage ? stageLessonCount(stage) : 0
  const percent = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E9F2FE] via-[#F1F7FF] to-white">
        <div
          className="grid-bg pointer-events-none absolute inset-0 opacity-60"
          style={{ maskImage: 'linear-gradient(to bottom, black, transparent 84%)' }}
        />
        <div className="shell relative grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:py-14">
          <div>
            <Breadcrumb
              items={[{ label: '项目', to: '/projects' }, { label: project.title }]}
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="chip bg-violet-50 text-violet-700">{project.stageTag}</span>
              <span className="chip bg-slate-100 text-slate-500">{project.stageTitle}</span>
            </div>
            <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[38px]">
              {project.title}
            </h1>
            <p className="mt-3 max-w-xl text-[13.5px] leading-6 text-slate-500">{project.desc}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
                {project.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
                {project.duration}
              </span>
              {project.supportTemplate ? (
                <span className="inline-flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.9} />
                  支持代码模板
                </span>
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={lessonPath} className="btn btn-lg btn-primary">
                学习相关课程
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#project-goals" className="btn btn-lg btn-outline">
                <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                查看项目目标
              </a>
            </div>
          </div>

          {project.id === 'rag' ? (
            <KnowledgeBaseMockup stage={stage} className="shadow-[0_28px_64px_-30px_rgba(37,99,235,0.35)]" />
          ) : project.id === 'agent' ? (
            <StageArchMockup stage={stage} className="shadow-[0_28px_64px_-30px_rgba(37,99,235,0.25)]" />
          ) : (
            <HeroAppMockup stage={stage} className="shadow-[0_28px_64px_-30px_rgba(37,99,235,0.25)]" />
          )}
        </div>
      </section>

      {/* ------------------------------ 主体 ------------------------------ */}
      <section className="shell grid grid-cols-1 gap-6 pb-8 pt-14 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {/* 项目目标 */}
          <div id="project-goals" className="scroll-mt-20"><SectionCard
            icon={<Target className="h-3.5 w-3.5" strokeWidth={2} />}
            title="项目目标"
            intro={project.goalsIntro}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {project.goals.map((g) => {
                const GIcon = goalIcon[g.icon] ?? Sparkles
                return (
                  <div key={g.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <GIcon className="h-4 w-4 text-brand-600" strokeWidth={1.9} />
                    <p className="mt-2 text-[12.5px] font-semibold text-slate-900">{g.title}</p>
                    <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{g.desc}</p>
                  </div>
                )
              })}
            </div>
          </SectionCard></div>

          {/* 必做功能 */}
          <SectionCard
            icon={<ListChecks className="h-3.5 w-3.5" strokeWidth={2} />}
            title="必做功能"
            intro={project.featuresIntro}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {project.features.map((f) => (
                <div key={f.title} className="rounded-xl border border-slate-200 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                      <Icon name="build" className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[12.5px] font-semibold text-slate-900">{f.title}</p>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-5 text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 推荐扩展 */}
          <SectionCard
            icon={<Rocket className="h-3.5 w-3.5" strokeWidth={2} />}
            title="推荐扩展"
            intro={project.extensionsIntro}
          >
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {project.extensions.map((e) => (
                <li key={e} className="flex items-start gap-2.5">
                  <span className="mt-[3px] h-[15px] w-[15px] shrink-0 rounded-[4px] border-[1.5px] border-slate-300" />
                  <span className="text-[12.5px] leading-5 text-slate-600">{e}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* 完成标准 */}
          <SectionCard
            icon={<Check className="h-4 w-4" strokeWidth={2.6} />}
            title="完成标准"
            intro={project.standardsIntro}
          >
            <ul className="space-y-3">
              {project.standards.map((s) => (
                <li key={s} className="flex items-start gap-2.5">
                  <Tick checked className="mt-[1px]" />
                  <span className="text-[12.5px] leading-5 text-slate-600">{s}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* 交付与 GitHub 建议 */}
          <SectionCard
            icon={<Rocket className="h-3.5 w-3.5" strokeWidth={2} />}
            title="推荐展示方式"
            intro={project.deliverIntro}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[12.5px] font-medium text-slate-700">作品集里放这些</p>
                <ul className="mt-2.5 space-y-2">
                  {project.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
                      <span className="text-[12px] leading-5 text-slate-600">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                <p className="text-[12.5px] font-medium text-slate-700">GitHub 项目建议</p>
                <ul className="mt-2.5 space-y-2">
                  {project.githubTips.map((g) => (
                    <li key={g} className="flex items-start gap-2">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                      <span className="text-[12px] leading-5 text-slate-600">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ------------------------------ 右栏 ------------------------------ */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
                <Icon name="trending" className="h-4 w-4 text-brand-600" />
                关联课程进度
              </h2>
              <Link to="/path" className="link-more !text-[11.5px]">
                查看学习路径
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Ring percent={percent} size={82} stroke={8}>
                <span className="text-[17px] font-bold leading-none text-slate-900">{percent}%</span>
              </Ring>
              <div className="min-w-0">
                <p className="text-[12px] text-slate-400">已完成</p>
                <p className="mt-0.5 text-[13px] font-semibold text-slate-900">
                  {doneCount} / {total} 节课程
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-[12px]">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.9} />
                  正式课程总量
                </dt>
                <dd className="font-medium text-slate-700">{total} 节</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-400">
                  <Target className="h-3.5 w-3.5" strokeWidth={1.9} />
                  已完成正式课程
                </dt>
                <dd className="font-medium text-slate-700">{doneCount} 节</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-slate-400">
                  <Rocket className="h-3.5 w-3.5" strokeWidth={1.9} />
                  待完成正式课程
                </dt>
                <dd className="font-medium text-slate-700">{Math.max(0, total - doneCount)} 节</dd>
              </div>
            </dl>

            <Link to={lessonPath} className="btn btn-md btn-primary mt-4 w-full">
              学习相关课程
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
                <ListChecks className="h-4 w-4 text-brand-600" strokeWidth={2} />
                项目验收清单
              </h2>
              <span className="text-[11.5px] tabular-nums text-slate-400">
                {doneCount} / {total}
              </span>
            </div>
            <Progress value={percent} className="mt-3" />
            <ul className="mt-4 space-y-2.5">
              {project.tasks.map((t, i) => (
                <li key={t.title} className="flex items-start gap-2.5">
                  <Tick checked={false} size="sm" className="mt-[1px]" />
                  <span
                    className={`text-[12px] leading-5 ${
                      'text-slate-600'
                    }`}
                  >
                    {i + 1}. {t.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-900">
                <BookOpen className="h-4 w-4 text-brand-600" strokeWidth={2} />
                相关学习资源
              </h2>
              <Link to="/courses" className="link-more !text-[11.5px]">
                查看更多资源
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="mt-3.5 space-y-2">
              {project.resources.map((r) => (
                <li key={r.title}>
                  <Link
                    to="/courses"
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 transition hover:border-slate-300 hover:bg-white"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-slate-800">{r.title}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {r.kind} · {r.meta}
                      </span>
                    </span>
                    <span className="chip shrink-0 bg-white text-brand-600 ring-1 ring-brand-100">开始学习</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  )
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const project = id ? getProject(id) : undefined
  if (!project) return <NotFound id={id} />
  return <ProjectView project={project} />
}
