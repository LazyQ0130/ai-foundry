import { useState } from 'react';

export function App() {
  const [confirmed, setConfirmed] = useState(false);
  return <main>
    <p className="eyebrow">P1 · 我的第一个浏览器插件</p>
    <h1>AI 网页阅读与知识整理助手</h1>
    <p>这是我的阅读入口。先让侧栏稳定打开，再逐课加入阅读能力。</p>
    <p className="notice">本节只创建侧栏，不读取网页，不发送页面内容。</p>
    <button type="button" onClick={() => setConfirmed(true)}>确认已看到侧栏</button>
    <p className="status" role="status">{confirmed ? '确认成功：这是扩展的 React 页面。' : '点击按钮，核对 React 页面确实能够响应。'}</p>
    <footer>本地练习 · 未发布</footer>
  </main>;
}
