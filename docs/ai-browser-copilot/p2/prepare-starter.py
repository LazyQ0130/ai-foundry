"""Synchronize only explicitly supplied P2 scaffolding; never copy the full reference."""
from pathlib import Path
import shutil
repo=Path(__file__).resolve().parents[3]
ref=repo/'course-content/internal/ai-browser-copilot/p2/reference'
starter=repo/'starter/ai-browser-copilot/p2'
for name in ['package.json','package-lock.json','extension/wxt.config.ts','extension/src/contracts.ts',
             'extension/src/context-tokens.ts','scripts/fixtures.mjs','extension/entrypoints/sidepanel/index.html']:
    dest=starter/name; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(ref/name,dest)
(starter/'extension/src/extract.ts').write_text('''import type { Extracted } from './contracts';

// TODO P2-2: implement a self-contained, bounded, visible top-level HTML extractor.
// chrome.scripting serializes this function; imported runtime values are unavailable in the page.
export function extractPage(): { ok: true; data: Extracted } | { ok: false; code: 'NO_CONTENT' | 'UNSUPPORTED_PAGE' } {
  return { ok: false, code: 'NO_CONTENT' };
}
export function probeDocument() {
  // TODO P2-4: return the current document URL and MIME type; documentId comes from InjectionResult.
  return { url: '', contentType: '' };
}
''',encoding='utf-8')
(starter/'extension/src/coordinator.ts').write_text('''import type { Response } from './contracts';
import { createSessionTokens } from './context-tokens';
export type BrowserPort = Pick<typeof chrome, 'tabs' | 'scripting' | 'runtime'>;
export function createCoordinator(_api: BrowserPort, _tokens: ReturnType<typeof createSessionTokens>, _timeoutMs = 4000) {
  // TODO P2-3/4: strict sender + contract, fixed injection, current context/lease/document checks and deadline.
  return async function handle(_raw: unknown, _sender: chrome.runtime.MessageSender): Promise<Response> {
    return { v: 1, ok: false, requestId: '', error: { code: 'BAD_MESSAGE', message: 'P2 消息协调尚未实现。' } };
  };
}
''',encoding='utf-8')
(starter/'extension/src/read-client.ts').write_text('''import type { PageContext, Request, Snapshot } from './contracts';
export type ReadState = { status: 'idle' | 'loading' | 'success' | 'error'; message: string; snapshot?: Snapshot };
export type ClientPort = { context(): Promise<PageContext>; send(request: Request): Promise<unknown> };
export function createReader(_port: ClientPort, publish: (state: ReadState) => void, _timeoutMs = 6000) {
  // TODO P2-4/5: implement generation guards, bounded messages, strict replies and final CHECK_CONTEXT.
  const unfinished = async () => { publish({ status: 'error', message: 'P2 读取交互尚未实现。' }); };
  return { read: unfinished, check: unfinished, invalidate: (message = '请实现页面失效处理。') => publish({ status: 'idle', message }) };
}
''',encoding='utf-8')
background=(repo/'course-content/internal/ai-browser-copilot/p1/reference/extension/entrypoints/background.ts').read_text('utf-8')
background=background.replace('P1 ', 'P2 ').replace('export default defineBackground(() => {', '''export default defineBackground(() => {
  // TODO P2-3/4: synchronously register the message route and page invalidation listeners here.
  // Keep the completed P1 toolbar callback below synchronous; do not move reads into this callback.''')
(starter/'extension/entrypoints/background.ts').write_text(background,encoding='utf-8')
app=(repo/'course-content/internal/ai-browser-copilot/p1/reference/extension/entrypoints/sidepanel/App.tsx').read_text('utf-8')
app=app.replace('P1 · 我的第一个浏览器插件','P2 · 网页读取练习起点')
app=app.replace('本节只创建侧栏，不读取网页，不发送页面内容。','P1 入口已经完成。请按本课任务实现授权后的只读网页能力。')
app=app.replace('    <footer>', '''    {/* TODO P2-5: connect createReader, scoped tab events, status and safe text rendering. */}
    <button type="button" disabled>读取当前网页（完成本课后启用）</button>
    <footer>''')
(starter/'extension/entrypoints/sidepanel/App.tsx').write_text(app,encoding='utf-8')
readme=(ref/'README.md').read_text('utf-8').replace('# P2 Reference · 内容提取与扩展通信','# P2 Student Starter · 在P1基础上完成网页读取练习')
readme=readme.replace('本课结束态，基于P1 Reference增量开发。尚未发布，不含模型、选区、问答或笔记功能。先做Starter练习，再用本项目对照。',
'''这是P2练习起点，继承已完成的P1工具栏与React确认交互。contracts和context-tokens是提供的基础工具；提取器、协调器、客户端、页面失效事件与结果UI留有TODO。读取按钮刻意禁用，项目可以安装和构建，但不应误报已完成P2。

先跟随正文逐项实现TODO；下文读取成功、生产行为与错误恢复描述的是完成练习后的目标。不要直接复制整个Reference，也不要下载Phase0 Spike充当作业。尚未发布，不含模型、选区、问答或笔记功能。''')
(starter/'README.md').write_text(readme,encoding='utf-8')
print('Starter retains P1, contracts and anonymous-session foundation; P2 implementation remains TODO.')
