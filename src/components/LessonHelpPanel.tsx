import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { LessonMarkdown } from './LessonMarkdown.js'
import type { LessonHelpItem } from '../lib/lessonMarkdown.js'

export default function LessonHelpPanel({ lessonTitle, items, onClose }: {
  lessonTitle: string
  items: LessonHelpItem[]
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Native modal dialogs make the background inert, including pointer interaction.
    element.showModal()
    closeButton.current?.focus({ preventScroll: true })
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={dialog} id="lesson-help-panel" aria-labelledby="lesson-help-panel-title" aria-describedby="lesson-help-panel-lesson"
    onCancel={event => { event.preventDefault(); onClose() }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]') ?? [])
        .filter(element => element.tabIndex >= 0 && element.getClientRects().length)
      const first = items[0], last = items[items.length - 1]
      if (!first) { event.preventDefault(); return }
      if (!dialog.current?.contains(document.activeElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus({ preventScroll: true })
      }
    }}
    className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent">
    <button type="button" tabIndex={-1} aria-label="关闭排查面板" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
    <section className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl min-[1360px]:inset-y-0 min-[1360px]:left-auto min-[1360px]:w-[560px] min-[1360px]:max-h-none min-[1360px]:rounded-none">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="min-w-0"><h2 id="lesson-help-panel-title" className="text-lg font-bold text-slate-900">卡住了怎么办</h2><p id="lesson-help-panel-lesson" className="mt-1 break-words text-sm text-slate-500">{lessonTitle}</p></div>
        <button ref={closeButton} type="button" aria-label="关闭" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"><X aria-hidden="true" className="h-5 w-5" /></button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 sm:px-6">
        <p className="mb-4 text-sm text-slate-500">按你遇到的现象查看本课排查建议。</p>
        {items.map((item, index) => <details key={item.id} open={index === 0} className="lesson-help-item mb-3 rounded-xl border border-slate-200">
          <summary className="cursor-pointer break-words rounded-xl px-4 py-3 text-sm font-semibold leading-6 text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">{item.title}</summary>
          <div className="min-w-0 border-t border-slate-100 px-4 py-4" onClick={event => {
            // An in-article anchor should lead back to the article, not leave it behind a modal.
            const link = (event.target as HTMLElement).closest('a[href]')
            if (link?.getAttribute('href')?.startsWith('#')) onClose()
          }}><LessonMarkdown body={item.body} anchorPrefix={`help-panel-${index + 1}-`} /></div>
        </details>)}
      </div>
    </section>
  </dialog>
}
