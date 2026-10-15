import { Request, Selection, SelectionSlot, Snapshot, MAX_TEXT, SELECTION_TTL_MS, sameContext, supported } from '../../shared/contracts';
import { extractPage } from './extract';

// Inject the Chrome adapter for deterministic tests; these do not prove native interaction.
export type Platform = Pick<typeof chrome, 'runtime' | 'tabs' | 'scripting' | 'storage' | 'sidePanel'>;
export function createCoordinator(api: Platform, now = Date.now) {
  const tokens = new Map<number, string>();
  const queues = new Map<number, Promise<unknown>>();
  const latestSelection = new Map<number, string>();
  const token = (tabId: number) => { if (!tokens.has(tabId)) tokens.set(tabId, crypto.randomUUID()); return tokens.get(tabId)!; };
  const key = (windowId: number) => `selection:${windowId}`;
  function enqueue<T>(windowId: number, work: () => Promise<T>): Promise<T> {
    const next = (queues.get(windowId) ?? Promise.resolve()).catch(() => {}).then(work);
    queues.set(windowId, next);
    void next.finally(() => { if (queues.get(windowId) === next) queues.delete(windowId); }).catch(() => {});
    return next;
  }
  function invalidate(tabId: number, windowId: number, clearSelection = true) {
    tokens.set(tabId, crypto.randomUUID());
    if (clearSelection) {
      latestSelection.delete(windowId);
      void enqueue(windowId, () => api.storage.session.remove(key(windowId))).catch(console.error);
    }
  }
  async function current(context: {tabId: number; url: string}, windowId: number, expected: string) {
    const [active] = await api.tabs.query({ active: true, windowId });
    const tab = await api.tabs.get(context.tabId);
    return tab.windowId === windowId && sameContext({tabId: active?.id ?? -1, url: active?.url}, context)
      && sameContext({tabId: tab.id!, url: tab.url}, context) && token(context.tabId) === expected;
  }
  function select(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    const tabId = tab.id!;
    const capturedAt = now();
    const expected = token(tabId);
    const eventId = crypto.randomUUID();
    latestSelection.set(tab.windowId, eventId);
    // Keep this synchronous in the native contextMenus handler to preserve the gesture.
    void api.sidePanel.open({windowId:tab.windowId}).catch(console.error);
    return enqueue(tab.windowId, async () => {
      await api.storage.session.remove(key(tab.windowId));
      if (latestSelection.get(tab.windowId) !== eventId) return;
      const parsed = Selection.safeParse({tabId, url:info.pageUrl, text:info.frameId && info.frameId !== 0 ? '' : info.selectionText ?? '', createdAt:capturedAt, requestId:eventId, contextToken:expected});
      const valid = parsed.success && supported(parsed.data.url) && now() - capturedAt >= 0 && now() - capturedAt < SELECTION_TTL_MS
        && await current(parsed.data, tab.windowId, expected);
      if (latestSelection.get(tab.windowId) !== eventId) return;
      await api.storage.session.set({[key(tab.windowId)]: valid ? {ok:true, data:parsed.data} : {ok:false, message:'选区为空、超过 2000 字符、位于子框架或页面已变化，请重新选择。'}});
    });
  }
  async function handle(raw: unknown, sender: chrome.runtime.MessageSender) {
    const parsed = Request.safeParse(raw);
    if (sender.id !== api.runtime.id || sender.tab || sender.url !== api.runtime.getURL('sidepanel.html') || !parsed.success)
      return {ok:false, requestId:'', code:'BAD_MESSAGE', message:'消息来源或格式不正确。'};
    const request = parsed.data;
    const expected = token(request.context.tabId);
    const fail = (code: string, message: string) => ({ok:false, requestId:request.requestId, code, message});
    try {
      if (!supported(request.context.url)) return fail('UNSUPPORTED_PAGE', '此页面不允许读取。请打开普通 HTTPS 网页。');
      const tab = await api.tabs.get(request.context.tabId);
      if (!await current(request.context, tab.windowId, expected)) return fail('TAB_CHANGED', '页面已变化，请重新授权当前页。');
      if (request.type === 'CHECK_CONTEXT') {
        return request.contextToken === expected ? {ok:true, requestId:request.requestId, data:{current:true}} : fail('TAB_CHANGED', '快照已失效，请重新读取。');
      }
      if (request.type === 'TAKE_SELECTION') {
        return await enqueue(tab.windowId, async () => {
          const slot = SelectionSlot.safeParse((await api.storage.session.get(key(tab.windowId)))[key(tab.windowId)]);
          await api.storage.session.remove(key(tab.windowId));
          if (!slot.success || !slot.data.ok) return fail('NO_SELECTION', slot.success && !slot.data.ok ? slot.data.message : '没有有效选区，请重新选择。');
          const selection = slot.data.data;
          const age = now() - selection.createdAt;
          if (age < 0 || age >= SELECTION_TTL_MS || !sameContext(selection, request.context) || selection.contextToken !== expected || !await current(request.context, tab.windowId, expected)) return fail('TAB_CHANGED', '选区已失效，请重新选择。');
          return {ok:true, requestId:request.requestId, data:selection};
        });
      }
      let result: chrome.scripting.InjectionResult<ReturnType<typeof extractPage>> | undefined;
      try { [result] = await api.scripting.executeScript({target:{tabId:tab.id!},func:extractPage,args:[MAX_TEXT]}); }
      catch { return fail('NEEDS_PERMISSION', '请点击浏览器工具栏的扩展图标，重新授权当前页。'); }
      if (!await current(request.context, tab.windowId, expected) || result?.result?.url !== request.context.url) return fail('TAB_CHANGED', '读取期间页面已变化，结果已丢弃。');
      if (!result?.result?.text?.trim()) return fail('NO_CONTENT', '未找到可见正文。');
      const snapshot = Snapshot.safeParse({...result.result, tabId:tab.id!, snapshotId:crypto.randomUUID(), contextToken:expected, capturedAt:new Date(now()).toISOString()});
      if (!snapshot.success) return fail('BAD_MESSAGE', '页面读取结果格式不正确。');
      return {ok:true, requestId:request.requestId, data:snapshot.data};
    } catch { return fail('TAB_CHANGED', '标签页已关闭或不可访问，请重新授权。'); }
  }
  return {handle, select, invalidate};
}
