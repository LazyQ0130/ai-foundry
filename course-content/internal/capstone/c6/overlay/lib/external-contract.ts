import { z } from 'zod'
import { createHash } from 'node:crypto'
import type { KnowledgeEvidence } from './knowledge-retrieval'

export const ADAPTER_VERSION = 'crossref-abstract-v1'
export const sourcePolicySchema = z.enum(['PRIVATE_ONLY', 'PRIVATE_AND_EXTERNAL'])
export type SourcePolicy = z.infer<typeof sourcePolicySchema>
// Chosen before private retrieval. The model chooses whether to use the tool,
// but cannot append private observation terms to the outgoing public query.
export const approvedExternalQuery = (question: string) => question.split(/[.!?。！？]/u)[0].trim().slice(0, 200)
export const runInput = z.object({ sourcePolicy: sourcePolicySchema.default('PRIVATE_ONLY') }).strict()
export const externalInput = z.object({ query: z.string().trim().min(3).max(200)
  .refine(value => !/https?:\/\/|www\.|[\r\n]/i.test(value), 'Use public research keywords') }).strict()
export const doiSchema = z.string().max(200).regex(/^10\.\d{4,9}\/[A-Za-z0-9._;()/:-]+$/)
  .refine(value => !/(?:^|\/)\.\.?(?:\/|$)/.test(value) && !value.includes('//'))
export const doiUrl = (doi: string) => `https://doi.org/${doiSchema.parse(doi)}`
export const externalResultSchema = z.object({
  sourceType: z.literal('CROSSREF'), externalId: doiSchema,
  title: z.string().trim().min(1).max(300), sourceUrl: z.string().max(250),
  publishedYear: z.number().int().min(1500).max(2200).nullable(),
  supportLevel: z.enum(['CLAIM_EVIDENCE', 'REFERENCE_METADATA']),
  evidenceText: z.string().trim().min(20).max(1600).nullable(),
}).strict().refine(value => value.sourceUrl === doiUrl(value.externalId) &&
  (value.supportLevel === 'CLAIM_EVIDENCE') === (value.evidenceText !== null))
export const externalResultsSchema = z.array(externalResultSchema).max(3)
export type ExternalReferenceResult = z.infer<typeof externalResultSchema>
export type ExternalEvidence = { sourceType: 'CROSSREF'; citationKey: string; externalId: string;
  title: string; content: string; sourceUrl: string; publishedYear: number | null;
  sourceVersion: string; supportLevel: 'CLAIM_EVIDENCE' }
// Existing C3/C4 primitives retain their private locators; the product adapter tags them.
export type ResearchEvidence = (KnowledgeEvidence & { sourceType?: 'KNOWLEDGE' }) | ExternalEvidence
export const isExternal = (item: ResearchEvidence): item is ExternalEvidence => item.sourceType === 'CROSSREF'
export function externalEvidence(item: ExternalReferenceResult): ExternalEvidence | null {
  const safe = externalResultSchema.parse(item)
  if (safe.supportLevel !== 'CLAIM_EVIDENCE' || !safe.evidenceText) return null
  return { sourceType: 'CROSSREF', externalId: safe.externalId, title: safe.title,
    content: safe.evidenceText, sourceUrl: safe.sourceUrl, publishedYear: safe.publishedYear,
    sourceVersion: ADAPTER_VERSION, supportLevel: 'CLAIM_EVIDENCE',
    citationKey: `ext-crossref-${createHash('sha256').update(JSON.stringify([
      'CROSSREF', safe.externalId, ADAPTER_VERSION, safe.evidenceText])).digest('hex')}` }
}
