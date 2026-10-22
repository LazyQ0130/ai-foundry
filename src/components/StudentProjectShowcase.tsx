import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { studentProjects } from '../data/studentProjects'
import { SectionHeading } from './ui'

const projectCount = String(studentProjects.length).padStart(2, '0')

export default function StudentProjectShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeProject = studentProjects[activeIndex]
  const projectNumber = String(activeIndex + 1).padStart(2, '0')

  function stepProject(direction: number) {
    setActiveIndex((index) => (index + direction + studentProjects.length) % studentProjects.length)
  }

  return (
    <section id="why" aria-labelledby="student-projects-title" className="shell scroll-mt-24 pb-12 sm:pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div id="student-projects-title">
          <SectionHeading title="学员项目展示" sub="从校园生活到 AI 研究，把想法做成自己的作品。" />
        </div>
        <p className="pb-1 text-[12px] text-slate-500">8 个项目 · 点击下方切换</p>
      </div>

      <div className="mt-6 rounded-[24px] bg-[#f3f4f5] p-3 sm:mt-7 sm:p-5">
        <div id="student-project-detail" className="overflow-hidden rounded-[18px] border border-white bg-white shadow-[0_8px_32px_-16px_rgba(15,23,42,0.16)] lg:grid lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 items-center bg-[#f8f7f4] p-3 sm:p-5 lg:p-6">
            <img
              key={activeProject.id}
              src={activeProject.image}
              alt={`${activeProject.title}项目界面`}
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
              className="aspect-[3/2] h-auto w-full rounded-xl border border-slate-200/60 bg-slate-100 object-contain shadow-sm"
            />
          </div>

          <div className="relative isolate flex min-w-0 flex-col border-t border-slate-100 px-5 py-6 sm:px-7 lg:border-l lg:border-t-0 lg:px-7 lg:py-8">
            <span aria-hidden="true" className="pointer-events-none absolute -top-1 right-4 -z-10 select-none text-[104px] font-bold leading-none tracking-tighter text-slate-100/80 lg:text-[120px]">{projectNumber}</span>
            <div aria-live="polite" aria-atomic="true">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/90 px-3 py-1.5 text-[12px] font-semibold tracking-wide text-cyan-800">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                {activeProject.category}
              </span>
              <h3 className="mt-5 text-[23px] font-bold leading-snug tracking-tight text-slate-950 sm:text-[25px]">{activeProject.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">{activeProject.description}</p>
              <p className="mt-5 text-[12px] font-semibold tracking-wider text-brand-600">功能亮点</p>
              <ul className="mt-2.5 space-y-2 text-[13px] leading-6 text-slate-600">
                {activeProject.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/80" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div aria-label="项目特色" className="mt-5 flex flex-wrap gap-1.5">
                {activeProject.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200/80 bg-[#f7f6f4] px-2.5 py-1 text-[11px] font-medium text-slate-600">{tag}</span>
                ))}
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-7">
              <p aria-label={`第 ${activeIndex + 1} 个项目，共 ${studentProjects.length} 个`} className="font-mono text-[11px] tracking-[0.16em] text-slate-500">PROJECT {projectNumber} / {projectCount}</p>
              <div className="flex gap-1.5">
                <button type="button" aria-label="上一个项目" aria-controls="student-project-detail" onClick={() => stepProject(-1)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                  <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                </button>
                <button type="button" aria-label="下一个项目" aria-controls="student-project-detail" onClick={() => stepProject(1)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                  <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div role="group" aria-label="选择展示项目" className="mt-4 grid grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-4 sm:gap-3">
          {studentProjects.map((project, index) => (
            <button
              key={project.id}
              type="button"
              aria-label={`查看${project.title}`}
              aria-pressed={activeIndex === index}
              aria-controls="student-project-detail"
              onClick={() => setActiveIndex(index)}
              className={`group min-w-0 rounded-[14px] border-2 p-2 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-reduce:transition-none sm:p-2.5 ${activeIndex === index ? 'border-brand-400 bg-brand-50/70 shadow-sm' : 'border-transparent bg-white hover:border-slate-300 hover:shadow-sm'}`}
            >
              <img src={project.thumbnail} alt="" width={480} height={320} loading="lazy" decoding="async" className="aspect-[3/2] h-auto w-full rounded-lg border border-slate-100 bg-slate-100 object-contain" />
              <span className={`mt-2 block text-center text-[11px] font-semibold leading-5 sm:text-[12px] ${activeIndex === index ? 'text-brand-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{project.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
