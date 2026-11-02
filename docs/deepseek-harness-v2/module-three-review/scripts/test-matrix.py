from pathlib import Path
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1];E=ROOT/'evidence';rows=[];history=[]
for h in ['h09','h10','h11','h12']:
 old=ROOT.parent/h/'evidence/lab-tests.txt';new=E/'baseline'/h/'evidence/lab-tests.txt'
 oldtext=old.read_text(encoding='utf-8');text=new.read_text(encoding='utf-8')
 names=re.findall(r'^ok \d+ - (.+)$',text,re.M);previous=re.findall(r'^ok \d+ - (.+)$',oldtext,re.M);assert names==previous
 for name in names:
  level=re.match(r'([A-E])',name)[1]
  rows.append({'course':h,'name':name,'level':level,'historical':'PASS','fresh':'PASS','originalRaw':old.relative_to(ROOT.parent.parent.parent).as_posix(),'auditRaw':new.relative_to(ROOT).as_posix(),'basis':'setup/action/assertion in lab test and raw TAP, not report title'})
 for p in sorted((ROOT.parent/h/'evidence').glob('run-*.json')):
  j=json.loads(p.read_text(encoding='utf-8'));history.append({'path':p.relative_to(ROOT.parent.parent.parent).as_posix(),'exit':j.get('exit',j.get('status')),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'stderr':j.get('stderr',''),'stdoutTail':j.get('stdout','')[-800:]})
counts={k:sum(r['level']==k for r in rows) for k in 'ACD'}
assert counts=={'A':1,'C':65,'D':78}
(E/'test-matrix.json').write_text(json.dumps({'perCase':rows,'historicalRuns':history,'counts':counts,'standaloneB':'NOT_RUN, not a failure','E':'NOT_RUN'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
md=['# 144项逐例证据索引','','每项等级据受测对象、装配、操作和断言复核；C组件含必要真实依赖，但未接入Driver任务链，D验证多个组件协作的生命周期/请求路径。B未单独运行；E未运行。原始日志与新日志名称相符，不按报告标题重分类。','','| 课 | 等级 | 实际用例（原始TAP名） | 历史 / 本轮 |','|---|---|---|---|']
for r in rows:md.append(f"| {r['course']} | {r['level']} | {r['name']} | PASS / PASS |")
(ROOT/'test-case-index.md').write_text('\n'.join(md)+'\n',encoding='utf-8')
print(json.dumps({'counts':counts,'historicalRuns':len(history),'failedHistoricalRuns':[{'path':r['path'],'exit':r['exit'],'stderrTail':r['stderr'][-600:]} for r in history if r['exit'] not in [None,0]]},ensure_ascii=False))
