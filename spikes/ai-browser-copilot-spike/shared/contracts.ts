import { z } from 'zod';

export const MAX_TEXT = 6000;
export const MAX_SELECTION = 2000;
export const SELECTION_TTL_MS = 60000;
export const Context = z.object({ tabId: z.number().int().nonnegative(), url: z.url().max(4096) }).strict();
export const Snapshot = Context.extend({
  snapshotId: z.uuid(), title: z.string().max(512), text: z.string().min(1).max(MAX_TEXT),
  truncated: z.boolean(), capturedAt: z.iso.datetime(), contextToken: z.uuid(),
}).strict();
export type Snapshot = z.infer<typeof Snapshot>;
export const Request = z.discriminatedUnion('type', [
  z.object({ v: z.literal(1), type: z.literal('CAPTURE'), requestId: z.uuid(), context: Context }).strict(),
  z.object({ v: z.literal(1), type: z.literal('TAKE_SELECTION'), requestId: z.uuid(), context: Context }).strict(),
  z.object({ v: z.literal(1), type: z.literal('CHECK_CONTEXT'), requestId: z.uuid(), context: Context, contextToken: z.uuid() }).strict(),
]);
export const Selection = Context.extend({ text: z.string().trim().min(1).max(MAX_SELECTION), createdAt: z.number().int().nonnegative(), requestId: z.uuid(), contextToken: z.uuid() }).strict();
export const SelectionSlot = z.union([
  z.object({ ok: z.literal(true), data: Selection }).strict(),
  z.object({ ok: z.literal(false), message: z.string().max(300) }).strict(),
]);
export const SummaryRequest = z.object({ v: z.literal(1), requestId: z.uuid(), snapshot: Snapshot }).strict();
export const SummaryResponse = z.object({
  requestId: z.uuid(), snapshotId: z.uuid(), provider: z.literal('mock'), text: z.string().min(1).max(2000),
}).strict();
export const ErrorCode = z.enum(['NEEDS_PERMISSION', 'UNSUPPORTED_PAGE', 'NO_CONTENT', 'TAB_CHANGED', 'OVER_LIMIT', 'NO_SELECTION', 'BAD_MESSAGE', 'UNKNOWN']);
export const Failure = z.object({ ok: z.literal(false), requestId: z.string(), code: ErrorCode, message: z.string().max(300) }).strict();
export const Result = z.union([
  z.object({ ok: z.literal(true), requestId: z.uuid(), data: z.union([Snapshot, Selection, z.object({ current: z.literal(true) }).strict()]) }).strict(), Failure,
]);
export function supported(url: string) {
  try { const u = new URL(url); return ['http:', 'https:'].includes(u.protocol) && u.hostname !== 'chromewebstore.google.com' && !(u.hostname === 'chrome.google.com' && u.pathname.startsWith('/webstore')); } catch { return false; }
}
export function sameContext(a: {tabId: number; url?: string}, b: {tabId: number; url?: string}) {
  return a.tabId === b.tabId && !!a.url && a.url === b.url;
}
