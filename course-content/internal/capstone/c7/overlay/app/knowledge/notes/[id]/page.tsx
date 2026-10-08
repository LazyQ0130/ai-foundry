'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
type Note = { id: string; title: string; content: string; createdAt: string; sourceRunId: number | null }
export default function NotePage() {
  const { id } = useParams<{ id: string }>()
  const [note, setNote] = useState<Note | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/knowledge/notes/${id}`, { cache: 'no-store' }), data = await response.json()
      if (!response.ok) throw new Error('笔记不存在或无权读取。')
      setNote(data.note)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取失败。') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { void load() }, [load])
  return <main><header className="hero"><h1>{note?.title ?? '知识笔记'}</h1><Link href="/knowledge/notes">← 知识笔记</Link></header>
    {loading && <p role="status">正在读取…</p>}{error && <p role="alert">{error}<button onClick={() => void load()}>重试</button></p>}
    {note && <section className="panel"><p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p><p>人工确认保存 · {new Date(note.createdAt).toLocaleString()}</p>
      {note.sourceRunId ? <Link href={`/runs/${note.sourceRunId}`}>来源：Research Run #{note.sourceRunId}</Link> : <p>原研究记录已删除；知识笔记仍保留。</p>}
      <p>来源关联用于追溯，不表示编辑后的每句话经过自动验证。</p></section>}
  </main>
}
