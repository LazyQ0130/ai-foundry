import type { PageContext, Request, Snapshot } from './contracts';
export type ReadState = { status: 'idle' | 'loading' | 'success' | 'error'; message: string; snapshot?: Snapshot };
export type ClientPort = { context(): Promise<PageContext>; send(request: Request): Promise<unknown> };
export function createReader(_port: ClientPort, publish: (state: ReadState) => void, _timeoutMs = 6000) {
  // TODO P2-4/5: implement generation guards, bounded messages, strict replies and final CHECK_CONTEXT.
  const unfinished = async () => { publish({ status: 'error', message: 'P2 读取交互尚未实现。' }); };
  return { read: unfinished, check: unfinished, invalidate: (message = '请实现页面失效处理。') => publish({ status: 'idle', message }) };
}
