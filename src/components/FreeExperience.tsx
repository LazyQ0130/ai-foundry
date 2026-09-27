import { Link } from 'react-router-dom'

export function PrepFeedback({ done }: { done: boolean }) {
  return <section className="card p-4" aria-label="开始前准备进度">
    <h2 className="font-semibold text-slate-900">{done ? '✓ 开始前准备已完成' : '开始前准备'}</h2>
    <p className="mt-3 text-sm text-slate-600">{done ? '100% 准备完成 · Starter 已经跑起来' : '0 / 1 · 完成环境准备后即可进入 1.1'}</p>
    {done && <Link className="btn btn-md btn-primary mt-4 w-full" to="/lesson/stage-1/s1-l1">进入免费体验 1.1</Link>}
    <p className="mt-3 text-xs leading-5 text-slate-500">第 0 课为准备课，不计入 29 节正式课程进度。</p>
  </section>
}
export function FreeExperience({ prepDone, firstDone }: { prepDone: boolean; firstDone: boolean }) {
  const complete = prepDone && firstDone
  return <section className="card p-6" aria-label="免费体验">
    <p className="text-xs font-semibold text-brand-600">{complete ? '✓ 免费体验已完成' : '免费体验 AIFoundry'}</p>
    <h2 className="mt-3 text-xl font-bold text-slate-900">{complete ? '第一次真实修改，已经完成。' : '从跑起一个真实项目开始'}</h2>
    <p className="mt-3 text-sm leading-6 text-slate-600">{complete ? '你已经跑起 Starter，并完成第一次真实 AI Coding 修改。接下来你会继续学习需求表达、Bug 修复、代码改动检查、Git 保存与独立完成一个功能。' : '从跑起一个真实项目开始，用 AI 完成你的第一次代码修改。'}</p>
    <ol className="my-4 space-y-2 text-sm text-slate-600"><li>{prepDone ? '✓' : '○'} 第 0 课 · 准备开发环境</li><li>{firstDone ? '✓' : '○'} 1.1 · 第一次让 AI 改一个真实项目</li></ol>
    <div className="flex flex-wrap gap-3"><Link className="btn btn-md btn-primary" to={complete ? '/stage/stage-1' : prepDone ? '/lesson/stage-1/s1-l1' : '/lesson/stage-1/s1-l0'}>{complete ? '查看 Stage 1 完整内容' : prepDone ? '继续免费体验' : '开始免费体验'}</Link>{complete && <Link className="btn btn-md btn-outline" to="/pricing">查看学习方案</Link>}</div>
    {!complete && <p className="mt-3 text-xs text-slate-500">{prepDone ? 'Starter 已准备好，下一步让 AI 真正修改它。' : '无需购买，登录即可开始。'}</p>}
  </section>
}
