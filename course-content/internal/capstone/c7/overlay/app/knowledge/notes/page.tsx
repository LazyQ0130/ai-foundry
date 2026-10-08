'use client'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
type Note = { id: string; title: string; createdAt: string }
export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/knowledge/notes', { cache: 'no-store' }), data = await response.json()
      if (!response.ok) throw new Error('无法读取知识笔记，请确认已登录。')
      setNotes(data.notes)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取失败。') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  return <main><header className="hero"><h1>知识笔记</h1><p>人工确认保存的知识资产，独立于上传文档。当前不自动进入检索。</p><Link href="/knowledge">← 资料库</Link></header>
    {loading && <p role="status">正在读取…</p>}{error && <p role="alert">{error}<button onClick={() => void load()}>重试</button></p>}
    {!loading && !error && <section className="panel">{notes.length ? <ul>{notes.map(note => <li key={note.id}>
      <Link href={`/knowledge/notes/${note.id}`}>{note.title}</Link> · {new Date(note.createdAt).toLocaleString()}</li>)}</ul> :
      <p>尚无知识笔记。到已完成的研究报告中生成提议，经人工确认后保存。</p>}</section>}
  </main>
}
