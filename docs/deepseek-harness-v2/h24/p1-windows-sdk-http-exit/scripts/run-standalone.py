from pathlib import Path
import subprocess,json,os,socket
R=Path(__file__).resolve().parents[1];E=R/'evidence';nodes=['D:/Program Files/nodejs/node.exe',json.loads((E/'official-runtime.json').read_text())['path']];rows=[]
for node in nodes:
 for repeat in range(3):
  env={k:os.environ[k] for k in ['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'] if k in os.environ};cmd=[node,str(R/'minimal/native-repro.mjs')];r=subprocess.run(cmd,env=env,capture_output=True,text=True,timeout=10);record=next(json.loads(s) for s in r.stdout.splitlines() if s.startswith('{'))
  with socket.socket() as verify:verify.bind(('127.0.0.1',record['port']))
  rows.append(dict(command=cmd,envNames=sorted(env),repeat=repeat+1,exit=r.returncode,stdout=r.stdout,stderr=r.stderr,record=record,portRebound=True,assertion='UV_HANDLE_CLOSING' in r.stderr))
(E/'standalone-native.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print([(r['record']['node'],r['exit'],r['assertion']) for r in rows])
