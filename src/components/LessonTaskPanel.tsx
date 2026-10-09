import { Check, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Tick } from './ui'

/** Progress strip shown at the top of every lesson workbench (Stage and Capstone). */
export function LessonProgressStrip({ to, label, completed, total }: { to: string; label: string; completed: number; total: number }) {
  const percent = Math.round(completed / Math.max(1, total) * 100)
  return <div className="card flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[12px] text-slate-500">
    <Link to={to} className="font-semibold text-brand-700">{label}</Link>
    <span>{completed} / {total} · {percent}%</span>
  </div>
}

/** Checklist plus explicit completion, shared by Stage and Capstone lessons. */
export function LessonTaskCard({ items, checked, disabled, saving, done, onToggle, onComplete }: {
  items: string[]
  checked: boolean[]
  disabled: boolean
  saving: boolean
  done: boolean
  onToggle: (index: number) => void
  onComplete: () => void
}) {
  const checkedCount = checked.filter(Boolean).length
  const allChecked = checkedCount === checked.length
  return <div className="card overflow-hidden border-brand-200 min-[1360px]:flex min-[1360px]:min-h-0 min-[1360px]:flex-col">
    <div className="p-4 min-[1360px]:flex min-[1360px]:min-h-0 min-[1360px]:flex-col">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-900">
          <ClipboardList className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.2} />
          学习任务清单
        </h2>
        <span className="text-[13px] tabular-nums text-slate-400">{checkedCount}/{checked.length}</span>
      </div>
      <ul className="mt-3 space-y-2.5 min-[1360px]:min-h-0 min-[1360px]:overflow-y-auto">
        {items.map((item, i) => (
          <li key={item}>
            <button type="button" disabled={disabled || saving} onClick={() => onToggle(i)} aria-pressed={checked[i]} className="flex w-full items-start gap-2.5 text-left">
              <Tick checked={checked[i]} className="mt-[1px]" />
              <span className={`text-[13px] leading-5 transition ${checked[i] ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{i + 1}. {item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
    <div className="shrink-0 border-t border-brand-100 bg-brand-50/40 p-4">
      <button
        type="button"
        onClick={onComplete}
        disabled={disabled || saving || done || !allChecked}
        title={!allChecked ? '请先完成并勾选全部学习任务' : undefined}
        className={`btn btn-md w-full ${done ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'btn-primary'}`}
      >
        <Check className="h-4 w-4" strokeWidth={2.6} />
        {done ? '已完成本课' : '标记为完成'}
      </button>
      {!done && !allChecked ? <p className="text-center text-[13px] text-slate-500">完成本地操作并勾选全部任务后，即可标记本课完成。</p> : null}
    </div>
  </div>
}
