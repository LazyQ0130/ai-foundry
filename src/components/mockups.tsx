import { BookOpen, FileText, Sparkles } from 'lucide-react'
import { stages, type Stage } from '../data/courses.js'

/** Public curriculum metadata; this is an illustration, not a fabricated user progress record. */
export function HeroAppMockup({ className = '', stage = stages[0] }: { className?: string; stage?: Stage }) {
  return <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`} aria-label={`${stage.project.title}项目示意`}>
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-xs text-slate-500"><span>AIFoundry</span><span>课程与项目示意</span></div>
    <div className="p-5 sm:p-6">
      <p className="text-xs font-medium text-brand-600">{stage.title}</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900">{stage.project.title}</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><p className="mb-2 text-xs text-slate-500">学习步骤</p><ol className="space-y-2">{stage.lessons.slice(0,4).map(l => <li key={l.id} className="flex gap-2 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600"><BookOpen size={14} className="mt-1 shrink-0"/>{l.title}</li>)}</ol></div>
        <div className="rounded-xl bg-brand-50 p-4"><Sparkles size={20} className="text-brand-600"/><p className="mt-3 text-sm font-medium">边学边构建</p><p className="mt-2 text-xs leading-6 text-slate-500">{stage.exitState}</p><p className="mt-4 text-xs text-brand-600">运行 · 修改 · 验证</p></div>
      </div>
    </div>
  </div>
}

const architecture: Record<string, string[]> = {
  'stage-1': ['Next.js / TypeScript', '搜索与筛选', 'AI Coding', 'Git 版本保存'],
  'stage-2': ['Next.js / TypeScript', 'Prisma / PostgreSQL', '登录与权限', 'Vercel 部署'],
  'stage-3': ['OpenAI-compatible API', '文档分块 / Embedding', 'PostgreSQL / pgvector', '检索与引用验证'],
  'stage-4': ['Tool / MCP / Workflow', '工具权限与人工确认', '多步任务与恢复', '评估与安全边界'],
}
export function StageArchMockup({ className = '', stage = stages[0] }: { className?: string; stage?: Stage }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}><p className="text-xs text-brand-600">{stage.title} · 技术路线</p><h3 className="mt-2 font-semibold">{stage.project.title}</h3><div className="mt-5 grid grid-cols-2 gap-3">{architecture[stage.slug]?.map(item => <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-600"><FileText size={16} className="mb-2 text-brand-600"/>{item}</div>)}</div></div>
}
export function KnowledgeBaseMockup({ className = '', stage = stages[2] }: { className?: string; stage?: Stage }) {
  return <HeroAppMockup className={className} stage={stage}/>
}
