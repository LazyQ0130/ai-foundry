import { Link } from 'react-router-dom'
import { authPath } from '../lib/authNavigation.js'

export function LessonSignInActions({ returnTo }: { returnTo: string }) {
  return <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
    <Link to={authPath('login', returnTo)} className="btn btn-md btn-primary">登录并记录进度</Link>
    <Link to={authPath('register', returnTo)} className="link-more min-h-10 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">注册账号</Link>
  </div>
}

/** Reading the free lessons never requires a completion record or a purchase. */
export function ExperienceNextStep({ preparation }: { preparation: boolean }) {
  return <section aria-label="体验课下一步" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h2 className="text-sm font-semibold text-slate-900">{preparation ? '准备好后，继续第一次修改' : '接下来怎么学？'}</h2>
    <p className="mt-2 text-[13px] leading-6 text-slate-600">{preparation
      ? '确认 Starter 已在浏览器中运行，再进入 1.1。也可以先阅读下一课；任务记录不会自动标记为完成。'
      : '后续正式课程需要开通 Stage 1。你可以先查看完整课程安排；无需标记体验课完成，也能继续了解。'}</p>
    <Link to={preparation ? '/lesson/stage-1/s1-l1' : '/stage/stage-1'} className="btn btn-md btn-outline mt-3 w-full">
      {preparation ? '继续免费体验 1.1' : '查看 Stage 1 完整课程'}
    </Link>
  </section>
}
