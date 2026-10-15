import { z } from 'zod';

export const LIMITS = { text: 6000, block: 1500, blocks: 100, nodes: 20000 } as const;
export const PageContextSchema = z.strictObject({
  windowId: z.int().nonnegative(), tabId: z.int().nonnegative(), url: z.url().max(4096),
});
export const BlockSchema = z.strictObject({
  id: z.string().regex(/^b-\d{3}$/), kind: z.enum(['heading', 'paragraph', 'list', 'code']),
  text: z.string().min(1).max(LIMITS.block),
});
export const ExtractedSchema = z.strictObject({
  title: z.string().max(512), url: z.url().max(4096),
  blocks: z.array(BlockSchema).min(1).max(LIMITS.blocks),
  text: z.string().min(1).max(LIMITS.text), truncated: z.boolean(), scanLimited: z.boolean(),
}).refine(d => d.text === d.blocks.map(b => b.text).join('\n') &&
  d.blocks.every((b, i) => b.id === `b-${String(i + 1).padStart(3, '0')}`), 'Invalid block structure');
export const SnapshotSchema = z.strictObject({
  ...ExtractedSchema.shape, snapshotId: z.uuid(), contextToken: z.uuid(), documentId: z.string().min(1).max(128),
  capturedAt: z.iso.datetime(), contentHash: z.string().regex(/^[a-f0-9]{64}$/), context: PageContextSchema,
}).refine(d => d.url === d.context.url && d.text === d.blocks.map(b => b.text).join('\n') &&
  d.blocks.every((b, i) => b.id === `b-${String(i + 1).padStart(3, '0')}`), 'Invalid snapshot structure');
const base = { v: z.literal(1), requestId: z.uuid(), context: PageContextSchema };
export const RequestSchema = z.discriminatedUnion('type', [
  z.strictObject({ ...base, type: z.literal('CAPTURE') }),
  z.strictObject({ ...base, type: z.literal('CHECK_CONTEXT'), contextToken: z.uuid(), documentId: z.string().min(1).max(128) }),
]);
export const ErrorCodeSchema = z.enum(['NEEDS_PERMISSION','UNSUPPORTED_PAGE','NO_CONTENT','TAB_CHANGED','BAD_MESSAGE','TIMEOUT','CONTEXT_UNAVAILABLE']);
export const ResponseSchema = z.discriminatedUnion('ok', [
  z.strictObject({ v: z.literal(1), ok: z.literal(true), requestId: z.uuid(), data: z.union([SnapshotSchema, z.strictObject({ current: z.literal(true) })]) }),
  z.strictObject({ v: z.literal(1), ok: z.literal(false), requestId: z.union([z.uuid(), z.literal('')]), error: z.strictObject({ code: ErrorCodeSchema, message: z.string().max(300) }) }),
]);
export type PageContext = z.infer<typeof PageContextSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type Extracted = z.infer<typeof ExtractedSchema>;
export type Request = z.infer<typeof RequestSchema>;
export type Response = z.infer<typeof ResponseSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

export function supportedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname !== 'chromewebstore.google.com' &&
      !(u.hostname === 'chrome.google.com' && u.pathname.startsWith('/webstore'));
  } catch { return false; }
}
export function sameContext(a: PageContext, b: PageContext): boolean {
  return a.windowId === b.windowId && a.tabId === b.tabId && a.url === b.url;
}
export class CaptureError extends Error {
  constructor(public code: ErrorCode, message: string) { super(message); }
}
export function deadline<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new CaptureError('TIMEOUT', '读取超时，请重试。')), ms);
    work.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
