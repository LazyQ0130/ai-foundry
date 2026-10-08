import { z } from 'zod'
import { chatCompletion, firstMessage, ResearchProviderError } from './research-chat'

export const researchBriefSchema = z.object({
  goal: z.string().trim().min(1).max(500),
  subquestions: z.array(z.string().trim().min(1).max(300)).min(1).max(3),
}).strict()
export type ResearchBrief = z.infer<typeof researchBriefSchema>

export async function generateResearchBrief(query: string, signal: AbortSignal): Promise<ResearchBrief> {
  if (process.env.AI_RESEARCH_MODE !== 'real') {
    if (process.env.C5_MOCK_TEST_SCENARIOS === '1' && query.includes('[C5_TEST:brief_error]')) throw new ResearchProviderError('BRIEF_FAILED')
    return researchBriefSchema.parse({ goal: query.slice(0, 500), subquestions: [
      query.slice(0, 300), `比较相关证据的差异：${query}`.slice(0, 300),
    ] })
  }
  const raw = await chatCompletion([
    { role: 'system', content: 'Return JSON object with exactly goal (string <=500) and subquestions (1-3 strings <=300). This is a bounded research plan. Do not call tools or invent sources.' },
    { role: 'user', content: query.slice(0, 2000) },
  ], { signal, maxTokens: 450 })
  try {
    const content = firstMessage(raw).content
    if (!content || content.length > 4000) throw new Error('invalid')
    return researchBriefSchema.parse(JSON.parse(content))
  } catch { throw new ResearchProviderError('BRIEF_FAILED') }
}
