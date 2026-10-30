import { BlockAssembler, AssistantStreamAccumulator, expandAssistantStream, ToolCallId, type StreamChunk } from './support.ts';
export function assemblyPractice(reason: 'tool-calls' | 'max-tokens' = 'tool-calls') {
  const chunks: StreamChunk[] = [
    { type: 'block-start', index: 7, blockType: 'text' },
    { type: 'text-delta', index: 7, text: '先读' },
    { type: 'reasoning-delta', index: 2, text: '检查资料' },
    { type: 'tool-call-delta', index: 4, id: ToolCallId('read-1'), name: 'read_fixture', argumentsDelta: '{"path":' },
    { type: 'text-delta', index: 7, text: 'README' },
    { type: 'tool-call-delta', index: 4, id: ToolCallId('read-1'), argumentsDelta: '"README.md"}' },
    { type: 'block-end', index: 4, block: { type: 'tool-call', id: ToolCallId('read-1'), name: 'read_fixture', arguments: '{"path":"README.md"}' } },
    { type: 'usage', usage: { inputTokens: 10, outputTokens: 6 } },
    { type: 'finish', reason: { kind: reason }, replayState: { response: { fixture: true }, blocks: ['text-meta', 'reason-meta', 'tool-meta'] } },
  ];
  const assembler = new BlockAssembler(), accumulator = new AssistantStreamAccumulator(), states: any[] = [];
  for (const [i, chunk] of chunks.entries()) {
    const timed = accumulator.push({ time: 1000 + i * 5, chunk }); assembler.push(timed.chunk);
    states.push({ chunk, blocks: structuredClone(assembler.blocks()), interrupted: assembler.interruptedBlocks(), usage: assembler.usage, finish: assembler.finish });
  }
  const compact = accumulator.snapshot();
  return { chunks, states, blocks: assembler.blocks(), usage: assembler.usage, finish: assembler.finish, replay: assembler.replayState, compact, expanded: expandAssistantStream(compact) };
}
