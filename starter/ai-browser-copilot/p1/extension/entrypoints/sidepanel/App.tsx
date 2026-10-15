export function App() {
  return <main>
    <p className="eyebrow">P1 · 我的第一个浏览器插件</p>
    {/* P1 练习：改成自己的欢迎标题和用途说明。 */}
    <h1>阅读助手侧栏练习</h1>
    <p>React 页面已经连接。接下来由你接通工具栏，并改写欢迎内容。</p>
    <p className="notice">本节只创建侧栏，不读取网页，不发送页面内容。</p>
    {/* P1 练习：用 React 状态让按钮显示可观察的确认反馈。 */}
    <button type="button" disabled>完成练习后启用确认按钮</button>
    <p className="status" role="status">等待你完成本课。</p>
    <footer>本地练习 · 未发布</footer>
  </main>;
}
