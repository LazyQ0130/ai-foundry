import type { z } from 'zod';
import type { SummaryRequest, SummaryResponse } from '../../../shared/contracts';
export interface SummaryProvider {
  summarize(input: z.infer<typeof SummaryRequest>, signal: AbortSignal): Promise<z.infer<typeof SummaryResponse>>;
}
export const mock: SummaryProvider = {
  async summarize(input, signal) {
    signal.throwIfAborted();
    return { requestId: input.requestId, snapshotId: input.snapshot.snapshotId, provider: 'mock', text: `[MOCK] ${input.snapshot.title}\n${input.snapshot.text.slice(0, 120)}\n输入字符数：${input.snapshot.text.length}` };
  },
};
