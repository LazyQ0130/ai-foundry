from pathlib import Path
import json,re,hashlib
R=Path(__file__).resolve().parents[1];E=R/'evidence';P=R.parents[3];h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
runs={};full=[]
for p in sorted(E.glob('run-*.json')):
 d=json.loads(p.read_text(encoding='utf-8'));runs[d.get('scratch','')]=(p.name,d)
 if '# tests 23' in d.get('stdout',''):
  full.append(dict(raw=p.name,node=d.get('node'),nodeExecutable=d.get('nodeExecutable'),variant=d.get('variant'),exit=d['exit'],tests=23,passed=int(re.search(r'^# pass (\d+)',d['stdout'],re.M)[1]),observer=d.get('observerEnabled',False),exitHook=d.get('exitHook'),actualPrograms=d.get('actualPrograms',[]),sha256=h(p)))
lifecycle=[];failures=[];worlds={}
for p in sorted(E.glob('traces-*.json')):
 obj=json.loads(p.read_text(encoding='utf-8'));traces=obj.get('traces',obj)
 for key,t in traces.items():
  if not isinstance(t,dict):continue
  if 'world' in t:worlds[t['world']['root']]=t['world']
  if key=='trace-C1-failure.json':failures.append(dict(trace=p.name,wire=t['wire'],world=t['world']))
  if key!='trace-lifecycle.json':continue
  scratch=str(Path(t['world']['root']).parent);raw,d=runs[scratch];rows=[json.loads(s) for s in (t['log'] or '').splitlines() if s.strip()];turns=[e for e in rows if e.get('type')=='turn/end'];terminal=turns[-1]['data']['reason']['kind'] if turns else None
  sdk=next(e for e in json.loads(Path(t['world']['config']).read_text()) if e['id']=='sdk')['name'];normal=t['wire']['exit']==0 and t['wire']['signal'] is None;assertion='UV_HANDLE_CLOSING' in t['wire']['stderr'];resources=t['server']['socketsObserved']>0 and t['server']['socketsRemaining']==0 and t['server']['portRebound'];domain=terminal==('aborted' if t['active'] else 'completed') and t['runtime'] is not None and t['runtime']['writes']==(0 if t['active'] else 1)
  lifecycle.append(dict(trace=p.name,raw=raw,variant=d['variant'],observer=d.get('observerEnabled',False),exitHook=d['exitHook'],node=t['node'],nodeExecutable=d['nodeExecutable'],style=t['style'],active=t['active'],actualExit=t['wire']['exit'],signal=t['wire']['signal'],assertion=assertion,shutdownResponse=t['shutdownResponse'],requestCount=len(t['server']['requests']),socketsObserved=t['server']['socketsObserved'],socketsRemaining=t['server']['socketsRemaining'],portRebound=t['server']['portRebound'],terminal=terminal,writes=t['runtime']['writes'] if t['runtime'] else None,sdkModule=sdk,normalExit=normal,resourcesReleased=resources,domainExpected=domain,verdict='FORCED_NOT_GRACEFUL' if t['style']=='sigterm' else 'PASS_LOCAL_VARIANT' if normal and not assertion and resources and domain and (t['style']!='protocol' or t['shutdownResponse']) else 'FAIL',sha256=h(p)))
snapshots=[]
for path,w in worlds.items():
 root=Path(path);config=Path(w['config']);snapshot=dict(root=path,profile=w['profile'],configuration=json.loads(config.read_text()),configurationSha256=h(config),files=[])
 for p in sorted(root.rglob('*')):
  if p.is_file():snapshot['files'].append(dict(relative=p.relative_to(root).as_posix(),sha256=h(p)))
 snapshots.append(snapshot)
(E/'world-configurations.json').write_text(json.dumps(snapshots,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
original=[]
for p in sorted((R.parent/'evidence').glob('run-*.json')):
 d=json.loads(p.read_text());original.append(dict(path=p.relative_to(P).as_posix(),sha256=h(p),args=d.get('args'),scratch=d.get('scratch'),exit=d.get('exit'),passCount=(re.search(r'^# pass (\d+)',d.get('stdout',''),re.M) or [None,None])[1],failCount=(re.search(r'^# fail (\d+)',d.get('stdout',''),re.M) or [None,None])[1],stderr=d.get('stderr'),error=d.get('error')))
(E/'original-run-index.json').write_text(json.dumps(original,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
anchors=json.loads((E/'clean-anchors.json').read_text());native=[]
for name,anchor in anchors.items():
 base=Path(anchor).parents[3 if name=='H24_PTC_ANCHOR' else 2]
 for p in base.rglob('*.node'):native.append(dict(tree=name,path=str(p),relative=p.relative_to(base).as_posix(),sha256=h(p)))
(E/'clean-native-bindings.json').write_text(json.dumps(native,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
result=dict(fullSuites=full,lifecycle=lifecycle,observedFailures=failures,allOriginalLogsRetained=True,sourceMode='all Harness composition probes source-only; built product positive NOT_RUN',counting='repeats/platform/patch branches are not extra distinct course test scenarios; diagnostics separate from H24 C9/D14')
(E/'result-index.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert any(r['actualExit']==3221226505 and r['variant']=='default' and r['node']=='v24.16.0' for r in lifecycle)
assert all(r['verdict']=='PASS_LOCAL_VARIANT' for r in lifecycle if r['variant']=='patch' and r['style']=='protocol')
assert any(r['verdict']=='FAIL' and r['style']=='eof' and r['active'] for r in lifecycle),'retain secondary active EOF failure, do not hide it'
assert any(r['variant']=='hook' and r['passed']==23 for r in full)
assert any(r['variant']=='patch' and r['node']=='v24.16.0' and r['passed']==23 for r in full)
official=json.loads((E/'official-runtime.json').read_text());assert any(r['variant']=='default' and r['nodeExecutable']==official['path'] and r['passed']==23 for r in full)
print(json.dumps(dict(fullSuiteRuns=len(full),lifecycleRows=len(lifecycle),originalLogFiles=len(original),originalFailureStillPresent=True,patchProtocolRowsPass=True,activeEofDisposeGapRetained=True),ensure_ascii=False))
