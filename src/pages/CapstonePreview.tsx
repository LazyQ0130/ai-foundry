import { Link } from 'react-router-dom'
import { LessonMarkdown } from '../components/LessonMarkdown'
import preview from '../data/previews/c1.md?raw'

export default function CapstonePreview() {
  return <div className="shell py-6 sm:py-10">
    <article className="lesson-article mx-auto max-w-[740px]">
      <Link to="/capstone" className="text-[13px] text-brand-700">← 返回毕业项目</Link>
      <header className="lesson-header">
        <span className="chip bg-brand-50 text-brand-700">C1 · 免费节选</span>
        <h1 className="lesson-title">先别写代码：把 AI 研究工作台想清楚</h1>
        <p className="mt-3 text-[14px] leading-6 text-slate-600"><strong>本课目标：</strong>从自己的研究场景出发，定义 AI 研究工作台的主要用户、问题、JTBD、V1 范围、用户流程与可验证的成功标准，完成 Product Brief 和 User Flow。</p>
        <p className="mt-2 text-[12px] text-slate-500">以下为课程节选；试看不记录学习进度。</p>
      </header>
      <LessonMarkdown body={preview} />
      <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="text-lg font-semibold text-slate-900">继续把产品定义做完整</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">完整 C1 还包含职责边界、MVP 取舍、用户流程和成功标准。9 节课程已开放，完整学习需项目工坊权益。</p>
        <ul className="mt-3 space-y-1.5 text-[13px] leading-5 text-slate-600">
          <li>· 左侧 C1–C9 课程目录，随时跳到任意一课</li>
          <li>· 右侧学习任务清单，勾选完成后标记本课完成</li>
          <li>· 毕业项目进度云端保存，「继续毕业项目」直达下一节未完成的课</li>
          <li>· 毕业项目 Starter 下载</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3"><Link to="/capstone/lessons/c1" className="btn btn-primary">进入完整 C1</Link><Link to="/pricing" className="btn btn-outline">查看项目版</Link></div>
      </div>
    </article>
  </div>
}
