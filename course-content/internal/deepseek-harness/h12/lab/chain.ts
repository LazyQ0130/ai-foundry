import { settlementPractice } from './settlement.ts';
export async function chainPractice() {
  const result = await settlementPractice('tool-chain');
  const stages = result.trace.flatMap((item, position) => {
    if (item.channel === 'fact') return [{ position, kind: item.event.type, seq: item.event.seq }];
    if (item.channel === 'live') return [{ position, kind: 'live/' + item.frame.type, attemptId: item.frame.attemptId,
      ...item.frame.type === 'chunk' ? { chunk: item.frame.chunk.type, blockIndex: item.frame.chunk.index } : {} }];
    if (item.channel === 'tool-body') return [{ position, kind: 'tool-body', text: item.result }];
    return [];
  });
  return { ...result, stages };
}
