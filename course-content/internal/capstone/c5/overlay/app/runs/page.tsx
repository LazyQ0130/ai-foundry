'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type RunItem = { id: number; task: { id: number; title: string }; status: string; stopReason: string | null;
  createdAt: string; completedAt: string | null; stepCount: number; reportStatus: string }
export default function RunsPage() {
  const [runs, setRuns] = useState<RunItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/research/runs', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '读取运行列表失败。')
      setRuns(data.runs)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取失败。') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  return <main><header className="hero"><p className="eyebrow">CAPSTONE C5 · RESEARCH RUNS</p><h1>研究运行</h1><p>查看每次研究如何停止，以及当时留下了哪些步骤。</p><Link href="/">← 返回工作区</Link></header>
    {loading && <p role="status">正在读取运行…</p>}
    {error && <p role="alert" className="feedback error">{error} <button onClick={() => void load()}>重试</button></p>}
    {!loading && runs.length === 0 && <p className="empty">尚无研究运行。</p>}
    {!loading && runs.length > 0 && <ul className="task-list">{runs.map(run => <li key={run.id}>
      <h2><Link href={`/runs/${run.id}`}>{run.task.title} · Run #{run.id}</Link></h2>
      <p>{run.status}{run.stopReason ? ` · ${run.stopReason}` : ''} · {run.stepCount} 个步骤 · 报告 {run.reportStatus}</p>
      <p>开始：{new Date(run.createdAt).toLocaleString()} · 用时：{run.completedAt ? `${Math.max(0, new Date(run.completedAt).getTime() - new Date(run.createdAt).getTime())} ms` : '进行中'}</p>
    </li>)}</ul>}
  </main>
}
