'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

type Match = { chunkId: number; title: string; page: number | null; startOffset: number; endOffset: number;
  preview: string; similarity: number; citationKey: string }

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [mode, setMode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const response = await fetch('/api/knowledge/search', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '检索失败。')
      setMatches(data.matches); setMode(data.embeddingMode)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '检索失败。') }
    finally { setBusy(false) }
  }
  return <main><p><Link href="/knowledge">← 私人资料库</Link></p>
    <header className="hero"><p className="eyebrow">RETRIEVAL DEBUG</p><h1>搜索资料</h1><p>检查命中的原始片段。本课不生成研究报告。</p></header>
    <form className="panel" onSubmit={event => void search(event)}><label htmlFor="query">搜索问题</label>
      <input id="query" maxLength={500} value={query} onChange={event => setQuery(event.target.value)} required />
      <button disabled={busy}>{busy ? '检索中…' : '搜索 READY 资料'}</button></form>
    {mode === 'mock' && <p className="feedback">当前为 Mock 向量：仅验证流程、维度和隔离，不代表真实语义检索质量。</p>}
    {matches && <section><h2>Top-K 命中</h2>{matches.length === 0 ? <p className="empty">当前工作区没有匹配的 READY 片段。</p> :
      <ol className="task-list">{matches.map(match => <li key={match.chunkId}><h3>{match.title}</h3>
        <p>{match.preview}</p><small>相似度 {match.similarity.toFixed(3)} · {match.page === null ? '文本' : `第 ${match.page} 页`} · offset {match.startOffset}–{match.endOffset}</small>
      </li>)}</ol>}</section>}
    {error && <p role="alert" className="feedback error">{error}</p>}
  </main>
}
