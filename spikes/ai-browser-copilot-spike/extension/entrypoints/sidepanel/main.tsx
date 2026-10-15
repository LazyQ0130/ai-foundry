import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Result, Selection, Snapshot, supported, sameContext } from '../../../shared/contracts';
import { requestSummary } from '../../src/api-client';
import './style.css';

function App() {
  const [status, setStatus] = useState('先点击工具栏扩展图标授权当前网页，再读取。');
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [selection, setSelection] = useState<{text:string;url:string;tabId:number}>();
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const windowId = useRef<number>();
  useEffect(() => {
    void chrome.windows.getCurrent().then(w => { windowId.current = w.id; });
    const clear = () => { generation.current++; abort.current?.abort(); setSnapshot(undefined); setSelection(undefined); setSummary(''); setBusy(false); setStatus('页面已变化。请点击扩展图标授权当前页。'); };
    const activated = (info: { windowId: number }) => { if (info.windowId === windowId.current) clear(); };
    const updated = (_id: number, change: { url?: string; status?: string }, tab: chrome.tabs.Tab) => { if (tab.active && tab.windowId === windowId.current && (change.url || change.status === 'loading')) clear(); };
    chrome.tabs.onActivated.addListener(activated);
    chrome.tabs.onUpdated.addListener(updated);
    return () => { chrome.tabs.onActivated.removeListener(activated); chrome.tabs.onUpdated.removeListener(updated); abort.current?.abort(); };
  }, []);
  async function context() {
    const [tab] = await chrome.tabs.query({ active: true, windowId: windowId.current ?? (await chrome.windows.getCurrent()).id });
    if (!tab?.id || !tab.url) throw new Error('请点击工具栏扩展图标授权当前页。');
    if (!supported(tab.url)) throw new Error('UNSUPPORTED_PAGE：此页面不允许读取，请打开普通 HTTPS 网页。');
    return { tabId: tab.id, url: tab.url };
  }
  async function read(type: 'CAPTURE' | 'TAKE_SELECTION') {
    const g = ++generation.current;
    abort.current?.abort(); setBusy(true); setSnapshot(undefined); setSelection(undefined); setSummary('');
    try {
      const ctx = await context();
      const requestId = crypto.randomUUID();
      const result = Result.parse(await chrome.runtime.sendMessage({ v: 1, type, requestId, context: ctx }));
      const after = await context();
      if (g !== generation.current || !sameContext(ctx, after)) return;
      if (!result.ok) throw new Error(`${result.code}：${result.message}`);
      if (result.requestId !== requestId) throw new Error('请求编号不匹配。');
      if (type === 'CAPTURE') {
        const page = Snapshot.parse(result.data);
        if (!sameContext(ctx, page)) throw new Error('TAB_CHANGED：快照来源不匹配。');
        setSnapshot(page); setStatus(page.truncated ? '读取成功（已截断为 6000 字符）' : '读取成功');
      } else {
        const selected = Selection.parse(result.data);
        if (!sameContext(ctx, selected)) throw new Error('TAB_CHANGED：选区来源不匹配。');
        setSelection(selected); setStatus('选区已通过后台消息传到侧栏（60 秒内、一次消费）。');
      }
    } catch (e) { if (g === generation.current) setStatus(e instanceof Error ? e.message : '读取失败'); }
    finally { if (g === generation.current) setBusy(false); }
  }
  async function checkSnapshot(page: Snapshot) {
    const ctx = await context();
    if (!sameContext(page,ctx)) throw new Error('TAB_CHANGED：请重新读取。');
    const requestId = crypto.randomUUID();
    const result = Result.parse(await chrome.runtime.sendMessage({v:1,type:'CHECK_CONTEXT',requestId,context:ctx,contextToken:page.contextToken}));
    if (!result.ok || result.requestId !== requestId || !('current' in result.data)) throw new Error('TAB_CHANGED：快照已失效，请重新读取。');
  }
  async function summarize() {
    if (!snapshot) return;
    const g = ++generation.current;
    const controller = new AbortController(); abort.current = controller;
    setBusy(true); setSummary(''); setStatus('正在请求本机 Mock API…');
    try {
      await checkSnapshot(snapshot);
      if (g !== generation.current || controller.signal.aborted) return;
      const data = await requestSummary(snapshot, controller.signal);
      await checkSnapshot(snapshot);
      if (g !== generation.current) return;
      setSummary(data.text); setStatus('Mock 往返成功（未调用真实模型）');
    } catch (e) { if (g === generation.current) setStatus(e instanceof DOMException && e.name === 'AbortError' ? 'API_TIMEOUT：请求已取消，可重试。' : `API_ERROR：${e instanceof Error ? e.message : '服务不可达'}`); }
    finally { if (g === generation.current) setBusy(false); }
  }
  return <main><h1>AI 网页阅读与知识整理助手</h1><p>Phase 0 技术验证 · 未发布 · 默认 Mock · v{chrome.runtime.getManifest().version}</p><p>扩展 ID：<code>{chrome.runtime.id}</code></p><div className="buttons"><button disabled={busy} onClick={() => read('CAPTURE')}>读取当前网页</button><button disabled={busy} onClick={() => read('TAKE_SELECTION')}>接收右键选区</button><button disabled={busy || !snapshot} onClick={summarize}>调用本机 Mock 摘要</button></div><p role="status">{status}</p>{snapshot && <section><h2>{snapshot.title}</h2><p>{snapshot.url}</p><small>tabId={snapshot.tabId} · snapshotId={snapshot.snapshotId}</small><pre>{snapshot.text}</pre></section>}{selection && <section><h2>选中文字</h2><p>{selection.url} · tabId={selection.tabId}</p><pre>{selection.text}</pre></section>}{summary && <section><h2>Mock 摘要</h2><pre>{summary}</pre></section>}</main>;
}
createRoot(document.getElementById('root')!).render(<App />);
