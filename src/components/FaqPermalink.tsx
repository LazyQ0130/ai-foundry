import { useEffect, useRef, useState } from 'react'
import { Link2 } from 'lucide-react'
export function FaqPermalink({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const href = `/faq#${encodeURIComponent(id)}`
  async function copy() {
    clearTimeout(timer.current)
    try { await navigator.clipboard.writeText(new URL(href, window.location.origin).href); setState('copied'); timer.current = setTimeout(() => setState('idle'), 2400) }
    catch { setState('failed') }
  }
  return <div className="mt-3 text-xs text-slate-500"><button className="inline-flex min-h-9 items-center gap-1.5 rounded hover:text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600" onClick={() => void copy()} type="button" aria-live="polite"><Link2 size={13}/>{state === 'copied' ? '已复制' : '复制问题链接'}</button>{state === 'failed' && <a className="ml-3 underline" href={href}>复制失败，打开问题链接</a>}</div>
}
