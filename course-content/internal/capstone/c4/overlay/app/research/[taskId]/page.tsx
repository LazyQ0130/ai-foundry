'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Claim = { text: string; citationKeys: string[] }
type Report = { answerability: 'grounded' | 'insufficient_evidence'; summary: Claim[]; findings: Claim[];
  analysis: Claim[]; conclusion: Claim[]; message?: string }
type Citation = { position: number; citationKey: string; title: string; excerpt: string; page: number | null;
  startOffset: number | null; endOffset: number | null; sourceAvailable: boolean; documentId: string | null }
type Run = { id: number; status: string; stopReason: string | null; errorCode: string | null;
  report: Report | null; createdAt: string }
type Task = { id: number; title: string; query: string }

export default function ResearchTaskPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const [task, setTask] = useState<Task | null>(null)
  const [runs, setRuns] = useState<Run[]>([])
  const [selected, setSelected] = useState<Run | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const openRun = useCallback(async (id: number) => {
    const response = await fetch(`/api/research/runs/${id}`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '读取报告失败。')
    setSelected(data.run); setCitations(data.citations); setActiveCitation(null)
  }, [])
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/research/tasks/${taskId}/runs`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '读取任务失败。')
      setTask(data.task); setRuns(data.runs)
      if (data.runs.length) await openRun(data.runs[0].id)
      else { setSelected(null); setCitations([]) }
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取失败。') }
    finally { setLoading(false) }
  }, [taskId, openRun])
  useEffect(() => { void load() }, [load])

  async function generate() {
    setBusy(true); setError('')
    try {
      const response = await fetch(`/api/research/tasks/${taskId}/runs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await response.json()
      await load()
      if (!response.ok) throw new Error(data.error || '生成失败，请查看本次运行状态。')
      await openRun(data.runId)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '生成失败。') }
    finally { setBusy(false) }
  }

  async function openSource(citation: Citation) {
    if (!citation.sourceAvailable || !citation.documentId) return
    try {
      const response = await fetch(`/api/knowledge/documents/${citation.documentId}/source`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error('原文件现在不可用；历史摘录仍保留。')
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '打开原文件失败。') }
  }

  const report = selected?.report
  const sections: { key: keyof Pick<Report, 'summary' | 'findings' | 'analysis' | 'conclusion'>; title: string }[] = [
    { key: 'summary', title: '摘要' }, { key: 'findings', title: '发现' },
    { key: 'analysis', title: '分析' }, { key: 'conclusion', title: '结论' },
  ]
  return <main>
    <header className="hero"><p className="eyebrow">CAPSTONE C4 · GROUNDED REPORT</p><h1>{task?.title ?? '研究任务'}</h1>
      <p>{task?.query}</p><Link href="/">← 返回工作区</Link></header>
    {loading && <p role="status">正在读取任务与历史报告…</p>}
    {error && <p role="alert" className="feedback error">{error} <button onClick={() => void load()}>重试</button></p>}
    {!loading && task && <>
      <section className="panel"><h2>研究运行</h2><p>本次将检索当前私人资料，生成结构化报告，并保存当时的引用摘录。</p>
        <button disabled={busy} onClick={() => void generate()}>{busy ? '正在检索并生成…' : '生成带证据的报告'}</button>
        {runs.length === 0 ? <p className="empty">尚无运行。可以先到 <Link href="/knowledge">资料库</Link> 上传资料。</p> :
          <ul>{runs.map(run => <li key={run.id}><button className="text-button" onClick={() => void openRun(run.id)}>
            #{run.id} · {run.status} · {new Date(run.createdAt).toLocaleString()}</button></li>)}</ul>}
      </section>
      {selected && <section className="panel"><h2>运行 #{selected.id}</h2>
        <p>状态：{selected.status}{selected.stopReason ? ` · ${selected.stopReason}` : ''}{selected.errorCode ? ` · ${selected.errorCode}` : ''}</p>
        {report?.answerability === 'insufficient_evidence' && <p role="status">{report.message || '当前资料不足以回答。'}</p>}
        {report?.answerability === 'grounded' && <>
          {sections.map(section => <section key={section.key}><h3>{section.title}</h3>
            {report[section.key].length === 0 ? <p className="empty">本节无结论。</p> :
              <ul>{report[section.key].map((claim, index) => <li key={`${section.key}-${index}`}>
                <p>{claim.text} {claim.citationKeys.map(key => {
                  const citation = citations.find(item => item.citationKey === key)
                  return citation && <button key={key} className="text-button" aria-label={`查看引用 ${citation.position}`}
                    onClick={() => setActiveCitation(citation)}>[{citation.position}]</button>
                })}</p></li>)}</ul>}</section>)}
        </>}
      </section>}
      {activeCitation && <aside className="panel" aria-label="历史引用快照"><h2>引用 [{activeCitation.position}]</h2>
        <p><strong>{activeCitation.title}</strong></p><blockquote>{activeCitation.excerpt}</blockquote>
        <p>页：{activeCitation.page ?? '不适用'} · 偏移：{activeCitation.startOffset ?? '—'}–{activeCitation.endOffset ?? '—'}</p>
        {activeCitation.sourceAvailable ? <button onClick={() => void openSource(activeCitation)}>打开当前原文件</button> :
          <p>原来源已不可用；上方保留了生成报告时的证据快照。</p>}
      </aside>}
    </>}
  </main>
}
