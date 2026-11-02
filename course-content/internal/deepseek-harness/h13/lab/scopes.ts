import { components, scalarTool, names } from './support.ts';
export async function scopesPractice() {
  const h = await components();
  try {
    h.ctx.tools.register(scalarTool('shared')); h.ctx.tools.register(scalarTool('style', 'global'));
    h.ctx.tools.register(scalarTool('metrics'));
    const a = await h.scope('code-agent'), b = await h.scope('document-agent');
    a.ctx.tools.register(scalarTool('analyze')); a.ctx.tools.register(scalarTool('style', 'code'));
    b.ctx.tools.register(scalarTool('outline'));
    const read = (s: any) => names(h.ctx.tools.definitions(s.agent));
    const initial = { a: read(a), b: read(b),
      aStyle: await h.ctx.tools.get('style', a.agent)!.execute({}, {} as any),
      bStyle: await h.ctx.tools.get('style', b.agent)!.execute({}, {} as any) };
    const allow = a.ctx.tools.restrict({ allow: ['shared', 'style'] });
    const deny = a.ctx.tools.restrict({ deny: ['shared', 'style'] });
    const intersect = read(a); // 自己注册的 analyze/style 保留，继承的 shared 被隐藏。
    deny(); const liftedDeny = read(a); allow();
    const child = await h.scope('code-child', a.agent);
    const inherited = read(child), hideAncestor = child.ctx.tools.restrict({ deny: ['analyze'] });
    const filteredAncestor = read(child); hideAncestor();
    let stop!: () => void;
    const plugin = await b.ctx.plugin(Object.assign((ctx: any) => { stop = ctx.tools.register(scalarTool('temporary')); }, { inject: ['tools'] }));
    const beforeUnload = read(b); await plugin.dispose(); const afterUnload = read(b); stop();
    await a.dispose(); const afterScopeDispose = read(a);
    return { initial, intersect, liftedDeny, inherited, filteredAncestor, beforeUnload, afterUnload, afterScopeDispose };
  } finally { await h.close(); }
}
