import { z } from 'zod';

export type SessionStore = {
  get(key: string): Promise<Record<string, unknown>>;
  set(values: Record<string, unknown>): Promise<void>;
  remove(key: string): Promise<void>;
};
export type ContextLease = { ready: Promise<string> };

// Phase 0's synchronous lease identity + serialized storage; no page content is stored.
export function createSessionTokens(storage: SessionStore) {
  const leases = new Map<number, ContextLease>();
  const writes = new Map<number, Promise<unknown>>();
  const key = (tabId: number) => `context:v1:${tabId}`;
  function serialize<T>(tabId: number, work: () => Promise<T>): Promise<T> {
    const next = (writes.get(tabId) ?? Promise.resolve()).catch(() => {}).then(work);
    writes.set(tabId, next);
    void next.finally(() => { if (writes.get(tabId) === next) writes.delete(tabId); }).catch(() => {});
    return next;
  }
  function track(tabId: number, record: ContextLease) {
    leases.set(tabId, record);
    void record.ready.catch(() => { if (leases.get(tabId) === record) leases.delete(tabId); });
    return record;
  }
  function lease(tabId: number): ContextLease {
    const previous = leases.get(tabId);
    if (previous) return previous;
    const record = { ready: serialize(tabId, async () => {
      const saved = z.uuid().safeParse((await storage.get(key(tabId)))[key(tabId)]);
      if (saved.success) return saved.data;
      const value = crypto.randomUUID();
      await storage.set({ [key(tabId)]: value });
      return value;
    }) };
    return track(tabId, record);
  }
  function invalidate(tabId: number): Promise<string> {
    const value = crypto.randomUUID();
    return track(tabId, { ready: serialize(tabId, async () => {
      await storage.set({ [key(tabId)]: value }); return value;
    }) }).ready;
  }
  function release(tabId: number): Promise<void> {
    leases.delete(tabId); // In-flight readers fail immediately; queued writes finish before removal.
    return serialize(tabId, () => storage.remove(key(tabId)));
  }
  return { lease, invalidate, release, isCurrent: (tabId: number, record: ContextLease) => leases.get(tabId) === record };
}
