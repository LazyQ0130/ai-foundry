import { CaptureError, deadline, ExtractedSchema, RequestSchema, supportedUrl, type PageContext, type Response } from './contracts';
import { createSessionTokens, type ContextLease } from './context-tokens';
import { extractPage, probeDocument } from './extract';

export type BrowserPort = Pick<typeof chrome, 'tabs' | 'scripting' | 'runtime'>;
export function createCoordinator(api: BrowserPort, tokens: ReturnType<typeof createSessionTokens>, timeoutMs = 4000) {
  type Lifetime = { expired: boolean };
  const requireLive = (life: Lifetime) => { if (life.expired) throw new CaptureError('TIMEOUT', '读取已超时，不再继续注入。'); };
  async function current(context: PageContext, lease: ContextLease, life: Lifetime): Promise<void> {
    requireLive(life);
    const [tab, active] = await Promise.all([
      api.tabs.get(context.tabId), api.tabs.query({ active: true, windowId: context.windowId }),
    ]).catch(() => { throw new CaptureError('TAB_CHANGED', '标签页已关闭或移出当前窗口。'); });
    requireLive(life);
    if (!tokens.isCurrent(context.tabId, lease) || !tab.active || tab.status === 'loading' ||
      tab.windowId !== context.windowId || tab.url !== context.url || active[0]?.id !== context.tabId) {
      throw new CaptureError('TAB_CHANGED', '页面已变化，请重新读取。');
    }
  }
  async function probe(context: PageContext, lease: ContextLease, documentId: string, life: Lifetime): Promise<void> {
    await current(context, lease, life);
    const result = await api.scripting.executeScript({ target: { tabId: context.tabId, frameIds: [0] }, world: 'ISOLATED', func: probeDocument });
    const first = result[0];
    if (result.length !== 1 || first?.frameId !== 0 || first.documentId !== documentId ||
      first.result?.url !== context.url || !['text/html','application/xhtml+xml'].includes(first.result?.contentType ?? '')) {
      throw new CaptureError('TAB_CHANGED', '文档已变化，请重新读取。');
    }
    await current(context, lease, life);
  }
  return async function handle(raw: unknown, sender: chrome.runtime.MessageSender): Promise<Response> {
    const parsed = RequestSchema.safeParse(raw);
    // Validate BEFORE allocating a lease or injecting. Page text is never an instruction channel.
    if (!parsed.success || sender.id !== api.runtime.id || sender.url !== api.runtime.getURL('sidepanel.html') || sender.tab) {
      return { v: 1, ok: false, requestId: parsed.success ? parsed.data.requestId : '', error: { code: 'BAD_MESSAGE', message: '消息格式或发送来源不受支持。' } };
    }
    const request = parsed.data;
    const life: Lifetime = { expired: false };
    try {
      return await deadline((async (): Promise<Response> => {
        if (!supportedUrl(request.context.url)) throw new CaptureError('UNSUPPORTED_PAGE', '仅支持普通顶层 HTTP/HTTPS HTML 页面。');
        const lease = tokens.lease(request.context.tabId);
        const token = await lease.ready.catch(() => { throw new CaptureError('CONTEXT_UNAVAILABLE', '页面代次存储暂不可用，请重试。'); });
        await current(request.context, lease, life);
        if (request.type === 'CHECK_CONTEXT') {
          if (request.contextToken !== token) throw new CaptureError('TAB_CHANGED', '快照代次已失效，请重新读取。');
          await probe(request.context, lease, request.documentId, life);
          return { v: 1, ok: true, requestId: request.requestId, data: { current: true } };
        }
        const results = await api.scripting.executeScript({ target: { tabId: request.context.tabId, frameIds: [0] }, world: 'ISOLATED', func: extractPage });
        await current(request.context, lease, life);
        const first = results[0];
        if (results.length !== 1 || first?.frameId !== 0 || !first.documentId || !first.result) throw new CaptureError('CONTEXT_UNAVAILABLE', '页面没有返回可验证的文档结果。');
        if (!first.result.ok) throw new CaptureError(first.result.code, first.result.code === 'NO_CONTENT' ? '没有找到可见正文。' : '不支持此文档类型。');
        const extracted = ExtractedSchema.safeParse(first.result.data);
        if (!extracted.success || extracted.data.url !== request.context.url) throw new CaptureError('TAB_CHANGED', '提取结果与当前页面不一致。');
        const bytes = new TextEncoder().encode(extracted.data.text);
        const contentHash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('');
        await probe(request.context, lease, first.documentId, life);
        return { v: 1, ok: true, requestId: request.requestId, data: { ...extracted.data,
          context: request.context, snapshotId: crypto.randomUUID(), contextToken: token,
          documentId: first.documentId, contentHash, capturedAt: new Date().toISOString() } };
      })(), timeoutMs);
    } catch (error) {
      const failure = error instanceof CaptureError ? error : new CaptureError('NEEDS_PERMISSION', '无法访问页面。请在普通网页点击工具栏扩展图标授权后重试；也请检查浏览器策略。');
      return { v: 1, ok: false, requestId: request.requestId, error: { code: failure.code, message: failure.message.slice(0, 300) } };
    } finally { life.expired = true; }
  };
}
