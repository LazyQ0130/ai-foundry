'use client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type Action = { id: string; runId: number; title: string; content: string; version: number;
  status: 'PROPOSED' | 'REJECTED' | 'EXECUTED'; approvalToken?: string; note?: { id: string } | null }
export default function KnowledgeActionPanel({ runId, actionId, eligible }: { runId: number; actionId: string | null; eligible: boolean }) {
  const [action, setAction] = useState<Action | null>(null)
  const [title, setTitle] = useState(''), [content, setContent] = useState('')
  const [editing, setEditing] = useState(false), [busy, setBusy] = useState(false)
  const [error, setError] = useState(''), [message, setMessage] = useState('')
  const apply = useCallback((value: Action) => {
    setAction(value); setTitle(value.title); setContent(value.content); setEditing(false); setError('')
  }, [])
  const reload = useCallback(async (id: string) => {
    const response = await fetch(`/api/research/actions/${id}`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error('无法读取提议，请重新加载。')
    apply(data.action)
  }, [apply])
  useEffect(() => {
    if (!actionId) return
    setBusy(true)
    void reload(actionId).catch(() => setError('无法读取提议，请重试。')).finally(() => setBusy(false))
  }, [actionId, reload])
  async function perform(kind: 'generate' | 'edit' | 'reject' | 'approve') {
    setBusy(true); setError(''); setMessage('')
    try {
      const route = kind === 'generate' ? `/api/research/runs/${runId}/knowledge-note-proposal` :
        `/api/research/actions/${action!.id}${kind === 'edit' ? '' : `/${kind}`}`
      const body = kind === 'generate' ? {} : kind === 'edit' ? { title, content, expectedVersion: action!.version } :
        kind === 'reject' ? { expectedVersion: action!.version } : { approvalToken: action!.approvalToken }
      const response = await fetch(route, { method: kind === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(kind === 'generate' ? '无法生成提议，可以重试。' : '操作未完成；提议可能已更新或确认已过期，请重新加载当前提议。')
      if (kind === 'approve') { await reload(action!.id); setMessage(data.replayed ? '这条知识笔记已经保存。' : '已人工确认保存。') }
      else { apply(data.action); if (kind === 'edit') setMessage('提议已更新，需要重新确认。') }
    } catch (cause) { setError(cause instanceof Error ? cause.message : '操作失败。') }
    finally { setBusy(false) }
  }
  return <section className="panel" aria-label="知识写入提议"><h2>沉淀为知识笔记</h2>
    <p>研究已结束。笔记写入需要独立的人工确认，报告和引用仍保留。</p>
    {busy && <p role="status">正在处理…</p>}
    {message && <p role="status">{message}</p>}
    {error && <p role="alert">{error} {action && <button disabled={busy} onClick={() => void reload(action.id).catch(() => setError('读取失败，请重试。'))}>重新加载提议</button>}</p>}
    {!action && !actionId && (eligible ? <button disabled={busy} onClick={() => void perform('generate')}>生成知识笔记提议</button> : <p>只有已完成且有依据的研究报告才能生成提议。</p>)}
    {!action && actionId && !busy && <button onClick={() => void reload(actionId).catch(() => setError('读取失败，请重试。'))}>重试读取提议</button>}
    {action && <><p>来源：<Link href={`/runs/${action.runId}`}>Research Run #{action.runId}</Link> · 版本 {action.version} ·
      {action.status === 'PROPOSED' ? '等待确认，尚未写入知识笔记' : action.status === 'REJECTED' ? '已拒绝' : '已保存'}</p>
      {editing ? <><label>标题<input value={title} maxLength={120} disabled={busy} onChange={event => setTitle(event.target.value)} /></label>
        <label>内容<textarea value={content} maxLength={2000} rows={10} disabled={busy} onChange={event => setContent(event.target.value)} /></label>
        <button disabled={busy || !title.trim() || !content.trim()} onClick={() => void perform('edit')}>保存修改并重新确认</button>
        <button disabled={busy} onClick={() => { setTitle(action.title); setContent(action.content); setEditing(false) }}>取消编辑</button></> :
        <><h3>{action.title}</h3><p style={{ whiteSpace: 'pre-wrap' }}>{action.content}</p></>}
      {action.status === 'PROPOSED' && !editing && <><button disabled={busy} onClick={() => setEditing(true)}>编辑</button>
        <button disabled={busy} onClick={() => void perform('reject')}>拒绝本次提议</button>
        <button disabled={busy || !action.approvalToken} onClick={() => void perform('approve')}>批准并保存到知识笔记</button></>}
      {action.note && <Link href={`/knowledge/notes/${action.note.id}`}>查看已保存的知识笔记 →</Link>}
      <p>最终文字由你人工确认；编辑后不保证逐 Claim 自动 Grounding。</p></>}
  </section>
}
