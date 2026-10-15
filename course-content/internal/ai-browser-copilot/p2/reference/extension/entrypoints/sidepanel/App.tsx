import { useEffect, useRef, useState } from 'react';
import { createReader, type ReadState } from '../../src/read-client';
import { CaptureError, PageContextSchema } from '../../src/contracts';

export function App() {
  const [confirmed, setConfirmed] = useState(false);
  const [state, setState] = useState<ReadState>({ status: 'idle', message: '先在当前网页点击工具栏扩展图标授权，再点击读取。' });
  const reader = useRef<ReturnType<typeof createReader>>();
  useEffect(() => {
    let disposed = false, windowId: number | undefined, activeId: number | undefined;
    const windowReady = chrome.windows.getCurrent().then(win => {
      if (win.id === undefined) throw new Error('No window');
      windowId = win.id; return win.id;
    });
    void windowReady.catch(() => { if (!disposed) setState({ status: 'error', message: 'CONTEXT_UNAVAILABLE：无法确定侧栏所属窗口。' }); });
    const service = createReader({
      async context() {
        const id = await windowReady;
        const [tab] = await chrome.tabs.query({ active: true, windowId: id });
        if (!tab || tab.id === undefined || !tab.url) throw new CaptureError('NEEDS_PERMISSION', '请在普通网页点击工具栏扩展图标授权。');
        activeId = tab.id;
        return PageContextSchema.parse({ windowId: id, tabId: tab.id, url: tab.url });
      },
      send: request => chrome.runtime.sendMessage(request),
    }, next => { if (!disposed) setState(next); });
    reader.current = service;
    const activated = (info: { tabId: number; windowId: number }) => {
      if (windowId === undefined || info.windowId === windowId) { activeId = info.tabId; service.invalidate(); }
    };
    const updated = (tabId: number, change: { status?: string; url?: string }, tab: chrome.tabs.Tab) => {
      if ((windowId === undefined || tab.windowId === windowId) && (tabId === activeId || tab.active) &&
        (change.status === 'loading' || change.url !== undefined)) service.invalidate();
    };
    const removed = (tabId: number) => { if (tabId === activeId) service.invalidate(); };
    const detached = (tabId: number) => { if (tabId === activeId) service.invalidate(); };
    const replaced = (added: number, old: number) => { if (old === activeId) { activeId = added; service.invalidate(); } };
    chrome.tabs.onActivated.addListener(activated);
    chrome.tabs.onUpdated.addListener(updated);
    chrome.tabs.onRemoved.addListener(removed);
    chrome.tabs.onDetached.addListener(detached);
    chrome.tabs.onReplaced.addListener(replaced);
    return () => {
      disposed = true; service.invalidate(); reader.current = undefined;
      chrome.tabs.onActivated.removeListener(activated); chrome.tabs.onUpdated.removeListener(updated);
      chrome.tabs.onRemoved.removeListener(removed); chrome.tabs.onDetached.removeListener(detached);
      chrome.tabs.onReplaced.removeListener(replaced);
    };
  }, []);
  const snapshot = state.snapshot;
  return <main>
    <p className="eyebrow">P2 · 让插件看懂网页</p>
    <h1>AI 网页阅读与知识整理助手</h1>
    <p>这是我的阅读入口。先让侧栏稳定打开，再逐课加入阅读能力。</p>
    <p className="notice">仅在你授权后读取当前顶层 HTML 页面；本节不调用模型，不保存正文。</p>
    <button type="button" onClick={() => setConfirmed(true)}>确认已看到侧栏</button>
    <p className="status" role="status">{confirmed ? '确认成功：这是扩展的 React 页面。' : '点击按钮，核对 React 页面确实能够响应。'}</p>
    <div className="actions">
      <button type="button" disabled={state.status === 'loading'} onClick={() => void reader.current?.read()}>读取当前网页</button>
      <button type="button" disabled={state.status === 'loading' || !snapshot} onClick={() => void reader.current?.check()}>检查快照有效性</button>
    </div>
    <p className="status" role="status" data-testid="read-status">{state.message}</p>
    {snapshot && <section aria-label="网页提取结果">
      <h2>{snapshot.title || '无标题页面'}</h2>
      <p className="source">{snapshot.url}</p>
      <p>{snapshot.text.length} / 6000 字符 · {snapshot.blocks.length} 个块{snapshot.truncated ? ' · 已截断，非完整正文' : ' · 未截断'}{snapshot.scanLimited ? ' · 已达扫描上限' : ''}</p>
      <details><summary>核对来源与页面代次</summary><dl>
        {Object.entries({ tabId: snapshot.context.tabId, windowId: snapshot.context.windowId,
          snapshotId: snapshot.snapshotId, contextToken: snapshot.contextToken, documentId: snapshot.documentId,
          capturedAt: snapshot.capturedAt, contentHash: snapshot.contentHash }).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
      </dl></details>
      <ol className="blocks">{snapshot.blocks.map(block => <li key={block.id} data-kind={block.kind}>
        <small>{block.id} · {block.kind}</small><p>{block.text}</p>
      </li>)}</ol>
    </section>}
    <footer>本地练习 · 未发布 · 不含 AI 摘要</footer>
  </main>;
}
