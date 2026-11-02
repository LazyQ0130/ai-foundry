import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { CircleHelp, ListChecks, X } from 'lucide-react'
import type { LessonHelpItem } from '../lib/lessonMarkdown.js'

const LessonHelpPanel = lazy(() => import('./LessonHelpPanel.js'))

/** Shared reading shell; each course keeps its own navigation and progress. */
export function LessonLayout({ sidebar, workbench, children, remainingTasks, lessonKey, lessonTitle = '', helpItems = [] }: {
  sidebar: (close: () => void, idPrefix: string) => ReactNode
  workbench: ReactNode
  children: ReactNode
  remainingTasks: number
  lessonKey?: string
  lessonTitle?: string
  helpItems?: LessonHelpItem[]
}) {
  const [drawer, setDrawer] = useState<'directory' | 'help' | null>(null)
  const closeDrawer = useCallback(() => setDrawer(null), [])
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useEffect(closeDrawer, [lessonKey, closeDrawer])
  useEffect(() => {
    if (drawer !== 'directory') return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true })
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeDrawer() }
      if (event.key !== 'Tab') return
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []).filter(element => element.getClientRects().length)
      if (!items?.length) return
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', keydown)
    const desktop = window.matchMedia('(min-width: 1360px)')
    const closeOnDesktop = () => { if (desktop.matches) closeDrawer() }
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', keydown)
      desktop.removeEventListener('change', closeOnDesktop)
      trigger.current?.focus({ preventScroll: true })
    }
  }, [drawer, closeDrawer])
  return <div className="mx-auto w-full max-w-[1440px] px-5 pb-10 pt-3 sm:px-6 min-[1360px]:pb-6">
    <div aria-label="课程工具" className="sticky top-14 z-30 -mx-5 mb-3 flex items-center justify-between gap-1 border-b border-slate-200 bg-white px-3 py-2 sm:-mx-6 sm:justify-start sm:gap-2 sm:px-6 min-[1360px]:hidden">
      <button ref={trigger} type="button" aria-label="课程目录" aria-expanded={drawer === 'directory'} aria-controls="lesson-directory" onClick={() => setDrawer('directory')} className="btn btn-sm btn-outline shrink-0 px-2"><ListChecks aria-hidden="true" className="h-3.5 w-3.5" />目录</button>
      <a href="#lesson-workbench" aria-label={`任务与进度${remainingTasks > 0 ? `，${remainingTasks} 项待确认` : ''}`} className="btn btn-sm btn-outline shrink-0 px-2">任务与进度{remainingTasks > 0 && <span className="hidden text-xs text-slate-500 sm:inline"> · {remainingTasks} 待确认</span>}</a>
      {helpItems.length > 0 && <button type="button" aria-haspopup="dialog" aria-expanded={drawer === 'help'} aria-controls="lesson-help-panel" onClick={() => setDrawer('help')} className="btn btn-sm btn-outline shrink-0 px-2"><CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />本课排查</button>}
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)] gap-y-10 min-[1360px]:grid-cols-[260px_minmax(0,1fr)_260px] min-[1360px]:gap-6">
      <aside className="hidden w-[260px] shrink-0 min-[1360px]:block">
        <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">{sidebar(closeDrawer, 'desktop')}</div>
      </aside>
      <div className="mx-auto w-full min-w-0 max-w-[740px]">{children}</div>
      <aside id="lesson-workbench" aria-label="学习任务与进度" className="mx-auto w-full min-w-0 max-w-[740px] scroll-mt-32 min-[1360px]:max-w-none min-[1360px]:scroll-mt-20"><div className="min-[1360px]:sticky min-[1360px]:top-20 min-[1360px]:flex min-[1360px]:max-h-[calc(100dvh-6rem)] min-[1360px]:flex-col">
        {helpItems.length > 0 && <button type="button" aria-haspopup="dialog" aria-expanded={drawer === 'help'} aria-controls="lesson-help-panel" onClick={() => setDrawer('help')} className="btn btn-md btn-outline mb-4 hidden w-full shrink-0 min-[1360px]:flex"><CircleHelp aria-hidden="true" className="h-4 w-4" />卡住了怎么办</button>}
        <div className="min-h-0 pb-2 min-[1360px]:overflow-y-auto">{workbench}</div>
      </div></aside>
    </div>
    {drawer === 'directory' && <div className="fixed inset-0 z-50 min-[1360px]:hidden">
      <button type="button" aria-label="关闭目录" onClick={closeDrawer} className="absolute inset-0 bg-slate-900/40" tabIndex={-1} />
      <div ref={panel} id="lesson-directory" role="dialog" aria-modal="true" aria-label="课程目录" className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex justify-end px-2 pt-2"><button type="button" onClick={closeDrawer} aria-label="关闭" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="min-h-0 flex-1">{sidebar(closeDrawer, 'drawer')}</div>
      </div>
    </div>}
    {drawer === 'help' && helpItems.length > 0 && <Suspense fallback={<p role="status" className="fixed bottom-4 right-4 z-50 rounded-lg bg-white p-3 text-sm shadow-card">正在加载本课排查…</p>}><LessonHelpPanel key={lessonKey} lessonTitle={lessonTitle} items={helpItems} onClose={closeDrawer} /></Suspense>}
  </div>
}
