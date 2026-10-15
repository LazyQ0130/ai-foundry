import { z } from 'zod';

export type ContextLease = {ready:Promise<string>};
type SessionStore = {
  get(key:string):Promise<Record<string,unknown>>;
  set(values:Record<string,unknown>):Promise<void>;
};

// Only opaque revision UUIDs are kept in session storage, never URLs or page bodies.
// session survives worker suspension, but clears on extension/browser session reset.
export function createSessionTokens(storage:SessionStore) {
  const leases = new Map<number,ContextLease>();
  const writes = new Map<number,Promise<unknown>>();
  const key = (tabId:number) => `context:v1:${tabId}`;
  function serialize<T>(tabId:number, work:()=>Promise<T>) {
    const pending=(writes.get(tabId)??Promise.resolve()).catch(()=>{}).then(work);
    writes.set(tabId,pending);
    void pending.finally(()=>{if(writes.get(tabId)===pending)writes.delete(tabId);}).catch(()=>{});
    return pending;
  }
  function lease(tabId:number):ContextLease {
    const existing=leases.get(tabId);if(existing)return existing;
    const record:ContextLease={ready:Promise.resolve('')};
    leases.set(tabId,record); // Identity is fixed synchronously, before the first storage await.
    record.ready=serialize(tabId,async()=>{
      const saved=z.uuid().safeParse((await storage.get(key(tabId)))[key(tabId)]);
      if(saved.success)return saved.data;
      const value=crypto.randomUUID();await storage.set({[key(tabId)]:value});return value;
    });
    void record.ready.catch(()=>{}); // An unsupported request may return before awaiting this lease.
    return record;
  }
  function invalidate(tabId:number) {
    const value=crypto.randomUUID();
    const record:ContextLease={ready:serialize(tabId,async()=>{await storage.set({[key(tabId)]:value});return value;})};
    leases.set(tabId,record); // Old requests become stale immediately, not after persistence finishes.
    return record.ready;
  }
  return {lease,invalidate,isCurrent:(tabId:number,record:ContextLease)=>leases.get(tabId)===record};
}
