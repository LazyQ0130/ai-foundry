import type { Response } from './contracts';
import { createSessionTokens } from './context-tokens';
export type BrowserPort = Pick<typeof chrome, 'tabs' | 'scripting' | 'runtime'>;
export function createCoordinator(_api: BrowserPort, _tokens: ReturnType<typeof createSessionTokens>, _timeoutMs = 4000) {
  // TODO P2-3/4: strict sender + contract, fixed injection, current context/lease/document checks and deadline.
  return async function handle(_raw: unknown, _sender: chrome.runtime.MessageSender): Promise<Response> {
    return { v: 1, ok: false, requestId: '', error: { code: 'BAD_MESSAGE', message: 'P2 消息协调尚未实现。' } };
  };
}
