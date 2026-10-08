import { z } from 'zod'
import { isExternal, type ResearchEvidence } from './external-contract'

export const MAX_EVIDENCE = 8
export const MAX_EVIDENCE_CHARS = 24_000
export const MAX_REPORT_CLAIMS = 12
export const MAX_CLAIM_CHARS = 500
export const MAX_CITATIONS_PER_CLAIM = 3

const claim = z.object({
  text: z.string().trim().min(1).max(MAX_CLAIM_CHARS),
  citationKeys: z.array(z.string().min(1).max(150)).min(1).max(MAX_CITATIONS_PER_CLAIM),
}).strict()
export const groundedReportSchema = z.object({
  answerability: z.enum(['grounded', 'insufficient_evidence']),
  summary: z.array(claim).max(MAX_REPORT_CLAIMS),
  findings: z.array(claim).max(MAX_REPORT_CLAIMS),
  analysis: z.array(claim).max(MAX_REPORT_CLAIMS),
  conclusion: z.array(claim).max(MAX_REPORT_CLAIMS),
  message: z.string().trim().max(500).optional(),
}).strict()
export type GroundedReport = z.infer<typeof groundedReportSchema>
const sections = ['summary', 'findings', 'analysis', 'conclusion'] as const

export function insufficientReport(): GroundedReport {
  return { answerability: 'insufficient_evidence', summary: [], findings: [], analysis: [],
    conclusion: [], message: '当前资料不足以支持这个结论。请增加相关资料后再运行。' }
}

export function validateGroundedReport(raw: unknown, evidence: ResearchEvidence[]):
  { report: GroundedReport; cited: ResearchEvidence[] } {
  const report = groundedReportSchema.parse(raw)
  const claims = sections.flatMap(section => report[section])
  if (claims.length > MAX_REPORT_CLAIMS) throw new Error('TOO_MANY_CLAIMS')
  if (report.answerability === 'insufficient_evidence') {
    if (claims.length || !report.message) throw new Error('INVALID_ABSTENTION')
    return { report, cited: [] }
  }
  if (!claims.length) throw new Error('EMPTY_GROUNDED_REPORT')
  const allowed = new Map(evidence.map(item => [item.citationKey, item]))
  if (allowed.size !== evidence.length) throw new Error('DUPLICATE_EVIDENCE_KEY')
  const cited = new Map<string, ResearchEvidence>()
  for (const item of claims) for (const key of item.citationKeys) {
    const source = allowed.get(key)
    if (!source) throw new Error('UNKNOWN_CITATION')
    cited.set(key, source)
  }
  return { report, cited: [...cited.values()] }
}

export function citationSnapshots(cited: ResearchEvidence[]) {
  return cited.map((item, index) => ({ position: index + 1, citationKey: item.citationKey,
    ...(isExternal(item) ? { sourceType: 'CROSSREF', externalId: item.externalId, sourceUrl: item.sourceUrl,
      publishedYear: item.publishedYear, sourceVersion: item.sourceVersion, supportLevel: item.supportLevel,
      title: item.title, excerpt: item.content.slice(0, 1600), documentId: null, chunkId: null,
      page: null, startOffset: null, endOffset: null, sourceContentHash: null, sourceIndexingVersion: null } : {
    sourceType: 'KNOWLEDGE', documentId: item.documentId, chunkId: item.chunkId,
    title: item.title, excerpt: item.content.slice(0, 1200), page: item.page,
    startOffset: item.startOffset, endOffset: item.endOffset,
    sourceContentHash: item.contentHash, sourceIndexingVersion: item.indexingVersion }) }))
}
