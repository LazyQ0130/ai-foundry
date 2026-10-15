import { CaptureError, deadline, PageContextSchema, ResponseSchema, SnapshotSchema, sameContext, supportedUrl, type PageContext, type Request, type Snapshot } from './contracts';

export type ReadState = { status: 'idle' | 'loading' | 'success' | 'error'; message: string; snapshot?: Snapshot };
export type ClientPort = { context(): Promise<PageContext>; send(request: Request): Promise<unknown> };
// Independent UI generation guards both successful and failed superseded requests.
export function createReader(port: ClientPort, publish: (state: ReadState) => void, timeoutMs = 6000) {
  let generation = 0;
  let snapshot: Snapshot | undefined;
  function invalidate(message = '页面已变化，旧正文已清除。请重新读取。') {
    generation++; snapshot = undefined; publish({ status: 'idle', message });
  }
  async function exchange(request: Request) {
    const reply = ResponseSchema.safeParse(await deadline(port.send(request), timeoutMs));
    if (!reply.success || reply.data.requestId !== request.requestId) throw new CaptureError('BAD_MESSAGE', '响应格式或请求编号不匹配。');
    if (!reply.data.ok) throw new CaptureError(reply.data.error.code, reply.data.error.message);
    return reply.data.data;
  }
  async function run(checkOnly: boolean) {
    const old = snapshot, turn = ++generation;
    const requireTurn = () => {
      if (turn !== generation) throw new CaptureError('TAB_CHANGED', '这次读取已结束或失效。');
    };
    snapshot = undefined;
    publish({ status: 'loading', message: checkOnly ? '正在核对快照…' : '正在读取当前网页…' });
    try {
      const result = await deadline((async () => {
        const context = PageContextSchema.parse(await port.context());
        requireTurn(); // A late context lookup must not start a new capture after timeout/navigation.
        if (!supportedUrl(context.url)) throw new CaptureError('UNSUPPORTED_PAGE', '仅支持普通顶层 HTTP/HTTPS HTML 页面。');
        let candidate: Snapshot;
        if (checkOnly) {
          if (!old || !sameContext(old.context, context)) throw new CaptureError('TAB_CHANGED', '没有属于当前页面的快照。');
          candidate = old;
        } else {
          candidate = SnapshotSchema.parse(await exchange({ v: 1, type: 'CAPTURE', requestId: crypto.randomUUID(), context }));
          requireTurn();
          if (!sameContext(candidate.context, context)) throw new CaptureError('TAB_CHANGED', '返回来源与读取页面不同。');
        }
        const after = PageContextSchema.parse(await port.context());
        if (!sameContext(context, after) || turn !== generation) throw new CaptureError('TAB_CHANGED', '页面已变化，请重新读取。');
        const checked = await exchange({ v: 1, type: 'CHECK_CONTEXT', requestId: crypto.randomUUID(), context,
          contextToken: candidate.contextToken, documentId: candidate.documentId });
        if (!('current' in checked)) throw new CaptureError('BAD_MESSAGE', '快照检查响应类型错误。');
        if (!sameContext(context, PageContextSchema.parse(await port.context())) || turn !== generation) {
          throw new CaptureError('TAB_CHANGED', '最终核对期间页面已变化，请重新读取。');
        }
        return candidate;
      })(), timeoutMs);
      if (turn !== generation) return;
      snapshot = result;
      publish({ status: 'success', message: checkOnly ? '快照仍属于当前文档。' : '读取成功；内容只在当前侧栏内存中展示。', snapshot });
    } catch (error) {
      if (turn !== generation) return;
      generation++; // Also invalidate work still pending underneath the elapsed deadline.
      const failure = error instanceof CaptureError ? error : new CaptureError('CONTEXT_UNAVAILABLE', '页面不可访问或响应无效，请重新授权并读取。');
      publish({ status: 'error', message: `${failure.code}：${failure.message}` });
    }
  }
  return { read: () => run(false), check: () => run(true), invalidate };
}
