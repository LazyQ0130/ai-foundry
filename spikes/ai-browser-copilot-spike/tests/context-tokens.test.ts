import { expect, it, vi } from 'vitest';
import { createSessionTokens } from '../extension/src/context-tokens';
function store() {
  const values:Record<string,unknown>={};
  return {values,get:vi.fn(async(key:string)=>({[key]:values[key]})),set:vi.fn(async(data:Record<string,unknown>)=>{Object.assign(values,data);})};
}
it('restores revision UUIDs after recreation without writing page data',async()=>{
  const storage=store(),first=createSessionTokens(storage),lease=first.lease(1);
  expect(first.lease(1)).toBe(lease);
  const value=await lease.ready;
  expect(await createSessionTokens(storage).lease(1).ready).toBe(value);
  expect(storage.values).toEqual({'context:v1:1':value});
});
it('invalidates an in-flight initial load synchronously and preserves write order',async()=>{
  const storage=store();let release!:(v:Record<string,unknown>)=>void;
  storage.get.mockImplementationOnce(()=>new Promise(r=>{release=r;}));
  const tokens=createSessionTokens(storage),old=tokens.lease(1);
  await vi.waitFor(()=>expect(storage.get).toHaveBeenCalledOnce());
  const pending=tokens.invalidate(1);
  expect(tokens.isCurrent(1,old)).toBe(false);
  release({});const oldValue=await old.ready,newValue=await pending;
  expect(oldValue).not.toBe(newValue);
  expect(await createSessionTokens(storage).lease(1).ready).toBe(newValue);
});
it('serializes consecutive navigation writes and isolates tabs',async()=>{
  const storage=store(),tokens=createSessionTokens(storage);
  const b=await tokens.lease(2).ready;
  const first=tokens.invalidate(1),second=tokens.invalidate(1);
  expect(await first).not.toBe(await second);
  expect(await createSessionTokens(storage).lease(1).ready).toBe(await second);
  expect(await tokens.lease(2).ready).toBe(b);
});
it('replaces corrupt session values and fails closed on storage failure',async()=>{
  const storage=store();storage.values['context:v1:1']='not-a-uuid';
  expect(await createSessionTokens(storage).lease(1).ready).toMatch(/^[a-f0-9-]{36}$/);
  storage.set.mockRejectedValueOnce(new Error('unavailable'));
  await expect(createSessionTokens(storage).lease(3).ready).rejects.toThrow('unavailable');
});
