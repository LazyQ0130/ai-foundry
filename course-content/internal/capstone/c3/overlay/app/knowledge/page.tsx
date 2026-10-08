'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'

type Document = { id: string; title: string; originalName: string; mimeType: string; byteSize: number;
  status: 'PENDING_UPLOAD' | 'PROCESSING' | 'READY' | 'FAILED'; errorCode: string | null; errorMessage: string | null }
type Activity = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed'

export default function KnowledgePage() {
  const [file, setFile] = useState<File | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [activity, setActivity] = useState<Activity>('idle')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/knowledge/documents', { cache: 'no-store' })
      if (response.status === 401) throw new Error('请先在首页登录。')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '读取资料失败。')
      setDocuments(data.documents)
      setError('')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取资料失败。') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function process(id: string) {
    setActivity('processing'); setError('')
    try {
      const response = await fetch(`/api/knowledge/documents/${id}/process`, { method: 'POST' })
      const result = await response.json()
      await load()
      if (!response.ok) { setActivity('failed'); setError(result.error || '处理失败。') }
      else { setActivity('ready'); setError('') }
    } catch (cause) { setActivity('failed'); setError(cause instanceof Error ? cause.message : '处理失败，请重试。') }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return
    setError(''); setActivity('uploading')
    try {
      const mimeType = file.type || (file.name.toLowerCase().endsWith('.md') ? 'text/markdown' : 'text/plain')
      const initiated = await fetch('/api/knowledge/uploads', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName: file.name, title: file.name, mimeType, byteSize: file.size }) })
      const data = await initiated.json()
      if (!initiated.ok) throw new Error(data.error || '上传初始化失败。')
      const put = await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': mimeType }, body: file })
      if (!put.ok) throw new Error('原文件上传失败；资料仍未就绪。')
      await process(data.id)
      setFile(null)
    } catch (cause) { setActivity('failed'); await load(); setError(cause instanceof Error ? cause.message : '上传失败。') }
  }

  async function openSource(id: string) {
    try {
      const response = await fetch(`/api/knowledge/documents/${id}/source`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '无法打开原文件。')
      window.open(data.url, '_blank', 'noopener,noreferrer')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '无法打开原文件。') }
  }

  return <main>
    <p><Link href="/">← 工作区</Link>　<Link href="/knowledge/search">搜索资料 →</Link></p>
    <header className="hero"><p className="eyebrow">PRIVATE KNOWLEDGE</p><h1>私人资料库</h1><p>上传完成后还要解析和索引；只有 READY 的资料可以被搜索。</p></header>
    <section className="panel"><h2>添加文件</h2><p>PDF、Markdown、TXT；单文件最多 10 MB。扫描 PDF 暂不支持 OCR。</p>
      <form onSubmit={event => void upload(event)}><label htmlFor="source-file">选择资料</label>
        <input id="source-file" type="file" accept=".pdf,.md,.txt,application/pdf,text/plain,text/markdown"
          onChange={event => setFile(event.target.files?.[0] ?? null)} required />
        <button disabled={!file || activity === 'uploading' || activity === 'processing'}>上传并建立索引</button>
      </form>
      {activity !== 'idle' && <p role="status">当前阶段：{activity === 'uploading' ? '上传原文件' : activity === 'processing' ? '解析、切片并生成向量' : activity === 'ready' ? '可检索' : '失败，请查看错误'}</p>}
    </section>
    <section><h2>资料列表</h2>{loading ? <p role="status">正在读取…</p> : documents.length === 0 ? <p className="empty">还没有资料。</p> :
      <ul className="task-list">{documents.map(document => <li key={document.id}>
        <h3>{document.title}</h3><p>{document.originalName} · {document.mimeType} · {(document.byteSize / 1024).toFixed(1)} KB</p>
        <p>状态：<strong>{document.status}</strong>{document.errorMessage ? ` · ${document.errorMessage}` : ''}</p>
        {document.status === 'PENDING_UPLOAD' && <button onClick={() => void process(document.id)} disabled={activity === 'processing'}>检查上传</button>}
        {document.status === 'FAILED' && <button onClick={() => void process(document.id)} disabled={activity === 'processing'}>重试处理</button>}
        {document.status !== 'PENDING_UPLOAD' && <button className="secondary" onClick={() => void openSource(document.id)}>查看原文件</button>}
      </li>)}</ul>}
    </section>
    {error && <p role="alert" className="feedback error">{error} <button className="text-button" onClick={() => void load()}>重试读取</button></p>}
  </main>
}
