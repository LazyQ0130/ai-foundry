import { components, scalarTool, names, gate } from './support.ts';
export async function admissionPractice() {
  const h = await components(); const a = await h.scope('admission');
  const modelSelection = Object.freeze({ provider: 'fixture', model: 'capable' });
  const resolve = (signal = new AbortController().signal) => h.ctx.tools.resolve({ agent: a.agent, modelSelection, signal });
  const sets: any[] = [];
  try {
    let enabled = false, checks = 0;
    const def = scalarTool('conditional');
    let stop = h.ctx.tools.register(def, { when: ({ agent, modelSelection, signal }) => {
      checks++; signal.throwIfAborted(); return agent === a.agent && modelSelection.model === 'capable' && enabled;
    } });
    const denied = await resolve(); sets.push(denied);
    const registered = !!h.ctx.tools.get('conditional', a.agent);
    const outsideStep = !!h.ctx.tools.executable('conditional', a.agent);
    enabled = true; const admitted = await resolve(); sets.push(admitted);
    enabled = false;
    const sameStep = [1, 2].map(() => names(h.ctx.tools.schemas(a.agent, admitted)));
    const nextStep = await resolve(); sets.push(nextStep);
    const restrict = a.ctx.tools.restrict({ deny: ['conditional'] });
    const masked = names(h.ctx.tools.schemas(a.agent, admitted)); restrict();
    const restored = names(h.ctx.tools.schemas(a.agent, admitted));
    stop(); const removed = names(h.ctx.tools.schemas(a.agent, admitted));
    stop = h.ctx.tools.register(def, { when: () => true }); // 同一 def 对象，新注册身份。
    const replacement = names(h.ctx.tools.schemas(a.agent, admitted));
    const fresh = await resolve(); sets.push(fresh); const refreshed = names(h.ctx.tools.schemas(a.agent, fresh));
    fresh.dispose(); const released = names(h.ctx.tools.schemas(a.agent, fresh)); stop();
    h.ctx.tools.register(scalarTool('broken'), { when: () => { throw new Error('受控条件失败'); } });
    let thrown: any;
    try { await resolve(); } catch (e: any) { thrown = { name: e.name, code: e.code, message: e.message, cause: e.cause?.message }; }
    const brokenStop = h.ctx.tools.get('broken'); // 仍是登记定义；抛错未改共享注册。
    // 单独的新夹具隔离取消场景，避免先被 broken 拒绝。
    const c = await components(), ca = await c.scope('cancel');
    const entered = gate(), finish = gate<boolean>(), abort = new AbortController(); let settled = false;
    try {
      c.ctx.tools.register(scalarTool('pending'), { when: async () => { entered.resolve(); return finish.promise; } });
      const pending = c.ctx.tools.resolve({ agent: ca.agent, modelSelection, signal: abort.signal });
      const observed = pending.then(() => { settled = true; return 'unexpected'; }, e => { settled = true; return e.name; });
      await entered.promise; abort.abort(); await Promise.resolve();
      const settledAtAbort = settled; finish.resolve(true); const cancel = await observed;
      return { registered, outsideStep, denied: names(h.ctx.tools.schemas(a.agent, denied)), sameStep,
        nextStep: names(h.ctx.tools.schemas(a.agent, nextStep)), checks, masked, restored, removed, replacement,
        refreshed, released, thrown, brokenStillRegistered: !!brokenStop, settledAtAbort, cancel };
    } finally { finish.resolve(false); await c.close(); }
  } finally { for (const s of sets) s.dispose(); await h.close(); }
}
