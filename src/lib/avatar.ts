import type { Area } from 'react-easy-crop'

const invalidImage = () => new Error('请选择有效的 JPG、PNG 或 WebP 静态图片，不支持动图')

/** Inspect container chunks, not filename extensions: animated PNG/WebP must not silently lose frames. */
export function checkImageContainer(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  const tag = (at: number, length = 4) => String.fromCharCode(...bytes.slice(at, at + length))
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return
  if (bytes.length >= 24 && bytes[0] === 137 && tag(1, 7) === 'PNG\r\n\x1a\n') {
    if (view.getUint32(16) * view.getUint32(20) > 25_000_000) throw new Error('图片不能超过 2500 万像素')
    for (let at = 8; at + 12 <= bytes.length;) {
      const length = view.getUint32(at)
      if (at + length + 12 > bytes.length || tag(at + 4) === 'acTL') throw invalidImage()
      at += length + 12
    }
    return
  }
  if (bytes.length >= 12 && tag(0) === 'RIFF' && tag(8) === 'WEBP') {
    for (let at = 12; at + 8 <= bytes.length;) {
      const length = view.getUint32(at + 4, true)
      if (at + length + 8 > bytes.length || ['ANIM', 'ANMF'].includes(tag(at))) throw invalidImage()
      if (tag(at) === 'VP8X' && length >= 10 && (bytes[at + 8] & 2)) throw invalidImage()
      at += 8 + length + (length % 2)
    }
    return
  }
  throw invalidImage()
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(invalidImage())
    image.src = url
  })
}

export async function prepareAvatar(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error('图片不能超过 5MB')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw invalidImage()
  checkImageContainer(await file.arrayBuffer())
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    if (image.naturalWidth * image.naturalHeight > 25_000_000) throw new Error('图片不能超过 2500 万像素')
    return url
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  }
}

export async function cropAvatar(url: string, area: Area): Promise<Blob> {
  const image = await loadImage(url)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) throw new Error('浏览器暂不支持图片处理')
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, 512, 512)
  return new Promise((resolve, reject) => canvas.toBlob((blob) => {
    if (!blob || blob.type !== 'image/webp') reject(new Error('浏览器暂不支持 WebP，请使用新版浏览器'))
    else resolve(blob)
  }, 'image/webp', 0.9))
}
