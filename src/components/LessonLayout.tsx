import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ListChecks, X } from 'lucide-react'

/** Shared reading shell; each course keeps its own navigation and progress. */
export function LessonLayout({ sidebar, workbench, children, remainingTasks }: {
  sidebar: (close: () => void, idPrefix: string) => ReactNode
  workbench: ReactNode
  children: ReactNode
  remainingTasks: number
}) {
  const [drawer, setDrawer] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!drawer) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawer(false)
      if (event.key !== 'Tab') return
      const items = panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!items?.length) return
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown)
    const desktop = window.matchMedia('(min-width: 1360px)')
    const closeOnDesktop = () => { if (desktop.matches) setDrawer(false) }
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', keydown)
      desktop.removeEventListener('change', closeOnDesktop)
      trigger.current?.focus()
    }
  }, [drawer])
  return <div className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-6 sm:px-6 min-[1360px]:pb-6">
    <div className="mb-1 flex items-center justify-between gap-2 min-[1360px]:hidden">
      <button ref={trigger} type="button" aria-expanded={drawer} aria-controls="lesson-directory" onClick={() => setDrawer(true)} className="btn btn-sm btn-outline"><ListChecks className="h-3.5 w-3.5" />课程目录</button>
      <a href="#lesson-workbench" className="btn btn-sm btn-outline">学习任务与进度</a>
    </div>
    <p className="mb-4 text-right text-[12px] text-slate-500 min-[1360px]:hidden">{remainingTasks ? `还有 ${remainingTasks} 项任务待确认` : '本课任务已全部确认'}</p>
    <div className="flex gap-6">
      <aside className="hidden w-[260px] shrink-0 min-[1360px]:block">
        <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">{sidebar(() => setDrawer(false), 'desktop')}</div>
      </aside>
      <div className="mx-auto min-w-0 max-w-[740px] flex-1">{children}</div>
      <aside className="hidden w-[260px] shrink-0 min-[1360px]:block"><div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-2">{workbench}</div></aside>
    </div>
    <div id="lesson-workbench" className="mx-auto mt-10 max-w-[740px] scroll-mt-20 min-[1360px]:hidden">{workbench}</div>
    {drawer && <div className="fixed inset-0 z-50 min-[1360px]:hidden">
      <button type="button" aria-label="关闭目录" onClick={() => setDrawer(false)} className="absolute inset-0 bg-slate-900/40" tabIndex={-1} />
      <div ref={panel} id="lesson-directory" role="dialog" aria-modal="true" aria-label="课程目录" className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex justify-end px-2 pt-2"><button type="button" onClick={() => setDrawer(false)} aria-label="关闭" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="min-h-0 flex-1">{sidebar(() => setDrawer(false), 'drawer')}</div>
      </div>
    </div>}
  </div>
}
