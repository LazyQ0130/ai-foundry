import { useEffect, useState } from 'react'
import { Download, FileArchive } from 'lucide-react'
import { courseAssets, isCourseAssetId } from '../data/courseAssets.js'

export function CourseResource({ asset }: { asset: string }) {
  const item = isCourseAssetId(asset) ? courseAssets[asset] : undefined
  const [bytes, setBytes] = useState<number>()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  useEffect(() => {
    if (!item) return
    const controller = new AbortController()
    void fetch(`${item.endpoint}/info`, { signal: controller.signal }).then(async response => {
      if (response.ok) setBytes((await response.json()).data.bytes)
    }).catch(() => {})
    return () => controller.abort()
  }, [item])
  if (!item) return null
  async function download() {
    if (!item || busy) return
    setBusy(true); setMessage(''); setNeedsLogin(false)
    try {
      const response = await fetch(item.endpoint, { credentials: 'include' })
      if (!response.ok) {
        setNeedsLogin(response.status === 401)
        setMessage(response.status === 401 ? asset === 'stage3-starter' ? '请先登录，再使用你的 Stage 3 权限下载 Starter。' : '登录后即可免费下载 Starter，并保存你的学习进度。' : response.status === 403 ? '当前账号没有此资源的下载权限。' : '下载暂时不可用，请稍后重试。')
        return
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url; link.download = item.filename
      document.body.append(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setMessage('下载已开始，请在浏览器的下载列表中查看。')
    } catch { setMessage('网络连接失败，请稍后重试。') }
    finally { setBusy(false) }
  }
  return <aside className="lesson-resource" aria-label="课程资源">
    <FileArchive size={24} className="lesson-resource-icon" aria-hidden="true"/>
    <div className="lesson-resource-info">
      <div className="lesson-resource-label">课程资源</div>
      <div className="lesson-resource-title">{item.title}</div>
      <div className="lesson-resource-description">{item.description}</div>
      <div className="lesson-resource-meta">{item.format}{bytes !== undefined ? ` · 约 ${Math.ceil(bytes / 1024)} KB` : ''} · {asset === 'stage3-starter' ? '需 Stage 3 权限' : '免费体验资源'}</div>
    </div>
    <button type="button" className="lesson-resource-download" disabled={busy} onClick={() => void download()}><Download size={16} aria-hidden="true"/>{busy ? '正在下载…' : '下载 Starter'}</button>
    {needsLogin && <div className="lesson-resource-message flex flex-wrap gap-3"><a href={`/login?next=${encodeURIComponent(window.location.pathname)}`}>登录后继续</a><a href={`/register?next=${encodeURIComponent(window.location.pathname)}`}>注册后继续</a></div>}
    {message && <div className="lesson-resource-message" role="status">{message}</div>}
  </aside>
}
