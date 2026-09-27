import { useEffect, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { X } from 'lucide-react'
import { cropAvatar } from '../lib/avatar'
import { errorMessage } from '../lib/api'

export default function AvatarCropModal({ source, pending, onSave, onClose }: { source: string; pending: boolean; onSave: (blob: Blob) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [error, setError] = useState('')
  const busy = saving || pending
  useEffect(() => {
    const element = dialog.current!
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  const save = async () => {
    if (!area || savingRef.current || pending) return
    savingRef.current = true
    setSaving(true); setError('')
    try { await onSave(await cropAvatar(source, area)) }
    catch (error) { setError(errorMessage(error)) }
    finally { savingRef.current = false; setSaving(false) }
  }
  return <dialog ref={dialog} aria-labelledby="avatar-crop-title" aria-describedby="avatar-crop-help" onCancel={(e) => { e.preventDefault(); if (!busy) onClose() }} className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl backdrop:bg-slate-900/40 sm:p-6">
    <div className="flex items-center justify-between gap-3">
      <h2 id="avatar-crop-title" className="text-lg font-semibold">调整头像</h2>
      <button type="button" disabled={busy} onClick={onClose} aria-label="关闭头像裁剪" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
    </div>
    <p id="avatar-crop-help" className="mb-4 mt-1 text-xs leading-5 text-slate-500">拖动图片调整位置，使用滑块缩放。聚焦图片后也可用方向键移动。</p>
    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100" aria-busy={busy}>
      <Cropper image={source} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={(value) => { if (!busy) setCrop(value) }} onZoomChange={(value) => { if (!busy) setZoom(value) }} onCropComplete={(_, pixels) => setArea(pixels)} cropperProps={{ 'aria-label': '拖动或使用方向键调整头像位置', tabIndex: busy ? -1 : 0 }} />
    </div>
    <label className="mt-5 flex items-center gap-4 text-sm">缩放<input aria-label="头像缩放" disabled={busy} className="min-w-0 flex-1 accent-brand-600" type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /><span className="w-10 text-right text-xs text-slate-500">{Math.round(zoom * 100)}%</span></label>
    {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
    <div className="mt-6 flex justify-end gap-2">
      <button type="button" disabled={busy} onClick={onClose} className="btn btn-md btn-outline">取消</button>
      <button type="button" disabled={busy || !area} onClick={() => void save()} className="btn btn-md btn-primary">{busy ? '保存中…' : '保存头像'}</button>
    </div>
  </dialog>
}
