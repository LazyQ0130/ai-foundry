import assert from 'node:assert/strict';
import { test } from 'node:test';
import { definitionsPractice } from './definitions.ts';
import { scopesPractice } from './scopes.ts';
import { admissionPractice } from './admission.ts';
import { requestsPractice, type RequestCase } from './requests.ts';
import { components, scalarTool, defineTool, names, gate } from './support.ts';
import { projectToolUpdates } from '@deepseek-ai/dsh-llm';
import { progressivePractice } from './progressive.ts';
import { parameterSchemaSpecToJsonSchema, valueSchemaSpecToJsonSchema, validateArgs, validateJsonSchemaValue } from '@deepseek-ai/dsh-tools';
const A = await definitionsPractice(), B = await scopesPractice(), C = await admissionPractice();
const code = (r: any) => r.error?.info?.code;
test('C01 valid canonical JSON and model rendering are distinct', () => { assert.equal(A.valid.isError, false); assert.deepEqual(A.valid.value, { total: 12, count: 3 }); assert.equal(A.rendered, '总和 12，共 3 项。'); });
test('C02 missing required input never reaches body', () => { assert.equal(code(A.missing), 'INVALID_ARGS'); assert.equal(A.bodies, 3); });
test('C03 wrong nested array element rejected with runtime error', () => assert.equal(code(A.wrong), 'INVALID_ARGS'));
test('C04 nested closed object rejects unknown properties', () => assert.equal(code(A.nestedExtra), 'INVALID_ARGS'));
test('C05 parameter root remains open', () => { assert.equal(A.rootExtra.isError, false); assert.equal(A.projection.parameters.additionalProperties, undefined); });
test('C06 business constraint is not supplied by array schema', () => { assert.equal(A.business.isError, true); assert.match(JSON.stringify(A.business), /至少提供一个数/); });
test('C07 actual shared pipeline rejects invalid canonical output', () => assert.equal(code(A.invalidOutput), 'INVALID_TOOL_OUTPUT'));
test('C08 schemas whitelist model fields and disposer unregisters', () => { assert.deepEqual(Object.keys(A.projection).sort(), ['description','name','parameters']); assert.deepEqual(A.registered, [true,false]); });
test('C09 isolated scopes share globals and keep own tools', () => { assert.deepEqual(B.initial.a, ['analyze','metrics','shared','style']); assert.deepEqual(B.initial.b, ['metrics','outline','shared','style']); });
test('C10 intersected restrictions exempt own shadow definitions', () => { assert.deepEqual(B.intersect, ['analyze','style']); assert.deepEqual(B.liftedDeny, ['analyze','shared','style']); });
test('C11 descendant can filter inherited ancestor registration', () => { assert.ok(B.inherited.includes('analyze')); assert.ok(!B.filteredAncestor.includes('analyze')); });
test('C12 plugin and scope disposal unwind real registry effects', () => { assert.ok(B.beforeUnload.includes('temporary')); assert.ok(!B.afterUnload.includes('temporary')); assert.deepEqual(B.afterScopeDispose, ['metrics','shared','style']); });
test('C13 registered conditional inspection differs from executable without set', () => { assert.equal(C.registered, true); assert.equal(C.outsideStep, false); assert.deepEqual(C.denied, []); });
test('C14 resolve captures condition once and next set evaluates again', () => { assert.deepEqual(C.sameStep, [['conditional'],['conditional']]); assert.deepEqual(C.nextStep, []); assert.equal(C.checks, 3); });
test('C15 live restriction can mask and restore an admitted registration', () => { assert.deepEqual(C.masked, []); assert.deepEqual(C.restored, ['conditional']); });
test('C16 unregister and same-object replacement invalidate old admission', () => { assert.deepEqual(C.removed, []); assert.deepEqual(C.replacement, []); assert.deepEqual(C.refreshed, ['conditional']); });
test('C17 disposed set stays empty and does not unregister definition', () => assert.deepEqual(C.released, []));
test('C18 false and throwing activation are distinct', () => { assert.equal(C.thrown.code, 'TOOL_ACTIVATION_FAILED'); assert.equal(C.thrown.cause, '受控条件失败'); assert.equal(C.brokenStillRegistered, true); });
test('C19 abort does not race an uncooperative when promise', () => { assert.equal(C.settledAtAbort, false); assert.equal(C.cancel, 'AbortError'); });
test('C20 duplicate name, reserved name, and invalid timeout fail registration', async () => {
 const h = await components(); try { h.ctx.tools.register(scalarTool('same'));
 assert.throws(() => h.ctx.tools.register(scalarTool('same'))); assert.throws(() => h.ctx.tools.register(scalarTool('run_code')));
 for (const timeoutMs of [0,-1,Infinity,NaN]) assert.throws(() => h.ctx.tools.register({ ...scalarTool('bad'), timeoutMs }));
 } finally { await h.close(); }
});
test('C21 restrict requires scope and known inherited names', async () => {
 const h = await components(); try { const a = await h.scope('filters'); a.ctx.tools.register(scalarTool('local'));
 assert.throws(() => h.ctx.tools.restrict({ allow: [] })); assert.throws(() => a.ctx.tools.restrict({}));
 for (const name of ['missing','local','run_code']) assert.throws(() => a.ctx.tools.restrict({ deny: [name] }));
 } finally { await h.close(); }
});
test('C22 scalar DSL enforces integer enum const boolean null', () => {
 const schema = valueSchemaSpecToJsonSchema({ type: 'object', additionalProperties: false, properties: {
 i: { type: 'integer', enum: [1,2], required: true }, label: { type: 'string', const: 'sum', required: true },
 ok: { type: 'boolean', required: true }, empty: { type: 'null', required: true } } });
 const valid = { i: 1, label: 'sum', ok: true, empty: null };
 assert.deepEqual(validateJsonSchemaValue(schema, valid), []);
 for (const [k,v] of [['i',1.5],['i',3],['label','other'],['ok','true'],['empty',0]]) assert.ok(validateJsonSchemaValue(schema, { ...valid, [k]: v }).length);
});
test('C23 oneOf demands exactly one matching branch', () => {
 const schema = valueSchemaSpecToJsonSchema({ oneOf: [{ type: 'number' }, { type: 'integer' }] });
 assert.match(validateJsonSchemaValue(schema, 1).join(), /matched 2/); assert.deepEqual(validateJsonSchemaValue(schema, 1.5), []);
 assert.match(validateJsonSchemaValue(schema, '1').join(), /matched 0/);
});
test('C24 json accepts lossless JSON but not undefined, nonfinite or exotic', () => {
 const schema = valueSchemaSpecToJsonSchema({ type: 'json' }); assert.deepEqual(schema, {});
 assert.deepEqual(validateJsonSchemaValue(schema, { any: [null,true,3] }), []);
 for (const v of [undefined,NaN,Infinity,-0,new Date()]) assert.ok(validateJsonSchemaValue(schema,v).length);
});
test('C25 DSL rejects unsupported keywords, missing object openness and required false', () => {
 for (const node of [{ type: 'number', minimum: 0 }, { type: 'object' }]) assert.throws(() => valueSchemaSpecToJsonSchema(node as any));
 assert.throws(() => parameterSchemaSpecToJsonSchema({ a: { type: 'number', required: false } } as any));
});
test('C26 annotations default do not fill missing required input', () => {
 const parameters = { a: { type: 'number', required: true, default: 2 } } as const;
 assert.deepEqual(validateArgs(parameters, {}), ['missing required property "a"']);
 assert.deepEqual(validateArgs(parameters, { a: 2 }), []);
});
test('C31 progressive two-number definition produces each advertised stage', async () => {
 const r = await progressivePractice(); assert.equal(r.identity.name,'calculate_sum'); assert.deepEqual(r.compiled.required,['a','b']);
 assert.deepEqual(r.missing,['missing required property "b"']); assert.equal(r.canonical,12);
 assert.deepEqual(r.rendered,[{type:'text',text:'总和 12'}]); assert.equal(r.bad.error?.info?.code,'INVALID_ARGS');
 assert.equal(r.business.isError,true); assert.equal(r.registeredAfter,false);
});
test('C27 raw defineTool.execute validates input, not its own output', async () => {
 const tool = defineTool({ name: 'typed', description: '', parameters: {}, output: { schema: { type: 'number' }, render: (_a,v) => [{ type: 'text', text: String(v) }] }, execute: async () => 'bad' as any });
 assert.equal(await tool.execute({}, {} as any), 'bad'); // C07 proves pipeline boundary separately.
});
test('C28 admission is tied to exact agent object and release keeps registrations', async () => {
 const h = await components(); try { const a = await h.scope('exact'), b = await h.scope('exact-other'); h.ctx.tools.register(scalarTool('x'));
 const set = await h.ctx.tools.resolve({ agent: a.agent, modelSelection: { provider: 'x', model: 'm' }, signal: new AbortController().signal });
 assert.equal(h.ctx.tools.get('x', b.agent, set), undefined); assert.equal(h.ctx.tools.get('x', { ...a.agent }, set), undefined);
 set.dispose(); assert.ok(h.ctx.tools.get('x', a.agent)); assert.deepEqual(names(h.ctx.tools.schemas(a.agent,set)), []);
 } finally { await h.close(); }
});
test('C29 unregister during pending when cannot resurrect tool', async () => {
 const h = await components(), entered = gate(), release = gate<boolean>(); try { const a = await h.scope('late');
 const stop = h.ctx.tools.register(scalarTool('late'), { when: async () => { entered.resolve(); return release.promise; } });
 const pending = h.ctx.tools.resolve({ agent: a.agent, modelSelection: { provider:'x',model:'m' }, signal: new AbortController().signal });
 await entered.promise; stop(); release.resolve(true); const set = await pending;
 assert.deepEqual(names(h.ctx.tools.schemas(a.agent,set)), []); set.dispose();
 } finally { release.resolve(false); await h.close(); }
});
test('C30 scoped shadow is exact definition, root schema projection detached', async () => {
 const h = await components(); try { const a = await h.scope('shadow'); const global = scalarTool('style','global'), local = scalarTool('style','local');
 h.ctx.tools.register(global); a.ctx.tools.register(local); assert.equal(h.ctx.tools.get('style',a.agent), local); assert.equal(h.ctx.tools.get('style'),global);
 const schema = h.ctx.tools.schemas()[0]; (schema.parameters as any).description = 'mutated copy'; assert.equal((global.parameters as any).description,undefined);
 } finally { await h.close(); }
});
for (const [i,kind] of (['success','false','retry','remove','replace','restrict'] as RequestCase[]).entries()) test(`D0${i+1} real loop ${kind}: request schemas, calls, results and live eligibility`, async () => {
 const r = await requestsPractice(kind); assert.deepEqual(r.errors, []); assert.equal(r.calls.length,1); assert.equal(r.results.length,1);
 const message = r.results[0].data.message;
 assert.equal(Object.hasOwn(message,'value'),false);
 assert.equal(message.toolCallId, r.calls[0].data.callId);
 assert.equal(r.facts.filter(e => e.type === 'step/start').length,2);
 assert.equal(r.requests.length, kind === 'retry' ? 3 : 2);
 assert.equal(r.requestPrefixes.length,r.requests.length);
 assert.ok(r.requestPrefixes.every(p=>p.reconstruction.startsWith('PASS')));
 for (const [i, loop] of r.loopRequests.entries()) {
   const projected = projectToolUpdates(loop.messages, loop.tools, undefined, loop.toolHistory);
   assert.deepEqual(r.requests[i], { ...loop, messages: projected.messages, ...projected.tools === undefined ? {} : { tools: projected.tools } });
   assert.deepEqual(r.requests[i].tools,loop.tools);
 }
 assert.deepEqual(names(r.requests[0].tools ?? []), kind === 'false' ? [] : ['calculate_sum']);
 assert.deepEqual(r.registered,['calculate_sum']); assert.ok(r.released.every(s => s.length===0));
 if (kind === 'success' || kind === 'retry') { assert.equal(r.bodies,1); assert.equal(message.isError,false); assert.match(JSON.stringify(r.requests.at(-1)?.messages),/总和 12/); }
 else { assert.equal(r.bodies,0); assert.equal(message.isError,true); assert.match(JSON.stringify(message),/Unknown tool|unknown tool/); }
 if (kind === 'retry') { assert.equal(r.checks,2); assert.deepEqual(r.admissions,[['calculate_sum'],[]]); assert.deepEqual(names(r.requests[1].tools ?? []),['calculate_sum']); assert.equal(r.facts.filter(e=>e.type==='assistant/attempt').length,1); }
 assert.deepEqual(r.modelAtWhen,{provider:'fixture',model:'scripted'});
});
