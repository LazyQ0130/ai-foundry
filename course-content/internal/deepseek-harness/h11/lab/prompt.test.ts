import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScope, scopeOf } from '@deepseek-ai/dsh-scope';
import { component, Context, renderPrompt, renderContextSections, schema, textOf } from './support.ts';
import { sectionsPractice } from './sections.ts';
import { contextsPractice } from './contexts.ts';
import { scopesPractice } from './scopes.ts';
import { requestsPractice } from './requests.ts';
async function scope(ctx: Context) {
  let result: any;
  await ctx.plugin(Object.assign((inner: Context) => { result = createScope(inner, { name: 'component-scope' }); }, { inject: ['systemPrompt'] }));
  return { owner: result, ctx: result.ctx, key: scopeOf(result.ctx)! };
}
const systems = (r: any) => r.messages.filter((m: any) => m.role === 'system').map(textOf);
const facts = (r: any, type: string) => r.events.filter((e: any) => e.type === type);
const contexts = (r: any) => facts(r, 'user/message').filter((e: any) => e.data.source.kind === 'runtime-context');
test('C01 sections sort by order then code-unit name; assembly is unresolved and render uses captured variables', async () => {
  const r = await sectionsPractice();
  assert.deepEqual(r.assembly.sections.filter((s: any) => !s.name.startsWith('deployment:')).map((s: any) => s.name), ['first','Alpha','zeta','empty']);
  assert.equal(r.assembly.sections.find((s: any) => s.name === 'Alpha').text, 'A：用{{tone}}语言回答');
  assert.equal(r.rendered, '你是代码助手\n\nA：用简洁语言回答\n\nZ：补充说明'); assert.match(r.nextRendered, /详细/);
});
test('C02 unknown, undefined and malformed references fail explicitly; literal section survives', async () => {
  const r = await sectionsPractice(); assert.match(r.errors.unknown, /unknown prompt variable.*cwd/);
  assert.match(r.errors.missing, /has no value/); assert.match(r.errors.malformed, /malformed prompt variable/); assert.match(r.literalRendered, /\{\{cwd\}\}/);
});
test('C03 complete restores exact chosen section after waterfall while transformed variables/tools survive', async () => {
  const r = await sectionsPractice(); assert.deepEqual(r.completeAssembly.sections, [{ name: 'whole', text: '完整指令：{{tone}}' }]);
  assert.equal(r.completeRendered, '完整指令：确定'); assert.equal(r.completeAssembly.tools[0].name, 'read_fixture');
});
test('C04 multiple effective complete sections reject assembly', async () => { assert.match((await sectionsPractice()).errors.complete, /multiple complete.*whole.*whole-2/); });
test('C05 complete does not skip evaluation failures from other registered section providers', async () => {
  await component(async ctx => { ctx.systemPrompt.section({ name: 'all', order: 1, text: 'whole', complete: true });
    ctx.systemPrompt.section({ name: 'bad', order: 2, text: () => { throw Error('PROVIDER_FAILED'); } });
    await assert.rejects(ctx.systemPrompt.assemble(), /PROVIDER_FAILED/);
  });
});
test('C06 duplicate names, nonfinite order and invalid variable names reject registration', async () => {
  await component(ctx => { ctx.systemPrompt.section({ name: 'same', order: 1, text: 'one' });
    assert.throws(() => ctx.systemPrompt.section({ name: 'same', order: 2, text: 'two' }), /already registered/);
    assert.throws(() => ctx.systemPrompt.section({ name: 'bad', order: Infinity, text: 'x' }), /finite/);
    assert.throws(() => ctx.systemPrompt.variable('bad-name', () => 'x'), /invalid prompt variable/);
    ctx.systemPrompt.variable('valid', () => 'x'); assert.throws(() => ctx.systemPrompt.variable('valid', () => 'y'), /already registered/);
  });
});
test('C07 renderer keeps whitespace/lone opening braces, does not recursively substitute values or consult prototype', async () => {
  await component(async ctx => { ctx.systemPrompt.variable('value', () => '{{unknown}}');
    ctx.systemPrompt.section({ name: 'literal-value', order: 1, text: '{{value}}' });
    ctx.systemPrompt.section({ name: 'space', order: 2, text: '  ' });
    ctx.systemPrompt.section({ name: 'open', order: 3, text: 'literal {{' });
    assert.equal(renderPrompt(await ctx.systemPrompt.assemble()), '{{unknown}}\n\n  \n\nliteral {{');
    const d = ctx.systemPrompt.section({ name: 'prototype', order: 4, text: '{{constructor}}' });
    assert.throws(() => renderPrompt({ sections: [{ name: 'x', text: '{{constructor}}' }], contexts: [], variables: {}, tools: [] }), /unknown prompt variable/); d();
  });
});
test('C08 all registered variable providers run at assembly, even unused ones', async () => {
  await component(async ctx => { ctx.systemPrompt.variable('unused', () => { throw Error('VARIABLE_FAILED'); }); await assert.rejects(ctx.systemPrompt.assemble(), /VARIABLE_FAILED/); });
});
test('C09 refresh updates registered runtime facts while accepted sections/variables/tools/waterfall additions remain', async () => {
  const r = await contextsPractice(); assert.equal(r.accepted.contexts[0].text, 'Directory: /fixture/project-a');
  assert.equal(r.refreshed.contexts[0].text, 'Directory: /fixture/project-b'); assert.match(r.renderedPrompt, /project-a/);
  assert.match(r.renderedContexts[0].text, /project-b/); assert.equal(r.refreshed.contexts.at(-1).name, 'expert');
  assert.strictEqual(r.refreshed.sections, r.accepted.sections); assert.strictEqual(r.refreshed.tools, r.accepted.tools); assert.strictEqual(r.refreshed.variables, r.accepted.variables);
  assert.deepEqual(r.afterRefresh, { section: 1, variable: 1, tools: 1, waterfall: 1, context: 2 });
});
test('C10 independent suppressors keep required context; restore depends on the accepted input being refreshed', async () => {
  const r = await contextsPractice(); for (const a of [r.suppressed,r.stillSuppressed,r.fromSuppressed]) assert.deepEqual(a.contexts.map((x: any) => x.name), ['directory']);
  assert.deepEqual(r.restored.contexts.map((x: any) => x.name), ['directory','optional','expert']);
});
test('C11 refresh adds missing required registrations, does not collect new optional ones', async () => {
  const r = await contextsPractice(); assert.deepEqual(r.late.contexts.map((x: any) => x.name), ['late-required','directory','optional','expert']);
});
test('C12 includeRuntimeContext=false suppresses optional providers and expert additions, keeps required', async () => {
  await component(async ctx => {
    ctx.systemPrompt.context({ name: 'required', order: 1, required: true, text: 'must keep' });
    ctx.systemPrompt.context({ name: 'optional', order: 2, text: () => { throw Error('must not run'); } });
    ctx.on('system-prompt/assemble', async (a, _c, next) => { a.contexts.push({ name: 'extra', text: 'drop' }); return next(); });
    assert.deepEqual((await ctx.systemPrompt.assemble()).contexts, [{ name: 'required', text: 'must keep' }]);
  }, { includeRuntimeContext: false });
});
test('C13 refresh restores required context removed by presentation waterfall', async () => {
  await component(async ctx => { ctx.systemPrompt.context({ name: 'r', order: 1, required: true, text: 'restored' });
    ctx.on('system-prompt/assemble', async (_a, _c, next) => ({ ...await next(), contexts: [] }));
    const a = await ctx.systemPrompt.assemble(); assert.deepEqual(a.contexts, []); assert.deepEqual(ctx.systemPrompt.refreshContext(a).contexts, [{ name: 'r', text: 'restored' }]);
  });
});
test('C14 context ties preserve collection order, unlike section code-unit name ties', async () => {
  await component(async ctx => { ctx.systemPrompt.context({ name: 'z', order: 1, text: 'Z' }); ctx.systemPrompt.context({ name: 'A', order: 1, text: 'A' });
    assert.deepEqual(renderContextSections(await ctx.systemPrompt.assemble()).map(x => x.name), ['z','A']);
  });
});
test('C15 scoped section shadows before evaluation and exact disposer restores global', async () => {
  await component(async ctx => { const s = await scope(ctx); let global = 0;
    ctx.systemPrompt.section({ name: 'same', order: 1, text: () => { global++; return 'global'; } });
    const dispose = s.ctx.systemPrompt.section({ name: 'same', order: 1, text: 'scoped' });
    assert.equal(renderPrompt(await ctx.systemPrompt.assemble({ scope: s.key })), 'scoped'); assert.equal(global,0);
    dispose(); assert.equal(renderPrompt(await ctx.systemPrompt.assemble({ scope: s.key })), 'global'); await s.owner.dispose();
  });
});
test('C16 scoped variable wins value although global provider is still evaluated first', async () => {
  await component(async ctx => { const s = await scope(ctx), order: string[] = [];
    ctx.systemPrompt.variable('lang', () => { order.push('global'); return 'global'; });
    s.ctx.systemPrompt.variable('lang', () => { order.push('scoped'); return 'scoped'; });
    assert.equal((await ctx.systemPrompt.assemble({ scope: s.key })).variables.lang, 'scoped'); assert.deepEqual(order, ['global','scoped']); await s.owner.dispose();
  });
});
test('C17 scoped context suppression affects only matching scope and scoped listener does not see global assembly', async () => {
  await component(async ctx => { const s = await scope(ctx); let seen = 0;
    ctx.systemPrompt.context({ name: 'same', order: 1, text: 'global' });
    s.ctx.systemPrompt.context({ name: 'same', order: 1, required: true, text: 'scoped' });
    s.ctx.on('system-prompt/assemble', async (_a: any, _c: any, next: any) => { seen++; return next(); });
    s.ctx.systemPrompt.suppressRuntimeContext();
    assert.equal((await ctx.systemPrompt.assemble({ scope: s.key })).contexts[0].text, 'scoped');
    assert.equal((await ctx.systemPrompt.assemble()).contexts[0].text, 'global'); assert.equal(seen,1); await s.owner.dispose();
  });
});
test('C18 anonymous global and matching scoped Tool Providers add contributions, not same-name overrides', async () => {
  await component(async ctx => { const s = await scope(ctx); ctx.systemPrompt.tools(() => ({ schemas: [schema('global_tool')] }));
    s.ctx.systemPrompt.tools(() => ({ schemas: [schema('scoped_tool')] }));
    assert.deepEqual((await ctx.systemPrompt.assemble({ scope: s.key })).tools.map(t => t.name), ['global_tool','scoped_tool']);
    assert.deepEqual((await ctx.systemPrompt.assemble()).tools.map(t => t.name), ['global_tool']); await s.owner.dispose();
  });
});
test('C19 default/configured toolOrder is canonical, with lexicographic rest insertion', async () => {
  for (const [order, expected] of [[undefined,['a','b','z']],[['z','<unlisted-tools>','a'],['z','b','a']]] as const) {
    await component(async ctx => { ctx.systemPrompt.tools(() => ({ schemas: ['b','z','a'].map(schema) })); assert.deepEqual((await ctx.systemPrompt.assemble()).tools.map(t => t.name), expected); }, { toolOrder: order as any });
  }
});
test('C20 known hidden tool is absent normally; unknown toolOrder name rejects', async () => {
  const work = async (ctx: Context) => { ctx.systemPrompt.tools(() => ({ schemas: [schema('read')], knownNames: ['read','hidden'] })); return ctx.systemPrompt.assemble(); };
  assert.deepEqual((await component(work, { toolOrder: ['hidden','<unlisted-tools>'] })).tools.map(t => t.name), ['read']);
  await assert.rejects(component(work, { toolOrder: ['typo','<unlisted-tools>'] }), /unregistered.*typo/);
});
for (const toolOrder of [['read'],['<unlisted-tools>','read','read']]) test('C21 bad toolOrder shape ' + toolOrder.join(','), async () => {
  await assert.rejects(component(() => undefined, { toolOrder }), /toolOrder/);
});
test('C22 provider cannot return reserved rest name as an actual tool', async () => {
  await component(async ctx => { ctx.systemPrompt.tools(() => ({ schemas: [schema('<unlisted-tools>')] })); await assert.rejects(ctx.systemPrompt.assemble(), /reserved tool name/); });
});
test('C23 presentation waterfall cannot add/replace provider tools; tool parameters are detached', async () => {
  await component(async ctx => { const tool = schema('real'); ctx.systemPrompt.tools(() => ({ schemas: [tool] }));
    ctx.on('system-prompt/assemble', async (a, _c, next) => { assert.equal(Object.hasOwn(a,'tools'),false); return { ...await next(), tools: [schema('forged')] }; });
    const a = await ctx.systemPrompt.assemble(); assert.deepEqual(a.tools.map(t => t.name), ['real']);
    (a.tools[0].parameters as any).properties.mutated = {}; assert.deepEqual(tool.parameters.properties, {});
    assert.deepEqual((await ctx.systemPrompt.assemble()).tools[0].parameters, tool.parameters);
  });
});
test('C24 waterfall text is authoritative without complete; failures propagate', async () => {
  await component(async ctx => { ctx.systemPrompt.section({ name: 'one', order: 1, text: 'first' }); ctx.systemPrompt.section({ name: 'two', order: 2, text: 'second' });
    const reverse = ctx.on('system-prompt/assemble', async (_a, _c, next) => { const a=await next(); return { ...a, sections: a.sections.filter(s => s.text.length > 0).reverse() }; });
    assert.equal(renderPrompt(await ctx.systemPrompt.assemble()), 'second\n\nfirst'); reverse();
    const d = ctx.on('system-prompt/assemble', async (_a, _c, next) => ({ ...await next(), sections: [] })); assert.equal(renderPrompt(await ctx.systemPrompt.assemble()), ''); d();
    ctx.on('system-prompt/assemble', async () => { throw Error('WATERFALL_FAILED'); }); await assert.rejects(ctx.systemPrompt.assemble(), /WATERFALL_FAILED/);
  });
});
for (const mode of ['plain','in-history'] as const) test('D01-' + mode + ' prompt updates, unchanged render and empty clearing use real prepared route capabilities', async () => {
  const r = await requestsPractice(mode); assert.equal(r.requests.length,5);
  assert.deepEqual(systems(r.requests[0]), ['指令第一版']);
  assert.deepEqual(systems(r.requests[1]), mode === 'plain' ? ['指令第二版'] : ['指令第一版','指令第二版']);
  assert.deepEqual(systems(r.requests[2]), systems(r.requests[1]));
  assert.deepEqual(systems(r.requests[3]), []); assert.deepEqual(systems(r.requests[4]), []);
  assert.ok(r.requests.every(q => !q.keys.includes('system') && q.frozen));
  assert.equal(facts(r,'system/message').filter((e: any) => e.data.turn === 3 || e.data.turn === 5).length,0);
  const clear = facts(r,'system/message').filter((e: any) => e.data.turn === 4); assert.equal(clear.length, mode === 'plain' ? 1 : 2);
  assert.ok(clear.every((e: any) => typeof e.surfaceOp === 'object' && e.data.message.content.length === 0));
  assert.ok(facts(r,'system/message').some((e: any) => textOf(e.data.message) === '指令第一版'));
});
test('D02 series start preserves unchanged in-history prompt; changed text consolidates active nodes', async () => {
  const r = await requestsPractice('series'); assert.deepEqual(systems(r.requests[2]), ['指令第一版','指令第二版']); assert.deepEqual(systems(r.requests[3]), ['指令第三版']);
  assert.equal(facts(r,'system/message').filter((e: any) => e.data.turn === 3).length,0);
  assert.equal(facts(r,'system/message').filter((e: any) => e.data.turn === 4).length,2);
});
test('D03 tool visibility changes declarations/header and dependent guidance; earlier requests keep old data', async () => {
  const r = await requestsPractice('tools'); assert.deepEqual(r.requests.map(q => q.tools.map((t: any) => t.name)), [['read_fixture'],['audit_fixture','read_fixture'],['audit_fixture']]);
  assert.match(systems(r.requests[0]).join(' '), /读取指导/); assert.doesNotMatch(systems(r.requests[2]).join(' '), /读取指导/);
  assert.equal(facts(r,'request/header').length,3); assert.equal(r.requests[0].tools.length,1);
});
test('D04 admission refresh changes dynamic snapshot without re-evaluating prompt variable', async () => {
  const r = await requestsPractice('refresh'); assert.match(systems(r.requests[0])[0], /initial/);
  assert.match(contexts(r)[0].data.content[0].text, /updated/); assert.deepEqual(r.counts, { section:1,variable:1,assemble:1,context:2,request:1 });
});
test('D05 suppression enabled during request preparation keeps required context only', async () => {
  const r = await requestsPractice('suppress'); assert.equal(contexts(r).length,1); assert.doesNotMatch(textOf(contexts(r)[0].data), /optional fact/); assert.match(textOf(contexts(r)[0].data), /initial/);
});
for (const [kind,steps] of [['render-error',1],['context-error',0],['tool-order-error',0]] as const) test('D06-' + kind + ' failure phase records correct boundaries without model/user admission', async () => {
  const r = await requestsPractice(kind); assert.equal(r.requests.length,0); assert.equal(facts(r,'step/start').length,steps);
  assert.equal(r.counts.request,0);
  assert.equal(facts(r,'system/message').length,0); assert.equal(facts(r,'user/message').length,0); assert.equal(facts(r,'turn/end')[0].data.reason.kind,'error');
});
for (const [kind,steps] of [['cancel-prepare',1],['cancel-assemble',0]] as const) test('D07-' + kind + ' cancellation before admission commits no pending prompt/input', async () => {
  const r = await requestsPractice(kind); assert.equal(r.requests.length,0); assert.equal(facts(r,'step/start').length,steps); assert.equal(facts(r,'system/message').length+facts(r,'user/message').length,0);
  assert.equal(facts(r,'turn/end')[0].data.reason.kind,'aborted');
});
test('D08 retry refreshes context per attempt, but assembles/evaluates variables once and admits user once', async () => {
  const r = await requestsPractice('retry'); assert.equal(r.requests.length,2); assert.equal(facts(r,'step/start').length,1);
  assert.deepEqual(r.counts,{section:1,variable:1,assemble:1,context:3,request:2}); assert.equal(facts(r,'user/message').filter((e: any) => e.data.source.kind==='user').length,1);
  assert.equal(contexts(r).length,2); assert.doesNotMatch(JSON.stringify(r.requests[0]), /fixture\/updated/); assert.match(JSON.stringify(r.requests[1]), /fixture\/updated/);
});
test('D09 two real Agents see scoped persona/variable/tools/listeners and exact disposer restores defaults', async () => {
  const r = await scopesPractice(); const a=r.beforeDisposal.A.requests[0],b=r.beforeDisposal.B.requests[0];
  assert.match(systems(a)[0],/助手A：中文/); assert.match(systems(b)[0],/Assistant B: English/);
  assert.deepEqual(a.tools.map((t: any)=>t.name),['read_fixture']); assert.deepEqual(b.tools.map((t: any)=>t.name),['read_fixture','audit_fixture']);
  assert.deepEqual(r.beforeDisposal.seen,{A:1,B:1}); assert.match(systems(r.afterDisposal.requests[1])[0],/全局助手：默认语言/); assert.match(r.global,/全局助手：默认语言/);
});
test('D10 changed/empty runtime context appends full snapshot and one clearing marker, preserving prior facts', async () => {
  const r=await requestsPractice('context-change'); assert.equal(r.requests.length,4); const c=contexts(r); assert.equal(c.length,3);
  assert.match(textOf(c[0].data),/initial/); assert.match(textOf(c[1].data),/updated/); assert.match(textOf(c[2].data),/Current runtime context: none/);
  assert.equal(c[2].data.source.form,undefined); assert.equal(facts(r,'system/message').length,1);
});
test('D11 initially empty prompt reserves an empty system node, no model system message until nonempty update', async () => {
  const r=await requestsPractice('initial-empty'); assert.deepEqual(systems(r.requests[0]),[]); assert.deepEqual(systems(r.requests[1]),[]); assert.deepEqual(systems(r.requests[2]),['指令第一版']);
  const s=facts(r,'system/message'); assert.equal(s.length,2); assert.deepEqual(s[0].data.message.content,[]); assert.equal(s[0].surfaceOp,'append'); assert.equal(typeof s[1].surfaceOp,'object');
});
