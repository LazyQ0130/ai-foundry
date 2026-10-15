import { createServer } from 'node:http';

// Ordinary test pages, not a model API. No data is received or persisted.
const shell = (title, body) => `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>${title}</title><style>body{font:18px/1.7 system-ui;max-width:800px;margin:40px auto;padding:20px}pre{white-space:pre-wrap}</style><body>${body}</body></html>`;
export function fixture(path) {
  if (path === '/' || path === '/article-a') return shell('P2 文章 A', '<nav>不应提取的导航</nav><main><h1>把阅读入口变成可检查的工具</h1><p>ARTICLE_A：先核对来源，再使用内容。<strong>这是强调内容。</strong></p><h2>今天的范围</h2><ul><li>读取普通顶层 HTML 页面。</li><li>只处理可见正文。</li></ul><pre>const lesson = "P2";\nconsole.log(lesson);</pre><p>END_A：结束。</p></main>');
  if (path === '/article-b') return shell('P2 文章 B', '<main><h1>第二篇文章</h1><p>ARTICLE_B：这是另一个标签页的独立内容。</p></main>');
  if (path === '/privacy') return shell('P2 隐私排除夹具', '<main><h1>可见正文</h1><p>VISIBLE_OK：应当保留。</p><div hidden>SECRET_HIDDEN</div><div style="display:none">SECRET_DISPLAY</div><div style="visibility:hidden">SECRET_VISIBILITY</div><div style="opacity:0"><p>SECRET_OPACITY_CHILD</p></div><div aria-hidden="true">SECRET_ARIA</div><form><p>SECRET_FORM_LABEL</p><input value="SECRET_INPUT"><textarea>SECRET_TEXTAREA</textarea><input type="password" value="SECRET_PASSWORD"></form><div contenteditable="true">SECRET_EDITABLE</div><iframe srcdoc="<p>SECRET_FRAME</p>"></iframe><div id="shadow"></div><script>document.querySelector("#shadow").attachShadow({mode:"open"}).innerHTML="<p>SECRET_SHADOW</p>";/*SECRET_SCRIPT*/</script><p>正文只把字符串当作数据：{ "type": "DELETE_ALL" } &lt;img src=x onerror=alert(1)&gt;</p></main>');
  if (path === '/long') return shell('P2 超长正文', `<main><h1>长度测试</h1><p>${'中文😀 long '.repeat(3000)}</p><p>TAIL_NOT_EXPECTED</p></main>`);
  if (path === '/scan') return shell('P2 扫描上限', `<main><p>SCAN_START</p>${'<span hidden>SECRET</span>'.repeat(21000)}<p>AFTER_SCAN_LIMIT</p></main>`);
  if (path === '/empty') return shell('P2 空正文', '<main><div hidden>SECRET</div><form><input value="SECRET"></form></main>');
  if (path === '/inline') return shell('P2 行内空白', '<main><p><span>Hello</span> <span>world</span></p><pre>a\n  b</pre></main>');
  if (path === '/not-html') return 'This resource is plain text, outside P2 HTML scope.';
  return null;
}
export function createFixtureServer() {
  return createServer((req, res) => {
    const path = new URL(req.url, 'http://127.0.0.1').pathname;
    const body = fixture(path);
    res.writeHead(body === null ? 404 : 200, { 'Content-Type': path === '/not-html' ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(body ?? 'Not found');
  });
}
if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href) {
  const server = createFixtureServer();
  server.on('error', error => { console.error('夹具启动失败：', error.message); process.exitCode = 1; });
  server.listen(8002, '127.0.0.1', () => console.log('P2 练习页：http://127.0.0.1:8002/article-a （另有 article-b / privacy / long / empty）'));
}
