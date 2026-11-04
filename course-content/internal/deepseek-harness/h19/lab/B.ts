import {fixture,history,appendTool,assert,imageRef,textOf} from './support.ts';
import {PRUNE_MARKER} from '@deepseek-ai/dsh-compaction-tool-result-pruner';
export async function practiceB(){
 const f=await fixture({pruner:true});try{
  const p=f.ctx.toolResultPruner;assert.equal(p.pruneContent([{type:'text',text:'a'.repeat(200)}]),null);
  const content:any[]=[{type:'text',text:'😀'.repeat(100)},{type:'image',attachment:imageRef()},{type:'text',text:'尾'.repeat(150)}];
  const pruned=p.pruneContent(content)!;assert.equal(p.measureContent(content),250);assert.equal(p.measureContent(pruned),120+Array.from(PRUNE_MARKER).length);
  assert.equal(pruned[0].type,'text');assert.ok((pruned[0] as any).text.startsWith('😀'.repeat(60)));
  assert.deepEqual(pruned.filter(b=>b.type!=='text'),[content[1]]);assert.ok(textOf([{content:pruned}]).endsWith('尾'.repeat(60)));
  const s=history(f.ctx,'pruner',20),original=appendTool(s,'',content),prior=[...f.facts.get(s.id)!];const before=f.ctx.tokenMeter.measure(s);
  const result=p.pruneSession(s),events=f.facts.get(s.id)!;assert.equal(result.pruned.length,1);assert.deepEqual(events.slice(0,prior.length),prior);
  assert.deepEqual(events.slice(-2).map(e=>e.type),['compaction/prune','tool/result']);const replacement=events.at(-1)!;
  assert.deepEqual(replacement.sourceEventSeqs,[original.seq]);assert.equal(replacement.data.message.id,original.data.message.id);
  assert.ok(!s.surface.nodes.includes(original.seq));assert.ok(s.surface.nodes.includes(replacement.seq));assert.deepEqual(original.data.message.content,content);
  assert.equal(p.pruneSession(s).pruned.length,0);assert.ok(f.ctx.tokenMeter.measure(s).totalTokens<before.totalTokens);
  return {original,pruned,result,before,after:f.ctx.tokenMeter.measure(s),surface:s.surface.nodes,events};
 }finally{await f.close();}
}
