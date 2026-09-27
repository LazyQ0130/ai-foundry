import { useState } from 'react'

export default function UserAvatar({ nickname, avatarUrl, size = 32 }: { nickname: string; avatarUrl: string | null; size?: number }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const initial = typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(nickname || '同')[Symbol.iterator]().next().value?.segment
    : Array.from(nickname || '同')[0]
  return <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 font-semibold text-brand-600 ring-1 ring-brand-100" style={{ width: size, height: size, fontSize: size * 0.36 }}>
    {avatarUrl && failedUrl !== avatarUrl
      ? <img key={avatarUrl} src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setFailedUrl(avatarUrl)} />
      : initial}
  </span>
}
