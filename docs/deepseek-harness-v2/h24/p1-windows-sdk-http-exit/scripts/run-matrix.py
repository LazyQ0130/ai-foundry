from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import os,subprocess,json,time
R=Path(__file__).resolve().parents[1];P=R.parents[3];E=R/'evidence';anchors=json.loads((E/'clean-anchors.json').read_text());old='D:/Program Files/nodejs/node.exe';new='C:/Users/QYF/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
cases=[]
def add(name,node,variant,args,**extra):cases.append(dict(name=name,node=node,variant=variant,args=args,extra=extra))
add('HTTP-only',old,'default',['http-only'])
for style in ['protocol','eof','dispose','sigterm']:add('original-'+style,old,'default',['lifecycle',style])
add('original-protocol-active',old,'default',['lifecycle','protocol','active'])
for i in range(2):
 add(f'patch-protocol-repeat{i+1}',old,'patch',['lifecycle','protocol'])
 add(f'patch-protocol-active{i+1}',old,'patch',['lifecycle','protocol','active'])
 add(f'new-node-default-repeat{i+1}',new,'default',['lifecycle','protocol'])
for style in ['eof','dispose']:add('patch-'+style+'-active',old,'patch',['lifecycle',style,'active'])
add('old-cache-corrected',old,'default',['D'],H24_TEST_ANCHOR='C:/Users/QYF/.codex/research/h24-test-deps/node_modules/execa/index.js')
candidate=json.loads((E/'before-candidate-install.json').read_text())['base'];add('before-version-candidate',old,'default',['D'],H24_TEST_ANCHOR=str(Path(candidate)/'node_modules/execa/index.js'),H24_P1_FORENSIC='1')
out=[]
def run(case):
 env={k:os.environ[k] for k in ['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'] if k in os.environ};env.update(anchors);env.update(H24_P1_LOADER='pinned',H24_P1_EXIT=case['variant']);env.update(case['extra'])
 cmd=[case['node'],str(R/'scripts/probe-composition.mjs'),*case['args']];started=time.time();r=subprocess.run(cmd,cwd=P,env=env,capture_output=True,text=True,timeout=80)
 row=dict(**case,command=cmd,envNames=sorted(env),started=started,exit=r.returncode,stdout=r.stdout,stderr=r.stderr);(E/f"orchestration-{case['name']}.json").write_text(json.dumps(row,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');return row
with ThreadPoolExecutor(max_workers=2) as executor:
 futures=[executor.submit(run,c) for c in cases]
 for future in as_completed(futures):
  row=future.result();out.append(row);print(row['name'],'orchestrator exit',row['exit'],flush=True)
(E/'orchestration-matrix.json').write_text(json.dumps(dict(concurrency=2,cases=out,meaning='outer orchestrator exit is not child application acceptance; inspect trace-lifecycle actual exit/stderr/resource fields'),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
