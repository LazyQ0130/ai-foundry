'use client'

import Link from 'next/link'
import KnowledgeActionPanel from '@/components/KnowledgeActionPanel'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Claim = { text: string; citationKeys: string[] }
type Report = { answerability: 'grounded' | 'insufficient_evidence'; summary: Claim[]; findings: Claim[];
  analysis: Claim[]; conclusion: Claim[]; message?: string }
type Citation = { sourceType: string; externalId: string | null; sourceUrl: string | null; publishedYear: number | null; position: number; citationKey: string; title: string; excerpt: string; page: number | null;
  startOffset: number | null; endOffset: number | null; sourceAvailable: boolean; documentId: string | null }
type Step = { position: number; kind: string; status: string; toolName: string | null; inputSummary: string | null;
  outputSummary: string | null; latencyMs: number | null; errorCode: string | null }
type Run = { sourcePolicy: string; id: number; task: { id: number; title: string; query: string }; status: string; stopReason: string | null;
  errorCode: string | null; brief: { goal: string; subquestions: string[] } | null; report: Report | null }

export default function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const [run, setRun] = useState<Run | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [actionId, setActionId] = useState<string | null>(null)
  const [active, setActive] = useState<Citation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/research/runs/${runId}`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '读取运行失败。')
      setActionId(data.actionId); setRun(data.run); setSteps(data.steps ?? []); setCitations(data.citations); setActive(null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取失败。') }
    finally { setLoading(false) }
  }, [runId])
  useEffect(() => { void load() }, [load])
  async function cancel() {
    const response = await fetch(`/api/research/runs/${runId}/cancel`, { method: 'POST' })
    if (!response.ok) { setError('取消失败，运行可能已经结束。'); return }
    await load()
  }
  async function openSource(citation: Citation) {
    if (!citation.sourceAvailable || !citation.documentId) return
    try {
      const response = await fetch(`/api/knowledge/documents/${citation.documentId}/source`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error('原来源已不可用。')
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '打开原文件失败。') }
  }
  const sections: { key: keyof Pick<Report, 'summary' | 'findings' | 'analysis' | 'conclusion'>; title: string }[] = [
    { key: 'summary', title: '摘要' }, { key: 'findings', title: '发现' },
    { key: 'analysis', title: '分析' }, { key: 'conclusion', title: '结论' },
  ]
  return <main><header className="hero"><p className="eyebrow">AI 研究工作台 · RUN TIMELINE</p><h1>研究运行 #{runId}</h1>
    <Link href="/runs">← 全部运行</Link></header>
    {loading && <p role="status">正在读取时间线…</p>}
    {error && <p role="alert" className="feedback error">{error} <button onClick={() => void load()}>重试</button></p>}
    {run && <>
      <section className="panel"><h2>{run.task.title}</h2><p>{run.task.query}</p><p>来源策略：{run.sourcePolicy} · 状态：{run.status}{run.stopReason ? ` · ${run.stopReason}` : ''}{run.errorCode ? ` · ${run.errorCode}` : ''}</p>
        {run.errorCode === 'PROCESS_INTERRUPTED' && <p role="status">本次研究因服务中断而结束，未自动恢复。请返回研究任务，检查资料后发起新的运行；已有笔记仍需人工确认。</p>}
        {run.status === 'FAILED' && run.errorCode !== 'PROCESS_INTERRUPTED' && <p role="status">本次研究未完成。请检查资料与来源配置，稍后从研究任务发起新的运行。</p>}
        {run.status === 'RUNNING' && <button onClick={() => void cancel()}>取消本次运行</button>}
        <Link href={`/research/${run.task.id}`}>返回研究任务</Link></section>
      <section className="panel"><h2>Research Brief</h2>{run.brief ? <><p>{run.brief.goal}</p><ol>{run.brief.subquestions.map((item, index) => <li key={index}>{item}</li>)}</ol></> : <p>旧版直接研究运行，无 Brief 记录。</p>}</section>
      <section className="panel"><h2>Step Timeline</h2>{steps.length === 0 ? <p>旧版直接研究运行，无步骤记录。</p> : <ol>{steps.map(step => <li key={step.position}>
        <strong>{step.kind}{step.toolName ? ` · ${step.toolName}` : ''}</strong> · {step.status}
        {step.inputSummary && <p>{step.inputSummary}</p>}{step.outputSummary && <p>{step.outputSummary}</p>}
        <small>{step.latencyMs ?? '进行中'} ms{step.errorCode ? ` · ${step.errorCode}` : ''}</small>
      </li>)}</ol>}</section>
      {steps.some(item => item.toolName === 'search_external_references' && item.status === 'FAILED') && <p role="status">外部资料不可用，本次只能使用已获得的私人证据；证据不足则不生成结论。</p>}
      <section className="panel"><h2>Evidence Summary</h2><p>{steps.filter(item => item.kind === 'TOOL' && item.status === 'COMPLETED').length} 次只读检索；最终保存 {citations.length} 条历史 Citation。</p></section>
      <section className="panel"><h2>Final Report</h2>
        {run.report?.answerability === 'insufficient_evidence' ? <p>{run.report.message}</p> : null}
        {run.report?.answerability === 'grounded' && sections.map(section => <section key={section.key}><h3>{section.title}</h3>
          {run.report![section.key].length === 0 ? <p className="empty">本节无结论。</p> : <ul>{run.report![section.key].map((claim, index) => <li key={index}>
            {claim.text} {claim.citationKeys.map(key => {
              const citation = citations.find(item => item.citationKey === key)
              return citation && <button key={key} className="text-button" onClick={() => setActive(citation)}>[{citation.position}]</button>
            })}</li>)}</ul>}</section>)}
        {!run.report && <p>本次运行没有报告。查看上方状态和停止原因。</p>}
      </section>
      <KnowledgeActionPanel runId={run.id} actionId={actionId} eligible={run.status === 'COMPLETED' && run.report?.answerability === 'grounded'} />
      <section className="panel"><h2>Sources</h2>{citations.length === 0 ? <p>没有 Citation Snapshot。</p> : <ul>{citations.map(item => <li key={item.position}>
        <button className="text-button" onClick={() => setActive(item)}>[{item.position}] {item.title}</button>
      </li>)}</ul>}</section>
      {active && <aside className="panel" aria-label="历史引用快照"><h2>引用 [{active.position}]</h2><p>{active.title}</p><p>{active.sourceType === 'CROSSREF' ? 'Crossref · Abstract' : '私人资料'}</p><blockquote>{active.excerpt}</blockquote>
        <p>页：{active.page ?? '不适用'} · 偏移：{active.startOffset ?? '—'}–{active.endOffset ?? '—'}</p>
        {active.sourceType === 'CROSSREF' ? <><p>Crossref · Abstract · DOI: {active.externalId} · {active.publishedYear ?? '年份未知'}</p><p>只引用上方摘要摘录；未读取全文。链接是当前外部页面，摘录是历史证据。</p>{active.sourceUrl && <a href={active.sourceUrl} target="_blank" rel="noopener noreferrer">打开 DOI 来源</a>}</> : active.sourceAvailable ? <button onClick={() => void openSource(active)}>打开当前原文件</button> : <p>原来源不可用；历史快照仍在。</p>}</aside>}
    </>}
  </main>
}
