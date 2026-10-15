import { useState } from 'react';

export function App() {
  const [confirmed, setConfirmed] = useState(false);
  return <main>
    <p className="eyebrow">P2 · 网页读取练习起点</p>
    <h1>AI 网页阅读与知识整理助手</h1>
    <p>这是我的阅读入口。先让侧栏稳定打开，再逐课加入阅读能力。</p>
    <p className="notice">P1 入口已经完成。请按本课任务实现授权后的只读网页能力。</p>
    <button type="button" onClick={() => setConfirmed(true)}>确认已看到侧栏</button>
    <p className="status" role="status">{confirmed ? '确认成功：这是扩展的 React 页面。' : '点击按钮，核对 React 页面确实能够响应。'}</p>
    {/* TODO P2-5: connect createReader, scoped tab events, status and safe text rendering. */}
    <button type="button" disabled>读取当前网页（完成本课后启用）</button>
    <footer>本地练习 · 未发布</footer>
  </main>;
}
