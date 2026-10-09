import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Circle, Lock, Play } from 'lucide-react'
import type { LessonStatus, StageStatus } from '../data/courses.js'

/* ---------------------------------- 进度条 --------------------------------- */

export function Progress({
  value,
  className = '',
  barClassName = 'bg-brand-600',
  height = 'h-1.5',
}: {
  value: number
  className?: string
  barClassName?: string
  height?: string
}) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height} ${className}`}>
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${barClassName}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

/* ---------------------------------- 环形进度 -------------------------------- */

export function Ring({
  percent,
  size = 104,
  stroke = 9,
  barClassName = 'text-brand-600',
  trackClassName = 'text-brand-50',
  children,
}: {
  percent: number
  size?: number
  stroke?: number
  barClassName?: string
  trackClassName?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={`${barClassName} transition-[stroke-dashoffset] duration-700`}
        />
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
      ) : null}
    </div>
  )
}

/* ---------------------------------- 复选框 --------------------------------- */

export function Tick({
  checked,
  className = '',
  size = 'md',
}: {
  checked: boolean
  className?: string
  size?: 'sm' | 'md'
}) {
  const box = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'
  if (checked) {
    return (
      <span
        className={`inline-flex ${box} shrink-0 items-center justify-center rounded-[5px] bg-emerald-500 text-white ${className}`}
      >
        <CheckCircle2 className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  }
  return (
    <span className={`inline-block ${box} shrink-0 rounded-[5px] border-[1.5px] border-slate-300 bg-white ${className}`} />
  )
}

/* --------------------------------- 状态标签 --------------------------------- */

const stageChipStyle: Record<StageStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-600',
  in_progress: 'bg-brand-50 text-brand-600',
  not_started: 'bg-slate-100 text-slate-500',
  locked: 'bg-slate-100 text-slate-400',
}

export function StageChip({ status, label }: { status: StageStatus; label: string }) {
  return <span className={`chip ${stageChipStyle[status]}`}>{label}</span>
}

export const lessonDot: Record<LessonStatus, (cls?: string) => ReactNode> = {
  completed: (cls) => <CheckCircle2 className={`h-4 w-4 shrink-0 text-emerald-500 ${cls ?? ''}`} strokeWidth={2.4} />,
  in_progress: (cls) => (
    <span className={`relative flex h-4 w-4 shrink-0 items-center justify-center ${cls ?? ''}`}>
      <span className="absolute h-4 w-4 rounded-full bg-brand-100" />
      <span className="relative h-2 w-2 rounded-full bg-brand-600" />
    </span>
  ),
  not_started: (cls) => <Circle className={`h-[15px] w-[15px] shrink-0 text-slate-300 ${cls ?? ''}`} strokeWidth={2} />,
  locked: (cls) => <Lock className={`h-[14px] w-[14px] shrink-0 text-slate-300 ${cls ?? ''}`} strokeWidth={2} />,
}

/* ---------------------------------- 面包屑 --------------------------------- */

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items, className = '' }: { items: Crumb[]; className?: string }) {
  return (
    <nav className={`flex flex-wrap items-center gap-1.5 text-[12.5px] text-slate-400 ${className}`}>
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="flex items-center gap-1.5">
          {it.to ? (
            <Link to={it.to} className="transition hover:text-brand-600">
              {it.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-slate-600' : ''}>{it.label}</span>
          )}
          {i < items.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-slate-300" /> : null}
        </span>
      ))}
    </nav>
  )
}

/* --------------------------------- 区块标题 --------------------------------- */

export function SectionHeading({
  title,
  sub,
  right,
  className = '',
}: {
  title: string
  sub?: string
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        <h2 className="h-sec">{title}</h2>
        {sub ? <p className="sub-sec">{sub}</p> : null}
      </div>
      {right}
    </div>
  )
}

/* -------------------------------- 播放按钮外观 ------------------------------- */

export function PlayBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ${className}`}
    >
      <Play className="h-4 w-4 fill-current" strokeWidth={0} />
    </span>
  )
}
