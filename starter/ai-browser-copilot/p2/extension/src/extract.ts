import type { Extracted } from './contracts';

// TODO P2-2: implement a self-contained, bounded, visible top-level HTML extractor.
// chrome.scripting serializes this function; imported runtime values are unavailable in the page.
export function extractPage(): { ok: true; data: Extracted } | { ok: false; code: 'NO_CONTENT' | 'UNSUPPORTED_PAGE' } {
  return { ok: false, code: 'NO_CONTENT' };
}
export function probeDocument() {
  // TODO P2-4: return the current document URL and MIME type; documentId comes from InjectionResult.
  return { url: '', contentType: '' };
}
