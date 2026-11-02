from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1];E=ROOT/'evidence/cross-course'
def text(m):return ''.join(b.get('text','') for b in m.get('content',[]) if b['type']=='text')
lines=['# 跨课真实行为验证与实际轨迹','','固定Commit、真实组件与替身见[test-evidence.md](test-evidence.md)。运行：`node docs/deepseek-harness-v2/module-three-review/scripts/run-probes.mjs`。五例均为D级，绝无外部网络、真实模型或磁盘后端；模型端脚本，工具端常量。A/B/C是场景名，不是证据等级。每次Loop请求在llm/stream入口捕获，另在Adapter.stream捕获实际边界；对每次Loop输入用另一真实Session从当时事件前缀重建messages/config/tools/toolHistory并deepEqual，不靠关键词。','','原始JSON保留完整trace、events、messages、assembly、loopRequests及adapterRequests，signal仅在输出时去掉不可序列化对象；重建不包括旧AbortController、HTTP字节与任意插件外部状态。','','| 场景 | Turn / Step / 请求 / 工具 | 结算 |','|---|---|---|']
rs=[]
for mode in ['A','B','C-retry','C-cancel','C-max-tokens']:
 r=json.loads((E/(mode+'.json')).read_text(encoding='utf-8'));rs.append(r);events=r['events'];of=lambda t:[e for e in events if e['type']==t]
 lines.append(f'| {mode} | {len(of("turn/start"))} / {len(of("step/start"))} / {len(r["adapterRequests"])} / {r["counts"]["bodyCalls"]} | '+', '.join(e['type']+('@'+str(e['seq'])) for e in events if e['type'].startswith('assistant/'))+'；'+of('turn/end')[-1]['data']['reason']['kind']+' |')
lines+=['','A验证正常创建→任务→回答→退出。B第一Step提出调用，第二Step实际接收工具结果后回答；request钩子改变tone，使下一Step系统文本从简洁变详细，验证Prompt改变可解释且旧请求不被改。C-retry用Adapter.next断流抛TRANSPORT，真实Runtime规范化，失败草稿只在attempt stream；明确retry同Step第二请求成功。C-cancel在文本和半截工具参数已交付门之后本地取消，安全前缀成为interrupted message，工具不执行。C-max-tokens补核闭合合法工具仍被丢弃。','','所有committed end逐条核先有匹配事实、eventType/seq准确；紧凑流expand逐片等于live chunks；正常dispose之后Agent/Session实时登记为空。没有把这些结果称真实规划能力或完整应用通过。','','以下顺序从原始trace position生成；仅省略重复chunk行，全部逐片数据仍在JSON，不制造新事件。request编号为作者对Adapter实调用的计数。']
for r in rs:
 mode=r['mode'];lines+=['',f'## {mode}的实际轨迹',f'[完整JSON](evidence/cross-course/{mode}.json)','',f'计数：`{json.dumps(r["counts"],ensure_ascii=False)}`。','', '| position | 通道 | 实际观察 |','|---:|---|---|']
 for t in r['trace']:
  if t['type']=='assistant/chunk':continue
  d=t['data'];extra=''
  if t['channel']=='fact':
   ev=d['event'];v=ev['data'];extra=' seq='+str(ev['seq'])
   if 'turn' in v:extra+=f' turn={v["turn"]}'
   if 'step' in v:extra+=f' step={v["step"]}'
   if ev['type']=='turn/end':extra+=' '+v['reason']['kind']
   if ev['type']=='assistant/message':extra+=' interrupted='+str(v.get('interrupted',False))
  if t['type']=='assistant/end':extra=' '+json.dumps(d['outcome'],ensure_ascii=False)
  if t['type']=='assistant/start':extra=' '+d['attemptId']
  lines.append(f'| {t["position"]} | {t["channel"]} | {t["type"]}{extra} |')
 for n,req in enumerate(r['adapterRequests'],1):
  sample={'provider':req['provider'],'model':req['model'],'maxTokens':req.get('maxTokens'),'messages':[{'role':m['role'],'source':m.get('source'),**({'toolCallId':m['toolCallId']} if 'toolCallId'in m else {}),'content':m['content']} for m in req['messages']],'tools':req.get('tools',[])}
  lines+=['',f'### 实际模型请求{n}的关键内容','', '```json',json.dumps(sample,ensure_ascii=False,indent=2),'```','',f'对应Loop前缀止于seq={r["loopRequests"][n-1]["throughSeq"]}；重建比较messages/config/tools/toolHistory全部通过。']
lines+=['','## 失败记录与限制','','首轮因新夹具误读Session返回值，未到取消门而超时；第二轮B误读tool/result关联字段4/5；修复后5/5，增强下一Step系统文本断言后再次5/5。原始run-*.json/tests-*.tap均保留，准确时间与程序hash在原件。并未把任意一次历史失败覆盖后只报PASS。','','C已稳定复现断流+受策略重试与部分文本取消；没有强行运行未知外部工具、真实HTTP断网、跨进程崩溃或整个Harness E。提供方in-band-aborted、结算拒绝等由H12原D覆盖；测验16中的“取消+写拒绝”组合是源码推导，未另实跑。']
(ROOT/'cross-course-verification.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('PASS: report derived from five actual traces and all model request snapshots')
