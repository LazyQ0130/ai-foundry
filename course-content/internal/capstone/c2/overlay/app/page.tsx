'use client'

import { useEffect, useState } from 'react'

type Task = { id: number; title: string; query: string }

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  async function loadTasks() {
    const response = await fetch('/api/research/tasks', { cache: 'no-store' })
    if (!response.ok) return
    const data = await response.json()
    setWorkspace(data.workspace.name)
    setTasks(data.tasks)
  }

  useEffect(() => { void loadTasks() }, [])

  async function auth(action: 'register' | 'login') {
    const response = await fetch(`/api/auth/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await response.json()
    setMessage(response.ok ? '已登录。' : data.error)
    if (response.ok) await loadTasks()
  }

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch('/api/research/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, query }),
    })
    const data = await response.json()
    setMessage(response.ok ? '任务已保存。' : data.error)
    if (response.ok) { setTitle(''); setQuery(''); await loadTasks() }
  }

  return <main>
    <h1>AI Research Workspace</h1>
    <p>C2 internal reference: first persistent product slice.</p>
    {!workspace ? <section><h2>登录或注册</h2>
      <input aria-label="用户名" placeholder="用户名" value={username} onChange={event => setUsername(event.target.value)} />
      <input aria-label="密码" placeholder="密码" type="password" value={password} onChange={event => setPassword(event.target.value)} />
      <button onClick={() => void auth('register')}>注册</button>
      <button onClick={() => void auth('login')}>登录</button>
    </section> : <section><h2>{workspace}</h2>
      <form onSubmit={event => void createTask(event)}>
        <input aria-label="研究标题" placeholder="研究标题" value={title} onChange={event => setTitle(event.target.value)} required />
        <textarea aria-label="研究问题" placeholder="想研究什么？" value={query} onChange={event => setQuery(event.target.value)} required />
        <button type="submit">创建研究任务</button>
      </form>
      <h2>研究任务</h2><ul>{tasks.map(task => <li key={task.id}><strong>{task.title}</strong> — {task.query}</li>)}</ul>
    </section>}
    <p role="status">{message}</p>
  </main>
}
