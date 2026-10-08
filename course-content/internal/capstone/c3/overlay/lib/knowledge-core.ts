import { createHash } from 'node:crypto'
import { z } from 'zod'

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_EXTRACTED_CHARS = 100_000
export const MAX_CHUNKS = 160
export const CHUNK_SIZE = 800
export const CHUNK_OVERLAP = 120
export const EMBEDDING_DIMENSION = 1024
export const PROCESSING_LEASE_MS = 15 * 60 * 1000
export const PARSER_VERSION = 'pdfjs-6.4.299-text-v1'
export const INDEXING_VERSION = 'chunk-800-120-v1'

export const uploadInput = z.strictObject({
  originalName: z.string().trim().min(1).max(180),
  mimeType: z.string().trim().min(1).max(100),
  byteSize: z.number().int().min(1).max(MAX_FILE_BYTES),
  title: z.string().trim().min(1).max(180),
})
export const searchInput = z.strictObject({ query: z.string().trim().min(1).max(500) })
export type FileKind = 'pdf' | 'md' | 'txt'
export type ParsedPage = { page: number | null; text: string }
export type LocatedChunk = {
  position: number; page: number | null; startOffset: number; endOffset: number;
  content: string; citationKey: string
}

export class KnowledgeError extends Error {
  constructor(readonly code: string) { super(code) }
}

export function fileKind(name: string, mime: string): FileKind {
  const extension = name.toLowerCase().split('.').pop()
  if (extension === 'pdf' && mime === 'application/pdf') return 'pdf'
  if (extension === 'md' && ['text/markdown', 'text/plain'].includes(mime)) return 'md'
  if (extension === 'txt' && mime === 'text/plain') return 'txt'
  throw new KnowledgeError('UNSUPPORTED_FILE_TYPE')
}

export function normalizedText(text: string): string {
  return text.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\u0000/g, '').trim()
}

export function citationKey(contentHash: string, version: string, page: number | null, start: number, end: number, content: string) {
  return createHash('sha256').update(JSON.stringify([contentHash, version, page, start, end, content])).digest('hex').slice(0, 32)
}

export function chunkPages(pages: ParsedPage[], contentHash: string, version = INDEXING_VERSION): LocatedChunk[] {
  const result: LocatedChunk[] = []
  let totalChars = 0
  for (const source of pages) {
    const text = source.text
    totalChars += text.length
    if (totalChars > MAX_EXTRACTED_CHARS) throw new KnowledgeError('DOCUMENT_TOO_LARGE_TO_INDEX')
    for (let start = 0; start < text.length;) {
      const end = Math.min(text.length, start + CHUNK_SIZE)
      const content = text.slice(start, end)
      if (content.trim()) {
        result.push({ position: result.length, page: source.page, startOffset: start, endOffset: end,
          content, citationKey: citationKey(contentHash, version, source.page, start, end, content) })
        if (result.length > MAX_CHUNKS) throw new KnowledgeError('DOCUMENT_TOO_LARGE_TO_INDEX')
      }
      if (end === text.length) break
      start = end - CHUNK_OVERLAP
    }
  }
  if (!result.length) throw new KnowledgeError('EMPTY_DOCUMENT')
  return result
}

export function vectorLiteral(value: unknown): string {
  if (!Array.isArray(value) || value.length !== EMBEDDING_DIMENSION || !value.every(item => typeof item === 'number' && Number.isFinite(item))) {
    throw new KnowledgeError('EMBEDDING_FAILED')
  }
  return `[${value.join(',')}]`
}

export const safeErrors: Record<string, string> = {
  UNSUPPORTED_FILE_TYPE: '只支持 PDF、Markdown 和 TXT 文件。',
  FILE_TOO_LARGE: '文件超过 10 MB 上限。',
  INVALID_FILE: '文件内容与格式不符或编码已损坏。',
  EMPTY_DOCUMENT: '文件没有可索引文本。',
  UNSUPPORTED_SCANNED_PDF: '这是没有可提取文本的 PDF；本课暂不支持 OCR。',
  ENCRYPTED_PDF: '加密 PDF 暂不支持，请先提供可读取的文本版本。',
  PARSE_FAILED: 'PDF 解析失败，请检查文件。',
  STORAGE_FAILED: '原文件读取失败，请重新上传或稍后重试。',
  EMBEDDING_FAILED: '向量生成失败，可以重试。',
  DOCUMENT_TOO_LARGE_TO_INDEX: '文件提取出的文本或片段超过本课索引上限。',
  INDEX_FAILED: '索引写入失败，可以重试。',
}
