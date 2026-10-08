import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { fileKind, KnowledgeError, MAX_EXTRACTED_CHARS, normalizedText, type ParsedPage } from './knowledge-core'

export async function parseFile(bytes: Uint8Array, name: string, mime: string): Promise<ParsedPage[]> {
  const kind = fileKind(name, mime)
  if (kind !== 'pdf') {
    let text: string
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes) }
    catch { throw new KnowledgeError('INVALID_FILE') }
    const normalized = normalizedText(text)
    if (!normalized) throw new KnowledgeError('EMPTY_DOCUMENT')
    if (normalized.length > MAX_EXTRACTED_CHARS) throw new KnowledgeError('DOCUMENT_TOO_LARGE_TO_INDEX')
    return [{ page: null, text: normalized }]
  }
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') throw new KnowledgeError('INVALID_FILE')
  let task: ReturnType<typeof getDocument> | undefined
  try {
    task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true })
    const pdf = await task.promise
    const pages: ParsedPage[] = []
    let total = 0
    for (let page = 1; page <= pdf.numPages; page++) {
      const content = await (await pdf.getPage(page)).getTextContent()
      const text = normalizedText(content.items.map(item => 'str' in item ? item.str : '').join(' '))
      total += text.length
      if (total > MAX_EXTRACTED_CHARS) throw new KnowledgeError('DOCUMENT_TOO_LARGE_TO_INDEX')
      pages.push({ page, text })
    }
    if (pages.every(page => !page.text)) throw new KnowledgeError('UNSUPPORTED_SCANNED_PDF')
    return pages
  } catch (error) {
    if (error instanceof KnowledgeError) throw error
    const name = error instanceof Error ? error.name : ''
    if (name === 'PasswordException') throw new KnowledgeError('ENCRYPTED_PDF')
    throw new KnowledgeError('PARSE_FAILED')
  } finally { if (task) await task.destroy().catch(() => {}) }
}
