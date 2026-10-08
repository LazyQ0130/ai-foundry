'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'

type Task = { id: number; title: string; query: string }
type TaskList = { workspace: { id: number; name: string }; tasks: Task[] }

async function responseData(response: Response) {
  try { return await response.json() } catch { return {} }
}

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [workspace, setWorkspace] = useState<TaskList['workspace'] | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/research/tasks', { cache: 'no-store' })
      if (response.status === 401) { setWorkspace(null); setTasks([]); return }
      const data = await responseData(response)
      if (!response.ok) throw new Error(data.error || '读取任务失败，请重试。')
      setWorkspace(data.workspace); setTasks(data.tasks)
    } catch (cause) { setError(cause instanceof Error ? cause.message : '读取任务失败，请重试。') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadTasks() }, [loadTasks])

  async function auth(action: 'register' | 'login') {
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch(`/api/auth/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await responseData(response)
      if (!response.ok) throw new Error(data.error || '操作失败，请重试。')
      setPassword(''); setMessage(action === 'register' ? '账号与个人工作区已创建。' : '已登录。')
      await loadTasks()
    } catch (cause) { setError(cause instanceof Error ? cause.message : '操作失败，请重试。') }
    finally { setBusy(false) }
  }

  async function logout() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('退出失败，请重试。')
      setWorkspace(null); setTasks([]); setMessage('已退出。')
    } catch (cause) { setError(cause instanceof Error ? cause.message : '退出失败，请重试。') }
    finally { setBusy(false) }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      const response = await fetch('/api/research/tasks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, query }),
      })
      const data = await responseData(response)
      if (!response.ok) throw new Error(data.error || '创建失败，请重试。')
      setTitle(''); setQuery(''); setMessage('任务已保存到数据库。')
      await loadTasks()
    } catch (cause) { setError(cause instanceof Error ? cause.message : '创建失败，请重试。') }
    finally { setBusy(false) }
  }

  return <main>
    <header className="hero"><p className="eyebrow">AI FOUNDRY · CAPSTONE</p><h1>AI Research Workspace</h1><p>从一个研究问题开始。你的任务会保存在个人工作区中。</p></header>
    {loading && <p role="status">正在读取工作区…</p>}
    {!loading && !workspace && <section className="panel" aria-labelledby="auth-heading">
      <h2 id="auth-heading">进入个人工作区</h2><p>首次使用请注册；已有账号请登录。</p>
      <label htmlFor="username">用户名</label><input id="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} />
      <label htmlFor="password">密码</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} />
      <div className="actions"><button disabled={busy} onClick={() => void auth('register')}>注册并创建工作区</button><button className="secondary" disabled={busy} onClick={() => void auth('login')}>登录</button></div>
    </section>}
    {!loading && workspace && <>
      <section className="workspace-bar"><div><p className="eyebrow">PERSONAL WORKSPACE</p><h2>{workspace.name}</h2><Link href="/knowledge">进入私人资料库 →</Link></div><button className="secondary" disabled={busy} onClick={() => void logout()}>退出</button></section>
      <section className="panel" aria-labelledby="create-heading"><h2 id="create-heading">创建研究任务</h2><p>写下长期要研究的问题；进入任务后可生成带证据的报告。</p>
        <form onSubmit={event => void createTask(event)}>
          <label htmlFor="task-title">标题</label><input id="task-title" maxLength={120} value={title} onChange={event => setTitle(event.target.value)} required />
          <label htmlFor="task-query">研究问题</label><textarea id="task-query" maxLength={2000} rows={4} value={query} onChange={event => setQuery(event.target.value)} required />
          <button type="submit" disabled={busy}>{busy ? '正在保存…' : '创建任务'}</button>
        </form>
      </section>
      <section aria-labelledby="tasks-heading"><h2 id="tasks-heading">研究任务</h2>
        {tasks.length === 0 ? <p className="empty">还没有研究任务。写下第一个问题，刷新后再回来检查。</p> :
          <ul className="task-list">{tasks.map(task => <li key={task.id}><h3>{task.title}</h3><p>{task.query}</p><Link href={`/research/${task.id}`}>查看任务与研究报告 →</Link></li>)}</ul>}
      </section>
    </>}
    {error && <p className="feedback error" role="alert">{error} <button className="text-button" onClick={() => void loadTasks()}>重试读取</button></p>}
    {message && <p className="feedback" role="status">{message}</p>}
  </main>
}
