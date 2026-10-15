// Serialized by scripting.executeScript: keep this function self-contained.
export function extractPage(limit: number) {
  const root = document.querySelector('article, main, [role="main"]') ?? document.body;
  const chunks: string[] = [];
  let size = 0;
  let truncated = false;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, noscript, nav, footer, header, aside, form, input, textarea, select, [contenteditable], [hidden], [aria-hidden="true"]')) continue;
    const style = getComputedStyle(parent);
    if (style.visibility === 'hidden' || style.display === 'none' || !parent.getClientRects().length) continue;
    const text = node.textContent?.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    chunks.push(text.slice(0, Math.max(0, limit - size)));
    size += text.length + 1;
    if (size > limit) { truncated = true; break; }
  }
  return { url: location.href, title: document.title.slice(0, 512), text: chunks.join('\n').slice(0, limit), truncated };
}
