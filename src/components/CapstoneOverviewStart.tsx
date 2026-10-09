import { Link } from 'react-router-dom'
import { capstoneLessons } from '../data/capstoneLessons.js'
import type { CapstoneSummary } from '../data/capstoneProgress.js'
import { Progress } from './ui.js'

export function CapstoneOverviewStart({ data, loading }: { data: CapstoneSummary | null; loading: boolean }) {
  if (loading) return <p role="status" className="mt-5 text-sm text-slate-500">正在加载项目进度…</p>
  if (!data) return null
  const progress = data.progress
  const current = capstoneLessons.find(l => l.id === progress?.continueLessonId)
  return <div className="mt-5 rounded-xl border border-brand-200 bg-white p-5 sm:max-w-xl">
    {data.access && progress ? <>
      <p className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700"><span>毕业项目进度</span><span>{progress.completed} / {progress.total}</span></p>
      <Progress value={progress.completed / progress.total * 100} className="mt-2" />
      {current ? <><p className="mt-4 text-xs font-semibold text-brand-600">{progress.completed ? '继续' : '开始'}：{current.id.toUpperCase()}</p><p className="mt-1 font-semibold leading-6 text-slate-900">{current.title}</p><Link className="btn btn-md btn-primary mt-4" to={'/capstone/lessons/' + current.id}>{progress.completed ? '继续学习' : '开始毕业项目'}</Link></> : <><p className="mt-4 text-sm text-slate-600">Capstone 已完成。</p><Link className="btn btn-md btn-primary mt-4" to="/capstone/lessons/c9">查看毕业项目</Link></>}
    </> : <Link to="/pricing" className="btn btn-md btn-primary">查看项目版</Link>}
  </div>
}
