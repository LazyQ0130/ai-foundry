import {
  ArrowRight,
  Bot,
  BookOpen,
  Clock,
  Database,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Route,
  Search,
  Settings,
  Sparkles,
  Upload,
  User,
} from 'lucide-react'
import { Logo, Wordmark } from './Icon'
import { Progress } from './ui'

/* ------------------------------------------------------------------ */
/* 首页 Hero：产品界面示意                                              */
/* ------------------------------------------------------------------ */

const railItems = [
  { icon: Route, label: '学习路径', active: true },
  { icon: BookOpen, label: '课程' },
  { icon: LayoutDashboard, label: '项目' },
  { icon: User, label: '我的学习' },
]

const chapterItems = [
  { title: '创建后端开发环境', time: '12:30', state: 'done' },
  { title: '设计 API 的数据模型', time: '15:45', state: 'active' },
  { title: '构建数据库', time: '14:20', state: 'idle' },
  { title: '接入大模型与向量库', time: '20:32', state: 'idle' },
]

export function HeroAppMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80 ${className}`}>
      {/* 窗口标题栏 */}
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Logo className="h-3.5 w-3.5" />
          <Wordmark className="!text-[9px]" />
        </div>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[7.5px] text-slate-500">项目</span>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-[68px] shrink-0 border-r border-slate-100 bg-slate-50/60 py-2">
          {railItems.map((it) => (
            <div
              key={it.label}
              className={`mx-1 mb-0.5 flex items-center gap-1 rounded px-1.5 py-1 text-[7.5px] ${
                it.active ? 'bg-brand-50 font-medium text-brand-600' : 'text-slate-400'
              }`}
            >
              <it.icon className="h-2.5 w-2.5" strokeWidth={2} />
              {it.label}
            </div>
          ))}
        </aside>

        {/* 主区域 */}
        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-slate-900">AI 全栈开发实战</p>
              <p className="mt-1 text-[7.5px] leading-[11px] text-slate-400">
                从 0 到 1 构建一个真实可用的 AI 应用，掌握从产品构建到部署的全流程能力。
              </p>
              <span className="mt-1.5 inline-block rounded bg-brand-600 px-2 py-[3px] text-[7.5px] font-medium text-white">
                继续学习
              </span>
            </div>
            <div className="shrink-0 text-center">
              <div className="relative h-[34px] w-[34px]">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" className="stroke-brand-100" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 * 0.4}
                    className="stroke-brand-600"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[7.5px] font-semibold text-slate-700">
                  60%
                </span>
              </div>
              <p className="mt-0.5 text-[7px] text-slate-400">学习进度</p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-[1.15fr_1fr] gap-2.5">
            <div>
              <p className="mb-1 text-[7.5px] font-medium text-slate-500">课程内容</p>
              <div className="space-y-[3px]">
                {chapterItems.map((c) => (
                  <div
                    key={c.title}
                    className={`flex items-center justify-between rounded px-1.5 py-1 text-[7.5px] ${
                      c.state === 'active' ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-1">
                      <span
                        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                          c.state === 'active'
                            ? 'bg-white'
                            : c.state === 'done'
                              ? 'bg-emerald-400'
                              : 'bg-slate-300'
                        }`}
                      />
                      <span className="truncate">{c.title}</span>
                    </span>
                    <span className={c.state === 'active' ? 'text-white/80' : 'text-slate-400'}>{c.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-[7.5px] font-medium text-slate-500">项目实战进度</p>
              <div className="rounded-md border border-slate-100 bg-slate-50/60 p-1.5">
                <div className="flex items-center gap-1">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded bg-brand-100 text-brand-600">
                    <Bot className="h-2 w-2" strokeWidth={2.2} />
                  </span>
                  <span className="text-[7.5px] font-medium text-slate-700">AI 记事助手</span>
                </div>
                <p className="mt-1 text-[6.5px] leading-[9px] text-slate-400">
                  从数据到部署，构建一个可用的 AI 应用。完成这一章节的第一步。
                </p>
                <div className="mt-1.5 space-y-[3px]">
                  <Progress value={60} height="h-[3px]" />
                  <div className="flex items-center justify-between text-[6.5px] text-slate-400">
                    <span>6 / 10 任务</span>
                    <span>2 天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Stage 详情页 Hero：技术栈架构示意                                     */
/* ------------------------------------------------------------------ */

const archCards = [
  { title: '前端', items: ['React / Next.js'], icon: LayoutDashboard, className: 'col-start-1 row-start-1' },
  { title: '后端', items: ['Node.js / Express'], icon: FileText, className: 'col-start-3 row-start-1' },
  { title: '数据库', items: ['PostgreSQL / MongoDB'], icon: Database, className: 'col-start-1 row-start-3' },
  { title: 'AI 能力', items: ['大模型 / RAG'], icon: Sparkles, className: 'col-start-3 row-start-3' },
]

function ArchCard({ icon: CardIcon, title, note }: { icon: typeof FileText; title: string; note: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-card">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <CardIcon className="h-3.5 w-3.5" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold leading-tight text-slate-900">{title}</p>
        <p className="truncate text-[10px] leading-tight text-slate-400">{note}</p>
      </div>
    </div>
  )
}

export function StageArchMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* 窄屏：2×2 平铺，不画连线 */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {archCards.map((c) => (
          <ArchCard key={c.title} icon={c.icon} title={c.title} note={c.items[0]} />
        ))}
      </div>

      {/* 宽屏：四角 + 中心 API 枢纽 */}
      <div className="relative hidden sm:block">
        <div className="grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto_auto] items-center gap-x-4 gap-y-5">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {['M22 24 L50 50', 'M78 24 L50 50', 'M22 76 L50 50', 'M78 76 L50 50'].map((d) => (
              <path key={d} d={d} stroke="#BFDBFE" strokeWidth="0.6" strokeDasharray="2 2" fill="none" />
            ))}
          </svg>

          {archCards.map((c) => (
            <div key={c.title} className={`${c.className} relative z-10`}>
              <ArchCard icon={c.icon} title={c.title} note={c.items[0]} />
            </div>
          ))}

          <div className="relative z-10 col-start-2 row-start-2 flex items-center justify-center">
            <span className="inline-flex h-10 w-14 items-center justify-center rounded-xl bg-brand-600 text-[11px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,99,235,0.7)]">
              API
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 项目页 Hero：知识库助手界面示意                                       */
/* ------------------------------------------------------------------ */

const kbRail = [
  { icon: MessageSquare, label: '对话', active: true },
  { icon: BookOpen, label: '知识库' },
  { icon: FileText, label: '文档管理' },
  { icon: Settings, label: '设置' },
]

const kbQuick = [
  { title: '产品功能介绍', desc: '了解我们的核心功能' },
  { title: '技术方案文档', desc: '查看技术架构与技术选型' },
  { title: '操作手册', desc: '查询具体的操作步骤' },
  { title: '常见问题', desc: '查看常见问题与解答' },
]

export function KnowledgeBaseMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Logo className="h-3.5 w-3.5" />
          <Wordmark className="!text-[9px]" />
        </div>
        <span className="inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[7.5px] font-medium text-brand-600">
          <Upload className="h-2 w-2" strokeWidth={2.4} />
          上传文档
        </span>
      </div>

      <div className="flex">
        <aside className="w-[74px] shrink-0 border-r border-slate-100 bg-slate-50/60 py-2">
          <p className="px-2 text-[7.5px] font-medium text-slate-500">知识库助手</p>
          <div className="mt-1.5">
            {kbRail.map((it) => (
              <div
                key={it.label}
                className={`mx-1 mb-0.5 flex items-center gap-1 rounded px-1.5 py-1 text-[7.5px] ${
                  it.active ? 'bg-white font-medium text-brand-600 shadow-sm' : 'text-slate-400'
                }`}
              >
                <it.icon className="h-2.5 w-2.5" strokeWidth={2} />
                {it.label}
              </div>
            ))}
          </div>
          <div className="mx-1 mt-2 flex items-center gap-1 rounded border border-dashed border-slate-200 px-1.5 py-1 text-[7px] text-slate-400">
            <Plus className="h-2.5 w-2.5" strokeWidth={2} />
            新建知识库
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-4">
          <p className="text-center text-[12px] font-semibold text-slate-900">基于企业知识的 AI 助手</p>
          <p className="mt-1 text-center text-[7.5px] text-slate-400">
            上传相关的文档，基于专业知识获得更准确的回答
          </p>

          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5">
            <Search className="h-2.5 w-2.5 text-slate-300" strokeWidth={2.2} />
            <span className="truncate text-[7.5px] text-slate-400">请选择入库集，例如：我们的产品有哪些功能？</span>
            <span className="ml-auto inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-brand-600 text-white">
              <ArrowRight className="h-2 w-2" strokeWidth={2.6} />
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {kbQuick.map((q) => (
              <div key={q.title} className="rounded-md border border-slate-100 bg-slate-50/70 px-1.5 py-1.5">
                <p className="truncate text-[7px] font-medium text-slate-700">{q.title}</p>
                <p className="mt-[2px] text-[6px] leading-[8px] text-slate-400">{q.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1 text-[6.5px] text-slate-300">
            <Clock className="h-2 w-2" strokeWidth={2} />
            回答将附带引用来源
          </div>
        </div>
      </div>
    </div>
  )
}
