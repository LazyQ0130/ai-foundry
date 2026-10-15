import type { Extracted } from './contracts';

// Serialized by chrome.scripting: this function MUST NOT close over imported runtime values.
export function extractPage(): { ok: true; data: Extracted } | { ok: false; code: 'NO_CONTENT' | 'UNSUPPORTED_PAGE' } {
  const MAX_TEXT = 6000, MAX_BLOCK = 1500, MAX_BLOCKS = 100, MAX_NODES = 20000;
  if (!['text/html', 'application/xhtml+xml'].includes(document.contentType) || !document.body) {
    return { ok: false, code: 'UNSUPPORTED_PAGE' };
  }
  const excluded = 'script,style,noscript,template,nav,header,footer,aside,form,input,textarea,select,option,button,label,output,iframe,object,embed,svg,canvas,video,audio,[contenteditable]:not([contenteditable="false"]),[hidden],[inert],[aria-hidden="true"]';
  function skipped(el: Element): boolean {
    if (el.matches(excluded)) return true;
    const style = getComputedStyle(el);
    return style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility) ||
      style.opacity === '0' || style.contentVisibility === 'hidden';
  }
  function ancestorsVisible(el: Element): boolean {
    for (let node: Element | null = el; node; node = node.parentElement) if (skipped(node)) return false;
    return true;
  }
  const firstCandidate = document.querySelector('article,main,[role="main"]');
  const candidate = firstCandidate && ancestorsVisible(firstCandidate) ? firstCandidate : null;
  const root = candidate ?? document.body;
  if (!ancestorsVisible(root)) return { ok: false, code: 'NO_CONTENT' };
  const blocks: Extracted['blocks'] = [];
  let count = 0, size = 0, current: Element | null = null, buffer = '', truncated = false, scanLimited = false;
  function safeSlice(value: string, max: number): string {
    let end = Math.min(value.length, max);
    if (end > 0 && /[\uD800-\uDBFF]/.test(value[end - 1]) && /[\uDC00-\uDFFF]/.test(value[end] ?? '')) end--;
    return value.slice(0, end);
  }
  function flush() {
    const code = current?.tagName === 'PRE';
    let value = code ? buffer.replace(/\r\n?/g, '\n').trim() : buffer.replace(/\s+/g, ' ').trim();
    buffer = '';
    const kind = code ? 'code' : /^H[1-6]$/.test(current?.tagName ?? '') ? 'heading' : current?.tagName === 'LI' ? 'list' : 'paragraph';
    while (value) {
      const available = MAX_TEXT - size - (blocks.length ? 1 : 0);
      if (available <= 0 || blocks.length >= MAX_BLOCKS) { truncated = true; break; }
      const part = safeSlice(value, Math.min(MAX_BLOCK, available));
      if (!part) { truncated = true; break; }
      blocks.push({ id: `b-${String(blocks.length + 1).padStart(3, '0')}`, kind, text: part });
      size += part.length + (blocks.length > 1 ? 1 : 0);
      value = value.slice(part.length);
    }
  }
  const scanStop = Symbol('scan limit');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Rejecting the subtree prevents hidden/form values entering even a temporary text buffer.
      if (++count > MAX_NODES) throw scanStop;
      if (node.nodeType === Node.ELEMENT_NODE) return skipped(node as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node: Node | null;
  try { while ((node = walker.nextNode())) {
    if (count > MAX_NODES) { scanLimited = true; truncated = true; break; }
    const text = node.textContent ?? '';
    if (!text.trim()) {
      if (current && buffer.length <= MAX_TEXT) buffer += safeSlice(text, MAX_TEXT + 1 - buffer.length);
      continue;
    }
    const range = document.createRange(); range.selectNodeContents(node);
    if (!range.getClientRects().length) continue;
    const owner = node.parentElement?.closest('h1,h2,h3,h4,h5,h6,p,li,pre,blockquote,div') ?? root;
    if (current !== owner) { flush(); current = owner; }
    if (truncated) break;
    // Bounded before normalization: never concatenate an unbounded text node.
    const chunk = safeSlice(text, MAX_TEXT + 1 - buffer.length);
    buffer += chunk;
    if (chunk.length < text.length || buffer.length > MAX_TEXT) { flush(); truncated = true; break; }
  } } catch (error) {
    if (error !== scanStop) throw error;
    scanLimited = true; truncated = true;
  }
  if (count > MAX_NODES) { scanLimited = true; truncated = true; }
  flush();
  if (!blocks.length) return { ok: false, code: 'NO_CONTENT' };
  return { ok: true, data: { title: document.title.slice(0, 512), url: location.href,
    blocks, text: blocks.map(b => b.text).join('\n'), truncated, scanLimited } };
}

export function probeDocument() {
  return { url: location.href, contentType: document.contentType };
}
